"use client";

import { useState, useRef } from "react";
import { Upload, RefreshCw, Zap, Loader2, MessageSquare, BrainCircuit } from "lucide-react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 图片处理
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64); // 仅用于预览
        analyzeImage(base64);
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
      
      // 成功后，强制清空图片，确保不占位
      setImage(null);
      setResult(data);
    } catch (error) {
      alert("Something went wrong. Please try again.");
      setImage(null); // 出错也重置
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setLoading(false);
  };

  // --- 界面渲染 ---
  return (
    <main className="min-h-screen w-full bg-black text-white px-4 py-6 md:max-w-md md:mx-auto flex flex-col relative overflow-hidden">
      
      {/* 背景光效 */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* 顶部导航 */}
      <nav className="flex justify-between items-center mb-10 z-10">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-purple-500" size={24} />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            RizzIQ
          </span>
        </div>
        <span className="text-xs font-bold px-2 py-1 bg-white/10 rounded-md border border-white/10 text-white/70">
          v1.0
        </span>
      </nav>

      {/* --- 阶段 1: 上传界面 (只有没结果且没加载时显示) --- */}
      {!result && !loading && (
        <div className="flex-1 flex flex-col justify-center items-center gap-8 z-10 animate-in fade-in duration-500">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer w-64 h-64 flex items-center justify-center"
          >
            {/* 动态圆环 */}
            <div className="absolute inset-0 border border-purple-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute inset-4 border border-blue-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
            
            {/* 中心按钮 */}
            <div className="w-40 h-40 bg-gradient-to-br from-purple-900/80 to-blue-900/80 rounded-full flex flex-col items-center justify-center border border-white/20 shadow-[0_0_50px_rgba(139,92,246,0.3)] group-hover:scale-105 transition-transform duration-300">
              <Upload className="w-10 h-10 text-white mb-2" />
              <span className="text-xs font-bold tracking-widest text-purple-200">UPLOAD</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Decode The Chat</h2>
            <p className="text-white/50 text-sm max-w-[250px] mx-auto">
              Upload a screenshot. Let AI analyze the vibe and write the perfect reply.
            </p>
          </div>
        </div>
      )}

      {/* --- 阶段 2: 加载界面 --- */}
      {loading && (
        <div className="flex-1 flex flex-col justify-center items-center gap-6 z-10">
          <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
          <div className="text-center">
            <p className="text-lg font-bold">ANALYZING...</p>
            <p className="text-sm text-white/50">Reading psychology cues</p>
          </div>
        </div>
      )}

      {/* --- 阶段 3: 结果界面 (绝对纯净) --- */}
      {result && (
        <div className="flex flex-col gap-6 z-10 animate-in slide-in-from-bottom-10 duration-700 pb-10">
          
          {/* 1. 分析板块 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3 text-purple-400">
              <Zap size={16} fill="currentColor" />
              <span className="text-xs font-bold tracking-widest uppercase">The Vibe Check</span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed break-words">
              {result.analysis}
            </p>
          </div>

          {/* 2. 选项板块 */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Suggested Replies</p>
            
            {result.options?.map((opt: any, idx: number) => (
              <div 
                key={idx} 
                className="relative bg-black border border-white/10 rounded-xl p-5 shadow-lg active:scale-[0.98] transition-transform overflow-hidden"
              >
                {/* 左侧彩色条 */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  idx === 0 ? 'bg-purple-500' : idx === 1 ? 'bg-blue-500' : 'bg-green-500'
                }`}></div>
                
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                    idx === 0 ? 'bg-purple-500/20 text-purple-300' : 
                    idx === 1 ? 'bg-blue-500/20 text-blue-300' : 
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {opt.title}
                  </span>
                  <MessageSquare size={14} className="text-white/20" />
                </div>
                
                {/* 核心回复文字：强制换行，防止串门 */}
                <p className="text-base font-medium text-white leading-normal break-words whitespace-pre-wrap">
                  "{opt.content}"
                </p>
              </div>
            ))}
          </div>

          {/* 3. 重置按钮 */}
          <button 
            onClick={reset}
            className="mt-4 w-full py-4 rounded-xl border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            SCAN ANOTHER
          </button>
        </div>
      )}

      {/* 隐藏的 input */}
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
