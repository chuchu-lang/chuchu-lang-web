"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "chuchu-theme";
const DARK_MEDIA = "(prefers-color-scheme: dark)";

function getStoredTheme(): "dark" | "light" | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function subscribeTheme(onStoreChange: () => void) {
  const root = document.documentElement;
  const observer = new MutationObserver(onStoreChange);
  observer.observe(root, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  const media = window.matchMedia(DARK_MEDIA);
  const onMediaChange = (event: MediaQueryListEvent) => {
    if (getStoredTheme() === null) {
      root.dataset.theme = event.matches ? "dark" : "light";
    }
  };
  media.addEventListener("change", onMediaChange);

  return () => {
    observer.disconnect();
    media.removeEventListener("change", onMediaChange);
  };
}

function getThemeSnapshot(): boolean {
  return document.documentElement.dataset.theme === "dark";
}

function getServerThemeSnapshot(): boolean {
  return false;
}

/**
 * Theme toggle button (moon in light mode, sun in dark mode).
 * Both icons render in the DOM and CSS switches visibility via
 * `html[data-theme="dark"]` so the icon matches before hydration.
 */
export default function ThemeToggle() {
  const isDark = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const toggle = () => {
    const root = document.documentElement;
    const current =
      root.dataset.theme === "dark" || root.dataset.theme === "light"
        ? root.dataset.theme
        : window.matchMedia(DARK_MEDIA).matches
          ? "dark"
          : "light";
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage failures in restricted browsing modes.
    }
  };

  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      onClick={toggle}
    >
      <svg
        className="theme-icon theme-icon-moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <svg
        className="theme-icon theme-icon-sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2.2M12 19.8V22M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M2 12h2.2M19.8 12H22M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56" />
      </svg>
    </button>
  );
}

