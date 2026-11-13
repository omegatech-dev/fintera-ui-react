import { useEffect, useMemo, useRef } from "react";
import { getNavShortcuts } from "./nav";
import { CHORD_TIMEOUT_MS, hasOpenModal, isTypingTarget } from "./shortcuts";

// GitHub-style chords: press `g`, then the item letter within the timeout.
// Shortcuts never fire while the user is typing, when a dialog is open, or
// when a platform modifier is held.
export function useKeyboardShortcuts({
  user,
  navigate,
  onOpenHelp,
  enabled = true,
}) {
  const shortcuts = useMemo(() => getNavShortcuts(user), [user]);
  const pendingRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      pendingRef.current = 0;
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.defaultPrevented || event.isComposing || event.repeat) return;

      if (event.ctrlKey || event.metaKey || event.altKey) {
        pendingRef.current = 0;
        return;
      }

      if (isTypingTarget(event.target) || hasOpenModal()) {
        pendingRef.current = 0;
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        pendingRef.current = 0;
        onOpenHelp?.();
        return;
      }

      const key = event.key.toLowerCase();
      const pending = pendingRef.current;
      const pendingValid = pending && Date.now() - pending <= CHORD_TIMEOUT_MS;

      if (pendingValid) {
        pendingRef.current = 0;
        const match = shortcuts.find((shortcut) => shortcut.keys[1] === key);
        if (match?.to) {
          event.preventDefault();
          navigate(match.to);
          return;
        }
      }

      if (key === "g") {
        pendingRef.current = Date.now();
        return;
      }

      pendingRef.current = 0;
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, navigate, onOpenHelp, shortcuts]);

  return { shortcuts, chordTimeout: CHORD_TIMEOUT_MS };
}
