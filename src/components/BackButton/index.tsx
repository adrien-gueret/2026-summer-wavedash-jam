import { Link } from "react-router-dom";

import "./style.css";

type BackButtonProps = {
  /** Destination route. */
  to: string;
  /** Visible label; defaults to "Back". */
  label?: string;
  /** Accessible label; defaults to the visible label. */
  ariaLabel?: string;
  className?: string;
};

/**
 * Shared "Back" navigation control used across screens (game, dinner select,
 * about the family) so every back affordance looks and behaves the same: a
 * pill with a left-pointing arrow and a label.
 */
export default function BackButton({
  to,
  label = "Back",
  ariaLabel,
  className,
}: BackButtonProps) {
  return (
    <Link
      to={to}
      className={`back-button${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel ?? label}
    >
      <svg
        className="back-button__icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M15 5 8 12l7 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="back-button__label">{label}</span>
    </Link>
  );
}
