import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useAudio, useMusic } from "wavedash-react";

import { ROUTES } from "@/constants";

import "./style.css";

/** Game music plays only during a game (under /play); menu music elsewhere. */
function musicForPath(pathname: string): string {
  return pathname.startsWith(ROUTES.play) ? "game_music" : "menu_music";
}

export default function SoundToggle() {
  const { isAudioEnabled, toggleAudio } = useAudio();
  const { playMusic } = useMusic();
  const { pathname } = useLocation();

  const currentTrack = musicForPath(pathname);

  // Keep the playing track in sync with the current screen whenever audio is
  // on: switch to game music on entering a game, back to menu music on leaving.
  useEffect(() => {
    if (isAudioEnabled) {
      playMusic(currentTrack);
    }
  }, [isAudioEnabled, currentTrack, playMusic]);

  const handleClick = () => {
    if (isAudioEnabled) {
      toggleAudio(false);
    } else {
      toggleAudio(true);
      playMusic(currentTrack);
    }
  };

  return (
    <button
      type="button"
      className="sound-toggle"
      onClick={handleClick}
      aria-pressed={isAudioEnabled}
      aria-label={isAudioEnabled ? "Mute sound" : "Enable sound"}
      title={isAudioEnabled ? "Mute sound" : "Enable sound"}
    />
  );
}
