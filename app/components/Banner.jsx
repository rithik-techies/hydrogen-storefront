import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame, Search } from 'lucide-react';
import banner_image_2 from '../assets/banner_image_2.png';
import banner_image from '../assets/banner_image.png';


export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      bgImage: banner_image
    },
    {
      bgImage: banner_image_2
    },
    {
      bgImage: banner_image
    },
    {
      bgImage: banner_image_2
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-80 sm:h-80 md:h-80 lg:h-96 xl:h-100 2xl:h-130 bg-gray-50
">
      <div className="relative w-full h-full overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover transition-opacity duration-960 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full">
              
              {/* Background Image with Overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.bgImage})` }}
              >
                <div className="absolute"></div>
              </div>
              <div className="relative  h-full">
                <div className="mx-auto h-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl">
                  <div className="flex items-center h-full">
                    
                    <div className="w-full md:w-3/5 lg:w-3/5 py-12 md:py-6">
                      <div className="flex items-center gap-2">
                        <p className="text-slate-800 text-xl sm:text-2xl lg:text-2xl font-medium tracking-wide">
                          In this season, find the best
                        </p>
                        <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 animate-pulse" />
                      </div>
                      <div className="mb-6 w-full sm:mb-8 lg:mb-10">
                       <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-6xl font-black text-slate-800 leading-[1.1] tracking-tight mb-2">
                         Exclusive collection
                        </p>
                        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-6xl font-black text-slate-800 leading-[1.1] tracking-tight">
                         for everyone
                        </p>
                      </div>
                      <button className="group relative bg-gray-900 hover:bg-gray-800 text-white px-8 sm:px-10 lg:px-12 py-3.5 sm:py-4 lg:py-5 rounded-full text-sm sm:text-base lg:text-lg font-semibold transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 overflow-hidden">
                        <span className="relative z-10">Explore now</span>
                        <Search className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
             <button
              onClick={prevSlide}
              className="absolute hidden cursor-pointer sm:block left-3 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 lg:p-4 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Previous slide"
            >
            <ChevronLeft className="w-5 h-15 sm:w-6 sm:h-10 lg:w-9 lg:h-15 text-black" strokeWidth={2.5} />
            </button>

              
              <button
                onClick={nextSlide}
                 className="absolute hidden cursor-pointer sm:block right-3 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 lg:p-4 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
                 aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-15 sm:w-6 sm:h-10 lg:w-9 lg:h-15 text-black" strokeWidth={2.5} />
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-6 sm:bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 ">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className="group relative"
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    <div className="relative h-1 sm:h-1.5 w-13 sm:w-16 lg:w-20 xl:w-20 2xl:w-20 rounded-full bg-gray-300 shadow-sm overflow-hidden">
                      <div 
                        className={`absolute inset-0 rounded-full cursor-pointer bg-gray-900 origin-left transition-transform duration-300 ${
                          idx === currentSlide 
                            ? 'animate-slide-progress scale-x-100' 
                            : idx < currentSlide 
                            ? 'scale-x-100' 
                            : 'scale-x-0'
                        }`}
                      ></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        <style>{`
          @keyframes slide-progress {
            from {
              transform: scaleX(0);
            }
            to {
              transform: scaleX(1);
            }
          }

          .animate-slide-progress {
            animation: slide-progress 0.4s linear forwards;
          }
        `}</style>
      </div>
    </div>
  );
}