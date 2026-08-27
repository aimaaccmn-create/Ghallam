import React, { useState, useMemo } from 'react';
import { X, Palette, Check, Sparkles, Wand2, Paintbrush, Layers, CheckCircle2 } from 'lucide-react';
import { CURATED_PALETTES, CalligraphyPalette } from '../data/calligraphyPalettes';
import { CanvasElement, PaperTextureType } from '../types/calligraphy';

interface CalligraphyPalettesModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: CanvasElement[];
  onUpdateElements: (updates: { id: string; changes: Partial<CanvasElement> }[]) => void;
  onPaperTextureChange: (texture: PaperTextureType) => void;
  onBackgroundColorChange: (color: string) => void;
  currentBackgroundColor: string;
  currentPaperTexture: PaperTextureType;
}

const CATEGORIES = [
  { id: 'all', label: 'همه پالت‌ها' },
  { id: 'royal', label: 'شاهانه و صفوی (زر و لاجورد)' },
  { id: 'traditional', label: 'سنتی و آهارمهره' },
  { id: 'illumination', label: 'تذهیب و نیشابور' },
  { id: 'modern', label: 'مرمر و مدرن' },
  { id: 'earthy', label: 'گردویی و خشت' },
];

export const CalligraphyPalettesModal: React.FC<CalligraphyPalettesModalProps> = React.memo(({
  isOpen,
  onClose,
  elements,
  onUpdateElements,
  onPaperTextureChange,
  onBackgroundColorChange,
  currentBackgroundColor,
  currentPaperTexture,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePaletteId, setActivePaletteId] = useState<string | null>(null);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  const filteredPalettes = useMemo(() => {
    return CURATED_PALETTES.filter(p => 
      selectedCategory === 'all' || p.category === selectedCategory
    );
  }, [selectedCategory]);

  if (!isOpen) return null;

  const handleApplyPalette = (palette: CalligraphyPalette, scope: 'all' | 'text_only' | 'background_only') => {
    setActivePaletteId(palette.id);

    // 1. Background / Paper updates
    if (scope === 'all' || scope === 'background_only') {
      onPaperTextureChange(palette.paperTexture);
      onBackgroundColorChange(palette.backgroundColor);
    }

    // 2. Elements updates
    if (scope === 'all' || scope === 'text_only') {
      const updates = elements.map((el, index) => {
        if (el.type === 'tazhib' || el.type === 'border') {
          return {
            id: el.id,
            changes: {
              color: palette.tazhibColor,
            }
          };
        } else if (el.type === 'tashkeel' || el.type === 'dot') {
          return {
            id: el.id,
            changes: {
              color: palette.accentColor || palette.secondaryTextColor,
            }
          };
        } else {
          // Main text or words
          const isSecondary = index % 3 === 2;
          return {
            id: el.id,
            changes: {
              color: isSecondary ? palette.secondaryTextColor : palette.textColor,
            }
          };
        }
      });

      if (updates.length > 0) {
        onUpdateElements(updates);
      }
    }

    setAppliedNotification(`پالت «${palette.name}» با موفقیت روی قطعه اعمال شد`);
    setTimeout(() => setAppliedNotification(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md select-none font-vazir animate-in fade-in">
      <div className="bg-neutral-950 border border-amber-500/30 w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-neutral-100">
                پالت‌های رنگی و هارمونی خوشنویسی سنتی
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                هارمونی چشم‌نواز زر و لاجورد صفوی، شنگرف قاجاری، دوده عتیق و مرمر سیاه
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-850 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="p-3 border-b border-neutral-850 bg-neutral-900/40 flex gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-600/25 text-amber-300 border-amber-500 font-bold shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Applied Notification Banner */}
        {appliedNotification && (
          <div className="px-4 py-2 bg-emerald-950/60 border-b border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{appliedNotification}</span>
          </div>
        )}

        {/* Palettes Grid */}
        <div className="p-4 overflow-y-auto max-h-[58vh] grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredPalettes.map(palette => {
            const isCurrentMatch = 
              currentBackgroundColor === palette.backgroundColor &&
              currentPaperTexture === palette.paperTexture;

            return (
              <div
                key={palette.id}
                className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                        {palette.name}
                      </span>
                      {palette.isPopular && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          محبوب
                        </span>
                      )}
                    </div>
                    {isCurrentMatch && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>فعال</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
                    {palette.description}
                  </p>

                  {/* Swatches Visual */}
                  <div className="space-y-1.5 mb-3 p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-850">
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                      <span>ترکیب رنگ‌ها:</span>
                      <span className="font-mono text-[9px] text-neutral-500">کاغذ / متن / تذهیب / اعراب</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-9 h-9 rounded-xl border border-neutral-700 shadow-sm flex items-center justify-center shrink-0 relative overflow-hidden"
                        style={{ backgroundColor: palette.backgroundColor }}
                        title={`کاغذ زمینه: ${palette.backgroundColor}`}
                      >
                        <span className="text-[10px] font-nastaliq" style={{ color: palette.textColor }}>
                          کلک
                        </span>
                      </div>
                      <div className="flex-1 flex gap-1.5">
                        <div 
                          className="flex-1 h-7 rounded-lg border border-neutral-700/60"
                          style={{ backgroundColor: palette.textColor }}
                          title={`مرکب اصلی: ${palette.textColor}`}
                        />
                        <div 
                          className="flex-1 h-7 rounded-lg border border-neutral-700/60"
                          style={{ backgroundColor: palette.secondaryTextColor }}
                          title={`مرکب مکمل: ${palette.secondaryTextColor}`}
                        />
                        <div 
                          className="flex-1 h-7 rounded-lg border border-neutral-700/60"
                          style={{ backgroundColor: palette.tazhibColor }}
                          title={`طلای تذهیب: ${palette.tazhibColor}`}
                        />
                        <div 
                          className="flex-1 h-7 rounded-lg border border-neutral-700/60"
                          style={{ backgroundColor: palette.accentColor }}
                          title={`اعراب و نقطه: ${palette.accentColor}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apply Actions */}
                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleApplyPalette(palette, 'all')}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-600/30 to-amber-700/30 hover:from-amber-600/50 hover:to-amber-700/50 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>اعمال کل هارمونی</span>
                  </button>

                  <button
                    onClick={() => handleApplyPalette(palette, 'text_only')}
                    className="py-1.5 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-[11px] transition-all"
                    title="فقط رنگ متن‌ها و کلمات تغییر کند"
                  >
                    فقط حروف
                  </button>

                  <button
                    onClick={() => handleApplyPalette(palette, 'background_only')}
                    className="py-1.5 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-[11px] transition-all"
                    title="فقط رنگ و بافت کاغذ زمینه تغییر کند"
                  >
                    فقط کاغذ
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>پالت‌های منطبق با استانداردهای موزه‌ای و مرقعات کهن</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-all font-semibold"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
});

