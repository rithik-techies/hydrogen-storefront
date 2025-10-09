import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function CollectionSlider({ collections = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);
  const [visibleCards, setVisibleCards] = useState(1);
  
  const bgColors = ['bg-pink-50', 'bg-yellow-50', 'bg-purple-50', 'bg-blue-50', 'bg-green-50', 'bg-orange-50'];
  
  const items = collections.map((collection, index) => ({
    id: collection?.id,
    title: collection?.title,
    image: collection?.image?.url,
    handle: collection?.handle,
    bgColor: bgColors[index % bgColors.length],
    textColor: 'text-black'
  }));

  // Get card width based on screen size
  const getCardWidth = useCallback(() => {
    if (typeof window === 'undefined') return 448;
    const width = window.innerWidth;
    
    if (width >= 1536) return 544; // 2xl: 34rem
    if (width >= 1280) return 480; // xl: 30rem
    if (width >= 1024) return 448; // lg: 28rem
    if (width >= 640) return 384;  // sm: 96 (24rem)
    return 256; // default: 64 (16rem)
  }, []);

  // Get gap size based on screen size
  const getGapSize = useCallback(() => {
    if (typeof window === 'undefined') return 24;
    const width = window.innerWidth;
    
    if (width >= 1024) return 24; // lg gap-6
    if (width >= 640) return 16;  // sm gap-4
    return 12; // default gap-3
  }, []);

  // Calculate how many cards are visible
  const calculateVisibleCards = useCallback(() => {
    if (!containerRef.current) return 1;
    
    const containerWidth = containerRef.current.offsetWidth;
    const cardWidth = getCardWidth();
    const gap = getGapSize();
    
    // Calculate how many full cards fit
    const visible = Math.floor((containerWidth + gap) / (cardWidth + gap));
    return Math.max(1, visible);
  }, [getCardWidth, getGapSize]);

  useEffect(() => {
    const handleResize = () => {
      const visible = calculateVisibleCards();
      setVisibleCards(visible);
      // Reset to valid index if needed
      const newMaxIndex = Math.max(0, items.length - visible);
      if (currentIndex > newMaxIndex) {
        setCurrentIndex(newMaxIndex);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateVisibleCards, items.length, currentIndex]);

  // Calculate max index - when to stop scrolling
  const maxIndex = Math.max(0, items.length - visibleCards);
  
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < maxIndex;

  const handlePrev = () => {
    if (!canScrollLeft || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleNext = () => {
    if (!canScrollRight || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Calculate translate based on card width and gap
  const getTranslateX = () => {
    const cardWidth = getCardWidth();
    const gap = getGapSize();
    return currentIndex * (cardWidth + gap);
  };

  return (
    <div className="w-full bg-white min-h-screen flex items-center">
      <div className="w-full py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 lg:mb-12">
          <div className=" relative flex flex-col sm:flex-row sm:items-end justify-between mb-12 lg:mb-14 text-neutral-900 dark:text-neutral-50 container">
            <h1 className="text-3xl md:text-4xl !m-0 font-semibold">
              Discover more.{' '}
              <span className="text-gray-500 font-normal block sm:inline mt-1 sm:mt-0">
                Good things are waiting for you!
              </span>
            </h1>
            
            <div className="flex gap-2 sm:gap-3 self-end sm:self-auto">
              <button
                onClick={handlePrev}
                disabled={!canScrollLeft || isTransitioning}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200 active:scale-95"
                aria-label="Previous collection"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={handleNext}
                disabled={!canScrollRight || isTransitioning}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200 active:scale-95"
                aria-label="Next collection"
              >
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Slider Container */}
        <div className="relative">
          <div 
            ref={containerRef}
            className="overflow-hidden px-4 sm:px-6 lg:px-8"
          >
            <div 
              className="flex gap-3 sm:gap-4 lg:gap-6 transition-transform duration-500 ease-out"
              style={{ 
                transform: `translateX(-${getTranslateX()}px)`
              }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-64 sm:w-96 lg:w-[28rem] xl:w-[30rem] 2xl:w-[34rem]"
                >
                  <a
                    href={`/collections/${item.handle}`}
                    className={`${item.bgColor} rounded-2xl sm:rounded-3xl p-6 sm:p-7 lg:p-9 min-h-[280px] sm:min-h-[320px] lg:min-h-[360px] flex flex-col justify-between relative overflow-hidden transition-all duration-300 block h-full`}
                  >
                    {/* Content */}
                    <div className="relative z-10">
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 lg:mb-3 font-medium tracking-wider">
                        Collection
                      </p>
                      <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${item.textColor} leading-tight max-w-xs`}>
                        {item.title}
                      </h2>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex flex-row items-end justify-between relative z-10 mt-6">
                      <button className="bg-white px-5 py-2.5 sm:px-6 sm:py-3 lg:px-7 lg:py-3.5 rounded-full text-sm sm:text-base font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 group-hover:scale-105">
                        See collection
                      </button>
                      
                      {item.image && (
                        <img
                          src={item.image}  
                          alt={item.title || 'Collection image'}
                          className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 object-contain absolute bottom-0 right-0 opacity-85 group-hover:opacity-100 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-2"
                          loading="lazy"
                        />
                      )}
                    </div>

                    {/* Decorative gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl sm:rounded-3xl" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}