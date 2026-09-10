import React, { useMemo } from 'react';
import { X, Palette, Sparkles, Check, Scissors, Layers } from 'lucide-react';
import { CanvasElement } from '../types/calligraphy';
import { ColorWheelPicker } from './ColorWheelPicker';

interface WordColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onSplitToWords?: (elementId?: string) => void;
}

export const WordColorModal: React.FC<WordColorModalProps> = ({
  isOpen,
  onClose,
  element,
  onUpdateElement,
  onSplitToWords,
}) => {
  if (!isOpen || !element) return null;

  const isDot = element.type === 'dot';
  const isTazhib = element.type === 'tazhib';

  // Words inside current element if it's text
  const words = useMemo(() => {
    if (!element.text || isDot || isTazhib) return [];
    return element.text
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0)
      .map(w => ({ text: w, color: element.color || '#18181b' }));
  }, [element.text, element.color, isDot, isTazhib]);

  const handleColorChange = (newColor: string) => {
    onUpdateElement(element.id, { color: newColor });
  };

  const handleToggleGold = () => {
    onUpdateElement(element.id, { goldEffect: !element.goldEffect });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div 
        className="bg-neutral-950 border border-amber-500/50 rounded-3xl p-5 shadow-2xl max-w-md w-full max-h-[92vh] overflow-y-auto space-y-4 font-vazir text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100">
                {isDot ? 'دایره انتخاب رنگ نقطه' : isTazhib ? 'رنگ تذهیب' : 'دایره انتخاب رنگ کلمه و مرکب'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {isDot 
                  ? 'تنظیم رنگ و مرکب نقطه انتخاب‌شده'
                  : 'تغییر رنگ کلمه روی بوم با دایره رنگی هیو و مرکب‌های سنتی'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Word Preview Box */}
        <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] text-neutral-400 block">پیش‌نمایش زنده:</span>
            <div 
              className="text-2xl font-nastaliq leading-relaxed transition-colors px-2"
              style={{ 
                color: element.goldEffect ? '#d97706' : (element.color || '#18181b'),
                textShadow: element.goldEffect ? '0 0 10px rgba(245,158,11,0.5)' : 'none'
              }}
            >
              {element.text || 'نمونه متن'}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-[10px] text-neutral-400">کد رنگ:</span>
            <span className="px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-amber-300 font-bold">
              {element.color || '#18181b'}
            </span>
          </div>
        </div>

        {/* Multi-word Split Notification (if sentence contains multiple words) */}
        {!isDot && !isTazhib && words.length > 1 && onSplitToWords && (
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-amber-300">
              <Layers className="w-4 h-4 text-amber-400 shrink-0" />
              <span>این عبارت دارای {words.length} کلمه است. مایلید هر کلمه رنگ جداگانه داشته باشد؟</span>
            </div>
            <button
              onClick={() => {
                onSplitToWords(element.id);
                onClose();
              }}
              className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-[11px] transition-all shrink-0 cursor-pointer shadow-sm"
              title="تفکیک این عبارت به کلمات مستقل تا هر کلمه رنگ دلخواه خود را بگیرد"
            >
              تفکیک کلمات
            </button>
          </div>
        )}

        {/* Circular Color Wheel & Swatches */}
        <ColorWheelPicker
          color={element.color || '#18181b'}
          onChange={handleColorChange}
          goldEffect={element.goldEffect || false}
          onToggleGoldEffect={handleToggleGold}
          title="دایره چرخان انتخاب رنگ و طیف"
          wordsList={words.length > 1 ? words : undefined}
          onSplitToColoredWords={onSplitToWords ? () => {
            onSplitToWords(element.id);
            onClose();
          } : undefined}
        />

        {/* Footer Action Buttons */}
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>تأیید و اعمال رنگ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
