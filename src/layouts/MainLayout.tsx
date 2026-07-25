import { Outlet, ScrollRestoration } from "react-router-dom";

import SoundToggle from "@/components/SoundToggle";
import { useAchievementSync } from "@/hooks/useAchievementSync";
import { ActiveGameProvider } from "@/hooks/useActiveGame";

function MainLayout() {
  // Keep the save-derived achievements (campaign progress, daily played) in
  // sync with Wavedash on every screen.
  useAchievementSync();

  return (
    <ActiveGameProvider>
      <ScrollRestoration />
      <SoundToggle />
      <Outlet />
    </ActiveGameProvider>
  );
}

export default MainLayout;
