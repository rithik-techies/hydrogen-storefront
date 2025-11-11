import { useState, useMemo } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { Image } from '@shopify/hydrogen';

// ================================
// Main Explorer Component
// ================================
const CollectionExplorer = ({ collections = [] }) => {
  const categories = [
    { id: 'kids', label: 'Kids', icon: '⚽' },
    { id: 'women', label: 'Women', icon: '♀' },
    { id: 'beauty', label: 'Beauty', icon: '👑' },
    { id: 'sports', label: 'Sports', icon: '🏋' },
    { id: 'man', label: 'Man', icon: '♂' },
    { id: 'jewelry', label: 'Jewelry', icon: '💎' },
  ];

 const [activeCategory, setActiveCategory] = useState('kids');
  const [categoryCollections, setCategoryCollections] = useState({});

  // When collections first load, pre-generate stable random selections for each category
  useEffect(() => {
    if (!collections?.length) return;

    const newMap = {};
    categories.forEach((cat) => {
      // Random shuffle but only once
      const shuffled = [...collections].sort(() => Math.random() - 0.5);
      newMap[cat.id] = shuffled.slice(0, 6);
    });
    setCategoryCollections(newMap);
  }, [collections]);

  // Always show same set for selected category
  const displayedCollections = categoryCollections[activeCategory] || [];

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="container px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Header */}
       <div className="nc-Section-Heading relative flex flex-col sm:flex-row sm:items-end justify-between mb-12 lg:mb-14 text-neutral-900 dark:text-neutral-50">
        <div className="flex flex-col items-center text-center w-full mx-auto">
            <h2 className="justify-center text-3xl md:text-4xl !m-0 2xl:text-5xl font-semibold">Start exploring.</h2>
        </div>
       </div>

        {/* Category Tabs */}
        <div className="nc-Nav mb-12 lg:mb-14 relative flex justify-center w-full text-sm md:text-base !scrollbar-hidden">
          <div className="flex  p-1 bg-white dark:bg-neutral-800 rounded-full shadow-lg overflow-x-auto !bar">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  block font-medium whitespace-nowrap px-3.5 py-2 text-sm sm:px-7 sm:py-3 capitalize rounded-full  focus:outline-none
                  ${
                    activeCategory === category.id
                      ? 'bg-gray-900 text-white shadow-lg scale-105'
                      : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <div className='flex items-center justify-center space-x-1.5 sm:space-x-2.5 text-xs sm:text-sm '>
                <span className="inline-block *:w-full *:h-full w-4 h-4 sm:w-5 sm:h-5">{category.icon}</span>
                <span className="">{category.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {displayedCollections.map((collection, index) => (
            <div
              key={`${activeCategory}-${index}`}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CollectionItem collection={collection} index={index} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {displayedCollections.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">No collections available</p>
          </div>
        )}
      </div>

      {/* Fade-in animation */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

// ================================
// Single Collection Card
// ================================
function CollectionItem({ collection, index }) {
  const patterns = ['lines', 'zigzag', 'circles'];
  const patternColors = ['#6B9BD1', '#E5A5A5', '#A8D5BA', '#F59E0B', '#8B5CF6'];
  const patternType = patterns[index % patterns.length];
  const patternColor = patternColors[index % patternColors.length];

  const renderPattern = () => {
    if (patternType === 'lines') {
      return (
        <div className="absolute bottom-8 right-8 flex flex-col gap-2 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full"
              style={{
                width: `${60 + i * 15}px`,
                backgroundColor: patternColor,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      );
    } else if (patternType === 'zigzag') {
      return (
        <svg
          className="absolute bottom-8 right-8 w-32 h-32 pointer-events-none"
          viewBox="0 0 120 120"
        >
          {[0, 1, 2, 3].map((i) => (
            <polyline
              key={i}
              points="0,10 20,30 40,10 60,30 80,10 100,30"
              fill="none"
              stroke={patternColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
              transform={`translate(${i * 5}, ${i * 20})`}
            />
          ))}
        </svg>
      );
    } else if (patternType === 'circles') {
      return (
        <div className="absolute bottom-8 right-8 pointer-events-none">
          <svg className="w-32 h-32" viewBox="0 0 120 120">
            {[...Array(9)].map((_, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              return (
                <circle
                  key={i}
                  cx={20 + col * 30}
                  cy={20 + row * 30}
                  r="12"
                  fill="none"
                  stroke={patternColor}
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />
              );
            })}
          </svg>
        </div>
      );
    }
  };

  // ✅ Show total number of products in collection
  const productCount = collection.productsCount || collection.products?.nodes?.length || 0;

  return (
    <Link
      className="collection-card block relative rounded-3xl bg-white p-8 h-96 overflow-hidden transition-transform group"
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      {/* Product Image */}
      <div className="flex justify-between items-center">
        {collection?.image && (
          <div className="w-20 h-20 relative rounded-full overflow-hidden bg-slate-100 z-0">
            <Image
              alt={collection.image.altText || collection.title}
              data={collection.image}
              loading={index < 3 ? 'eager' : undefined}
              sizes="(min-width: 45em) 128px, 128px"
              className="w-full rounded-full h-full object-contain drop-shadow-xl"
            />
          </div>
        )}
      </div>

      {/* Pattern Decoration */}
      {renderPattern()}

      {/* Content */}
      <div className="absolute bottom-8 left-8 right-8 z-10">
        {productCount > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
              />
            </svg>
            <span className="text-sm text-gray-700 font-medium">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </span>
          </div>
        )}

        <h5 className="text-3xl font-bold text-black !mb-[5rem] leading-tight">
          {collection.title}
        </h5>

        <div className="flex group-hover:text-blue-600 items-center text-black font-semibold group">
          <span>See Collection</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-4 h-4 ms-2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// ================================
// Default Export
// ================================
export default function AllCollection({ collections }) {
  return <CollectionExplorer collections={collections} />;
}
