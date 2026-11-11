// Resolves where a user should land after a successful sign-in.
//
// Back-office roles (admin/seller) stay in the admin panel; customers (role
// `user`) belong in the customer portal. When no portal is configured we fall
// back to the local 403 screen instead of redirecting to an invalid URL.
import { CUSTOMER_PORTAL_URL } from "@config";
export const CUSTOMER_PORTAL_FALLBACK = "/forbidden";

export function resolvePostLoginDestination(
  user,
  portalUrl = CUSTOMER_PORTAL_URL
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
