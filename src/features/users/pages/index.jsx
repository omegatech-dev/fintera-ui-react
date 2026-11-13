import { useState, useEffect, useContext, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SearchFilterBar from "../../../shared/ui/SearchFilterBar";
import GenericList from "../../../shared/ui/GenericList";
import UserData from "../components/UserData";
import RightSidebar from "../components/RightSidebar";
import AuthContext from "../../../contexts/AuthContext";
import { useLocale } from "../../../contexts/LocaleContext";


function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const myClients = searchParams.get("my_clients") === "1";
  const { user: currentUser } = useContext(AuthContext);
  const { t } = useLocale();


  // Get available role options based on current user's role
  const getRoleFilterOptions = () => {
    const allRoles = [
      { value: "", label: t('userFilter.all') },
      { value: "user", label: t('userFilter.user') },
      { value: "seller", label: t('userFilter.seller') },
      { value: "admin", label: t('userFilter.admin') }
    ];

    if (currentUser?.role === 'admin') {
      return allRoles;
    } else if (currentUser?.role === 'seller') {
      return [allRoles[0], allRoles[1]];
    }

    return [allRoles[0]];
  };

  const roleOptions = getRoleFilterOptions();

  // Render function for individual user items - now simplified as cards
  const renderUserItem = useCallback((user, index, isMobileCard, handleClick) => {
    return (
      <UserData
        userInfo={user}
        index={index}
        onClick={handleClick}
        showStatusToggle={currentUser?.role !== "seller"}
        showEditButton={currentUser?.role !== "seller"}
        showDeleteButton={currentUser?.role === 'admin'}
        onDelete={() => setRefreshTrigger(prev => prev + 1)}
      />
    );
  }, [currentUser?.role]);

  useEffect(() => {
    if (location.state?.selectedUserId || location.state?.selectedUserName) {
      const userFromState = {
        id: location.state.selectedUserId,
        identity: location.state.selectedUserId,
        full_name: location.state.selectedUserName,
        phone: location.state.selectedUserPhone,
        credit_score: location.state.selectedUserCreditScore,
        email: "",
        role: "user",
        status: "active",
      };

      if (location.state.selectedUserName) {
        setSearchTerm(location.state.selectedUserName);
      }

      setSelectedUser(userFromState);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const onClose = () => {
    setSelectedUser(null);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] page-shell dark:bg-darkblack-700 min-h-screen"
    >
      <div className="flex 2xl:flex-row 2xl:space-x-11 flex-col space-y-10">
        <div className="2xl:flex-1 w-full">
          <SearchFilterBar
            id="users-search-bar"
            searchTerm={searchTerm}
            filterValue={role}
            filterOptions={roleOptions}
            onSearchChange={setSearchTerm}
            onFilterChange={setRole}
            searchPlaceholder={t('userFilter.searchPlaceholder')}
            filterPlaceholder={t('userFilter.selectType')}
            minSearchLength={3}
            showFilter={true}
            actions={[
              {
                id: "toggle-status-btn",
                label: roleOptions.length > 0 && role === "admin" ? (t('users.showTotal') || "Show All") : (filterStatus === "all" ? (t('users.showActiveOnly') || "Active Only") : (t('users.showAll') || "Show All")),
                onClick: () => setFilterStatus(prev => prev === "active" ? "all" : "active"),
                className: `py-3 px-6 mr-4 font-semibold rounded-xl transition-all border flex items-center gap-2 ${filterStatus === "all"
                  ? "bg-bgray-900 text-white border-bgray-900 dark:bg-white dark:text-bgray-900 dark:border-white shadow-lg shadow-bgray-200 dark:shadow-none"
                  : "bg-white dark:bg-darkblack-600 text-bgray-600 dark:text-bgray-300 border-bgray-200 dark:border-darkblack-400 hover:border-bgray-300 dark:hover:border-darkblack-300 hover:bg-bgray-50 dark:hover:bg-darkblack-500"}`,
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 12H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 18H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              },
              {
                id: "add-user-btn",
                label: t('userFilter.addUser'),
                onClick: () => navigate("/users/create"),
                className: "py-3 px-10 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              }
            ]}
          />

          <GenericList
            endpoint="/api/v1/users"
            renderItem={renderUserItem}
            filters={{
              search_term: searchTerm,
              role: role,
              status: filterStatus === "all" ? "all" : "active",
              ...(myClients && { my_clients: "1" })
            }}
            onItemSelect={setSelectedUser}
            columns={[]} // No columns needed for grid view
            gridClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            sortBy="created_at-desc"
            itemsPerPage={12}
            emptyMessage={t('users.noUsersFound')}
            loadingMessage={t('users.loadingUsers')}
            entityName="users"
            showDesktopTable={false}
            refreshTrigger={refreshTrigger}
          />
        </div>

        <AnimatePresence>
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="2xl:relative fixed inset-0 2xl:inset-auto z-50 2xl:z-0 flex justify-end 2xl:block"
              onClick={(e) => {
                if (e.target === e.currentTarget && window.innerWidth < 1536) onClose();
              }}
            >
              <div className="h-full 2xl:h-auto 2xl:sticky 2xl:top-[156px] w-[400px] max-w-full">
                <RightSidebar user={selectedUser} onClose={onClose} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}

export default Users;
