import { Link } from 'react-router';
import ciseco from '../assets/ciseco.svg';


// Main Banner Component
export default function Banner({
  brand,
  heading,
  highlightText,
  subheading,
  description,
  buttonText,
  buttonText_2,
  imageUrl,
  imageAlt,
  onButtonClick,
  imagePosition,
  background_color
}) {
  return (
   <div className="w-full min-h-screen relative flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className={`w-full max-w-7xl bg-${background_color}-50 overflow-hidden  rounded-2xl`}>
        <div className={`flex flex-col md:flex-row ${imagePosition === "right" ? "md:flex-row-reverse" : "md:flex-row"} items-center min-h-[500px]`}>
          {/* Left Side - Image */}
          <div className="w-full md:w-1/2 relative flex items-end md:items-center justify-center overflow-visible">
            <div className="relative w-full px-6 sm:px-8 md:px-12 pb-0 md:pb-0">
              <img 
                src={imageUrl}
                alt={imageAlt}
                className="w-full z-100 h-full object-contain drop-shadow-2xl -mt-8 md:-mt-16 lg:-mt-20"
              />
             </div>
          </div>

          <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 space-y-4 sm:space-y-6">
           <div className="flex items-center gap-2">
             <Link to="/"><img 
                src={ciseco}
                alt="Ciseco Logo" 
                className="h-8 sm:h-10 w-auto"
              /></Link> 
            </div>

            {/* Main Heading */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 sm:gap-3">
               <h2 class="font-semibold text-3xl sm:text-4xl xl:text-5xl 2xl:text-6xl !leading-[1.2] tracking-tight mt-6 sm:mt-10">{heading}</h2>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-base sm:text-lg max-w-md leading-relaxed">
              {description}
            </p>

            {/* CTA Button */}
            <div className="flex space-x-2 sm:space-x-5 mt-6 sm:mt-12">
              <button 
                onClick={onButtonClick}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium transition-all duration-300 active:scale-95"
              >
                {buttonText}
              </button>
              <button 
                onClick={onButtonClick}
                className={`bg-transparent hover:bg-gray-100 text-gray-900 px-6 sm:px-8 py-3 border border-gray-100 sm:py-4 rounded-full ${buttonText_2?"":"hidden"} text-base sm:text-lg font-medium transition-all duration-300  active:scale-95`}
              >
                {buttonText_2}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}