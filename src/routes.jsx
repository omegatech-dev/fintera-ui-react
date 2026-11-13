/* eslint-disable react-refresh/only-export-components */
import { Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AdminRoute from "./shared/auth/AdminRoute";
import AdminOrOwnerRoute from "./shared/auth/AdminOrOwnerRoute";
import SellerRoute from "./shared/auth/SellerRoute";
import Forbidden from "./features/common/ForbiddenPage";
import Layout from "./shared/layout/Layout";
import RouteErrorElement from "./shared/error/RouteErrorElement";

// Lazy-load all feature and auth pages for smaller initial bundle
const Home = lazy(() => import("./features/dashboard/pages"));
const Contracts = lazy(() => import("./features/contracts/pages"));
const ContractDetail = lazy(() => import("./features/contracts/pages/detail"));
const Payments = lazy(() => import("./features/payments/pages"));
const Commissions = lazy(() => import("./features/commissions/pages"));
const Projects = lazy(() => import("./features/projects/pages"));
const Users = lazy(() => import("./features/users/pages"));
const Audits = lazy(() => import("./features/audits/pages"));
const Settings = lazy(() => import("./features/settings/pages"));
const AdminSettings = lazy(() => import("./features/settings/pages/admin"));
const Branding = lazy(() => import("./features/branding/pages"));
const BrandingGeneral = lazy(() => import("./features/branding/pages/general"));
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
const ProjectPaymentInstructions = lazy(() => import("./features/projects/pages/paymentInstructions"));
const LotsList = lazy(() => import("./features/projects/pages/lots"));
const CreateLot = lazy(() => import("./features/projects/pages/lots/create"));
const EditLot = lazy(() => import("./features/projects/pages/lots/edit"));
const Reserve = lazy(() => import("./features/projects/pages/reserve"));
const CreateUser = lazy(() => import("./features/users/pages/create"));
const Upload = lazy(() => import("./features/financing/pages/upload"));
const Summary = lazy(() => import("./features/financing/pages/summary"));
const Documentation = lazy(() => import("./features/docs/pages"));

const PageLoader = () => (
  <div className="flex items-center justify-center w-full h-[calc(100vh-64px)]">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export const appRoutes = [
    {
      path: "/",
      Component: Layout,
      errorElement: <RouteErrorElement />,
      children: [
        {
          index: true,
          element: (
            <AdminOrOwnerRoute>
              <Home />
            </AdminOrOwnerRoute>
          ),
        },
        {
          path: "/commissions",
          element: (
            <AdminRoute>
              <Commissions />
            </AdminRoute>
          ),
        },
        {
          path: "/vendedor/comisiones",
          element: (
            <SellerRoute>
              <Commissions />
            </SellerRoute>
          ),
        },
        {
          path: "/contracts",
          element: (
            <AdminOrOwnerRoute>
              <Contracts />
            </AdminOrOwnerRoute>
          ),
        },
        {
          path: "/contracts/:guid",
          element: (
            <AdminOrOwnerRoute>
              <ContractDetail />
            </AdminOrOwnerRoute>
          ),
        },
        {
          path: "/payments",
          element: (
            <AdminOrOwnerRoute>
              <Payments />
            </AdminOrOwnerRoute>
          ),
        },
        {
          path: "/projects",
          element: (
            <AdminOrOwnerRoute>
              <Projects />
            </AdminOrOwnerRoute>
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
          path: "/projects/:id/payment-instructions",
          element: (
            <AdminRoute>
              <ProjectPaymentInstructions />
            </AdminRoute>
          ),
        },
        {
          path: "/projects/:id/lots",
          element: (
            <AdminOrOwnerRoute>
              <LotsList />
            </AdminOrOwnerRoute>
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
            <AdminOrOwnerRoute>
              <EditLot />
            </AdminOrOwnerRoute>
          ),
        },
        {
          path: "/audits",
          element: (
            <AdminRoute>
              <Audits />
            </AdminRoute>
          ),
        },
        {
          path: "/docs",
          element: (
            <AdminOrOwnerRoute>
              <Documentation />
            </AdminOrOwnerRoute>
          ),
        },
        {
          path: "/docs/:slug",
          element: (
            <AdminOrOwnerRoute>
              <Documentation />
            </AdminOrOwnerRoute>
          ),
        },
        {
          element: (
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          ),
          children: [
            {
              path: "/settings",
              element: <Navigate to="/settings/general" replace />,
            },
            {
              path: "/settings/general",
              element: <BrandingGeneral />,
            },
            {
              path: "/settings/branding",
              element: <Branding />,
            },
          ],
        },
        {
          path: "/projects/:id/lots/:lot_id/contracts/create",
          element: (
            <AdminOrOwnerRoute>
              <Reserve />
            </AdminOrOwnerRoute>
          ),
        },
        {
          path: "/financing/user/:userId",
          element: (
            <AdminRoute>
              <Financing />
            </AdminRoute>
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
            <AdminRoute>
              <Users />
            </AdminRoute>
          ),
        },
        {
          path: "/users/create",
          element: (
            <AdminRoute>
              <CreateUser />
            </AdminRoute>
          ),
        },
        {
          path: "/analytics",
          element: (
            <AdminRoute>
              <Analytics />
            </AdminRoute>
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
      path: "/forbidden",
      element: <Forbidden />,
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
        <AdminRoute>
          <Suspense fallback={<PageLoader />}>
            <SignUp />
          </Suspense>
        </AdminRoute>
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
];
