import {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash.debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCheckCircle,
  faEllipsisVertical,
  faEye,
  faPaperPlane,
  faPen,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import AuthContext from "../../../contexts/AuthContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { confirmDialog } from "@/shared/ui/ConfirmProvider";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Input,
  Menu,
  Pagination,
  Skeleton,
  Table,
} from "@/shared/ui";
import { formatDate } from "../../../shared/utils/formatters";
import {
  getAvatarColor,
  getFullImageUrl,
  getInitials,
} from "../../../shared/utils/avatarUtils";
import { usersApi } from "../api";
import RightSidebar from "../components/RightSidebar";

const PER_PAGE = 12;

const ROLE_TONES = {
  admin: "violet",
  seller: "info",
  user: "neutral",
};

const normalizeRole = (role) => {
  const value = String(role || "user").toLowerCase();
  return ["admin", "seller", "user"].includes(value) ? value : "user";
};

const isActiveUser = (user) => {
  const raw = user?.status ?? user?.is_active;
  if (typeof raw === "boolean") return raw;
  return String(raw || "").toLowerCase() === "active";
};

const getClientCount = (user) => {
  const value =
    user?.clients_count ??
    user?.client_count ??
    user?.total_clients ??
    (Array.isArray(user?.clients) ? user.clients.length : null);
  return value === null || value === undefined ? null : value;
};

const getLastAccess = (user) =>
  user?.last_sign_in_at ||
  user?.last_login_at ||
  user?.last_access_at ||
  user?.last_seen_at ||
  null;

const readTotal = (data) => {
  if (!data) return null;
  const pagination = data.pagination || data.meta?.pagination || {};
  const total =
    pagination.count ?? pagination.total ?? data.total ?? data.total_count;
  const parsed = Number(total);
  return Number.isFinite(parsed) ? parsed : null;
};

