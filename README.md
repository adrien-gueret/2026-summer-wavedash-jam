# Project Setup TODOs

This template still contains placeholders and scaffold TODOs.
Update all items below before shipping your game.

## Required placeholders

- [ ] Update package name in [package.json](package.json#L2):
  - Replace `todo-game-name` with your real npm package name.
- [ ] Update HTML metadata in [index.html](index.html#L24) and [index.html](index.html#L26):
  - Replace `TODO: Game Title`.
  - Replace `TODO: Game Description`.
- [ ] Update Vite base path in [vite.config.ts](vite.config.ts#L6):
  - Replace `/todo-game-name/` with your deploy base path.
  - If you deploy at domain root, you can usually use `/`.
- [ ] Update Wavedash game id in [wavedash.toml](wavedash.toml#L1):
  - Replace `todo_wavedash_game_id` with your real game id.
- [ ] Update save file key in [src/main.tsx](src/main.tsx#L41):
  - Replace `TODO-GAME-NAME-SAVE` with a unique stable save key.
- [ ] Update copyright owner in [LICENSE](LICENSE#L3):
  - Replace `TODO: Your Name` with your real legal name or organization name.
- [ ] Update favicon files in `public/` with your game branding.

## Scaffold TODOs to implement

- [ ] Define your game types in [src/types.ts](src/types.ts#L1):
  - Implement `PersistentState`.
  - Implement `UIState`.
- [ ] Add global constants in [src/constants.ts](src/constants.ts#L1).
- [ ] Implement state actions in [src/state/actions.ts](src/state/actions.ts#L3).
- [ ] Wire state definitions in [src/state/index.ts](src/state/index.ts#L7):
  - Connect real `initialState` values.
  - Connect action maps for `persistent` and `ui`.
- [ ] Add selectors as needed in [src/state/selectors.ts](src/state/selectors.ts#L1).

## After updating TODOs

- Run `npm install` to refresh lockfile metadata if package name changed.
- Run `npm run lint`.
- Run `npm run build`.
