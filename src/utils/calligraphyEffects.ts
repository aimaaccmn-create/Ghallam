import type React from 'react';
import { TextCurvePath, TextTextureFillType, DotArrangementType, SymmetryModeType } from '../types/calligraphy';

/**
 * Textures and clipping masks for calligraphy fills
 */
export interface TextureFillMeta {
  id: TextTextureFillType;
  name: string;
  desc: string;
  previewGradient: string;
  svgPatternId: string;
}

export const TEXTURE_FILL_PRESETS: TextureFillMeta[] = [
  {
    id: 'none',
    name: 'مرکب ساده / بدون بافت',
    desc: 'رنگ‌آمیزی خالص بر اساس رنگ انتخاب‌شده مرکب',
    previewGradient: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
    svgPatternId: '',
  },
  {
    id: 'gold_leaf',
    name: 'زر ناب و ورق طلا (صفوی)',
    desc: 'ورق طلای درخشان با رگه‌های زرین و دانه‌های زرنگار',
    previewGradient: 'linear-gradient(135deg, #fef08a 0%, #eab308 30%, #ca8a04 70%, #854d0e 100%)',
    svgPatternId: 'pattern_gold_leaf',
  },
  {
    id: 'lapis_lazuli',
    name: 'لاجورد نیشابور و طلا',
    desc: 'آبی سیر لاجوردی سلطنتی با رگه‌های زرین و پیریت معدنی',
    previewGradient: 'linear-gradient(135deg, #1e3a8a 0%, #172554 40%, #fbbf24 45%, #1e40af 100%)',
    svgPatternId: 'pattern_lapis_lazuli',
  },
  {
    id: 'marble_veins',
    name: 'رگه‌های مرمر شاه‌عباسی',
    desc: 'سنگ مرمر استخوانی با رگه‌های ارگانیک طوسی و دودی',
    previewGradient: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 50%, #64748b 80%, #334155 100%)',
    svgPatternId: 'pattern_marble_veins',
  },
  {
    id: 'tazhib_arabesque',
    name: 'تذهیب اسلیمی زرنگار',
    desc: 'نقوش ختایی و اسلیمی متراکم طلاکاری شده درون حروف',
    previewGradient: 'radial-gradient(circle, #fde047 10%, #d97706 60%, #78350f 100%)',
    svgPatternId: 'pattern_tazhib_arabesque',
  },
  {
    id: 'mother_of_pearl',
    name: 'صدف هفت‌رنگ مرصع',
    desc: 'پوشش رنگین‌کمانی صدفی صیقلی با درخشش ملایم فیروزه‌ای و یاسی',
    previewGradient: 'linear-gradient(135deg, #ccfbf1 0%, #fbcfe8 35%, #fef08a 70%, #bae6fd 100%)',
    svgPatternId: 'pattern_mother_of_pearl',
  },
  {
    id: 'copper_patina',
    name: 'مس قلم‌زنی با پتینه',
    desc: 'بافت مس چکش‌خورده عتیقه همراه با اکسید فیروزه‌ای',
    previewGradient: 'linear-gradient(135deg, #b45309 0%, #78350f 40%, #0d9488 75%, #042f2e 100%)',
    svgPatternId: 'pattern_copper_patina',
  },
];

/**
 * Helper to get CSS inline styles for text elements based on texture fill
 */
export function getTextureCssStyle(textureFill?: TextTextureFillType, baseColor?: string): React.CSSProperties {
  if (!textureFill || textureFill === 'none') {
    return { color: baseColor || '#18181b' };
  }

  switch (textureFill) {
    case 'gold_leaf':
      return {
        backgroundImage: 'linear-gradient(135deg, #fef08a 0%, #eab308 25%, #ca8a04 55%, #fde047 80%, #854d0e 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 2px 4px rgba(180, 83, 9, 0.35))',
      };
    case 'lapis_lazuli':
      return {
        backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 35%, #f59e0b 45%, #172554 70%, #2563eb 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 2px 4px rgba(30, 58, 138, 0.4))',
      };
    case 'marble_veins':
      return {
        backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 30%, #475569 65%, #94a3b8 80%, #1e293b 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3))',
      };
    case 'tazhib_arabesque':
      return {
        backgroundImage: 'radial-gradient(circle at 50% 50%, #fef08a 0%, #f59e0b 40%, #b45309 75%, #78350f 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 2px 5px rgba(217, 119, 6, 0.4))',
      };
    case 'mother_of_pearl':
      return {
        backgroundImage: 'linear-gradient(135deg, #99f6e4 0%, #fbcfe8 35%, #fef08a 65%, #bae6fd 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 1px 3px rgba(14, 165, 233, 0.25))',
      };
    case 'copper_patina':
      return {
        backgroundImage: 'linear-gradient(135deg, #d97706 0%, #78350f 35%, #14b8a6 65%, #0f766e 85%, #451a03 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 2px 4px rgba(20, 184, 166, 0.3))',
      };
    default:
      return { color: baseColor || '#18181b' };
  }
}

/**
 * Outline and contour styles
 */
