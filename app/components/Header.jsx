import {Suspense, useState, useRef, useEffect} from 'react';
import {Await, NavLink, useAsyncValue, Form, useNavigate, Link} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import hamBurger from '../assets/hambuger.svg'
import ciseco from '../assets/ciseco.svg'
import twitter from '../assets/twitter.svg';
import tiktok from '../assets/tiktok.svg';
import facebook from '../assets/facebook.svg';
import youtube from '../assets/youtube.svg';
import { Image } from '@shopify/hydrogen';
import { Search, ChevronDown, X, Globe } from 'lucide-react';
import { SearchForm } from './SearchForm';

// 👇 Place this near the top of your file (before components)
const MENU_SECTIONS = [
  {
    title: 'HOME PAGE',
    links: [
      { text: 'Home page', href: '/' },
      { text: 'Shoes', href: '/collections/shoes' },
      { text: 'All collections', href: '/collections' },
      { text: 'Search page', href: '/search' },
      { text: 'News', href: '/blogs/news' },
    ]
  },
  {
    title: 'CATALOG',
    links: [
      { text: 'All products', href: '/products' },
      { text: 'Search', href: '/search' },
      { text: 'News', href: '/blogs/news' },
      { text: 'Men', href: '/collections/men' },
      { text: 'Women', href: '/collections/women' },
    ]
  },
  {
    title: 'NEWS',
    links: [
      { text: 'News', href: '/blogs/news' },
      { text: 'News/Blog', href: '/blogs/news' },
      { text: 'Search', href: '/search' },
      { text: 'Shoes', href: '/collections/shoes' },
      { text: 'Men', href: '/collections/men' },
    ]
  },
  {
    title: 'COLLECTIONS',
    links: [
      { text: 'Women', href: '/collections/women' },
      { text: 'Men', href: '/collections/men' },
      { text: 'Unisex', href: '/collections/unisex' },
      { text: 'Home page', href: '/' },
      { text: 'Accessories', href: '/collections/accessories' },
    ]
  },
];

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  return (
    <header className="header justify-between items-baseline sm:justify-none container !my-2 !flex ">
       <HeaderMenuMobileToggle />
       <div className='block sm:hidden'>
       <SearchToggle/>
       </div>
       <div className='flex lg:flex-1 items-center gap-x-3 sm:gap-x-8'>
      <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
      <img src={ciseco} alt="shop name" className='w-36 h-36' />
      </NavLink>
      <div className="hidden md:block h-8 border-s border-slate-200 dark:border-slate-700"></div>
         <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      </div>
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

/**
 * Shop Dropdown Component
 */
function ShopDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Effect for closing the dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

   const menuData = MENU_SECTIONS;


    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 header-menu-item shops font-medium hover:opacity-70 transition-opacity"
            >
                Shops
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop for mobile and desktop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Menu - Full Width from Screen Edge */}
                 <div
                    className="fixed left-0 right-0 z-50 mt-3.5"
                    id="headlessui-popover-panel-:r32:"
                    tabIndex="-1"
                    data-headlessui-state="open"
                    data-open=""
                  >
                        <div className="bg-white dark:bg-neutral-900 shadow-lg">
                            <div className="container">
                                <div className="flex text-sm border-t border-slate-200 dark:border-slate-700 py-10 lg:py-14">
                                    {/* Dynamic Menu Columns */}
                                    <div className="flex-1 grid grid-cols-4 gap-6 xl:gap-8 pr-6 xl:pr-8">
                                        {menuData.map((col, index) => (
                                            <div key={index}>
                                                <a
                                                    className="font-medium text-slate-900 dark:text-neutral-200"
                                                    data-discover="true"
                                                    href={col.links[0]?.href || '/'} // Use first link's href as column header link
                                                    target="_self"
                                                >
                                                    {col.title}
                                                </a>
                                                <ul className="grid space-y-4 mt-4">
                                                    {col.links.map((item, linkIndex) => (
                                                        <li aria-hidden="true" key={linkIndex}>
                                                            <a
                                                                className="font-normal text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white"
                                                                data-discover="true"
                                                                href={item.href}
                                                                target="_self"
                                                            >
                                                                {item.text}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Static Image/Promotional Column - Converted to JSX */}
                                    <div className="hidden lg:block w-[40%] xl:w-[35%]">
                                        <a className="block h-[250px] w-full" data-discover="true" href="/collections/accessories">
                                            <div className="relative h-full w-full aspect-w-16 aspect-h-12 sm:aspect-h-9 rounded-2xl overflow-hidden bg-slate-100 group">
                                                <img
                                                    alt=""
                                                    decoding="async"
                                                    height="56" // Use numeric height/width for React props
                                                    loading="lazy"
                                                    sizes="(max-width: 640px) 90vw, (max-width: 1200px) 50vw, 40vw"
                                                    src="https://cdn.shopify.com/s/files/1/0874/8928/2359/files/CollectionH_Images-2.png?v=1714183684&width=100&height=56&crop=center"
                                                    srcSet="https://cdn.shopify.com/s/files/1/0874/8928/2359/files/CollectionH_Images-2.png?v=1714183684&width=200&height=112&crop=center 1x, https://cdn.shopify.com/s/files/1/0874/8928/2359/files/CollectionH_Images-2.png?v=1714183684&width=400&height=224&crop=center 2x, https://cdn.shopify.com/s/files/1/0874/8928/2359/files/CollectionH_Images-2.png?v=1714183684&width=600&height=336&crop=center 3x"
                                                    width="100"
                                                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                                                    style={{ width: '100%', aspectRatio: '783 / 438' }}
                                                />
                                                <span className="opacity-0 group-hover:opacity-40 absolute inset-0 bg-black/10 transition-opacity"></span>
                                                <div>
                                                    <div className="absolute inset-4 lg:inset-8 flex flex-col">
                                                        <div className="max-w-[18rem]">
                                                            <span className="block text-sm text-slate-700">Collection</span>
                                                            <h2 className="text-xl lg:text-2xl text-slate-900 font-semibold mt-0.5 sm:mt-2">Home page</h2>
                                                        </div>
                                                        <div className="mt-auto">
                                                            <button
                                                                className="relative h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm font-medium py-3 px-4 sm:py-3.5 sm:px-6 bg-white text-slate-700 hover:bg-gray-100 nc-shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 dark:focus:ring-offset-0"
                                                                type="button"
                                                            >
                                                                Shop now
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
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
  const [expandedSection, setExpandedSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

const sections = Object.fromEntries(MENU_SECTIONS.map(s => [s.title, s.links]));

  if (viewport === 'mobile') {
    return (
      <nav className={className} role="navigation">
        {/* Header with Logo and Close Button */}

        {/* Content */}
        <div className="flex-1 p-2 overflow-y-auto">
        {/* Social Icons */}
        <div class="flex mb-6 flex-wrap gap-x-6 gap-y-3 md:order-2">
        <nav class="nc-SocialsList flex flex-wrap gap-2.5 text-2xl text-neutral-600 ">
          <Link class="block w-7 h-7 opacity-90 hover:opacity-100" to="https://www.twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter">
            <span class="sr-only">Twitter</span>
              <Image width="30" class="w-full" sizes="32px" src={twitter} alt="Twitter"/>
          </Link>
          <Link class="block w-7 h-7 opacity-90 hover:opacity-100" to="https://www.instagram.com" target="_blank" rel="noopener noreferrer" title="Tiktok">
            <span class="sr-only">Tiktok</span>
              <Image width="30" class="w-full" sizes="32px" src={tiktok} alt="Tiktok"/>
          </Link>
          <Link class="block w-7 h-7 opacity-90 hover:opacity-100" to="https://www.facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
            <span class="sr-only">Facebook</span>
              <Image width="30" class="w-full" sizes="32px" src={facebook}  alt="Facebook"/>
          </Link>
          <Link class="block w-7 h-7 opacity-90 hover:opacity-100" to="https://youtube.com" target="_blank" rel="noopener noreferrer" title="Youtube">
            <span class="sr-only">Youtube</span>
              <Image width="30" class="w-full" sizes="32px" src={youtube} alt="Youtube"/>
          </Link>
        </nav>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Type and press enter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 placeholder:text-gray-400"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Menu Sections */}
          <div className="space-y-2">
            {Object.entries(sections).map(([title, links]) => (
              <div key={title} className="hover:bg-slate-100 dark:hover:bg-slate-800">
                <button
                  onClick={() => toggleSection(title)}
                  className="w-full flex items-center justify-between pt-4 text-left hover:text-gray-600 transition-colors"
                >
                  <span className="font-semibold text-sm tracking-wide">{title}</span>
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform ${
                      expandedSection === title ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {expandedSection === title && (
                  <div className="pb-4 space-y-1">
                    {links.map((link, idx) => (
                      <NavLink
                        key={idx}
                        to={link.href}
                        onClick={close}
                        className="block py-2.5 text-black  transition-colors pl-4"
                      >
                        {link.text}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={className} role="navigation">
      <ShopDropdown />
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="header-ctas ml-0 sm:ml-auto flex items-center gap-2 md:gap-3" role="navigation">
        <Link className='hidden md:block' to="/search"><SearchToggle/></Link>
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle} className="flex-shrink-0">
        <Suspense fallback={null}>
          <Await resolve={isLoggedIn} errorElement={null}>
            {() => (
             <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            )}
          </Await>
        </Suspense>
      </NavLink>
      
      <CartToggle cart={cart} />
    </nav>
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

function SearchToggle() {
  return (
    <button className="reset flex-shrink-0">
      <svg className="w-5 h-5 sm:w-6 sm:h-6" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M22 22L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
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
      <div className="w-7 h-7 md:w-9 md:h-9  flex items-center justify-center">
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2H3.74001C4.82001 2 5.67 2.93 5.58 4L4.75 13.96C4.61 15.59 5.89999 16.99 7.53999 16.99H18.19C19.63 16.99 20.89 15.81 21 14.38L21.54 6.88C21.66 5.22 20.4 3.87 18.73 3.87H5.82001" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M16.25 22C16.9404 22 17.5 21.4404 17.5 20.75C17.5 20.0596 16.9404 19.5 16.25 19.5C15.5596 19.5 15 20.0596 15 20.75C15 21.4404 15.5596 22 16.25 22Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M8.25 22C8.94036 22 9.5 21.4404 9.5 20.75C9.5 20.0596 8.94036 19.5 8.25 19.5C7.55964 19.5 7 20.0596 7 20.75C7 21.4404 7.55964 22 8.25 22Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M9 8H21" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path></svg>
      </div> 
      {count > 0 && (
        <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex items-center justify-center bg-blue-500 absolute  top-0 right-0 rounded-full text-[9px] sm:text-[10px] leading-none text-white font-medium ring ring-white">
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