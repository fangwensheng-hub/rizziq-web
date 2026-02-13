"use client";

import { useState, useRef } from "react";
import { Upload, Zap, Loader2, RefreshCw, MessageSquare } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      setLoading(true);
      setResult(null);
      setError(null);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await response.json();

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
        typeof (data as any).analysis === "string"
          ? (data as any).analysis.trim()
          : "";

      const rawOptions = Array.isArray((data as any).options)
        ? (data as any).options
        : [];

      const options: Option[] = rawOptions
        .map((opt) => ({
          title:
            opt && typeof opt.title === "string" ? opt.title : "Option",
          content:
            opt && typeof opt.content === "string" ? opt.content : "",
        }))
        .filter((opt) => opt.content.length > 0);

      setResult({ analysis, options });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleScanAnother = () => {
    setResult(null);
    setError(null);
    setLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
    <main className="relative min-h-screen w-full bg-[#050505] text-white font-sans overflow-hidden flex flex-col">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-purple-900/25 blur-[120px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-sky-900/20 blur-[110px]" />

      {/* top nav */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#050505]/80 px-6 py-4 backdrop-blur-md">
        <h1 className="text-xl font-bold tracking-tighter">
          <span className="bg-gradient-to-r from-purple-400 via-sky-400 to-cyan-300 bg-clip-text text-transparent">
            RizzIQ.ai
          </span>
        </h1>
        <div className="flex items-center gap-1 rounded-full border border-purple-500/40 bg-purple-900/30 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-purple-200 uppercase">
          <Zap size={10} className="text-purple-300" />
          <span>PRO</span>
        </div>
      </nav>

      {/* main content */}
      <div className="z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-10 pt-24">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-950/70 px-4 py-3 text-xs text-rose-100">
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

        {/* Loading state */}
        {loading && (
          <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-6">
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
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-slate-400">
                      {opt.title}
                    </span>
                    <MessageSquare
                      size={16}
                      className="text-slate-600"
                    />
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

            <div className="pt-4">
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
