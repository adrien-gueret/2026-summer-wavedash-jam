import type { ReactNode } from "react";

import "./style.css";

type TooltipProps = {
  /** The text shown inside the tooltip bubble. */
  label: string;
  /** The element the tooltip is attached to. */
  children: ReactNode;
};

/**
 * A lightweight, CSS-only tooltip. The bubble appears on hover or keyboard
 * focus of its trigger. It is marked `aria-hidden` because triggers are
 * expected to carry their own accessible name (e.g. `aria-label`), so screen
 * readers announce the label without the bubble duplicating it.
 */
export default function Tooltip({ label, children }: TooltipProps) {
  return (
    <span className="tooltip">
      {children}
      <span className="tooltip__bubble" role="tooltip" aria-hidden="true">
        {label}
      </span>
    </span>
  );
}
