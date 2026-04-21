import PropTypes from "prop-types";
import { useEffect,useState } from "react";
import { FaFilter,FaSearch } from "react-icons/fa";

const StickySearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange, 
  categories, 
  showFilter = true,
  placeholder = "Search courses...",
  className = ""
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(80);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 200; // Show sticky bar after scrolling past the original search
      const isScrolling = scrollY > 50; // Start animation after 50px
      
      // Dynamic navbar height detection
      const currentNavHeight = scrollY > 20 ? 80 : 96; // Match navbar's dynamic height
      
      setIsVisible(shouldShow);
      setIsScrolled(isScrolling);
      setNavbarHeight(currentNavHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`fixed left-0 right-0 z-40 transition-all duration-500 ease-in-out sticky-search-container ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-full opacity-0'
      } ${className}`}
      style={{
        top: `${navbarHeight}px`,
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)'
      }}
    >
      <div className="bg-white/98 dark:bg-gray-800/98 backdrop-blur-lg border-b border-gray-200/60 dark:border-gray-700/60 shadow-xl sticky-search-fallback">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sticky-search-mobile">
          <div className={`transition-all duration-300 ease-in-out ${
            isScrolled ? 'py-2' : 'py-3'
          }`}>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              {/* Search Bar */}
              <div className={`relative transition-all duration-300 ease-in-out search-hover-effect ${
                isScrolled 
                  ? 'w-full sm:w-72 md:w-80' 
                  : 'w-full sm:w-80 md:w-96'
              }`}>
                <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300 ${
                  isScrolled ? 'text-sm' : 'text-base'
                }`} />
                <input
                  type="text"
                  placeholder={placeholder}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className={`w-full pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                    placeholder-gray-500 dark:placeholder-gray-400 
                    transition-all duration-300 ease-in-out shadow-sm hover:shadow-md search-input ${
                    isScrolled 
                      ? 'py-2 text-sm' 
                      : 'py-2.5 text-sm'
                  }`}
                />
              </div>

              {/* Category Filter */}
              {showFilter && categories && (
                <div className={`relative transition-all duration-300 ease-in-out search-hover-effect ${
                  isScrolled 
                    ? 'w-full sm:w-36' 
                    : 'w-full sm:w-40'
                }`}>
                  <FaFilter className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300 ${
                    isScrolled ? 'text-sm' : 'text-base'
                  }`} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className={`w-full pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                      appearance-none cursor-pointer transition-all duration-300 ease-in-out 
                      shadow-sm hover:shadow-md search-input ${
                      isScrolled 
                        ? 'py-2 text-sm' 
                        : 'py-2.5 text-sm'
                    }`}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Clear Filters Button */}
              {(searchTerm || (selectedCategory && selectedCategory !== "All")) && (
                <button
                  onClick={() => {
                    onSearchChange("");
                    if (onCategoryChange) onCategoryChange("All");
                  }}
                  className={`px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                    font-medium transition-all duration-300 ease-in-out 
                    hover:scale-105 hover:shadow-md whitespace-nowrap search-hover-effect ${
                    isScrolled ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-2'
                  }`}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

StickySearchBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  selectedCategory: PropTypes.string,
  onCategoryChange: PropTypes.func,
  categories: PropTypes.arrayOf(PropTypes.string),
  showFilter: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

export default StickySearchBar;