import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Palette, Pipette, Sparkles, Check, RotateCcw, Copy } from 'lucide-react';

export interface TraditionalInk {
  name: string;
  color: string;
  category?: 'classic' | 'mineral' | 'gold';
}

export const TRADITIONAL_CALLIGRAPHY_INKS: TraditionalInk[] = [
  { name: 'مشکی دوده عتیق', color: '#18181b', category: 'classic' },
  { name: 'سرمه‌ای لاجورد نیشابور', color: '#0f172a', category: 'mineral' },
  { name: 'قهوه‌ای گردویی سنتی', color: '#451a03', category: 'classic' },
  { name: 'شنگرف سرخ درباری', color: '#991b1b', category: 'mineral' },
  { name: 'زر طلا و زعفرانی', color: '#d97706', category: 'gold' },
  { name: 'لاجورد درخشان کتیبه', color: '#1e3a8a', category: 'mineral' },
  { name: 'سبز زنگار کهن', color: '#064e3b', category: 'mineral' },
  { name: 'سبز یشمی تذهیب', color: '#047857', category: 'mineral' },
  { name: 'فیروزه‌ای نیشابوری', color: '#0284c7', category: 'mineral' },
  { name: 'عنابی کهن شاهانه', color: '#881337', category: 'classic' },
  { name: 'سرخ اناری ممتاز', color: '#be123c', category: 'mineral' },
  { name: 'طلای ناب و شمش', color: '#f59e0b', category: 'gold' },
  { name: 'ارغوانی و ختایی', color: '#6b21a8', category: 'mineral' },
  { name: 'قهوه‌ای سوخته قاجاری', color: '#291205', category: 'classic' },
  { name: 'سفید کافوری و عاجی', color: '#f8fafc', category: 'classic' },
  { name: 'خاکستری سربی', color: '#475569', category: 'classic' },
];

export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) {
    return { h: 38, s: 92, l: 44 }; // fallback amber/gold
  }

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = Math.round(h * 60);
  }

  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h: number, s: number, l: number): string {
  const normS = Math.max(0, Math.min(100, s)) / 100;
  const normL = Math.max(0, Math.min(100, l)) / 100;
  const a = normS * Math.min(normL, 1 - normL);

  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = normL - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    const hexVal = Math.round(255 * color).toString(16).padStart(2, '0');
    return hexVal;
  };

  return `#${f(0)}${f(8)}${f(4)}`;
}

interface ColorWheelPickerProps {
  color: string;
  onChange: (newColor: string) => void;
  goldEffect?: boolean;
  onToggleGoldEffect?: () => void;
  title?: string;
  showPresets?: boolean;
  compact?: boolean;
  wordsList?: { text: string; id?: string; color?: string }[];
  onSelectWordColor?: (wordIndex: number, newColor: string) => void;
  onSplitToColoredWords?: () => void;
}

