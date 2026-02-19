"use client";

import { useState, useEffect } from "react";
import { Share2, X } from "lucide-react";

export default function AddToHomeScreen() {
  const [showHint, setShowHint] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<{
    prompt: () => Promise<void>;
  } | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as never)["MSStream"]);
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as { standalone?: boolean }).standalone === true
    );

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt({ prompt: () => (e as { prompt: () => Promise<void> }).prompt() });
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      setDeferredPrompt(null);
    }
    setShowHint(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowHint(true)}
        className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800/50 hover:text-white"
        title="Add to Home Screen"
      >
        <Share2 size={20} />
      </button>

      {showHint && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold text-white">Add to Home Screen</span>
              <button
                type="button"
                onClick={() => setShowHint(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-700"
              >
                <X size={20} />
              </button>
            </div>
            {deferredPrompt ? (
              <p className="mb-4 text-sm text-slate-300">
                Tap below to install RizzIQ like a native app.
              </p>
            ) : isIOS ? (
              <div className="mb-4 space-y-2 text-sm text-slate-300">
                <p>In Safari, tap the <strong>Share</strong> button (square with arrow), then choose <strong>Add to Home Screen</strong>.</p>
              </div>
            ) : (
              <div className="mb-4 space-y-2 text-sm text-slate-300">
                <p>Tap the <strong>⋮</strong> menu, then choose <strong>Add to Home Screen</strong> or <strong>Install app</strong>.</p>
              </div>
            )}
            {deferredPrompt ? (
              <button
                type="button"
                onClick={handleInstall}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white"
              >
                Install RizzIQ
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowHint(false)}
                className="w-full rounded-xl bg-slate-700 py-3 font-semibold text-slate-200"
              >
                Got it
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
