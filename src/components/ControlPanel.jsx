import React, { useRef } from 'react';
import {
  Upload,
  Sliders,
  Palette,
  Cpu,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  X,
  Crop,
  Scaling
} from 'lucide-react';
import BoxManager from './BoxManager';
import { ASPECT_RATIOS } from '../utils/imageProcessor';

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
  onDismissNotification,
  sensorStatus,
  boxes,
  onUpdateBoxes,
  keypoints,
  onUpdateKeypoints,
  theme = 'dark',
  hasImage,
  aspectRatio = 'original',
  onChangeAspectRatio,
  fitMode = 'contain',
  onChangeFitMode,
  autoTrim = false,
  onChangeAutoTrim,
  canvasBg = '#ffffff',
  onChangeCanvasBg
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
      className={`w-full lg:w-84 xl:w-92 h-full border-r flex flex-col font-tech text-xs select-none transition-colors duration-150 ${
        isDark
          ? 'border-slate-800 bg-[#0c1017] text-slate-100'
          : 'border-slate-300 bg-white text-slate-900 shadow-xs'
      }`}
    >
      {/* Panel Header */}
      <div
        className={`p-3.5 border-b flex items-center justify-between transition-colors ${
          isDark ? 'border-slate-800 bg-[#121722]' : 'border-slate-200 bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-600" />
          <span className="font-bold tracking-wider uppercase text-xs">Vision Control Matrix</span>
        </div>
        <button
          onClick={handleRandomizeSeed}
          className={`min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors cursor-pointer text-xs font-semibold ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
              : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
          }`}
          title="Randomize glitch seed"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-600" />
          <span>Glitch Seed</span>
        </button>
      </div>

      {/* Scrollable Controls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. Image Source & MediaPipe AI Scan */}
        <section className="space-y-2">
          <div
            className={`flex items-center justify-between font-bold text-xs uppercase tracking-wider ${
              isDark ? 'text-slate-300' : 'text-slate-800'
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
              className={`min-h-[44px] flex items-center justify-center gap-1.5 p-2 rounded-lg border transition-all cursor-pointer font-bold ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4 text-cyan-600" />
              <span>Upload Foto</span>
            </button>

            <button
              onClick={onRunMediaPipeScan}
              disabled={isScanning || !hasImage}
              className={`min-h-[44px] flex items-center justify-center gap-1.5 p-2 rounded-lg border transition-all cursor-pointer font-bold disabled:opacity-30 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-cyan-950/70 hover:bg-cyan-900 border-cyan-700 text-cyan-300'
                  : 'bg-cyan-100 hover:bg-cyan-200 border-cyan-400 text-cyan-950'
              }`}
            >
              <Cpu className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan MediaPipe'}</span>
            </button>
          </div>

          {/* Dismissible Scan Notification Banner (R-26 / C-2) */}
          {scanNotification && (
            <div
              className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-2 animate-in fade-in duration-200 ${
                scanNotification.type === 'success'
                  ? isDark
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : isDark
                  ? 'bg-cyan-950/50 border-cyan-800 text-cyan-300'
                  : 'bg-cyan-50 border-cyan-300 text-cyan-900'
              }`}
            >
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="leading-tight">
                  <span className="font-bold block">{scanNotification.title}</span>
                  <span className="text-[11px] opacity-90">{scanNotification.message}</span>
                </div>
              </div>
              <button
                onClick={onDismissNotification}
                aria-label="Tutup notifikasi"
                className="p-1 rounded hover:bg-black/20 text-current transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>

        {/* 2. Canvas Framing & Aspect Ratio System */}
        <section
          className={`space-y-3 p-3 rounded-lg border ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
          }`}
        >
          <div
            className={`flex items-center justify-between font-bold text-xs uppercase tracking-wider ${
              isDark ? 'text-slate-200' : 'text-slate-900'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Scaling className="w-4 h-4 text-cyan-600" />
              <span>Canvas Size & Ratio</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono ${
                isDark ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-cyan-100 text-cyan-900 border border-cyan-300'
              }`}
            >
              {aspectRatio.toUpperCase()}
            </span>
          </div>

          {/* Aspect Ratio Presets Grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {ASPECT_RATIOS.map((preset) => {
              const isSelected = aspectRatio === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onChangeAspectRatio && onChangeAspectRatio(preset.id)}
                  className={`min-h-[44px] flex flex-col items-center justify-center p-1.5 rounded-md border text-center transition-all cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 font-bold shadow-xs'
                        : 'border-cyan-500 bg-cyan-100 text-cyan-950 font-bold shadow-xs'
                      : isDark
                      ? 'border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white hover:border-slate-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:text-slate-950 hover:border-slate-400'
                  }`}
                  title={`${preset.name} (${preset.label})`}
                >
                  <span className="text-[11px] font-bold leading-tight">
                    {preset.id === 'original' ? 'Original' : preset.id}
                  </span>
                  <span className="text-[9px] opacity-75 truncate max-w-full leading-none mt-0.5">
                    {preset.name.replace(/^[0-9:]+\s*/, '')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Framing Fit Mode (Shown when an explicit ratio is selected) */}
          {aspectRatio !== 'original' && aspectRatio !== 'smart_focus' && (
            <div className="space-y-1.5 pt-1">
              <span className={`text-xs font-semibold block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Framing & Fit Mode:
              </span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => onChangeFitMode && onChangeFitMode('smart_fit')}
                  className={`min-h-[36px] px-1.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    fitMode === 'smart_fit'
                      ? 'bg-cyan-500 text-slate-950 shadow-xs'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 hover:text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                  title="Smart Fit: Pangkas void otomatis & posisikan subjek proporsional"
                >
                  Smart Fit
                </button>
                <button
                  onClick={() => onChangeFitMode && onChangeFitMode('contain')}
                  className={`min-h-[36px] px-1.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    fitMode === 'contain'
                      ? 'bg-cyan-500 text-slate-950 shadow-xs'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 hover:text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                  title="Fit (Contain): Tampilkan seluruh gambar tanpa terpotong"
                >
                  Fit Utuh
                </button>
                <button
                  onClick={() => onChangeFitMode && onChangeFitMode('cover')}
                  className={`min-h-[36px] px-1.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    fitMode === 'cover'
                      ? 'bg-cyan-500 text-slate-950 shadow-xs'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 hover:text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                  title="Fill (Cover): Penuhi seluruh frame canvas"
                >
                  Penuh
                </button>
              </div>
            </div>
          )}

          {/* Auto-Trim Whitespace Margin */}
          <div className="pt-2 border-t border-slate-700/40 space-y-1">
            <label className={`flex items-center justify-between cursor-pointer py-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Crop className="w-3.5 h-3.5 text-cyan-600" />
                <span>Auto-Trim Whitespace</span>
              </div>
              <input
                type="checkbox"
                checked={autoTrim}
                onChange={(e) => onChangeAutoTrim && onChangeAutoTrim(e.target.checked)}
                className="accent-cyan-500 w-4 h-4 cursor-pointer rounded"
              />
            </label>
            <p className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Pangkas ruang kosong putih/transparan berlebih di sekitar objek agar komposisi canvas presisi.
            </p>
          </div>

          {/* Letterbox Background Selector (For Fit Mode) */}
          {aspectRatio !== 'original' && fitMode === 'contain' && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Letterbox Bg:
              </span>
              <div className="flex items-center gap-2">
                {[
                  { name: 'White', hex: '#ffffff' },
                  { name: 'Dark CCTV', hex: '#06080c' },
                  { name: 'Slate Gray', hex: '#1e293b' }
                ].map((bg) => (
                  <button
                    key={bg.hex}
                    onClick={() => onChangeCanvasBg && onChangeCanvasBg(bg.hex)}
                    className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                      canvasBg === bg.hex ? 'ring-2 ring-cyan-500 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: bg.hex }}
                    title={bg.name}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 3. Color Palette Selector */}
        <section className="space-y-2.5">
          <div
            className={`flex items-center justify-between font-bold text-xs uppercase tracking-wider ${
              isDark ? 'text-slate-300' : 'text-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-cyan-600" />
              <span>Theme Palette</span>
            </div>
            <span className="text-xs font-mono font-bold">{config.themeColor}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {PALETTE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleColorSelect(preset)}
                className={`min-h-[52px] flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all cursor-pointer ${
                  config.themeColor.toLowerCase() === preset.hex.toLowerCase()
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-sm'
                    : isDark
                    ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full border border-black/30 shadow-inner"
                  style={{ backgroundColor: preset.hex }}
                />
                <span className={`text-[10px] font-medium text-center leading-tight truncate w-full ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {preset.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Hex Color Picker */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
              className="w-8 h-8 rounded border border-slate-400 bg-transparent cursor-pointer"
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
              className={`w-24 px-2.5 py-1 rounded border text-xs font-mono font-bold uppercase ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </section>

        {/* 3. Detection Mode System */}
        <section
          className={`space-y-3 p-3.5 rounded-lg border ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
          }`}
        >
          <div
            className={`flex items-center justify-between font-bold text-xs uppercase tracking-wider ${
              isDark ? 'text-slate-200' : 'text-slate-900'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              <span>Detection System</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                isDark ? 'bg-cyan-950 text-cyan-300' : 'bg-cyan-100 text-cyan-900'
              }`}
            >
              {config.detectionMode}
            </span>
          </div>

          {/* 4 Mode Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'dark', title: 'Dark', subtitle: '(Shadows)' },
              { id: 'bright', title: 'Bright', subtitle: '(Highlights)' },
              { id: 'contrast', title: 'Contrast', subtitle: '(Edges)' },
              { id: 'combined', title: 'Combined', subtitle: '(Hybrid)' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => onChangeConfig({ detectionMode: m.id })}
                className={`min-h-[48px] p-2.5 rounded-md text-left border transition-all cursor-pointer ${
                  config.detectionMode === m.id
                    ? isDark
                      ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200 font-bold'
                      : 'border-cyan-500 bg-cyan-100 text-cyan-950 font-bold'
                    : isDark
                    ? 'border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:text-slate-950 hover:border-slate-400'
                }`}
              >
                <div className="text-xs font-bold">{m.title}</div>
                <div className="text-[10px] opacity-80 font-normal leading-tight">{m.subtitle}</div>
              </button>
            ))}
          </div>

          {/* Sliders (High contrast labels) */}
          <div className="space-y-3 pt-1">
            {config.detectionMode === 'dark' && (
              <div className="space-y-1">
                <div className={`flex justify-between text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span>Dark Threshold (Shadows):</span>
                  <span className="text-cyan-600 font-mono font-bold">{config.darkThreshold}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="180"
                  value={config.darkThreshold}
                  onChange={(e) => onChangeConfig({ darkThreshold: parseInt(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer h-2"
                />
              </div>
            )}

            {config.detectionMode === 'bright' && (
              <div className="space-y-1">
                <div className={`flex justify-between text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span>Bright Threshold (Highlights):</span>
                  <span className="text-cyan-600 font-mono font-bold">{config.brightThreshold}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="240"
                  value={config.brightThreshold}
                  onChange={(e) => onChangeConfig({ brightThreshold: parseInt(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer h-2"
                />
              </div>
            )}

            {(config.detectionMode === 'contrast' || config.detectionMode === 'combined') && (
              <div className="space-y-1">
                <div className={`flex justify-between text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span>Contrast Sensitivity (Sobel):</span>
                  <span className="text-cyan-600 font-mono font-bold">{config.contrastThreshold}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={config.contrastThreshold}
                  onChange={(e) => onChangeConfig({ contrastThreshold: parseInt(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer h-2"
                />
              </div>
            )}

            {/* Stepped Pixel Block Size */}
            <div className="space-y-1">
              <div className={`flex justify-between text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <span>Glitch Block Size (Stepped Pixel):</span>
                <span className="text-cyan-600 font-mono font-bold">{config.blockSize}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="36"
                step="2"
                value={config.blockSize}
                onChange={(e) => onChangeConfig({ blockSize: parseInt(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer h-2"
              />
            </div>

            {/* Glitch Density */}
            <div className="space-y-1">
              <div className={`flex justify-between text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <span>Glitch Density:</span>
                <span className="text-cyan-600 font-mono font-bold">{config.density}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                value={config.density}
                onChange={(e) => onChangeConfig({ density: parseInt(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer h-2"
              />
            </div>

            {/* Confinement Toggle */}
            <label className={`flex items-center justify-between pt-1 text-xs font-semibold cursor-pointer ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
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
          className={`space-y-2.5 p-3.5 rounded-lg border text-xs font-medium ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-300'
          }`}
        >
          <span
            className={`font-bold uppercase tracking-wider block mb-1 text-xs ${
              isDark ? 'text-slate-200' : 'text-slate-900'
            }`}
          >
            Display & Overlays
          </span>

          <label className="flex items-center justify-between cursor-pointer py-0.5">
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Show Detection Boxes</span>
            <input
              type="checkbox"
              checked={config.showBoxes}
              onChange={(e) => onChangeConfig({ showBoxes: e.target.checked })}
              className="accent-cyan-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-0.5">
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Show Tracking Crosses (+)</span>
            <input
              type="checkbox"
              checked={config.showKeypoints}
              onChange={(e) => onChangeConfig({ showKeypoints: e.target.checked })}
              className="accent-cyan-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-0.5">
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Show Corner Reticles (⌜ ⌝)</span>
            <input
              type="checkbox"
              checked={config.cornerTicks}
              onChange={(e) => onChangeConfig({ cornerTicks: e.target.checked })}
              className="accent-cyan-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-0.5">
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Show Diagnostic Hex Code</span>
            <input
              type="checkbox"
              checked={config.showDiagnosticCode}
              onChange={(e) => onChangeConfig({ showDiagnosticCode: e.target.checked })}
              className="accent-cyan-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-0.5">
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Show CCTV Telemetry & REC</span>
            <input
              type="checkbox"
              checked={config.showTelemetry}
              onChange={(e) => onChangeConfig({ showTelemetry: e.target.checked })}
              className="accent-cyan-500 w-4 h-4"
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