export const ColorWheelPicker: React.FC<ColorWheelPickerProps> = ({
  color = '#18181b',
  onChange,
  goldEffect = false,
  onToggleGoldEffect,
  title = 'دایره انتخاب رنگ و مرکب کلمه',
  showPresets = true,
  compact = false,
  wordsList,
  onSelectWordColor,
  onSplitToColoredWords,
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [copied, setCopied] = useState(false);

  // Parse current color into HSL
  const { h: initialH, s: initialS, l: initialL } = hexToHSL(color);
  const [hue, setHue] = useState<number>(initialH);
  const [saturation, setSaturation] = useState<number>(Math.max(20, initialS));
  const [lightness, setLightness] = useState<number>(initialL);

  // Sync state if external color changes (e.g. user selected another word)
  useEffect(() => {
    const parsed = hexToHSL(color);
    setHue(parsed.h);
    if (parsed.s > 10) setSaturation(parsed.s);
    setLightness(parsed.l);
  }, [color]);

  // Compute needle / pin position on the circle (polar coordinates to cartesian %)
  const angleRad = (hue * Math.PI) / 180;
  const radiusPercent = (saturation / 100) * 40; // max 40% distance from center
  const pinX = 50 + radiusPercent * Math.cos(angleRad);
  const pinY = 50 + radiusPercent * Math.sin(angleRad);

  // Handle pointer interactions on the circular wheel
  const handlePointerAtPoint = useCallback((clientX: number, clientY: number) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;

    let angleDeg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
    if (angleDeg < 0) angleDeg += 360;

    const maxRadius = rect.width / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const newSat = Math.min(100, Math.max(15, Math.round((dist / maxRadius) * 100)));

    setHue(angleDeg);
    setSaturation(newSat);

    // Keep current lightness or clamp for pure dark/light
    const currentLight = lightness === 0 ? 30 : (lightness === 100 ? 70 : lightness);
    const newHex = hslToHex(angleDeg, newSat, currentLight);
    onChange(newHex);
  }, [lightness, onChange]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    handlePointerAtPoint(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    handlePointerAtPoint(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleLightnessChange = (newLightness: number) => {
    setLightness(newLightness);
    const newHex = hslToHex(hue, saturation, newLightness);
    onChange(newHex);
  };

  const handleCopyHex = () => {
    navigator.clipboard.writeText(color.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const sizeClass = compact ? 'w-44 h-44' : 'w-52 h-52';

  return (
    <div className="space-y-3 font-vazir select-none text-right" dir="rtl">
      {/* Title & Current Hex Preview */}
      <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-200">
          <Palette className="w-4 h-4 text-amber-400" />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Native HTML5 Eyedropper / Color Picker */}
          <label 
            className="w-6 h-6 rounded-lg border border-neutral-700 bg-neutral-900 hover:border-amber-500/60 flex items-center justify-center cursor-pointer text-neutral-300 hover:text-amber-300 transition-all shadow-sm"
            title="قطره‌چکان و انتخابگر دقیق رنگ سیستم"
          >
            <Pipette className="w-3.5 h-3.5" />
            <input
              type="color"
              value={color.startsWith('#') && color.length === 7 ? color : '#18181b'}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
          </label>

          {/* Hex display pill */}
          <button
            onClick={handleCopyHex}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 hover:border-amber-500/50 transition-all"
            title="کپی کد رنگ"
          >
            <span className="w-2.5 h-2.5 rounded-full border border-neutral-600 shrink-0" style={{ backgroundColor: color }} />
            <span>{color.toUpperCase()}</span>
            {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-neutral-400" />}
          </button>
        </div>
      </div>

      {/* Main Chromatic Color Wheel Circle */}
      <div className="flex flex-col items-center justify-center py-2">
        <div
          ref={wheelRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`relative ${sizeClass} rounded-full cursor-crosshair shadow-2xl transition-transform active:scale-[0.99] border-2 border-neutral-800/80 p-1 bg-neutral-950 flex items-center justify-center touch-none`}
          style={{
            background: `
              radial-gradient(circle, rgba(24,24,27,0.92) 0%, rgba(24,24,27,0.4) 38%, transparent 42%),
              conic-gradient(from 0deg, 
                #ff0000 0deg, 
                #ff8800 30deg, 
                #ffd000 60deg, 
                #77ff00 90deg, 
                #00ff66 120deg, 
                #00ffff 150deg, 
                #0088ff 180deg, 
                #0022ff 210deg, 
                #7700ff 240deg, 
                #cc00ff 270deg, 
                #ff00aa 300deg, 
                #ff0044 330deg, 
                #ff0000 360deg
              )
            `,
          }}
        >
          {/* Subtle Concentric Rings for visual depth */}
          <div className="absolute inset-4 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />

          {/* Center Color Preview Disc with Ink Glow */}
          <div
            className="w-16 h-16 rounded-full border-2 border-neutral-800 shadow-xl flex flex-col items-center justify-center text-center transition-all z-10 overflow-hidden relative"
            style={{ 
              backgroundColor: color,
              boxShadow: `0 0 16px ${color}55, inset 0 2px 4px rgba(255,255,255,0.2)` 
            }}
          >
            {goldEffect && (
              <span className="absolute inset-0 bg-gradient-to-tr from-amber-400/30 via-transparent to-yellow-200/40 animate-pulse pointer-events-none" />
            )}
            <span className="text-[10px] font-mono font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] text-white select-none">
              {lightness}%
            </span>
          </div>

          {/* Draggable Needle Pin on the Color Circle */}
          <div
            className="absolute w-5 h-5 rounded-full border-2 border-white shadow-[0_0_8px_rgba(0,0,0,0.8)] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 flex items-center justify-center"
            style={{
              left: `${pinX}%`,
              top: `${pinY}%`,
              backgroundColor: color,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>
      </div>

      {/* Lightness & Shading Slider (عمق و روشنایی مرکب) */}
      <div className="space-y-1 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/80">
        <div className="flex items-center justify-between text-[11px] text-neutral-300">
          <span className="font-semibold">تیرگی / روشنایی مرکب:</span>
          <span className="font-mono text-amber-400 font-bold">{lightness}%</span>
        </div>
        <div className="relative flex items-center">
          <input
            type="range"
            min="5"
            max="95"
            value={lightness}
            onChange={(e) => handleLightnessChange(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-400"
            style={{
              background: `linear-gradient(to left, #ffffff, ${hslToHex(hue, saturation, 50)}, #09090b)`,
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-neutral-400 pt-0.5">
          <span>مرکب غلیظ و تیره</span>
          <span>فام خالص</span>
          <span>روشن و عاجی</span>
        </div>
      </div>

      {/* Gold Shimmer Effect Toggle Button */}
      {onToggleGoldEffect && (
        <button
          onClick={onToggleGoldEffect}
          className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm ${
            goldEffect
              ? 'bg-gradient-to-r from-amber-500/30 to-yellow-600/30 text-amber-300 border-amber-500 shadow-amber-500/10'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{goldEffect ? '✦ افکت طلاکوب زرین فعال است' : 'فعال‌سازی جلای زرین و طلاکوب (Gold Shimmer)'}</span>
        </button>
      )}

      {/* Word-by-Word Coloring section (if multiple words are available) */}
      {wordsList && wordsList.length > 1 && (
        <div className="p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-300 font-bold">رنگ‌آمیزی تک‌تک کلمات:</span>
            {onSplitToColoredWords && (
              <button
                onClick={onSplitToColoredWords}
                className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors font-semibold"
              >
                تفکیک به کلمات مستقل ⚡
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-0.5">
            {wordsList.map((word, idx) => (
              <button
                key={idx}
                onClick={() => onSelectWordColor?.(idx, color)}
                className="px-2 py-1 rounded-lg text-xs bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/50 text-neutral-200 flex items-center gap-1.5 transition-all shadow-sm"
                title={`اعمال رنگ فعلی روی کلمه «${word.text}»`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full border border-neutral-600 shrink-0" 
                  style={{ backgroundColor: word.color || color }} 
                />
                <span className="font-nastaliq text-sm">{word.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Traditional Ink Circles Palette */}
      {showPresets && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>دایره‌های مرکب‌های اصیل خوشنویسی:</span>
            <button
              onClick={() => onChange('#18181b')}
              className="flex items-center gap-1 hover:text-amber-400 text-[10px] transition-colors"
              title="بازنشانی به مشکی دوده"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>مشکی سنتی</span>
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {TRADITIONAL_CALLIGRAPHY_INKS.map((ink) => {
              const isSelected = color.toLowerCase() === ink.color.toLowerCase();
              return (
                <button
                  key={ink.color}
                  onClick={() => onChange(ink.color)}
                  className={`group relative h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 scale-110 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50'
                      : 'border-neutral-700/60 hover:scale-105 hover:border-neutral-400'
                  }`}
                  style={{ backgroundColor: ink.color }}
                  title={ink.name}
                >
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${
                      ['#f8fafc', '#f59e0b', '#d97706'].includes(ink.color) ? 'text-neutral-950 font-bold' : 'text-amber-300 font-bold'
                    }`} />
                  )}
                  {/* Tooltip on hover */}
                  <span className="absolute -top-7 right-1/2 translate-x-1/2 bg-neutral-900 border border-neutral-700 text-neutral-200 text-[9px] px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30">
                    {ink.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
