import { useAudio, useMusic } from "wavedash-react";

import "./SoundToggle.css";

export default function SoundToggle() {
  const { isMusicEnabled, toggleMusic } = useAudio();
  const { playMusic } = useMusic();

  const handleClick = () => {
    if (isMusicEnabled) {
      toggleMusic(false);
    } else {
      toggleMusic(true);
      playMusic("music");
    }
  };

  return (
    <button
      type="button"
      className="sound-toggle"
      onClick={handleClick}
      aria-pressed={isMusicEnabled}
      title={isMusicEnabled ? "Mute sound" : "Enable sound"}
    >
      {isMusicEnabled ? "♪ Sound On" : "♪ Sound Off"}
    </button>
  );
}
