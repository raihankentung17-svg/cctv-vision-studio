import React, { useState } from 'react';
import { Plus, Trash2, Tag, ChevronDown, ChevronUp } from 'lucide-react';

export default function BoxManager({
  boxes,
  onUpdateBoxes,
  keypoints,
  onUpdateKeypoints,
  themeColor,
  theme = 'dark'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newSubLabel, setNewSubLabel] = useState('');

  const isDark = theme === 'dark';

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
    <div
      className={`border rounded-lg overflow-hidden font-tech text-xs transition-colors ${
        isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-white'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 flex items-center justify-between transition-colors cursor-pointer ${
          isDark
            ? 'bg-slate-900/80 hover:bg-slate-800/80 text-slate-300'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-cyan-500" />
          <span className="font-bold">Tracked Bounding Boxes</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              isDark ? 'bg-slate-800 text-cyan-300' : 'bg-slate-200 text-cyan-800'
            }`}
          >
            {boxes.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        ) : (
          <ChevronDown className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        )}
      </button>

      {isOpen && (
        <div
          className={`p-3 space-y-3 border-t ${
            isDark ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          {/* Box List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {boxes.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic py-1">
                Tidak ada kotak aktif. Upload gambar lalu klik "Scan MediaPipe" atau tambah manual.
              </p>
            ) : (
              boxes.map((box) => (
                <div
                  key={box.id}
                  className={`flex items-center justify-between p-2 rounded border ${
                    isDark
                      ? 'bg-slate-900 border-slate-800/90 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold" style={{ color: themeColor }}>
                      [{box.label}]
                    </span>
                    {box.subLabel && (
                      <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {box.subLabel} (conf: {box.conf})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteBox(box.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete box"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Custom Box Input */}
          <div
            className={`pt-2 border-t space-y-2 ${
              isDark ? 'border-slate-800/60' : 'border-slate-200'
            }`}
          >
            <span className={`text-[11px] font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Tambah Box Manual:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Label (e.g. head)"
                className={`px-2 py-1 rounded border text-xs focus:outline-none focus:border-cyan-500 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-600'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <input
                type="text"
                value={newSubLabel}
                onChange={(e) => setNewSubLabel(e.target.value)}
                placeholder="Sub-label (e.g. face)"
                className={`px-2 py-1 rounded border text-xs focus:outline-none focus:border-cyan-500 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-600'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleAddBox}
                disabled={!newLabel.trim()}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400 disabled:opacity-40'
                    : 'bg-slate-200 hover:bg-slate-300 text-cyan-700 disabled:opacity-40'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>Add Box</span>
              </button>
              {boxes.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] text-red-500 hover:underline cursor-pointer"
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
