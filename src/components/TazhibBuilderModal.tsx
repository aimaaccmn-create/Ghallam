import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  X, 
  Plus, 
  Check, 
  Layers, 
  Palette, 
  Compass, 
  Square,
  Maximize2
} from 'lucide-react';
import { TAZHIB_COLLECTION, TazhibItem } from '../data/tazhibAssets';
import { CanvasElement } from '../types/calligraphy';

interface TazhibBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddElements: (elements: CanvasElement[]) => void;
  canvasWidth: number;
  canvasHeight: number;
}

const TAZHIB_PALETTES = [
  { name: 'طلای کهن سنتی', color: '#b45309' },
  { name: 'طلای ناب و زرین', color: '#f59e0b' },
  { name: 'لاجورد نیشابوری', color: '#1e3a8a' },
  { name: 'شنگرف درباری', color: '#991b1b' },
  { name: 'سبز یشمی تذهیب', color: '#065f46' },
  { name: 'سیاه‌قلم اسلیمی', color: '#18181b' },
];

const CATEGORIES = [
  { id: 'all', label: 'همه نقوش' },
  { id: 'shamseh', label: 'شمسه و مدالیون' },
  { id: 'toranj', label: 'ترنج و سرترنج' },
  { id: 'lachak', label: 'لچک و گوشه' },
  { id: 'eslimi', label: 'پیچک اسلیمی' },
  { id: 'border', label: 'حاشیه و قاب' },
  { id: 'ornament', label: 'گل شاه‌عباسی' },
];

