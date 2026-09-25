import React from 'react';
import { X, Layers, ArrowRight } from 'lucide-react';
import { SAMPLE_PRESETS } from '../utils/sampleImages';

export default function PresetsModal({ isOpen, onClose, onSelectPreset }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0c1017] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden font-tech">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0f141f]">
          <div className="flex items-center gap-2 text-cyan-400">
            <Layers className="w-4 h-4" />
            <h3 className="text-sm font-bold tracking-wide uppercase text-slate-200">
              Reference Video Sample Scenes
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Cards */}
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-slate-400">
            Pilih salah satu adegan rekonstruksi dari video referensi untuk langsung menguji sistem deteksi kontras dan korupsi memori:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className="flex flex-col text-left p-3.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-black/40"
                      style={{ backgroundColor: preset.defaultColor }}
                    />
                    <span className="font-bold text-xs text-slate-200 group-hover:text-cyan-300">
                      {preset.name.split('(')[0]}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {preset.description}
                </p>
                <div className="mt-2.5 flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                    Mode: {preset.defaultMode}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Grid: {preset.defaultBlockSize}px
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
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
