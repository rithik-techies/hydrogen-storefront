import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function CollectionSlider({ collections = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(1);
  const sliderRef = useRef(null);
  
  const bgColors = ['bg-pink-50', 'bg-yellow-50', 'bg-purple-50', 'bg-blue-50', 'bg-green-50', 'bg-orange-50'];
  
  const items = collections?.length > 0 ? collections.map((collection, index) => ({
    id: collection?.id,
    title: collection?.title,
    image: collection?.image?.url,
    handle: collection?.handle,
    bgColor: bgColors[index % bgColors.length],
    textColor: 'text-black'
  })) : [
    { id: 1, title: 'Unisex', bgColor: 'bg-purple-50', handle: 'unisex' },
    { id: 2, title: 'Tops', bgColor: 'bg-blue-50', handle: 'tops' },
    { id: 3, title: 'Summer', bgColor: 'bg-yellow-50', handle: 'summer' },
    { id: 4, title: 'Accessories', bgColor: 'bg-pink-50', handle: 'accessories' },
    { id: 5, title: 'Winter', bgColor: 'bg-green-50', handle: 'winter' }
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setItemsPerView(2.3);
      } else if (window.innerWidth >= 1024) {
        setItemsPerView(2);
      } else if (window.innerWidth >= 768) {
        setItemsPerView(1.5);
      } else if (window.innerWidth >= 640) {
        setItemsPerView(1.2);
      } else {
        setItemsPerView(1.05);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate max index to prevent overscrolling
  const maxIndex = Math.max(0, items.length - Math.floor(itemsPerView));

  const handlePrev = () => {
    if (currentIndex === 0 || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleNext = () => {
    if (currentIndex >= maxIndex || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Calculate the translate percentage
  const getTranslateX = () => {
    const cardWidthPercentage = 100 / itemsPerView;
    return currentIndex * cardWidthPercentage;
  };

  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 lg:mb-12 gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            Discover more.{' '}
            <span className="text-gray-500 font-normal block sm:inline mt-1 sm:mt-0">
              Good things are waiting for you!
            </span>
          </h1>
          
          <div className="flex gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0 || isTransitioning}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 active:scale-95"
              aria-label="Previous"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex || isTransitioning}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-300 transition-all duration-200 active:scale-95"
              aria-label="Next"
            >
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Slider Container */}
        <div className="overflow-hidden">
          <div 
            ref={sliderRef}
            className="flex gap-3 sm:gap-4 lg:gap-6 transition-transform duration-500 ease-in-out"
            style={{ 
              transform: `translateX(-${getTranslateX()}%)`
            }}
          >
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex-shrink-0"
                style={{ 
                  width: `calc(${100 / itemsPerView}% - ${((itemsPerView - 1) / itemsPerView) * (window.innerWidth >= 1024 ? 24 : window.innerWidth >= 640 ? 16 : 12)}px)` 
                }}
              >
                <a
                  href={`/collections/${item.handle}`}
                  className={`${item.bgColor} rounded-2xl sm:rounded-3xl p-6 sm:p-7 lg:p-9 min-h-[280px] sm:min-h-[320px] lg:min-h-[360px] flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group block w-full`}
                >
                  <div className="relative z-10">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium uppercase tracking-wide">
                      Collection
                    </p>
                    <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${item.textColor} leading-tight`}>
                      {item.title}
                    </h2>
                  </div>

                  <div className="flex flex-row items-end justify-between relative z-10 mt-6">
                    <button className="bg-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-semibold hover:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 group-hover:scale-105">
                      See collection
                    </button>
                    
                    {item.image && (
                      <img
                        src={item.image}  
                        alt={item.title || 'Collection image'}
                        className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 object-contain absolute bottom-2 sm:bottom-3 lg:bottom-4 right-2 sm:right-3 lg:right-4 opacity-80 group-hover:opacity-100 transform transition-all duration-300 group-hover:scale-110"
                      />
                    )}
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}