export const TazhibBuilderModal: React.FC<TazhibBuilderModalProps> = React.memo(({
  isOpen,
  onClose,
  onAddElements,
  canvasWidth,
  canvasHeight,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<TazhibItem | null>(TAZHIB_COLLECTION[0] || null);
  const [selectedColor, setSelectedColor] = useState<string>('#d97706');
  const [scale, setScale] = useState<number>(1.2);
  const [opacity, setOpacity] = useState<number>(0.9);
  const [is4CornerSymmetry, setIs4CornerSymmetry] = useState<boolean>(false);

  const filteredItems = useMemo(() => {
    return activeCategory === 'all' 
      ? TAZHIB_COLLECTION 
      : TAZHIB_COLLECTION.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  const handleApplyToCanvas = () => {
    if (!selectedItem) return;

    if (is4CornerSymmetry || selectedItem.category === 'lachak') {
      // Create 4 symmetric corners
      const cornerMargin = 55;
      const cornerElements: CanvasElement[] = [
        // Top-Right
        {
          id: `tazhib_corner_tr_${Date.now()}`,
          name: `لچک راست بالا (${selectedItem.name})`,
          type: 'tazhib',
          tazhibName: selectedItem.id,
          x: canvasWidth - cornerMargin - 40,
          y: cornerMargin + 40,
          fontSize: 30,
          fontFamily: '',
          color: selectedColor,
          rotation: 0,
          scaleX: scale,
          scaleY: scale,
          opacity,
          zIndex: 2,
          width: 80,
          height: 80,
        },
        // Top-Left
        {
          id: `tazhib_corner_tl_${Date.now()}`,
          name: `لچک چپ بالا (${selectedItem.name})`,
          type: 'tazhib',
          tazhibName: selectedItem.id,
          x: cornerMargin + 40,
          y: cornerMargin + 40,
          fontSize: 30,
          fontFamily: '',
          color: selectedColor,
          rotation: 90,
          scaleX: scale,
          scaleY: scale,
          opacity,
          zIndex: 2,
          width: 80,
          height: 80,
        },
        // Bottom-Left
        {
          id: `tazhib_corner_bl_${Date.now()}`,
          name: `لچک چپ پایین (${selectedItem.name})`,
          type: 'tazhib',
          tazhibName: selectedItem.id,
          x: cornerMargin + 40,
          y: canvasHeight - cornerMargin - 40,
          fontSize: 30,
          fontFamily: '',
          color: selectedColor,
          rotation: 180,
          scaleX: scale,
          scaleY: scale,
          opacity,
          zIndex: 2,
          width: 80,
          height: 80,
        },
        // Bottom-Right
        {
          id: `tazhib_corner_br_${Date.now()}`,
          name: `لچک راست پایین (${selectedItem.name})`,
          type: 'tazhib',
          tazhibName: selectedItem.id,
          x: canvasWidth - cornerMargin - 40,
          y: canvasHeight - cornerMargin - 40,
          fontSize: 30,
          fontFamily: '',
          color: selectedColor,
          rotation: 270,
          scaleX: scale,
          scaleY: scale,
          opacity,
          zIndex: 2,
          width: 80,
          height: 80,
        },
      ];
      onAddElements(cornerElements);
    } else {
      // Center placement
      const centerEl: CanvasElement = {
        id: `tazhib_${Date.now()}`,
        name: selectedItem.name,
        type: 'tazhib',
        tazhibName: selectedItem.id,
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        fontSize: 30,
        fontFamily: '',
        color: selectedColor,
        rotation: 0,
        scaleX: scale,
        scaleY: scale,
        opacity,
        zIndex: 2,
        width: 100,
        height: 100,
      };
      onAddElements([centerEl]);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl font-vazir select-none">
      <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                کارگاه تذهیب، شمسه و لچک‌های برداری تعاملی (Modular Tazhib)
              </h2>
              <p className="text-xs text-neutral-400">
                مجموعه وکتورهای اصیل اسلیمی، ترنج، شمسه و لچک‌های مذهب با تقارن ۴ گوشه
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="p-3 px-6 border-b border-neutral-800/80 bg-neutral-900/60 flex items-center gap-2 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-800/70 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 border-neutral-700/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Items Grid (Col 1 & 2) */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[420px] p-1">
            {filteredItems.map(item => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10 scale-[1.02]'
                      : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="w-20 h-20 flex items-center justify-center p-2">
                    <svg viewBox={item.viewBox} className="w-full h-full drop-shadow-md">
                      <path d={item.path} fill={isSelected ? selectedColor : item.defaultColor || '#d97706'} />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium text-neutral-300 text-center mt-2 line-clamp-1">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Configuration & Preview Panel (Col 3) */}
          <div className="bg-neutral-950/50 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-neutral-200 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>تنظیمات رنگ و جانمایی تذهیب</span>
              </h3>

              {/* Color Presets */}
              <div className="space-y-2 mb-4">
                <label className="text-[11px] text-neutral-400">پالت رنگ‌های زرنگار و سنتی:</label>
                <div className="grid grid-cols-3 gap-2">
                  {TAZHIB_PALETTES.map((pal, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(pal.color)}
                      style={{ borderColor: selectedColor === pal.color ? '#f59e0b' : 'transparent' }}
                      className="p-1.5 rounded-xl bg-neutral-900 border-2 flex items-center gap-1.5 text-[10px] text-neutral-300 transition-all hover:bg-neutral-850"
                    >
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: pal.color }} />
                      <span className="truncate">{pal.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>مقیاس اندازه:</span>
                    <span className="text-amber-400 font-mono">{Math.round(scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>شفافیت (Opacity):</span>
                    <span className="text-amber-400 font-mono">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              {/* Symmetry Mode Switch */}
              <div className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800 mb-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-neutral-200">تقارن چهارگوشه بوم</div>
                      <div className="text-[10px] text-neutral-400">چیدمان همزمان ۴ لچک در زوایای بوم</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={is4CornerSymmetry}
                    onChange={(e) => setIs4CornerSymmetry(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleApplyToCanvas}
              disabled={!selectedItem}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>
                {is4CornerSymmetry ? 'افزودن ۴ لچک متقارن به بوم' : 'افزودن تذهیب به مرکز بوم'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

