import { useEffect, useMemo, useRef } from "react";
import { getActionShortcuts, getNavShortcuts } from "./nav";
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
  const shortcuts = useMemo(
    () => [...getNavShortcuts(user), ...getActionShortcuts(user)],
    [user]
  );
  const pendingRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      pendingRef.current = null;
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.defaultPrevented || event.isComposing || event.repeat) return;

      if (event.ctrlKey || event.metaKey || event.altKey) {
        pendingRef.current = null;
        return;
      }

      if (isTypingTarget(event.target) || hasOpenModal()) {
        pendingRef.current = null;
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        pendingRef.current = null;
        onOpenHelp?.();
        return;
      }

      const key = event.key.toLowerCase();
      const pending = pendingRef.current;
      const pendingValid =
        pending && Date.now() - pending.at <= CHORD_TIMEOUT_MS;

      if (pendingValid) {
        pendingRef.current = null;
        const match = shortcuts.find(
          (shortcut) =>
            shortcut.keys[0] === pending.prefix && shortcut.keys[1] === key
        );
        if (match?.to) {
          event.preventDefault();
          navigate(match.to);
          return;
        }
      }

      if (key === "g" || key === "n") {
        pendingRef.current = { prefix: key, at: Date.now() };
        return;
      }

      pendingRef.current = null;
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, navigate, onOpenHelp, shortcuts]);

  return { shortcuts, chordTimeout: CHORD_TIMEOUT_MS };
}
