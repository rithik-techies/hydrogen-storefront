import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { Image } from '@shopify/hydrogen';


export default function CollectionSlider({ collections = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(1);
  
  const bgColors = ['bg-pink-50', 'bg-yellow-50', 'bg-purple-50', 'bg-blue-50', 'bg-green-50', 'bg-orange-50'];
  
  const items = collections?.map((collection, index) => ({
    id: collection?.id,
    title: collection?.title,
    image: collection?.image?.url,
    handle: collection?.handle,
    bgColor: bgColors[index % bgColors.length],
    textColor: 'text-black'
  }));

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 640) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, items.length - itemsPerView);

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

  return (
    <div className="w-full min-h-full overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
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
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-300 transition-all duration-200 active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex || isTransitioning}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-300 transition-all duration-200 active:scale-95"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div 
            className="flex mb-4 transition-transform duration-500 ease-in-out"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 px-2 sm:px-3"
                style={{ width: `${100 / itemsPerView}%` }}
              >
                <Link
                  to={`/collections/${item.handle}`}
                  className={`${item.bgColor} rounded-2xl max-w-[400px] sm:rounded-3xl p-5 sm:p-6 lg:p-7 min-h-[280px] sm:min-h-[320px] lg:min-h-[360px] flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group `}
                >
                  <div className="relative z-10">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium uppercase tracking-wide">Collection</p>
                    <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${item.textColor} leading-tight mb-4`}>
                      {item.title}
                    </h2>
                  </div>

                  <div className="flex flex-row items-end justify-between relative z-10">
                    <button className="bg-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-sm font-semibold hover:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 group-hover:scale-105">
                      See collection
                    </button>
                    
                    {item.image && (
                     <Image
                        src={item.image}  
                        alt={item.title || 'Image'}
                        width={144}                  
                        height={144} sizes="(max-width: 768px) 100px, 200px" 
                        className="object-contain absolute bottom-2 sm:bottom-4 right-2 sm:right-4 opacity-80 group-hover:opacity-100 transform transition-all duration-300 group-hover:scale-110"
                    />
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}