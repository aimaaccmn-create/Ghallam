import React, { useState } from 'react';
import { X, Stamp, Sparkles, Shield, Disc, Check, Palette } from 'lucide-react';
import { CanvasElement } from '../types/calligraphy';
import { SoundEngine } from '../utils/soundEffects';

interface SealStampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSeal: (element: CanvasElement) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export type SealMaterial = 'wax_red' | 'agate_gold' | 'brass_qajar' | 'lapis_royal' | 'charcoal_black' | 'emerald_green';
export type SealShape = 'oval' | 'octagon' | 'square' | 'circle' | 'arch' | 'shamseh';

export const SealStampModal: React.FC<SealStampModalProps> = React.memo(({
  isOpen,
  onClose,
  onInsertSeal,
  canvasWidth,
  canvasHeight,
}) => {
  const [shape, setShape] = useState<SealShape>('oval');
  const [material, setMaterial] = useState<SealMaterial>('wax_red');
  const [prefix, setPrefix] = useState('العبد الحقیر');
  const [name, setName] = useState('میرعلی هروی');
  const [date, setDate] = useState('۱۴۴۷ هـ');
  const [sealFont, setSealFont] = useState<'Aref Ruqaa' | 'IranNastaliq' | 'Thuluth' | 'Amiri'>('Aref Ruqaa');
  const [sealStyle, setSealStyle] = useState<'negative' | 'positive'>('negative');
  const [sealSize, setSealSize] = useState<number>(120);

  if (!isOpen) return null;

  const MATERIALS: { id: SealMaterial; name: string; desc: string; bg: string; textCol: string; borderCol: string; glow: string }[] = [
    {
      id: 'wax_red',
      name: 'موم سرخ عتیقه (Sealing Wax)',
      desc: 'بافت موم ذوب‌شده مهر و موم شاهی با لبه‌های برجسته و سایه ارگانیک',
      bg: 'radial-gradient(circle at 35% 35%, #b91c1c 0%, #991b1b 50%, #7f1d1d 90%, #450a0a 100%)',
      textCol: '#fef2f2',
      borderCol: '#f87171',
      glow: '0 4px 14px rgba(185, 28, 28, 0.45)',
    },
    {
      id: 'agate_gold',
      name: 'عقیق یمنی زرنگار (Inlaid Agate)',
      desc: 'سنگ عقیق خطی با حکاکی طلاکاری‌شده و رگه‌های یمنی',
      bg: 'radial-gradient(circle at 30% 30%, #7c2d12 0%, #451a03 60%, #1c1917 100%)',
      textCol: '#fde047',
      borderCol: '#ca8a04',
      glow: '0 4px 14px rgba(202, 138, 4, 0.45)',
    },
    {
      id: 'brass_qajar',
      name: 'برنج قلم‌زنی قاجاری (Qajar Brass)',
      desc: 'فلز برنج عتیق با پتینه کهنه و حکاکی عمیق سنتی',
      bg: 'radial-gradient(circle at 30% 30%, #d97706 0%, #b45309 60%, #78350f 100%)',
      textCol: '#18181b',
      borderCol: '#fef08a',
      glow: '0 4px 12px rgba(217, 119, 6, 0.35)',
    },
    {
      id: 'lapis_royal',
      name: 'استامپ لاجورد نیشابور (Royal Lapis)',
      desc: 'جوهر معدنی آبی سیر لاجوردی با دانه‌های ریز پیریت',
      bg: 'radial-gradient(circle at 30% 30%, #1d4ed8 0%, #1e3a8a 60%, #0f172a 100%)',
      textCol: '#f0fdf4',
      borderCol: '#60a5fa',
      glow: '0 4px 14px rgba(29, 78, 216, 0.4)',
    },
    {
      id: 'charcoal_black',
      name: 'مرکب دوده سنتی (Charcoal Ash)',
      desc: 'سیاهی عمیق و مات دوده چوب با بافت کاغذ سنتی',
      bg: 'radial-gradient(circle at 30% 30%, #27272a 0%, #18181b 60%, #09090b 100%)',
      textCol: '#faf5e8',
      borderCol: '#52525b',
      glow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    },
    {
      id: 'emerald_green',
      name: 'یشم و زمرد زنگاری (Emerald Jade)',
      desc: 'بافت یشم سبز خطاطان عثمانی و هندی با طلاکاری',
      bg: 'radial-gradient(circle at 30% 30%, #047857 0%, #065f46 60%, #022c22 100%)',
      textCol: '#fef08a',
      borderCol: '#34d399',
      glow: '0 4px 14px rgba(4, 120, 87, 0.4)',
    },
  ];

  const selectedMat = MATERIALS.find(m => m.id === material) || MATERIALS[0];

  const handleCreateSeal = () => {
    SoundEngine.playStampHit();
    const fullSealText = `${prefix} ${name} ${date}`.trim();

    const newEl: CanvasElement = {
      id: `seal_${Date.now()}`,
      type: 'seal',
      tazhibName: `royal_seal_${shape}_${material}_${sealStyle}`,
      x: canvasWidth - 140,
      y: canvasHeight - 140,
      fontSize: 22,
      fontFamily: sealFont,
      color: selectedMat.textCol,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 0.96,
      zIndex: 60,
      width: shape === 'square' || shape === 'circle' || shape === 'shamseh' ? sealSize : Math.round(sealSize * 1.35),
      height: sealSize,
      text: fullSealText,
    };

    onInsertSeal(newEl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md select-none font-vazir animate-in fade-in">
      <div className="bg-neutral-950 border border-amber-500/30 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
              <Stamp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-neutral-100">کارگاه ساخت مهر و ترقیم سلطنتی (Royal Seal Studio)</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  مهر اختصاصی خطاط
                </span>
              </div>
              <p className="text-xs text-neutral-400">طراحی مهرهای عقیق، موم سرخ، برنج قاجاری و امضای فاخر پای قطعه</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Live Seal Preview Canvas with Realistic Wax / Stone Surface */}
          <div className="flex flex-col items-center justify-center p-8 bg-neutral-900/80 rounded-2xl border border-neutral-800/80 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06),transparent_70%)] pointer-events-none" />
            <span className="text-[11px] text-neutral-400 mb-4 font-semibold">پیش‌نمایش زنده مهر و امضای زرنگار:</span>

            {/* Visual Stamp Display */}
            <div
              style={{
                width: shape === 'square' || shape === 'circle' || shape === 'shamseh' ? sealSize : sealSize * 1.35,
                height: sealSize,
                background: sealStyle === 'negative' ? selectedMat.bg : '#faf5e8',
                borderColor: selectedMat.borderCol,
                boxShadow: selectedMat.glow,
              }}
              className={`p-3 flex flex-col items-center justify-center text-center transition-all border-2 relative overflow-hidden cursor-pointer select-none ${
                shape === 'circle' || shape === 'shamseh'
                  ? 'rounded-full'
                  : shape === 'oval'
                  ? 'rounded-[44px]'
                  : shape === 'arch'
                  ? 'rounded-t-[44px] rounded-b-lg'
                  : shape === 'octagon'
                  ? 'rounded-2xl'
                  : 'rounded-xl'
              }`}
              onClick={() => SoundEngine.playStampHit()}
              title="برای شنیدن صدای مهر کلیک کنید"
            >
              {/* Inner Double Guilloche Border */}
              <div
                className={`absolute inset-1.5 border pointer-events-none ${
                  shape === 'circle' || shape === 'shamseh'
                    ? 'rounded-full border-dashed'
                    : shape === 'oval'
                    ? 'rounded-[38px] border-dashed'
                    : shape === 'arch'
                    ? 'rounded-t-[38px] rounded-b-md border-dashed'
                    : 'rounded-lg border-dashed'
                } ${sealStyle === 'negative' ? 'border-amber-200/40' : 'border-neutral-900/30'}`}
              />

              {/* Inscribed Traditional Seal Text */}
              <div className={`space-y-0.5 leading-tight z-10 ${sealStyle === 'negative' ? '' : 'text-neutral-950'}`} style={{ color: sealStyle === 'negative' ? selectedMat.textCol : '#18181b' }}>
                {prefix && <div className="text-[10px] opacity-90 font-nastaliq">{prefix}</div>}
                <div 
                  className="text-base font-bold tracking-wide"
                  style={{ fontFamily: sealFont === 'Aref Ruqaa' ? '"Aref Ruqaa", serif' : (sealFont === 'IranNastaliq' ? 'IranNastaliq, serif' : 'serif') }}
                >
                  {name || 'نام خطاط'}
                </div>
                {date && <div className="text-[10px] opacity-85 font-mono tracking-wider">{date}</div>}
              </div>

              {/* Subtle Wax Seal Edge Distortion */}
              {material === 'wax_red' && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/15 pointer-events-none" />
              )}
            </div>
            <span className="text-[10px] text-neutral-500 mt-2">برای تست صدای کوبیدن مهر روی پیش‌نمایش کلیک کنید</span>
          </div>

          {/* Configuration Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-neutral-400 block mb-1">پیشوند و ترقیم سنتی:</label>
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="العبد الحقیر">العبد الحقیر</option>
                <option value="کتبه العبد المذنب">کتبه العبد المذنب</option>
                <option value="رقم زد">رقم زد</option>
                <option value="خاکسار درگاه">خاکسار درگاه</option>
                <option value="یا علی مدد">یا علی مدد</option>
                <option value="مشقه العبد">مشقه العبد</option>
                <option value="طغرای همایونی">طغرای همایونی</option>
                <option value="مهر اصالت اثر">مهر اصالت اثر</option>
                <option value="">(بدون پیشوند)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">نام هنرمند یا تخلص:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="نام هنرمند..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">تاریخ یا سال نگارش:</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="مثال: ۱۴۴۷ هـ یا ۱۴۰۴"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Material & Inks Picker */}
          <div className="space-y-2">
            <span className="text-xs text-neutral-300 font-semibold block">جنس مهر و مرکب شاهی:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MATERIALS.map((mat) => {
                const isSelected = material === mat.id;
                return (
                  <button
                    key={mat.id}
                    onClick={() => {
                      setMaterial(mat.id);
                      SoundEngine.playReedScrape(0.8);
                    }}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 ring-1 ring-amber-500 shadow-md'
                        : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                        style={{ background: mat.bg }}
                      />
                      <span className="text-xs font-bold text-neutral-200 truncate">{mat.name}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">{mat.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Geometric Shape & Script Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shape */}
            <div className="space-y-2">
              <span className="text-xs text-neutral-400 font-semibold block">قالب هندسی مهر:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'oval', label: 'بیضی کتیبه' },
                  { id: 'octagon', label: 'هشت‌ضلعی صفوی' },
                  { id: 'arch', label: 'طاق محرابی' },
                  { id: 'square', label: 'مربع سنتی' },
                  { id: 'circle', label: 'دایره مدور' },
                  { id: 'shamseh', label: 'شمسه شاهی' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setShape(item.id as SealShape)}
                    className={`py-2 px-1 text-[11px] rounded-xl border text-center transition-all ${
                      shape === item.id
                        ? 'bg-amber-500/25 text-amber-300 border-amber-500 font-bold shadow-sm'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-850'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font & Style */}
            <div className="space-y-2">
              <span className="text-xs text-neutral-400 font-semibold block">قلم و سبک حکاکی:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSealStyle('negative')}
                  className={`py-2 px-2 text-xs rounded-xl border text-center transition-all ${
                    sealStyle === 'negative'
                      ? 'bg-amber-500/25 text-amber-300 border-amber-500 font-bold'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                  }`}
                >
                  حکاکی منفی (زمینه عمیق)
                </button>
                <button
                  onClick={() => setSealStyle('positive')}
                  className={`py-2 px-2 text-xs rounded-xl border text-center transition-all ${
                    sealStyle === 'positive'
                      ? 'bg-amber-500/25 text-amber-300 border-amber-500 font-bold'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                  }`}
                >
                  حکاکی مثبت (زمینه روشن)
                </button>
              </div>

              {/* Font Selector */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[
                  { id: 'Aref Ruqaa', label: 'خط رقاع' },
                  { id: 'IranNastaliq', label: 'نستعلیق' },
                  { id: 'Amiri', label: 'کوفی / نسخ' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSealFont(f.id as any)}
                    className={`py-1.5 text-[11px] rounded-lg border text-center transition-all ${
                      sealFont === f.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-semibold'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stamp Size Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>اندازه مهر روی بوم:</span>
              <span className="font-mono text-amber-400 font-bold">{sealSize} px</span>
            </div>
            <input
              type="range"
              min="70"
              max="220"
              value={sealSize}
              onChange={(e) => setSealSize(Number(e.target.value))}
              className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleCreateSeal}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:to-yellow-500 text-neutral-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-950/40 transition-all active:scale-95 cursor-pointer"
          >
            <Stamp className="w-4 h-4 text-neutral-950" />
            <span>کوبیدن و درج مهر سنتی بر روی اثر</span>
          </button>
        </div>
      </div>
    </div>
  );
});

