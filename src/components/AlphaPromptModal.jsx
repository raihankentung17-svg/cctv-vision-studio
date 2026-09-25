import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, Sparkles } from 'lucide-react';
import { generateAlphaPrompt } from '../utils/promptGenerator';

export default function AlphaPromptModal({ isOpen, onClose, config }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const promptText = generateAlphaPrompt({
    colorName: config.colorName,
    colorHex: config.themeColor,
    labels: (config.boxes || []).map(b => b.label).filter(Boolean),
    detectionMode: config.detectionMode
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c1017] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden font-tech">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0f141f]">
          <div className="flex items-center gap-2 text-amber-400">
            <Terminal className="w-4 h-4" />
            <h3 className="text-sm font-bold tracking-wide uppercase text-slate-200">
              The "Alpha Prompt" Formula (from video)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <p className="text-xs text-slate-400 leading-relaxed">
            Ini adalah formula prompt resmi yang ditampilkan pada video tutorial Nano Banana ("CCTV GENERATOR"). Prompt ini telah diisi secara dinamis sesuai konfigurasi warna dan label tracking yang sedang Anda gunakan saat ini:
          </p>

          <div className="relative group">
            <pre className="p-4 rounded-lg bg-black/70 border border-slate-800 text-xs text-amber-200/90 whitespace-pre-wrap font-tech leading-relaxed select-all">
              {promptText}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY PROMPT</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cara Pakai di AI Image Generator:</span>
            </div>
            <p className="text-slate-400">
              1. Buka Midjourney, Flux, Google Imagen, atau Stable Diffusion ControlNet.
            </p>
            <p className="text-slate-400">
              2. Lampirkan (*attach*) gambar base Anda dan paste prompt di atas.
            </p>
            <p className="text-slate-400">
              3. Atau Anda bisa langsung menikmati hasil render instan tanpa batas di aplikasi ini dengan tombol <span className="text-cyan-300 font-semibold">Export Hi-Res</span>!
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#0a0d14] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-tech font-medium transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
