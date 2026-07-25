import { Outlet, ScrollRestoration } from "react-router-dom";

import SoundToggle from "@/components/SoundToggle";
import { useAchievementSync } from "@/hooks/useAchievementSync";

function MainLayout() {
  // Keep the save-derived achievements (campaign progress, daily played) in
  // sync with Wavedash on every screen.
  useAchievementSync();

  return (
    <>
      <ScrollRestoration />
      <SoundToggle />
      <Outlet />
    </>
  );
}

export default MainLayout;
