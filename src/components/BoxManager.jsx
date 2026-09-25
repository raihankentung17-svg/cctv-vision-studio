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
        isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-white shadow-xs'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between transition-colors cursor-pointer font-bold ${
          isDark
            ? 'bg-slate-900/80 hover:bg-slate-800/80 text-slate-200'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-cyan-600" />
          <span>Tracked Bounding Boxes</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isDark ? 'bg-slate-800 text-cyan-300' : 'bg-slate-200 text-cyan-900'
            }`}
          >
            {boxes.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
        ) : (
          <ChevronDown className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
        )}
      </button>

      {isOpen && (
        <div
          className={`p-3 space-y-3 border-t ${
            isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
          }`}
        >
          {/* Box List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {boxes.length === 0 ? (
              <p className={`text-xs italic py-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Tidak ada kotak aktif. Upload gambar lalu klik "Scan MediaPipe" atau tambah manual.
              </p>
            ) : (
              boxes.map((box) => (
                <div
                  key={box.id}
                  className={`flex items-center justify-between p-2.5 rounded-md border min-h-[40px] ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-xs" style={{ color: themeColor }}>
                      [{box.label}]
                    </span>
                    {box.subLabel && (
                      <span className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {box.subLabel} (conf: {box.conf})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteBox(box.id)}
                    aria-label={`Hapus box ${box.label}`}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete box"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Custom Box Input */}
          <div
            className={`pt-2 border-t space-y-2 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <span className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Tambah Box Manual:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Label (e.g. head)"
                className={`min-h-[40px] px-2.5 py-1.5 rounded border text-xs focus:outline-none focus:border-cyan-500 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
              />
              <input
                type="text"
                value={newSubLabel}
                onChange={(e) => setNewSubLabel(e.target.value)}
                placeholder="Sub-label (e.g. face)"
                className={`min-h-[40px] px-2.5 py-1.5 rounded border text-xs focus:outline-none focus:border-cyan-500 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleAddBox}
                disabled={!newLabel.trim()}
                className={`min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 disabled:opacity-40'
                    : 'bg-slate-200 hover:bg-slate-300 text-cyan-900 disabled:opacity-40'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Box</span>
              </button>
              {boxes.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:underline cursor-pointer font-semibold py-2"
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
