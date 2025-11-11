import {useLoaderData, Link} from 'react-router';

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  const data = await context.storefront.query(POLICIES_QUERY);
  const policies = Object.values(data.shop || {});

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  /** @type {LoaderReturnData} */
  const {policies} = useLoaderData();

  return (
    <div className="policies container py-16 lg:pb-28 lg:pt-20">
    <div className="max-w-screen-sm ">
      <h1 className="block text-2xl !m-0 sm:text-3xl lg:text-4xl font-semibold capitalize">Policies</h1>
        <div className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-400 mt-3 lg:mt-5">
          <a className="hover:text-slate-900 hover:underline" data-discover="true" href="/">Home</a>
          <span className="text-xs mx-1 sm:mx-1.5">/</span>
          <span className="underline">Policies</span>
        </div>
      </div>
      <div className='grid gap-7 mt-12 lg:mt-16'>
        {policies.map((policy) => {
          if (!policy) return null;
          return (
            <fieldset className='!p-0 !font-normal !text-2xl items-center !flex-row' key={policy.id}>
              <Link to={`/policies/${policy.handle}`}>{policy.title}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="inline-block w-5 h-5 ml-2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path></svg>
              </Link>
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
