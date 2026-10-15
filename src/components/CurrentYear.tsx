"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

// Rendered on the client so the static shell never bakes in a stale year.
export function CurrentYear() {
  const year = useSyncExternalStore(
    noop,
    () => new Date().getFullYear(),
    () => null,
  );
  return <>{year}</>;
}
