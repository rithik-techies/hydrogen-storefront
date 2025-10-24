import React from 'react';

// Mock Money component for demonstration
const Money = ({ data }) => {
  if (!data) return null;
  return (
    <span>
      {data.currencyCode === 'USD' ? '$' : ''}
      {parseFloat(data.amount).toFixed(2)}
    </span>
  );
};

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 *   availableForSale?: boolean;
 * }}
 */
export function ProductPrice({price, compareAtPrice, availableForSale = true}) {
  const isOnSale =
    compareAtPrice &&
    price &&
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount);

  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-5">
      {/* Price Container */}
      <div
        className={`inline-flex items-center gap-2 sm:gap-3 sm:px-4 sm:py-2 border-2 rounded-lg py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold
        ${
          !availableForSale
            ? 'border-gray-400'
            : isOnSale
            ? 'border-green-500'
            : 'border-green-500'
        }`}
      >
        {/* Show Sold Out */}
        {!availableForSale ? (
          <span className="text-sm sm:text-base font-semibold uppercase text-gray-500">
            Sold Out
          </span>
        ) : (
          <>
            {/* Current Price */}
            {price && (
              <span className="text-green-500 !leading-none">
                <Money data={price} />
              </span>
            )}
            
            {/* Compare At Price (strikethrough) */}
            {isOnSale && compareAtPrice && (
              <span className="text-sm sm:text-base font-semibold text-gray-400 line-through">
                <Money data={compareAtPrice} />
              </span>
            )}
          </>
        )}
      </div>
      {isOnSale && compareAtPrice && (
      <div class="h-7 border-l border-slate-300 dark:border-slate-700 opacity-0 sm:opacity-100"></div>
      )}
      {/* Sale Badge */}
      {isOnSale && availableForSale && (
        <div className="nc-shadow-lg !rounded-full flex items-center justify-center  nc-Badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium text-xs forced-colors:outline bg-rose-400/15 text-rose-800 group-data-[hover]:bg-rose-400/25 dark:bg-rose-400/10 dark:text-rose-400 dark:group-data-[hover]:bg-rose-400/20">
         <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.9889 14.6604L2.46891 13.1404C1.84891 12.5204 1.84891 11.5004 2.46891 10.8804L3.9889 9.36039C4.2489 9.10039 4.4589 8.59038 4.4589 8.23038V6.08036C4.4589 5.20036 5.1789 4.48038 6.0589 4.48038H8.2089C8.5689 4.48038 9.0789 4.27041 9.3389 4.01041L10.8589 2.49039C11.4789 1.87039 12.4989 1.87039 13.1189 2.49039L14.6389 4.01041C14.8989 4.27041 15.4089 4.48038 15.7689 4.48038H17.9189C18.7989 4.48038 19.5189 5.20036 19.5189 6.08036V8.23038C19.5189 8.59038 19.7289 9.10039 19.9889 9.36039L21.5089 10.8804C22.1289 11.5004 22.1289 12.5204 21.5089 13.1404L19.9889 14.6604C19.7289 14.9204 19.5189 15.4304 19.5189 15.7904V17.9403C19.5189 18.8203 18.7989 19.5404 17.9189 19.5404H15.7689C15.4089 19.5404 14.8989 19.7504 14.6389 20.0104L13.1189 21.5304C12.4989 22.1504 11.4789 22.1504 10.8589 21.5304L9.3389 20.0104C9.0789 19.7504 8.5689 19.5404 8.2089 19.5404H6.0589C5.1789 19.5404 4.4589 18.8203 4.4589 17.9403V15.7904C4.4589 15.4204 4.2489 14.9104 3.9889 14.6604Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 15L15 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M14.4945 14.5H14.5035" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.49451 9.5H9.50349" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          <span className="leading-none">
            Sale
          </span>
        </div>
      )}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */

// Demo Component
export default function Demo() {

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          Product Price Component Examples
        </h1>

        {/* On Sale */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">On Sale</h2>
          <ProductPrice 
            price={mockPrice}
            compareAtPrice={mockComparePrice}
            availableForSale={true}
          />
        </div>

        {/* Regular Price */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Regular Price</h2>
          <ProductPrice 
            price={mockPrice}
            compareAtPrice={null}
            availableForSale={true}
          />
        </div>

        {/* Sold Out */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Sold Out</h2>
          <ProductPrice 
            price={mockPrice}
            compareAtPrice={mockComparePrice}
            availableForSale={false}
          />
        </div>
      </div>
    </div>
  );
}