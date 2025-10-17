import React, { useState, useRef, useEffect } from 'react';
import { Heart, X, SlidersHorizontal, CircleDot, ChevronDown } from 'lucide-react';
import { ProductItem } from './ProductItem';

export default function TrendingProducts({ products }) {
  // Compute dynamic min/max prices from products prop
  const productPrices = products.map(p => Number(p.priceRange?.minVariantPrice?.amount || 0));
  const minPrice = Math.min(...productPrices, 0);
  const maxPrice = Math.max(...productPrices, 0);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [favorites, setFavorites] = useState(new Set());

  const [filters, setFilters] = useState({
    availability: [],
    priceMin: minPrice,
    priceMax: maxPrice,
    colors: [],
    sizes: [],
    tags: []
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const [filterOptions, setFilterOptions] = useState({
    availability: ['In stock', 'Out of stock'],
    colors: [],
    sizes: [],
    tags: []
  });

  const dropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  // Update dynamic filter options when products change
  useEffect(() => {
  const colorsSet = new Set();
  const sizesSet = new Set();
  const tagsSet = new Set();

  products.forEach(product => {
    // Use product.options for colors and sizes
    product.options?.forEach(option => {
      if (option.name?.toLowerCase() === 'color') {
        option.optionValues?.forEach(v => colorsSet.add(v.name));
      }
      if (option.name?.toLowerCase() === 'size') {
        option.optionValues?.forEach(v => sizesSet.add(v.name));
      }
    });

    // Tags
    product.tags?.forEach(tag => tagsSet.add(tag));
  });

  setFilterOptions({
    availability: ['In stock', 'Out of stock'],
    colors: Array.from(colorsSet),
    sizes: Array.from(sizesSet),
    tags: Array.from(tagsSet)
  });
}, [products]);


  useEffect(() => {
    if (activeDropdown) setTempFilters({ ...filters });
  }, [activeDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setActiveDropdown(null);
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) setShowSortDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleFilter = (category, value, isTemp = false) => {
    const targetFilters = isTemp ? tempFilters : filters;
    const setTargetFilters = isTemp ? setTempFilters : setFilters;
    setTargetFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const applyTempFilters = () => {
    setFilters({ ...tempFilters });
    setActiveDropdown(null);
  };

  const clearTempFilters = (category) => {
    if (category === 'price') {
      setTempFilters(prev => ({ ...prev, priceMin: minPrice, priceMax: maxPrice }));
    } else {
      setTempFilters(prev => ({ ...prev, [category]: [] }));
    }
  };

  const clearFilters = () => {
    setFilters({
      availability: [],
      priceMin: minPrice,
      priceMax: maxPrice,
      colors: [],
      sizes: [],
      tags: []
    });
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

 const sortProducts = (products, sortBy) => {
  const sorted = [...products];

  switch (sortBy.toLowerCase()) {
    case 'newest':
      sorted.sort((a, b) => 
        new Date(b.publishedAt || b.updatedAt || b.createdAt) - 
        new Date(a.publishedAt || a.updatedAt || a.createdAt)
      );
    break;
      case 'best selling':
    sorted.sort((a, b) => (b.totalInventorySold || 0) - (a.totalInventorySold || 0));
    break;

    case 'price: low - high':
      sorted.sort((a, b) => {
        const priceA = Number(a.priceRange?.minVariantPrice?.amount || 0);
        const priceB = Number(b.priceRange?.minVariantPrice?.amount || 0);
        return priceA - priceB;
      });
      break;

    case 'price: high - low':
      sorted.sort((a, b) => {
        const priceA = Number(a.priceRange?.maxVariantPrice?.amount || 0);
        const priceB = Number(b.priceRange?.maxVariantPrice?.amount || 0);
        return priceB - priceA;
      });
      break;

    case 'featured':
    default:
      break;
  }

  return sorted;
};



  const filterProducts = (products) => {
    return products.filter(product => {
      // Availability
      if (filters.availability.length > 0) {
        const variants = product?.variants?.nodes || [];
        const inStockVariants = variants[0];
        const isInStock = inStockVariants?.availableForSale !== false;
        if (!filters.availability.some(av => (av === 'In stock' ? isInStock : !isInStock))) return false;
      }

      // Price
      const price = Number(product.priceRange?.minVariantPrice?.amount || 0);
      if (price < filters.priceMin || price > filters.priceMax) return false;

      // Color filter
if (filters.colors.length > 0) {
  const hasColor = product.variants?.nodes?.some(variant =>
    variant.selectedOptions?.some(opt =>
      opt.name?.toLowerCase() === 'color' &&
      filters.colors.includes(opt.value)
    )
  );
  if (!hasColor) return false;
}

// Size filter
if (filters.sizes.length > 0) {
  const hasSize = product.variants?.nodes?.some(variant =>
    variant.selectedOptions?.some(opt =>
      opt.name?.toLowerCase() === 'size' &&
      filters.sizes.includes(opt.value)
    )
  );
  if (!hasSize) return false;
}


      // Tags
      if (filters.tags.length > 0) {
        if (!product.tags?.some(tag => filters.tags.includes(tag))) return false;
      }

      return true;
    });
  };
const filteredProducts = filterProducts(products); 
const sortedProducts = sortProducts(filteredProducts, sortBy);
const showProduct = sortedProducts.slice(0, 8);


  const DesktopDropdown = ({ children, isActive, category }) => (
    <div className={`absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border p-6 w-80 z-50 ${isActive ? 'block' : 'hidden'}`}>
      {children}
      <div className="pt-4 mt-4 border-t flex gap-3">
        <button onClick={() => clearTempFilters(category)} className="text-sm underline text-gray-700">Clear</button>
        <button onClick={applyTempFilters} className="ml-auto px-6 py-2 bg-black text-white rounded-full text-sm font-medium">Apply</button>
      </div>
    </div>
  );

  const MobileFilterContent = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h3 className="text-lg font-semibold">Products filters</h3>
        <button onClick={() => setShowMobileFilters(false)} className="p-1"><X className="w-5 h-5" /></button>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Availability</h4>
        <div className="space-y-2">
          {filterOptions.availability.map(option => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.availability.includes(option)}
                onChange={() => toggleFilter('availability', option)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Price</h4>
        <p className="text-xs text-gray-500 mb-3">${filters.priceMin} - ${filters.priceMax}</p>
        <div className="flex gap-4">
          <input type="number" value={filters.priceMin} onChange={e => setFilters(prev => ({ ...prev, priceMin: Number(e.target.value) }))} className="w-24 px-2 py-1 border rounded" />
          <input type="number" value={filters.priceMax} onChange={e => setFilters(prev => ({ ...prev, priceMax: Number(e.target.value) }))} className="w-24 px-2 py-1 border rounded" />
        </div>
      </div>

      {/* Color */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Color</h4>
        <div className="space-y-2">
          {filterOptions.colors.map(color => (
            <label key={color} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={filters.colors.includes(color)} onChange={() => toggleFilter('colors', color)} className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm text-gray-700">{color}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Size</h4>
        <div className="space-y-2">
          {filterOptions.sizes.map(size => (
            <label key={size} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={filters.sizes.includes(size)} onChange={() => toggleFilter('sizes', size)} className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm text-gray-700">{size}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Tags</h4>
        <div className="space-y-2">
          {filterOptions.tags.map(tag => (
            <label key={tag} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={filters.tags.includes(tag)} onChange={() => toggleFilter('tags', tag)} className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm text-gray-700">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        <button onClick={clearFilters} className="text-sm underline text-gray-700">Clear all</button>
        <button onClick={() => setShowMobileFilters(false)} className="ml-auto px-6 py-2 bg-black text-white rounded-full text-sm font-medium">Apply</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-24 lg:py-30">
      <div className="container mx-auto">
        <div className="mb-12 lg:mb-14">
          <h1 className="text-3xl md:text-4xl !m-0 font-semibold">What's trending now</h1>
          <p className="mt-2 md:mt-3 font-normal block text-base sm:text-xl text-neutral-500">Discover the most trending products in Ciseco.</p>
        </div>
        {/* Desktop Filters Bar */}
        <div className="hidden md:flex items-center border-b border-slate-200 pb-8 gap-3 mb-8 flex-wrap relative" ref={dropdownRef}>
          {/* Availability Filter */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('availability')}
              className="flex items-center gap-2 justify-center px-4 py-2 text-sm rounded-full border focus:outline-none select-none border-neutral-300 text-neutral-700 hover:border-slate-500"
            >
              <CircleDot className="w-4 h-4" />
              Availability
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <DesktopDropdown type="availability" isActive={activeDropdown === 'availability'} category="availability">
              <h4 className="font-medium mb-3">Availability</h4>
              <div className="space-y-2">
                {filterOptions.availability.map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempFilters.availability.includes(option)}
                      onChange={() => toggleFilter('availability', option, true)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </DesktopDropdown>
          </div>

          {/* Price Filter */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('price')}
              className="flex items-center gap-2 justify-center px-4 py-2 text-sm rounded-full border focus:outline-none select-none border-neutral-300 text-neutral-700 hover:border-slate-500"
            >
              <span className="text-lg">$</span>
              Price
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <DesktopDropdown type="price" isActive={activeDropdown === 'price'} category="price">
              <h4 className="font-medium mb-3">Price</h4>
              <p className="text-xs text-gray-500 mb-3">
                ${tempFilters.priceMin} - ${tempFilters.priceMax}
              </p>
              
              <div className="relative h-1 bg-gray-200 rounded-lg">
                {/* Active range highlight */}
                <div
                  className="absolute h-1 bg-cyan-500 rounded-lg"
                  style={{
                    left: `${((tempFilters.priceMin - minPrice) / (maxPrice - minPrice)) * 100}%`,
                    right: `${100 - ((tempFilters.priceMax - minPrice) / (maxPrice - minPrice)) * 100}%`
                  }}
                />
                
                {/* Min range slider */}
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={tempFilters.priceMin}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value <= tempFilters.priceMax) {
                      setTempFilters(prev => ({ ...prev, priceMin: value }));
                    }
                  }}
                  className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                />
                
                {/* Max range slider */}
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={tempFilters.priceMax}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= tempFilters.priceMin) {
                      setTempFilters(prev => ({ ...prev, priceMax: value }));
                    }
                  }}
                  className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                />
              </div>
              
              <div className="flex gap-4 mt-4">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Min price</label>
                  <input
                    type="number"
                    value={tempFilters.priceMin}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value <= tempFilters.priceMax && value >= minPrice) {
                        setTempFilters(prev => ({ ...prev, priceMin: value }));
                      }
                    }}
                    className="w-24 px-3 py-1.5 border rounded text-sm"
                    placeholder={minPrice}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Max price</label>
                  <input
                    type="number"
                    value={tempFilters.priceMax}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= tempFilters.priceMin && value <= maxPrice) {
                        setTempFilters(prev => ({ ...prev, priceMax: value }));
                      }
                    }}
                    className="w-24 px-3 py-1.5 border rounded text-sm"
                    placeholder={maxPrice}
                  />
                </div>
              </div>
            </DesktopDropdown>
          </div>

          {/* Color Filter */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('color')}
              className="flex items-center gap-2 justify-center px-4 py-2 text-sm rounded-full border focus:outline-none select-none border-neutral-300 text-neutral-700 hover:border-slate-500"
            >
              <span className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-blue-400"></span>
              Color
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <DesktopDropdown type="color" isActive={activeDropdown === 'color'} category="colors">
              <h4 className="font-medium mb-3">Color</h4>
              <div className="space-y-2">
                {filterOptions.colors.map(color => (
                  <label key={color} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempFilters.colors.includes(color)}
                      onChange={() => toggleFilter('colors', color, true)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{color}</span>
                  </label>
                ))}
              </div>
            </DesktopDropdown>
          </div>

          {/* Tags Filter */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('tags')}
              className="flex items-center gap-2 justify-center px-4 py-2 text-sm rounded-full border focus:outline-none select-none border-neutral-300 text-neutral-700 hover:border-slate-500"
            >
              <span className="text-sm">⊙</span>
              Tags
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <DesktopDropdown type="tags" isActive={activeDropdown === 'tags'} category="tags">
              <h4 className="font-medium mb-3">Tags</h4>
              <div className="space-y-2">
                {filterOptions.tags.map(tag => (
                  <label key={tag} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempFilters.tags.includes(tag)}
                      onChange={() => toggleFilter('tags', tag, true)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>
            </DesktopDropdown>
          </div>

          {/* Size Filter */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('size')}
              className="flex items-center gap-2 justify-center px-4 py-2 text-sm rounded-full border focus:outline-none select-none border-neutral-300 text-neutral-700 hover:border-slate-500"
            >
              <span className="text-sm">↕</span>
              Size
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <DesktopDropdown type="size" isActive={activeDropdown === 'size'} category="sizes">
              <h4 className="font-medium mb-3">Size</h4>
              <div className="space-y-2">
                {filterOptions.sizes.map(size => (
                  <label key={size} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempFilters.sizes.includes(size)}
                      onChange={() => toggleFilter('sizes', size, true)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{size}</span>
                  </label>
                ))}
              </div>
            </DesktopDropdown>
          </div>
          
          {/* Sort Dropdown */}
          <div className="ml-auto relative" ref={sortDropdownRef}>
              <button 
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex gap-2 items-center cursor-pointer justify-center px-5 py-2.5 text-sm border rounded-full focus:outline-none select-none border-blue-600 bg-blue-50 text-blue-900 font-medium"
              >
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="none"><path d="M11.5166 5.70834L14.0499 8.24168" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11.5166 14.2917V5.70834" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.48327 14.2917L5.94995 11.7583" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.48315 5.70834V14.2917" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10.0001 18.3333C14.6025 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6025 1.66667 10.0001 1.66667C5.39771 1.66667 1.66675 5.39763 1.66675 10C1.66675 14.6024 5.39771 18.3333 10.0001 18.3333Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                <ChevronDown className="w-4 h-4" />
              </button>

              {showSortDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-200 p-4 w-64 z-50">
                  {['Featured', 'Price: Low - High', 'Price: High - Low','Best selling', 'Newest',].map(option => (
                    <label 
                      key={option} 
                      className="flex items-center gap-3 px-5 py-5 text-sm rounded-lg hover:bg-gray-50 cursor-pointer w-full transition-colors"
                    >
                      <input
                        type="radio"
                        name="sort"
                        checked={sortBy === option.toLowerCase()}
                        onChange={() => {
                          setSortBy(option.toLowerCase());
                          setShowSortDropdown(false);
                        }}
                        className="appearance-none w-5 h-5 border-2 border-gray-300 rounded-full cursor-pointer checked:border-blue-500 checked:border-[6px] transition-all"
                      />
                      <span className="flex gap-2 items-center text-sm xl:text-base">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
        </div>

        {/* Mobile Filter/Sort Bar */}
        <div className="md:hidden flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex-1 px-4 py-2.5 border rounded-full flex items-center justify-center gap-2 bg-white"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          <button 
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex-1 px-4 py-2.5 border border-cyan-600 text-cyan-600 rounded-full flex items-center justify-center gap-2 bg-white"
          >
            <CircleDot className="w-4 h-4" />
            Sort
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {showProduct.map(product => (
            <ProductItem key={product.id} product={product} loading="lazy" />
          ))}
        </div>

        {/* Mobile Filter Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white overflow-y-auto">
              <MobileFilterContent />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
