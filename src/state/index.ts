import { createStateContext, defineState } from "wavedash-react";

import type { PersistentState, UIState } from "@/types";

import { submitLevelResult } from "./actions";

const INITIAL_PERSISTENT_STATE: PersistentState = {
  unlockedLevelIds: ["1"],
  completedLevelIds: [],
  bestScoresByLevelId: {},
  worstScoresByLevelId: {},
};

const persistent = defineState({
  initialState: INITIAL_PERSISTENT_STATE,
  actions: {
    submitLevelResult,
  },
});

const ui = defineState({
  initialState: {} as UIState,
  actions: {},
});

export const {
  StateProvider,
  useUiSelector,
  useUiSelectorShallow,
  useUiActions,
  usePersistentSelector,
  usePersistentSelectorShallow,
  usePersistentActions,
  usePersistentMeta,
  usePersistentControls,
} = createStateContext({ ui, persistent });
