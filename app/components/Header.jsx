import {Suspense, useState, useRef, useEffect} from 'react';
import {Await, NavLink, useAsyncValue, Form, useNavigate, Link} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import hamBurger from '../assets/hambuger.svg';
import ciseco from '../assets/ciseco.svg';
import twitter from '../assets/twitter.svg';
import tiktok from '../assets/tiktok.svg';
import facebook from '../assets/facebook.svg';
import youtube from '../assets/youtube.svg';
import {Image} from '@shopify/hydrogen';
import {Search, ChevronDown} from 'lucide-react';

export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;

  return (
    <header className="header justify-between items-baseline sm:justify-none container !my-2 !flex">
      <div className='block md:hidden'><HeaderMenuMobileToggle /></div>
      <div className="block sm:hidden">
        <SearchToggle />
      </div>

      <div className="flex lg:flex-1 items-center gap-x-3 sm:gap-x-8">
        <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
          <img src={ciseco} alt="shop name" className="w-36 h-36" />
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

/* ---------------------- SHOP DROPDOWN ---------------------- */
function ShopDropdown({menu, primaryDomainUrl}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const menuData =
    menu?.items?.map((item) => ({
      title: item.title,
      links:
        item.items?.map((sub) => ({
          text: sub.title,
          href: sub.url?.replace(primaryDomainUrl, '') || '#',
        })) ?? [],
    })) ?? [];

  return (
    <div className="" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 header-menu-item shops font-medium hover:opacity-70 transition-opacity"
      >
        Shops
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 z-50 mt-3.5">
            <div className="bg-white dark:bg-neutral-900 shadow-lg">
              <div className="container">
                <div className="flex text-sm border-t border-slate-200 dark:border-slate-700 py-10 lg:py-14">
                  {/* Menu Columns */}
                  <div className="flex-1 grid grid-cols-4 gap-6 xl:gap-8 pr-6 xl:pr-8">
                    {menuData.map((col, i) => (
                      <div key={i}>
                        <a
                          className="font-medium text-slate-900 dark:text-neutral-200"
                          href={col.links[0]?.href || '#'}
                        >
                          {col.title}
                        </a>
                        <ul className="grid space-y-4 mt-4">
                          {col.links.map((item, j) => (
                            <li key={j}>
                              <a
                                className="font-normal text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white"
                                href={item.href}
                              >
                                {item.text}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Promo Image */}
                  <div className="hidden lg:block w-[40%] xl:w-[35%]">
                    <a
                      className="block h-[250px] w-full"
                      href="/collections/new-arrivals"
                    >
                      <div className="relative h-full w-full rounded-2xl overflow-hidden bg-slate-100 group">
                        <img
                          alt="Promo"
                          src="https://cdn.shopify.com/s/files/1/0874/8928/2359/files/CollectionH_Images-2.png?v=1714183684"
                          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                        />
                        <div className="absolute inset-4 lg:inset-8 flex flex-col">
                          <div className='max-w-[18rem]'>
                            <span className="block text-sm text-slate-700">
                              Collection
                            </span>
                            <h2 className="text-xl font-semibold text-slate-900">
                              New Arrivals
                            </h2>
                          </div>
                          <div className='mt-auto'>
                          <button className="relative h-auto !inline-flex items-center justify-center rounded-full transition-colors text-sm font-medium py-3 px-4 sm:py-3.5 sm:px-6  bg-white text-slate-700 hover:bg-gray-100 nc-shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 dark:focus:ring-offset-0">
                            Shop now
                          </button>
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

/* ---------------------- HEADER MENU ---------------------- */
export function HeaderMenu({menu, primaryDomainUrl, viewport}) {
  const {close} = useAside();
  const [expandedSection, setExpandedSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  if (!menu?.items?.length) return null;

  const sections = menu.items.map((item) => ({
    title: item.title,
    links:
      item.items?.map((sub) => ({
        text: sub.title,
        href: sub.url?.replace(primaryDomainUrl, '') || '#',
      })) ?? [],
  }));

  // --- MOBILE MENU ---
  if (viewport === 'mobile') {
    return (
      <nav className="header-menu-mobile" role="navigation">
        <div className="flex-1 p-2 overflow-y-auto">
          <div className="flex mb-6 flex-wrap gap-x-6 gap-y-3">
            <nav className="flex flex-wrap gap-2.5 text-2xl text-neutral-600">
              {[twitter, tiktok, facebook, youtube].map((icon, i) => (
                <a key={i} href="#" target="_blank" className="block w-7 h-7 opacity-90 hover:opacity-100">
                  <Image width="30" className="w-full" sizes="32px" src={icon} alt="social" />
                </a>
              ))}
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
            {sections.map((section, i) => (
              <div key={i} className="hover:bg-slate-100 dark:hover:bg-slate-800">
                <button
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === section.title ? null : section.title,
                    )
                  }
                  className="w-full flex items-center justify-between pt-4 text-left"
                >
                  <span className="font-semibold text-sm tracking-wide">
                    {section.title}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      expandedSection === section.title ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedSection === section.title && (
                  <div className="pb-4 space-y-1">
                    {section.links.map((link, j) => (
                      <NavLink
                        key={j}
                        to={link.href}
                        onClick={close}
                        className="block py-2.5 text-black transition-colors pl-4"
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

  // --- DESKTOP MENU ---
  return (
    <nav className="header-menu-desktop" role="navigation">
      <ShopDropdown menu={menu} primaryDomainUrl={primaryDomainUrl} />
    </nav>
  );
}

/* ---------------------- HEADER CTAs ---------------------- */
function HeaderCtas({isLoggedIn, cart}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (e) => {
    e.preventDefault();
    setOpen((prev) => !prev);
  };

  return (
    <nav
      className="header-ctas ml-0 sm:ml-auto flex items-center gap-2 relative"
      role="navigation"
    >
      {/* Search */}
      <div className="hidden lg:block">
        <SearchToggle />
      </div>

      {/* Account Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center cursor-pointer p-2 text-gray-800 hover:text-black transition-colors"
        >
          <Suspense fallback={null}>
            <Await resolve={isLoggedIn} errorElement={null}>
              {() => (
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </Await>
          </Suspense>
        </button>

        {open && (
          <div className="absolute z-10 w-screen max-w-[260px] px-4 mt-3.5 -end-2 sm:end-0 sm:px-0">
            <div className='overflow-hidden rounded-3xl shadow-lg ring-1 ring-black ring-opacity-5'>
            <ul className="relative grid grid-cols-1 gap-6 bg-white dark:bg-neutral-800 py-7 px-6">
              <li>
                <Link
                className='flex items-center p-2 -m-3 transition duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50'
                  to="/accounts"
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300"><svg className="w-5 h-5 sm:w-6 sm:h-6" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.1601 10.87C12.0601 10.86 11.9401 10.86 11.8301 10.87C9.45006 10.79 7.56006 8.84 7.56006 6.44C7.56006 3.99 9.54006 2 12.0001 2C14.4501 2 16.4401 3.99 16.4401 6.44C16.4301 8.84 14.5401 10.79 12.1601 10.87Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7.15997 14.56C4.73997 16.18 4.73997 18.82 7.15997 20.43C9.90997 22.27 14.42 22.27 17.17 20.43C19.59 18.81 19.59 16.17 17.17 14.56C14.43 12.73 9.91997 12.73 7.15997 14.56Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></div>
                 <div className="ms-4"><p className="text-sm font-medium ">Sign in</p></div>
                </Link>
              </li>
               <li >
                <Link
                className='flex items-center p-2 -m-3 transition duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50'
                  to="/wishlist"
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300"><svg className="w-5 h-5 sm:w-6 sm:h-6" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></div>
                 <div className="ms-4"><p className="text-sm font-medium ">Wishlist</p></div>
                </Link>
              </li>
              <div className="w-full border-b border-neutral-200 dark:border-neutral-700"></div>
               <li >
                <Link
                className='flex items-center p-2 -m-3 transition duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50'
                  to="/policies"
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300"><svg className="w-5 h-5 sm:w-6 sm:h-6" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.97 22C17.4928 22 21.97 17.5228 21.97 12C21.97 6.47715 17.4928 2 11.97 2C6.44715 2 1.97 6.47715 1.97 12C1.97 17.5228 6.44715 22 11.97 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4.89999 4.92993L8.43999 8.45993" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4.89999 19.07L8.43999 15.54" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M19.05 19.07L15.51 15.54" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M19.05 4.92993L15.51 8.45993" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></div>
                 <div className="ms-4"><p className="text-sm font-medium ">Policies</p></div>
                </Link>
              </li>
            </ul>
            </div>
          </div>
        )}
      </div>

      {/* Cart */}
      <CartToggle cart={cart} />
    </nav>
  );
}

/* ---------------------- CART + SEARCH + TOGGLES ---------------------- */
function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button className="reset" onClick={() => open('mobile')}>
      <img src={hamBurger} alt="Menu" className="w-7 h-7 md:w-9 md:h-9" />
    </button>
  );
}

function SearchToggle() {
  return (
    <Link
      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
      to="/search"
    >
      <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 dark:text-slate-300" />
    </Link>
  );
}

function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  return (
    <a
      className="group w-10 h-10 sm:w-12 sm:h-12 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 relative"
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {cart, prevCart, shop, url: window.location.href});
      }}
    >
      <div className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center">
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2H3.74001C4.82001 2 5.67 2.93 5.58 4L4.75 13.96C4.61 15.59 5.89999 16.99 7.53999 16.99H18.19C19.63 16.99 20.89 15.81 21 14.38L21.54 6.88C21.66 5.22 20.4 3.87 18.73 3.87H5.82001" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16.25 22C16.9404 22 17.5 21.4404 17.5 20.75C17.5 20.0596 16.9404 19.5 16.25 19.5C15.5596 19.5 15 20.0596 15 20.75C15 21.4404 15.5596 22 16.25 22Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.25 22C8.94036 22 9.5 21.4404 9.5 20.75C9.5 20.0596 8.94036 19.5 8.25 19.5C7.55964 19.5 7 20.0596 7 20.75C7 21.4404 7.55964 22 8.25 22Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 8H21" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path></svg>
      </div>
      
        <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex items-center justify-center bg-blue-500 absolute top-1.5 right-1.5 rounded-full text-[9px] sm:text-[10px] leading-none text-white font-medium ring ring-white">
          {count}
        </span>
    
    </a>
  );
}

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

/* ---------------------- HELPERS ---------------------- */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
