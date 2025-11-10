import { ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Money } from "@shopify/hydrogen";
import { Link } from "react-router"

/* ---------- ProductCard ---------- */
function ProductCard({ product }) {
  const images = product.images?.nodes || []; // ✅ correctly access nodes array
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () =>
    setCurrentImageIndex((prev) => Math.min(images.length - 1, prev + 1));
  const prevImage = () =>
    setCurrentImageIndex((prev) => Math.max(0, prev - 1));

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <Link
        to={`/products/${product.handle}`} // ✅ go to product detail page
        className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-[4/3] group"
      >
        <img
          src={images[currentImageIndex]?.url || product.featuredImage?.url}
          alt={images[currentImageIndex]?.altText || product.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
       
      </Link>

      {/* Thumbnails */}
     {images.length > 1 && (
        <div className="grid grid-cols-3 scrollbar-hidden !overflow-x-auto gap-3 pb-2">
            {images.map((img, idx) => (
            <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-full aspect-square rounded-xl cursor-pointer bg-gray-100 overflow-hidden transition-all`}
            >
                <img
                src={img.url}
                alt={`${product.title} view ${idx + 1}`}
                className="w-full h-full object-cover"
                />
            </button>
            ))}
        </div>
    )}


      {/* Product Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1">{product.title}</h3>
        </div>

        <div className="flex items-center justify-between text-sm font-medium mt-1">
          <div className="text-green-500 border-2 md:py-1.5 md:px-2.5 border-green-500 rounded-lg py-1 px-2 inline-block !leading-none">
            {product.priceRange?.minVariantPrice ? (
              <Money data={product.priceRange.minVariantPrice} />
            ) : (
              <span className="text-gray-400">No price</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center text-slate-500 dark:text-slate-400">
        {product?.variants?.nodes?.[0]?.selectedOptions?.length > 0 && (
          <div className="text-sm text-gray-600 mt-1">
            {product.variants.nodes[0].selectedOptions.map((opt, i) => (
              <span key={i}>
                <span className="font-medium">{opt.value}</span>
                {i < product.variants.nodes[0].selectedOptions.length - 1 && ", "}
              </span>
            ))}
          </div>
        )}
        <span className="h-5 mx-1 sm:mx-2 border-l border-slate-200 dark:border-slate-700"></span>
        <div className="flex items-center gap-1">
        <span className="text-yellow-500 text-xl">★</span>
        <span >4.0</span>
        <span className=" text-sm">(3 Reviews)</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- ProductShowcase ---------- */
export default function ProductShowcase({ products = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) setItemsPerView(3);
      else if (window.innerWidth >= 768) setItemsPerView(2);
      else setItemsPerView(1);
    };
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, products.length - itemsPerView);
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < maxIndex;

  const handlePrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const handleNext = () => setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));

  const containerStyle = {
    transform: `translateX(-${(currentIndex * 100) / products.length}%)`,
    width: `${(products.length * 100) / itemsPerView}%`,
  };

  const itemStyle = {
    width: `${100 / products.length}%`,
    flexShrink: 0,
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="container py-20 md:py-24">
        <div className="nc-Section-Heading relative flex flex-col sm:flex-row sm:items-end justify-between mb-12 lg:mb-14 text-neutral-900 dark:text-neutral-50">
          <h1 className="text-4xl !m-0 font-bold">Chosen by our experts</h1>
          <div className="mt-4 flex justify-end sm:ms-2 sm:mt-0 flex-shrink-0">
            <button
              onClick={handlePrev}
              disabled={!canScrollLeft}
              className={`w-10 h-10 me-2  rounded-full flex items-center justify-center border-2 ${
                canScrollLeft
                  ? "border-slate-200 dark:border-slate-600"
                  : "border-slate-200 text-gray-300 cursor-not-allowed"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                canScrollRight
                  ? "border-gray-300 hover:bg-gray-50"
                  : "border-gray-200 text-gray-300 cursor-not-allowed"
              }`}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="overflow-hidden -mx-4 px-4">
          <div
            ref={containerRef}
            className="flex transition-transform duration-500 ease-out"
            style={containerStyle}
          >
            {products.map((product) => (
              <div key={product.id} className="px-4" style={itemStyle}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
