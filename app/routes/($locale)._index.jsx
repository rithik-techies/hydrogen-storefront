import {Await, useLoaderData, Link} from 'react-router';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import Banner from '~/components/Banner';
import HowToUse from '~/components/HowToUse'
import CollectionSlider from '~/components/CollectionSlider'
import BenefitGridComponent from '~/components/GridComponent';


/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

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
async function loadCriticalData({ context, request }) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  const [
    // { collections: featuredCollections },
    // { collections: featuredCollections2 },
    { collections }
  ] = await Promise.all([
    // context.storefront.query(FEATURED_COLLECTION_QUERY),
    // context.storefront.query(FEATURED_COLLECTION_QUERY_2),
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: {
        first: 5,
        ...paginationVariables,
      },
    }),
  ]);

  return {
    // featuredCollection: featuredCollections.nodes[0],
    // featuredCollection2: featuredCollections2.nodes[0],
    collections,
  };
}



/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const {collections} = useLoaderData();
  return (
    <div className="home">
      <Banner/>
      {/* <FeaturedCollection collection={data.featuredCollection} />
      <FeaturedCollection2 collection={data.featuredCollection2} />
      <RecommendedProducts products={data.recommendedProducts} /> */}
      <CollectionSlider collections={collections.nodes}/>
      <HowToUse />
      <BenefitGridComponent/>
    </div>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
  if (!collection) return null;
  // const image = collection?.image;
  return (
    <>
    <Link
      className="featured-collection !mb-1"
      to={`/collections/${collection.handle}`}
    >
      {/* {image && ( */}
        <div className="grid grid-cols-2 gap-0.5">
          {/* <Image data={image} sizes="100vw" /> */}
          {/* <img src={image1} alt="Description" className="w-full h-auto" />
          <video src={myVideo} className="w-full h-auto" controls autoPlay={false} loop muted
/> */}
        </div>
      {/* )} */}
    </Link>
      </>
  );
}
function FeaturedCollection2({collection}) {
  if (!collection) return null;
  return (
    <>
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
        <div className="gap-0.5">
          {/* <img src={image1} alt="Description" className="w-full h-auto" /> */}
        </div>
    </Link>
      </>
  );
}



/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({products}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;
const FEATURED_COLLECTION_QUERY_2 = `#graphql
  fragment FeaturedCollection2 on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: TITLE, reverse: false) {
      nodes {
        ...FeaturedCollection2
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;
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
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
