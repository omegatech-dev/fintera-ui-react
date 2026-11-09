import React, { useState, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import debounce from "lodash.debounce";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "./DatePicker";
import { useLocale } from "@/contexts/LocaleContext";

/**
 * A reusable filter component:
 * - Provides a search input (debounced).
 * - Provides a dropdown of filter options.
 * - Calls parent callbacks on changes.
 *
 * Props:
 *  - searchTerm (string): initial value for search input.
 *  - filterValue (string): the currently selected filter option.
 *  - filterOptions (array): array of string options for the dropdown.
 *  - onSearchChange (func): called when search input changes (debounced).
 *  - onFilterChange (func): called when a filter option is selected.
 *  - searchPlaceholder (string): placeholder text for the search input.
 *  - filterPlaceholder (string): placeholder text for the dropdown input.
 *  - minSearchLength (number): minimum length to trigger onSearchChange (default 3).
 *  - startDate (string): currently selected start date.
 *  - endDate (string): currently selected end date.
 *  - onStartDateChange (func): callback for start date change.
 *  - onEndDateChange (func): callback for end date change.
 */
function GenericFilter({
  searchTerm = "",
  filterValue = "",
  filterOptions = ["All", "Option1", "Option2"],
  onSearchChange = () => { },
  onFilterChange = () => { },
  startDate = "",
  endDate = "",
  onStartDateChange = null,
  onEndDateChange = null,
  searchPlaceholder = "Search...",
  filterPlaceholder = "Select Filter",
  minSearchLength = 3,
  showSearch = true,
}) {
  const [term, setTerm] = useState(searchTerm);
  const [selectedFilter, setSelectedFilter] = useState(filterValue);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilterLabel, setActiveFilterLabel] = useState("");
  const dropdownRef = useRef(null);
  const { t } = useLocale();

  // Debounced callback to notify parent about search changes
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        if (value.length >= minSearchLength) {
          onSearchChange(value);
        } else {
          onSearchChange("");
        }
      }, 500),
    [onSearchChange, minSearchLength]
  );

  // Cleanup on unmount (cancels pending debounced calls)
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle local input changes (search)
  const handleTermChange = (e) => {
    const val = e.target.value;
    setTerm(val);
    debouncedSearch(val);
  };

  // Handle filter selection
  const handleFilterSelect = (option) => {
    const value = typeof option === 'object' ? option.value : option;
    const label = typeof option === 'object' ? option.label : option;

    setSelectedFilter(value);
    setActiveFilterLabel(label);
    onFilterChange(value === "All" ? "" : value);
  };

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // If parent modifies searchTerm externally (e.g. clear button), sync into local term.
  // Do not depend on term: when user types, we must not reset term to stale searchTerm.
  useEffect(() => {
    setTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (filterValue !== selectedFilter) {

      setSelectedFilter(filterValue);
    }

    // Find the label if filterOptions uses objects
    if (filterOptions.length > 0 && typeof filterOptions[0] === 'object') {
      const found = filterOptions.find(o => o.value === filterValue);
      const newLabel = found ? found.label : filterValue || "";
      if (activeFilterLabel !== newLabel) {
        setActiveFilterLabel(newLabel);
      }
    } else {
      if (activeFilterLabel !== (filterValue || "")) {
        setActiveFilterLabel(filterValue || "");
      }
    }
  }, [filterValue, filterOptions, selectedFilter, activeFilterLabel]);

  return (
    <div className="relative w-full z-10">
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 w-full">
        {/* Main Filter Container */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col xl:flex-row items-center gap-3 bg-white/40 dark:bg-darkblack-600/40 backdrop-blur-xl rounded-[2rem] p-2 border border-white/50 dark:border-darkblack-400/50 shadow-2xl shadow-blue-500/5 ring-1 ring-black/5 dark:ring-white/5"
        >
          {showSearch && (
            <div className="flex-1 flex items-center bg-white/60 dark:bg-darkblack-500/60 rounded-2xl px-5 py-3 group focus-within:ring-2 focus-within:ring-blue-500/30 transition-all duration-300 border border-transparent focus-within:border-blue-500/20">
              <motion.span
                animate={term ? { scale: [1, 1.2, 1], color: "#3B82F6" } : { scale: 1, color: "currentColor" }}
                className={`shrink-0 ${term ? "" : "text-slate-400 dark:text-gray-200"}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </motion.span>
              <input
                type="text"
                className="bg-transparent border-0 w-full dark:text-white focus:outline-hidden focus:ring-0 ml-4 text-sm font-semibold placeholder:text-bgray-400"
                placeholder={searchPlaceholder}
                value={term}
                onChange={handleTermChange}
              />
            </div>
          )}

          {/* Date Range Section */}
          {(onStartDateChange || onEndDateChange) && (
            <div className="flex flex-row items-center gap-3 px-2">
              {onStartDateChange && (
                <div className="w-full md:w-44">
                  <DatePicker
                    value={startDate}
                    onChange={onStartDateChange}
                    placeholder={t("common.startDate") || "Start Date"}
                    className="!space-y-0 sleek-datepicker"
                  />
                </div>
              )}
              <div className="h-4 w-[1px] bg-gray-200 dark:bg-darkblack-400 hidden md:block" />
              {onEndDateChange && (
                <div className="w-full md:w-44">
                  <DatePicker
                    value={endDate}
                    onChange={onEndDateChange}
                    placeholder={t("common.endDate") || "End Date"}
                    className="!space-y-0 sleek-datepicker"
                  />
                </div>
              )}
            </div>
          )}

          {/* Filter Dropdown */}
          <div className="relative w-full md:w-auto" ref={dropdownRef}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center justify-between bg-white/80 dark:bg-darkblack-500/80 backdrop-blur-md border ${showFilter ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-100 dark:border-darkblack-400'} rounded-2xl px-5 py-3 cursor-pointer transition-all duration-300 hover:shadow-lg min-w-[180px]`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={showFilter || activeFilterLabel ? 'text-blue-500' : 'text-bgray-400 dark:text-gray-200'}
                >
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                <span className={`text-sm font-bold truncate ${activeFilterLabel ? 'text-bgray-900 dark:text-white' : 'text-bgray-400'}`}>
                  {activeFilterLabel || filterPlaceholder}
                </span>
              </div>
              <motion.svg
                animate={{ rotate: showFilter ? 180 : 0 }}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`ml-3 transition-colors ${showFilter ? 'text-blue-500' : 'text-bgray-400 dark:text-gray-200'}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </motion.svg>
            </motion.div>

            {/* Dropdown list */}
            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="absolute top-full right-0 w-full md:w-64 bg-white/90 dark:bg-darkblack-500/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] mt-3 border border-white/40 dark:border-darkblack-400/40 overflow-hidden"
                >
                  <div className="py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {filterOptions.map((option, idx) => {
                      const value = typeof option === 'object' ? option.value : option;
                      const label = typeof option === 'object' ? option.label : option;
                      const isSelected = selectedFilter === value;

                      return (
                        <motion.li
                          key={idx}
                          whileHover={{ x: 5, backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                          className={`px-5 py-3 text-sm transition-all relative flex items-center justify-between group cursor-pointer ${isSelected ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-bgray-700 dark:text-bgray-300 font-medium'}`}
                          onClick={() => handleFilterSelect(option)}
                        >
                          <span>{label === "No Sort" ? "Default Sort" : label}</span>
                          {isSelected && (
                            <motion.div
                              layoutId="activeFilter"
                              className="w-1.5 h-1.5 rounded-full bg-blue-500"
                            />
                          )}
                        </motion.li>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

GenericFilter.propTypes = {
  searchTerm: PropTypes.string,
  filterValue: PropTypes.string,
  filterOptions: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string
      })
    ])
  ),
  onSearchChange: PropTypes.func,
  onFilterChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  filterPlaceholder: PropTypes.string,
  minSearchLength: PropTypes.number,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  onStartDateChange: PropTypes.func,
  onEndDateChange: PropTypes.func,
  showSearch: PropTypes.bool,
};

export default GenericFilter;