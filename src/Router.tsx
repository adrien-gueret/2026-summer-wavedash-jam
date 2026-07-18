import { createHashRouter, RouterProvider } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import Home from "@/screens/Home";

const router = createHashRouter([
  {
    element: <MainLayout />,
    errorElement: <>Error</>,
    children: [{ index: true, Component: Home }],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
