import React, { useState } from 'react';
import { 
  Sparkles, 
  SunMedium, 
  Layers, 
  Check, 
  X, 
  RotateCw, 
  Flame, 
  Zap 
} from 'lucide-react';
import { CanvasElement } from '../types/calligraphy';

export interface MetallicShimmerStyle {
  id: string;
  name: string;
  category: 'gold' | 'silver' | 'copper' | 'lapis' | 'ruby' | 'emerald';
  gradient: string;
  textShadow: string;
  previewColor: string;
  angle: number;
}

export const METALLIC_SHIMMER_PRESETS: MetallicShimmerStyle[] = [
  {
    id: 'gold_leaf_royal',
    name: 'ورق طلای سلطنتی (Royal Gold Leaf)',
    category: 'gold',
    gradient: 'linear-gradient(135deg, #fff3a1 0%, #d4af37 35%, #aa771c 70%, #ffd700 100%)',
    textShadow: '0 2px 8px rgba(212, 175, 55, 0.6), 0 0 20px rgba(255, 215, 0, 0.4)',
    previewColor: '#d4af37',
    angle: 135,
  },
  {
    id: 'antique_rose_gold',
    name: 'طلای رز و عتیقه (Antique Rose Gold)',
    category: 'gold',
    gradient: 'linear-gradient(135deg, #fbeee6 0%, #e8a598 40%, #b76e79 75%, #fad0c4 100%)',
    textShadow: '0 2px 8px rgba(183, 110, 121, 0.6)',
    previewColor: '#b76e79',
    angle: 135,
  },
  {
    id: 'silver_moon_shimmer',
    name: 'نقره درخشان مهتابی (Moonlit Silver)',
    category: 'silver',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 30%, #94a3b8 70%, #cbd5e1 100%)',
    textShadow: '0 2px 10px rgba(226, 232, 240, 0.7), 0 0 15px rgba(148, 163, 184, 0.5)',
    previewColor: '#cbd5e1',
    angle: 135,
  },
  {
    id: 'copper_hammered',
    name: 'مس چکش‌خورده کاشان (Hammered Copper)',
    category: 'copper',
    gradient: 'linear-gradient(135deg, #fed7aa 0%, #ea580c 45%, #9a3412 80%, #f97316 100%)',
    textShadow: '0 2px 8px rgba(234, 88, 12, 0.6)',
    previewColor: '#ea580c',
    angle: 135,
  },
  {
    id: 'lapis_lazuli_gold',
    name: 'لاجورد رگه‌دار زرین (Lapis Lazuli with Gold)',
    category: 'lapis',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #172554 30%, #d4af37 55%, #1e40af 80%, #ffd700 100%)',
    textShadow: '0 2px 12px rgba(30, 58, 138, 0.8), 0 0 15px rgba(212, 175, 55, 0.5)',
    previewColor: '#1e3a8a',
    angle: 135,
  },
  {
    id: 'ruby_crimson_glaze',
    name: 'یاقوت اناری و لعاب زر (Ruby Crimson Glaze)',
    category: 'ruby',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #881337 40%, #fbbf24 60%, #4c0519 100%)',
    textShadow: '0 2px 10px rgba(136, 19, 55, 0.7)',
    previewColor: '#881337',
    angle: 135,
  },
];

interface MetallicShimmerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedElement: CanvasElement | null;
  onApplyShimmer: (shimmerId: string, customAngle: number) => void;
}

export const MetallicShimmerModal: React.FC<MetallicShimmerModalProps> = ({
  isOpen,
  onClose,
  selectedElement,
  onApplyShimmer,
}) => {
  const [activeAngle, setActiveAngle] = useState(135);
  const [selectedId, setSelectedId] = useState<string>('gold_leaf_royal');

  if (!isOpen) return null;

  const handleSelect = (preset: MetallicShimmerStyle) => {
    setSelectedId(preset.id);
    onApplyShimmer(preset.id, activeAngle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-neutral-200 font-vazir">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <SunMedium className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100">پالت‌های نوری و متالیک (Metallic & Shimmer Shaders)</h3>
              <p className="text-[11px] text-neutral-400">شبیه‌سازی بازتاب ورق طلا، نقره، مس چکش‌خورده و لاجورد روی حروف</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Target Element Info */}
          {selectedElement && (
            <div className="flex items-center justify-between bg-neutral-950/60 p-3 rounded-xl border border-neutral-800 text-xs">
              <span className="text-neutral-400">عنصر انتخاب‌شده:</span>
              <span className="font-bold text-amber-300 font-nastaliq text-base">{selectedElement.text || selectedElement.name || 'المان جاری'}</span>
            </div>
          )}

          {/* Presets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {METALLIC_SHIMMER_PRESETS.map((preset) => {
              const isSelected = selectedId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelect(preset)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 relative ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10'
                      : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg shadow-inner flex items-center justify-center text-white text-xs font-bold shrink-0 border border-white/20"
                    style={{ background: preset.gradient }}
                  >
                    ✦
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-neutral-200 truncate">{preset.name}</h4>
                    <p className="text-[10px] text-neutral-400">طیف بازتاب زاویه‌دار</p>
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Angle Control */}
          <div className="bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">زاویه تابش نور (Light Reflection Angle)</span>
              <span className="font-mono text-amber-400 font-bold">{activeAngle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={activeAngle}
              onChange={(e) => {
                const angle = parseInt(e.target.value);
                setActiveAngle(angle);
                onApplyShimmer(selectedId, angle);
              }}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-medium"
          >
            انصراف
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition"
          >
            اعمال و بازگشت
          </button>
        </div>
      </div>
    </div>
  );
};
