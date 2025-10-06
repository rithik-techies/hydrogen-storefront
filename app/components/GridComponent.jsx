import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function BenefitGridComponent() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const benefits = [
    {
      id: 'warranty',
      title: 'Lifetime Warranty',
      content: 'Our luggage is backed by a comprehensive lifetime warranty, ensuring your investment is protected for years to come.'
    },
    {
      id: 'returns',
      title: '100 Day Returns',
      content: 'Try our luggage risk-free with our generous 100-day return policy. If you\'re not completely satisfied, return it for a full refund.'
    },
    {
      id: 'shipping',
      title: 'Free Shipping',
      content: 'Enjoy complimentary shipping on all orders. We\'ll deliver your new luggage right to your doorstep at no extra cost.'
    },
    {
      id: 'personalize',
      title: 'Personalize your Luggage',
      content: 'Make your luggage uniquely yours with custom monogramming and personalization options available for all our products.'
    }
  ];

  return (
    <div className="min-h-full bg-[#d4c4b0] flex items-center justify-center p-8">
      <div className="max-w-7xl w-full items-center">
        {/* Left Content */}
        <div className="text-white">
          <h1 className="text-3xl md:text-4xl !font-light text-wrap leading-tight mb-6">
            Focus on the parts of<br/>travel you love.
          </h1>
          <p className="text-lg md:text-xl font-light opacity-90">
            Our signature luggage will be your forever<br/>travel companion with a lifetime warranty.
          </p>
        </div>

        {/* Right Accordion */}
        <div className="space-y-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="border-b border-white/30 pb-4"
            >
              <button
                onClick={() => toggleItem(benefit.id)}
                className="w-full flex items-center justify-between text-left text-white hover:opacity-80 transition-opacity"
              >
                <span className="text-xl md:text-2xl font-light">
                  {benefit.title}
                </span>
                <ChevronDown
                  className={`w-6 h-6 transition-transform duration-300 ${
                    openItems[benefit.id] ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openItems[benefit.id] ? 'max-h-40 mt-4' : 'max-h-0'
                }`}
              >
                <p className="text-white/90 font-light leading-relaxed">
                  {benefit.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}