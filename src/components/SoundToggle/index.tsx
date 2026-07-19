import { useAudio } from "wavedash-react";

import "./style.css";

export default function SoundToggle() {
  const { isAudioEnabled, toggleAudio } = useAudio();

  const handleClick = () => {
    void toggleAudio(!isAudioEnabled);
  };

  return (
    <button
      type="button"
      className="sound-toggle"
      onClick={handleClick}
      aria-pressed={isAudioEnabled}
      title={isAudioEnabled ? "Mute sound" : "Enable sound"}
    >
      {isAudioEnabled ? "♪ Sound On" : "♪ Sound Off"}
    </button>
  );
}
