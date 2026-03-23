"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type ShortcutMap = Record<string, () => void>;

export function useKeyboardShortcuts(extraShortcuts: ShortcutMap = {}) {
  const router = useRouter();

  useEffect(() => {
    const defaultShortcuts: ShortcutMap = {
      g: () => router.push("/dashboard/meal-plan/generate"),
      r: () => router.push("/dashboard/recettes"),
      f: () => router.push("/dashboard/favoris"),
      e: () => router.push("/dashboard/epicerie"),
    };

    const shortcuts = { ...defaultShortcuts, ...extraShortcuts };

    function handleKeyDown(event: KeyboardEvent) {
      // Skip if focus is in an input, textarea, or select
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      // Skip if modifier keys are held
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key.toLowerCase();
      if (shortcuts[key]) {
        event.preventDefault();
        shortcuts[key]();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router, extraShortcuts]);
}
