import {Await, useLoaderData, Link} from 'react-router';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';

export const meta = () => {
  return [{title: `Hydrogen | newPage`}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollections: collections.nodes[0],
  };
}


export default function Newpage() {
    const data = useLoaderData();
    return (
     <div className="home">
      <FeaturedCollections collection={data.featuredCollections} />
      </div>
  );
}
/**
 * @param {{
 *   collection: FeaturedCollectionsFragment;
 * }}
 */
function FeaturedCollections({ collection }) {
  if (!collection) return null;

  const image = collection?.image;
  const products = collection?.products?.nodes || [];

  return (
    <div className="min-h-screen bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Hero Section with Collection */}
    <div className="mb-12">
      <Link 
        to={`/collections/${collection.handle}`}
        className="group block"
      >
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
          {image && (
            <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
              <Image 
                data={image} 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Collection Title Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-700 !mb-4">
                    {collection.title}
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {collection.description}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Fallback if no image */}
          {!image && (
            <div className="h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                  {collection.title}
                </h1>
                <p className="text-gray-600 text-lg">
                  Explore our collection
                </p>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>

    {/* Products Section */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Products
        </h2>
        <div className="hidden sm:flex items-center text-sm text-gray-500">
          {products.length} {products.length === 1 ? 'item' : 'items'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const productImage = product?.images?.nodes?.[0];
          const variant = product?.variants?.nodes?.[0];

          return (
            <Link 
              key={product.id} 
              to={`/products/${product.handle}`}
              className="group block"
            >
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
                {/* Product Image */}
                {productImage && (
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Image 
                      data={productImage} 
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <div className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium text-sm shadow-lg">
                          View Product
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Fallback for no image */}
                {!productImage && (
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                  </div>
                )}

                {/* Product Info */}
                <div className="p-4 sm:p-5">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-red-400 text-sm sm:text-base line-clamp-2 group-hover:text-red-700 transition-colors leading-tight">
                      {product.title}
                    </h3>
                    
                    {variant?.price && (
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-lg text-blue-600">
                          {variant.price.currencyCode} {variant.price.amount}
                        </p>
                        
                        {/* Optional: Add sale badge or rating */}
                        <div className="text-xs text-gray-500">
                          {product?.vendor}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-400 rounded"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">This collection doesn't have any products yet.</p>
        </div>
      )}
    </div>
  </div>
</div>
  );
}




const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollections on Collection {
    id
    title
    description
    handle
    image {
      id
      url
      altText
      width
      height
    }
    products(first:4) {
      nodes {
        id
        title
        vendor
        handle
        description
        images(first: 1) {
          nodes {
            url
          }
        }
        variants(first: 1) {
          nodes {
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }

  query FeaturedCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollections
      }
    }
  }
`;




/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionsFragment} FeaturedCollectionsFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
