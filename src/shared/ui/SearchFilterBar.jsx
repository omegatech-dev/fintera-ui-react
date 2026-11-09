import { useState, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import debounce from "lodash.debounce";

/**
 * Enhanced reusable search and filter bar component with action buttons
 * 
 * Features:
 * - Search input with debouncing
 * - Dropdown filter with customizable options
 * - Optional action buttons (e.g., "Add User", "Export", etc.)
 * - Role-based or dynamic filter options
 * - Fully customizable icons and labels
 * 
 * @param {Object} props
 * @param {string} props.searchTerm - Initial search term
 * @param {string} props.filterValue - Currently selected filter value
 * @param {Array<{value: string, label: string}>} props.filterOptions - Filter dropdown options
 * @param {Function} props.onSearchChange - Callback when search changes
 * @param {Function} props.onFilterChange - Callback when filter changes
 * @param {string} props.searchPlaceholder - Placeholder for search input
 * @param {string} props.filterPlaceholder - Placeholder for filter dropdown
 * @param {number} props.minSearchLength - Minimum characters to trigger search (default: 3)
 * @param {boolean} props.showFilter - Whether to show the filter dropdown (default: true)
 * @param {Array<{label: string, onClick: Function, className?: string, icon?: JSX}>} props.actions - Action buttons to display
 */
function SearchFilterBar({
  searchTerm = "",
  filterValue = "",
  filterOptions = [],
  onSearchChange = () => { },
  onFilterChange = () => { },
  searchPlaceholder = "Search...",
  filterPlaceholder = "Select Filter",
  minSearchLength = 3,
  showFilter = true,
  actions = [],
  customClass = "",
  id = "",
}) {
  const [term, setTerm] = useState(searchTerm);

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilterLabel, setActiveFilterLabel] = useState("");

  // Create debounced search callback
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      if (value.length >= minSearchLength) {
        onSearchChange(value);
      } else {
        onSearchChange("");
      }
    }, 500),
    [onSearchChange, minSearchLength]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle search input change
  const handleTermChange = (e) => {
    const value = e.target.value;
    setTerm(value);
    debouncedSearch(value);
  };

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterDropdown]);

  const handleFilterSelect = (option) => {
    setActiveFilterLabel(option.label);
    setShowFilterDropdown(false);
    onFilterChange(option.value);
  };

  // Sync with external prop changes
  useEffect(() => {
    setTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (filterValue !== undefined && filterValue !== null) {
      const selectedOption = filterOptions.find((opt) => opt.value === filterValue);
      setActiveFilterLabel(selectedOption?.label || filterValue);
    } else {
      setActiveFilterLabel("");
    }
  }, [filterValue, filterOptions]);

  return (
    <div id={id} className={customClass || "bg-white dark:bg-darkblack-600 rounded-xl p-4 mb-8 items-center flex flex-wrap gap-2 shadow-xs border border-gray-100 dark:border-darkblack-500"}>
      {/* Search Input */}
      <div className="flex items-center flex-1 pl-4">
        <span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 21L17 17"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <input
          type="text"
          className="border-0 w-full dark:bg-darkblack-600 dark:text-white focus:outline-hidden focus:ring-0 focus:border-none ml-2 text-sm font-medium"
          placeholder={searchPlaceholder}
          value={term}
          onChange={handleTermChange}
        />
      </div>

      {/* Filter Dropdown */}
      {showFilter && (
        <div ref={dropdownRef} className="relative border-l border-bgray-200 dark:border-darkblack-400 ml-2">
          <button
            type="button"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`flex items-center pl-6 pr-4 h-10 cursor-pointer focus:outline-hidden transition-colors rounded-lg ${showFilterDropdown ? 'bg-gray-50 dark:bg-darkblack-500' : ''}`}
            aria-expanded={showFilterDropdown}
            aria-haspopup="listbox"
            aria-label={filterPlaceholder}
          >
            <span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 4.5H21M6.5 12H17.5M10.5 19.5H13.5"
                  stroke="#94A3B8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="ml-3 text-sm text-bgray-700 dark:text-bgray-300 font-bold tracking-tight">
              {activeFilterLabel || filterPlaceholder}
            </div>
            <span className={`ml-4 transition-transform duration-300 ${showFilterDropdown ? 'rotate-180' : ''}`}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="#94A3B8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>

          {/* Dropdown Menu */}
          <div
            className={`rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] min-w-[220px] bg-white dark:bg-darkblack-500 absolute right-0 z-[60] top-[calc(100%+8px)] border border-gray-100 dark:border-darkblack-400 overflow-hidden transition-all duration-200 origin-top-right ${showFilterDropdown ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              }`}
          >
            <ul className="py-2">
              {filterOptions.map((option) => {
                const isActive = filterValue === option.value;
                return (
                  <li
                    key={option.value}
                    onClick={() => handleFilterSelect(option)}
                    className={`text-sm cursor-pointer px-5 py-2.5 font-bold transition-all duration-200 flex items-center justify-between ${isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-bgray-900 dark:text-bgray-300 hover:bg-gray-50 dark:hover:bg-darkblack-600 hover:pl-6"
                      }`}
                  >
                    {option.label}
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}


      {/* Action Buttons */}
      {actions.map((action, index) => (
        <div key={index} className="pl-4 md:pl-10 flex items-center">
          <button
            aria-label={action.label}
            className={
              action.className ||
              "py-3 px-10 bg-success-300 text-white font-bold rounded-lg hover:bg-success-400 transition-all"
            }
            onClick={action.onClick}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </button>
        </div>
      ))}
    </div>
  );
}

SearchFilterBar.propTypes = {
  searchTerm: PropTypes.string,
  filterValue: PropTypes.string,
  filterOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  onSearchChange: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  searchPlaceholder: PropTypes.string,
  filterPlaceholder: PropTypes.string,
  minSearchLength: PropTypes.number,
  showFilter: PropTypes.bool,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      className: PropTypes.string,
      icon: PropTypes.node,
    })
  ),
  customClass: PropTypes.string,
};

export default SearchFilterBar;
