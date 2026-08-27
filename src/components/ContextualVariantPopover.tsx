import React, { useState } from 'react';
import { Sparkles, X, Check, Sliders, Wand2, Compass, Move, Anchor, Link, Unlink, Copy, Scissors } from 'lucide-react';
import { CanvasElement } from '../types/calligraphy';

interface ContextualVariantPopoverProps {
  element: CanvasElement | null;
  allElements: CanvasElement[];
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onWeldWithAdjacent?: (primaryId: string) => void;
  onCopyVectorClipboard?: () => void;
  onClose?: () => void;
}

// Authentic letter alternate variations dictionary (مانند کلک رومیزی)
export const LETTER_VARIANTS_MAP: Record<string, { label: string; char: string; desc: string }[]> = {
  'ی': [
    { label: 'یای معکوس کشیده (برگشته)', char: 'ے', desc: 'یای برگشته نستعلیق میرعماد برای اتمام سطر و کلمات' },
    { label: 'یای کشیده تخت', char: 'یـــــ', desc: 'کشش افقی زیر کلمات' },
    { label: 'یای سرکش‌دار لاهوری', char: 'ۓ', desc: 'یای شیب‌دار فشرده سبک لاهوری' },
    { label: 'یای کوتاه چسبان', char: 'ـی', desc: 'فرم جمع‌وجور برای ترکیبات شلوغ' },
    { label: 'یای دایره کامل', char: 'ي', desc: 'کاسه عمیق با انحنای متوازن' },
  ],
  'ي': [
    { label: 'یای معکوس کشیده', char: 'ے', desc: 'یای برگشته نستعلیق' },
    { label: 'یای کشیده تخت', char: 'یـــــ', desc: 'کشش افقی' },
    { label: 'یای کوتاه', char: 'ـی', desc: 'اتصال کوتاه' },
  ],
  'ک': [
    { label: 'کاف کشیده ممتد', char: 'کـــــ', desc: 'کاف با سرکش طویل سنتی و بدنه کشیده' },
    { label: 'کاف گنبدی (مدور شکسته)', char: 'ڪ', desc: 'کاف مدور شیوه درویش عبدالمجید' },
    { label: 'کاف ثلث با ترویس', char: 'ك', desc: 'کاف عربی با زبانه تیز در سرکش' },
    { label: 'کاف فشرده و جمع', char: 'کـ', desc: 'کاف سرکش‌کوتاه برای سطرهای پر' },
  ],
  'گ': [
    { label: 'گاف کشیده دو سرکشه', char: 'گـــــ', desc: 'گاف با دو خط سرکش موازی و بدنه کشیده' },
    { label: 'گاف فشرده سنتی', char: 'گـ', desc: 'گاف با سرکش مایل و متناسب' },
  ],
  'س': [
    { label: 'سین کشیده تخت (بدون دندانه)', char: 'ســـــ', desc: 'سین ممتد ۷ تا ۱۱ دانگ نقطه با گودی ظریف' },
    { label: 'سین سه‌دندانه اصیل', char: 'س', desc: 'دندانه‌های پلکانی با زاویه دانگ قلم' },
    { label: 'سین شاخص عثمان‌طه', char: 'سـ', desc: 'سین با دندانه میانی برجسته' },
  ],
  'ش': [
    { label: 'شین کشیده با ۳ نقطه تاجی', char: 'شـــــ', desc: 'کشش ممتد با سه نقطه بر فراز کشیده' },
    { label: 'شین سه‌دندانه سنتی', char: 'ش', desc: 'شین کتیبه‌ای با نقاط مثلثی' },
  ],
  'ن': [
    { label: 'نون دایره کامل تخم‌مرغی', char: 'ن', desc: 'دایره نون با عمق ۳ نقطه و نقطه در مرکز ثقل' },
    { label: 'نون کشیده تخت سوار', char: 'نــــ', desc: 'نون افقی برای سوار کردن کلمات بعدی' },
    { label: 'نون فشرده شکسته', char: 'ڹ', desc: 'نون با نقطه پیوسته در انتهای کمان' },
  ],
  'م': [
    { label: 'میم آویزان معلق (زیرین)', char: 'ـــــم', desc: 'دم میم عمودی و آویزان به زیر خط کرسی' },
    { label: 'میم سرپوشیده کتیبه‌ای', char: 'مـ', desc: 'گره توپر و متوازن' },
    { label: 'میم حلقه‌ای ثلث', char: 'ـمـ', desc: 'حلقه مدور باز با زبانه قلم' },
  ],
  'ه': [
    { label: 'هـ دوچشم اصیل (گره‌دار)', char: 'ھ', desc: 'دوچشم متقارن با شیب ۴۵ درجه' },
    { label: 'هـ پروانه‌ای وسط کلمه', char: 'ـھـ', desc: 'گره پروانه‌ای سبک شکسته' },
    { label: 'هـ گرد تکی', char: 'ه', desc: 'هـ متصل هلالی' },
  ],
  'ة': [
    { label: 'تاء مربوطه کتیبه‌ای', char: 'ة', desc: 'هـ با دو نقطه سنتی' },
  ],
  'ع': [
    { label: 'عین سرعقابی اصیل', char: 'عـ', desc: 'عین ابتدای کلمه با زاویه تیز عقابی' },
    { label: 'عین توپر متصل وسط', char: 'ـعـ', desc: 'عین میانی توپر و مثلثی' },
    { label: 'عین برگشته شکسته', char: 'ع', desc: 'عین با کمان باز پرانرژی' },
  ],
  'غ': [
    { label: 'غین سرعقابی با نقطه', char: 'غـ', desc: 'غین ابتدایی با نقطه شیب‌دار' },
    { label: 'غین توپر میانی', char: 'ـغـ', desc: 'غین وسط کلمه' },
  ],
  'ر': [
    { label: 'رای شمشیری پرتابی', char: 'ـــــر', desc: 'رای کشیده پرتابی برای ایجاد حرکت در سطر' },
    { label: 'رای هلالی کوتاه', char: 'ر', desc: 'رای کلاسیک با انحنای ملایم' },
  ],
  'ز': [
    { label: 'زای شمشیری نقطه‌دار', char: 'ـــــز', desc: 'زای پرتابی با نقطه در اوج انحنا' },
    { label: 'زای کوتاه', char: 'ز', desc: 'زای استاندارد' },
  ],
  'ح': [
    { label: 'حای سرطاق کتیبه‌ای', char: 'حـ', desc: 'ابتدای حا و جیم و چ و خ با طاق کشیده' },
    { label: 'حای شکم‌دار دایره‌ای', char: 'ح', desc: 'کاسه بزرگ انتهایی' },
  ],
  'ج': [
    { label: 'جیم کشیده کتیبه‌ای', char: 'جـــــ', desc: 'جیم با کشش اتصال' },
  ],
  'چ': [
    { label: 'چای سه نقطه تاجی', char: 'چ', desc: 'چای اصیل با نقاط منظم' },
  ],
  'خ': [
    { label: 'خای سرطاق با نقطه بالایی', char: 'خـ', desc: 'خای متوازن با نقطه بالای سرکش' },
  ],
  'ف': [
    { label: 'فای کشیده تخت', char: 'فـــــ', desc: 'فای افقی کشیده' },
    { label: 'فای گرد کوتاه', char: 'ف', desc: 'فای جمع' },
  ],
  'ق': [
    { label: 'قاف دایره عمیق', char: 'ق', desc: 'کاسه گرد زیر کرسی' },
    { label: 'قاف کشیده', char: 'قـــــ', desc: 'قاف افقی' },
  ],
  'ل': [
    { label: 'لام با دسته الفی بلند', char: 'ل', desc: 'دسته عمودی با دایره متعادل' },
    { label: 'لام کشیده افقی', char: 'لـــــ', desc: 'اتصال کشیده به حرف بعد' },
  ],
  'ا': [
    { label: 'الف مده دار (آ)', char: 'آ', desc: 'کلاه مد سنتی با موج اسلیمی' },
    { label: 'الف مستقیم با ترویس', char: 'ا', desc: 'الف ۳ یا ۵ نقطه با زبانه قلم' },
    { label: 'الف خنجری', char: 'ٰ', desc: 'الف کوچک اعرابی' },
  ],
  'و': [
    { label: 'واو پرتابی برگشته', char: 'و', desc: 'واو با سر گرد و دم تیز' },
  ],
  'ط': [
    { label: 'طای با دسته الفی کشیده', char: 'ط', desc: 'طای کتیبه‌ای با زاویه قلم اصیل' },
  ],
  'ظ': [
    { label: 'ظای کشیده با نقطه در فراز', char: 'ظ', desc: 'ظای متوازن' },
  ],
};

