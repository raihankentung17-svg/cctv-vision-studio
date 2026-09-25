import React from 'react';
import { Camera, Terminal, Copy, Download, Sparkles, Layers, Sliders } from 'lucide-react';

export default function Navbar({
  activeColor,
  colorName,
  detectionMode,
  onOpenPrompt,
  onExportImage,
  onOpenPresets,
  isScanning
}) {
  return (
    <header className="h-14 border-b border-slate-800 bg-[#0b0e14]/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & CCTV Telemetry */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-700/60 font-tech text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-white tracking-wider">CCTV_STUDIO</span>
          <span className="text-slate-500">v2.0</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-tech text-slate-400">
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">MODE:</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-400 uppercase font-semibold">
            {detectionMode}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">PALETTE:</span>
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-slate-800/80">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
              style={{ backgroundColor: activeColor }}
            />
            <span className="text-slate-200 capitalize font-medium">{colorName}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPresets}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-tech text-slate-200 transition-all cursor-pointer hover:border-slate-500"
          title="Choose a sample scene from the reference video"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Presets</span>
        </button>

        <button
          onClick={onOpenPrompt}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-tech text-slate-200 transition-all cursor-pointer hover:border-amber-500/50 hover:text-amber-300"
          title="View the exact prompt formula from the video"
        >
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span>Alpha Prompt</span>
        </button>

        <button
          onClick={onExportImage}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-tech font-bold text-xs shadow-lg shadow-cyan-900/30 transition-all cursor-pointer active:scale-95"
          title="Export high-resolution image"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Export Hi-Res</span>
        </button>
      </div>
    </header>
  );
}
