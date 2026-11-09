import { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import debounce from 'lodash.debounce';
import AuthContext from "../../context/AuthContext";
import { useLocale } from "../../../contexts/LocaleContext";

function UserFilter({ searchTerm, role, onSearchChange, onRoleChange }) {
  const [activeFilter, setActiveFilter] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [term, setTerm] = useState(searchTerm);
  const [_selectedRole, setSelectedRole] = useState(role);
  const { user } = useContext(AuthContext);
  const { t: _t } = useLocale();

  // Filter roles based on current user's role
  const getAvailableRoles = () => {
    const allRoles = [
      { value: "All", label: _t('userFilter.all') },
      { value: "User", label: _t('userFilter.user') },
      { value: "Seller", label: _t('userFilter.seller') },
      { value: "Admin", label: _t('userFilter.admin') }
    ];
    
    if (user?.role === 'admin') {
      return allRoles; // Admin can see all roles
    } else if (user?.role === 'seller') {
      return [allRoles[0], allRoles[1]]; // Seller can only see "All" and "User"
    }
    
    return [allRoles[0]]; // Default fallback
  };

  const roles = getAvailableRoles();

  const navigate = useNavigate();

  const handleActiveFilter = (e) => {
    setActiveFilter(e.target.innerText);
  };

  const handleTermChange = (e) => {
    setTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleRoleSelect = (roleOption) => {
    setSelectedRole(roleOption.value);
    onRoleChange(roleOption.value === "All" ? "" : roleOption.value); // Update parent with selected role value
    setActiveFilter(roleOption.label); // Set the display text to the translated label
  };

  // Create a debounced version of onSearchChange
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      if (value.length >= 3) {
        onSearchChange(value);
      } else {
        onSearchChange(""); // Reset search if term is less than 3 characters
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
          placeholder={_t('userFilter.searchPlaceholder')}
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
                d="M19.9092 10.448C19.9092 16.4935 11.9092 21.6753 11.9092 21.6753C11.9092 21.6753 3.90918 16.4935 3.90918 10.448C3.90918 8.38656 4.75203 6.40954 6.25233 4.95187C7.75262 3.4942 9.78745 2.67529 11.9092 2.67529C14.0309 2.67529 16.0657 3.4942 17.566 4.95187C19.0663 6.40954 19.9092 8.38656 19.9092 10.448Z"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 12.6753C13.3807 12.6753 14.5 11.556 14.5 10.1753C14.5 8.79458 13.3807 7.67529 12 7.67529C10.6193 7.67529 9.5 8.79458 9.5 10.1753C9.5 11.556 10.6193 12.6753 12 12.6753Z"
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
            placeholder={_t('userFilter.selectType')}
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
          id="sellerUserType"
          className={`rounded-lg shadow-lg w-full bg-white dark:bg-darkblack-500 absolute right-0 z-10 top-full overflow-hidden ${showFilter ? "block" : "hidden"
            }`}
        >
          <ul>
            {roles.map((roleOption) => (
              <li
                key={roleOption.value}
                onClick={(e) => {
                  setShowFilter(false);     
                  handleActiveFilter(e);
                  handleRoleSelect(roleOption);
                }}
                className="text-sm text-bgray-900 dark:text-bgray-50 hover:dark:bg-darkblack-600 cursor-pointer px-5 py-2 hover:bg-bgray-100 font-semibold"
              >
                {roleOption.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pl-8 md:block hidden">
        <button aria-label="none">
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
      {/* <div className="pl-10 md:block hidden">
        <button
          onClick={handleSearchSubmit}
          aria-label="none"
          className="py-3 px-10 bg-bgray-600 dark:bg-darkblack-500 rounded-lg text-white font-medium text-sm"
        >
          Buscar
        </button>
      </div> */}
      <div className="pl-10 md:block hidden">
        <button
          aria-label="none"
          className="py-3 px-10 bg-success-300 text-white font-bold rounded-lg hover:bg-success-400 transition-all"
          onClick={() => navigate("/users/create")}
        >
          {_t('userFilter.addUser')}
        </button>
      </div>
    </div>
  );
}

UserFilter.propTypes = {
  searchTerm: PropTypes.string,
  role: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  onRoleChange: PropTypes.func.isRequired
};

export default UserFilter;