export const ContextualVariantPopover: React.FC<ContextualVariantPopoverProps> = React.memo(({
  element,
  allElements,
  onUpdateElement,
  onWeldWithAdjacent,
  onCopyVectorClipboard,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'variants' | 'subglyphs' | 'kashida_dots' | 'anchoring'>('variants');
  const [selectedCharIndex, setSelectedCharIndex] = useState<number>(0);

  if (!element || element.type === 'tazhib' || element.type === 'stroke' || !element.text) {
    return null;
  }

  const rawText = element.text;
  const chars: string[] = Array.from(rawText);
  const currentChar: string = chars[selectedCharIndex] || chars[0] || '';
  
  // Find variants for the selected character
  const variants = LETTER_VARIANTS_MAP[currentChar] || [];

  // Replace selected character with a variant
  const handleApplyVariant = (variantChar: string) => {
    const newChars = [...chars];
    newChars[selectedCharIndex] = variantChar;
    const newText = newChars.join('');
    onUpdateElement(element.id, { text: newText });
  };

  // Traditional dot-unit Kashida presets
  const DOT_UNITS = [
    { dots: 0, label: 'بدون کشش' },
    { dots: 3, label: '۳ نقطه (کوتاه)' },
    { dots: 5, label: '۵ نقطه (متوسط)' },
    { dots: 7, label: '۷ نقطه (استاندارد)' },
    { dots: 9, label: '۹ نقطه (شاهکار)' },
    { dots: 11, label: '۱۱ نقطه (بلند)' },
    { dots: 13, label: '۱۳ نقطه (ممتد)' },
  ];

  // Candidates for anchoring
  const candidateParents = allElements.filter(el => el.id !== element.id && el.type !== 'tazhib' && el.type !== 'stroke');
  const currentParent = candidateParents.find(el => el.id === element.parentAnchorId);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-neutral-950/95 border border-amber-500/50 rounded-2xl shadow-2xl p-4 z-40 backdrop-blur-xl font-vazir text-neutral-200 w-[95vw] max-w-xl animate-in fade-in slide-in-from-bottom-3 select-none">
      {/* Popover Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-850">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-100">
              تنظیمات تخصصی کلک: <span className="text-amber-300 font-nastaliq text-sm mr-1">{element.text}</span>
            </h3>
            <p className="text-[10px] text-neutral-400">تغییر فرم حروف درجا، زاویه سرکش، کشیده نقطه‌ای و قفل اعراب</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onCopyVectorClipboard && (
            <button
              onClick={onCopyVectorClipboard}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-amber-300 border border-neutral-800 text-[11px] font-semibold transition-all"
              title="کپی مستقیم وکتور در کلیپ‌بورد جهت Paste در فتوشاپ و ایلوستریتور"
            >
              <Copy className="w-3 h-3 text-amber-400" />
              <span>کپی وکتور</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-850 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 my-3 bg-neutral-900/80 p-1 rounded-xl border border-neutral-850 text-xs">
        <button
          onClick={() => setActiveTab('variants')}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'variants'
              ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>فرم‌های جایگزین درجا</span>
        </button>

        <button
          onClick={() => setActiveTab('subglyphs')}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'subglyphs'
              ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>تنظیم سرکش و دسته‌ها</span>
        </button>

        <button
          onClick={() => setActiveTab('kashida_dots')}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'kashida_dots'
              ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Move className="w-3.5 h-3.5" />
          <span>کشیده دانگ نقطه</span>
        </button>

        <button
          onClick={() => setActiveTab('anchoring')}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'anchoring'
              ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Anchor className="w-3.5 h-3.5" />
          <span>قفل و لنگر اعراب</span>
        </button>
      </div>

      {/* Tab 1: In-Place Contextual Letter Variants */}
      {activeTab === 'variants' && (
        <div className="space-y-3">
          {/* Letter Chooser strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] text-neutral-400 ml-1">انتخاب حرف:</span>
            {chars.map((c, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCharIndex(idx)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-nastaliq transition-all border ${
                  selectedCharIndex === idx
                    ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-md scale-105'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Variants for selected letter */}
          {variants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {variants.map((v, i) => (
                <div
                  key={i}
                  onClick={() => handleApplyVariant(v.char)}
                  className="p-2.5 bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/50 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-neutral-950 flex items-center justify-center text-xl font-nastaliq text-amber-200 border border-neutral-800 group-hover:scale-110 transition-transform">
                      {v.char}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300 transition-colors">
                        {v.label}
                      </div>
                      <div className="text-[10px] text-neutral-400 line-clamp-1">{v.desc}</div>
                    </div>
                  </div>
                  <div className="text-amber-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-neutral-400 text-xs bg-neutral-900/50 rounded-xl border border-neutral-850">
              برای حرف «<span className="text-amber-300 font-nastaliq">{currentChar}</span>» فرم‌های عمومی یا کشیده از طریق تب کشیده نقطه‌ای قابل تنظیم است.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sub-Glyph & Sarkesh Tuning */}
      {activeTab === 'subglyphs' && (
        <div className="space-y-3.5">
          {/* Sarkesh Angle */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300">زاویه و شیب سرکش (کاف و گاف):</span>
              <span className="font-mono text-amber-400">{element.sarkeshAngle || 0}°</span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="1"
              value={element.sarkeshAngle || 0}
              onChange={(e) => onUpdateElement(element.id, { sarkeshAngle: parseInt(e.target.value) })}
              className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Dasteh Height Multiplier */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300">ارتفاع دسته‌های عمودی (الف، لام، ط):</span>
              <span className="font-mono text-amber-400">{Math.round((element.dastehHeight || 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.8"
              step="0.05"
              value={element.dastehHeight || 1}
              onChange={(e) => onUpdateElement(element.id, { dastehHeight: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Dayereh Bowl Depth */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300">عمق و تناسب دایره‌ها (نون، ی، ق، ل):</span>
              <span className="font-mono text-amber-400">{Math.round((element.dayerehDepth || 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.6"
              step="0.05"
              value={element.dayerehDepth || 1}
              onChange={(e) => onUpdateElement(element.id, { dayerehDepth: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Micro-Kerning Tracking */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300">فاصله‌گذاری میکرو میان حروف (Kerning / Tracking):</span>
              <span className="font-mono text-amber-400">{element.letterSpacing || 0}px</span>
            </div>
            <input
              type="range"
              min="-15"
              max="40"
              step="0.5"
              value={element.letterSpacing || 0}
              onChange={(e) => onUpdateElement(element.id, { letterSpacing: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Kashida Dot Units */}
      {activeTab === 'kashida_dots' && (
        <div className="space-y-3">
          <p className="text-xs text-neutral-300">
            کشیدگی خوشنویسی بر اساس واحدهای سنتی دانگ نقطه (Nuqta Units):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DOT_UNITS.map(unit => (
              <button
                key={unit.dots}
                onClick={() => onUpdateElement(element.id, { 
                  dotKashidaUnits: unit.dots,
                  kashidaLevel: Math.round(unit.dots / 1.5)
                })}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  (element.dotKashidaUnits === unit.dots || (!element.dotKashidaUnits && unit.dots === 0 && !element.kashidaLevel))
                    ? 'bg-amber-600/30 text-amber-300 border-amber-500 font-bold shadow-sm'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="font-mono text-sm">{unit.dots > 0 ? `${unit.dots} نقطه` : 'طبیعی'}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">{unit.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Smart Anchor Tashkeel */}
      {activeTab === 'anchoring' && (
        <div className="space-y-3">
          <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-200">وضعیت لنگر به کلمه مادر:</span>
              {currentParent ? (
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <Link className="w-3 h-3" />
                  قفل به: {currentParent.text || currentParent.name}
                </span>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">مستقل و آزاد</span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              با قفل کردن اعراب یا نشانه‌ها به کلمه مادر، با جابجایی یا چرخش کلمه، اعراب نیز به صورت همگام جابجا می‌شوند.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-neutral-400">انتخاب کلمه مادر جهت اتصال لنگری:</span>
            <div className="max-h-36 overflow-y-auto space-y-1.5">
              {candidateParents.map(parent => (
                <button
                  key={parent.id}
                  onClick={() => onUpdateElement(element.id, { 
                    parentAnchorId: element.parentAnchorId === parent.id ? undefined : parent.id 
                  })}
                  className={`w-full p-2 rounded-xl border text-right flex items-center justify-between text-xs transition-all ${
                    element.parentAnchorId === parent.id
                      ? 'bg-amber-600/25 text-amber-300 border-amber-500 font-semibold'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-850 hover:bg-neutral-850'
                  }`}
                >
                  <span className="font-nastaliq text-sm">{parent.text || parent.name}</span>
                  {element.parentAnchorId === parent.id ? (
                    <Unlink className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Link className="w-3.5 h-3.5 text-neutral-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

