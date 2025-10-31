import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProductItem } from './ProductItem';

export default function FeaturedCollection({ collection }) {
  // Always run hooks — never conditionalize before them
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Safe fallback for missing data
  const products = collection?.products?.nodes || [];
  const hasProducts = products.length > 0;

  const updateVisibleCount = useCallback(() => {
    const width = window.innerWidth;
    if (width < 640) setVisibleCount(1);
    else if (width < 768) setVisibleCount(2);
    else if (width < 1024) setVisibleCount(3);
    else setVisibleCount(4);
  }, []);

  useEffect(() => {
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, [updateVisibleCount]);

  useEffect(() => {
    const maxIndex = Math.max(0, products.length - visibleCount);
    if (currentIndex > maxIndex) setCurrentIndex(maxIndex);
  }, [visibleCount, products.length, currentIndex]);

  const maxIndex = Math.max(0, products.length - visibleCount);
  const hasMultipleSlides = products.length > visibleCount;

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // ⛔ Instead of returning early, render a placeholder (keeps hook order consistent)
  if (!hasProducts) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 text-center text-gray-400">
        No products found.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            {collection.title}
          </h2>
          {collection.description && (
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              {collection.description}
            </p>
          )}
        </div>
        
        {/* Navigation Buttons */}
        {hasMultipleSlides && (
          <div className="flex sm:self-auto gap-2 sm:gap-3">
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Previous products"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Next products"
            >
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Product Slider */}
      <div className="overflow-hidden">
        <div
          className="flex gap-2 sm:gap-5 transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`
          }}
        >
          {products.map((product) => (
            <div 
              key={product.id} 
              className="flex-shrink-0"
              style={{
                width: `calc(${100 / visibleCount}% - ${(visibleCount - 1) * 1.5 / visibleCount}rem)`
              }}
            >
              <ProductItem product={product} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}