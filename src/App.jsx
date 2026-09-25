import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ControlPanel from './components/ControlPanel';
import CanvasViewer from './components/CanvasViewer';
import AlphaPromptModal from './components/AlphaPromptModal';
import PresetsModal from './components/PresetsModal';
import { SAMPLE_PRESETS } from './utils/sampleImages';
import { scanImage, initMediaPipe } from './utils/mediaPipeService';

export default function App() {
  const canvasRef = useRef(null);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Initialize with the Fashion Model preset (matching the video's iconic look)
  const defaultPreset = SAMPLE_PRESETS[0];
  const [imageSrc, setImageSrc] = useState(null);

  const [config, setConfig] = useState({
    themeColor: defaultPreset.defaultColor,
    colorName: 'Tokyo Lavender',
    detectionMode: defaultPreset.defaultMode,
    darkThreshold: 80,
    brightThreshold: 185,
    contrastThreshold: 45,
    blockSize: defaultPreset.defaultBlockSize,
    density: defaultPreset.defaultDensity,
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

  // Initialize MediaPipe in the background on mount
  useEffect(() => {
    initMediaPipe();
    // Load default preset canvas
    const imgData = defaultPreset.generate();
    setImageSrc(imgData);
  }, []);

  // When imageSrc updates, run automated machine-vision scan
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      setIsScanning(true);
      try {
        const result = await scanImage(img);
        setBoxes(result.boxes || []);
        setKeypoints(result.keypoints || []);
      } catch (err) {
        console.error('Scan error:', err);
      } finally {
        setIsScanning(false);
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Handler for custom image upload
  const handleUploadImage = (dataUrl) => {
    setImageSrc(dataUrl);
  };

  // Handler for selecting one of the built-in video presets
  const handleSelectPreset = (preset) => {
    const dataUrl = preset.generate();
    setConfig((prev) => ({
      ...prev,
      themeColor: preset.defaultColor,
      colorName: preset.name.split('(')[1]?.replace(')', '') || 'Preset Color',
      detectionMode: preset.defaultMode,
      blockSize: preset.defaultBlockSize,
      density: preset.defaultDensity,
      seed: Math.floor(Math.random() * 100000)
    }));
    setImageSrc(dataUrl);
  };

  // Trigger manual MediaPipe scan on active image
  const handleRunMediaPipeScan = async () => {
    if (!imageSrc) return;
    setIsScanning(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        const result = await scanImage(img);
        setBoxes(result.boxes || []);
        setKeypoints(result.keypoints || []);
      } finally {
        setIsScanning(false);
      }
    };
    img.src = imageSrc;
  };

  // Export finished image at full resolution
  const handleExportImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `cctv_vision_effect_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Add tracking cross (+) on canvas click
  const handleAddKeypoint = (kp) => {
    setKeypoints((prev) => [...prev, kp]);
  };

  const handleUpdateConfig = (newProps) => {
    setConfig((prev) => ({ ...prev, ...newProps }));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07090e] text-slate-100 overflow-hidden font-tech">
      {/* Top Navbar */}
      <Navbar
        activeColor={config.themeColor}
        colorName={config.colorName}
        detectionMode={config.detectionMode}
        onOpenPrompt={() => setIsPromptOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onExportImage={handleExportImage}
        isScanning={isScanning}
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
          boxes={boxes}
          onUpdateBoxes={setBoxes}
          keypoints={keypoints}
          onUpdateKeypoints={setKeypoints}
        />

        {/* Center Interactive Canvas Viewport */}
        <CanvasViewer
          imageSrc={imageSrc}
          config={config}
          boxes={boxes}
          keypoints={keypoints}
          onAddKeypoint={handleAddKeypoint}
          canvasRef={canvasRef}
        />
      </div>

      {/* Alpha Prompt Modal */}
      <AlphaPromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        config={{ ...config, boxes }}
      />

      {/* Reference Video Presets Modal */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
}
