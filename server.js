// Virtual entry point for the app
import {storefrontRedirect} from '@shopify/hydrogen';
import {createRequestHandler} from '@shopify/remix-oxygen';
import {createAppLoadContext} from '~/lib/context';

export default {
  async fetch(request, env, executionContext) {
    try {
      const appLoadContext = await createAppLoadContext(request, env, executionContext);

      // ✅ Use dynamic import only in production
      // Prevent Vite from trying to resolve ./build/server/index.js during build
      let build;
      if (process.env.NODE_ENV === 'production') {
        const buildPath = './dist/server/index.js';
        build = (await import(/* @vite-ignore */ buildPath)).default;
      } else {
        build = await import('virtual:react-router/server-build');
      }

      const handleRequest = createRequestHandler({
        build,
        mode: process.env.NODE_ENV,
        getLoadContext: () => appLoadContext,
      });

      const response = await handleRequest(request);

      if (appLoadContext.session?.isPending) {
        response.headers.set('Set-Cookie', await appLoadContext.session.commit());
      }

      if (response.status === 404) {
        return storefrontRedirect({
          request,
          response,
          storefront: appLoadContext.storefront,
        });
      }

      return response;
    } catch (error) {
      console.error(error);
      return new Response('An unexpected error occurred', {status: 500});
    }
  },
};


// import { createRequestHandler } from '@shopify/remix-oxygen';
// import * as build from './build/server/index.js';

// /**
//  * Node entry point for Hydrogen (Remix) to run on Vercel.
//  */
// export default async function handler(request, response) {
//   try {
//     // Convert the Vercel Node request into a standard Fetch Request
//     const remixHandler = createRequestHandler({
//       build,
//       mode: process.env.NODE_ENV,
//     });

//     const req = new Request(
//       request.url || `https://${request.headers.host}${request.originalUrl}`,
//       {
//         method: request.method,
//         headers: request.headers,
//         body:
//           request.method !== 'GET' && request.method !== 'HEAD'
//             ? request
//             : undefined,
//       }
//     );

//     const res = await remixHandler(req);

//     // Write Remix's Response back to Node response
//     const headers = Object.fromEntries(res.headers.entries());
//     response.writeHead(res.status, headers);
//     const body = await res.text();
//     response.end(body);
//   } catch (err) {
//     console.error('💥 Error in Vercel Hydrogen handler:', err);
//     response.status(500).send('Internal Server Error');
//   }
// }




// // Virtual entry point for the app
// import {storefrontRedirect} from '@shopify/hydrogen';
// import {createRequestHandler} from '@shopify/remix-oxygen';
// import {createAppLoadContext} from '~/lib/context';
// import * as build from './build/server/index.js';

// /**
//  * Export a fetch handler in module format.
//  */
// export default {
//   /**
//    * @param {Request} request
//    * @param {Env} env
//    * @param {ExecutionContext} executionContext
//    * @return {Promise<Response>}
//    */
//   async fetch(request, env, executionContext) {
//     try {
//       const appLoadContext = await createAppLoadContext(
//         request,
//         env,
//         executionContext,
//       );

//       /**
//        * Create a Remix request handler and pass
//        * Hydrogen's Storefront client to the loader context.
//        */
//       const handleRequest = createRequestHandler({
//         // eslint-disable-next-line import/no-unresolved
//         build: await import('virtual:react-router/server-build'),
//         mode: process.env.NODE_ENV,
//         getLoadContext: () => appLoadContext,
//       });

//       const response = await handleRequest(request);

//       if (appLoadContext.session.isPending) {
//         response.headers.set(
//           'Set-Cookie',
//           await appLoadContext.session.commit(),
//         );
//       }

//       if (response.status === 404) {
//         /**
//          * Check for redirects only when there's a 404 from the app.
//          * If the redirect doesn't exist, then `storefrontRedirect`
//          * will pass through the 404 response.
//          */
//         return storefrontRedirect({
//           request,
//           response,
//           storefront: appLoadContext.storefront,
//         });
//       }

//       return response;
//     } catch (error) {
//       console.error(error);
//       return new Response('An unexpected error occurred', {status: 500});
//     }
//   },
// };
