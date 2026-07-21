import { useNavigate } from "react-router-dom";

import { GAME_TAGLINE, GAME_TITLE, ROUTES } from "@/constants";

import "./style.css";

export default function MainMenu() {
  const navigate = useNavigate();

  return (
    <main className="main-menu">
      <div className="main-menu__panel">
        <div className="main-menu__heading">
          <h1 className="main-menu__title">{GAME_TITLE}</h1>
          <p className="main-menu__tagline">{GAME_TAGLINE}</p>
        </div>

        <nav className="main-menu__actions" aria-label="Main menu">
          <button
            type="button"
            className="main-menu__button main-menu__button--primary"
            onClick={() => navigate(ROUTES.levels)}
          >
            Play
          </button>

          <button
            type="button"
            className="main-menu__button"
            onClick={() => navigate(ROUTES.family)}
          >
            About the Family
          </button>
        </nav>
      </div>
    </main>
  );
}
