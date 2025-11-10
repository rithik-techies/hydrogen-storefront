import {useLoaderData} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {SearchForm} from '~/components/SearchForm';
import {SearchResults} from '~/components/SearchResults';
import {getEmptyPredictiveSearchResult} from '~/lib/search';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import banner_img_2 from '../assets/ciseco_img_with_text_1.webp';
import Banner from '~/components/Banner';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: `Hydrogen | Search`}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, context}) {
  const url = new URL(request.url);
  const isPredictive = url.searchParams.has('predictive');
  const searchPromise = isPredictive
    ? predictiveSearch({request, context})
    : regularSearch({request, context});

  searchPromise.catch((error) => {
    console.error(error);
    return {term: '', result: null, error: error.message};
  });

  return await searchPromise;
}

/**
 * Renders the /search route
 */
export default function SearchPage() {
  const handleClick = () => alert("Button clicked!");
  /** @type {LoaderReturnData} */
  const {type, term, result, error} = useLoaderData();
  if (type === 'predictive') return null;
 
    const products = result?.items?.products?.nodes || [];
    const productPrices = products.map(p => Number(p.selectedOrFirstAvailableVariant?.price?.amount));
    const minPrice = Math.min(...productPrices, 0);
    const maxPrice = Math.max(...productPrices, 0);
  
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showMobileSortDropdown, setShowMobileSortDropdown] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');
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
    const mobileSortDropdownRef = useRef(null);
  
  
    // Update dynamic filter options when products change
   // 🧠 Smartly sync filters when new search results arrive
