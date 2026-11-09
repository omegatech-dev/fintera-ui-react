// src/component/forms/Search.jsx
import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import debounce from "lodash.debounce";

/**
 * Search Component
 * 
 * Props:
 * - onSearch (function): Callback to execute when the search term changes.
 * - initialValue (string): Initial value of the search input.
 */
function Search({ onSearch, initialValue }) {
  const [term, setTerm] = useState(initialValue || "");

  // Synchronize local term state with initialValue prop
  useEffect(() => {
    setTerm(initialValue || "");
  }, [initialValue]);

  /**
   * Memoized debounced search function
   * 
   * useMemo ensures that the debounced function is not recreated on every render
   */
  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        onSearch(searchTerm.trim());
      }, 500), // 500ms debounce delay
    [onSearch]
  );

  /**
   * Handle input changes
   * 
   * @param {object} e - Event object
   */
  const handleChange = (e) => {
    const value = e.target.value;
    setTerm(value);
    debouncedSearch(value);
  };

  /**
   * Cleanup the debounce on component unmount
   */
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={term}
        onChange={handleChange}
        placeholder="Search by name, email, or others..."
        className="w-full h-14 px-4 pl-12 bg-bgray-100 dark:bg-darkblack-500 rounded-lg border border-transparent focus:border-success-300 focus:outline-hidden focus:ring-0 text-sm text-bgray-600 placeholder:text-sm placeholder:font-medium placeholder:text-bgray-500 dark:text-white"
        aria-label="Search lots"
      />
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          className="stroke-bgray-600 dark:stroke-white"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            cx="8"
            cy="8"
            r="7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.1421 14.1421L19 19"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

Search.propTypes = {
  onSearch: PropTypes.func.isRequired,
  initialValue: PropTypes.string, // Optional prop
};

export default Search;