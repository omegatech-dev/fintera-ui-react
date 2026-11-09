import { useContext } from "react"
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import PasswordChange from "../../../../shared/forms/PasswordChange";
import AuthContext from "../../../../contexts/AuthContext";

function Security() {
  const { token, user } = useContext(AuthContext);
  const { userId } = useParams();
  const mustChangePassword = user?.must_change_password && String(user?.id || user?.ID) === String(userId);

  return (
    <div id="tab6" className="tab-pane active w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl"
      >
        <div className="mb-8">
          {mustChangePassword && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex gap-3">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">Debe cambiar su contraseña</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                  Esta es su primera vez iniciando sesión. Por seguridad, debe crear una nueva contraseña antes de continuar.
                </p>
              </div>
            </div>
          )}
          <h2 className="text-2xl font-bold text-bgray-900 dark:text-white mb-2">
            Account Security
          </h2>
          <p className="text-bgray-500 dark:text-bgray-400 font-medium">
            Manage your password and security settings to keep your account safe.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Password Change Section */}
          <div className="w-full">
            {token ? (
              <PasswordChange token={token} userId={userId} />
            ) : (
              <div className="bg-white dark:bg-darkblack-600 rounded-2xl p-8 shadow-xs flex flex-col items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-bgray-500 dark:text-bgray-400">Loading security settings...</p>
              </div>
            )}
          </div>

          {/* Additional Security Info/Cards can be added here in the future */}
          <div className="bg-white dark:bg-darkblack-600 rounded-2xl p-6 md:p-8 shadow-xs border border-bgray-100 dark:border-darkblack-400">
            <h4 className="text-lg font-bold text-bgray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Security Recommendations
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                <p className="text-sm text-bgray-600 dark:text-bgray-400">Use a password that you don't use anywhere else.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                <p className="text-sm text-bgray-600 dark:text-bgray-400">Make sure your new password is at least 6 characters long.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                <p className="text-sm text-bgray-600 dark:text-bgray-400">Avoid using common patterns or personal information.</p>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Security;
