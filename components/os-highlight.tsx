"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
function detectOS() {
  const agent = navigator.userAgent;
  return /Windows NT/.test(agent) ? "windows" : /Macintosh/.test(agent) && navigator.maxTouchPoints <= 1 ? "macos" : /Linux/.test(agent) && !/Android/.test(agent) ? "linux" : "";
}

/** OS hint only: never infer architecture or hide alternative downloads. */
export default function OSHighlight() {
  const os = useSyncExternalStore(subscribe, detectOS, () => "");
  if (!os) return null;
  return <p className="installer-os-hint" data-detected-os={os}>Your browser appears to use {os === "macos" ? "macOS — choose Apple Silicon or Intel" : os === "windows" ? "Windows — confirm your machine supports x64" : "Linux — confirm your machine supports x64 GNU"}. All downloads remain available below.</p>;
}
