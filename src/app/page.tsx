"use client";

import type React from "react";
import { useRef, useState } from "react";

function parseResult(text: string | null | undefined): string[] {
  if (text == null || typeof text !== "string") return [];
  try {
    return text
      .split(/\n{2,}/)
      .map((chunk) => (chunk && typeof chunk === "string" ? chunk.trim() : ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export default function HomePage() {
  console.log("Rendering...");

  const [image, setImage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

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
      setError("");
      setResult("");

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

  const sections = parseResult(result);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <div className="max-w-2xl px-6 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">
          Welcome to <span className="text-sky-400">Rizziq App</span>
        </h1>
        <p className="mt-4 text-slate-300">
          Next.js App Router project using TypeScript, Tailwind CSS, and the{" "}
          <code className="rounded bg-slate-900 px-1.5 py-0.5 text-sm">
            src/
          </code>{" "}
          directory.
        </p>
        <p className="mt-6 text-sm text-slate-500">
          Upload an image to scan it with the RizzIQ brain and view the AI
          analysis results below.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={loading}
            className="inline-flex items-center rounded-full bg-sky-500 px-6 py-2 text-sm font-medium text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Scanning..." : "Upload image"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {loading && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
              <p className="text-sm text-slate-300">Scanning...</p>
            </div>
          )}

          {!loading && image && !result && !error && (
            <p className="text-xs text-slate-500">
              Image loaded. Sending to the brain for analysis...
            </p>
          )}

          {error && (
            <p className="mt-2 max-w-md text-sm text-rose-400">{error}</p>
          )}
        </div>

        {Array.isArray(sections) && sections.length > 0 && !loading && (
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            {sections.map((section, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-100 shadow"
              >
                <p className="whitespace-pre-line">{section ?? ""}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
