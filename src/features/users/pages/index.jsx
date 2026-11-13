import {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
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
    const statsRequest = usersApi.getStats
      ? usersApi.getStats()
      : Promise.reject(new Error("stats unavailable"));
    statsRequest
      .then((data) => {
        if (!active) return;
        setCounts({
          total: Number(data?.total ?? 0),
          admin: Number(data?.admin ?? 0),
          seller: Number(data?.seller ?? 0),
          user: Number(data?.user ?? 0),
        });
      })
      .catch(() => {
        // Fall back to counting the filtered lists if the stats endpoint is
        // unavailable in an older deployment.
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
    if (!selectedUser) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedUser]);

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
            className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-micro font-bold text-white ${getAvatarColor(
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
        <span className="inline-flex items-center gap-1.5">
          <span
            className={`h-[7px] w-[7px] rounded-full ${
              active ? "bg-brand" : "bg-ink-3"
            }`}
          />
          <span
            className={`text-label font-semibold ${
              active ? "text-brand-strong" : "text-ink-3"
            }`}
          >
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

  const countLabel = (count, singularKey, pluralKey) =>
    `${count} ${t(count === 1 ? singularKey : pluralKey)}`;
  const subtitle =
    counts.total != null
      ? [
          countLabel(counts.total, "users.userSingular", "users.userPlural"),
          countLabel(counts.admin ?? 0, "users.adminSingular", "users.adminPlural"),
          countLabel(counts.seller ?? 0, "users.sellerSingular", "users.sellerPlural"),
          countLabel(counts.user ?? 0, "users.clientSingular", "users.clientPlural"),
        ].join(" · ")
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
      className="min-h-screen w-full bg-canvas px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px]"
    >
      <div className="max-w-[1600px] mx-auto space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-page font-bold tracking-tight text-ink">
              {t("users.title")}
            </h1>
            <p className="mt-1 text-body text-ink-3">{subtitle}</p>
          </div>
          <Button onClick={() => navigate("/users/create")}>
            <FontAwesomeIcon icon={faPlus} />
            {t("userFilter.addUser")}
          </Button>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
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
                className="h-10 pl-9"
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

          <div className="flex flex-wrap gap-1.5">
            {roleChips.map((chip) => {
              const active = roleFilter === chip.value;
              return (
                <button
                  key={chip.value || "all"}
                  type="button"
                  onClick={() => handleRoleChange(chip.value)}
                  aria-pressed={active}
                  className={`inline-flex h-[30px] items-center gap-1.5 rounded-chip border px-3 text-label font-semibold transition-colors ${
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

      {createPortal(
        <AnimatePresence>
          {selectedUser && (
          <motion.div
            className="fixed inset-0 z-[70] flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) setSelectedUser(null);
            }}
          >
            <div
              className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]"
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t("users.userDrawerTitle")}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.24, ease: "easeOut" }}
              className="relative h-full w-[460px] max-w-full border-l border-line bg-surface shadow-pop"
            >
              <RightSidebar
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onToggleStatus={handleToggleStatus}
                onResend={handleResendConfirmation}
                onDelete={
                  currentUser?.role === "admin" ? handleDelete : undefined
                }
              />
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.main>
  );
}

export default Users;
