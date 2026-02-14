# Specification

## Summary
**Goal:** Add an in-game Internet Identity sign-in/sign-out HUD to Jungle Fury, and ensure all HUD/title text is plain English (no emojis).

**Planned changes:**
- Add a HUD authentication section that shows a “Sign in” button for anonymous users and calls `useInternetIdentity().login()`.
- When authenticated, show a “Sign out” button that calls `useInternetIdentity().clear()`, plus a basic signed-in indicator including the (optionally shortened) principal.
- Display non-blocking authentication errors in English when `loginStatus === "loginError"`.
- Update the main game title to plain English text without emoji characters, and ensure all new HUD text is in English.

**User-visible outcome:** Players can explicitly sign in and sign out via Internet Identity from within the game HUD, see their signed-in status/principal, and view any login errors without disrupting gameplay.
