import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Monitor, Crosshair } from 'lucide-react';
import { renderCCTVVisionEffect } from '../utils/glitchEngine';

export default function CanvasViewer({
  imageSrc,
  config,
  boxes,
  keypoints,
  onAddKeypoint,
  canvasRef
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1.0);
  const [showScanlines, setShowScanlines] = useState(false);
  const [imageDims, setImageDims] = useState({ width: 0, height: 0 });
  const [renderTime, setRenderTime] = useState(0);
  const [activeImage, setActiveImage] = useState(null);

  // Load image object whenever imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageDims({ width: img.naturalWidth, height: img.naturalHeight });
      setActiveImage(img);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Render CCTV and glitch effect whenever config, boxes, or image changes
  useEffect(() => {
    if (!activeImage || !canvasRef.current) return;

    const startTime = performance.now();
    const fullOptions = {
      ...config,
      boxes,
      keypoints
    };

    renderCCTVVisionEffect(canvasRef.current, activeImage, fullOptions);
    const elapsed = Math.round(performance.now() - startTime);
    setRenderTime(elapsed);
  }, [activeImage, config, boxes, keypoints, canvasRef]);

  // Canvas click to add a red tracking cross (+)
  const handleCanvasClick = (e) => {
    if (!canvasRef.current || !onAddKeypoint) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert display coordinates to canvas internal pixel coordinates
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = Math.round(clickX * scaleX);
    const y = Math.round(clickY * scaleY);

    onAddKeypoint({ x, y, label: `track_point_${keypoints.length + 1}` });
  };

  const handleZoomIn = () => setScale((s) => Math.min(2.5, s + 0.15));
  const handleZoomOut = () => setScale((s) => Math.max(0.4, s - 0.15));
  const handleResetZoom = () => setScale(1.0);

  return (
    <main
      ref={containerRef}
      className="flex-1 h-full bg-[#05070a] relative flex flex-col overflow-hidden font-tech select-none"
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl text-slate-300 text-xs">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="px-2 py-1 rounded hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-[11px] font-mono"
          title="100% Scale"
        >
          {Math.round(scale * 100)}%
        </button>
        <div className="w-px h-4 bg-slate-700/60 mx-1" />
        <button
          onClick={() => setShowScanlines(!showScanlines)}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            showScanlines ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="Toggle CRT Scanline Effect"
        >
          <Monitor className="w-4 h-4" />
        </button>
      </div>

      {/* Center Viewport */}
      <div className="flex-1 w-full h-full flex items-center justify-center p-6 overflow-auto">
        <div
          className="relative shadow-2xl rounded-sm overflow-hidden border border-slate-800/80 transition-transform duration-100 ease-out"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="cursor-crosshair max-w-none block"
            title="Klik di mana saja pada gambar untuk menambahkan Red Tracking Cross (+)"
          />

          {/* Optional CRT Scanlines Layer */}
          {showScanlines && <div className="absolute inset-0 scanlines pointer-events-none" />}
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <footer className="h-8 border-t border-slate-800/80 bg-[#090c13] px-4 flex items-center justify-between text-[11px] text-slate-400 font-tech">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-500">
            <Crosshair className="w-3 h-3 text-cyan-500" />
            <span className="text-slate-400">CANVAS_RES:</span>
            <span className="text-slate-200 font-mono">
              {imageDims.width} × {imageDims.height}
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-slate-500">
            CLICKS: <span className="text-slate-300">Click canvas to add tracking cross (+)</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-slate-500">
            RENDER: <span className="text-emerald-400 font-mono">{renderTime}ms</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="text-slate-500">
            STATUS: <span className="text-cyan-400 uppercase">SYNCHRONIZED</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
