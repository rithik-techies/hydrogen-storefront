import {Link} from 'react-router';
import {Image, Money, CartForm} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import { AddToCartButton } from './AddToCartButton';
import { ProductForm } from './ProductForm';
import { useState } from 'react';
import { Heart } from 'lucide-react';

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product?.handle);
  const image = product.featuredImage;
  const variants = product?.variants?.nodes || [];
  const [isWishlisted, setIsWishlisted] = useState(false);
  

  // Get the color option
  const colorOption = product?.options?.find(
    (opt) => opt.name.toLowerCase() === 'color'
  );

  // Get the first available variant for add to cart
  const firstVariant = variants[0];

  return (
    <div className="group">
      {/* Image Container with Add to Cart Overlay */}
      <div className="relative group">
         <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 text-neutral-700 dark:text-slate-200 nc-shadow-lg absolute top-3 end-3 z-2"
          >
            <Heart
              className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
        <Link
          key={product.id}
          prefetch="intent"
          to={variantUrl}
        >
        <Image
          alt={
            firstVariant?.image?.altText ||
            image?.altText ||
            product.title
          }
          aspectRatio="1/1"
          data={firstVariant?.image || image}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
          className="relative flex-shrink-0 bg-slate-50 border border-slate-50 dark:bg-slate-300 rounded-3xl overflow-hidden"
        />
        </Link>
        {/* Add to Cart Button - Shows on Hover */}
        {firstVariant && (
  <div className="absolute bottom-0 group-hover:bottom-4 cursor-pointer inset-x-1 flex justify-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 ">
    <AddToCartButton
    className="relative w-full h-auto gap-2 inline-flex items-center justify-center rounded-full transition-colors text-xs py-2 px-4  bg-slate-900 text-slate-50 shadow-xl hover:bg-slate-800 disabled:bg-opacity-90 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 dark:focus:ring-offset-0"
      disabled={!firstVariant || !firstVariant.availableForSale}
      onClick={() => open('cart')}
      lines={
        firstVariant
          ? [
              {
                merchandiseId: firstVariant.id,
                quantity: 1,
                firstVariant,
              },
            ]
          : []
      }
    >
      {firstVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
    </AddToCartButton>
  </div>
)}

      </div>

      {/* Swatches */}
      {colorOption && (
        <div className="flex gap-2 my-4 flex-wrap">
          {colorOption.optionValues.map((valueObj, i) => {
            const value = valueObj.name;

            // Find the variant that matches this color
            const matchingVariant = variants.find((v) =>
              v.selectedOptions.some(
                (opt) =>
                  opt.name.toLowerCase() === 'color' &&
                  opt.value.toLowerCase() === value.toLowerCase()
              )
            );

            if (!matchingVariant) return null;

            return (
              <Link
                key={i}
                to={`/products/${product.handle}`}
                title={value}
                className="w-4 h-4 rounded-full  overflow-hidden cursor-pointer"
                style={{
                  backgroundColor: valueObj.swatch?.color || 'transparent',
                }}
              >
              </Link>
            );
          })}
        </div>
      )}

      {/* Product title */}
      <Link to={variantUrl}>
        <h2 className="font-bold text-base !mb-0 !mt-3">{product.title}</h2>
      </Link>

      {firstVariant && firstVariant.selectedOptions.length > 0 && (
        <div className="text-sm mb-5 text-gray-600 mt-1">
          {firstVariant.selectedOptions.map((opt, i) => (
            <span key={i}>
              <span className="font-medium">{opt.value}</span>
              {i < firstVariant.selectedOptions.length - 1 && ', '}
            </span>
          ))}
        </div>
      )}

      {/* Price */}
      <div className="flex items-center justify-between text-sm font-medium mt-1">
        <div className="text-green-500 border-2 md:py-1.5 md:px-2.5 border-green-500 rounded-lg py-1 px-2 inline-block !leading-none">
          <Money data={product?.priceRange?.minVariantPrice} />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-500 text-xl">★</span>
          <span className="font-medium">4.0</span>
          <span className="text-black font-medium text-sm">(3 Reviews)</span>
        </div>
      </div>
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */