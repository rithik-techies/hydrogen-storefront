import {useLoaderData, Link} from 'react-router';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import CollectionSlider from '~/components/CollectionSlider';

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
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 9,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {collections};
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

export default function Collections() {
  /** @type {LoaderReturnData} */
  const {collections} = useLoaderData();

  return (
    <>
      <div className="container collections-page">
        <div className="mx-auto py-12">
         <div className="mx-auto pt-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm font-medium gap-2 text-neutral-500 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"></path></svg>
          <span className="text-neutral-700 ">All collections</span>
        </div>

        {/* Page Title */}
        <h1 className="block text-2xl !m-0 sm:text-3xl lg:text-4xl font-semibold capitalize">
          All Collections
        </h1>

        {/* Breadcrumb Navigation */}
        <div className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-400 mt-3 lg:mt-5">
          <Link to="/" className="hover:text-slate-900 hover:underline">Home</Link>
          <span className='text-xs mx-1 sm:mx-1.5'>/</span>
          <span className=" underline ">All collections</span>
        </div>
      </div>
          
          <PaginatedResourceSection
            connection={collections}
            resourcesClassName="grid gap-4 md:gap-7 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          >
            {({node: collection, index}) => (
              <CollectionItem
                key={collection.id}
                collection={collection}
                index={index}
              />
            )}
          </PaginatedResourceSection>
        </div>
      </div>
      {/* <CollectionSlider collections={collections.nodes} /> */}
    </>
  );
}

/**
 * @param {{
 *   collection: CollectionFragment;
 *   index: number;
 * }}
 */
function CollectionItem({collection, index}) {
  // Generate pattern and colors based on index
  const patterns = ['lines', 'zigzag', 'circles'];
  const patternColors = ['#6B9BD1', '#E5A5A5', '#A8D5BA', '#F59E0B', '#8B5CF6'];
  
  const patternType = patterns[index % patterns.length];
  const patternColor = patternColors[index % patternColors.length];

  const renderPattern = () => {
    if (patternType === 'lines') {
      return (
        <div className="absolute bottom-8 right-8 flex flex-col gap-2 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full"
              style={{
                width: `${60 + (i * 15)}px`,
                backgroundColor: patternColor,
                opacity: 0.6
              }}
            />
          ))}
        </div>
      );
    } else if (patternType === 'zigzag') {
      return (
        <svg className="absolute bottom-8 right-8 w-32 h-32 pointer-events-none" viewBox="0 0 120 120">
          {[0, 1, 2, 3].map((i) => (
            <polyline
              key={i}
              points="0,10 20,30 40,10 60,30 80,10 100,30"
              fill="none"
              stroke={patternColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
              transform={`translate(${i * 5}, ${i * 20})`}
            />
          ))}
        </svg>
      );
    } else if (patternType === 'circles') {
      return (
        <div className="absolute bottom-8 right-8 pointer-events-none">
          <svg className="w-32 h-32" viewBox="0 0 120 120">
            {[...Array(9)].map((_, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              return (
                <circle
                  key={i}
                  cx={20 + col * 30}
                  cy={20 + row * 30}
                  r="12"
                  fill="none"
                  stroke={patternColor}
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />
              );
            })}
          </svg>
        </div>
      );
    }
  };

  // Get product count from collection data (if available)
  const productCount = collection.products?.nodes?.length || collection.productsCount || 0;

  return (
    <Link
      className="collection-card block relative rounded-3xl bg-neutral-50 p-8 h-96 overflow-hidden transition-transform group"
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      {/* Product Image */}
      <div className="flex justify-between items-center">
        {collection?.image && (
          <div className="w-20 h-20 relative rounded-full overflow-hidden bg-slate-100 z-0">
            <Image
              alt={collection.image.altText || collection.title}
              data={collection.image}
              loading={index < 3 ? 'eager' : undefined}
              sizes="(min-width: 45em) 128px, 128px"
              className="w-full rounded-full h-full object-contain drop-shadow-xl"
            />
          </div>
        )}
      </div>

      {/* Pattern Decoration */}
      {renderPattern()}

      {/* Content */}
      <div className="absolute bottom-8 left-8 group right-8">
        {productCount > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"></path></svg>
            <span className="text-sm text-gray-700 font-medium">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </span>
          </div>
        )}
        
        <h5 className="text-3xl font-bold text-black !mb-[5rem] leading-tight">
          {collection.title}
        </h5>

        <div className="flex group-hover:text-blue-600 items-center  text-black font-semibold group">
          <span>See Collection</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" class="w-4 h-4 ms-2.5"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"></path></svg>
        </div>
      </div>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
    products(first: 250) {
      nodes {
        id
      }
    }
  }

  query CollectionsPageQuery(
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