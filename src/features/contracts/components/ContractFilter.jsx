import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import debounce from 'lodash.debounce';
import { formatStatus } from "../../../shared/utils/formatStatus";
import { useLocale } from "../../../contexts/LocaleContext";

function ContractFilter({ searchTerm, status, onSearchChange, onStatusChange }) {
  const [showFilter, setShowFilter] = useState(false);
  const [term, setTerm] = useState(searchTerm);
  const { t } = useLocale();

  // Derive activeFilter during render
  const activeFilter = status ? formatStatus(status, t) : t('filters.all');
  // Contract status options: pending, approved, rejected, closed (cancelled no longer used)
  const statuses = [
    { value: "" },
    { value: "pending" },
    { value: "approved" },
    { value: "rejected" },
    { value: "closed" },
  ];

  const handleTermChange = (e) => {
    setTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleStatusSelect = (statusValue) => {
    // setSelectedStatus(statusValue);
    onStatusChange(statusValue); // Update parent with selected status (empty = all)
  };

  // Create a debounced version of onSearchChange
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        if (value.length >= 2) {
          onSearchChange(value);
        } else {
          onSearchChange(""); // Reset search if term is less than 2 characters
        }
      }, 500), // 500ms delay
    [onSearchChange]
  );

  // Cleanup the debounced function on component unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="bg-white dark:bg-darkblack-600 rounded-lg p-4 mb-8 items-center flex">
      <div className="flex items-center flex-1 pl-4 xl:border-r border-bgray-400 dark:border-darkblack-400">
        <span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 21L17 17"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <input
          type="text"
          className="border-0 w-full dark:bg-darkblack-600 dark:text-white focus:outline-hidden focus:ring-0 focus:border-none"
          placeholder={t('filters.contractSearchPlaceholder')}
          value={term}
          onChange={handleTermChange}
        />
      </div>
      <div className="relative">
        <div
          onClick={() => {
            setShowFilter(!showFilter);
          }}
          className="items-center pl-9 border-r border-bgray-400 dark:border-darkblack-400 xl:flex hidden cursor-pointer"
        >
          <span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <input
            type="text"
            className="border-0 dark:bg-darkblack-600 focus:outline-hidden focus:ring-0 focus:border-none"
            placeholder={t('filters.contractStatusPlaceholder')}
            value={activeFilter ? activeFilter : ""}
            readOnly
          />
          <span className="pr-10">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        <div
          id="contractStatusFilter"
          className={`rounded-lg shadow-lg w-full bg-white dark:bg-darkblack-500 absolute right-0 z-10 top-full overflow-hidden ${showFilter ? "block" : "hidden"
            }`}
        >
          <ul>
            {statuses.map((statusOption) => (
              <li
                key={statusOption.value !== undefined ? statusOption.value : statusOption.label}
                onClick={() => {
                  setShowFilter(false);
                  handleStatusSelect(statusOption.value);
                }}
                className="text-sm text-bgray-900 dark:text-bgray-50 hover:dark:bg-darkblack-600 cursor-pointer px-5 py-2 hover:bg-bgray-100 font-semibold"
              >
                {formatStatus(statusOption.value, t)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pl-8 md:block hidden">
        <button aria-label="Filter options">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.49999 1H14.5C14.644 1.05051 14.7745 1.13331 14.8816 1.24206C14.9887 1.35082 15.0695 1.48264 15.1177 1.62742C15.166 1.77221 15.1805 1.92612 15.1601 2.07737C15.1396 2.22861 15.0849 2.37318 15 2.5L9.99998 8V15L5.99999 12V8L0.999985 2.5C0.915076 2.37318 0.860321 2.22861 0.839913 2.07737C0.819506 1.92612 0.833987 1.77221 0.882249 1.62742C0.930511 1.48264 1.01127 1.35082 1.11835 1.24206C1.22542 1.13331 1.35597 1.05051 1.49999 1Z"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

ContractFilter.propTypes = {
  searchTerm: PropTypes.string,
  status: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired
};

export default ContractFilter;