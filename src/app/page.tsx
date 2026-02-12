"use client";

import type React from "react";
import { useRef, useState } from "react";

type ParsedRizzIQResult = {
  analysis: string;
  maverick: string;
  stoic: string;
  mirror: string;
};

function parseRizzIQResult(text: string | null | undefined): ParsedRizzIQResult {
  if (text == null || typeof text !== "string") {
    return { analysis: "", maverick: "", stoic: "", mirror: "" };
  }

  const cleaned = text.replace(/\r\n/g, "\n").trim();

  const analysisLabel = /Analysis[:\-]?\s*/i;
  const optionsLabel = /The Options?[:\-]?\s*/i;

  let analysis = "";
  let optionsBlock = "";

  const analysisMatch = cleaned.match(analysisLabel);
  const optionsMatch = cleaned.match(optionsLabel);

  if (
    analysisMatch &&
    typeof analysisMatch.index === "number" &&
    optionsMatch &&
    typeof optionsMatch.index === "number"
  ) {
    const analysisStart = analysisMatch.index + analysisMatch[0].length;
    const optionsStart = optionsMatch.index;
    analysis = cleaned.slice(analysisStart, optionsStart).trim();
    optionsBlock = cleaned.slice(optionsStart + optionsMatch[0].length).trim();
  } else if (analysisMatch && typeof analysisMatch.index === "number") {
    const analysisStart = analysisMatch.index + analysisMatch[0].length;
    analysis = cleaned.slice(analysisStart).trim();
  } else {
    analysis = cleaned;
  }

  const source = optionsBlock || cleaned;

  const extractOption = (label: "Maverick" | "Stoic" | "Mirror", textSource: string) => {
    const pattern = new RegExp(
      `${label}[:\\-]?\\s*([\\s\\S]*?)(?=(Maverick|Stoic|Mirror)[:\\-]?|$)`,
      "i",
    );
    const match = textSource.match(pattern);
    if (!match || !match[1]) return "";
    return match[1].trim();
  };

  const maverick = extractOption("Maverick", source);
  const stoic = extractOption("Stoic", source);
  const mirror = extractOption("Mirror", source);

  return { analysis, maverick, stoic, mirror };
}

