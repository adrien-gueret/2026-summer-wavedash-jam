import { Outlet, ScrollRestoration } from "react-router-dom";

import SoundToggle from "@/components/SoundToggle";

function MainLayout() {
  return (
    <>
      <ScrollRestoration />
      <SoundToggle />
      <Outlet />
    </>
  );
}

export default MainLayout;