useEffect(() => {
  if (!products.length) return;

  // Calculate new min/max prices
  const productPrices = products.map(
    p => Number(p.selectedOrFirstAvailableVariant?.price?.amount || 0)
  );
  const minPrice = Math.min(...productPrices);
  const maxPrice = Math.max(...productPrices);

  // Collect valid filter options from current products
  const colorsSet = new Set();
  const sizesSet = new Set();
  const tagsSet = new Set();

  products.forEach(product => {
    product.variants?.nodes?.forEach(variant => {
      variant.selectedOptions?.forEach(opt => {
        const name = opt.name?.toLowerCase();
        if (name === "color") colorsSet.add(opt.value);
        if (["size", "shoe size", "tamaño"].includes(name)) sizesSet.add(opt.value);
      });
    });
    product.tags?.forEach(tag => tagsSet.add(tag));
  });

  // Helper: keep only still-valid filters
  const keepValid = (values, validSet) =>
    values.filter(v => validSet.has(v));

  setFilters(prev => ({
    ...prev,
    // keep valid color, size, tag filters only
    colors: keepValid(prev.colors, colorsSet),
    sizes: keepValid(prev.sizes, sizesSet),
    tags: keepValid(prev.tags, tagsSet),
    // reset price range to new min/max if old is outside range
    priceMin: Math.max(minPrice, prev.priceMin ?? minPrice),
    priceMax: Math.min(maxPrice, prev.priceMax ?? maxPrice),
  }));

  setTempFilters(prev => ({
    ...prev,
    colors: keepValid(prev.colors, colorsSet),
    sizes: keepValid(prev.sizes, sizesSet),
    tags: keepValid(prev.tags, tagsSet),
    priceMin: Math.max(minPrice, prev.priceMin ?? minPrice),
    priceMax: Math.min(maxPrice, prev.priceMax ?? maxPrice),
  }));

  setFilterOptions({
    availability: ['In stock', 'Out of stock'],
    colors: Array.from(colorsSet),
    sizes: Array.from(sizesSet),
    tags: Array.from(tagsSet),
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
      case 'price: low - high':
        sorted.sort((a, b) => {
          const priceA = Number(a.selectedOrFirstAvailableVariant?.price?.amount || 0);
          const priceB = Number(b.selectedOrFirstAvailableVariant?.price?.amount || 0);
          return priceA - priceB;
        });
        break;
  
      case 'price: high - low':
        sorted.sort((a, b) => {
          const priceA = Number(a.selectedOrFirstAvailableVariant?.price?.amount || 0);
          const priceB = Number(b.selectedOrFirstAvailableVariant?.price?.amount || 0);
          return priceB - priceA;
        });
        break;
  
      case 'relevance':
      default:
        break;
    }
  
    return sorted;
  };
  
  
    const filterProducts = (products) => {
      if (!products?.length) return [];

      return products.filter((product) => {
        const variants = product?.variants?.nodes || [];
        const mainVariant =
          product.selectedOrFirstAvailableVariant ||
          variants[0] ||
          {};

        // ✅ Availability
        if (filters.availability.length > 0) {
          const isInStock = mainVariant?.availableForSale ?? true;
          const matches = filters.availability.some(
            (av) => (av === "In stock" ? isInStock : !isInStock)
          );
          if (!matches) return false;
        }

        // ✅ Price
        const price =
          Number(mainVariant?.price?.amount) ||
          Number(product.priceRange?.minVariantPrice?.amount) ||
          0;

        if (price < filters.priceMin || price > filters.priceMax) return false;

        // ✅ Color
        if (filters.colors.length > 0) {
          const colorMatch =
            variants.some((variant) =>
              variant.selectedOptions?.some(
                (opt) =>
                  opt.name?.toLowerCase() === "color" &&
                  filters.colors.includes(opt.value)
              )
            ) ||
            mainVariant.selectedOptions?.some(
              (opt) =>
                opt.name?.toLowerCase() === "color" &&
                filters.colors.includes(opt.value)
            );

          if (!colorMatch) return false;
        }

        // ✅ Size
        if (filters.sizes.length > 0) {
          const sizeMatch =
            variants.some((variant) =>
              variant.selectedOptions?.some((opt) => {
                const optName = opt.name?.toLowerCase();
                return (
                  ["size", "shoe size", "tamaño"].includes(optName) &&
                  filters.sizes.includes(opt.value)
                );
              })
            ) ||
            mainVariant.selectedOptions?.some((opt) => {
              const optName = opt.name?.toLowerCase();
              return (
                ["size", "shoe size", "tamaño"].includes(optName) &&
                filters.sizes.includes(opt.value)
              );
            });

          if (!sizeMatch) return false;
        }

        // ✅ Tags
        if (filters.tags.length > 0) {
          if (!product.tags?.some((tag) => filters.tags.includes(tag)))
            return false;
        }

        return true;
      });
    };
  const filteredProducts = filterProducts(products); 
  const sortedProducts = sortProducts(filteredProducts, sortBy);  
  
    const DesktopDropdown = ({ children, isActive, category }) => (
      <div className={`absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border p-6 w-80 z-50 ${isActive ? 'block ' : 'hidden'}`}>
        {children}
        <div className="pt-4 mt-4 border-t flex gap-3">
          <button onClick={() => clearTempFilters(category)} className="text-sm underline text-gray-700">Clear</button>
          <button onClick={applyTempFilters} className="ml-auto px-6 py-2 bg-black text-white rounded-full text-sm font-medium">Apply</button>
        </div>
      </div>
    );
  
   const MobileFilterContent = () => (
        <div className="inline-block h-screen w-full max-w-4xl p-2 lg:p-10">
          <div className="inline-flex flex-col w-full text-left align-middle transition-all transform bg-white h-full rounded-2xl">
            <div className="relative flex-shrink-0 px-6 py-5 border-b text-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Products filters</h3>
            <span className='absolute start-5 top-1/2 -translate-y-1/2'>
            <button onClick={() => setShowMobileFilters(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700  focus:outline-none"><X className="w-5 h-5" /></button>
            </span>
          </div>
          
  
          {/* Availability */}
          <div className='flex-grow overflow-y-auto scrollbar-hidden'>
          <div className="px-6 sm:px-8 divide-y ">
            <div className='py-8'>
            <h4 className="text-xl font-medium">Availability</h4>
            <div className="mt-7 relative">
              <div className='grid sm:grid-cols-2 gap-4 md:gap-x-8 md:gap-y-5'>
              {filterOptions.availability.map(option => (
                <label key={option} className="flex text-sm xl:text-base ">
                  <input
                    type="checkbox"
                    checked={filters.availability.includes(option)}
                    onChange={() => toggleFilter('availability', option)}
                    className="focus:ring-action-primary text-primary-500 rounded border-slate-400/80 hover:border-slate-700 bg-transparent dark:border-slate-700 dark:hover:border-slate-500 dark:checked:bg-primary-500 focus:ring-primary-500 w-6 h-6"
                  />
                  <span className="pl-2.5 sm:pl-3.5 flex flex-col flex-1 justify-center select-none text-sm xl:text-base">{option}</span>
                </label>
              ))}
              </div>
            </div>
            </div>      
          
    
          {/* Price */}
          <div className="py-8">
            <h4 className="text-xl font-medium">Price</h4>
            <p className="text-xs text-gray-500 mb-3">${filters.priceMin} - ${filters.priceMax}</p>
            <div className="flex justify-between gap-4 md:gap-x-8 pt-1">
              <div className='flex-1'>
                <label for="minPrice" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Min price</label>
            <div className='mt-1 relative rounded-md'> 
               <input type="number" value={filters.priceMin} onChange={e => setFilters(prev => ({ ...prev, priceMin: Number(e.target.value) }))} className="block w-full !border-neutral-200 hover:ring hover:ring-blue-200/50 !focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white disabled:bg-neutral-200 rounded-2xl text-sm font-normal h-11 px-4 py-3 block min-w-32 ps-7 pe-4 sm:text-sm !border-neutral-200 dark:border-neutral-700 rounded-lg bg-transparent" />
              </div></div>
              <div className='flex-1'>
                <label for="maxPrice" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Max price</label>
            <div className='mt-1 relative rounded-md'>
              <input type="number" value={filters.priceMax} onChange={e => setFilters(prev => ({ ...prev, priceMax: Number(e.target.value) }))} className="block w-full !border-neutral-200 hover:ring hover:ring-blue-200/50 !focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white disabled:bg-neutral-200 rounded-2xl text-sm font-normal h-11 px-4 py-3 block min-w-32 ps-7 pe-4 sm:text-sm !border-neutral-200 dark:border-neutral-700 rounded-lg bg-transparent" />
           </div>
           </div>
            </div>
          </div>
    
          {/* Color */}
          <div className="py-8">
            <h4 className="text-xl font-medium">Color</h4>
            <div className="mt-7 relative">
              <div className='grid sm:grid-cols-2 gap-4 md:gap-x-8 md:gap-y-5'>
              {filterOptions.colors.map(color => (
                <label key={color} className="flex text-sm xl:text-base ">
                  <input type="checkbox" checked={filters.colors.includes(color)} onChange={() => toggleFilter('colors', color)} className="focus:ring-action-primary text-primary-500 rounded border-slate-400/80 hover:border-slate-700 bg-transparent dark:border-slate-700 dark:hover:border-slate-500 dark:checked:bg-primary-500 focus:ring-primary-500 w-6 h-6" />
                  <span className="pl-2.5 sm:pl-3.5 flex flex-col flex-1 justify-center select-none text-sm xl:text-base">{color}</span>
                </label>
              ))}
              </div>
            </div>
          </div>
    
          {/* Size */}
          <div className="py-8">
            <h4 className="text-xl font-medium">Size</h4>
            <div className="mt-7 relative">
             <div className='grid sm:grid-cols-2 gap-4 md:gap-x-8 md:gap-y-5'>
              {filterOptions.sizes.map(size => (
                <label key={size} className="flex text-sm xl:text-base ">
                  <input type="checkbox" checked={filters.sizes.includes(size)} onChange={() => toggleFilter('sizes', size)} className="focus:ring-action-primary text-primary-500 rounded border-slate-400/80 hover:border-slate-700 bg-transparent dark:border-slate-700 dark:hover:border-slate-500 dark:checked:bg-primary-500 focus:ring-primary-500 w-6 h-6" />
                  <span className="pl-2.5 sm:pl-3.5 flex flex-col flex-1 justify-center select-none text-sm xl:text-base">{size}</span>
                </label>
              ))}
            </div>
            </div>
          </div>
    
          {/* Tags */}
          <div className="py-8">
            <h4 className="text-xl font-medium">Tags</h4>
            <div className="mt-7 relative">
             <div className='grid sm:grid-cols-2 gap-4 md:gap-x-8 md:gap-y-5'>
              {filterOptions.tags.map(tag => (
                <label key={tag} className="flex text-sm xl:text-base ">
                  <input type="checkbox" checked={filters.tags.includes(tag)} onChange={() => toggleFilter('tags', tag)} className="focus:ring-action-primary text-primary-500 rounded border-slate-400/80 hover:border-slate-700 bg-transparent dark:border-slate-700 dark:hover:border-slate-500 dark:checked:bg-primary-500 focus:ring-primary-500 w-6 h-6" />
                  <span className="pl-2.5 sm:pl-3.5 flex flex-col flex-1 justify-center select-none text-sm xl:text-base">{tag}</span>
                </label>
              ))}
            </div>
            </div>
          </div>
          </div>
           </div>
    
          <div className="p-6 ps-4 flex-shrink-0 border-t flex items-center justify-between">
            <button onClick={clearFilters} className="relative h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium px-4 py-2.5 sm:px-4  ttnc-ButtonThird text-neutral-700 hover:bg-neutral-100/90 !rounded-lg underline disabled:cursor-not-allowed disabled:text-neutral-400 focus:!ring-0 focus:!outline-none focus:!ring-offset-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 dark:focus:ring-offset-0">Clear all</button>
            <button onClick={() => setShowMobileFilters(false)} className="relative h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium px-4 py-2.5 sm:px-5 md:px-8  bg-slate-900 text-slate-50 shadow-xl hover:bg-slate-800 disabled:bg-opacity-90  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 dark:focus:ring-offset-0">Apply</button>
          </div>
        </div>
        </div>
      );
  
    const SortingFunction =() =>(
      <div className="ml-auto relative" ref={sortDropdownRef}>
          <button 
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex gap-2 items-center cursor-pointer justify-center px-5 py-2.5 text-sm border rounded-full focus:outline-none select-none border-blue-600 bg-blue-50 text-blue-900 font-medium"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="none"><path d="M11.5166 5.70834L14.0499 8.24168" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11.5166 14.2917V5.70834" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.48327 14.2917L5.94995 11.7583" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.48315 5.70834V14.2917" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10.0001 18.3333C14.6025 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6025 1.66667 10.0001 1.66667C5.39771 1.66667 1.66675 5.39763 1.66675 10C1.66675 14.6024 5.39771 18.3333 10.0001 18.3333Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            <ChevronDown className="w-4 h-4" />
          </button>
  
          {showSortDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-200 p-4 w-64 z-50">
              {['Relevance', 'Price: Low - High', 'Price: High - Low'].map(option => (
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
    )
    const MobileSortingFunction =() =>(
      <div className="ml-auto relative" ref={mobileSortDropdownRef}>
          <button 
            onClick={() => setShowMobileSortDropdown(!showMobileSortDropdown)}
            className="flex gap-2 items-center cursor-pointer justify-center px-5 py-2.5 text-sm border rounded-full focus:outline-none select-none border-blue-600 bg-blue-50 text-blue-900 font-medium"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="none"><path d="M11.5166 5.70834L14.0499 8.24168" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11.5166 14.2917V5.70834" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.48327 14.2917L5.94995 11.7583" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.48315 5.70834V14.2917" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10.0001 18.3333C14.6025 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6025 1.66667 10.0001 1.66667C5.39771 1.66667 1.66675 5.39763 1.66675 10C1.66675 14.6024 5.39771 18.3333 10.0001 18.3333Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            <ChevronDown className="w-4 h-4" />
          </button>
  
          {showMobileSortDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-200 p-4 w-64 z-50">
              {['Relevance', 'Price: Low - High', 'Price: High - Low'].map(option => (
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
                      setShowMobileSortDropdown(false);
                    }}
                    className="appearance-none w-5 h-5 border-2 border-gray-300 rounded-full cursor-pointer checked:border-blue-500 checked:border-[6px] transition-all"
                  />
                  <span className="flex gap-2 items-center text-sm xl:text-base">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>
    )

  return (
    <div className="search pb-20 lg:pb-28 xl:pb-32">
  <div className="nc-HeadBackgroundCommon h-24 2xl:h-28 top-0 left-0 right-0 w-full bg-[#f0f9ff] dark:bg-neutral-800/20"></div>
  <div className='space-y-20 sm:space-y-24 lg:space-y-28'>
      <div className='container'>
        <div className='max-w-2xl mx-auto relative -mt-9 flex flex-col'>
        <SearchForm>
        {({inputRef}) => (
          <>
            <input
              defaultValue={term}
              name="q"
              placeholder="Type your keywords"
              ref={inputRef}
              type="search"
              className='block w-full border-neutral-200 hover:ring hover:ring-blue-200/50 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white disabled:bg-neutral-200 rounded-full text-sm font-normal pl-14 py-5 pr-5 md:pl-16 shadow-lg border-0 dark:border'
            />
            &nbsp;
            <button className='flex items-center justify-center rounded-full bg-slate-900 !leading-none text-slate-50 hover:bg-slate-800 
                disabled:bg-opacity-70 absolute right-2.5 top-[35%] transform -translate-y-1/2  w-11 h-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:focus:ring-offset-0' type="submit"><ArrowRight/></button>
            <span className="absolute left-5 top-[35%] transform -translate-y-1/2 text-2xl md:left-6"><svg className="w-5 h-5" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M22 22L20 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
          </>
        )}
      </SearchForm>
      </div>
      </div>

         {result?.total > 0 && (
         <div className='container'>
            <div className="hidden lg:flex items-centerborder-b border-slate-200 pb-8 gap-3 mb-8 flex-wrap relative" ref={dropdownRef}>
                          {/* Availability Filter */}
                          <div className="relative">
                            <button 
                              onClick={() => toggleDropdown('availability')}
                               className={`relative flex gap-2 items-center justify-center ps-4 pe-3.5 py-2 text-sm rounded-full border focus:outline-none select-none  transition-colors duration-200
                                ${
                                  activeDropdown === 'availability'
                                    ? 'bg-blue-100 border-blue-600 text-blue-900'
                                    : 'bg-primary-50 text-primary-900'
                                }`}
                            >
                              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.63 14.75C21.63 15.64 21.39 16.48 20.95 17.2C20.13 18.57 18.62 19.5 16.88 19.5C15.94 19.5 15.06 19.22 14.32 18.73C13.7 18.35 13.19 17.82 12.82 17.2C12.38 16.48 12.13 15.64 12.13 14.75C12.13 12.13 14.26 10 16.88 10C17.24 10 17.59 10.04 17.92 10.12C20.05 10.59 21.63 12.49 21.63 14.75Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15.03 14.75L16.2 15.92L18.73 13.58" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M20.6901 4.01999V6.23999C20.6901 7.04999 20.1801 8.06001 19.6801 8.57001L17.92 10.12C17.59 10.04 17.2401 10 16.8801 10C14.2601 10 12.1301 12.13 12.1301 14.75C12.1301 15.64 12.3801 16.48 12.8201 17.2C13.1901 17.82 13.7001 18.35 14.3201 18.73V19.07C14.3201 19.68 13.92 20.49 13.41 20.79L12.0001 21.7C10.6901 22.51 8.87006 21.6 8.87006 19.98V14.63C8.87006 13.92 8.46006 13.01 8.06006 12.51L4.22003 8.47C3.72003 7.96 3.31006 7.05001 3.31006 6.45001V4.12C3.31006 2.91 4.22008 2 5.33008 2H18.67C19.78 2 20.6901 2.90999 20.6901 4.01999Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                              Availability
                              <ChevronDown className={`w-4 h-4 ${ activeDropdown === 'availability'? 'text-blue-900':'text-gray-400'}`} />
                            </button>
                            <DesktopDropdown type="availability" isActive={activeDropdown === 'availability'} category="availability">
                             <div className="relative flex flex-col px-5 py-6 space-y-5 max-h-96 overflow-auto scrollbar-hidden">
                                {filterOptions.availability.map(option => (
                                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={tempFilters.availability.includes(option)}
                                      onChange={() => toggleFilter('availability', option, true)}
                                      className="focus:ring-action-primary text-primary-500 rounded border-slate-400/80 hover:border-slate-700 bg-transparent dark:border-slate-700 dark:hover:border-slate-500 dark:checked:bg-primary-500 focus:ring-primary-500 w-6 h-6"
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
                               className={`relative flex gap-2 items-center justify-center ps-4 pe-3.5 py-2 text-sm rounded-full border focus:outline-none select-none  transition-colors duration-200
                                        ${
                                          activeDropdown === 'price'
                                            ? 'bg-blue-100 border-blue-600 text-blue-900'
                                            : 'bg-primary-50 text-primary-900'
                                        }`}
                            >
                             <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.67188 14.3298C8.67188 15.6198 9.66188 16.6598 10.8919 16.6598H13.4019C14.4719 16.6598 15.3419 15.7498 15.3419 14.6298C15.3419 13.4098 14.8119 12.9798 14.0219 12.6998L9.99187 11.2998C9.20187 11.0198 8.67188 10.5898 8.67188 9.36984C8.67188 8.24984 9.54187 7.33984 10.6119 7.33984H13.1219C14.3519 7.33984 15.3419 8.37984 15.3419 9.66984" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 6V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                              Price
                              <ChevronDown className={`w-4 h-4 ${ activeDropdown === 'price'? 'text-blue-900':'text-gray-400'}`} />
                            </button>
                            <DesktopDropdown type="price" isActive={activeDropdown === 'price'} category="price">
                              <p className="text-xs text-gray-500 mb-3">
                                The Max Price is {tempFilters.priceMax}
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
                           className={`relative flex gap-2 items-center justify-center ps-4 pe-3.5 py-2 text-sm rounded-full border focus:outline-none select-none  transition-colors duration-200
                                  ${
                                    activeDropdown === 'color'
                                      ? 'bg-blue-100 border-blue-600 text-blue-900'
                                      : 'bg-primary-50 text-primary-900'
                                  }`}
                        >
                          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.01 18.0001L3 13.9901C1.66 12.6501 1.66 11.32 3 9.98004L9.68 3.30005L17.03 10.6501C17.4 11.0201 17.4 11.6201 17.03 11.9901L11.01 18.0101C9.69 19.3301 8.35 19.3301 7.01 18.0001Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M8.35 1.94995L9.69 3.28992" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M2.07 11.92L17.19 11.26" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M3 22H16" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M18.85 15C18.85 15 17 17.01 17 18.24C17 19.26 17.83 20.09 18.85 20.09C19.87 20.09 20.7 19.26 20.7 18.24C20.7 17.01 18.85 15 18.85 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                          Color
                          <ChevronDown className={`w-4 h-4 ${ activeDropdown === 'color'? 'text-blue-900':'text-gray-400'}`} />
                        </button>
      
                        <DesktopDropdown type="color" isActive={activeDropdown === 'color'} category="colors">
                          <div className="relative flex flex-col px-5 py-6 space-y-5 max-h-96 overflow-auto scrollbar-hidden">
                            {filterOptions.colors?.length > 0 ? (
                              filterOptions.colors.map(color => (
                                <label key={color} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={tempFilters.colors.includes(color)}
                                    onChange={() => toggleFilter('colors', color, true)}
                                    className="focus:ring-action-primary text-primary-500 rounded border-slate-400/80 hover:border-slate-700 bg-transparent dark:border-slate-700 dark:hover:border-slate-500 dark:checked:bg-primary-500 focus:ring-primary-500 w-6 h-6"
                                  />
                                  <span className="text-sm text-gray-700">{color}</span>
                                </label>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-4">No color options available</p>
                            )}
                          </div>
                        </DesktopDropdown>
                      </div>
      
                
                          {/* Tags Filter */}
                          <div className="relative">
                            <button 
                              onClick={() => toggleDropdown('tags')}
                               className={`relative flex gap-2 items-center justify-center ps-4 pe-3.5 py-2 text-sm rounded-full border focus:outline-none select-none  transition-colors duration-200
                                        ${
                                          activeDropdown === 'tags'
                                            ? 'bg-blue-100 border-blue-600 text-blue-900'
                                            : 'bg-primary-50 text-primary-900'
                                        }`}
                            >
                             <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.16989 15.3L8.69989 19.83C10.5599 21.69 13.5799 21.69 15.4499 19.83L19.8399 15.44C21.6999 13.58 21.6999 10.56 19.8399 8.69005L15.2999 4.17005C14.3499 3.22005 13.0399 2.71005 11.6999 2.78005L6.69989 3.02005C4.69989 3.11005 3.10989 4.70005 3.00989 6.69005L2.76989 11.69C2.70989 13.04 3.21989 14.35 4.16989 15.3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.5 12C10.8807 12 12 10.8807 12 9.5C12 8.11929 10.8807 7 9.5 7C8.11929 7 7 8.11929 7 9.5C7 10.8807 8.11929 12 9.5 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>
                              Tags
                              <ChevronDown className={`w-4 h-4 ${ activeDropdown === 'tags'? 'text-blue-900':'text-gray-400'}`} />
                            </button>
                            <DesktopDropdown type="tags" isActive={activeDropdown === 'tags'} category="tags">
                              <div className="relative flex flex-col px-5 py-6 space-y-5 max-h-96 overflow-auto scrollbar-hidden">
                                {filterOptions.tags?.length > 0 ? (
                                filterOptions.tags.map(tag => (
                                  <label key={tag} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={tempFilters.tags.includes(tag)}
                                      onChange={() => toggleFilter('tags', tag, true)}
                                      className="focus:ring-action-primary text-primary-500 rounded border-slate-400/80 hover:border-slate-700 bg-transparent dark:border-slate-700 dark:hover:border-slate-500 dark:checked:bg-primary-500 focus:ring-primary-500 w-6 h-6"
                                    />
                                    <span className="text-sm text-gray-700">{tag}</span>
                                  </label>
                                ))
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-4">No tags options available</p>
                            )}
                              </div>
                            </DesktopDropdown>
                          </div>
                
                          {/* Size Filter */}
                          <div className="relative">
                            <button 
                              onClick={() => toggleDropdown('size')}
                               className={`relative flex gap-2 items-center justify-center ps-4 pe-3.5 py-2 text-sm rounded-full border focus:outline-none select-none  transition-colors duration-200
                                    ${
                                      activeDropdown === 'size'
                                        ? 'bg-blue-100 text-blue-900 border-blue-600'
                                        : 'bg-primary-50 text-primary-900'
                                    }`}
                            >
                              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 9V3H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 15V21H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 3L13.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10.5 13.5L3 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                              Size
                              <ChevronDown className={`w-4 h-4 ${ activeDropdown === 'size'? 'text-blue-900':'text-gray-400'}`} />
                            </button>
                            <DesktopDropdown type="size" isActive={activeDropdown === 'size'} category="sizes">
                              <div className="relative flex flex-col px-5 py-6 space-y-5 max-h-96 overflow-auto scrollbar-hidden">
                                {filterOptions.sizes?.length > 0 ? (
                                filterOptions.sizes.map(size => (
                                  <label key={size} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={tempFilters.sizes.includes(size)}
                                      onChange={() => toggleFilter('sizes', size, true)}
                                      className="focus:ring-action-primary text-primary-500 rounded border-slate-400/80 hover:border-slate-700 bg-transparent dark:border-slate-700 dark:hover:border-slate-500 dark:checked:bg-primary-500 focus:ring-primary-500 w-6 h-6"
                                    />
                                    <span className="text-sm text-gray-700">{size}</span>
                                  </label>
                                 ))
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-4">No Size options available</p>
                            )}
                              </div>
                            </DesktopDropdown>
                          </div>
                          <SortingFunction/>
                        </div>
                
              {/* Mobile Filter/Sort Bar */}
            <div className="lg:hidden flex items-center justify-between gap-3 mb-6">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="relative flex gap-2 items-center justify-center px-4 py-2 text-sm rounded-full focus:outline-none select-none border border-neutral-300 text-neutral-700 hover:border-neutral-500 focus:border-neutral-500"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 6.5H16" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M6 6.5H2" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10 10C11.933 10 13.5 8.433 13.5 6.5C13.5 4.567 11.933 3 10 3C8.067 3 6.5 4.567 6.5 6.5C6.5 8.433 8.067 10 10 10Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M22 17.5H18" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 17.5H2" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M14 21C15.933 21 17.5 19.433 17.5 17.5C17.5 15.567 15.933 14 14 14C12.067 14 10.5 15.567 10.5 17.5C10.5 19.433 12.067 21 14 21Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                Filters
              </button>
              <MobileSortingFunction/>
            </div>
         </div>)}
      {/* {error && <p style={{color: 'red'}}>{error}</p>} */}
          {!term || !result?.total ? (
            <div className='container'>
        <SearchResults.Empty />
        </div>
      ) : (
        <SearchResults
          result={{
            ...result,
            items: {
              ...result.items,
              products: {
                ...result.items.products,
                nodes: sortedProducts || [], // ✅ inject sorted/filtered products
              },
            },
          }}
          term={term}
        >
          {({products, term}) => (
            <div>
              <SearchResults.Products products={products} term={term} />
            </div>
          )}
        </SearchResults>
      )}
      <Analytics.SearchView data={{searchTerm: term, searchResults: result}} />
    </div>
    <Banner
            heading="Earn free money with Ciseco"
            description="With Ciseco you will get a freeship & savings combo, etc."
            buttonText="Discover more"
            imageUrl={banner_img_2}
            imageAlt="Kid with skateboard"
            onButtonClick={handleClick}
            imagePosition="right"
            background_color="white"
            buttonText_2="Saving combo"
          />
    </div>
  );
}

/**
 * Regular search query and fragments
 * (adjust as needed)
 */
const SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment SearchProduct on Product {
    __typename
    handle
    id
    publishedAt
    title
    trackingParameters
    vendor
    options {
      name
      values
    }
    variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        image {
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
      product {
        handle
        title
      }
    }
  }
`;

const SEARCH_PAGE_FRAGMENT = `#graphql
  fragment SearchPage on Page {
     __typename
     handle
    id
    title
    trackingParameters
  }
`;

const SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment SearchArticle on Article {
    __typename
    handle
    id
    title
    trackingParameters
  }
`;

const PAGE_INFO_FRAGMENT = `#graphql
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/search
export const SEARCH_QUERY = `#graphql
  query RegularSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $term: String!
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    articles: search(
      query: $term,
      types: [ARTICLE],
      first: $first,
    ) {
      nodes {
        ...on Article {
          ...SearchArticle
        }
      }
    }
    pages: search(
      query: $term,
      types: [PAGE],
      first: $first,
    ) {
      nodes {
        ...on Page {
          ...SearchPage
        }
      }
    }
    products: search(
      after: $endCursor,
      before: $startCursor,
      first: $first,
      last: $last,
      query: $term,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: HIDE,
    ) {
      nodes {
        ...on Product {
          ...SearchProduct
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
  ${SEARCH_PAGE_FRAGMENT}
  ${SEARCH_ARTICLE_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
`;

/**
 * Regular search fetcher
 * @param {Pick<
 *   LoaderFunctionArgs,
 *   'request' | 'context'
 * >}
 * @return {Promise<RegularSearchReturn>}
 */
async function regularSearch({request, context}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const variables = getPaginationVariables(request, {pageBy: 8});
  const term = String(url.searchParams.get('q') || '');

  // Search articles, pages, and products for the `q` term
  const {errors, ...items} = await storefront.query(SEARCH_QUERY, {
    variables: {...variables, term},
  });

  if (!items) {
    throw new Error('No search data returned from Shopify API');
  }

  const total = Object.values(items).reduce(
    (acc, {nodes}) => acc + nodes.length,
    0,
  );

  const error = errors
    ? errors.map(({message}) => message).join(', ')
    : undefined;

  return {type: 'regular', term, error, result: {total, items}};
}

/**
 * Predictive search query and fragments
 * (adjust as needed)
 */
const PREDICTIVE_SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment PredictiveArticle on Article {
    __typename
    id
    title
    handle
    blog {
      handle
    }
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_COLLECTION_FRAGMENT = `#graphql
  fragment PredictiveCollection on Collection {
    __typename
    id
    title
    handle
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_PAGE_FRAGMENT = `#graphql
  fragment PredictivePage on Page {
    __typename
    id
    title
    handle
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment PredictiveProduct on Product {
    __typename
    id
    title
    handle
    trackingParameters
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
         options {
      name
      optionValues {
        name
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    variants(first: 250) {
      nodes {
        id
        title
        availableForSale
        selectedOptions {
          name
          value
        }
        image {
          url
          altText
        }
        price {
          amount
          currencyCode
        }
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    }
  }
`;

const PREDICTIVE_SEARCH_QUERY_FRAGMENT = `#graphql
  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch
const PREDICTIVE_SEARCH_QUERY = `#graphql
  query PredictiveSearch(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $term: String!
    $types: [PredictiveSearchType!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: $limitScope,
      query: $term,
      types: $types,
    ) {
      articles {
        ...PredictiveArticle
      }
      collections {
        ...PredictiveCollection
      }
      pages {
        ...PredictivePage
      }
      products {
        ...PredictiveProduct
      }
      queries {
        ...PredictiveQuery
      }
    }
  }
  ${PREDICTIVE_SEARCH_ARTICLE_FRAGMENT}
  ${PREDICTIVE_SEARCH_COLLECTION_FRAGMENT}
  ${PREDICTIVE_SEARCH_PAGE_FRAGMENT}
  ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
  ${PREDICTIVE_SEARCH_QUERY_FRAGMENT}
`;

/**
 * Predictive search fetcher
 * @param {Pick<
 *   ActionFunctionArgs,
 *   'request' | 'context'
 * >}
 * @return {Promise<PredictiveSearchReturn>}
 */
async function predictiveSearch({request, context}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || 10);
  const type = 'predictive';

  if (!term) return {type, term, result: getEmptyPredictiveSearchResult()};

  // Predictively search articles, collections, pages, products, and queries (suggestions)
  const {predictiveSearch: items, errors} = await storefront.query(
    PREDICTIVE_SEARCH_QUERY,
    {
      variables: {
        // customize search options as needed
        limit,
        limitScope: 'EACH',
        term,
      },
    },
  );

  if (errors) {
    throw new Error(
      `Shopify API errors: ${errors.map(({message}) => message).join(', ')}`,
    );
  }

  if (!items) {
    throw new Error('No predictive search data returned from Shopify API');
  }

  const total = Object.values(items).reduce(
    (acc, item) => acc + item.length,
    0,
  );

  return {type, term, result: {items, total}};
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('~/lib/search').RegularSearchReturn} RegularSearchReturn */
/** @typedef {import('~/lib/search').PredictiveSearchReturn} PredictiveSearchReturn */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
