// Resolves where a user should land after a successful sign-in.
//
// Back-office roles (admin/seller) stay in the admin panel; customers (role
// `user`) belong in the customer portal. When the portal URL is not configured
// we fall back to the local 403 screen so customers get guidance instead of an
// invalid redirect.
export const CUSTOMER_PORTAL_FALLBACK = "/forbidden";

export function resolvePostLoginDestination(
  user,
  portalUrl = import.meta.env.VITE_CUSTOMER_PORTAL_URL
) {
  if (!user) {
    return { type: "internal", path: "/" };
  }

  if (user.role === "admin" || user.role === "seller") {
    if (user.must_change_password) {
      return {
        type: "internal",
        path: `/settings/user/${user.id}/security`,
      };
    }
    return { type: "internal", path: "/" };
  }

  const trimmedPortalUrl =
    typeof portalUrl === "string" ? portalUrl.trim() : "";
  if (trimmedPortalUrl) {
    return { type: "external", path: trimmedPortalUrl };
  }

  return { type: "internal", path: CUSTOMER_PORTAL_FALLBACK };
}
