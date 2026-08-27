import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scissors, 
  X, 
  Check
} from 'lucide-react';
import { CanvasElement, CalligraphyScript } from '../types/calligraphy';
import { 
  decomposeIntoLetters,
  decomposePersianIntoLigatures,
  decomposePersianWord,
  splitTextIntoWords,
  SCRIPT_FONT_MAP, 
  normalizePersianText 
} from '../utils/calligraphyEngine';
import { SoundEngine } from '../utils/soundEngine';

interface WordSplittingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedElement: CanvasElement | null;
  onReplaceElementWithParts?: (originalId: string, newElements: CanvasElement[]) => void;
  onReplaceWithSplitWords?: (originalId: string, newElements: CanvasElement[]) => void;
  onAddWords?: (newElements: CanvasElement[]) => void;
  globalScript?: CalligraphyScript;
}

export const WordSplittingModal: React.FC<WordSplittingModalProps> = React.memo(({
  isOpen,
  onClose,
  selectedElement,
  onReplaceElementWithParts,
  onReplaceWithSplitWords,
  onAddWords,
  globalScript = 'nastaliq',
}) => {
  const [inputText, setInputText] = useState<string>(selectedElement?.text || 'خوشنویسی');
  const [splitMode, setSplitMode] = useState<'words' | 'letters' | 'syllables'>('syllables');

  useEffect(() => {
    if (isOpen) {
      if (selectedElement?.text) {
        setInputText(selectedElement.text);
      }
    }
  }, [isOpen, selectedElement]);

  const script = selectedElement?.script || globalScript;
  const fontCss = SCRIPT_FONT_MAP[script]?.cssFamily || 'IranNastaliq, serif';

  const decomposedParts = useMemo(() => {
    if (!inputText.trim()) return [];
    const normalized = normalizePersianText(inputText, { convertDigits: false, fixHamza: true, cleanSpaces: true });
    if (splitMode === 'words') {
      return normalized.trim().split(/\s+/).filter(Boolean);
    }
    if (splitMode === 'letters') {
      return Array.from(normalized.replace(/\s+/g, '').replace(/\u200c/g, ''));
    }
    // Syllables / Cursive Ligatures
    return decomposePersianIntoLigatures(normalized);
  }, [inputText, splitMode]);

  const previewParts = () => decomposedParts;

  const handleDecompose = () => {
    if (!inputText.trim()) return;

    SoundEngine.playSnap();

    const baseX = selectedElement ? selectedElement.x : 450;
    const baseY = selectedElement ? selectedElement.y : 300;
    const fontSize = selectedElement ? selectedElement.fontSize : 52;
    const color = selectedElement ? selectedElement.color : '#18181b';

    let newElements: CanvasElement[] = [];

    if (splitMode === 'words') {
      newElements = splitTextIntoWords(inputText, script, baseX, baseY, fontSize, color);
    } else if (splitMode === 'letters') {
      newElements = decomposeIntoLetters(inputText, script, baseX, baseY, fontSize, color);
    } else {
      newElements = decomposePersianWord(inputText, script, baseX, baseY, fontSize, color);
    }

    if (newElements.length === 0) return;

    const replaceFn = onReplaceWithSplitWords || onReplaceElementWithParts;
    if (selectedElement && replaceFn) {
      replaceFn(selectedElement.id, newElements);
    } else if (onAddWords) {
      onAddWords(newElements);
    } else if (replaceFn && selectedElement) {
      replaceFn(selectedElement.id, newElements);
    }
    onClose();
  };

  if (!isOpen) return null;

  const parts = previewParts();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl font-vazir select-none">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                کارگاه تجزیه هوشمند و تفکیک اتصالات کلمات (Ligature Splitter)
              </h2>
              <p className="text-xs text-neutral-400">
                تفکیک کلمه یا سطر به اجزای سازنده مستقل جهت سوار کردن کلمات، جابجایی حروف و تغییر چینش
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

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Input text */}
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-1.5">متن یا کلمه مورد نظر:</label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 font-nastaliq text-2xl focus:border-amber-500/80 outline-none transition-all"
              dir="rtl"
            />
          </div>

          {/* Splitting Modes */}
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-2">شیوه تفکیک و شکستن:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSplitMode('syllables')}
                className={`p-3 rounded-2xl border text-right transition-all ${
                  splitMode === 'syllables'
                    ? 'bg-amber-500/15 border-amber-500/70 shadow-sm text-neutral-100'
                    : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="text-xs font-bold">هجاها و اتصالات (توصیه شده)</div>
                <div className="text-[10px] opacity-75 mt-0.5">تفکیک به بخش‌های معنادار خطاطی</div>
              </button>

              <button
                onClick={() => setSplitMode('words')}
                className={`p-3 rounded-2xl border text-right transition-all ${
                  splitMode === 'words'
                    ? 'bg-amber-500/15 border-amber-500/70 shadow-sm text-neutral-100'
                    : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="text-xs font-bold">تفکیک کلمات سطر</div>
                <div className="text-[10px] opacity-75 mt-0.5">تبدیل هر کلمه به لایه مستقل</div>
              </button>

              <button
                onClick={() => setSplitMode('letters')}
                className={`p-3 rounded-2xl border text-right transition-all ${
                  splitMode === 'letters'
                    ? 'bg-amber-500/15 border-amber-500/70 shadow-sm text-neutral-100'
                    : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="text-xs font-bold">تمام حروف مجزا</div>
                <div className="text-[10px] opacity-75 mt-0.5">شکستن به تک‌تک کاراکترها</div>
              </button>
            </div>
          </div>

          {/* Visual Decomposition Preview */}
          <div className="bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
              <span>پیش‌نمایش قطعات حاصله ({parts.length} جزء مجزا):</span>
              <span className="text-amber-400 font-mono text-[11px]">قابلیت درگ و جابجایی مستقل</span>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center justify-center p-3 bg-neutral-900/80 rounded-xl border border-dashed border-neutral-700 min-h-[90px]">
              {parts.map((p, idx) => (
                <div
                  key={idx}
                  style={{ fontFamily: fontCss }}
                  className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-2xl shadow-sm hover:scale-110 transition-transform cursor-pointer"
                  title={`جزء شماره ${idx + 1}`}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-neutral-800 flex items-center justify-between bg-neutral-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs transition-all"
          >
            انصراف
          </button>
          <button
            onClick={handleDecompose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>تبدیل به لایه‌های قابل جابجایی روی بوم</span>
          </button>
        </div>
      </div>
    </div>
  );
});

