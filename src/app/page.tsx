"use client";

import { useState, useRef } from "react";
import { Upload, Zap, Loader2, RefreshCw, MessageSquare } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 图片处理逻辑
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        analyzeImage(base64); // 上传即开始分析
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. 核心分析逻辑
  const analyzeImage = async (base64Image: string) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setLoading(false);
  };

  // --- 界面渲染 ---
  return (
    <main className="relative min-h-screen w-full bg-[#050505] text-white font-sans overflow-hidden flex flex-col">
      
      {/* 背景光晕装饰 */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-purple-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-full h-1/3 bg-blue-900/10 blur-[100px] pointer-events-none"></div>

      {/* 顶部导航 (固定) */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <h1 className="text-xl font-bold tracking-tighter bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          RizzIQ.ai
        </h1>
        <div className="flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-widest text-purple-300">
          <Zap size={10} fill="currentColor" /> PRO
        </div>
      </nav>

      {/* --- 核心内容区 (垂直居中) --- */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 w-full max-w-md mx-auto z-10">
        
        {/* 状态 A: 待机 (Home) */}
        {!loading && !result && (
          <div className="w-full flex flex-col items-center space-y-10 animate-in fade-in duration-700">
            
            {/* 雷达扫描动画按钮 */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              {/* 外圈光环动画 */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition duration-500 animate-pulse"></div>
              
              {/* 核心圆形 */}
              <div className="relative w-48 h-48 bg-black rounded-full border border-slate-800 flex flex-col items-center justify-center shadow-2xl shadow-purple-900/20 active:scale-95 transition-transform">
                <div className="mb-3 p-4 bg-white/5 rounded-full">
                  <Upload className="w-8 h-8 text-purple-400" />
                </div>
                <span className="text-xs font-bold tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">
                  UPLOAD
                </span>
              </div>
            </div>

            {/* 文字引导 */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Don't Text Alone.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mx-auto">
                Upload a screenshot. Let AI verify the vibe and tell you exactly what to say.
              </p>
            </div>

            {/* 主按钮 (一致性修正) */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl font-bold text-lg tracking-wide shadow-lg shadow-purple-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Zap size={20} fill="currentColor" />
              SCAN CHAT
            </button>
            
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">
              Powered by Psychology & AI
            </p>
          </div>
        )}

        {/* 状态 B: 加载中 (Loading) */}
        {loading && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-300">
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
            <div className="space-y-2 text-center">
              <p className="text-xl font-bold text-white tracking-wide">ANALYZING...</p>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                Detecting Red Flags
              </p>
            </div>
          </div>
        )}

        {/* 状态 C: 结果展示 (Results) */}
        {result && (
          <div className="w-full space-y-6 pb-10 animate-in slide-in-from-bottom-10 duration-500">
            
            {/* 分析气泡 */}
            <div className="bg-slate-900/80 border border-purple-500/20 p-6 rounded-3xl backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3 text-purple-400 text-xs font-bold uppercase tracking-widest">
                <Zap size={14} /> The Vibe Check
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">
                {result.analysis}
              </p>
            </div>

            {/* 选项列表 */}
            <div className="space-y-4">
              {result.options?.map((opt: any, i: number) => {
                const styles = [
                  "border-purple-500/40 shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)]", // Maverick
                  "border-blue-500/40 shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]",   // Stoic
                  "border-emerald-500/40 shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]" // Mirror
                ];
                return (
                  <div key={i} className={`p-5 rounded-2xl bg-black border ${styles[i%3]}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {opt.title}
                      </span>
                      <MessageSquare size={14} className="text-slate-600" />
                    </div>
                    <p className="text-white font-medium text-base">
                      "{opt.content}"
                    </p>
                  </div>
                )
              })}
            </div>

            <button 
              onClick={reset}
              className="w-full py-4 bg-slate-800 rounded-2xl font-bold text-slate-400 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              SCAN ANOTHER
            </button>
          </div>
        )}

      </div>

      {/* 隐形文件上传控件 (Key Fix) */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload} 
      />
    </main>
  );
}
