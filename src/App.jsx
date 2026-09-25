import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ControlPanel from './components/ControlPanel';
import CanvasViewer from './components/CanvasViewer';
import AlphaPromptModal from './components/AlphaPromptModal';
import PresetsModal from './components/PresetsModal';
import { STYLE_PRESETS } from './utils/sampleImages';
import { scanImage, initMediaPipe, getSensorStatus } from './utils/mediaPipeService';

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

  // Default clean empty canvas state
  const [imageSrc, setImageSrc] = useState(null);

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

  // Initialize MediaPipe sensor on mount
  useEffect(() => {
    initMediaPipe().then(() => {
      setSensorStatus(getSensorStatus());
    });
  }, []);

  // When custom image is uploaded, auto-run scan
  const handleUploadImage = (dataUrl) => {
    setImageSrc(dataUrl);
    setScanNotification(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      setIsScanning(true);
      try {
        const result = await scanImage(img);
        setBoxes(result.boxes || []);
        setKeypoints(result.keypoints || []);
        setSensorStatus(getSensorStatus());

        setScanNotification({
          type: 'success',
          title: 'Auto-Scan Selesai',
          message: `${result.boxes.length} bounding box & ${result.keypoints.length} keypoint terdeteksi via ${result.engine}`
        });
      } catch (err) {
        console.error('Scan error:', err);
        setScanNotification({
          type: 'info',
          title: 'Sensor Notification',
          message: 'Gambar dimuat. Gunakan tombol Scan MediaPipe untuk deteksi anatomi.'
        });
      } finally {
        setIsScanning(false);
      }
    };
    img.onerror = () => {
      setIsScanning(false);
      setScanNotification({
        type: 'error',
        title: 'Gagal Memuat Gambar',
        message: 'File gambar tidak dapat dibaca atau rusak.'
      });
    };
    img.src = dataUrl;
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

  // Trigger manual MediaPipe scan on active image
  const handleRunMediaPipeScan = async () => {
    if (!imageSrc) return;
    setIsScanning(true);
    setScanNotification(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        const result = await scanImage(img);
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
    img.onerror = () => {
      setIsScanning(false);
    };
    img.src = imageSrc;
  };

  // Clear / Empty Canvas completely
  const handleClearCanvas = () => {
    setImageSrc(null);
    setBoxes([]);
    setKeypoints([]);
    setScanNotification(null);
  };

  // Export finished image at full resolution
  const handleExportImage = () => {
    if (!canvasRef.current || !imageSrc) return;
    const link = document.createElement('a');
    link.download = `cctv_vision_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
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
        />

        {/* Center Interactive Canvas Viewport */}
        <CanvasViewer
          imageSrc={imageSrc}
          config={config}
          boxes={boxes}
          keypoints={keypoints}
          onAddKeypoint={handleAddKeypoint}
          onUploadImage={handleUploadImage}
          canvasRef={canvasRef}
          theme={theme}
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
