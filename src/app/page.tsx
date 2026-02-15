"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Zap,
  Loader2,
  RefreshCw,
  Copy,
  RotateCcw,
} from "lucide-react";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type Option = {
  title: string;
  content: string;
};

type AnalysisResult = {
  analysis: string;
  options: Option[];
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [lastAnalyzedImage, setLastAnalyzedImage] = useState<string | null>(
    null,
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(
        `Image too large. Maximum size is ${MAX_FILE_SIZE_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB. Try a smaller screenshot.`
      );
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const value = reader.result;
      if (typeof value === "string") {
        analyzeImage(value);
      } else {
        setError("Unable to read image. Please try another file.");
      }
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Image: string) => {
    try {
      setLastAnalyzedImage(base64Image);
      setUploadedImage(base64Image);
      setLoading(true);
      setResult(null);
      setError(null);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      let data: { error?: string; analysis?: string; options?: unknown[] };
      try {
        data = await response.json();
      } catch {
        setError(
          response.ok
            ? "Could not read server response."
            : `Request failed (${response.status}). Check the terminal for details.`
        );
        return;
      }

      if (!response.ok) {
        const message =
          data && typeof data.error === "string"
            ? data.error
            : `Request failed with status ${response.status}`;
        setError(message);
        return;
      }

      if (!data || typeof data !== "object") {
        setError("Invalid response from AI.");
        return;
      }

      const analysis =
        typeof (data as { analysis?: string }).analysis === "string"
          ? (data as { analysis: string }).analysis.trim()
          : "";

      const rawOptions = Array.isArray((data as { options?: unknown[] }).options)
        ? (data as { options: unknown[] }).options
        : [];

      const options: Option[] = rawOptions
        .map((opt: unknown) => {
          const o = opt as { title?: string; content?: string };
          return {
            title: o && typeof o.title === "string" ? o.title : "Option",
            content: o && typeof o.content === "string" ? o.content : "",
          };
        })
        .filter((opt: Option) => opt.content.length > 0);

      setResult({ analysis, options });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network or unknown error.";
      setError(msg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setUploadedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleScanAnother = () => {
    setResult(null);
    setError(null);
    setLoading(false);
    setUploadedImage(null);
    setLastAnalyzedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTryAgain = () => {
    if (lastAnalyzedImage) {
      analyzeImage(lastAnalyzedImage);
    }
  };

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const getOptionStyle = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("maverick")) {
      return "border-purple-500/50 shadow-[0_0_30px_-10px_rgba(168,85,247,0.4)]";
    }
    if (lower.includes("stoic")) {
      return "border-blue-500/50 shadow-[0_0_30px_-10px_rgba(59,130,246,0.4)]";
    }
    if (lower.includes("mirror")) {
      return "border-emerald-500/50 shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)]";
    }
    return "border-slate-600/60 shadow-[0_0_24px_-10px_rgba(148,163,184,0.3)]";
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#000000] text-white font-sans">
      {/* ambient glows - subtle pink/blue to match logo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-pink-900/15 blur-[100px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-blue-900/10 blur-[90px]" />

      {/* top nav: logo left, RizzIQ right, heights aligned */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex h-[3.5rem] items-center justify-between gap-3 border-b border-white/[0.06] bg-black/95 px-4 backdrop-blur-md sm:px-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center sm:h-12 sm:w-12">
          <img
            src="/logo.jpg?v=2"
            alt="RizzIQ"
            width={48}
            height={48}
            className="h-full w-auto object-contain"
            fetchPriority="high"
          />
        </div>
        <h1 className="shrink-0 text-xl font-bold leading-[2.5rem] tracking-tight sm:text-2xl sm:leading-[2.75rem]">
          <span className="whitespace-nowrap bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            RizzIQ
          </span>
        </h1>
      </nav>

      {/* main content */}
      <div className="z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-10 pt-24">
        {error && (
          <div className="mb-4 rounded-xl border-2 border-rose-500/60 bg-rose-950/90 px-4 py-4 text-sm font-medium text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
            <span className="font-semibold">Error: </span>
            {error}
          </div>
        )}

        {/* Idle / upload state */}
        {!loading && !result && (
          <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-10">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer"
            >
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-purple-600 to-sky-500 opacity-25 blur-2xl transition duration-500" />
              <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-slate-800 bg-slate-950/70 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
                <div className="absolute inset-4 rounded-full border-t-2 border-purple-500/80 animate-spin [animation-duration:3200ms]" />
                <div className="relative flex flex-col items-center gap-3">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <Upload className="h-8 w-8 text-purple-400" />
                  </div>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Upload chat
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Don&apos;t text alone.
              </h2>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-400">
                Upload a screenshot. RizzIQ analyzes the vibe and gives you
                three responses that actually fit.
              </p>
              <p className="text-[0.65rem] text-slate-500">
                Max {MAX_FILE_SIZE_MB}MB per image
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-lg font-bold tracking-wide shadow-[0_0_28px_rgba(129,140,248,0.45)] transition active:scale-[0.98]"
            >
              <Zap size={20} className="text-white" />
              SCAN CHAT
            </button>

            <p className="text-[0.6rem] uppercase tracking-[0.28em] text-slate-600">
              Powered by psychology &amp; AI
            </p>
          </div>
        )}

        {/* Loading state: blurred sinking background + loader */}
        {loading && (
          <div className="relative flex min-h-[70vh] flex-col items-center justify-center space-y-6">
            {uploadedImage && (
              <div
                className="pointer-events-none fixed inset-0 z-0 animate-sink"
                aria-hidden
              >
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 blur-2xl"
                  style={{ backgroundImage: `url(${uploadedImage})` }}
                />
                <div className="absolute inset-0 bg-black/50" />
              </div>
            )}
            <div className="relative z-10 flex flex-col items-center space-y-6">
              <Loader2 className="h-16 w-16 animate-spin text-purple-400" />
              <div className="space-y-2 text-center">
                <p className="text-xl font-semibold tracking-wide text-white">
                  ANALYZING...
                </p>
                <p className="text-xs font-mono uppercase tracking-[0.28em] text-slate-500">
                  reading dynamics &amp; intent
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results state */}
        {result && !loading && (
          <div className="space-y-6 pb-4">
            {/* analysis card */}
            {result.analysis && (
              <section className="rounded-3xl border border-purple-500/30 bg-slate-950/80 p-6 backdrop-blur-xl shadow-[0_0_36px_rgba(168,85,247,0.45)]">
                <div className="mb-3 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-purple-300">
                  <Zap size={14} className="text-purple-300" />
                  <span>The vibe check</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-100">
                  {result.analysis}
                </p>
              </section>
            )}

            {/* options */}
            <section className="space-y-4">
              {result.options.map((opt, index) => (
                <article
                  key={`${opt.title}-${index}`}
                  className={`rounded-2xl bg-black/90 p-5 ${getOptionStyle(
                    opt.title,
                  )} border`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-slate-400">
                      {opt.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(opt.content, index)}
                      className="rounded p-1.5 text-slate-400 transition hover:bg-slate-700/50 hover:text-white"
                      title="Copy reply"
                    >
                      {copiedIndex === index ? (
                        <span className="text-[0.65rem] font-medium text-emerald-400">
                          Copied!
                        </span>
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                  <p className="text-base font-medium leading-relaxed text-slate-50">
                    &quot;{opt.content}&quot;
                  </p>
                </article>
              ))}

              {result.options.length === 0 && (
                <p className="text-xs text-slate-400">
                  No reply options suggested. RizzIQ likely detected a red flag
                  and advised not to engage.
                </p>
              )}
            </section>

            <div className="flex flex-col gap-3 pt-4">
              <button
                type="button"
                onClick={handleTryAgain}
                disabled={!lastAnalyzedImage}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-600 bg-transparent py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-800/50 disabled:opacity-50 disabled:hover:border-slate-600 disabled:hover:bg-transparent"
              >
                <RotateCcw size={16} />
                Try Again
              </button>
              <button
                type="button"
                onClick={handleScanAnother}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-800 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
              >
                <RefreshCw size={16} />
                Scan Another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </main>
  );
}
