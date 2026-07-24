import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { WavedashProvider } from "wavedash-react";

import { StateProvider } from "@/state";

import "./index.css";
import Router from "./Router";

if (!document.startViewTransition) {
  // @ts-expect-error This is a simple polyfill, no needs to be 100% compliant
  document.startViewTransition = (callback) => {
    if (typeof callback !== "function") {
      throw new TypeError(
        "The argument to startViewTransition must be a function",
      );
    }
    callback();

    return {
      finished: Promise.resolve(),
    };
  };
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WavedashProvider
      preload={{
        audio: {
          menu_music: ["./audio/menu_music.ogg", "./audio/menu_music.mp3"],
          game_music: ["./audio/game_music.ogg", "./audio/game_music.mp3"],
          seat1: ["./audio/seat1.ogg", "./audio/seat1.mp3"],
          seat2: ["./audio/seat2.ogg", "./audio/seat2.mp3"],
        },
        images: [
          "./images/logo.png",
          "./images/icons.png",
          "./images/table.png",
          "./images/tablecloth.png",
          "./images/sound.png",
          "./images/characters/andrew_min.png",
          "./images/characters/angela_min.png",
          "./images/characters/bree.png",
          "./images/characters/danielle.png",
          "./images/characters/henry.png",
          "./images/characters/julie.png",
          "./images/characters/karl.png",
          "./images/characters/martha.png",
          "./images/characters/paul.png",
          "./images/characters/rex.png",
          "./images/characters/susan.png",
          "./images/characters/zach.png",
        ],
      }}
      defaultMusicVolume={0.7}
      defaultSoundsVolume={1}
    >
      <StateProvider
        saveOptions={{
          fileName: "TABLE-FOR-TROUBLE-SAVE",
          autoSave: true,
          autoLoad: true,
        }}
      >
        <Router />
      </StateProvider>
    </WavedashProvider>
  </StrictMode>,
);
