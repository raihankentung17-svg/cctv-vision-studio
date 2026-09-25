import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Terminal, Sparkles } from 'lucide-react';
import { generateAlphaPrompt } from '../utils/promptGenerator';

export default function AlphaPromptModal({ isOpen, onClose, config, theme = 'dark' }) {
  const [copied, setCopied] = useState(false);

  // Hard Gate R-32: Keyboard accessibility (Escape key dismiss)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150"
    >
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative z-10 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden font-tech border ${
          isDark
            ? 'bg-[#0e121a] border-slate-800 text-slate-100'
            : 'bg-white border-slate-300 text-slate-900 shadow-slate-900/20'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? 'border-slate-800 bg-[#121722]' : 'border-slate-200 bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-2 text-amber-500">
            <Terminal className="w-4 h-4" />
            <h3
              id="prompt-modal-title"
              className={`text-sm font-bold tracking-wide uppercase ${
                isDark ? 'text-slate-200' : 'text-slate-900'
              }`}
            >
              The "Alpha Prompt" Formula (from video)
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup modal (Escape)"
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <p
            className={`text-xs leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            Formula prompt resmi dari video referensi CCTV Generator. Parameter warna, mode deteksi, dan label telah terisi secara dinamis sesuai konfigurasi aktif:
          </p>

          <div className="relative group">
            <pre
              className={`p-4 rounded-lg border text-xs whitespace-pre-wrap font-tech leading-relaxed select-all ${
                isDark
                  ? 'bg-black/90 border-slate-800 text-amber-200'
                  : 'bg-slate-900 border-slate-700 text-amber-300'
              }`}
            >
              {promptText}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer active:scale-95 min-h-[40px]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPY PROMPT</span>
                </>
              )}
            </button>
          </div>

          <div
            className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-cyan-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cara Pakai di AI Image Generator:</span>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              1. Buka Midjourney, Flux, Google Imagen, atau Stable Diffusion ControlNet.
            </p>
            <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              2. Lampirkan gambar base Anda dan paste prompt di atas.
            </p>
            <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              3. Atau gunakan tombol <span className="text-cyan-600 font-bold">Export Hi-Res</span> untuk menyimpan hasil render langsung dari aplikasi ini.
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
            className={`px-4 py-2 min-h-[40px] rounded text-xs font-tech font-bold transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            Tutup (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
