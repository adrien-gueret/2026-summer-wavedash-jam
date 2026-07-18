import { createStateContext, defineState } from "wavedash-react";

import type { PersistentState, UIState } from "@/types";

import * as gameActions from "./actions";

// TODO: define UiState and PersistentState

const persistent = defineState({
  initialState: {} as PersistentState,
  actions: {},
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
