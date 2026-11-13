import { Navigate } from "react-router-dom";

/**
 * Public signup is not part of the back office: the API has no registration
 * endpoint, customer accounts are created in the customer portal, and
 * back-office accounts are created from Users. Keep the route as a redirect so
 * old links land on sign in instead of a dead form.
 */
function SignUp() {
  return <Navigate to="/signin" replace />;
}

export default SignUp;