export default function HomePage() {
  const [image, setImage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [selectedTone, setSelectedTone] = useState<"maverick" | "stoic" | "mirror" | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    setError("");
    fileInputRef.current?.click();
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const value = typeof reader.result === "string" ? reader.result : "";
        resolve(value);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const analyzeImage = async (base64: string) => {
    try {
      setLoading(true);
      setResult("");
      setError("");
      setSelectedTone(null);

      const stripped =
        typeof base64 === "string" && base64.startsWith("data:") && base64.includes(",")
          ? base64.split(",")[1] ?? ""
          : typeof base64 === "string"
            ? base64
            : "";

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: stripped }),
      });

      let data: unknown;
      try {
        data = await res.json();
      } catch {
        setError("Invalid response from server.");
        return;
      }

      if (!res.ok) {
        const errMsg =
          data != null && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : `Request failed with status ${res.status}`;
        setError(errMsg);
        return;
      }

      const textResult =
        data != null && typeof data === "object" && "result" in data && typeof (data as { result: unknown }).result === "string"
          ? (data as { result: string }).result
          : typeof data === "string"
            ? data
            : JSON.stringify(data ?? {}, null, 2);

      setResult(textResult);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong while analyzing the image.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event?.target;
    if (!target) return;
    const file = target.files?.[0];
    if (!file) return;

    try {
      const base64 = await toBase64(file);
      setImage(base64);
      await analyzeImage(base64);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to read the selected image. Please try again.";
      setError(message);
    } finally {
      if (target) target.value = "";
    }
  };

  const parsed = parseRizzIQResult(result);
  const hasAnalysis = Boolean(parsed.analysis);
  const hasOptions = Boolean(parsed.maverick || parsed.stoic || parsed.mirror);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-8 text-slate-100">
      <div className="relative w-full max-w-md">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-x-0 -top-16 -z-10 flex justify-center">
          <div className="h-40 w-72 bg-gradient-to-tr from-purple-500/40 via-sky-500/30 to-emerald-400/40 blur-3xl" />
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-purple-500/25 bg-white/5 shadow-[0_0_45px_rgba(168,85,247,0.5)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -left-32 top-10 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
            <div className="absolute -right-40 bottom-0 h-52 w-52 rounded-full bg-sky-500/20 blur-3xl" />
          </div>

          <div className="relative space-y-6 p-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500 via-sky-500 to-emerald-400 text-xs font-semibold uppercase tracking-[0.25em] text-slate-950 shadow-[0_0_25px_rgba(129,140,248,0.9)]">
                RQ
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">
                  social game assistant
                </p>
                <h1 className="text-3xl font-semibold leading-tight">
                  <span className="bg-gradient-to-r from-purple-400 via-sky-400 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(94,234,212,0.8)]">
                    RizzIQ
                  </span>
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Upload a screenshot of your chat and let the{" "}
              <span className="text-sky-400">RizzIQ brain</span> decode the vibe and suggest your
              next move.
            </p>

            {/* Scan button & file input */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={loading}
                className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-purple-500 via-sky-500 to-purple-500 px-5 py-4 text-left text-sm font-semibold uppercase tracking-[0.25em] text-slate-50 shadow-[0_0_30px_rgba(129,140,248,0.8)] transition hover:brightness-110 hover:shadow-[0_0_45px_rgba(129,140,248,1)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{loading ? "SCANNING" : "SCAN CHAT"}</span>
                <span className="flex items-center gap-1 text-[0.65rem] font-normal tracking-[0.2em] text-slate-100/80">
                  <span className="h-1 w-1 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.9)] group-disabled:animate-pulse" />
                  LIVE
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <p className="text-[0.72rem] text-slate-400">
                Best results with full conversation screenshots. We never store your images.
              </p>
            </div>

            {/* Image preview */}
            {image && (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                <div className="flex items-center justify-between px-3 pt-2 text-[0.7rem] text-slate-400">
                  <span>Preview</span>
                  {loading && (
                    <span className="flex items-center gap-1 text-emerald-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                      scanning
                    </span>
                  )}
                </div>
                <div className="mt-2 max-h-52 overflow-hidden border-t border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="Uploaded chat screenshot preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Loading radar */}
            {loading && (
              <div className="flex flex-col items-center gap-3 pt-2">
                <div className="relative h-24 w-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/40 via-sky-500/30 to-emerald-400/40 blur-xl opacity-80" />
                  <div className="relative flex h-full w-full items-center justify-center rounded-full border border-sky-500/40 bg-black/60">
                    <div className="h-12 w-12 animate-spin rounded-full border-2 border-sky-400/80 border-t-transparent" />
                    <div className="absolute inset-3 rounded-full border border-dashed border-emerald-300/40 animate-[spin_4s_linear_infinite]" />
                  </div>
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  scanning dialogue
                </p>
              </div>
            )}

            {/* Error */}
            {error && <p className="text-sm text-rose-400">{error}</p>}

            {/* Analysis & options */}
            {!loading && result && (
              <div className="space-y-5 pt-2">
                {hasAnalysis && (
                  <section className="space-y-2">
                    <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
                      <span className="h-1 w-5 rounded-full bg-purple-400/70" />
                      <span>AI analysis</span>
                    </div>
                    <div className="rounded-2xl border border-purple-500/40 bg-white/5 p-4 text-sm leading-relaxed text-slate-100 shadow-[0_0_32px_rgba(168,85,247,0.5)] backdrop-blur-xl">
                      <p className="whitespace-pre-line">{parsed.analysis}</p>
                    </div>
                  </section>
                )}

                {hasOptions && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
                      <span>the options</span>
                      <span className="text-slate-500">tap a playstyle</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {parsed.maverick && (
                        <button
                          type="button"
                          onClick={() => setSelectedTone("maverick")}
                          className={`flex flex-col items-start gap-1 rounded-2xl border bg-purple-500/5 p-3 text-left text-xs text-slate-100 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition hover:border-purple-300 hover:bg-purple-500/10 hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] ${
                            selectedTone === "maverick"
                              ? "border-purple-300 ring-2 ring-purple-400/80"
                              : "border-purple-500/60"
                          }`}
                        >
                          <span className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-purple-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-300 shadow-[0_0_10px_rgba(168,85,247,1)]" />
                            Maverick
                          </span>
                          <p className="max-h-32 overflow-y-auto pr-1 text-[0.7rem] leading-snug text-slate-100/90">
                            {parsed.maverick}
                          </p>
                        </button>
                      )}

                      {parsed.stoic && (
                        <button
                          type="button"
                          onClick={() => setSelectedTone("stoic")}
                          className={`flex flex-col items-start gap-1 rounded-2xl border bg-sky-500/5 p-3 text-left text-xs text-slate-100 shadow-[0_0_20px_rgba(56,189,248,0.4)] transition hover:border-sky-300 hover:bg-sky-500/10 hover:shadow-[0_0_30px_rgba(56,189,248,0.7)] ${
                            selectedTone === "stoic"
                              ? "border-sky-300 ring-2 ring-sky-400/80"
                              : "border-sky-500/60"
                          }`}
                        >
                          <span className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-sky-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(56,189,248,1)]" />
                            Stoic
                          </span>
                          <p className="max-h-32 overflow-y-auto pr-1 text-[0.7rem] leading-snug text-slate-100/90">
                            {parsed.stoic}
                          </p>
                        </button>
                      )}

                      {parsed.mirror && (
                        <button
                          type="button"
                          onClick={() => setSelectedTone("mirror")}
                          className={`flex flex-col items-start gap-1 rounded-2xl border bg-emerald-500/5 p-3 text-left text-xs text-slate-100 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition hover:border-emerald-300 hover:bg-emerald-500/10 hover:shadow-[0_0_30px_rgba(16,185,129,0.7)] ${
                            selectedTone === "mirror"
                              ? "border-emerald-300 ring-2 ring-emerald-400/80"
                              : "border-emerald-500/60"
                          }`}
                        >
                          <span className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(16,185,129,1)]" />
                            Mirror
                          </span>
                          <p className="max-h-32 overflow-y-auto pr-1 text-[0.7rem] leading-snug text-slate-100/90">
                            {parsed.mirror}
                          </p>
                        </button>
                      )}
                    </div>
                  </section>
                )}

                {/* Fallback: raw text if parsing fails */}
                {!hasAnalysis && !hasOptions && result && (
                  <section className="space-y-2">
                    <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
                      <span className="h-1 w-5 rounded-full bg-slate-400/70" />
                      <span>response</span>
                    </div>
                    <div className="rounded-2xl border border-slate-700/80 bg-black/40 p-4 text-xs leading-relaxed text-slate-100/90">
                      <pre className="whitespace-pre-wrap break-words">{result}</pre>
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Empty state helper */}
            {!loading && !result && !error && (
              <p className="text-[0.75rem] text-slate-500">
                Tap <span className="text-sky-300">SCAN CHAT</span> to analyze your latest
                conversation.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
