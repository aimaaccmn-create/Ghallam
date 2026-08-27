import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  Layers, 
  Palette, 
  Sliders,
  Image as ImageIcon,
  RotateCw
} from 'lucide-react';
import { EbruPaperSettings, PaperTextureType } from '../types/calligraphy';

interface EbruPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings?: EbruPaperSettings;
  onApplyEbru: (settings: EbruPaperSettings) => void;
  onApplyTextureType: (texture: PaperTextureType) => void;
}

export const EbruPaperModal: React.FC<EbruPaperModalProps> = React.memo(({
  isOpen,
  onClose,
  currentSettings,
  onApplyEbru,
  onApplyTextureType,
}) => {
  const [patternStyle, setPatternStyle] = useState<EbruPaperSettings['patternStyle']>(
    currentSettings?.patternStyle || 'comb'
  );
  const [baseTone, setBaseTone] = useState<EbruPaperSettings['baseTone']>(
    currentSettings?.baseTone || 'saffron'
  );
  const [primaryColor, setPrimaryColor] = useState<string>(currentSettings?.primaryColor || '#b45309');
  const [secondaryColor, setSecondaryColor] = useState<string>(currentSettings?.secondaryColor || '#1e3a8a');
  const [accentColor, setAccentColor] = useState<string>(currentSettings?.accentColor || '#065f46');
  const [goldSpeckles, setGoldSpeckles] = useState<number>(currentSettings?.goldSpeckles ?? 65);
  const [ageingDistress, setAgeingDistress] = useState<number>(currentSettings?.ageingDistress ?? 40);
  const [marblingDensity, setMarblingDensity] = useState<number>(currentSettings?.marblingDensity ?? 7);
  const [borderVignette, setBorderVignette] = useState<boolean>(currentSettings?.borderVignette ?? true);

  const STYLES = [
    { id: 'comb', label: 'شانه‌ای سنتی (Taraklı)', desc: 'موج‌های موازی دندانه‌دار ابریشمین' },
    { id: 'swirl', label: 'پیچک و طره گردابی (Swirl)', desc: 'حرکات حلزونی سیال رنگ‌ها روی آب' },
    { id: 'shawl', label: 'شال کشمیر و زرافشان', desc: 'خطوط قوسی ظریف با پاشش طلا' },
    { id: 'cloud', label: 'ابر لطیف بهاری (Cloud)', desc: 'لکه‌های نرم پاستلی محوشونده' },
  ];

  const PRESET_TONES = [
    { id: 'saffron', name: 'زعفرانی و اکر شاهانه', primary: '#b45309', secondary: '#78350f', accent: '#d97706' },
    { id: 'antique', name: 'آهار مهره عتیق و کهن', primary: '#713f12', secondary: '#451a03', accent: '#ca8a04' },
    { id: 'navy', name: 'لاجوردی و سرمه‌ای درباری', primary: '#1e3a8a', secondary: '#0f172a', accent: '#b45309' },
    { id: 'crimson', name: 'عقیق و شنگرف سرخ', primary: '#991b1b', secondary: '#450a0a', accent: '#f59e0b' },
    { id: 'emerald', name: 'یشمی و زنگاری سنتی', primary: '#065f46', secondary: '#022c22', accent: '#d97706' },
    { id: 'ivory', name: 'عاجی سپید دست‌ساز', primary: '#a1a1aa', secondary: '#71717a', accent: '#f59e0b' },
  ];

  const handleSelectTone = (tone: typeof PRESET_TONES[0]) => {
    setBaseTone(tone.id as any);
    setPrimaryColor(tone.primary);
    setSecondaryColor(tone.secondary);
    setAccentColor(tone.accent);
  };

  const handleApply = () => {
    onApplyEbru({
      patternStyle,
      baseTone,
      primaryColor,
      secondaryColor,
      accentColor,
      goldSpeckles,
      ageingDistress,
      marblingDensity,
      borderVignette,
    });
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
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                کارگاه کاغذ ابروباد، آهار مهره و زرافشان پویا (Dynamic Ebru Studio)
              </h2>
              <p className="text-xs text-neutral-400">
                تولیدکننده بافت‌های دست‌ساز سنتی با الگوهای شانه‌ای، زرافشان طلا و لایه‌های سلولزی
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

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Controls (Col 1-7) */}
          <div className="md:col-span-7 space-y-5">
            {/* Pattern Styles */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-2">سبک موج و گره‌های ابروباد:</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setPatternStyle(style.id as any)}
                    className={`p-3 rounded-2xl border text-right transition-all ${
                      patternStyle === style.id
                        ? 'bg-amber-500/15 border-amber-500/70 shadow-md shadow-amber-500/10'
                        : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-neutral-200">{style.label}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Presets Palettes */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-2">رنگ‌بندی سنتی و بافت زمینه:</label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_TONES.map(tone => (
                  <button
                    key={tone.id}
                    onClick={() => handleSelectTone(tone)}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1.5 text-right transition-all ${
                      baseTone === tone.id
                        ? 'bg-neutral-800 border-amber-500/70 shadow-sm'
                        : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-neutral-700" style={{ backgroundColor: tone.primary }} />
                      <span className="w-3.5 h-3.5 rounded-full border border-neutral-700" style={{ backgroundColor: tone.secondary }} />
                      <span className="w-3.5 h-3.5 rounded-full border border-neutral-700" style={{ backgroundColor: tone.accent }} />
                    </div>
                    <span className="text-[11px] text-neutral-300 truncate">{tone.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="bg-neutral-950/40 p-4 rounded-2xl border border-neutral-800 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-neutral-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>تراکم زرافشان طلاکوب (Gold Flecks):</span>
                  </span>
                  <span className="text-amber-400 font-mono">{goldSpeckles}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={goldSpeckles}
                  onChange={(e) => setGoldSpeckles(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-neutral-300 mb-1">
                  <span>میزان فرسودگی و آهار کهن (Cellulose Ageing):</span>
                  <span className="text-amber-400 font-mono">{ageingDistress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ageingDistress}
                  onChange={(e) => setAgeingDistress(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Live Preview & Apply (Col 8-12) */}
          <div className="md:col-span-5 flex flex-col justify-between bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800">
            <div>
              <div className="text-xs font-bold text-neutral-300 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>پیش‌نمایش زنده بافت کاغذ</span>
              </div>

              {/* Texture Render Box */}
              <div className="w-full h-56 rounded-2xl overflow-hidden border border-amber-900/30 relative shadow-inner flex items-center justify-center bg-[#faf5e8]">
                {/* Wavy Ebru ribbons simulation */}
                <div 
                  className="absolute inset-0 opacity-40"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, transparent 40%, ${secondaryColor} 70%, ${accentColor} 100%)`,
                    filter: `blur(${10 - marblingDensity}px)`,
                  }}
                />
                
                {/* Gold Speckles */}
                {goldSpeckles > 0 && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(#fbbf24 1.5px, transparent 1.5px)',
                      backgroundSize: `${Math.max(12, 35 - goldSpeckles * 0.25)}px ${Math.max(12, 35 - goldSpeckles * 0.25)}px`,
                      opacity: goldSpeckles / 100,
                    }}
                  />
                )}

                {/* Sample Calligraphy text over paper */}
                <div className="relative z-10 text-center p-3 text-neutral-900 drop-shadow select-none">
                  <div className="font-nastaliq text-2xl font-bold">کلک زرین</div>
                  <div className="font-vazir text-[10px] text-neutral-700 mt-1">کاغذ ابروباد آهار مهره سنتی</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 mt-4">
              <button
                onClick={handleApply}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>اعمال این بافت ابروباد روی بوم</span>
              </button>
              <button
                onClick={() => {
                  onApplyTextureType('parchment');
                  onClose();
                }}
                className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs transition-all border border-neutral-700"
              >
                بازگشت به کاغذ آهار مهره کلاسیک
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