export function getOutlineCssStyle(
  enabled?: boolean,
  width: number = 2,
  color: string = '#f59e0b',
  style: 'solid' | 'double' | 'chiseled' | 'glow' = 'solid'
): React.CSSProperties {
  if (!enabled || width <= 0) return {};

  switch (style) {
    case 'solid':
      return {
        WebkitTextStroke: `${width}px ${color}`,
        paintOrder: 'stroke fill',
      };
    case 'double':
      return {
        WebkitTextStroke: `${width}px ${color}`,
        paintOrder: 'stroke fill',
        textShadow: `0 0 0 2px #ffffff, 0 0 0 ${width + 2}px ${color}`,
      };
    case 'chiseled':
      return {
        textShadow: `
          1px 1px 0px ${color},
          2px 2px 0px rgba(0,0,0,0.4),
          -1px -1px 0px rgba(255,255,255,0.6),
          0 0 ${width * 2}px ${color}
        `,
      };
    case 'glow':
      return {
        textShadow: `
          0 0 ${width * 2}px ${color},
          0 0 ${width * 4}px ${color},
          0 0 ${width * 6}px ${color}
        `,
      };
    default:
      return {
        WebkitTextStroke: `${width}px ${color}`,
        paintOrder: 'stroke fill',
      };
  }
}

const DOTLESS_MAP: Record<string, string> = {
  'ب': 'ٮ', 'پ': 'ٮ', 'ت': 'ٮ', 'ث': 'ٮ',
  'ج': 'ح', 'چ': 'ح', 'خ': 'ح',
  'ذ': 'د', 'ز': 'ر', 'ژ': 'ر',
  'ش': 'س', 'ض': 'ص', 'ظ': 'ط',
  'غ': 'ع', 'ف': 'ڡ', 'ق': 'ٯ',
  'ک': 'ک', 'گ': 'ک', 'ن': 'ں',
  'ی': 'ى', 'ئ': 'ى', 'ي': 'ى',
  'ة': 'ه', 'ۀ': 'ه',
};
const DOTTED_REGEX = /[بتپثجچخذرزژشضظغفقنگيیئةۀ]/g;
const HARAKAT_REGEX = /[\u064B-\u065F\u0670]/g;

/**
 * Transform text according to dot arrangement
 */
export function transformTextForDotArrangement(text: string, mode?: DotArrangementType): string {
  if (!text || !mode || mode === 'standard') return text;

  if (mode === 'hidden') {
    // Strip Arabic/Persian diacritics and convert dotted letters to dotless base forms
    return text.replace(DOTTED_REGEX, (ch) => DOTLESS_MAP[ch] || ch)
      .replace(HARAKAT_REGEX, ''); // strip harakat
  }

  if (mode === 'connected_line') {
    // In traditional Nastaliq/Shekasteh, two dots are drawn as a continuous line slash (خط سرهم)
    // We can simulate this by keeping text and hinting rendering or inserting a stylistic ligature mark
    return text;
  }

  return text;
}

/**
 * Enhanced Path definitions for curved text and korsi paths
 */
export function generateAdvancedCurvePath(
  curveType: TextCurvePath,
  curvature: number = 50,
  radius: number = 180,
  width: number = 360,
  height: number = 120
): { pathId: string; pathD: string } {
  const pathId = `adv_curve_${curveType}_${Math.round(curvature)}`;
  const halfW = width / 2;
  const halfH = height / 2;
  const curveMag = (curvature / 100) * (height || 100);

  let pathD = `M 0,${halfH} L ${width},${halfH}`;

  switch (curveType) {
    case 'arc_up':
      // Concave dome / Islamic mihrab top
      pathD = `M 10,${halfH + curveMag} Q ${halfW},${halfH - curveMag} ${width - 10},${halfH + curveMag}`;
      break;

    case 'arc_down':
      // Convex arch / pendant
      pathD = `M 10,${halfH - curveMag} Q ${halfW},${halfH + curveMag} ${width - 10},${halfH - curveMag}`;
      break;

    case 'circle': {
      // Full circle loop
      const r = Math.max(30, radius || width / 3);
      pathD = `M ${halfW - r},${halfH} A ${r},${r} 0 1,1 ${halfW + r},${halfH} A ${r},${r} 0 1,1 ${halfW - r},${halfH}`;
      break;
    }

    case 'wave':
      // S-curve wave / Chlipa diagonal wave
      pathD = `M 10,${halfH} Q ${width * 0.25},${halfH - curveMag} ${halfW},${halfH} T ${width - 10},${halfH}`;
      break;

    case 'arch':
      // Pointed Persian arched gate (طاق و کتیبه سردر)
      pathD = `M 15,${height - 10} C ${width * 0.2},${10 - curveMag} ${width * 0.8},${10 - curveMag} ${width - 15},${height - 10}`;
      break;

    case 'spiral': {
      // Golden ratio spiral arch
      pathD = `M 20,${height - 10} C ${width * 0.3},${-curveMag} ${width * 0.7},${height * 0.2} ${halfW},${halfH} S ${width * 0.8},${height - 10} ${width - 20},${halfH}`;
      break;
    }

    default:
      pathD = `M 0,${halfH} L ${width},${halfH}`;
      break;
  }

  return { pathId, pathD };
}