function Users() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({
    total: null,
    admin: null,
    seller: null,
    user: null,
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const { t } = useLocale();
  const { showToast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  const myClients = searchParams.get("my_clients") === "1";

  const filters = useMemo(() => {
    const next = { status: showAll ? "all" : "active" };
    const term = searchTerm.trim();
    if (term) next.search_term = term;
    if (roleFilter) next.role = roleFilter;
    if (myClients) next.my_clients = "1";
    return next;
  }, [searchTerm, roleFilter, showAll, myClients]);

  const refreshUsers = useCallback(() => {
    setRefreshTrigger((value) => value + 1);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.list({
        ...filters,
        page,
        per_page: PER_PAGE,
        sort: "created_at-desc",
      });
      const items = Array.isArray(data)
        ? data
        : data?.users || data?.items || data?.data || [];
      setUsers(Array.isArray(items) ? items : []);

      const pagination = data?.pagination || data?.meta?.pagination || {};
      const count =
        Number(pagination.count ?? pagination.total ?? data?.total ?? 0) || 0;
      setTotal(count);
      const pages =
        Number(pagination.pages ?? pagination.total_pages) ||
        (count ? Math.ceil(count / PER_PAGE) : 1);
      setTotalPages(Math.max(1, pages));
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [filters, page, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshTrigger]);

  useEffect(() => {
    let active = true;
    const base = {
      status: showAll ? "all" : "active",
      ...(myClients ? { my_clients: "1" } : {}),
    };
    const loadTotal = (extra) =>
      usersApi
        .list({ ...base, ...extra, page: 1, per_page: 1 })
        .then(readTotal)
        .catch(() => null);

    Promise.all([
      loadTotal({}),
      loadTotal({ role: "admin" }),
      loadTotal({ role: "seller" }),
      loadTotal({ role: "user" }),
    ]).then(([totalCount, adminCount, sellerCount, userCount]) => {
      if (!active) return;
      setCounts({
        total: totalCount,
        admin: adminCount,
        seller: sellerCount,
        user: userCount,
      });
    });

    return () => {
      active = false;
    };
  }, [showAll, myClients, refreshTrigger]);

  const commitSearch = useMemo(
    () =>
      debounce((value) => {
        const term = value.trim();
        setSearchTerm(term.length >= 3 ? term : "");
        setPage(1);
      }, 500),
    []
  );

  useEffect(() => () => commitSearch.cancel(), [commitSearch]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchInput(value);
    commitSearch(value);
  };

  const handleRoleChange = useCallback((value) => {
    setRoleFilter(value);
    setPage(1);
  }, []);

  const handleStatusToggle = useCallback(() => {
    setShowAll((value) => !value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openUser = useCallback((user) => {
    setSelectedUser(user);
  }, []);

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
        setSearchInput(location.state.selectedUserName);
        setSearchTerm(location.state.selectedUserName);
      }

      setSelectedUser(userFromState);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleToggleStatus = useCallback(
    async (user) => {
      if (!user?.id) return;
      const nextActive = !isActiveUser(user);
      try {
        await usersApi.toggleStatus(user.id);
        showToast(
          t(
            nextActive
              ? "users.statusUpdatedTo_active"
              : "users.statusUpdatedTo_inactive"
          ),
          "success"
        );
        setSelectedUser((current) =>
          current?.id === user.id
            ? {
                ...current,
                status: nextActive ? "active" : "inactive",
                is_active: nextActive,
              }
            : current
        );
        refreshUsers();
      } catch (err) {
        showToast(err.message || t("common.error"), "error");
      }
    },
    [refreshUsers, showToast, t]
  );

  const handleResendConfirmation = useCallback(
    async (user) => {
      if (!user?.id) return;
      try {
        await usersApi.resendConfirmation(user.id);
        showToast(t("users.confirmationSent"), "success");
      } catch (err) {
        showToast(err.message || t("common.error"), "error");
      }
    },
    [showToast, t]
  );

  const handleDelete = useCallback(
    async (user) => {
      if (!user?.id) return;
      const confirmed = await confirmDialog({
        title: t("users.confirmDelete", { name: user.full_name || user.email }),
        confirmLabel: t("common.delete"),
      });
      if (!confirmed) return;

      try {
        await usersApi.delete(user.id);
        showToast(t("users.deleteSuccess"), "success");
        setSelectedUser((current) =>
          current?.id === user.id ? null : current
        );
        refreshUsers();
      } catch (err) {
        if (
          err.status === 409 ||
          err.message?.includes("cannot delete user with active contracts")
        ) {
          showToast(t("users.deleteActiveContractsError"), "error");
        } else {
          showToast(err.message || t("users.deleteError"), "error");
        }
      }
    },
    [refreshUsers, showToast, t]
  );

  const buildMenuItems = useCallback(
    (user) => {
      const active = isActiveUser(user);
      return [
        {
          label: t("users.editUser"),
          icon: <FontAwesomeIcon icon={faPen} className="w-3.5" />,
          onSelect: () => navigate(`/users/${user.id}/edit`),
        },
        {
          label: t("users.userDetail"),
          icon: <FontAwesomeIcon icon={faEye} className="w-3.5" />,
          onSelect: () => openUser(user),
        },
        {
          label: active ? t("users.deactivate") : t("users.activate"),
          icon: (
            <FontAwesomeIcon
              icon={active ? faBan : faCheckCircle}
              className="w-3.5"
            />
          ),
          onSelect: () => handleToggleStatus(user),
        },
        {
          label: t("users.invite"),
          icon: <FontAwesomeIcon icon={faPaperPlane} className="w-3.5" />,
          onSelect: () => handleResendConfirmation(user),
        },
        ...(currentUser?.role === "admin"
          ? [
              {
                label: t("common.delete"),
                tone: "danger",
                icon: <FontAwesomeIcon icon={faTrash} className="w-3.5" />,
                onSelect: () => handleDelete(user),
              },
            ]
          : []),
      ];
    },
    [
      currentUser?.role,
      handleDelete,
      handleResendConfirmation,
      handleToggleStatus,
      navigate,
      openUser,
      t,
    ]
  );

  const renderUserCell = useCallback(
    (user) => {
      const lastAccess = getLastAccess(user);
      return (
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-label font-bold text-white ${getAvatarColor(
              user.full_name
            )}`}
          >
            {user.profile_picture_thumb ? (
              <img
                src={getFullImageUrl(user.profile_picture_thumb)}
                alt={user.full_name || ""}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              getInitials(user.full_name)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-body font-semibold text-ink">
              {user.full_name || "—"}
            </p>
            <p className="truncate text-micro text-ink-3">
              {user.email || "—"}
            </p>
            {lastAccess && (
              <p className="truncate text-micro text-ink-3">
                {t("users.lastAccess")}: {formatDate(lastAccess)}
              </p>
            )}
          </div>
        </div>
      );
    },
    [t]
  );

  const renderRole = useCallback((user) => {
    const role = normalizeRole(user.role);
    return (
      <Chip tone={ROLE_TONES[role]}>
        {t(`userFilter.${role === "user" ? "client" : role}`)}
      </Chip>
    );
  }, [t]);

  const renderStatus = useCallback(
    (user) => {
      const active = isActiveUser(user);
      return (
        <span className="inline-flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              active ? "bg-brand" : "bg-ink-3"
            }`}
          />
          <span className="text-body text-ink-2">
            {t(active ? "common.active" : "common.inactive")}
          </span>
        </span>
      );
    },
    [t]
  );

  const renderActions = useCallback(
    (user) => (
      <div
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <Menu
          label={t("common.actions")}
          icon={<FontAwesomeIcon icon={faEllipsisVertical} />}
          items={buildMenuItems(user)}
        />
      </div>
    ),
    [buildMenuItems, t]
  );

  const columns = useMemo(
    () => [
      {
        key: "user",
        header: t("users.tableUser"),
        render: renderUserCell,
      },
      {
        key: "role",
        header: t("users.role"),
        render: renderRole,
      },
      {
        key: "clients",
        header: t("users.clientCount"),
        render: (user) => {
          const count = getClientCount(user);
          return (
            <span className="text-body text-ink-2">
              {count === null ? "—" : count}
            </span>
          );
        },
      },
      {
        key: "status",
        header: t("common.status"),
        render: renderStatus,
      },
      {
        key: "actions",
        header: "",
        align: "right",
        render: renderActions,
      },
    ],
    [renderActions, renderRole, renderStatus, renderUserCell, t]
  );

  const roleChips = useMemo(
    () => [
      { value: "", label: t("common.all"), count: counts.total },
      { value: "admin", label: t("users.filterAdmins"), count: counts.admin },
      {
        value: "seller",
        label: t("users.filterSellers"),
        count: counts.seller,
      },
      { value: "user", label: t("users.filterClients"), count: counts.user },
    ],
    [counts, t]
  );

  const subtitle =
    counts.total != null
      ? t("users.listSummary", {
          total: counts.total,
          admins: counts.admin ?? 0,
          sellers: counts.seller ?? 0,
          clients: counts.user ?? 0,
        })
      : t("users.manageSystemUsers");

  const hasFilters = Boolean(searchTerm || roleFilter || showAll);

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] page-shell dark:bg-darkblack-700 min-h-screen"
    >
      <div className="max-w-[1600px] mx-auto space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-page font-bold text-ink">{t("users.title")}</h1>
            <p className="text-body text-ink-3">{subtitle}</p>
          </div>
          <Button onClick={() => navigate("/users/create")}>
            <FontAwesomeIcon icon={faPlus} />
            {t("userFilter.addUser")}
          </Button>
        </div>

        <Card bodyClassName="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:max-w-md">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <Input
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder={t("userFilter.searchPlaceholder")}
                  aria-label={t("userFilter.searchPlaceholder")}
                  className="pl-9"
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleStatusToggle}
              >
                {showAll ? t("users.showActiveOnly") : t("users.showAll")}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {roleChips.map((chip) => {
                const active = roleFilter === chip.value;
                return (
                  <button
                    key={chip.value || "all"}
                    type="button"
                    onClick={() => handleRoleChange(chip.value)}
                    aria-pressed={active}
                    className={`inline-flex h-8 items-center gap-2 rounded-chip border px-3 text-label font-semibold transition-colors ${
                      active
                        ? "border-brand bg-brand-soft text-brand-strong"
                        : "border-line bg-surface text-ink-2 hover:bg-surface-2"
                    }`}
                  >
                    {chip.label}
                    {chip.count != null && (
                      <span
                        className={`rounded-chip px-1.5 text-micro ${
                          active
                            ? "bg-surface text-brand-strong"
                            : "bg-surface-2 text-ink-3"
                        }`}
                      >
                        {chip.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {error && (
          <ErrorState
            title={t("common.error")}
            description={error}
            onRetry={fetchUsers}
          />
        )}

        <Card bodyClassName="p-0">
          {loading ? (
            <div className="p-5">
              <Skeleton rows={6} />
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                rows={users}
                getRowKey={(user) => user.id}
                onRowClick={openUser}
                empty={
                  <div className="p-5">
                    <EmptyState
                      variant={hasFilters ? "no-results" : "empty"}
                      title={t("users.noUsersFound")}
                      description={
                        hasFilters
                          ? t("common.tryAdjustingFilters")
                          : t("users.manageSystemUsers")
                      }
                      action={
                        !hasFilters && (
                          <Button
                            size="sm"
                            onClick={() => navigate("/users/create")}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                            {t("userFilter.addUser")}
                          </Button>
                        )
                      }
                    />
                  </div>
                }
                mobileCard={(user) => (
                  <div className="rounded-card border border-line bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                      {renderUserCell(user)}
                      {renderActions(user)}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {renderRole(user)}
                      {renderStatus(user)}
                      <span className="text-micro text-ink-3">
                        {t("users.clientCount")}:{" "}
                        {getClientCount(user) === null
                          ? "—"
                          : getClientCount(user)}
                      </span>
                    </div>
                  </div>
                )}
              />
              {totalPages > 1 && (
                <div className="px-5 pb-4">
                  <Pagination
                    page={page}
                    pageCount={totalPages}
                    total={total}
                    perPage={PER_PAGE}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="2xl:relative fixed inset-0 2xl:inset-auto z-50 2xl:z-0 flex justify-end 2xl:block"
            onClick={(event) => {
              if (event.target === event.currentTarget && window.innerWidth < 1536) {
                setSelectedUser(null);
              }
            }}
          >
            <div className="h-full 2xl:h-auto 2xl:sticky 2xl:top-[156px] w-[400px] max-w-full">
              <RightSidebar
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

export default Users;
