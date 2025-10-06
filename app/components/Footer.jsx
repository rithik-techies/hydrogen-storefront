import { Suspense, useEffect, useState } from 'react';
import { Await, NavLink } from 'react-router';
import { ChevronRight } from 'lucide-react';
import {useLoaderData, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */

async function loadCriticalData({context, request}) {
const { collections } = await context.storefront.query(COLLECTIONS_QUERY, {
    variables: {
      first: 6,
    },
  });

  return { collections };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}


export function Footer({footer: footerPromise, header, publicStoreDomain}) {
   const {collections} = useLoaderData();
  return (
   <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] px-6 md:px-10 py-10 text-white overflow-hidden flex flex-col lg:flex-row justify-between gap-10">
            <div className="flex-1 max-w-3xl z-10">
              <NewsletterSection />
            </div>
            <div className="flex-1 collections flex flex-col gap-3">
              <p className="font-semibold text-lg">Collections</p>
             <div className="flex flex-col gap-2">
                  <div className="recommended-collections-grid">
                    {collections?.nodes?.map((collection) => (
                      <CollectionItem key={collection.id} collection={collection} />
                    ))}
                  </div>
                </div>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function CollectionItem({ collection ,index}) {
  return (
    <Link
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
      className="text-white hover:text-gray-400 transition-colors"
    >
      {collection.title}
    </Link>
  );
}

function NewsletterSection() {
  const [input, setInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSubmit = () => {
    if (input.trim()) {
      console.log('Newsletter signup:', input);
      setIsSubmitted(true);
      setTimeout(() => {
        setInput('');
        setIsSubmitted(false);
      }, 3000);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  return (
    <div className="max-w-3xl">
      <h2 className="!text-4xl !sm:text-2xl md:text-5xl lg:text-5xl xl:text-5xl  !font-light !mb-15 leading-tight text-white">
        Hey, Hola, Bonjour. Become a July local.<br/> Sign up and receive updates, including collection launches, early access to collections and more.
      </h2>
      <div className="transition-all duration-300">
        <div className="w-4/5 flex items-center !rounded-full footer-container gap-3">
         <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="your@email.com or +11234567890"
              className="w-[90%] footer-input text-white !text-xl !px-7 !py-5 !focus:border-0 !focus:outline-none !focus:ring-0 !border-0"
            />
            <button><ChevronRight className='w-10 h-12 pr-5 cursor-pointer'/></button>
        </div>
      </div>
      
      <div className="mt-6 flex items-start gap-3">
        <p className="text-xs text-[rgba(255,255,255,0.5)] leading-relaxed">
          You can unsubscribe at any time. Read about how we process your personal data in our{' '}
          <a href="/policies/privacy-policy" className="!underline !text-white hover:text-gray-400 transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('storefrontapi.generated').CollectionFragment} CollectionFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */