import {Link, useNavigate} from 'react-router';
import {useState} from 'react';
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

  return (
    <div className="product-form">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        return (
          <div className="product-options" key={option.name}>
            <h5 className='text-sm !m-0 font-medium'>{option.name}</h5>
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
                      className="product-options-item relative flex items-center justify-center rounded-md border py-3 px-5 sm:px-3 text-sm font-medium uppercase sm:flex-1 cursor-pointer focus:outline-none border-gray-200  cursor-pointer bg-slate-900 border-slate-900 text-slate-100"
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      style={{
                        border: selected
                          ? ''
                          : '1px solid transparent',
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
                      className={`${
                        exists && !selected ? ' w-8 h-8 md:w-9 md:h-9 rounded-full link' : ' relative w-8 h-8 md:w-9 md:h-9 rounded-full ring ring-offset-1 ring-blue-500/60'
                      }`}
                      key={option.name + name}
                      style={{
                        border: selected
                          ? '1px solid transparent'
                          : '',
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

      {/* Quantity and Add to Cart */}
      <div className="flex gap-2 sm:gap-3.5 items-stretch">
        <div className="flex items-center justify-center bg-slate-100/70 dark:bg-slate-800/70 p-2 sm:p-3 rounded-full">
        <div className='flex items-center justify-between gap-5'>
          <div className='flex items-center justify-between w-[6.5rem] sm:w-28'>
          <button
            onClick={() => handleQuantityChange(-1)}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900 focus:outline-none hover:border-neutral-700 dark:hover:border-neutral-400 disabled:hover:border-neutral-400 dark:disabled:hover:border-neutral-500 disabled:opacity-50 disabled:cursor-default"
            aria-label="Decrease quantity"
            disabled={quantity === 1}
          >
            <Minus className="w-5 h-5 text-gray-600" />
          </button>

          <span className="px-6 text-lg font-medium text-gray-900">
            {quantity}
          </span>

          <button
            onClick={() => handleQuantityChange(1)}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900 focus:outline-none hover:border-neutral-700 dark:hover:border-neutral-400 disabled:hover:border-neutral-400 dark:disabled:hover:border-neutral-500 disabled:opacity-50 disabled:cursor-default"
            aria-label="Increase quantity"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        </div>
        </div>

        {/* ✅ Correct AddToCartButton */}
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: quantity, 
                    selectedVariant,
                  },
                ]
              : []
          }
          onClick={() => {
            if (!selectedVariant) return;
            open('cart');
            setQuantity(1); // ✅ reset quantity after adding
          }}
        >
          {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>
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
