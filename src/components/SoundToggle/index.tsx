import { useEffect } from "react";

import { useAudio, useMusic } from "wavedash-react";

import { useActiveGame } from "@/hooks/useActiveGame";

import "./style.css";

export default function SoundToggle() {
  const { isAudioEnabled, toggleAudio } = useAudio();
  const { playMusic } = useMusic();
  const { isGameActive } = useActiveGame();

  // Game music plays only while a level is actually being played; menu music
  // plays on every menu, picker, and result screen.
  const currentTrack = isGameActive ? "game_music" : "menu_music";

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
