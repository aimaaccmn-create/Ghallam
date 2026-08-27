import React, { useState } from 'react';
import { 
  Type, 
  MoveHorizontal, 
  Sparkles, 
  Check, 
  X, 
  RefreshCw, 
  SlidersHorizontal,
  ChevronLeft
} from 'lucide-react';
import { CanvasElement } from '../types/calligraphy';

interface OpticalKerningModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: CanvasElement[];
  onAutoBalanceKerning: (balanceStrength: number) => void;
  onAlignBaselineRow: (spacing: number) => void;
}

export const OpticalKerningModal: React.FC<OpticalKerningModalProps> = ({
  isOpen,
  onClose,
  elements,
  onAutoBalanceKerning,
  onAlignBaselineRow,
}) => {
  const [balanceStrength, setBalanceStrength] = useState<number>(50);
  const [rowSpacing, setRowSpacing] = useState<number>(30);
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  const textElements = elements.filter(el => el.type === 'text' || el.type === 'word' || el.text);

  const handleApplyAutoBalance = () => {
    onAutoBalanceKerning(balanceStrength);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  const handleApplyRowSpacing = () => {
    onAlignBaselineRow(rowSpacing);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-neutral-200 font-vazir">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <MoveHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100">تنظیم تعادل و کرنینگ نوری (Optical Kerning)</h3>
              <p className="text-[11px] text-neutral-400">توزیع متوازن فضای منفی و سیاهی/سفیدی حروف و کلمات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Summary */}
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-400">تعداد اجزای متنی فعال در بوم:</span>
            <span className="font-bold text-amber-300 font-mono">{textElements.length} کلمه / عبارت</span>
          </div>

          {/* Optical Kerning Slider */}
          <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-semibold">تراز خودکار فواصل نوری (Optical Spacing)</span>
              <span className="font-mono text-amber-400 font-bold">{balanceStrength}%</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              محاسبه مساحت حاشیه‌ها و تنظیم تداخل سرکش‌ها و کلمات متوالی جهت حذف فضای منفی زائد.
            </p>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={balanceStrength}
              onChange={(e) => setBalanceStrength(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
            <button
              onClick={handleApplyAutoBalance}
              className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              اجرای توازن نوری هوشمند
            </button>
          </div>

          {/* Sequential Baseline Linearize */}
          <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-semibold">چیدمان هم‌خط بر کرسی (Linear Baseline Align)</span>
              <span className="font-mono text-amber-400 font-bold">{rowSpacing}px</span>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              step="5"
              value={rowSpacing}
              onChange={(e) => setRowSpacing(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
            <button
              onClick={handleApplyRowSpacing}
              className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              ردیف‌سازی خودکار کلمات روی یک سطر
            </button>
          </div>

          {applied && (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs text-center font-bold animate-in fade-in flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" />
              توازن و فواصل حروف با موفقیت اعمال شد
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition"
          >
            تکمیل و بازگشت
          </button>
        </div>
      </div>
    </div>
  );
};
