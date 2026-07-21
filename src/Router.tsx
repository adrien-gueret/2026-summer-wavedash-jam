import { createHashRouter, RouterProvider } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import MainMenu from "@/screens/MainMenu";
import SelectLevel from "@/screens/SelectLevel";
import Game from "@/screens/Game";
import AboutFamily from "@/screens/AboutFamily";
import End from "@/screens/End";
import NotFound from "@/screens/NotFound";

const router = createHashRouter([
  {
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, Component: MainMenu },
      { path: "levels", Component: SelectLevel },
      { path: "play/:levelId", Component: Game },
      { path: "family", Component: AboutFamily },
      { path: "end", Component: End },
      { path: "*", Component: NotFound },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
