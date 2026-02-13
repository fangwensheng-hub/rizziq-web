"use client";

import { useState, useRef } from "react";
import { Upload, RefreshCw, Zap, Shield, Loader2 } from "lucide-react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 上传逻辑
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // 注意：这里我们设置图片用于预览，但一旦开始分析，我们将隐藏它
        setImage(base64);
        analyzeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // API 调用
  const analyzeImage = async (base64Image: string) => {
    setLoading(true);
    setResult(null); // 清空旧结果
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      // 直接使用后端返回的 JSON，无需解析
      setResult(data); 
      
      // 关键修改：分析完成后，清除图片状态，强制隐藏大图
      setImage(null); 

    } catch (error) {
      alert("Error: Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setLoading(false);
  };

  return (
    <main className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 p-4 bg-[#050505]/80 backdrop-blur-md z-50 border-b border-white/5 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tighter bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          RizzIQ.ai
        </h1>
        <div className="flex items-center gap-1 px-2 py-1 bg-purple-900/30 border border-purple-500/30 rounded text-[10px] font-bold text-purple-300">
          <Zap size={10} fill="currentColor" /> PRO
        </div>
      </div>

      <div className="pt-20 px-4 pb-10 max-w-md mx-auto">
        
        {/* --- 状态 1: 待机 / 上传 --- */}
        {!loading && !result && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in fade-in duration-700">
            {/* 雷达动画 */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative w-40 h-40 rounded-full border border-slate-700 bg-slate-900/50 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 border-t-2 border-purple-500 rounded-full animate-spin duration-[3000ms]"></div>
                <Upload className="w-10 h-10 text-slate-400" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Upload Screenshot</h2>
              <p className="text-sm text-slate-400">Let AI decode the subtext.</p>
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-lg tracking-wide shadow-[0_0_20px_rgba(124,58,237,0.3)] active:scale-95 transition-all"
            >
              SCAN CHAT
            </button>
          </div>
        )}

        {/* --- 状态 2: 分析中 --- */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
            <div className="space-y-1 text-center">
              <p className="text-lg font-bold text-white">ANALYZING...</p>
              <p className="text-xs text-slate-500 font-mono">Detecting power dynamics</p>
            </div>
          </div>
        )}

        {/* --- 状态 3: 结果展示 (纯净模式) --- */}
        {result && (
          <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500">
            
            {/* 分析卡片 */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3 text-purple-400 uppercase text-xs font-bold tracking-widest">
                <Shield size={14} /> Psychology Analysis
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">
                {result.analysis}
              </p>
            </div>

            {/* 选项列表 */}
            <div className="space-y-4">
              {result.options && result.options.map((opt: any, i: number) => {
                const styles = [
                  { border: "border-purple-500/60", bg: "shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]" },
                  { border: "border-blue-500/60", bg: "shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]" },
                  { border: "border-emerald-500/60", bg: "shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]" }
                ];
                const style = styles[i % 3];

                return (
                  <div key={i} className={`group relative p-5 rounded-xl bg-black border ${style.border} ${style.bg}`}>
                    <div className="absolute top-3 right-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {opt.title}
                    </div>
                    <p className="text-white font-medium text-lg mt-2 pr-2">
                      "{opt.content}"
                    </p>
                  </div>
                )
              })}
            </div>

            {/* 底部按钮 */}
            <div className="pt-8 pb-4">
              <button 
                onClick={reset}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-semibold text-slate-300 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> Scan Another
              </button>
            </div>
          </div>
        )}

      </div>
      
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
