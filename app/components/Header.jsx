import {Suspense, useState} from 'react';
import {Await, NavLink, useAsyncValue, Form, useNavigate} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import SearchIcon from '../assets/searchicon.svg';
import cartIcon from '../assets/carticon.svg';
import userIcon from '../assets/usericon.svg'
import hamBurger from '../assets/hambuger.svg'
import ciseco from '../assets/ciseco.svg'






/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  return (
    <header className="header !flex !justify-between ">
       <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
      <img src={ciseco} alt="shop name" className='w-30 h-30' />
      </NavLink>
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className="header-ctas ml-0 sm:ml-auto flex items-center gap-2 md:gap-3" role="navigation">
      {searchOpen ? (
        <div className="flex items-center border-2 animate-slideIn border-gray-300 w-full max-w-[200px] md:max-w-[250px] rounded-full">
          {/* Animate only the input */}
          <SearchBar 
            searchOpen={searchOpen} 
            setSearchOpen={setSearchOpen} 
            className="animate-slideIn flex-1"
          />
          {/* Toggle inside acts like close icon */}
          <button 
            onClick={() => setSearchOpen(false)}
            className="flex-shrink-0 p-1"
          >
            <img src={SearchIcon} alt="Close Search" className="w-7 h-7 md:w-9 md:h-9" />
          </button>
        </div>
      ) : (
        <SearchToggle setSearchOpen={setSearchOpen} searchOpen={searchOpen} />
      )}
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle} className="flex-shrink-0">
        <Suspense fallback={null}>
          <Await resolve={isLoggedIn} errorElement={null}>
            {() => (
              <img src={userIcon} alt="User" className="w-7 h-7 md:w-9 md:h-9" />
            )}
          </Await>
        </Suspense>
      </NavLink>
      
      <CartToggle cart={cart} />
    </nav>
  );
}

function SearchBar({searchOpen, setSearchOpen}) {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get('q');
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchOpen(false);
    }
  };

  return (
    <Form method="get" action="/search" onSubmit={handleSubmit} className="flex-1">
      <input
        type="search"
        name="q"
        placeholder="Search..."
        className="w-full !m-0 !border-0 rounded-full outline-none text-sm md:text-base px-2 md:px-3 py-1.5 md:py-2 bg-transparent !focus:outline-none"
        autoFocus={searchOpen}
      />
    </Form>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <img src={hamBurger} alt="Menu" className="w-7 h-7 md:w-9 md:h-9" />
    </button>
  );
}

function SearchToggle({setSearchOpen, searchOpen}) {
  const handleClick = () => {
    setSearchOpen(!searchOpen);
  };

  return (
    <button className="reset flex-shrink-0" onClick={handleClick}>
      <img src={SearchIcon} alt="Search" className="w-7 h-7 md:w-9 md:h-9" />
    </button>
  );
}

/**
 * @param {{count: number | null}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      className='relative inline-block flex-shrink-0'
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      <div className="w-7 h-7 md:w-9 md:h-9 rounded-full border-2 border-gray-900 flex items-center justify-center">
        <img src={cartIcon} alt="Cart" className="w-5 h-5 md:w-6 md:h-6" />
      </div> 
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 md:w-5 md:h-5 bg-black text-white text-[10px] md:text-[11px] font-semibold rounded-full border-2 border-white">
          {count}
        </span>
      )}
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('@shopify/hydrogen').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */