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
      <div className={`w-full max-w-7xl ${background_color ? `bg-${background_color}-50` : 'bg-white'} overflow-visible rounded-2xl`}>
        <div className={`flex flex-col-reverse ${imagePosition === "right" ? "lg:flex-row-reverse" : "lg:flex-row"} min-h-[500px] relative  items-center rounded-2xl sm:rounded-[40px]`}>
          
          {/* Left Side - Image */}
          {imageUrl && (
            <div className="w-full relative flex-1 max-w-xl lg:max-w-none">
                <img 
                  src={imageUrl}
                  alt={imageAlt || "Banner Image"}
                  className="w-full h-full object-cover"
                />
              
            </div>
          )}

          {/* Right Side - Text */}
          <div className="relative flex-shrink-0 mb-16 lg:mb-0 lg:mr-10 lg:w-2/5">
            
            {/* Brand Logo */}
            {brand !== false && (
              <div className="flex items-center gap-2">
                <Link to="/"><img 
                  src={ciseco}
                  alt="Ciseco Logo" 
                  className="h-8 sm:h-10 w-auto"
                /></Link> 
              </div>
            )}

            {/* Main Heading */}
            {heading && (
              <div className="space-y-2">
                <h2 className="font-semibold text-3xl sm:text-4xl xl:text-5xl 2xl:text-6xl !leading-[1.2] tracking-tight mt-6 sm:mt-10">
                  {heading}
                </h2>
              </div>
            )}

            {/* Description */}
            {description && (
              <p className="text-gray-600 text-base sm:text-lg max-w-md leading-relaxed">
                {description}
              </p>
            )}

            {/* CTA Buttons */}
            {(buttonText || buttonText_2) && (
              <div className="flex space-x-2 sm:space-x-5 mt-6 sm:mt-12">
                {buttonText && (
                  <button 
                    onClick={onButtonClick}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-xs sm:text-lg font-medium transition-all duration-300 active:scale-95"
                  >
                    {buttonText}
                  </button>
                )}
                {buttonText_2 && (
                  <button 
                    onClick={onButtonClick}
                    className="bg-transparent hover:bg-gray-100 text-gray-900 px-6 sm:px-8 py-3 border border-gray-100 sm:py-4 rounded-full text-xs sm:text-lg font-medium transition-all duration-300 active:scale-95"
                  >
                    {buttonText_2}
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
