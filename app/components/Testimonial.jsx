import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Avatar_1 from '../assets/Testimonial-1.avif'
import Avatar_2 from '../assets/Testimonial-2.avif'
import Avatar_3 from '../assets/Testimonial-3.avif'

export default function Testimonial() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Lazuli Luxe",
      review: "Great quality products, affordable prices, fast and friendly delivery. I very much recommend it.",
      rating: 4,
      avatar: Avatar_1
    },
    {
      id: 2,
      name: "Sarah Johnson",
      review: "Outstanding service! The team went above and beyond to ensure my satisfaction. Will definitely order again.",
      rating: 5,
      avatar: Avatar_2
    },
    {
      id: 3,
      name: "Michael Chen",
      review: "Exceptional quality and attention to detail. The customer support was responsive and helpful throughout the process.",
      rating: 3,
      avatar: Avatar_3
    },
    {
      id: 4,
      name: "Emily Rodriguez",
      review: "I'm impressed with the professionalism and quality. Everything arrived perfectly packaged and exactly as described.",
      rating: 2,
      avatar: Avatar_2
    }
  ];

  const floatingAvatars = [
    { seed: Avatar_1, position: "top-32 left-12" },
    { seed: Avatar_2, position: "top-32 right-12" },
    { seed: Avatar_3, position: "top-96 left-5" },
    { seed: Avatar_1, position: "top-96 right-5" },
    { seed: Avatar_2, position: "bottom-10 left-70" },
    { seed: Avatar_3, position: "bottom-10 right-70" }
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen container my-12 flex items-center justify-center overflow-hidden">
      <div className="relative w-full max-w-5xl">
        {/* Floating Avatars - Hidden on mobile for cleaner look */}
        <div className="hidden lg:block">
          {floatingAvatars.map((avatar, idx) => (
            <div
              key={idx}
              className={`absolute ${avatar.position} w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-lg border-2 border-white animate-pulse`}
            >
              <img
                src={floatingAvatars[idx].seed}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

      <div>
        <div className="relative flex flex-col sm:items-end justify-between mb-12 lg:mb-14 text-neutral-900 dark:text-neutral-50">
          {/* Header */}
          <div className="flex flex-col items-center  mb-12 lg:mb-14 text-center w-full mx-auto">
            <h1 className="justify-center !m-0 text-3xl md:text-4xl font-semibold">
              Good news from far away{" "}
              <span className="inline-block">🥇</span>
            </h1>
            <p className="mt-2 md:mt-3 font-normal block text-base sm:text-xl text-neutral-500 dark:text-neutral-400">
              Let's see what people think of Ciseco
            </p>
          </div>

          {/* Testimonial Card */}
          <div className="relative md:mb-16 max-w-2xl mx-auto">
             <div className="flex justify-center mb-4">
                <img
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].name}
                  className="w-20 h-20 sm:w-30 sm:h-30 rounded-full border-4 border-blue-100 shadow-lg"
                />
              </div>
              <div className='mt-12 lg:mt-16 relative'>
              <img className="opacity-50 md:opacity-100 absolute -mr-16 lg:mr-3 right-full top-1" src="https://cdn.shopify.com/oxygen-v2/32559/21434/44377/1498188/assets/quotation-0X_P_9xw.png" width="50" alt="quotation" sizes="50px"></img>
              <img className="opacity-50 md:opacity-100 absolute -mr-16 lg:mr-3 left-full top-1" src="https://cdn.shopify.com/oxygen-v2/32559/21434/44377/1498188/assets/quotation2-Uv0pj8F-.png" width="50" alt="quotation" sizes="50px"></img>
           <div className='flex flex-col items-center text-center'>
            {/* Review Text */}
            <p className="block text-2xl">
              {testimonials[currentIndex].review}
            </p>

            {/* Reviewer Info */}
            <div className="flex flex-col items-center justify-center mb-6 sm:mb-8">
             
              <h3 className="block mt-8 text-2xl mb-3 font-semibold">
                {testimonials[currentIndex].name}
              </h3>
              <div className="flex items-center space-x-0.5 mt-3.5 text-yellow-500">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-slot="icon" className="w-6 h-6"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd"></path></svg>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center">
              <button
                onClick={handlePrev}
                className="w-10 h-10 me-2 border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center border-2"
                aria-label="Previous testimonial"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 me-2 border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center border-2"
                aria-label="Next testimonial"
              >
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>
            </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}