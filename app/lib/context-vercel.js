import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import {getLocaleFromRequest} from '~/lib/i18n';

/**
 * Vercel-compatible context creation
 * Adapts Hydrogen's Cloudflare Workers context for Vercel's Node.js runtime
 * @param {Request} request
 * @param {Env} env
 * @param {ExecutionContext} executionContext
 */
export async function createAppLoadContext(request, env, executionContext) {
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  
  // For Vercel, we create a mock cache that implements the Cache API interface
  // but doesn't actually cache (or you could implement a simple in-memory cache)
  const cache = createVercelCache();
  
  const session = await AppSession.init(request, [env.SESSION_SECRET]);

  const hydrogenContext = createHydrogenContext({
    env,
    request,
    cache,
    waitUntil,
    session,
    i18n: getLocaleFromRequest(request),
    cart: {
      queryFragment: CART_QUERY_FRAGMENT,
    },
  });

  return {
    ...hydrogenContext,
  };
}

/**
 * Create a Vercel-compatible cache that implements the Cache API interface
 * This is a simplified version - for production, consider using a proper cache
 * like Redis or Vercel's Edge Config
 */
function createVercelCache() {
  return {
    async match(request) {
      // In Vercel, you might want to implement actual caching here
      // For now, return undefined (cache miss)
      return undefined;
    },
    async put(request, response) {
      // Cache implementation - could use Vercel's Edge Config or Redis
      // For now, this is a no-op
    },
    async delete(request) {
      // Cache deletion
      return false;
    },
    async keys() {
      return [];
    },
  };
}

