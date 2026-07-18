import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { WavedashProvider } from "wavedash-react";

import { StateProvider } from "@/services/state";

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
          music: [],
        },
        images: [],
      }}
      defaultMusicVolume={0.9}
      defaultSoundsVolume={1}
    >
      <StateProvider
        saveOptions={{
          fileName: "TODO-GAME-NAME-SAVE",
          autoSave: true,
          autoLoad: true,
        }}
      >
        <Router />
      </StateProvider>
    </WavedashProvider>
  </StrictMode>,
);
