import React, { useRef } from 'react';
import {
  Upload,
  Sparkles,
  Sliders,
  Palette,
  Crosshair,
  Cpu,
  RefreshCw,
  Eye,
  EyeOff,
  Code,
  Layers,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import BoxManager from './BoxManager';

export const PALETTE_PRESETS = [
  { name: 'Acid Yellow', hex: '#FFE600', class: 'bg-[#FFE600]' },
  { name: 'Tokyo Lavender', hex: '#C4B5FD', class: 'bg-[#C4B5FD]' },
  { name: 'Cyber Blue', hex: '#0022FF', class: 'bg-[#0022FF]' },
  { name: 'Matrix Green', hex: '#39FF14', class: 'bg-[#39FF14]' },
  { name: 'Neon Magenta', hex: '#FF1493', class: 'bg-[#FF1493]' },
  { name: 'Neon Cyan', hex: '#00F0FF', class: 'bg-[#00F0FF]' },
  { name: 'Glitch Coral', hex: '#FF3B30', class: 'bg-[#FF3B30]' },
  { name: 'Terminal White', hex: '#FFFFFF', class: 'bg-[#FFFFFF]' },
];

export default function ControlPanel({
  config,
  onChangeConfig,
  onUploadImage,
  onRunMediaPipeScan,
  isScanning,
  boxes,
  onUpdateBoxes,
  keypoints,
  onUpdateKeypoints
}) {
  const fileInputRef = useRef(null);

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
    <aside className="w-full lg:w-84 xl:w-92 h-full border-r border-slate-800 bg-[#0a0d14] flex flex-col font-tech text-xs select-none">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-[#0e121b]">
        <div className="flex items-center gap-2 text-slate-200">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="font-bold tracking-wider uppercase text-xs">Vision Control Matrix</span>
        </div>
        <button
          onClick={handleRandomizeSeed}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px]"
          title="Randomize glitch seed"
        >
          <RefreshCw className="w-3 h-3 text-cyan-400" />
          <span>Glitch Seed</span>
        </button>
      </div>

      {/* Scrollable Controls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 1. Image Source & MediaPipe AI Scan */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
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
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all cursor-pointer font-medium"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload Foto</span>
            </button>

            <button
              onClick={onRunMediaPipeScan}
              disabled={isScanning}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/90 border border-cyan-700/80 text-cyan-300 transition-all cursor-pointer font-medium disabled:opacity-50"
            >
              <Cpu className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan MediaPipe'}</span>
            </button>
          </div>
        </section>

        {/* 2. Color Palette Selector */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>Theme Palette</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{config.themeColor}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {PALETTE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleColorSelect(preset)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all cursor-pointer ${
                  config.themeColor.toLowerCase() === preset.hex.toLowerCase()
                    ? 'border-cyan-400 bg-slate-800 shadow-sm shadow-cyan-500/20'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full border border-black/40 shadow-inner"
                  style={{ backgroundColor: preset.hex }}
                />
                <span className="text-[9px] text-slate-300 text-center leading-tight truncate w-full">
                  {preset.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Hex Color Picker */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400">Custom Color:</span>
            <input
              type="color"
              value={config.themeColor}
              onChange={(e) =>
                onChangeConfig({
                  themeColor: e.target.value,
                  colorName: 'Custom'
                })
              }
              className="w-7 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
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
              className="w-20 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono uppercase"
            />
          </div>
        </section>

        {/* 3. Detection Mode System (Contrast, Bright, Dark, Combined) */}
        <section className="space-y-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Detection System</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold uppercase">
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
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 font-bold'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px]">{m.label.split(' ')[0]}</div>
                <div className="text-[9px] text-slate-500 font-normal leading-tight">{m.label.split(' ')[1]}</div>
              </button>
            ))}
          </div>

          {/* Sliders */}
          <div className="space-y-3 pt-2">
            {/* Dark / Bright Threshold */}
            {config.detectionMode === 'dark' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Dark Threshold (Shadows):</span>
                  <span className="text-cyan-400 font-mono">{config.darkThreshold}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="180"
                  value={config.darkThreshold}
                  onChange={(e) => onChangeConfig({ darkThreshold: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            )}

            {config.detectionMode === 'bright' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Bright Threshold (Highlights):</span>
                  <span className="text-cyan-400 font-mono">{config.brightThreshold}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="240"
                  value={config.brightThreshold}
                  onChange={(e) => onChangeConfig({ brightThreshold: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            )}

            {(config.detectionMode === 'contrast' || config.detectionMode === 'combined') && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Contrast Sensitivity (Sobel):</span>
                  <span className="text-cyan-400 font-mono">{config.contrastThreshold}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={config.contrastThreshold}
                  onChange={(e) => onChangeConfig({ contrastThreshold: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            )}

            {/* Stepped Pixel Block Size */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Glitch Block Size (Stepped Pixel):</span>
                <span className="text-cyan-400 font-mono">{config.blockSize}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="36"
                step="2"
                value={config.blockSize}
                onChange={(e) => onChangeConfig({ blockSize: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Glitch Density */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Glitch Density:</span>
                <span className="text-cyan-400 font-mono">{config.density}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                value={config.density}
                onChange={(e) => onChangeConfig({ density: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Confinement Toggle */}
            <label className="flex items-center justify-between pt-1 text-[11px] text-slate-300 cursor-pointer">
              <span>Confine to Tracked Subject:</span>
              <input
                type="checkbox"
                checked={config.confineToBoxes}
                onChange={(e) => onChangeConfig({ confineToBoxes: e.target.checked })}
                className="rounded accent-cyan-400 cursor-pointer w-4 h-4"
              />
            </label>
          </div>
        </section>

        {/* 4. Display & Telemetry Toggles */}
        <section className="space-y-2 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px]">
          <span className="font-semibold text-slate-300 uppercase tracking-wider block mb-1">
            Display & Overlays
          </span>

          <label className="flex items-center justify-between text-slate-400 hover:text-slate-200 cursor-pointer">
            <span>Show Detection Boxes</span>
            <input
              type="checkbox"
              checked={config.showBoxes}
              onChange={(e) => onChangeConfig({ showBoxes: e.target.checked })}
              className="accent-cyan-400 w-3.5 h-3.5"
            />
          </label>

          <label className="flex items-center justify-between text-slate-400 hover:text-slate-200 cursor-pointer">
            <span>Show Tracking Crosses (+)</span>
            <input
              type="checkbox"
              checked={config.showKeypoints}
              onChange={(e) => onChangeConfig({ showKeypoints: e.target.checked })}
              className="accent-cyan-400 w-3.5 h-3.5"
            />
          </label>

          <label className="flex items-center justify-between text-slate-400 hover:text-slate-200 cursor-pointer">
            <span>Show Corner Reticles (⌜ ⌝)</span>
            <input
              type="checkbox"
              checked={config.cornerTicks}
              onChange={(e) => onChangeConfig({ cornerTicks: e.target.checked })}
              className="accent-cyan-400 w-3.5 h-3.5"
            />
          </label>

          <label className="flex items-center justify-between text-slate-400 hover:text-slate-200 cursor-pointer">
            <span>Show Diagnostic Hex Code</span>
            <input
              type="checkbox"
              checked={config.showDiagnosticCode}
              onChange={(e) => onChangeConfig({ showDiagnosticCode: e.target.checked })}
              className="accent-cyan-400 w-3.5 h-3.5"
            />
          </label>

          <label className="flex items-center justify-between text-slate-400 hover:text-slate-200 cursor-pointer">
            <span>Show CCTV Telemetry & REC</span>
            <input
              type="checkbox"
              checked={config.showTelemetry}
              onChange={(e) => onChangeConfig({ showTelemetry: e.target.checked })}
              className="accent-cyan-400 w-3.5 h-3.5"
            />
          </label>
        </section>

        {/* 5. Box & Keypoints Manager */}
        <BoxManager
          boxes={boxes}
          onUpdateBoxes={onUpdateBoxes}
          keypoints={keypoints}
          onUpdateKeypoints={onUpdateKeypoints}
          themeColor={config.themeColor}
        />
      </div>
    </aside>
  );
}
