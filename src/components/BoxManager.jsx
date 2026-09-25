import React, { useState } from 'react';
import { Plus, Trash2, Tag, Crosshair, ChevronDown, ChevronUp } from 'lucide-react';

export default function BoxManager({
  boxes,
  onUpdateBoxes,
  keypoints,
  onUpdateKeypoints,
  themeColor
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newSubLabel, setNewSubLabel] = useState('');

  const handleDeleteBox = (id) => {
    onUpdateBoxes(boxes.filter(b => b.id !== id));
  };

  const handleAddBox = () => {
    if (!newLabel.trim()) return;
    const newBox = {
      id: `custom_${Date.now()}`,
      label: newLabel.trim(),
      subLabel: newSubLabel.trim() || undefined,
      conf: '0.98',
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      type: 'custom'
    };
    onUpdateBoxes([...boxes, newBox]);
    setNewLabel('');
    setNewSubLabel('');
  };

  const handleClearAll = () => {
    onUpdateBoxes([]);
    onUpdateKeypoints([]);
  };

  return (
    <div className="border border-slate-800 rounded-lg bg-slate-900/50 overflow-hidden font-tech text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 flex items-center justify-between bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold">Tracked Bounding Boxes</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-cyan-300">
            {boxes.length}
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {isOpen && (
        <div className="p-3 space-y-3 border-t border-slate-800/80 bg-slate-950/40">
          {/* Box List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {boxes.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic py-1">
                Tidak ada kotak aktif. Klik "Run MediaPipe / AI Scan" atau tambah kotak manual.
              </p>
            ) : (
              boxes.map((box) => (
                <div
                  key={box.id}
                  className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/90 hover:border-slate-700"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200" style={{ color: themeColor }}>
                      [{box.label}]
                    </span>
                    {box.subLabel && (
                      <span className="text-[10px] text-slate-400">
                        {box.subLabel} (conf: {box.conf})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteBox(box.id)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Delete box"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Custom Box Input */}
          <div className="pt-2 border-t border-slate-800/60 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block">Tambah Box Manual:</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Label (e.g. head)"
                className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                value={newSubLabel}
                onChange={(e) => setNewSubLabel(e.target.value)}
                placeholder="Sub-label (e.g. face_profile)"
                className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleAddBox}
                disabled={!newLabel.trim()}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-400 text-xs font-medium cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Box</span>
              </button>
              {boxes.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] text-red-400 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
