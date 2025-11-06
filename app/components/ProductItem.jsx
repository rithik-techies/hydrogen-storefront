import {Link, useNavigate} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from '~/components/Aside';
import {useState} from 'react';
import {Heart} from 'lucide-react';

export function ProductItem({product, loading}) {
  const navigate = useNavigate();
  const variantUrl = useVariantUrl(product?.handle);
  const variants = product?.variants?.nodes || [];
  const [isWishlisted, setIsWishlisted] = useState(false);
  const {open} = useAside();

  // ✅ Find first available variant (for correct default image)
  const firstVariant = variants.find(v => v.availableForSale) || variants[0];
  const defaultImage = firstVariant?.image || product.featuredImage;

  // ✅ Preview image (updates on hover over color swatch)
  const [previewImage, setPreviewImage] = useState(defaultImage);

  const colorOption = product?.options?.find(
    (opt) => opt.name.toLowerCase() === 'color'
  );

  return (
    <div className="group">
      <div className="relative group">
        {/* ❤️ Wishlist Button */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 text-neutral-700 dark:text-slate-200 nc-shadow-lg absolute top-3 end-3 z-5"
        >
          <Heart
            className={`w-6 h-6 transition-colors duration-200 ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>

        {/* 🖼️ Product Image */}
        <Link key={product.id} prefetch="intent" to={variantUrl}>
          <Image
            alt={previewImage?.altText || product.title}
            data={previewImage}
            loading={loading}
            aspectRatio="1/1"
            sizes="(min-width: 45em) 400px, 100vw"
            className="relative flex-shrink-0 bg-slate-50 border border-slate-50 dark:bg-slate-300 rounded-3xl overflow-hidden transition-all"
          />
        </Link>

        {/* 🛒 Add to Cart Button */}
        {firstVariant && (
          <div className="absolute bottom-0 group-hover:bottom-4 inset-x-1 flex justify-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <AddToCartButton
              className="relative w-full h-auto gap-2 inline-flex items-center justify-center rounded-full transition-colors text-xs py-2 px-4 bg-slate-900 text-slate-50 shadow-xl hover:bg-slate-800 disabled:bg-opacity-90 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 dark:focus:ring-offset-0"
              disabled={!firstVariant || !firstVariant.availableForSale}
              onClick={() => open('cart')}
              lines={
                firstVariant
                  ? [
                      {
                        merchandiseId: firstVariant.id,
                        quantity: 1,
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

      {/* 🎨 Color Swatches */}
      {colorOption && (
        <div className="flex gap-2 my-4 flex-wrap">
          {colorOption.optionValues.map((valueObj, i) => {
            const value = valueObj.name;

            // Find variant matching this color
            const matchingVariant = variants.find((v) =>
              v.selectedOptions.some(
                (opt) =>
                  opt.name.toLowerCase() === 'color' &&
                  opt.value.toLowerCase() === value.toLowerCase()
              )
            );

            if (!matchingVariant) return null;

            return (
              <button
                key={i}
                onMouseEnter={() =>
                  setPreviewImage(matchingVariant.image || product.featuredImage)
                }
                onMouseLeave={() => setPreviewImage(defaultImage)}
                onClick={() => navigate(`/products/${product.handle}`)}
                title={value}
                className="w-5 h-5 rounded-full overflow-hidden cursor-pointer border border-gray-300 transition-transform hover:scale-110"
                style={{
                  backgroundColor: valueObj.swatch?.color || 'transparent',
                }}
              />
            );
          })}
        </div>
      )}

      {/* 🏷️ Product Title */}
      <Link to={variantUrl}>
        <h2 className="font-bold text-base !mb-0 !mt-3 line-clamp-1">
          {product.title}
        </h2>
      </Link>

      {/* 🧾 Selected Options */}
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

      {/* 💰 Price + Rating */}
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
