import React, { useRef } from 'react';
import {
  Upload,
  Sliders,
  Palette,
  Cpu,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import BoxManager from './BoxManager';

export const PALETTE_PRESETS = [
  { name: 'Acid Yellow', hex: '#FFE600' },
  { name: 'Tokyo Lavender', hex: '#C4B5FD' },
  { name: 'Cyber Blue', hex: '#0022FF' },
  { name: 'Matrix Green', hex: '#39FF14' },
  { name: 'Neon Magenta', hex: '#FF1493' },
  { name: 'Neon Cyan', hex: '#00F0FF' },
  { name: 'Glitch Coral', hex: '#FF3B30' },
  { name: 'Terminal White', hex: '#FFFFFF' },
];

export default function ControlPanel({
  config,
  onChangeConfig,
  onUploadImage,
  onRunMediaPipeScan,
  isScanning,
  scanNotification,
  sensorStatus,
  boxes,
  onUpdateBoxes,
  keypoints,
  onUpdateKeypoints,
  theme = 'dark',
  hasImage
}) {
  const fileInputRef = useRef(null);
  const isDark = theme === 'dark';

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUploadImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorSelect = (preset) => {
    onChangeConfig({
      themeColor: preset.hex,
      colorName: preset.name
    });
  };

  const handleRandomizeSeed = () => {
    onChangeConfig({ seed: Math.floor(Math.random() * 100000) });
  };

  return (
    <aside
      className={`w-full lg:w-84 xl:w-92 h-full border-r flex flex-col font-tech text-xs select-none transition-colors duration-200 ${
        isDark
          ? 'border-slate-800 bg-[#0a0d14] text-slate-100'
          : 'border-slate-200 bg-white text-slate-900 shadow-xs'
      }`}
    >
      {/* Panel Header */}
      <div
        className={`p-3.5 border-b flex items-center justify-between transition-colors ${
          isDark ? 'border-slate-800 bg-[#0e121b]' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-500" />
          <span className="font-bold tracking-wider uppercase text-xs">Vision Control Matrix</span>
        </div>
        <button
          onClick={handleRandomizeSeed}
          className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors cursor-pointer text-[11px] ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
              : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
          }`}
          title="Randomize glitch seed"
        >
          <RefreshCw className="w-3 h-3 text-cyan-500" />
          <span>Glitch Seed</span>
        </button>
      </div>

      {/* Scrollable Controls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. Image Source & MediaPipe AI Scan */}
        <section className="space-y-2">
          <div
            className={`flex items-center justify-between font-semibold text-[11px] uppercase tracking-wider ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>Input Image & MediaPipe</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border transition-all cursor-pointer font-medium ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-cyan-500" />
              <span>Upload Foto</span>
            </button>

            <button
              onClick={onRunMediaPipeScan}
              disabled={isScanning || !hasImage}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border transition-all cursor-pointer font-medium disabled:opacity-40 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-cyan-950/70 hover:bg-cyan-900/90 border-cyan-700/80 text-cyan-300'
                  : 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300 text-cyan-900 font-semibold'
              }`}
            >
              <Cpu className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan MediaPipe'}</span>
            </button>
          </div>

          {/* Scan Notification Banner */}
          {scanNotification && (
            <div
              className={`p-2 rounded-lg border text-[11px] flex items-start gap-2 ${
                scanNotification.type === 'success'
                  ? isDark
                    ? 'bg-emerald-950/40 border-emerald-800/70 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : isDark
                  ? 'bg-amber-950/40 border-amber-800/70 text-amber-300'
                  : 'bg-amber-50 border-amber-300 text-amber-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <div className="leading-tight">
                <span className="font-bold block">{scanNotification.title}</span>
                <span className="text-[10px] opacity-90">{scanNotification.message}</span>
              </div>
            </div>
          )}
        </section>

        {/* 2. Color Palette Selector */}
        <section className="space-y-2.5">
          <div
            className={`flex items-center justify-between font-semibold text-[11px] uppercase tracking-wider ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-cyan-500" />
              <span>Theme Palette</span>
            </div>
            <span className="text-[10px] font-mono">{config.themeColor}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {PALETTE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleColorSelect(preset)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all cursor-pointer ${
                  config.themeColor.toLowerCase() === preset.hex.toLowerCase()
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-sm shadow-cyan-500/20'
                    : isDark
                    ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full border border-black/30 shadow-inner"
                  style={{ backgroundColor: preset.hex }}
                />
                <span className="text-[9px] text-center leading-tight truncate w-full">
                  {preset.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Hex Color Picker */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Custom Color:
            </span>
            <input
              type="color"
              value={config.themeColor}
              onChange={(e) =>
                onChangeConfig({
                  themeColor: e.target.value,
                  colorName: 'Custom'
                })
              }
              className="w-7 h-6 rounded border border-slate-400 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={config.themeColor}
              onChange={(e) =>
                onChangeConfig({
                  themeColor: e.target.value,
                  colorName: 'Custom'
                })
              }
              className={`w-20 px-2 py-0.5 rounded border text-xs font-mono uppercase ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </section>

        {/* 3. Detection Mode System (Contrast, Bright, Dark, Combined) */}
        <section
          className={`space-y-3 p-3 rounded-lg border ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div
            className={`flex items-center justify-between font-semibold text-[11px] uppercase tracking-wider ${
              isDark ? 'text-slate-300' : 'text-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
              <span>Detection System</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                isDark ? 'bg-cyan-950 text-cyan-300' : 'bg-cyan-100 text-cyan-800'
              }`}
            >
              {config.detectionMode}
            </span>
          </div>

          {/* 4 Mode Buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'dark', label: 'Dark (Shadows)', desc: 'Lipatan & bayangan blazer/jeans' },
              { id: 'bright', label: 'Bright (Highlights)', desc: 'Area terik sinar & salju' },
              { id: 'contrast', label: 'Contrast (Edges)', desc: 'Garis kontur & silhouette' },
              { id: 'combined', label: 'Combined (Hybrid)', desc: 'Sistem gabungan edge & luma' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => onChangeConfig({ detectionMode: m.id })}
                className={`p-2 rounded text-left border transition-all cursor-pointer ${
                  config.detectionMode === m.id
                    ? isDark
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 font-bold'
                      : 'border-cyan-500 bg-cyan-100 text-cyan-900 font-bold'
                    : isDark
                    ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                    : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="text-[11px]">{m.label.split(' ')[0]}</div>
                <div className="text-[9px] opacity-75 font-normal leading-tight">{m.label.split(' ')[1]}</div>
              </button>
            ))}
          </div>

          {/* Sliders */}
          <div className="space-y-3 pt-1">
            {config.detectionMode === 'dark' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>Dark Threshold (Shadows):</span>
                  <span className="text-cyan-500 font-mono">{config.darkThreshold}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="180"
                  value={config.darkThreshold}
                  onChange={(e) => onChangeConfig({ darkThreshold: parseInt(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            )}

            {config.detectionMode === 'bright' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>Bright Threshold (Highlights):</span>
                  <span className="text-cyan-500 font-mono">{config.brightThreshold}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="240"
                  value={config.brightThreshold}
                  onChange={(e) => onChangeConfig({ brightThreshold: parseInt(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            )}

            {(config.detectionMode === 'contrast' || config.detectionMode === 'combined') && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>Contrast Sensitivity (Sobel):</span>
                  <span className="text-cyan-500 font-mono">{config.contrastThreshold}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={config.contrastThreshold}
                  onChange={(e) => onChangeConfig({ contrastThreshold: parseInt(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            )}

            {/* Stepped Pixel Block Size */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span>Glitch Block Size (Stepped Pixel):</span>
                <span className="text-cyan-500 font-mono">{config.blockSize}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="36"
                step="2"
                value={config.blockSize}
                onChange={(e) => onChangeConfig({ blockSize: parseInt(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Glitch Density */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span>Glitch Density:</span>
                <span className="text-cyan-500 font-mono">{config.density}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                value={config.density}
                onChange={(e) => onChangeConfig({ density: parseInt(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Confinement Toggle */}
            <label className="flex items-center justify-between pt-1 text-[11px] cursor-pointer">
              <span>Confine to Tracked Subject:</span>
              <input
                type="checkbox"
                checked={config.confineToBoxes}
                onChange={(e) => onChangeConfig({ confineToBoxes: e.target.checked })}
                className="rounded accent-cyan-500 cursor-pointer w-4 h-4"
              />
            </label>
          </div>
        </section>

        {/* 4. Display & Telemetry Toggles */}
        <section
          className={`space-y-2 p-3 rounded-lg border text-[11px] ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span
            className={`font-semibold uppercase tracking-wider block mb-1 ${
              isDark ? 'text-slate-300' : 'text-slate-800'
            }`}
          >
            Display & Overlays
          </span>

          <label className="flex items-center justify-between cursor-pointer">
            <span>Show Detection Boxes</span>
            <input
              type="checkbox"
              checked={config.showBoxes}
              onChange={(e) => onChangeConfig({ showBoxes: e.target.checked })}
              className="accent-cyan-500 w-3.5 h-3.5"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span>Show Tracking Crosses (+)</span>
            <input
              type="checkbox"
              checked={config.showKeypoints}
              onChange={(e) => onChangeConfig({ showKeypoints: e.target.checked })}
              className="accent-cyan-500 w-3.5 h-3.5"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span>Show Corner Reticles (⌜ ⌝)</span>
            <input
              type="checkbox"
              checked={config.cornerTicks}
              onChange={(e) => onChangeConfig({ cornerTicks: e.target.checked })}
              className="accent-cyan-500 w-3.5 h-3.5"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span>Show Diagnostic Hex Code</span>
            <input
              type="checkbox"
              checked={config.showDiagnosticCode}
              onChange={(e) => onChangeConfig({ showDiagnosticCode: e.target.checked })}
              className="accent-cyan-500 w-3.5 h-3.5"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span>Show CCTV Telemetry & REC</span>
            <input
              type="checkbox"
              checked={config.showTelemetry}
              onChange={(e) => onChangeConfig({ showTelemetry: e.target.checked })}
              className="accent-cyan-500 w-3.5 h-3.5"
            />
          </label>
        </section>

        {/* 5. Box Manager Accordion */}
        <BoxManager
          boxes={boxes}
          onUpdateBoxes={onUpdateBoxes}
          keypoints={keypoints}
          onUpdateKeypoints={onUpdateKeypoints}
          themeColor={config.themeColor}
          theme={theme}
        />
      </div>
    </aside>
  );
}
