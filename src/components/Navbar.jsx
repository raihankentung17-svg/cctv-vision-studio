import React from 'react';
import {
  Camera,
  Terminal,
  Download,
  Sliders,
  Sun,
  Moon,
  Trash2,
  Cpu
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
      className={`h-15 border-b px-4 flex items-center justify-between z-30 select-none transition-colors duration-150 ${
        isDark
          ? 'border-slate-800 bg-[#0c1017] text-slate-100'
          : 'border-slate-300 bg-white text-slate-900 shadow-xs'
      }`}
    >
      {/* Brand & System Telemetry */}
      <div className="flex items-center gap-3">
        {/* Brand Badge with solid calm status indicator (No slop animate-ping) */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border font-tech text-xs font-semibold ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-slate-200'
              : 'bg-slate-100 border-slate-300 text-slate-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-xs" />
          <span className="tracking-wider">CCTV_STUDIO</span>
          <span className={isDark ? 'text-slate-500' : 'text-slate-600'}>v2.2</span>
        </div>

        {/* Sensor Diagnostics Status */}
        <div
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-tech border font-medium ${
            sensorStatus?.neuralAvailable
              ? isDark
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : isDark
              ? 'bg-cyan-950/50 border-cyan-800 text-cyan-300'
              : 'bg-cyan-50 border-cyan-300 text-cyan-800'
          }`}
          title={sensorStatus?.activeEngine || 'Detection Sensor'}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>SENSOR: {sensorStatus?.activeEngine || 'CV Ready'}</span>
        </div>

        {/* Telemetry info */}
        <div
          className={`hidden md:flex items-center gap-2 text-xs font-tech ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          <span className={isDark ? 'text-slate-700' : 'text-slate-400'}>|</span>
          <span className="font-semibold">MODE:</span>
          <span
            className={`px-2 py-0.5 rounded uppercase font-bold text-[11px] ${
              isDark ? 'bg-slate-800 text-cyan-400' : 'bg-slate-100 text-cyan-800'
            }`}
          >
            {detectionMode}
          </span>
          <span className={isDark ? 'text-slate-700' : 'text-slate-400'}>|</span>
          <span className="font-semibold">PALETTE:</span>
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded font-medium ${
              isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shadow-xs border border-black/20"
              style={{ backgroundColor: activeColor }}
            />
            <span>{colorName}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons (Strictly min-h-[44px] for touch targets on mobile) */}
      <div className="flex items-center gap-2 font-tech">
        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={onToggleTheme}
          aria-label={isDark ? 'Ganti ke Tema Terang' : 'Ganti ke Tema Gelap'}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-amber-400'
              : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-800'
          }`}
          title={isDark ? 'Ganti ke Tema Terang' : 'Ganti ke Tema Gelap'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Presets Button */}
        <button
          onClick={onOpenPresets}
          className={`min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-500'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900'
          }`}
          title="Pilih Style Preset"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-600" />
          <span className="hidden sm:inline">Presets</span>
        </button>

        {/* Alpha Prompt Button */}
        <button
          onClick={onOpenPrompt}
          className={`min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200 hover:text-amber-300'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900 hover:text-amber-800'
          }`}
          title="Lihat formula Alpha Prompt untuk AI"
        >
          <Terminal className="w-3.5 h-3.5 text-amber-500" />
          <span>Alpha Prompt</span>
        </button>

        {/* Clear Canvas Button */}
        {hasImage && (
          <button
            onClick={onClearCanvas}
            className={`min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              isDark
                ? 'bg-red-950/40 border-red-900/60 hover:bg-red-950/70 text-red-300'
                : 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700'
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
          className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
          title="Download gambar resolusi penuh (PNG)"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Export Hi-Res</span>
        </button>
      </div>
    </header>
  );
}
