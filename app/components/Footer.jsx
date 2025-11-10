import {Suspense, useState} from 'react';
import {Await, Link} from 'react-router';
import {ArrowRight} from 'lucide-react';
import {Image} from '@shopify/hydrogen';
import twitter from '../assets/twitter.svg';
import tiktok from '../assets/tiktok.svg';
import facebook from '../assets/facebook.svg';
import youtube from '../assets/youtube.svg';

export function Footer({footer: footerPromise}) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => {
          if (!footer?.mainMenu) return null;

          const mainMenu = footer.mainMenu;

          return (
            <footer className="bg-white border-t border-gray-200">
              <div className="mx-auto max-w-7xl px-6 pb-8 pt-20 sm:pt-24 lg:px-8 lg:pt-28">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 xl:col-span-2">
                    {mainMenu.items.map((menuItem, i) => (
                      <div key={i}>
                        {/* Top-level menu title */}
                        <h3 className="font-medium text-slate-900 dark:text-neutral-200">
                          {menuItem.title}
                        </h3>

                        {/* Submenu links */}
                        {menuItem.items?.length > 0 && (
                          <ul className="grid space-y-4 mt-4">
                            {menuItem.items.map((subItem, j) => (
                              <li key={j}>
                                <a
                                  className="font-normal text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white"
                                  href={subItem.url || '#'}
                                >
                                  {subItem.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Newsletter Section */}
                  <div className='mt-10 xl:mt-0'>
                  <div className="nc-WidgetAddSubscriberForm overflow-hidden rounded-3xl border border-neutral-100 dark:border-neutral-700">
                    <div className='nc-WidgetHeading1 flex items-center justify-between p-4 border-b border-neutral-100 '>
                      <h2 className="flex flex-wrap !m-0 gap-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      <svg
                        className="w-6 h-6 text-gray-900"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Stay up to date
                    </h2>
                    </div>
                    <div className="p-4 xl:p-5">
                    <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                      Subscribe to our newsletter to get the latest updates and
                      special offers.
                    </p>
                    <NewsletterForm />
                    </div>
                  </div>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-16 border-t border-gray-900/10 pt-8 flex flex-col md:flex-row-reverse items-center justify-between gap-6">
                  <SocialLinks />
                  <p className="text-[13px] leading-5 text-gray-500">
                    © {new Date().getFullYear()} Rithik Hydrogen Main, Inc. All
                    rights reserved.
                  </p>
                </div>
              </div>
            </footer>
          );
        }}
      </Await>
    </Suspense>
  );
}

function FooterLink({to, children}) {
  return (
    <Link
      to={to}
      className="text-gray-600 hover:text-gray-900 transition-colors text-sm w-fit"
      prefetch="intent">
      {children}
    </Link>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    console.log('Newsletter signup:', email);
    setSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className='mt-4'>
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="block w-full border border-gray-200 rounded-2xl text-sm h-11 px-4 py-3 focus:ring focus:ring-primary-200"
        required
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white rounded-full p-2 hover:bg-gray-800 transition-colors"
        aria-label="Subscribe">
        <ArrowRight className="w-5 h-5" />
      </button>
      {submitted && (
        <p className="text-green-600 text-xs mt-2">
          Thank you for subscribing!
        </p>
      )}
    </form>
    </div>
  );
}

function SocialLinks() {
  const socials = [
    {src: twitter, alt: 'Twitter', url: 'https://www.twitter.com'},
    {src: tiktok, alt: 'Tiktok', url: 'https://www.tiktok.com'},
    {src: facebook, alt: 'Facebook', url: 'https://www.facebook.com'},
    {src: youtube, alt: 'YouTube', url: 'https://www.youtube.com'},
  ];

  return (
    <nav className="flex gap-4">
      {socials.map((s) => (
        <Link
          key={s.alt}
          to={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-6 h-6 opacity-90 hover:opacity-100">
          <Image width="30" src={s.src} alt={s.alt} />
        </Link>
      ))}
    </nav>
  );
}
