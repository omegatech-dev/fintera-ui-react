import { useState, useEffect, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "../../../../contexts/LocaleContext";
import { useToast } from "../../../../contexts/ToastContext";
import AuthContext from "../../../../contexts/AuthContext";
import { usersApi } from "../../../users/api";
import { Button, ErrorState } from "@/shared/ui";

import UserDetailsHeader from "../../../users/components/UserDetailsHeader";
import PersonalInfoCard from "../../../users/components/PersonalInfoCard";
import AccountActivityCard from "../../../users/components/AccountActivityCard";
import PersonalInfoForm from "../../../../shared/forms/PersonalInfoForm";

function PersonalInfo() {
  const { userId } = useParams();
  const { t } = useLocale();
  const { showToast } = useToast();
  const { user: currentUser } = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Determine if credit score should be visible: Only show if an admin is viewing a different regular user profile
  const showCreditScore =
    currentUser?.role === "admin" &&
    user?.role === "user" &&
    currentUser?.id !== user?.id;

  // Sellers cannot edit other users' information (only their own profile)
  const canEditUser = currentUser?.role !== "seller" || Number(userId) === currentUser?.id;

  // Fetch User Data
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.get(userId);
      setUser(data.user || data);
    } catch (err) {
      setError(err.message);
      showToast(t("errors.fetchUserFailed"), "error");
    } finally {
      setLoading(false);
    }
  }, [userId, t, showToast]);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId, fetchUser]);

  // Toggle User Status
  const toggleUserStatus = async () => {
    if (!user) return;
    try {
      await usersApi.toggleStatus(user.id);
      const newStatus = user.status === "active" ? "inactive" : "active";
      setUser(prev => ({ ...prev, status: newStatus }));
      showToast(`${t("personalInfo.profileUpdated")}: ${newStatus}`, "success");
    } catch (err) {
      console.error("Error:", err);
      showToast(t("errors.updateUserFailed"), "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" aria-live="polite" aria-busy="true">
        <div className="h-28 animate-pulse rounded-card bg-surface-2" />
        <div className="h-40 animate-pulse rounded-card bg-surface-2" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title={t("personalInfo.errorLoadingProfile")}
        description={error}
        onRetry={fetchUser}
      />
    );
  }

  return (
    <div id="tab1" className="tab-pane active w-full">
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
              <div>
                <h2 className="text-[15px] font-bold text-ink">
                  {t("personalInfo.editProfile")}
                </h2>
                <p className="mt-0.5 text-label font-medium text-ink-3">
                  {t("personalInfo.description")}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  fetchUser(); // Refresh data on cancel/back
                }}
              >
                {t("common.cancel")}
              </Button>
            </header>
            {/* Reuse existing form - pass userId */}
            <PersonalInfoForm userId={userId} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
              <div>
                <h2 className="text-[15px] font-bold text-ink">
                  {t("personalInfo.title")}
                </h2>
                <p className="mt-0.5 text-label font-medium text-ink-3">
                  {t("personalInfo.description")}
                </p>
              </div>
            </header>

            <UserDetailsHeader
              user={user}
              toggleStatus={toggleUserStatus}
              onEdit={() => setIsEditing(true)}
              showActions={canEditUser}
              showToggleStatus={currentUser?.role === "admin"}
            />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <PersonalInfoCard user={user} delay={0.1} />
              <AccountActivityCard user={user} delay={0.2} showCreditScore={showCreditScore} />
            </div>

            {/* Temporary Edit Button if Header doesn't have it wired yet */}
            {canEditUser && (
              <div className="fixed bottom-8 right-8 z-50 xl:hidden">
                <button
                  onClick={() => setIsEditing(true)}
                  aria-label={t("personalInfo.editProfile")}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-pop transition-colors hover:bg-brand-strong"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PersonalInfo;
