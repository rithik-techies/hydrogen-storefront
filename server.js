import { createRequestHandler } from '@shopify/remix-oxygen';
import { storefrontRedirect } from '@shopify/hydrogen';
import { createAppLoadContext } from '~/lib/context';

// Instead of a virtual import, we import the actual build output:
import * as build from '@react-router/dev/server-build';

export default {
  async fetch(request, env, executionContext) {
    try {
      const appLoadContext = await createAppLoadContext(
        request,
        env,
        executionContext,
      );

      const handleRequest = createRequestHandler({
        build,
        mode: process.env.NODE_ENV,
        getLoadContext: () => appLoadContext,
      });

      const response = await handleRequest(request);

      if (appLoadContext.session?.isPending) {
        response.headers.set(
          'Set-Cookie',
          await appLoadContext.session.commit(),
        );
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
      return new Response('Server error', { status: 500 });
    }
  },
};
