import type { CharacterDefinition, CharacterExpression } from "@/types";

import "./style.css";

type CharacterPortraitProps = {
  character: CharacterDefinition;
  size?: "small" | "medium" | "large";
  expression?: CharacterExpression;
};

/**
 * Shows a character's face taken from their "_min" spritesheet
 * (384×128, three 128×128 frames: neutral, happy, sad). The requested
 * expression is selected by shifting the background position; no image is
 * cropped or resized on disk.
 */
export default function CharacterPortrait({
  character,
  size = "medium",
  expression = "neutral",
}: CharacterPortraitProps) {
  const spriteUrl = `${import.meta.env.BASE_URL}images/characters/${character.id}_min.png`;

  return (
    <span
      className={`portrait portrait--${size} portrait--${expression}`}
      style={{ backgroundImage: `url("${spriteUrl}")` }}
      role="img"
      aria-label={character.displayName}
    />
  );
}
