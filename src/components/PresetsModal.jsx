import React from 'react';
import { X, Sliders, ArrowRight, Palette } from 'lucide-react';
import { STYLE_PRESETS } from '../utils/sampleImages';

export default function PresetsModal({ isOpen, onClose, onSelectPreset, theme = 'dark' }) {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-xl rounded-xl shadow-2xl overflow-hidden font-tech border ${
          isDark
            ? 'bg-[#0c1017] border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-300 text-slate-900 shadow-slate-900/20'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? 'border-slate-800 bg-[#0f141f]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 text-cyan-500">
            <Sliders className="w-4 h-4" />
            <h3
              className={`text-sm font-bold tracking-wide uppercase ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              CCTV Style & Detection Presets
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

        {/* Preset Cards */}
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Pilih konfigurasi gaya visual dan mode deteksi (Dark/Bright/Contrast/Combined) dari video referensi:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className={`flex flex-col text-left p-3.5 rounded-lg border transition-all group cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-cyan-500/50'
                    : 'bg-slate-50 hover:bg-cyan-50/50 border-slate-200 hover:border-cyan-400'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-sm"
                      style={{ backgroundColor: preset.themeColor }}
                    />
                    <span
                      className={`font-bold text-xs group-hover:text-cyan-500 ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      {preset.colorName}
                    </span>
                  </div>
                  <ArrowRight
                    className={`w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 transition-transform group-hover:translate-x-0.5`}
                  />
                </div>
                <p
                  className={`text-[11px] line-clamp-2 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {preset.description}
                </p>
                <div className="mt-2.5 flex items-center gap-2 text-[10px]">
                  <span
                    className={`px-1.5 py-0.5 rounded uppercase font-semibold ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Mode: {preset.detectionMode}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Grid: {preset.blockSize}px
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
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
