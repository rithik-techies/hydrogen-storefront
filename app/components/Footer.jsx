import { Suspense, useState } from 'react';
import { Await, Link } from 'react-router';
import { ArrowRight, ArrowRightCircle, ChevronRight } from 'lucide-react';
import { useLoaderData } from 'react-router';
import twitter from '../assets/twitter.svg';
import tiktok from '../assets/tiktok.svg';
import facebook from '../assets/facebook.svg';
import youtube from '../assets/youtube.svg';
import { Image } from '@shopify/hydrogen';

export function Footer({ footer: footerPromise }) {
 
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="bg-white border-t border-gray-200">
            {/* Main Footer Content */}
            <div className="mx-auto max-w-7xl px-6 pb-8 pt-20 sm:pt-24 lg:px-8 lg:pt-28">
              <div className='xl:grid sm:gap-5 xl:grid-cols-3 xl:gap-5'>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 xl:col-span-2">
                {/* Column 1 - Search */}
                <div className="flex flex-col gap-3">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Search
                  </h3>
                  <nav className="flex flex-col gap-4">
                    <FooterLink to="/">Home page</FooterLink>
                    <FooterLink to="/search">Search</FooterLink>
                    <FooterLink to="/collections">All collections</FooterLink>
                    <FooterLink to="/collections/men">Men</FooterLink>
                  </nav>
                </div>

                {/* Column 2 - Home page */}
                <div className="flex flex-col gap-3">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Home page
                  </h3>
                  <nav className="flex flex-col gap-4">
                    <FooterLink to="/">Home page</FooterLink>
                    <FooterLink to="/search">Search</FooterLink>
                    <FooterLink to="/collections/men">Men</FooterLink>
                    <FooterLink to="/">Home page</FooterLink>
                  </nav>
                </div>

                {/* Column 3 - All collections */}
                <div className="flex flex-col gap-3">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    All collections
                  </h3>
                  <nav className="flex flex-col gap-4">
                    <FooterLink to="/collections/women">Women</FooterLink>
                    <FooterLink to="/">Home page</FooterLink>
                    <FooterLink to="/search">Search</FooterLink>
                    <FooterLink to="/collections">All collections</FooterLink>
                  </nav>
                </div>

                {/* Column 4 - News */}
                <div className="flex flex-col gap-3">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    News
                  </h3>
                  <nav className="flex flex-col gap-4">
                    <FooterLink to="/">Home page</FooterLink>
                    <FooterLink to="/search">Search</FooterLink>
                    <FooterLink to="/collections/men">Men</FooterLink>
                    <FooterLink to="/blogs/news">News</FooterLink>
                  </nav>
                </div>

                {/* Column 5 - Newsletter */}
             
              </div>
              <div className='mt-10 xl:mt-0'>
               <div className="flex flex-col gap-3col-span-2 md:col-span-3 mt-2 sm:mt-4 md:mt-6 lg:mt-0 lg:col-span-1 border rounded-2xl border-gray-200">
               <div className='nc-WidgetHeading1 flex items-center justify-between p-4 border-b border-neutral-100 '>
                <h2 className="flex !m-0 flex-wrap gap-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  <svg
                    className="w-6 h-6 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    Stay up to date
                  </span>
                </h2>
                </div>
                <div className='p-4  border-t border-gray-300'>
                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400 ">
                  Subscribe to our newsletter to get the latest updates and special offers.
                </p>
                </div>
                 <NewsletterForm/>
              </div>
              </div>
              </div>
           

            {/* Bottom Footer */}
             <div class="mt-16 border-t border-gray-900/10 dark:border-neutral-700 pt-8 sm:mt-20 md:flex md:items-center md:justify-between lg:mt-20">
             <div class="flex mb-2 sm:mb-4 md:mb-6 lg:mb-0 flex-wrap gap-x-6 gap-y-3 md:order-2">
              <nav class="nc-SocialsList flex flex-wrap gap-4 text-2xl text-neutral-600 !gap-5">
                <Link class="block w-6 h-6 opacity-90 hover:opacity-100" to="https://www.twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter">
                  <span class="sr-only">Twitter</span>
                    <Image width="30" class="w-full" sizes="32px" src={twitter} alt="Twitter"/>
                </Link>
                <Link class="block w-6 h-6 opacity-90 hover:opacity-100" to="https://www.instagram.com" target="_blank" rel="noopener noreferrer" title="Tiktok">
                  <span class="sr-only">Tiktok</span>
                    <Image width="30" class="w-full" sizes="32px" src={tiktok} alt="Tiktok"/>
                </Link>
                <Link class="block w-6 h-6 opacity-90 hover:opacity-100" to="https://www.facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
                  <span class="sr-only">Facebook</span>
                    <Image width="30" class="w-full" sizes="32px" src={facebook}  alt="Facebook"/>
                </Link>
                <Link class="block w-6 h-6 opacity-90 hover:opacity-100" to="https://youtube.com" target="_blank" rel="noopener noreferrer" title="Youtube">
                  <span class="sr-only">Youtube</span>
                    <Image width="30" class="w-full" sizes="32px" src={youtube} alt="Youtube"/>
                </Link>
              </nav>
                </div>
                <p class=" text-[13px] leading-5 text-gray-500 md:order-1 ">© 2025Rithik Hydrogen Main, Inc. All rights reserved.</p>
                </div>
                 </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-gray-600 hover:text-gray-900 transition-colors text-sm w-fit"
      prefetch="intent"
    >
      {children}
    </Link>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      console.log('Newsletter signup:', email);
      setIsSubmitted(true);
      setTimeout(() => {
        setEmail('');
        setIsSubmitted(false);
      }, 3000);
    }
  };

  return (
    <div>
    <form onSubmit={handleSubmit} className="relative p-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="block w-full border border-gray-200 hover:ring hover:ring-primary-200/50 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white disabled:bg-gray-200 rounded-2xl text-sm font-normal h-11 px-4 py-3 rounded-2xl"
        required
      />
      <button
        type="submit"
        className="absolute me-3 !right-2 top-1/2 -translate-y-1/2 bg-black text-white rounded-full p-2 hover:bg-gray-800 transition-colors"
        aria-label="Subscribe"
      >
        <ArrowRight className="w-5 h-5 " />
      </button>
      {isSubmitted && (
        <p className="text-green-600 text-xs mt-2">Thank you for subscribing!</p>
      )}
    </form>
    </div>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('storefrontapi.generated').CollectionFragment} CollectionFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */