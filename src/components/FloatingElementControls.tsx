import React, { useState } from 'react';
import { 
  Trash2, 
  Copy, 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Plus,
  Minus,
  Wand2,
  Lock,
  Unlock,
  Scissors,
  Orbit,
  Sliders,
  Move,
  Diamond,
  Palette
} from 'lucide-react';
import { CanvasElement, TextCurvePath } from '../types/calligraphy';
import { DOT_PRESETS } from '../data/tazhibAssets';
import { WordColorModal } from './WordColorModal';

interface FloatingElementControlsProps {
  element: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onDirectSplit?: () => void;
  onDetachDots?: (id?: string) => void;
  onOpenSplitWord?: () => void;
  onOpenContextualVariants?: () => void;
  onWeldAdjacent?: () => void;
  onCopyVector?: () => void;
}

export const FloatingElementControls: React.FC<FloatingElementControlsProps> = React.memo(({
  element,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onDirectSplit,
  onDetachDots,
  onOpenSplitWord,
  onOpenContextualVariants,
  onWeldAdjacent,
  onCopyVector,
}) => {
  if (!element) return null;

  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const isDot = element.type === 'dot';

  const CURVE_MODES: { id: TextCurvePath; label: string }[] = [
    { id: 'none', label: 'مستقیم' },
    { id: 'arc_up', label: 'قوس بالا' },
    { id: 'arc_down', label: 'قوس پایین' },
    { id: 'wave', label: 'موجی' },
    { id: 'circle', label: 'دایره' },
    { id: 'arch', label: 'محرابی' },
  ];

  const cycleCurve = () => {
    const currentIndex = CURVE_MODES.findIndex(c => c.id === (element.curveType || 'none'));
    const nextIndex = (currentIndex + 1) % CURVE_MODES.length;
    onUpdateElement(element.id, { 
      curveType: CURVE_MODES[nextIndex].id,
      curvature: element.curvature || 50,
    });
  };

  // Nudge element coordinates (1px / 5px steps for pixel-perfect placement)
  const nudge = (dx: number, dy: number) => {
    onUpdateElement(element.id, {
      x: element.x + dx,
      y: element.y + dy,
    });
  };

  return (
    <>
      <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-neutral-950/98 border border-amber-500/50 rounded-2xl shadow-2xl px-3 py-1.5 flex items-center gap-1.5 z-30 backdrop-blur-2xl select-none font-vazir text-xs max-w-[94vw] overflow-x-auto whitespace-nowrap transition-all duration-200 ease-out animate-in fade-in slide-in-from-bottom-3">
      {/* 1. If Dot Element is Selected: Specific Nuqta Floating Bar */}
      {isDot && (
        <>
          <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1 rounded-xl text-amber-300 font-bold shrink-0">
            <Diamond className="w-3.5 h-3.5 text-amber-400" />
            <span>نقطه {element.dotLetterTarget ? `(${element.dotLetterTarget})` : ''}</span>
          </div>

          {/* Preset Styles for Dot */}
          <div className="flex items-center gap-1 shrink-0 bg-neutral-900 border border-neutral-800 p-0.5 rounded-xl">
            {DOT_PRESETS.slice(0, 4).map(dp => (
              <button
                key={dp.id}
                onClick={() => onUpdateElement(element.id, { dotPreset: dp.id })}
                className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                  element.dotPreset === dp.id 
                    ? 'bg-amber-600/40 text-amber-300 border border-amber-500/50 font-bold' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title={dp.name}
              >
                {dp.id === 'single_nastaliq_dot' ? 'تک نقطه' :
                 dp.id === 'double_nastaliq_dots' ? 'دو نقطه' :
                 dp.id === 'triple_pyramid_dots' ? 'سه نقطه' : 'سه وارونه'}
              </button>
            ))}
          </div>

          {/* D-Pad 4-Directional Nudge for moving dot */}
          <div className="flex items-center gap-0.5 bg-neutral-900 border border-neutral-800 rounded-xl p-0.5 shrink-0">
            <button
              onClick={() => nudge(0, -2)}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 transition-all"
              title="جابجایی نقطه به بالا"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => nudge(0, 2)}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 transition-all"
              title="جابجایی نقطه به پایین"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => nudge(-2, 0)}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 transition-all"
              title="جابجایی نقطه به راست (در جهت خوشنویسی)"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => nudge(2, 0)}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 transition-all"
              title="جابجایی نقطه به چپ"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
          </div>
        </>
      )}

      {/* 2. In-Place Contextual Letter Variants & Sub-Glyph Studio Trigger */}
      {!isDot && element.type !== 'tazhib' && onOpenContextualVariants && (
        <button
          onClick={onOpenContextualVariants}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/40 to-amber-700/40 hover:from-amber-600/60 hover:to-amber-700/60 text-amber-300 border border-amber-500/50 font-bold transition-all shadow-sm shrink-0"
          title="تغییر فرم حروف درجا (یای معکوس، کاف کشیده، تنظیم سرکش، قفل اعراب)"
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
          <span>فرم درجا و سرکش</span>
        </button>
      )}

      {/* 3. Detach Dots Trigger (جداسازی و جابجایی آزاد تمام نقطه‌ها) */}
      {!isDot && element.type !== 'tazhib' && onDetachDots && (
        <button
          onClick={() => onDetachDots(element.id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 to-yellow-600/25 hover:from-amber-500/40 hover:to-yellow-600/40 text-amber-300 border border-amber-500/40 font-semibold transition-all shrink-0 cursor-pointer shadow-sm"
          title="جداسازی تمام نقطه‌های کلمه به قطعات مستقل قابل جابجایی با ماوس یا لمس"
        >
          <Diamond className="w-3.5 h-3.5 text-amber-400" />
          <span>⚡ جداسازی نقطه‌ها</span>
        </button>
      )}

      {/* 4. Split Word Trigger (Instant 1-Click + Advanced Gear) */}
      {!isDot && element.type !== 'tazhib' && (onDirectSplit || onOpenSplitWord) && (
        <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-800 shrink-0 overflow-hidden">
          <button
            onClick={() => {
              if (onDirectSplit) {
                onDirectSplit();
              } else if (onOpenSplitWord) {
                onOpenSplitWord();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-neutral-850 text-neutral-300 transition-all cursor-pointer"
            title="تفکیک فوری کلمه به اجزای مستقل و حروف جهت سوار کردن"
          >
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span>تفکیک کلمه</span>
          </button>
          {onOpenSplitWord && (
            <button
              onClick={onOpenSplitWord}
              className="px-1.5 py-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-amber-300 border-r border-neutral-800 text-[10px] transition-all cursor-pointer"
              title="کارگاه تفکیک پیشرفته هجاها و اتصالات"
            >
              ⚙
            </button>
          )}
        </div>
      )}

      {/* 5. Weld / Ligature Join */}
      {!isDot && element.type !== 'tazhib' && onWeldAdjacent && (
        <button
          onClick={() => onWeldAdjacent()}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 transition-all shrink-0 cursor-pointer"
          title="جوش دادن و اتصال کلمات مجاور به ترکیب پیوسته"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>اتصال (Weld)</span>
        </button>
      )}

      {/* Curve / Path tool */}
      {!isDot && element.type !== 'tazhib' && (
        <button
          onClick={cycleCurve}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all shrink-0 ${
            element.curveType && element.curveType !== 'none'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
          }`}
          title="انحنای متن روی مسیر (قوس، موج، دایره، محراب)"
        >
          <Orbit className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {element.curveType && element.curveType !== 'none' 
              ? CURVE_MODES.find(c => c.id === element.curveType)?.label 
              : 'انحنا'}
          </span>
        </button>
      )}

      {/* Dot Units Kashida Quick Adjuster */}
      {!isDot && element.type !== 'tazhib' && (
        <div className="flex items-center gap-1 border-l border-neutral-800/80 pl-2 ml-0.5 shrink-0">
          <span className="text-neutral-400 text-[10px] hidden sm:inline" title="کشیده بر اساس دانگ نقطه سنتی">کشیده:</span>
          <button
            onClick={() => {
              const current = element.dotKashidaUnits || (element.kashidaLevel ? element.kashidaLevel * 2 : 0);
              const next = Math.max(0, current - 2);
              onUpdateElement(element.id, { 
                dotKashidaUnits: next,
                kashidaLevel: Math.round(next / 1.5)
              });
            }}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 transition-all"
            title="کاهش کشیدگی نقطه"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="font-mono text-amber-400 font-bold px-1.5 bg-neutral-900 rounded border border-neutral-800/60 min-w-[24px] text-center text-[11px]">
            {element.dotKashidaUnits ? `${element.dotKashidaUnits}ن` : (element.kashidaLevel ? `${element.kashidaLevel}` : '۰')}
          </span>
          <button
            onClick={() => {
              const current = element.dotKashidaUnits || (element.kashidaLevel ? element.kashidaLevel * 2 : 0);
              const next = Math.min(14, current + 2);
              onUpdateElement(element.id, { 
                dotKashidaUnits: next,
                kashidaLevel: Math.round(next / 1.5)
              });
            }}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 transition-all"
            title="افزایش کشیدگی نقطه"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Baseline Shift / Vertical Stacking */}
      {!isDot && element.type !== 'tazhib' && (
        <div className="flex items-center gap-1 border-l border-neutral-800/80 pl-2 ml-0.5 shrink-0">
          <span className="text-neutral-400 text-[10px] hidden sm:inline" title="سوار کردن و جابجایی کرسی عمودی کلمه">سوار:</span>
          <button
            onClick={() => onUpdateElement(element.id, { baselineShift: (element.baselineShift || 0) - 6 })}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 transition-all"
            title="سوار کردن کلمه به سمت بالا"
          >
            <ArrowUp className="w-3 h-3 text-amber-400" />
          </button>
          <button
            onClick={() => onUpdateElement(element.id, { baselineShift: (element.baselineShift || 0) + 6 })}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 transition-all"
            title="پایین بردن کلمه نسبت به کرسی"
          >
            <ArrowDown className="w-3 h-3 text-amber-400" />
          </button>
        </div>
      )}

      {/* Font Size Quick Buttons */}
      <div className="flex items-center gap-1 border-l border-neutral-800/80 pl-2 ml-0.5 shrink-0">
        <span className="text-neutral-400 text-[10px] hidden sm:inline">اندازه:</span>
        <button
          onClick={() => onUpdateElement(element.id, { fontSize: Math.max(12, element.fontSize - 4) })}
          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 transition-all"
          title="کوچک‌تر کردن دانگ قلم یا اندازه نقطه"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="font-mono text-amber-400 font-bold px-1.5 bg-neutral-900 rounded border border-neutral-800/60 text-[11px]">
          {element.fontSize}
        </span>
        <button
          onClick={() => onUpdateElement(element.id, { fontSize: Math.min(240, element.fontSize + 4) })}
          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 transition-all"
          title="بزرگ‌تر کردن دانگ قلم یا اندازه نقطه"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Color Circle Picker for Word/Element */}
      <button
        onClick={() => setIsColorModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/50 text-neutral-200 transition-all shrink-0 cursor-pointer shadow-sm group"
        title="دایره انتخاب رنگ کلمه و مرکب"
      >
        <span 
          className="w-4 h-4 rounded-full border border-neutral-600 group-hover:border-amber-400 shrink-0 shadow-inner transition-transform group-hover:scale-110" 
          style={{ backgroundColor: element.color || '#18181b' }} 
        />
        <span className="text-[11px] font-semibold hidden sm:inline">رنگ کلمه</span>
        <Palette className="w-3.5 h-3.5 text-amber-400 opacity-80 group-hover:opacity-100" />
      </button>

      {/* Gold Shimmer Toggle */}
      <button
        onClick={() => onUpdateElement(element.id, { goldEffect: !element.goldEffect })}
        className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border transition-all shrink-0 ${
          element.goldEffect
            ? 'bg-amber-500/25 text-amber-300 border-amber-500 font-semibold shadow-sm'
            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
        }`}
        title="طلاکوب زرین"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">طلاکوب</span>
      </button>

      {/* Vector Copy Direct Trigger */}
      {onCopyVector && (
        <button
          onClick={onCopyVector}
          className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-amber-300 border border-neutral-800 transition-all shrink-0"
          title="کپی مستقیم وکتور برای فتوشاپ و ایلوستریتور"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Rotate +12 deg */}
      <button
        onClick={() => onUpdateElement(element.id, { rotation: (element.rotation + 12) % 360 })}
        className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 transition-all shrink-0"
        title="چرخش ۱۲+ درجه"
      >
        <RotateCw className="w-3.5 h-3.5" />
      </button>

      {/* Lock Toggle */}
      <button
        onClick={() => onUpdateElement(element.id, { isLocked: !element.isLocked })}
        className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 transition-all shrink-0"
        title={element.isLocked ? 'باز کردن قفل' : 'قفل کردن موقعیت'}
      >
        {element.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
      </button>

      {/* Duplicate */}
      <button
        onClick={() => onDuplicateElement(element.id)}
        className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 transition-all shrink-0"
        title="تکثیر المان (Ctrl+D)"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>

      {/* Delete */}
      <button
        onClick={() => onDeleteElement(element.id)}
        className="p-1.5 rounded-xl bg-neutral-900 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-neutral-800 hover:border-red-500/40 transition-all shrink-0"
        title="حذف (Delete)"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>

    {/* Word Color Circle Modal */}
    {isColorModalOpen && (
      <WordColorModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        element={element}
        onUpdateElement={onUpdateElement}
        onSplitToWords={onDirectSplit}
      />
    )}
  </>
  );
});
