import {Link, useNavigate} from 'react-router';
import {useState, useEffect} from 'react';
import {Plus, Minus} from 'lucide-react';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 * }}
 */
export function ProductForm({productOptions, selectedVariant}) {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const {open} = useAside();

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  // Optional: Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant?.id]);

  return (
    <div className="product-form">
      {/* ===== Product Options ===== */}
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        return (
          <div className="product-options" key={option.name}>
            <h5 className="text-sm !m-0 font-medium">{option.name}</h5>
            <div className="flex flex-wrap gap-3 mt-3">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                if (isDifferentProduct) {
                  return (
                    <Link
                      className="product-options-item relative flex items-center justify-center rounded-md border py-3 px-5 sm:px-3 text-sm font-medium uppercase sm:flex-1 cursor-pointer focus:outline-none border-gray-200 bg-slate-900 border-slate-900 text-slate-100"
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      style={{
                        border: selected ? '' : '1px solid transparent',
                        opacity: available ? 1 : 0.3,
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  return (
                    <button
                      type="button"
                      key={option.name + name}
                      className={`${
                        exists && !selected
                          ? 'w-8 h-8 md:w-9 md:h-9 rounded-full link'
                          : 'relative w-8 h-8 md:w-9 md:h-9 rounded-full ring-3 ring-offset-1 ring-blue-500/60'
                      }`}
                      style={{
                        border: selected ? '1px solid transparent' : '',
                        opacity: available ? 1 : 0.3,
                      }}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected) {
                          navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </button>
                  );
                }
              })}
            </div>
            <br />
          </div>
        );
      })}

      {/* ===== Quantity & Add to Cart ===== */}
      <div className="flex gap-2 sm:gap-3.5 items-stretch">
        {/* Quantity Selector */}
        <div className="flex items-center gap-3 bg-slate-100/70 dark:bg-slate-800/70 px-3 py-2 rounded-full">
          <button
            type="button"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity === 1}
            aria-label="Decrease quantity"
            className="w-8 h-8 rounded-full flex items-center justify-center border border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900 hover:border-neutral-700 disabled:opacity-50"
          >
            <Minus className="w-5 h-5 text-gray-600" />
          </button>

          <span className="text-lg font-medium text-gray-900 w-8 text-center">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => handleQuantityChange(1)}
            aria-label="Increase quantity"
            className="w-8 h-8 rounded-full flex items-center justify-center border border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900 hover:border-neutral-700"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>
          <div className='flex-1 *:h-full *:flex'>
        {/* Add to Cart Button (fixed quantity) */}
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          lines={[
            {
              merchandiseId: selectedVariant?.id,
              quantity:quantity, // ✅ live quantity from state
               selectedVariant,
            },
          ]}
          onClick={() => {
            if (!selectedVariant) return;
            console.log('Adding to cart with quantity:', quantity);
            open('cart');
          }}
          onSuccess={() => {
            setQuantity(1);
          }}
          className="relative h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 lg:py-3.5 lg:px-8  bg-slate-900 text-slate-50 shadow-xl hover:bg-slate-800 disabled:bg-opacity-90 w-full h-full flex items-center justify-center gap-3  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 dark:focus:ring-offset-0"
        >
          {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{
 *   swatch?: Maybe<ProductOptionValueSwatch> | undefined;
 *   name: string;
 * }}
 */
function ProductOptionSwatch({swatch, name}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="w-full h-full inset-0.5 rounded-full overflow-hidden z-0"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Maybe} Maybe */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').ProductOptionValueSwatch} ProductOptionValueSwatch */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
