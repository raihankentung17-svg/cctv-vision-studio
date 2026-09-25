import React from 'react';
import {
  Camera,
  Terminal,
  Download,
  Sliders,
  Sun,
  Moon,
  Trash2,
  Cpu,
  Layers
} from 'lucide-react';

export default function Navbar({
  activeColor,
  colorName,
  detectionMode,
  theme = 'dark',
  onToggleTheme,
  onOpenPrompt,
  onExportImage,
  onOpenPresets,
  onClearCanvas,
  hasImage,
  sensorStatus
}) {
  const isDark = theme === 'dark';

  return (
    <header
      className={`h-14 border-b px-4 flex items-center justify-between z-30 select-none transition-colors duration-200 ${
        isDark
          ? 'border-slate-800 bg-[#0b0e14]/90 text-slate-100'
          : 'border-slate-200 bg-white/95 text-slate-900 shadow-xs'
      }`}
    >
      {/* Brand & System Telemetry */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-2.5 py-1 rounded border font-tech text-xs ${
            isDark
              ? 'bg-slate-900 border-slate-700/60 text-slate-300'
              : 'bg-slate-100 border-slate-300 text-slate-800'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className={`font-bold tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
            CCTV_STUDIO
          </span>
          <span className="text-slate-500">v2.1</span>
        </div>

        {/* Sensor Diagnostics Status */}
        <div
          className={`hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-tech border ${
            sensorStatus?.neuralAvailable
              ? isDark
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                : 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : isDark
              ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-400'
              : 'bg-cyan-50 border-cyan-300 text-cyan-700'
          }`}
          title={sensorStatus?.activeEngine || 'Detection Sensor'}
        >
          <Cpu className="w-3 h-3" />
          <span>SENSOR: {sensorStatus?.activeEngine || 'CV Ready'}</span>
        </div>

        {/* Telemetry info */}
        <div
          className={`hidden md:flex items-center gap-2 text-xs font-tech ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>|</span>
          <span>MODE:</span>
          <span
            className={`px-1.5 py-0.5 rounded uppercase font-semibold ${
              isDark ? 'bg-slate-800/80 text-cyan-400' : 'bg-slate-100 text-cyan-700'
            }`}
          >
            {detectionMode}
          </span>
          <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>|</span>
          <span>PALETTE:</span>
          <div
            className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded ${
              isDark ? 'bg-slate-800/80' : 'bg-slate-100'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shadow-xs"
              style={{ backgroundColor: activeColor }}
            />
            <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{colorName}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 font-tech">
        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={onToggleTheme}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-amber-400'
              : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
          }`}
          title={isDark ? 'Ganti ke Tema Terang (Light Mode)' : 'Ganti ke Tema Gelap (Dark Mode)'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Presets Button */}
        <button
          onClick={onOpenPresets}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200 hover:border-slate-500'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
          }`}
          title="Pilih Style Preset"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-500" />
          <span className="hidden sm:inline">Presets</span>
        </button>

        {/* Alpha Prompt Button */}
        <button
          onClick={onOpenPrompt}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-amber-300'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 hover:text-amber-700'
          }`}
          title="Lihat formula Alpha Prompt untuk AI"
        >
          <Terminal className="w-3.5 h-3.5 text-amber-500" />
          <span>Alpha Prompt</span>
        </button>

        {/* Clear / Reset Canvas Button */}
        {hasImage && (
          <button
            onClick={onClearCanvas}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-xs transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-red-900/60 hover:bg-red-950/50 text-red-400'
                : 'bg-red-50 border-red-200 hover:bg-red-100 text-red-600'
            }`}
            title="Kosongkan Kanvas (Clear Image)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Clear</span>
          </button>
        )}

        {/* Export Button */}
        <button
          onClick={onExportImage}
          disabled={!hasImage}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
          title="Download gambar resolusi penuh (PNG)"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Export Hi-Res</span>
        </button>
      </div>
    </header>
  );
}
