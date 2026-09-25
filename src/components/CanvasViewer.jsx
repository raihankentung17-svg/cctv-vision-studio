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
  Image as ImageIcon
} from 'lucide-react';
import { renderCCTVVisionEffect } from '../utils/glitchEngine';

export default function CanvasViewer({
  imageSrc,
  config,
  boxes,
  keypoints,
  onAddKeypoint,
  onUploadImage,
  canvasRef,
  theme = 'dark'
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

  // 1. Load image and auto-fit on initial load
  useEffect(() => {
    if (!imageSrc) {
      setActiveImage(null);
      setImageDims({ width: 0, height: 0 });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageDims({ width: img.naturalWidth, height: img.naturalHeight });
      setActiveImage(img);

      // Auto fit to viewport
      if (viewportRef.current) {
        const vpW = viewportRef.current.clientWidth - 80;
        const vpH = viewportRef.current.clientHeight - 80;
        const scaleW = vpW / img.naturalWidth;
        const scaleH = vpH / img.naturalHeight;
        const fitScale = Math.min(1.2, Math.max(0.2, Math.min(scaleW, scaleH)));
        setScale(Number(fitScale.toFixed(2)));
        setPan({ x: 0, y: 0 });
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // 2. Render Canvas Pipeline (Original vs CCTV Glitch Effect)
  useEffect(() => {
    if (!activeImage || !canvasRef.current) return;

    const startTime = performance.now();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = activeImage.naturalWidth || activeImage.width;
    const height = activeImage.naturalHeight || activeImage.height;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    if (isHoldingOriginal) {
      // Direct raw render without effects for instant A/B comparison
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(activeImage, 0, 0, width, height);
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

  // Drag and drop handlers for empty state
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
      className={`flex-1 h-full relative flex flex-col overflow-hidden font-tech select-none transition-colors duration-200 ${
        isDark ? 'bg-[#05070a] text-slate-200' : 'bg-slate-200/80 text-slate-800'
      }`}
    >
      {/* Top Floating Cyber Toolbar (when image is loaded) */}
      {imageSrc && (
        <>
          <div
            className={`absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1 rounded-lg border backdrop-blur-md shadow-xl text-xs transition-colors ${
              isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-white/95 border-slate-300 text-slate-700'
            }`}
          >
            <button
              onClick={() => setActiveTool('crosshair')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                activeTool === 'crosshair' && !isSpacePressed
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Crosshair Tool: Klik canvas untuk menambahkan Red Tracking Cross (+)"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Crosshair</span>
            </button>

            <button
              onClick={() => setActiveTool('pan')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                activeTool === 'pan' || isSpacePressed
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Hand Tool: Geser canvas (Tahan Spacebar)"
            >
              <Hand className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pan</span>
            </button>

            <div className={`w-px h-4 mx-0.5 ${isDark ? 'bg-slate-700/60' : 'bg-slate-300'}`} />

            <button
              onMouseDown={() => setIsHoldingOriginal(true)}
              onMouseUp={() => setIsHoldingOriginal(false)}
              onMouseLeave={() => setIsHoldingOriginal(false)}
              onTouchStart={() => setIsHoldingOriginal(true)}
              onTouchEnd={() => setIsHoldingOriginal(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                isHoldingOriginal
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : isDark ? 'hover:bg-slate-800 text-amber-300/80' : 'hover:bg-slate-100 text-amber-700'
              }`}
              title="Tahan klik untuk melihat gambar asli tanpa efek"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compare</span>
            </button>
          </div>

          <div
            className={`absolute top-4 right-4 z-20 flex items-center gap-1 p-1 rounded-lg border backdrop-blur-md shadow-xl text-xs transition-colors ${
              isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-white/95 border-slate-300 text-slate-700'
            }`}
          >
            <button
              onClick={zoomIn}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-slate-100 text-slate-800'
              }`}
              title="Zoom In (Scroll Up)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={zoomOut}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-slate-100 text-slate-800'
              }`}
              title="Zoom Out (Scroll Down)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              onClick={handleActualSize}
              className={`px-2 py-1 rounded transition-colors cursor-pointer text-[11px] font-mono ${
                isDark ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-slate-100 text-slate-800 font-semibold'
              }`}
              title="100% Native Resolution"
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              onClick={handleFitToScreen}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-slate-100 text-slate-800'
              }`}
              title="Fit to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setPan({ x: 0, y: 0 });
                setScale(1.0);
              }}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-slate-100 text-slate-800'
              }`}
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className={`w-px h-4 mx-0.5 ${isDark ? 'bg-slate-700/60' : 'bg-slate-300'}`} />

            <button
              onClick={() => setShowHUDGrid(!showHUDGrid)}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
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
              className={`p-1.5 rounded transition-colors cursor-pointer ${
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

      {/* Center Viewport */}
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
        {/* Subtle Tech Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: isDark
              ? 'radial-gradient(circle at 1px 1px, #334155 1px, transparent 0)'
              : 'radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Empty Standby Dropzone State */}
        {!imageSrc ? (
          <div
            className={`max-w-md w-full p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${
              isDragOver
                ? 'border-cyan-400 bg-cyan-500/10 scale-102'
                : isDark
                ? 'border-slate-800 bg-[#0a0d14]/70 hover:border-slate-700'
                : 'border-slate-300 bg-white/80 hover:border-slate-400 shadow-sm'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept="image/*"
              className="hidden"
            />
            <div className="relative mb-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center border ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-cyan-400'
                    : 'bg-slate-100 border-slate-300 text-cyan-600'
                }`}
              >
                <Camera className="w-8 h-8" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
              </span>
            </div>

            <h3
              className={`text-sm font-bold tracking-wider uppercase mb-1 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              AWAITING IMAGE INPUT // SENSOR STANDBY
            </h3>
            <p className={`text-xs max-w-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Tarik dan lepaskan (*drag and drop*) gambar Anda ke sini, atau klik tombol di bawah untuk mulai memindai.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-tech font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
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
                className="absolute inset-0 pointer-events-none border border-cyan-500/30"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(0, 240, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.08) 1px, transparent 1px)',
                  backgroundSize: '64px 64px'
                }}
              >
                <div className="absolute top-2 left-2 text-[10px] text-cyan-400 font-mono">
                  + [0,0]
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] text-cyan-400 font-mono">
                  + [{imageDims.width},{imageDims.height}]
                </div>
              </div>
            )}

            {/* Optional CRT Scanlines Layer */}
            {showScanlines && <div className="absolute inset-0 scanlines pointer-events-none" />}
          </div>
        )}
      </div>

      {/* Bottom Telemetry Bar */}
      <footer
        className={`h-8 border-t px-4 flex items-center justify-between text-[11px] font-tech transition-colors duration-200 ${
          isDark ? 'border-slate-800/80 bg-[#090c13] text-slate-400' : 'border-slate-300 bg-white text-slate-600'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="font-semibold">RESOLUTION:</span>
            <span className={`font-mono ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              {imageDims.width > 0 ? `${imageDims.width} × ${imageDims.height}` : 'STANDBY'}
            </span>
          </div>

          <span className="text-slate-400">|</span>

          {cursorInfo.visible && (
            <div className="flex items-center gap-2 text-cyan-500 font-mono">
              <span>
                X: {cursorInfo.x} Y: {cursorInfo.y}
              </span>
            </div>
          )}

          <span className="text-slate-400 hidden md:inline">|</span>

          <span className="hidden md:inline">
            TOOL:{' '}
            <span className={`uppercase font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              {isPanActive ? 'PAN (DRAG)' : 'CROSSHAIR (CLICK +)'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div>
            ZOOM: <span className="text-cyan-500 font-mono">{Math.round(scale * 100)}%</span>
          </div>
          <span className="text-slate-400">|</span>
          <div>
            RENDER: <span className="text-emerald-500 font-mono">{renderTime}ms</span>
          </div>
          <span className="text-slate-400">|</span>
          <div>
            FEED:{' '}
            <span className="text-cyan-500 uppercase font-semibold">
              {imageSrc ? (isHoldingOriginal ? 'RAW BUFFER' : 'CCTV ACTIVE') : 'STANDBY'}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
