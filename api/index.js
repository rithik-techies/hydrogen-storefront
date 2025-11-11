// Vercel serverless function entry point for Hydrogen
import {storefrontRedirect} from '@shopify/hydrogen';
import {createRequestHandler} from '@shopify/remix-oxygen';
import {createAppLoadContext} from '../../app/lib/context-vercel.js';

/**
 * Vercel serverless function handler
 * Adapts Hydrogen's Cloudflare Workers code for Vercel's Node.js runtime
 */
export default async function handler(req, res) {
  try {
    // Convert Vercel's req/res to Web API Request/Response
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const url = new URL(req.url, `${protocol}://${host}`);
    
    // Handle request body - Vercel already parses JSON, but we need raw body for some cases
    let body = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // For Vercel, req.body is already parsed if Content-Type is JSON
      // But we need to handle raw body for form submissions, etc.
      if (req.body) {
        if (typeof req.body === 'string') {
          body = req.body;
        } else if (Buffer.isBuffer(req.body)) {
          body = req.body;
        } else {
          // Already parsed JSON or object
          body = JSON.stringify(req.body);
        }
      }
    }
    
    const request = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers),
      body: body,
    });

    // Create a Vercel-compatible execution context
    const executionContext = {
      waitUntil: (promise) => {
        // In Vercel, we can't use waitUntil the same way as Cloudflare Workers
        // But we can still track promises for logging/monitoring
        promise.catch(console.error);
      },
    };

    // Create environment object from Vercel's process.env
    const env = {
      ...process.env,
      // Ensure required Hydrogen env vars are available
      SESSION_SECRET: process.env.SESSION_SECRET,
      PUBLIC_STORE_DOMAIN: process.env.PUBLIC_STORE_DOMAIN,
      PUBLIC_STOREFRONT_API_TOKEN: process.env.PUBLIC_STOREFRONT_API_TOKEN,
      PUBLIC_STOREFRONT_API_VERSION: process.env.PUBLIC_STOREFRONT_API_VERSION,
      PUBLIC_CHECKOUT_DOMAIN: process.env.PUBLIC_CHECKOUT_DOMAIN,
    };

    // Create app load context
    const appLoadContext = await createAppLoadContext(
      request,
      env,
      executionContext,
    );

    // Import the server build
    // React Router with Vite creates a server build that needs to be imported
    // The build is typically in .react-router/server-build or dist/.react-router/server-build
    let build;
    const possiblePaths = [
      '../../.react-router/server-build/index.js',
      '../../dist/.react-router/server-build/index.js',
      '../../.react-router/server-build.js',
      '../../dist/.react-router/server-build.js',
    ];
    
    let lastError;
    for (const path of possiblePaths) {
      try {
        build = await import(path);
        break;
      } catch (e) {
        lastError = e;
        continue;
      }
    }
    
    if (!build) {
      console.error('Failed to import server build. Tried paths:', possiblePaths);
      console.error('Last error:', lastError);
      throw new Error(
        'Could not load server build. Make sure the build completed successfully. ' +
        'Check Vercel build logs for React Router build output location.'
      );
    }
    
    // Create request handler
    const handleRequest = createRequestHandler({
      build,
      mode: process.env.NODE_ENV || 'production',
      getLoadContext: () => appLoadContext,
    });

    // Handle the request
    const response = await handleRequest(request);

    // Handle session commit
    if (appLoadContext.session.isPending) {
      const cookie = await appLoadContext.session.commit();
      response.headers.set('Set-Cookie', cookie);
    }

    // Handle 404 redirects
    if (response.status === 404) {
      const redirectResponse = await storefrontRedirect({
        request,
        response,
        storefront: appLoadContext.storefront,
      });
      
      // Convert Response to Vercel response
      return convertResponseToVercel(redirectResponse, res);
    }

    // Convert Web API Response to Vercel response
    return convertResponseToVercel(response, res);
  } catch (error) {
    console.error('Vercel handler error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      cause: error.cause,
    });
    
    // Return proper error response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'An unexpected error occurred',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}

/**
 * Convert Web API Response to Vercel's response format
 */
async function convertResponseToVercel(response, res) {
  // Set status
  res.status(response.status);

  // Set headers
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  // Handle body
  if (response.body) {
    const reader = response.body.getReader();
    const chunks = [];
    
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const buffer = Buffer.concat(chunks);
    res.send(buffer);
  } else {
    res.end();
  }
}

