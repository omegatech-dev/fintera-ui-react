import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { appRoutes } from "./routes";

const router = createBrowserRouter(appRoutes, {
  future: {
    // Opt-in to React Router v7 future flags
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
