import {useLoaderData, Link} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import {data} from '@shopify/remix-oxygen';
import {CartMain} from '~/components/CartMain';
import { ProductPrice } from '~/components/ProductPrice';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: `Hydrogen | Cart`}];
};

/**
 * @type {HeadersFunction}
 */
export const headers = ({actionHeaders}) => actionHeaders;

/**
 * @param {ActionFunctionArgs}
 */
export async function action({request, context}) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = formDiscountCode ? [formDiscountCode] : [];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesUpdate: {
      const formGiftCardCode = inputs.giftCardCode;

      // User inputted gift card code
      const giftCardCodes = formGiftCardCode ? [formGiftCardCode] : [];

      // Combine gift card codes already applied on cart
      giftCardCodes.push(...inputs.giftCardCodes);

      result = await cart.updateGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  const {cart} = context;
  return await cart.get();
}

export default function Cart() {
  /** @type {LoaderReturnData} */
  const cart = useLoaderData();
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  return (
    <div className="min-h-screen bg-white py-6 sm:py-8 lg:py-12">
      <div className="container  py-10 lg:pb-28 lg:pt-20 ">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">Shopping Cart</h1>
          <div className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-400 mt-3 lg:mt-5">
            <Link to="/" className="hover:text-slate-900 hover:underline">Home</Link>
            <span className='text-xs mx-1 sm:mx-1.5'>/</span>
            <span className=" underline ">Shopping Cart
            </span>
          </div>
        </div>

        <hr className="border-gray-200 mb-8" />

        {/* Cart Content */}
        {cartHasItems ? (
          <div className="flex flex-col lg:flex-row">
            {/* Cart Items - Left Side */}
            <div className="w-full lg:w-[60%] xl:w-[55%] divide-y divide-slate-200 dark:divide-slate-700 grid">
              {cart?.lines?.nodes?.map((line) => (
                <CartItem key={line.id} line={line} />
              ))}
            </div>

            {/* Cart Summary - Right Side */}
            <CartSummary cart={cart} />
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <a 
              href="/collections/all" 
              className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Continue Shopping
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function CartItem({line}) {
  const {merchandise, quantity, id: lineId, isOptimistic} = line;
 const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));
  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Product Image */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-50 rounded-xl overflow-hidden">
            {merchandise.image && (
              <img
                src={merchandise.image.url}
                alt={merchandise.image.altText || merchandise.product.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="ml-3 sm:ml-6 flex flex-1 flex-col">
          <div className='flex items-center justify-between gap-5'>
            <div>
            <h3 className="text-base font-semibold !m-0">
              {merchandise.product.title}
            </h3>
            <div className="mt-2 sm:mt-2.5 text-sm text-slate-500 dark:text-slate-400 flex pe-3 gap-x-4 capitalize">
              {merchandise.title !== 'Default Title' && merchandise.title}
            </div>
           </div>

           <div className="flex items-center border rounded-lg">
              <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
                <button
                className='w-8 h-8 sm:w-10 cursor-pointer sm:h-10 transition text-primary/50 hover:text-primary disabled:text-primary/10'
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1 || !!isOptimistic}
                  name="decrease-quantity"
                  value={prevQuantity}
                >
                  <span>&#8722; </span>
                </button>
              </CartLineUpdateButton>
              &nbsp;
              <span className="px-2 text-center">
                {quantity}
              </span>
              <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
                <button
                className='w-8 h-8 cursor-pointer sm:w-10 sm:h-10 transition text-primary/50 hover:text-primary disabled:text-primary/10'
                  aria-label="Increase quantity"
                  name="increase-quantity"
                  value={nextQuantity}
                  disabled={!!isOptimistic}
                >
                  <span>&#43;</span>
                </button>
              </CartLineUpdateButton>
            </div>
            {/* Price */}
            <ProductPrice price={line?.cost?.totalAmount} />
          </div>
            
           
          {/* Bottom Row: Quantity, Price, Remove */}
          <div className="flex mt-auto pt-4 items-end justify-between text-sm">
             <div className="rounded-full flex items-center justify-center px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="ml-1 leading-none">In Stock</span>
            </div>
            {/* Remove Button */}
             <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CartLineUpdateButton({children, lines}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

function CartLineRemoveButton({lineIds, disabled}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button className='font-medium cursor-pointer text-blue-600 hover:text-blue-700 disabled:text-slate-600' disabled={disabled} type="submit">
        Remove
      </button>
    </CartForm>
  );
}

function getUpdateKey(lineIds) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}

function CartSummary({cart}) {
  const subtotal = cart?.cost?.subtotalAmount;
  
  return (
    <>
    <div className="border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 my-10 lg:my-0 lg:mx-10 xl:mx-16 2xl:mx-20 flex-shrink-0"></div>
    <div className="flex-1 ">
      <div className='sticky top-28'>
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-baseline">
          <span className="text-lg font-medium text-gray-900">Subtotal</span>
          <span className="text-2xl sm:text-3xl font-bold text-gray-900">
            ${parseFloat(subtotal?.amount || 0).toFixed(2)}
          </span>
        </div>
        
        <p className="text-sm text-gray-500">
          Shipping, discounts, will be calculated at checkout.
        </p>
      </div>

      {/* Checkout Button */}
      <a
        href="/checkout"
        className="block w-full bg-slate-900 text-white text-center py-3.5 rounded-full font-semibold hover:bg-slate-800 transition mb-5"
      >
        Checkout
      </a>

      {/* Policy Links */}
      <div className="flex items-center justify-center text-xs text-gray-500 gap-1 flex-wrap">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Learn more</span>
        <a href="/policies/shipping" className="text-blue-600 underline hover:text-blue-700">shipping</a>
        <span>and</span>
        <a href="/policies/refund" className="text-blue-600 underline hover:text-blue-700">refund</a>
        <span>information</span>
      </div>
    </div>
    </div>
    </>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/hydrogen').CartQueryDataReturn} CartQueryDataReturn */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').HeadersFunction} HeadersFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */