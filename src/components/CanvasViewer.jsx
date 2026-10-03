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
  Scaling,
  Sliders
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
  onChangeAutoTrim,
  onSwitchTab
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

  // Helper to calculate optimal fit scale for the current viewport dimensions
  const calculateFitScale = (w, h) => {
    if (!viewportRef.current || !w || !h) return 1.0;
    const padding = typeof window !== 'undefined' && window.innerWidth < 640 ? 16 : 64;
    const vpW = Math.max(100, viewportRef.current.clientWidth - padding);
    const vpH = Math.max(100, viewportRef.current.clientHeight - padding);
    const scaleW = vpW / w;
    const scaleH = vpH / h;
    const fit = Math.min(1.0, Math.max(0.15, Math.min(scaleW, scaleH)));
    return Number(fit.toFixed(4));
  };

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

    // Initial smooth fit on new image load or ratio switch
    requestAnimationFrame(() => {
      const fit = calculateFitScale(w, h);
      setScale(fit);
      setPan({ x: 0, y: 0 });
    });
  }, [processedImage, imageSrc]);

  // Viewport ResizeObserver to adapt fit if viewport dimensions change
  useEffect(() => {
    if (!viewportRef.current) return;
    const observer = new ResizeObserver(() => {
      if (imageDims.width > 0 && imageDims.height > 0) {
        setPan((currentPan) => {
          if (currentPan.x === 0 && currentPan.y === 0) {
            const fit = calculateFitScale(imageDims.width, imageDims.height);
            setScale(fit);
          }
          return currentPan;
        });
      }
    });
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [imageDims.width, imageDims.height]);

  // 2. Render Canvas Pipeline (Original vs CCTV Glitch Effect with Font Readiness Guarantee)
  useEffect(() => {
    if (!activeImage || !canvasRef.current) return;

    let isCancelled = false;

    const executeRender = () => {
      if (isCancelled || !canvasRef.current) return;

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
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        executeRender();
      });
    } else {
      executeRender();
    }

    return () => {
      isCancelled = true;
    };
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

  // Mobile Touch Gestures (1-finger pan & 2-finger pinch-zoom)
  const touchStateRef = useRef({ dist: 0, initialScale: 1.0 });

  const handleTouchStart = (e) => {
    if (!imageSrc) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStateRef.current = { dist, initialScale: scale };
    }
  };

  const handleTouchMove = (e) => {
    if (!imageSrc) return;
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    } else if (e.touches.length === 2 && touchStateRef.current.dist > 0) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / touchStateRef.current.dist;
      const newScale = Math.min(4.5, Math.max(0.15, touchStateRef.current.initialScale * factor));
      setScale(Number(newScale.toFixed(4)));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStateRef.current = { dist: 0, initialScale: scale };
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
    if (imageDims.width > 0 && imageDims.height > 0) {
      const fit = calculateFitScale(imageDims.width, imageDims.height);
      setScale(fit);
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
      {/* Dedicated Top Cyber Controls Bar (Non-occluding, leaves canvas 100% visible) */}
      {/* Dedicated Cyber Studio Controls Bar (Clean, non-occluding, responsive pro studio layout) */}
      {imageSrc && (
        <header
          className={`h-12 sm:h-13 px-2 sm:px-3 border-b shrink-0 flex items-center justify-between z-20 gap-1.5 sm:gap-3 overflow-x-auto text-xs transition-colors select-none scrollbar-none [&::-webkit-scrollbar]:hidden ${
            isDark
              ? 'bg-[#090d15]/95 border-slate-800 text-slate-200 shadow-sm'
              : 'bg-white/95 border-slate-300 text-slate-800 shadow-xs'
          }`}
        >
          {/* Left / Primary Tool Groups: Interaction & Framing */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Group 1: Interactive Toolset (Crosshair, Pan, Compare) */}
            <div
              className={`flex items-center p-0.5 rounded-lg border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                onClick={() => setActiveTool('crosshair')}
                className={`h-8 sm:h-8.5 px-2 sm:px-2.5 flex items-center gap-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  activeTool === 'crosshair' && !isSpacePressed
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700'
                }`}
                title="Crosshair Tool: Klik kanvas untuk menambahkan target tracking (+)"
              >
                <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline text-xs">Crosshair</span>
              </button>

              <button
                onClick={() => setActiveTool('pan')}
                className={`h-8 sm:h-8.5 px-2 sm:px-2.5 flex items-center gap-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  activeTool === 'pan' || isSpacePressed
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700'
                }`}
                title="Hand Tool: Geser kanvas (atau tahan Spacebar)"
              >
                <Hand className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline text-xs">Pan</span>
              </button>

              <div className={`w-px h-4 mx-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`} />

              <button
                onMouseDown={() => setIsHoldingOriginal(true)}
                onMouseUp={() => setIsHoldingOriginal(false)}
                onMouseLeave={() => setIsHoldingOriginal(false)}
                onTouchStart={() => setIsHoldingOriginal(true)}
                onTouchEnd={() => setIsHoldingOriginal(false)}
                className={`h-8 sm:h-8.5 px-2 sm:px-2.5 flex items-center gap-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  isHoldingOriginal
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : isDark ? 'hover:bg-slate-800 text-amber-300 hover:text-amber-200' : 'hover:bg-slate-200 text-amber-800'
                }`}
                title="Tahan klik/sentuh untuk melihat foto asli RAW tanpa efek"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline text-xs">Compare</span>
              </button>
            </div>

            {/* Group 2: Canvas Framing & Ratio Control */}
            <div
              className={`flex items-center gap-1 p-0.5 rounded-lg border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1 px-1">
                <Scaling className={`w-3.5 h-3.5 hidden md:inline shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <select
                  value={aspectRatio}
                  onChange={(e) => onChangeAspectRatio && onChangeAspectRatio(e.target.value)}
                  className={`h-8 sm:h-8.5 px-1.5 sm:px-2 rounded text-[11px] sm:text-xs font-mono font-bold border transition-colors cursor-pointer max-w-[85px] xs:max-w-[105px] sm:max-w-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700/80 text-cyan-400 hover:border-cyan-500 focus:border-cyan-400'
                      : 'bg-white border-slate-300 text-cyan-900 hover:border-cyan-600 focus:border-cyan-600'
                  }`}
                  title="Pilih Rasio Aspek Kanvas"
                >
                  <option value="original">Original</option>
                  <option value="4:5">4:5 (IG)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="9:16">9:16 (Story)</option>
                  <option value="16:9">16:9 (Monitor)</option>
                  <option value="3:4">3:4 (CCTV)</option>
                  <option value="smart_focus">Smart Focus</option>
                </select>
              </div>

              {/* Framing Mode Dropdown (only when non-native ratio is active) */}
              {aspectRatio !== 'original' && aspectRatio !== 'smart_focus' && (
                <select
                  value={fitMode}
                  onChange={(e) => onChangeFitMode && onChangeFitMode(e.target.value)}
                  className={`h-8 sm:h-8.5 px-1.5 sm:px-2 rounded text-[11px] sm:text-xs font-bold border transition-colors cursor-pointer max-w-[76px] xs:max-w-[90px] sm:max-w-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700/80 text-amber-400 hover:border-amber-500 focus:border-amber-400'
                      : 'bg-white border-slate-300 text-amber-900 hover:border-amber-600 focus:border-amber-600'
                  }`}
                  title="Mode Penataan Gambar (Fit Mode)"
                >
                  <option value="smart_fit">Smart Fit</option>
                  <option value="contain">Contain</option>
                  <option value="cover">Cover</option>
                </select>
              )}

              {/* Auto-Trim Margin Toggle */}
              <button
                onClick={() => onChangeAutoTrim && onChangeAutoTrim(!autoTrim)}
                className={`h-8 sm:h-8.5 px-2 flex items-center gap-1 rounded-md font-semibold transition-all cursor-pointer ${
                  autoTrim
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : isDark
                    ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
                title="Auto-Trim Whitespace: Pangkas margin putih kosong"
              >
                <Crop className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline text-xs">{autoTrim ? 'Trim ON' : 'Trim'}</span>
              </button>
            </div>
          </div>

          {/* Right Tool Groups: Viewport Zoom & HUD Overlays */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Group 3: Viewport Zoom & Scaling */}
            <div
              className={`flex items-center p-0.5 rounded-lg border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                onClick={zoomOut}
                aria-label="Zoom Out"
                className={`w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-slate-800 text-slate-200 hover:text-white' : 'hover:bg-slate-200 text-slate-800'
                }`}
                title="Zoom Out (Scroll Down)"
              >
                <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={handleActualSize}
                className={`h-8 sm:h-8.5 px-1.5 sm:px-2 flex items-center justify-center rounded-md transition-colors cursor-pointer text-[11px] sm:text-xs font-mono font-bold ${
                  isDark ? 'hover:bg-slate-800 text-slate-200 hover:text-white' : 'hover:bg-slate-200 text-slate-900'
                }`}
                title="Klik untuk 100% Native Resolusi"
              >
                {Math.round(scale * 100)}%
              </button>

              <button
                onClick={zoomIn}
                aria-label="Zoom In"
                className={`w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-slate-800 text-slate-200 hover:text-white' : 'hover:bg-slate-200 text-slate-800'
                }`}
                title="Zoom In (Scroll Up)"
              >
                <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <div className={`w-px h-4 mx-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`} />

              <button
                onClick={handleFitToScreen}
                aria-label="Fit to Screen"
                className={`w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-slate-800 text-slate-200 hover:text-white' : 'hover:bg-slate-200 text-slate-800'
                }`}
                title="Fit to Screen: Sesuaikan ukuran kanvas dengan layar"
              >
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => {
                  setPan({ x: 0, y: 0 });
                  setScale(1.0);
                }}
                aria-label="Reset Zoom & Pan"
                className={`hidden xs:flex w-8 h-8 sm:w-8.5 sm:h-8.5 items-center justify-center rounded-md transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-slate-800 text-slate-200 hover:text-white' : 'hover:bg-slate-200 text-slate-800'
                }`}
                title="Reset Posisi & Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Group 4: HUD & Monitor Overlays */}
            <div
              className={`flex items-center p-0.5 rounded-lg border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                onClick={() => setShowHUDGrid(!showHUDGrid)}
                aria-label="Toggle Coordinate Grid"
                className={`w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  showHUDGrid
                    ? 'bg-cyan-500/25 text-cyan-400 font-bold border border-cyan-500/40'
                    : isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-200 text-slate-600'
                }`}
                title="Toggle CCTV HUD Coordinate Grid"
              >
                <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => setShowScanlines(!showScanlines)}
                aria-label="Toggle Retro CRT Scanlines"
                className={`w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  showScanlines
                    ? 'bg-cyan-500/25 text-cyan-400 font-bold border border-cyan-500/40'
                    : isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-200 text-slate-600'
                }`}
                title="Toggle CRT Scanline Retro Monitor Effect"
              >
                <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Center Viewport (Solid matte background, NO decorative dot grid) */}
      <div
        ref={viewportRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 w-full h-full flex items-center justify-center p-2 sm:p-4 lg:p-8 overflow-hidden relative touch-none select-none ${
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
            className={`max-w-md w-full p-5 sm:p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${
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
            className="relative shadow-2xl rounded-xs overflow-hidden border border-slate-700/80 transition-transform duration-75 ease-out shrink-0"
            style={{
              width: imageDims.width > 0 ? `${Math.round(imageDims.width * scale)}px` : 'auto',
              height: imageDims.height > 0 ? `${Math.round(imageDims.height * scale)}px` : 'auto',
              transform: `translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: 'center center'
            }}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="block pointer-events-auto"
              style={{
                width: '100%',
                height: '100%',
                display: 'block'
              }}
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
        className={`h-7 sm:h-8 border-t px-2.5 sm:px-4 flex items-center justify-between text-[10px] sm:text-[11px] font-tech transition-colors duration-150 shrink-0 ${
          isDark
            ? 'border-slate-800 bg-[#090c13] text-slate-300'
            : 'border-slate-300 bg-white text-slate-700 font-medium'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <div className="flex items-center gap-1 shrink-0">
            <span className="font-bold">RES:</span>
            <span className={`font-mono ${isDark ? 'text-slate-100 font-semibold' : 'text-slate-900 font-bold'}`}>
              {imageDims.width > 0 ? `${imageDims.width}×${imageDims.height}` : 'STANDBY'}
            </span>
          </div>

          {cursorInfo.visible && (
            <>
              <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>|</span>
              <div className={`hidden xs:flex items-center gap-1 font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-800'}`}>
                <span>X:{cursorInfo.x} Y:{cursorInfo.y}</span>
              </div>
            </>
          )}

          <span className={`${isDark ? 'text-slate-600' : 'text-slate-400'} hidden md:inline`}>|</span>

          <span className="hidden md:inline">
            TOOL:{' '}
            <span className={`uppercase font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {isPanActive ? 'PAN (DRAG)' : 'CROSSHAIR (CLICK +)'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div>
            ZOOM: <span className={`font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-800'}`}>{Math.round(scale * 100)}%</span>
          </div>
          <span className={`${isDark ? 'text-slate-600' : 'text-slate-400'} hidden sm:inline`}>|</span>
          <div className="hidden sm:inline">
            RENDER: <span className={`font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{renderTime}ms</span>
          </div>
          <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>|</span>
          <div>
            FEED:{' '}
            <span className={`uppercase font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-800'}`}>
              {imageSrc ? (isHoldingOriginal ? 'RAW' : 'CCTV') : 'STANDBY'}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
