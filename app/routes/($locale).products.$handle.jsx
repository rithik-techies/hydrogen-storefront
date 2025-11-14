import { Link, useLoaderData } from 'react-router';
import React, { useState } from 'react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import { ProductPrice } from '~/components/ProductPrice';
import { ProductImage } from '~/components/ProductImage';
import {
  Heart,
  RotateCcw,
  XCircle,
  DollarSign,
  ArrowUpRight,
  Truck,
} from 'lucide-react';
import { ProductForm } from '~/components/ProductForm';
import { redirectIfHandleIsLocalized } from '~/lib/redirect';
import Banner from '~/components/Banner';
import banner_img from '../assets/banner_img.webp';
import FeaturedCollection from '~/components/FeaturedCollection';

/* ---------------- META ---------------- */
export const meta = ({ data }) => {
  return [
    { title: `Hydrogen | ${data?.product.title ?? ''}` },
    {
      rel: 'canonical',
      to: `/products/${data?.product.handle}`,
    },
  ];
};

/* ---------------- LOADER ---------------- */
export async function loader({ context, params, request }) {
  const { handle } = params;
  const { storefront } = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{ product }] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
        // ✅ FIX: Ensure localized pricing (INR, etc.)
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, { status: 404 });
  }

  // redirect if localized handle mismatch
  redirectIfHandleIsLocalized(request, { handle, data: product });

  return { product };
}

/* ---------------- POLICIES COMPONENT ---------------- */
function Policies() {
  const policies = [
    {
      id: 'shipping',
      title: 'Shipping Policy',
      description: 'Read our shipping policy to learn more...',
      icon: Truck,
      link: '/policies/shipping-policy',
      bgColor: 'bg-pink-50',
      iconColor: 'text-gray-800',
    },
    {
      id: 'terms',
      title: 'Terms of Services',
      description: 'Read our Terms of Services to learn more...',
      icon: RotateCcw,
      link: '/policies/terms-of-service',
      bgColor: 'bg-blue-50',
      iconColor: 'text-gray-800',
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      description: 'Read our Privacy Policy to learn more...',
      icon: XCircle,
      link: '/policies/privacy-policy',
      bgColor: 'bg-green-50',
      iconColor: 'text-gray-800',
    },
    {
      id: 'refunds',
      title: 'Refund Policy',
      description: 'Read our Refund Policy to learn more...',
      icon: DollarSign,
      link: '/policies/refund-policy',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-gray-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
      {policies.map((policy) => {
        const IconComponent = policy.icon;
        return (
          <Link
            key={policy.id}
            to={policy.link}
            className={`${policy.bgColor} relative flex flex-col p-5 rounded-2xl group`}
          >
            <IconComponent className={`${policy.iconColor}`} strokeWidth={1.5} />
            <div className="space-y-2 mt-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {policy.title}
              </h3>
              <p className="text-slate-500 mt-1 text-sm line-clamp-1">
                {policy.description}
              </p>
            </div>
            <div className="absolute top-5 right-5 group-hover:scale-110 transition-all">
              <ArrowUpRight className="w-5 h-5" strokeWidth={2} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ---------------- PRODUCT COMPONENT ---------------- */
export default function Product() {
  const { product } = useLoaderData();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const relatedProducts = product?.metafield?.references?.nodes || [];
  const relatedCollection = {
    title: 'Customer also purchased',
    products: {
      nodes: relatedProducts,
    },
  };

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product)
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const { title, descriptionHtml } = product;
  const collectionName =
    product.collections?.nodes?.map((c) => c.title).join(', ') || 'No Collection';
  const collectionHandle =
    product.collections?.nodes?.map((c) => c.handle).join(', ') || 'no-handle';

  const handleClick = () => alert('Button clicked!');

  return (
    <>
      <div className="product-page mt-5 container lg:mt-10 pb-20 lg:pb-28 space-y-12 sm:space-y-16">
        <div className="lg:flex">
          <div className="relative bg-gray-100 rounded-2xl lg:w-[55%] overflow-hidden aspect-square">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="absolute top-6 right-6 z-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
            >
              <Heart
                className={`w-6 h-6 ${
                  isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </button>
            <div className="w-full h-full flex items-center justify-center p-8">
              <ProductImage image={selectedVariant?.image} />
            </div>
          </div>

          <div className="product-main lg:w-[45%] pt-10 lg:pt-0 lg:pl-7 xl:pl-9 2xl:pl-10">
            <div>
              <div className="flex items-center text-sm">
                <Link
                  className="font-medium text-gray-500 hover:text-gray-900"
                  to="/"
                >
                  Home
                </Link>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="ml-2 h-5 w-5 flex-shrink-0 text-gray-300"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.256 3.042a.75.75 0 0 1 .449.962l-6 16.5a.75.75 0 1 1-1.41-.513l6-16.5a.75.75 0 0 1 .961-.449Z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <div className="flex capitalize items-center text-sm">
                  <Link
                    className="font-medium text-gray-500 hover:text-gray-900"
                    to={`/collections/${collectionHandle}`}
                  >
                    {collectionName}
                  </Link>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl my-5 font-semibold">
                {title}
              </h1>
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
            </div>

            <br />
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />
            <br />
            <Policies />
            <Analytics.ProductView
              data={{
                products: [
                  {
                    id: product.id,
                    title: product.title,
                    price: selectedVariant?.price.amount || '0',
                    vendor: product.vendor,
                    variantId: selectedVariant?.id || '',
                    variantTitle: selectedVariant?.title || '',
                    quantity: 1,
                  },
                ],
              }}
            />
          </div>
        </div>

        {descriptionHtml && (
          <div className="mt-12 sm:mt-16">
            <div>
              <h2 className="text-2xl font-semibold">Product Details</h2>
            </div>
            <div
              className="prose prose-sm sm:prose max-w-4xl mt-7"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
        )}
      </div>

      {relatedCollection?.products?.nodes?.length > 0 && (
        <FeaturedCollection collection={relatedCollection} />
      )}

      <Banner
        heading="Special offer in kids products"
        description="Fashion is a form of self-expression and autonomy at a particular period and place."
        buttonText="Discover more"
        imageUrl={banner_img}
        imageAlt="Kid with skateboard"
        onButtonClick={handleClick}
        imagePosition="left"
        background_color="yellow"
      />
    </>
  );
}

/* ---------------- GRAPHQL FRAGMENTS ---------------- */
const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
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
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    collections(first: 1) {
      nodes {
        id
        title
        handle
      }
    }
    metafield(namespace: "shopify--discovery--product_recommendation", key: "related_products") {
      references(first: 10) {
        nodes {
          ... on Product {
            id
            title
            handle
            featuredImage {
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
            }
          }
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
