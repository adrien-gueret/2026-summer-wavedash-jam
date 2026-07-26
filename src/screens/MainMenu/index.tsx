import { useNavigate } from "react-router-dom";

import { GAME_TAGLINE, GAME_TITLE, ROUTES } from "@/constants";
import { useFullscreen } from "@/hooks/useFullscreen";
import { usePersistentSelector } from "@/state";
import { selectHasCompletedAnyLevel } from "@/state/selectors";

import "./style.css";

export default function MainMenu() {
  const navigate = useNavigate();
  const requestFullscreen = useFullscreen();
  const hasCompletedAnyLevel = usePersistentSelector(
    selectHasCompletedAnyLevel,
  );

  const goTo = (route: string) => {
    requestFullscreen();
    navigate(route);
  };

  return (
    <main className="main-menu">
      <div className="main-menu__panel">
        <div className="main-menu__heading">
          <h1 className="main-menu__title">
            <img
              className="main-menu__logo"
              src={`${import.meta.env.BASE_URL}images/logo.png`}
              alt={GAME_TITLE}
            />
          </h1>
          <p className="main-menu__tagline">{GAME_TAGLINE}</p>
        </div>

        <nav className="main-menu__actions" aria-label="Main menu">
          <button
            type="button"
            className="main-menu__button main-menu__button--primary"
            onClick={() => goTo(ROUTES.levels)}
          >
            Play
          </button>

          {hasCompletedAnyLevel && (
            <button
              type="button"
              className="main-menu__button"
              onClick={() => goTo(ROUTES.daily)}
            >
              Dinner of the Day
            </button>
          )}

          <button
            type="button"
            className="main-menu__button"
            onClick={() => goTo(ROUTES.family)}
          >
            Know the Family
          </button>
        </nav>
      </div>
    </main>
  );
}
