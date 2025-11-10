import {useEffect, useState} from 'react';
import {useLoaderData, useFetcher, Link} from 'react-router';
import {ProductItem} from '~/components/ProductItem';

export const meta = () => [{title: `Hydrogen | Wishlist`}];

export async function loader({context, request}) {
  const url = new URL(request.url);
  const idsParam = url.searchParams.get('ids');
  const ids = idsParam ? JSON.parse(idsParam) : [];

  // 🧠 If no IDs provided from client or URL, just return empty list
  if (!ids.length) {
    return {wishlistProducts: []};
  }

  const deferredData = loadDeferredData();
  const criticalData = await loadCriticalData({context, ids});
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, ids}) {
  const {storefront} = context;

  const {data} = await storefront.query(PRODUCTS_QUERY, {
    variables: {ids},
  });

  return {wishlistProducts: data?.nodes?.filter(Boolean) || []};
}

function loadDeferredData() {
  return {};
}

/**
 * 🧩 The main component
 */
export default function Wishlist() {
  const {wishlistProducts: initialProducts} = useLoaderData();
  const fetcher = useFetcher();

  const [wishlistProducts, setWishlistProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(initialProducts.length === 0);

  // 🧠 Try loading from localStorage if server gave empty products
  useEffect(() => {
    if (initialProducts.length > 0) {
      setIsLoading(false);
      return;
    }

    const stored = localStorage.getItem('wishlist');
    const ids = stored ? JSON.parse(stored) : [];

    if (ids.length > 0) {
      fetcher.load(`/wishlist?ids=${encodeURIComponent(JSON.stringify(ids))}`);
    } else {
      setIsLoading(false);
    }

  }, []);

  // 🧩 When fetcher returns data, update UI
  useEffect(() => {
    if (fetcher.data?.wishlistProducts) {
      setWishlistProducts(fetcher.data.wishlistProducts);
      setIsLoading(false);
    }
  }, [fetcher.data]);

  // 🗑 Remove product from wishlist
  const removeFromWishlist = (productId) => {
    const updated = wishlistProducts.filter((p) => p.id !== productId);
    setWishlistProducts(updated);
    localStorage.setItem(
      'wishlist',
      JSON.stringify(updated.map((p) => p.id))
    );
  };

  return (
    <div className="wishlist-page">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto pt-8">
          <div className="flex items-center text-sm font-medium gap-2 text-neutral-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047
                8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21
                8.21 0 0 0 3 2.48Z"></path>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 18a3.75 3.75 0 0 0 .495-7.468
                5.99 5.99 0 0 0-1.925 3.547
                5.975 5.975 0 0 1-2.133-1.001A3.75
                3.75 0 0 0 12 18Z"></path>
            </svg>
            <span className="text-neutral-700">
              {wishlistProducts.length} saved
            </span>
          </div>

          <h1 className="block text-2xl sm:text-3xl !m-0 lg:text-4xl font-semibold capitalize">
            Wishlist
          </h1>

          <div className="block text-xs sm:text-sm font-medium text-slate-700 mt-3 lg:mt-5">
            <Link to="/" className="hover:text-slate-900 hover:underline">Home</Link>
            <span className='text-xs mx-1 sm:mx-1.5'>/</span>
            <span className="underline">Wishlist</span>
          </div>
        </div>

        <div className="border-t  lg:border-l border-slate-200 dark:border-slate-700 my-10 "></div>

        { wishlistProducts.length === 0 && (
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth="1.5" stroke="currentColor"
              className="inline-block h-12 w-12 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44
                l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25
                2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25
                2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"></path>
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No results found.</h3>
            <div className="mt-1 text-sm text-gray-500">You have not added any products to your wishlist yet.</div>
          </div>
        )}

        { wishlistProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {wishlistProducts.map((product) => (
              <ProductItem
                key={product.id}
                product={product}
                removeFromWishlist={removeFromWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const PRODUCTS_QUERY = `#graphql
  query WishlistProducts($ids: [ID!]!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        handle
        tags
        description
        featuredImage {
          id
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }  
        }
        options {
          name
          optionValues {
            name
            swatch {
              color
              image {
                previewImage {
                  url
                }
              }
            }
          }
        }
        variants(first: 10) {
          nodes {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            image {
              url
              altText
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;
