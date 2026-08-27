import React from 'react';
import { 
  Trash2, 
  Copy, 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  RotateCw,
  Plus,
  Minus,
  Wand2,
  Lock,
  Unlock,
  Scissors,
  Orbit,
  Sliders
} from 'lucide-react';
import { CanvasElement, TextCurvePath } from '../types/calligraphy';

interface FloatingElementControlsProps {
  element: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onDirectSplit?: () => void;
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
  onOpenSplitWord,
  onOpenContextualVariants,
  onWeldAdjacent,
  onCopyVector,
}) => {
  if (!element) return null;

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

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-neutral-950/98 border border-amber-500/50 rounded-2xl shadow-2xl px-3 py-1.5 flex items-center gap-1.5 z-30 backdrop-blur-2xl select-none font-vazir text-xs max-w-[94vw] overflow-x-auto whitespace-nowrap transition-all duration-200 ease-out animate-in fade-in slide-in-from-bottom-3">
      {/* 1. In-Place Contextual Letter Variants & Sub-Glyph Studio Trigger */}
      {element.type !== 'tazhib' && onOpenContextualVariants && (
        <button
          onClick={onOpenContextualVariants}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/40 to-amber-700/40 hover:from-amber-600/60 hover:to-amber-700/60 text-amber-300 border border-amber-500/50 font-bold transition-all shadow-sm shrink-0"
          title="تغییر فرم حروف درجا (یای معکوس، کاف کشیده، تنظیم سرکش، قفل اعراب)"
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
          <span>فرم درجا و سرکش</span>
        </button>
      )}

      {/* 2. Split Word Trigger (Instant 1-Click + Advanced Gear) */}
      {element.type !== 'tazhib' && (onDirectSplit || onOpenSplitWord) && (
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
            <span>تفکیک</span>
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

      {/* 3. Weld / Ligature Join */}
      {element.type !== 'tazhib' && onWeldAdjacent && (
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
      {element.type !== 'tazhib' && (
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
      {element.type !== 'tazhib' && (
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
      {element.type !== 'tazhib' && (
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
      {element.type !== 'tazhib' && (
        <div className="flex items-center gap-1 border-l border-neutral-800/80 pl-2 ml-0.5 shrink-0">
          <span className="text-neutral-400 text-[10px] hidden sm:inline">اندازه:</span>
          <button
            onClick={() => onUpdateElement(element.id, { fontSize: Math.max(12, element.fontSize - 4) })}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 transition-all"
            title="کوچک‌تر کردن دانگ قلم"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="font-mono text-amber-400 font-bold px-1.5 bg-neutral-900 rounded border border-neutral-800/60 text-[11px]">
            {element.fontSize}
          </span>
          <button
            onClick={() => onUpdateElement(element.id, { fontSize: Math.min(240, element.fontSize + 4) })}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 transition-all"
            title="بزرگ‌تر کردن دانگ قلم"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      )}

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
        title="چرخش ۱۲+ درجه (شیب سنتی چلیپا)"
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
  );
});
