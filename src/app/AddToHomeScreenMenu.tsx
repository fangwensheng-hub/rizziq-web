"use client";

import { useState, useEffect, useRef } from "react";
import { MoreVertical, X } from "lucide-react";

export default function AddToHomeScreenMenu() {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<{
    prompt: () => Promise<void>;
  } | null>(null);
  const [hintType, setHintType] = useState<"ios" | "android" | null>(null);
  const [hideInStandalone, setHideInStandalone] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    setHideInStandalone(standalone);

    const handler = (e: Event) => {
      e.preventDefault();
      const ev = e as unknown as { prompt: () => Promise<void> };
      setDeferredPrompt({ prompt: () => ev.prompt() });
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const handleAddToHome = () => {
    setOpen(false);
    if (deferredPrompt) {
      deferredPrompt.prompt();
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setHintType(isIOS ? "ios" : "android");
      setShowHint(true);
    }
  };

  const handleInstall = () => {
    setOpen(false);
    if (deferredPrompt) {
      deferredPrompt.prompt();
    } else {
      setHintType("android");
      setShowHint(true);
    }
  };

  if (hideInStandalone) return null;

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="rounded-full p-2 text-white/90 transition hover:bg-white/10"
        title="More options"
        aria-label="More options"
      >
        <MoreVertical size={22} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[70] mt-1 min-w-[180px] rounded-xl border border-slate-700 bg-slate-900 py-1 shadow-xl">
          <button
            type="button"
            onClick={handleAddToHome}
            className="w-full px-4 py-2.5 text-left text-sm text-slate-200 transition hover:bg-slate-800"
          >
            Add to Home screen
          </button>
          <button
            type="button"
            onClick={handleInstall}
            className="w-full px-4 py-2.5 text-left text-sm text-slate-200 transition hover:bg-slate-800"
          >
            Install app
          </button>
        </div>
      )}

      {showHint && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold text-white">
                Add to Home Screen
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowHint(false);
                  setHintType(null);
                }}
                className="rounded p-1 text-slate-400 hover:bg-slate-700"
              >
                <X size={20} />
              </button>
            </div>
            {hintType === "ios" ? (
              <div className="mb-4 space-y-3 text-sm text-slate-300">
                <p className="font-medium text-white">In Safari:</p>
                <ol className="list-decimal list-inside space-y-2 pl-1">
                  <li>Tap the <strong>Share</strong> icon (square with up arrow) at the bottom</li>
                  <li>Scroll and tap <strong>Add to Home Screen</strong></li>
                  <li>Tap <strong>Add</strong></li>
                </ol>
              </div>
            ) : (
              <div className="mb-4 space-y-3 text-sm text-slate-300">
                <p className="font-medium text-white">In Chrome:</p>
                <ol className="list-decimal list-inside space-y-2 pl-1">
                  <li>Tap the <strong>⋮</strong> (three dots) in the browser bar</li>
                  <li>Tap <strong>Add to Home screen</strong> or <strong>Install app</strong></li>
                </ol>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setShowHint(false);
                setHintType(null);
              }}
              className="w-full rounded-xl bg-slate-700 py-3 font-semibold text-slate-200"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
