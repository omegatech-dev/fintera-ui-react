import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./shared/auth/ProtectedRoute";
import AdminRoute from "./shared/auth/AdminRoute";
import AdminOrOwnerRoute from "./shared/auth/AdminOrOwnerRoute";
import Layout from "./shared/layout/Layout";
import RouteErrorElement from "./shared/error/RouteErrorElement";

// Lazy-load all feature and auth pages for smaller initial bundle
const Home = lazy(() => import("./features/dashboard/pages"));
const Contracts = lazy(() => import("./features/contracts/pages"));
const Payments = lazy(() => import("./features/payments/pages"));
const Projects = lazy(() => import("./features/projects/pages"));
const Users = lazy(() => import("./features/users/pages"));
const Settings = lazy(() => import("./features/settings/pages"));
const Audits = lazy(() => import("./features/audits/pages"));
const Branding = lazy(() => import("./features/branding/pages"));
const Analytics = lazy(() => import("./features/analytics/pages"));
const Financing = lazy(() => import("./features/financing/pages"));
const SignIn = lazy(() => import("./features/auth/pages/signin"));
const SignUp = lazy(() => import("./features/auth/pages/signup"));
const ComingSoon = lazy(() => import("./features/commingSoon"));
const NotFound = lazy(() => import("./shared/error/NotFound"));
const PersonalInfo = lazy(() => import("./features/settings/pages/personal-info"));
const Security = lazy(() => import("./features/settings/pages/security"));
const TermsAndCondition = lazy(() => import("./features/settings/pages/terms&condition"));
const CreateProject = lazy(() => import("./features/projects/pages/create"));
const EditProject = lazy(() => import("./features/projects/pages/edit"));
const LotsList = lazy(() => import("./features/projects/pages/lots"));
const CreateLot = lazy(() => import("./features/projects/pages/lots/create"));
const EditLot = lazy(() => import("./features/projects/pages/lots/edit"));
const Reserve = lazy(() => import("./features/projects/pages/reserve"));
const CreateUser = lazy(() => import("./features/users/pages/create"));
const Upload = lazy(() => import("./features/financing/pages/upload"));
const Summary = lazy(() => import("./features/financing/pages/summary"));

const PageLoader = () => (
  <div className="flex items-center justify-center w-full h-[calc(100vh-64px)]">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const router = createBrowserRouter(
  [
    {
      path: "/",
      Component: Layout,
      errorElement: <RouteErrorElement />,
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          ),
        },
        {
          path: "/contracts",
          element: (
            <ProtectedRoute>
              <Contracts />
            </ProtectedRoute>
          ),
        },
        {
          path: "/payments",
          element: (
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          ),
        },
        {
          path: "/projects",
          element: (
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          ),
        },
        {
          path: "/projects/create",
          element: (
            <AdminRoute>
              <CreateProject />
            </AdminRoute>
          ),
        },
        {
          path: "/projects/:id/edit",
          element: (
            <AdminRoute>
              <EditProject />
            </AdminRoute>
          ),
        },
        {
          path: "/projects/:id/lots",
          element: (
            <ProtectedRoute>
              <LotsList />
            </ProtectedRoute>
          ),
        },
        {
          path: "/projects/:id/lots/create",
          element: (
            <AdminRoute>
              <CreateLot />
            </AdminRoute>
          ),
        },
        {
          path: "/projects/:project_id/lots/:lot_id/edit",
          element: (
            <ProtectedRoute>
              <EditLot />
            </ProtectedRoute>
          ),
        },
        {
          path: "/audits",
          element: (
            <ProtectedRoute>
              <Audits />
            </ProtectedRoute>
          ),
        },
        {
          path: "/settings/branding",
          element: (
            <AdminRoute>
              <Branding />
            </AdminRoute>
          ),
        },
        {
          path: "/projects/:id/lots/:lot_id/contracts/create",
          element: (
            <ProtectedRoute>
              <Reserve />
            </ProtectedRoute>
          ),
        },
        {
          path: "/financing/user/:userId",
          element: (
            <AdminOrOwnerRoute>
              <Financing />
            </AdminOrOwnerRoute>
          ),
          children: [
            {
              index: true,
              element: <Summary />,
            },
            {
              path: "payment/:paymentId/upload",
              element: <Upload />,
            },
          ],
        },
        {
          path: "/settings/user/:userId",
          element: (
            <AdminOrOwnerRoute>
              <Settings />
            </AdminOrOwnerRoute>
          ),
          children: [
            {
              index: true,
              element: <PersonalInfo />,
            },
            {
              path: "security",
              element: <Security />,
            },
            {
              path: "terms&conditions",
              element: <TermsAndCondition />,
            },
          ],
        },
        {
          path: "/users",
          element: (
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          ),
        },
        {
          path: "/users/create",
          element: (
            <ProtectedRoute>
              <CreateUser />
            </ProtectedRoute>
          ),
        },
        {
          path: "/analytics",
          element: (
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          ),
        },
        {
          path: "*",
          element: (
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          ),
        },
      ],
    },

    {
      path: "/signin",
      element: (
        <Suspense fallback={<PageLoader />}>
          <SignIn />
        </Suspense>
      ),
    },
    {
      path: "/signup",
      element: (
        <Suspense fallback={<PageLoader />}>
          <SignUp />
        </Suspense>
      ),
    },
    {
      path: "/coming-soon",
      element: (
        <Suspense fallback={<PageLoader />}>
          <ComingSoon />
        </Suspense>
      ),
    },
  ],
  {
    future: {
      // Opt-in to React Router v7 future flags
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
