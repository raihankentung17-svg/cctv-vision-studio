import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Sparkles } from 'lucide-react';
import { generateAlphaPrompt } from '../utils/promptGenerator';

export default function AlphaPromptModal({ isOpen, onClose, config, theme = 'dark' }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

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
      <div
        className={`relative w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden font-tech border ${
          isDark
            ? 'bg-[#0c1017] border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-300 text-slate-900 shadow-slate-900/20'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? 'border-slate-800 bg-[#0f141f]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 text-amber-500">
            <Terminal className="w-4 h-4" />
            <h3
              className={`text-sm font-bold tracking-wide uppercase ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              The "Alpha Prompt" Formula (from video)
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-black hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Ini adalah formula prompt resmi yang ditampilkan pada video tutorial Nano Banana ("CCTV GENERATOR"). Prompt ini telah diisi secara dinamis sesuai konfigurasi warna dan label tracking yang sedang Anda gunakan saat ini:
          </p>

          <div className="relative group">
            <pre
              className={`p-4 rounded-lg border text-xs whitespace-pre-wrap font-tech leading-relaxed select-all ${
                isDark
                  ? 'bg-black/70 border-slate-800 text-amber-200/90'
                  : 'bg-slate-900 border-slate-800 text-amber-300'
              }`}
            >
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

          <div
            className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
              isDark
                ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-cyan-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cara Pakai di AI Image Generator:</span>
            </div>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              1. Buka Midjourney, Flux, Google Imagen, atau Stable Diffusion ControlNet.
            </p>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              2. Lampirkan (*attach*) gambar base Anda dan paste prompt di atas.
            </p>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              3. Atau Anda bisa langsung menikmati hasil render instan tanpa batas di aplikasi ini dengan tombol <span className="text-cyan-500 font-semibold">Export Hi-Res</span>!
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-5 py-3 border-t flex justify-end ${
            isDark ? 'bg-[#0a0d14] border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded text-xs font-tech font-medium transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
