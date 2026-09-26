import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ControlPanel from './components/ControlPanel';
import CanvasViewer from './components/CanvasViewer';
import AlphaPromptModal from './components/AlphaPromptModal';
import PresetsModal from './components/PresetsModal';
import { STYLE_PRESETS } from './utils/sampleImages';
import { scanImage, initMediaPipe, getSensorStatus } from './utils/mediaPipeService';
import { prepareOptimizedImage } from './utils/imageProcessor';
import { renderCCTVVisionEffect } from './utils/glitchEngine';

export default function App() {
  const canvasRef = useRef(null);

  // Theme Management (Dark / Light)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cctv_theme') || 'dark';
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('cctv_theme', next);
  };

  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [sensorStatus, setSensorStatus] = useState(getSensorStatus());
  const [scanNotification, setScanNotification] = useState(null);

  // Auto-dismiss scan notification after 5 seconds (R-26 / C-2)
  useEffect(() => {
    if (!scanNotification) return;
    const timer = setTimeout(() => {
      setScanNotification(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [scanNotification]);

  // Image Source & Canvas Sizing States
  const [imageSrc, setImageSrc] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('original');
  const [fitMode, setFitMode] = useState('smart_fit');
  const [autoTrim, setAutoTrim] = useState(false);
  const [canvasBg, setCanvasBg] = useState('#ffffff');
  const [processedCanvas, setProcessedCanvas] = useState(null);

  // Default style parameters (Tokyo Lavender)
  const defaultPreset = STYLE_PRESETS[0];
  const [config, setConfig] = useState({
    themeColor: defaultPreset.themeColor,
    colorName: defaultPreset.colorName,
    detectionMode: defaultPreset.detectionMode,
    darkThreshold: defaultPreset.darkThreshold,
    brightThreshold: defaultPreset.brightThreshold,
    contrastThreshold: defaultPreset.contrastThreshold,
    blockSize: defaultPreset.blockSize,
    density: defaultPreset.density,
    fontFamily: 'JetBrains Mono',
    fontScale: 1.0,
    exportMultiplier: 2,
    confineToBoxes: true,
    showBoxes: true,
    showKeypoints: true,
    cornerTicks: true,
    showDiagnosticCode: true,
    showTelemetry: true,
    boxStrokeWidth: 1.25,
    corruptionOpacity: 1.0,
    seed: 42
  });

  const [boxes, setBoxes] = useState([]);
  const [keypoints, setKeypoints] = useState([]);

  // Initialize MediaPipe sensor on mount with progressive status update
  useEffect(() => {
    initMediaPipe((liveStatus) => {
      setSensorStatus({ ...liveStatus });
    }).then(() => {
      setSensorStatus(getSensorStatus());
    });
  }, []);

  // Process image sizing & auto-scan whenever imageSrc or framing options change
  useEffect(() => {
    if (!imageSrc) {
      setProcessedCanvas(null);
      setBoxes([]);
      setKeypoints([]);
      return;
    }

    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      if (isCancelled) return;

      // 1. Prepare target canvas according to aspect ratio, fitMode, and autoTrim
      const optimizedCanvas = prepareOptimizedImage(img, {
        aspectRatioId: aspectRatio,
        fitMode,
        autoTrim,
        backgroundColor: canvasBg
      });

      if (isCancelled) return;
      setProcessedCanvas(optimizedCanvas);

      // 2. Perform AI scan on the newly formatted canvas
      setIsScanning(true);
      try {
        const result = await scanImage(optimizedCanvas);
        if (isCancelled) return;
        setBoxes(result.boxes || []);
        setKeypoints(result.keypoints || []);
        setSensorStatus(getSensorStatus());

        setScanNotification({
          type: 'success',
          title: 'Pemindaian Selesai',
          message: `${result.boxes.length} bounding box & ${result.keypoints.length} keypoint terdeteksi via ${result.engine}`
        });
      } catch (err) {
        if (!isCancelled) {
          console.warn('Scan error:', err);
        }
      } finally {
        if (!isCancelled) {
          setIsScanning(false);
        }
      }
    };

    img.onerror = () => {
      if (!isCancelled) {
        setIsScanning(false);
        setScanNotification({
          type: 'error',
          title: 'Gagal Memuat Gambar',
          message: 'File gambar tidak dapat dibaca atau rusak.'
        });
      }
    };

    img.src = imageSrc;

    return () => {
      isCancelled = true;
    };
  }, [imageSrc, aspectRatio, fitMode, autoTrim, canvasBg]);

  // When custom image is uploaded
  const handleUploadImage = (dataUrl) => {
    setImageSrc(dataUrl);
    setScanNotification(null);
  };

  // Select style preset
  const handleSelectPreset = (preset) => {
    setConfig((prev) => ({
      ...prev,
      themeColor: preset.themeColor,
      colorName: preset.colorName,
      detectionMode: preset.detectionMode,
      darkThreshold: preset.darkThreshold,
      brightThreshold: preset.brightThreshold,
      contrastThreshold: preset.contrastThreshold,
      blockSize: preset.blockSize,
      density: preset.density,
      seed: Math.floor(Math.random() * 100000)
    }));

    setScanNotification({
      type: 'info',
      title: 'Preset Diterapkan',
      message: `Style ${preset.colorName} aktif (Mode: ${preset.detectionMode.toUpperCase()})`
    });
  };

  // Trigger manual MediaPipe scan on active processed canvas
  const handleRunMediaPipeScan = async () => {
    if (!processedCanvas) return;
    setIsScanning(true);
    setScanNotification(null);

    try {
      const result = await scanImage(processedCanvas);
      setBoxes(result.boxes || []);
      setKeypoints(result.keypoints || []);
      setSensorStatus(getSensorStatus());

      setScanNotification({
        type: 'success',
        title: 'Scan Sukses',
        message: `${result.boxes.length} box & ${result.keypoints.length} tracking point terdeteksi via ${result.engine}`
      });
    } catch (err) {
      console.warn('Manual scan error:', err);
      setScanNotification({
        type: 'error',
        title: 'Sensor Fallback',
        message: 'Deteksi dialihkan ke sistem Computer Vision Saliency.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Clear / Empty Canvas completely
  const handleClearCanvas = () => {
    setImageSrc(null);
    setProcessedCanvas(null);
    setBoxes([]);
    setKeypoints([]);
    setScanNotification(null);
  };

  // Export finished image at ultra-crisp resolution (with 2X Supersampling Anti-Pecah)
  const handleExportImage = async () => {
    if (!canvasRef.current || !imageSrc) return;

    // Ensure all custom web fonts are fully rasterized by the browser
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const multiplier = config.exportMultiplier || 2;
    let finalDataUrl = '';

    if (multiplier > 1 && processedCanvas) {
      // 2X Supersampling: creates high-resolution offscreen canvas with geometric precision
      const offscreen = document.createElement('canvas');
      const baseW = processedCanvas.width;
      const baseH = processedCanvas.height;
      offscreen.width = baseW * multiplier;
      offscreen.height = baseH * multiplier;

      const offCtx = offscreen.getContext('2d');
      offCtx.imageSmoothingEnabled = true;
      offCtx.imageSmoothingQuality = 'high';
      if ('textRendering' in offCtx) {
        offCtx.textRendering = 'geometricPrecision';
      }

      // Scale machine-vision detection boxes and tracking keypoints proportionally
      const scaledBoxes = (boxes || []).map((b) => ({
        ...b,
        x: Math.round(b.x * multiplier),
        y: Math.round(b.y * multiplier),
        width: Math.round(b.width * multiplier),
        height: Math.round(b.height * multiplier)
      }));

      const scaledKeypoints = (keypoints || []).map((k) => ({
        ...k,
        x: Math.round(k.x * multiplier),
        y: Math.round(k.y * multiplier)
      }));

      const fullOptions = {
        ...config,
        boxes: scaledBoxes,
        keypoints: scaledKeypoints
      };

      renderCCTVVisionEffect(offscreen, processedCanvas, fullOptions);
      finalDataUrl = offscreen.toDataURL('image/png');
    } else {
      finalDataUrl = canvasRef.current.toDataURL('image/png');
    }

    const link = document.createElement('a');
    link.download = `cctv_vision_${Date.now()}.png`;
    link.href = finalDataUrl;
    link.click();
  };

  const handleAddKeypoint = (kp) => {
    setKeypoints((prev) => [...prev, kp]);
  };

  const handleUpdateConfig = (newProps) => {
    setConfig((prev) => ({ ...prev, ...newProps }));
  };

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden font-tech transition-colors duration-150 ${
        theme === 'dark' ? 'bg-[#06080c] text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        activeColor={config.themeColor}
        colorName={config.colorName}
        detectionMode={config.detectionMode}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenPrompt={() => setIsPromptOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onClearCanvas={handleClearCanvas}
        onExportImage={handleExportImage}
        hasImage={Boolean(imageSrc)}
        sensorStatus={sensorStatus}
      />

      {/* Main Studio Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Control Panel */}
        <ControlPanel
          config={config}
          onChangeConfig={handleUpdateConfig}
          onUploadImage={handleUploadImage}
          onRunMediaPipeScan={handleRunMediaPipeScan}
          isScanning={isScanning}
          scanNotification={scanNotification}
          onDismissNotification={() => setScanNotification(null)}
          sensorStatus={sensorStatus}
          boxes={boxes}
          onUpdateBoxes={setBoxes}
          keypoints={keypoints}
          onUpdateKeypoints={setKeypoints}
          theme={theme}
          hasImage={Boolean(imageSrc)}
          aspectRatio={aspectRatio}
          onChangeAspectRatio={setAspectRatio}
          fitMode={fitMode}
          onChangeFitMode={setFitMode}
          autoTrim={autoTrim}
          onChangeAutoTrim={setAutoTrim}
          canvasBg={canvasBg}
          onChangeCanvasBg={setCanvasBg}
        />

        {/* Center Interactive Canvas Viewport */}
        <CanvasViewer
          imageSrc={imageSrc}
          processedImage={processedCanvas}
          config={config}
          boxes={boxes}
          keypoints={keypoints}
          onAddKeypoint={handleAddKeypoint}
          onUploadImage={handleUploadImage}
          canvasRef={canvasRef}
          theme={theme}
          aspectRatio={aspectRatio}
          onChangeAspectRatio={setAspectRatio}
          fitMode={fitMode}
          onChangeFitMode={setFitMode}
          autoTrim={autoTrim}
          onChangeAutoTrim={setAutoTrim}
        />
      </div>

      {/* Alpha Prompt Modal */}
      <AlphaPromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        config={{ ...config, boxes }}
        theme={theme}
      />

      {/* Style Presets Modal */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
        theme={theme}
      />
    </div>
  );
}
