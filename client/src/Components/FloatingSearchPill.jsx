import PropTypes from "prop-types";
import { useEffect,useRef,useState } from "react";
import { FaFilter, FaSearch, FaTimes } from "react-icons/fa";

const FloatingSearchPill = ({ 
  searchTerm, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange, 
  categories, 
  showFilter = true,
  placeholder = "Search courses...",
  buttonText = "Search Courses",
  className = "",
  // When provided, the pill will only show when the target element is NOT visible in the viewport
  anchorSelector = null,
  // Pixels to delay showing after anchor leaves (positive values show later)
  showOffset = 0,
  // Fallback scroll threshold when no anchorSelector is provided
  scrollThreshold = 400
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    // Prefer IntersectionObserver against an anchor element when provided
    if (anchorSelector) {
      const target = document.querySelector(anchorSelector);
      if (!target) {
        // Fallback to scroll if selector not found
        const handleScroll = () => {
          setIsVisible(window.scrollY > scrollThreshold + showOffset);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          // Show when the anchor is not intersecting (i.e., scrolled out)
          setIsVisible(!entry.isIntersecting);
        },
        {
          root: null,
          rootMargin: `${showOffset}px 0px 0px 0px`,
          threshold: 0.01,
        }
      );
      observerRef.current.observe(target);
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      };
    }

    // Scroll fallback when no anchorSelector is provided
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > scrollThreshold + showOffset;
      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [anchorSelector, showOffset, scrollThreshold]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] transition-all duration-500 ease-in-out transform ${
        isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-20 opacity-0 scale-90 pointer-events-none'
      } ${className}`}
      style={{ maxWidth: isExpanded ? '320px' : 'auto' }}
    >
      <div className={`bg-white/98 dark:bg-gray-800/98 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-blue-200/50 dark:border-blue-700/50 transition-all duration-300 ease-in-out ${
        isExpanded ? 'p-5 w-80' : 'p-3 w-auto'
      }`}>
        
        {!isExpanded ? (
          // Collapsed state - floating search button
          <button
            onClick={toggleExpanded}
            className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white rounded-full hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 transition-all duration-300 hover:scale-110 hover:shadow-2xl shadow-xl group"
          >
            <FaSearch className="text-lg group-hover:scale-110 transition-transform" />
            <span className="font-semibold">{buttonText}</span>
            {(searchTerm || (selectedCategory && selectedCategory !== "All")) && (
              <div className="w-2.5 h-2.5 bg-yellow-300 rounded-full animate-pulse shadow-lg"></div>
            )}
          </button>
        ) : (
          // Expanded state - full search interface
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Search</h3>
              <button
                onClick={toggleExpanded}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                autoFocus
              />
            </div>

            {/* Category Filter */}
            {showFilter && categories && (
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                    appearance-none cursor-pointer text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Button */}
            {(searchTerm || (selectedCategory && selectedCategory !== "All")) && (
              <button
                onClick={() => {
                  onSearchChange("");
                  if (onCategoryChange) onCategoryChange("All");
                }}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg 
                  hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

FloatingSearchPill.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  selectedCategory: PropTypes.string,
  onCategoryChange: PropTypes.func,
  categories: PropTypes.arrayOf(PropTypes.string),
  showFilter: PropTypes.bool,
  placeholder: PropTypes.string,
  buttonText: PropTypes.string,
  className: PropTypes.string,
  anchorSelector: PropTypes.string,
  showOffset: PropTypes.number,
  scrollThreshold: PropTypes.number
};

export default FloatingSearchPill;