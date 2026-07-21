import { useNavigate } from "react-router-dom";

import { ROUTES } from "@/constants";

import "./style.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="not-found">
      <h1 className="not-found__title">Page not found</h1>
      <p className="not-found__text">
        We could not find the page you were looking for.
      </p>
      <button
        type="button"
        className="not-found__button"
        onClick={() => navigate(ROUTES.home)}
      >
        Back to title
      </button>
    </main>
  );
}
