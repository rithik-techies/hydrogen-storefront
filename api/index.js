// Vercel serverless function entry point for Hydrogen
import {storefrontRedirect} from '@shopify/hydrogen';
import {createRequestHandler} from '@shopify/remix-oxygen';
import {createAppLoadContext} from '../app/lib/context-vercel.js';

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
    
    // Handle request body
    let body = null;
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
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

    // Import the server build - path may vary based on build output
    // Try to import from the dist directory
    let build;
    try {
      // For Vercel, the build should be in the dist directory
      build = await import('../dist/server/index.js');
    } catch (e) {
      // Fallback: try virtual import (may not work in Vercel)
      try {
        build = await import('virtual:react-router/server-build');
      } catch (e2) {
        console.error('Failed to import server build:', e2);
        throw new Error('Could not load server build. Make sure the build completed successfully.');
      }
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
    res.status(500).json({error: 'An unexpected error occurred'});
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

