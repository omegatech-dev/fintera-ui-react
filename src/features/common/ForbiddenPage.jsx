import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "@/contexts/AuthContext";

/**
 * 403 screen shown when an authenticated user lacks access to a route.
 * Customers (role `user`) are pointed at the customer portal instead of the
 * admin back-office.
 */
function ForbiddenPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const portalUrl = import.meta.env.VITE_CUSTOMER_PORTAL_URL;
  const isCustomer = user?.role === "user";

  return (
    <section className="min-h-screen bg-white dark:bg-darkblack-600 flex items-center justify-center px-6">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-7xl font-bold text-success-300">403</p>
        <h1 className="mt-4 text-2xl font-semibold text-bgray-900 dark:text-white">
          Esta sección es para personal autorizado
        </h1>
        <p className="mt-4 text-base text-bgray-600 dark:text-darkblack-300">
          Tu cuenta no tiene permisos para entrar al panel administrativo.
        </p>

        {isCustomer && (
          <p className="mt-6 text-base text-bgray-700 dark:text-bgray-50">
            ¿Buscas tus reservas?{" "}
            {portalUrl ? (
              <a
                href={portalUrl}
                className="font-semibold text-success-300 underline"
              >
                Entra al portal de clientes →
              </a>
            ) : (
              <span className="font-semibold">
                Entra al portal de clientes con el enlace que recibiste por
                correo.
              </span>
            )}
          </p>
        )}

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-success-300 text-sm font-bold text-white rounded-lg px-8 py-3 hover:bg-success-400 transition-colors"
          >
            Volver
          </button>
          <Link
            to="/"
            className="text-sm font-semibold text-bgray-700 dark:text-bgray-50 underline"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ForbiddenPage;
