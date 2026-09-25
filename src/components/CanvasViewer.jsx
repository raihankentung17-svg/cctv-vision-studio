import React, { useRef, useEffect, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Monitor,
  Crosshair,
  Hand,
  Eye,
  Grid,
  Upload,
  Camera,
  Crop,
  Scaling
} from 'lucide-react';
import { renderCCTVVisionEffect } from '../utils/glitchEngine';
import { ASPECT_RATIOS } from '../utils/imageProcessor';

export default function CanvasViewer({
  imageSrc,
  processedImage,
  config,
  boxes,
  keypoints,
  onAddKeypoint,
  onUploadImage,
  canvasRef,
  theme = 'dark',
  aspectRatio = 'original',
  onChangeAspectRatio,
  fitMode = 'contain',
  onChangeFitMode,
  autoTrim = false,
  onChangeAutoTrim
}) {
  const containerRef = useRef(null);
  const viewportRef = useRef(null);
  const fileInputRef = useRef(null);

  const isDark = theme === 'dark';

  // Zoom & Pan state
  const [scale, setScale] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState('crosshair'); // 'crosshair' | 'pan'
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Visual Overlays & Comparison
  const [showScanlines, setShowScanlines] = useState(false);
  const [showHUDGrid, setShowHUDGrid] = useState(false);
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Inspector & Telemetry
  const [imageDims, setImageDims] = useState({ width: 0, height: 0 });
  const [renderTime, setRenderTime] = useState(0);
  const [activeImage, setActiveImage] = useState(null);
  const [cursorInfo, setCursorInfo] = useState({ x: 0, y: 0, visible: false });

  // Cache raw image element for instantaneous Compare view
  const rawImageRef = useRef(null);
  useEffect(() => {
    if (!imageSrc) {
      rawImageRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      rawImageRef.current = img;
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // 1. Load active image from processedImage (or fallback to imageSrc)
  useEffect(() => {
    const target = processedImage;
    if (!target) {
      if (!imageSrc) {
        setActiveImage(null);
        setImageDims({ width: 0, height: 0 });
      }
      return;
    }

    const w = target.width || target.naturalWidth || 0;
    const h = target.height || target.naturalHeight || 0;
    if (w === 0 || h === 0) return;

    setImageDims({ width: w, height: h });
    setActiveImage(target);

    // Auto fit to viewport
    if (viewportRef.current) {
      const vpW = viewportRef.current.clientWidth - 80;
      const vpH = viewportRef.current.clientHeight - 80;
      const scaleW = vpW / w;
      const scaleH = vpH / h;
      const fitScale = Math.min(1.2, Math.max(0.15, Math.min(scaleW, scaleH)));
      setScale(Number(fitScale.toFixed(2)));
      setPan({ x: 0, y: 0 });
    }
  }, [processedImage, imageSrc]);

  // 2. Render Canvas Pipeline (Original vs CCTV Glitch Effect)
  useEffect(() => {
    if (!activeImage || !canvasRef.current) return;

    const startTime = performance.now();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = activeImage.width || activeImage.naturalWidth;
    const height = activeImage.height || activeImage.naturalHeight;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    if (isHoldingOriginal) {
      // Direct raw render without effects for instant A/B comparison
      ctx.clearRect(0, 0, width, height);
      if (rawImageRef.current) {
        ctx.drawImage(rawImageRef.current, 0, 0, width, height);
      } else {
        ctx.drawImage(activeImage, 0, 0, width, height);
      }
      ctx.font = '700 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#FFE600';
      ctx.fillText('[ORIGINAL RAW BUFFER - NO EFFECTS]', 20, 24);
    } else {
      const fullOptions = {
        ...config,
        boxes,
        keypoints
      };
      renderCCTVVisionEffect(canvas, activeImage, fullOptions);
    }

    const elapsed = Math.round(performance.now() - startTime);
    setRenderTime(elapsed);
  }, [activeImage, config, boxes, keypoints, canvasRef, isHoldingOriginal]);

  // 3. Spacebar shortcut to temporarily activate Pan tool
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        setIsSpacePressed(true);
      } else if (e.key === '=' || e.key === '+') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          zoomIn();
        }
      } else if (e.key === '-') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          zoomOut();
        }
      } else if (e.key === '0') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleFitToScreen();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [imageDims]);

  // 4. Mouse Wheel Zoom
  const handleWheel = (e) => {
    if (!imageSrc) return;
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setScale((prevScale) => {
      const newScale = Math.min(4.5, Math.max(0.15, prevScale * zoomFactor));
      return Number(newScale.toFixed(2));
    });
  };

  // 5. Mouse Down
  const handleMouseDown = (e) => {
    if (!imageSrc) return;
    if (e.button === 1 || activeTool === 'pan' || isSpacePressed) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // 6. Mouse Move
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    if (canvasRef.current && imageSrc) {
      const rect = canvasRef.current.getBoundingClientRect();
      const inBounds =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (inBounds) {
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        const px = Math.round((e.clientX - rect.left) * scaleX);
        const py = Math.round((e.clientY - rect.top) * scaleY);
        setCursorInfo({ x: px, y: py, visible: true });
      } else {
        setCursorInfo((prev) => ({ ...prev, visible: false }));
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 7. Click to Add Red Tracking Cross
  const handleCanvasClick = (e) => {
    if (!imageSrc) return;
    if (isDragging || activeTool === 'pan' || isSpacePressed) return;
    if (!canvasRef.current || !onAddKeypoint) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = Math.round(clickX * scaleX);
    const y = Math.round(clickY * scaleY);

    onAddKeypoint({ x, y, label: `track_point_${keypoints.length + 1}` });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onUploadImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUploadImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file && onUploadImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUploadImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const zoomIn = () => setScale((s) => Number(Math.min(4.5, s + 0.2).toFixed(2)));
  const zoomOut = () => setScale((s) => Number(Math.max(0.15, s - 0.2).toFixed(2)));
  const handleActualSize = () => {
    setScale(1.0);
    setPan({ x: 0, y: 0 });
  };
  const handleFitToScreen = () => {
    if (viewportRef.current && imageDims.width > 0) {
      const vpW = viewportRef.current.clientWidth - 80;
      const vpH = viewportRef.current.clientHeight - 80;
      const scaleW = vpW / imageDims.width;
      const scaleH = vpH / imageDims.height;
      const fit = Math.min(1.2, Math.max(0.2, Math.min(scaleW, scaleH)));
      setScale(Number(fit.toFixed(2)));
      setPan({ x: 0, y: 0 });
    }
  };

  const isPanActive = activeTool === 'pan' || isSpacePressed;

  return (
    <main
      ref={containerRef}
      className={`flex-1 h-full relative flex flex-col overflow-hidden font-tech select-none transition-colors duration-150 ${
        isDark ? 'bg-[#06080c] text-slate-200' : 'bg-slate-200 text-slate-900'
      }`}
    >
      {/* Top Floating Cyber Toolbar (when image is loaded) */}
      {imageSrc && (
        <>
          <div
            className={`absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1.5 rounded-lg border shadow-lg text-xs transition-colors ${
              isDark
                ? 'bg-[#0f141f] border-slate-700 text-slate-200'
                : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            <button
              onClick={() => setActiveTool('crosshair')}
              className={`min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-md font-semibold transition-all cursor-pointer ${
                activeTool === 'crosshair' && !isSpacePressed
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Crosshair Tool: Klik canvas untuk menambahkan Red Tracking Cross (+)"
            >
              <Crosshair className="w-4 h-4" />
              <span className="hidden sm:inline">Crosshair</span>
            </button>

            <button
              onClick={() => setActiveTool('pan')}
              className={`min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-md font-semibold transition-all cursor-pointer ${
                activeTool === 'pan' || isSpacePressed
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Hand Tool: Geser canvas (Tahan Spacebar)"
            >
              <Hand className="w-4 h-4" />
              <span className="hidden sm:inline">Pan</span>
            </button>

            <div className={`w-px h-6 mx-0.5 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />

            <button
              onMouseDown={() => setIsHoldingOriginal(true)}
              onMouseUp={() => setIsHoldingOriginal(false)}
              onMouseLeave={() => setIsHoldingOriginal(false)}
              onTouchStart={() => setIsHoldingOriginal(true)}
              onTouchEnd={() => setIsHoldingOriginal(false)}
              className={`min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-md font-semibold transition-all cursor-pointer ${
                isHoldingOriginal
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : isDark ? 'hover:bg-slate-800 text-amber-300' : 'hover:bg-slate-100 text-amber-800'
              }`}
              title="Tahan klik untuk melihat gambar asli tanpa efek"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Compare</span>
            </button>

            <div className={`w-px h-6 mx-0.5 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />

            {/* Quick Aspect Ratio Selector */}
            <div className="flex items-center gap-1">
              <span className={`text-[10px] font-bold uppercase hidden md:inline px-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Ratio:
              </span>
              <select
                value={aspectRatio}
                onChange={(e) => onChangeAspectRatio && onChangeAspectRatio(e.target.value)}
                className={`min-h-[44px] px-2 py-1 rounded text-xs font-mono font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-cyan-400 hover:border-cyan-500'
                    : 'bg-slate-50 border-slate-300 text-cyan-800 hover:border-cyan-500'
                }`}
                title="Pilih Aspek Rasio Canvas"
              >
                {ASPECT_RATIOS.map((r) => (
                  <option key={r.id} value={r.id} className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                    {r.id.toUpperCase()} ({r.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Auto-Trim Whitespace Button */}
            <button
              onClick={() => onChangeAutoTrim && onChangeAutoTrim(!autoTrim)}
              className={`min-h-[44px] flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                autoTrim
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : isDark
                  ? 'hover:bg-slate-800 text-slate-300'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Auto-Trim Whitespace: Pangkas margin putih kosong di sekitar subjek"
            >
              <Crop className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">{autoTrim ? 'Trim ON' : 'Trim OFF'}</span>
            </button>
          </div>

          <div
            className={`absolute top-4 right-4 z-20 flex items-center gap-1 p-1.5 rounded-lg border shadow-lg text-xs transition-colors ${
              isDark
                ? 'bg-[#0f141f] border-slate-700 text-slate-200'
                : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            <button
              onClick={zoomIn}
              aria-label="Zoom In"
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
              }`}
              title="Zoom In (Scroll Up)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={zoomOut}
              aria-label="Zoom Out"
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
              }`}
              title="Zoom Out (Scroll Down)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              onClick={handleActualSize}
              className={`min-h-[44px] px-2.5 flex items-center justify-center rounded-md transition-colors cursor-pointer text-xs font-mono font-bold ${
                isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-900'
              }`}
              title="100% Native Resolution"
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              onClick={handleFitToScreen}
              aria-label="Fit to Screen"
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
              }`}
              title="Fit to Screen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setPan({ x: 0, y: 0 });
                setScale(1.0);
              }}
              aria-label="Reset Zoom & Pan"
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
              }`}
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className={`w-px h-6 mx-0.5 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />

            <button
              onClick={() => setShowHUDGrid(!showHUDGrid)}
              aria-label="Toggle Coordinate Grid"
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                showHUDGrid
                  ? 'bg-cyan-500/20 text-cyan-500 font-bold'
                  : isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Toggle CCTV HUD Coordinate Grid"
            >
              <Grid className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowScanlines(!showScanlines)}
              aria-label="Toggle Retro CRT Scanlines"
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                showScanlines
                  ? 'bg-cyan-500/20 text-cyan-500 font-bold'
                  : isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Toggle CRT Scanline Retro Monitor Effect"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* Center Viewport (Solid matte background, NO decorative dot grid) */}
      <div
        ref={viewportRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 w-full h-full flex items-center justify-center p-8 overflow-hidden relative ${
          imageSrc
            ? isPanActive
              ? isDragging
                ? 'cursor-grabbing'
                : 'cursor-grab'
              : 'cursor-crosshair'
            : 'cursor-default'
        }`}
      >
        {/* Empty Standby Dropzone State (Clean, no pulsing slop) */}
        {!imageSrc ? (
          <div
            className={`max-w-md w-full p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${
              isDragOver
                ? 'border-cyan-500 bg-cyan-500/10 scale-102'
                : isDark
                ? 'border-slate-800 bg-[#0c1017] hover:border-slate-700 shadow-xl'
                : 'border-slate-300 bg-white hover:border-slate-400 shadow-sm'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept="image/*"
              className="hidden"
            />
            <div className="mb-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center border shadow-xs ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-cyan-400'
                    : 'bg-slate-100 border-slate-300 text-cyan-700'
                }`}
              >
                <Camera className="w-8 h-8" />
              </div>
            </div>

            <h3
              className={`text-sm font-bold tracking-wider uppercase mb-1.5 ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              AWAITING IMAGE INPUT // SENSOR STANDBY
            </h3>
            <p
              className={`text-xs max-w-xs mb-6 leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Tarik dan lepaskan (*drag and drop*) gambar Anda ke sini, atau klik tombol di bawah untuk mulai memindai.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[44px] flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-tech font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Upload Gambar Anda</span>
            </button>
          </div>
        ) : (
          /* Scaled & Translated Canvas Container */
          <div
            className="relative shadow-2xl rounded-xs overflow-hidden border border-slate-700/80 transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: 'center center'
            }}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="block max-w-none"
              title={
                activeTool === 'crosshair' && !isSpacePressed
                  ? 'Klik untuk menambahkan Red Tracking Cross (+)'
                  : 'Geser canvas'
              }
            />

            {/* Optional HUD Coordinate Grid */}
            {showHUDGrid && (
              <div
                className="absolute inset-0 pointer-events-none border border-cyan-500/40"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(0, 240, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.1) 1px, transparent 1px)',
                  backgroundSize: '64px 64px'
                }}
              >
                <div className="absolute top-2 left-2 text-[10px] text-cyan-400 font-mono font-bold">
                  + [0,0]
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] text-cyan-400 font-mono font-bold">
                  + [{imageDims.width},{imageDims.height}]
                </div>
              </div>
            )}

            {/* Optional CRT Scanlines Layer */}
            {showScanlines && <div className="absolute inset-0 scanlines pointer-events-none" />}
          </div>
        )}
      </div>

      {/* Bottom Telemetry Bar (WCAG AA Compliant Contrast) */}
      <footer
        className={`h-8 border-t px-4 flex items-center justify-between text-[11px] font-tech transition-colors duration-150 ${
          isDark
            ? 'border-slate-800 bg-[#090c13] text-slate-300'
            : 'border-slate-300 bg-white text-slate-700 font-medium'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="font-bold">RESOLUTION:</span>
            <span className={`font-mono ${isDark ? 'text-slate-100 font-semibold' : 'text-slate-900 font-bold'}`}>
              {imageDims.width > 0 ? `${imageDims.width} × ${imageDims.height}` : 'STANDBY'}
            </span>
          </div>

          <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>|</span>

          {cursorInfo.visible && (
            <div className={`flex items-center gap-2 font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-800'}`}>
              <span>
                X: {cursorInfo.x} Y: {cursorInfo.y}
              </span>
            </div>
          )}

          <span className={`${isDark ? 'text-slate-600' : 'text-slate-400'} hidden md:inline`}>|</span>

          <span className="hidden md:inline">
            TOOL:{' '}
            <span className={`uppercase font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {isPanActive ? 'PAN (DRAG)' : 'CROSSHAIR (CLICK +)'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div>
            ZOOM: <span className={`font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-800'}`}>{Math.round(scale * 100)}%</span>
          </div>
          <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>|</span>
          <div>
            RENDER: <span className={`font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{renderTime}ms</span>
          </div>
          <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>|</span>
          <div>
            FEED:{' '}
            <span className={`uppercase font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-800'}`}>
              {imageSrc ? (isHoldingOriginal ? 'RAW BUFFER' : 'CCTV ACTIVE') : 'STANDBY'}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
