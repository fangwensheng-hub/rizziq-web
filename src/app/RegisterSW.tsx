"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.location.protocol === "https:"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {})
        .catch((err) => {
          console.warn("SW registration failed", err);
        });
    }
  }, []);

  return null;
}
