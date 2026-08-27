export type CalligraphyScript = 
  | 'nastaliq' 
  | 'shekasteh' 
  | 'shekasteh_darvish'
  | 'nastaliq_lahori'
  | 'gulzar'
  | 'neyrizi'
  | 'mirza'
  | 'thuluth' 
  | 'thuluth_hashem'
  | 'naskh' 
  | 'naskh_hashem'
  | 'amiri_quran'
  | 'noto_naskh'
  | 'moalla' 
  | 'diwani' 
  | 'diwani_jali'
  | 'ruqaa'
  | 'ruqaa_ink'
  | 'reyhan'
  | 'kufi' 
  | 'kufi_bannai'
  | 'kufi_mushajjar'
  | 'kufi_fatimi'
  | 'kufi_qahiri'
  | 'kufi_modern'
  | 'reem_kufi_ink'
  | 'reem_kufi_fun'
  | 'tahriri'
  | 'lalezar'
  | 'katibeh'
  | 'elmessiri'
  | 'rakkas'
  | 'marhey'
  | 'changa'
  | 'mada'
  | 'harmattan'
  | 'alkalami'
  | 'vibes'
  | 'cairo'
  | 'alexandria'
  | 'almarai'
  | 'beiruti'
  | 'ruwudu'
  | 'tajawal'
  | 'baloo'
  | 'lemonada'
  | 'zain'
  | 'noto_sans_arabic'
  | 'sahel'
  | 'shabnam'
  | 'parastoo'
  | 'samim'
  | 'tanha'
  | 'gandom'
  | 'vazirmatn'
  | 'custom';

export interface CustomUserFont {
  id: string;
  name: string;
  fontFamily: string;
  dataUrl?: string; // base64 / blob
  fileName: string;
  fileSize: number;
  format: 'truetype' | 'opentype' | 'woff' | 'woff2';
  addedAt: string;
  previewText?: string;
}

export type CanvasLayoutMode = 
  | 'free'        // آزاد
  | 'satr'        // سطرنویسی
  | 'chlipa'      // چلیپای سنتی
  | 'siah_mashq'  // سیاه‌مشق
  | 'katibeh'     // کتیبه
  | 'circle';     // قطعه دایره‌ای

export type PaperTextureType = 
  | 'parchment'     // آهار مهره سنتی
  | 'ebru'          // ابر و باد دست‌ساز
  | 'gold_fleck'    // زرافشان طلاکوب
  | 'dark_velvet'   // مخمل شب زرین
  | 'cream'         // کرم نخودی
  | 'kraft'         // کرافت کتان
  | 'marble_black'  // مرمر سیاه زرنگار
  | 'white_clean'   // سفید خالص برداری
  | 'custom_ebru';  // ابروباد پویا و سفارشی

export type FrameBorderType = 
  | 'none' 
  | 'classic_gold' 
  | 'tazhib_full' 
  | 'chlipa_traditional' 
  | 'qajar_medallion' 
  | 'minimal_double'
  | 'illumination_border';

export type TextCurvePath = 'none' | 'arc_up' | 'arc_down' | 'circle' | 'wave' | 'arch' | 'spiral';

export type DotArrangementType = 'standard' | 'connected_line' | 'horizontal' | 'vertical_stack' | 'hidden';

export type TextTextureFillType = 'none' | 'gold_leaf' | 'lapis_lazuli' | 'marble_veins' | 'tazhib_arabesque' | 'mother_of_pearl' | 'copper_patina';

export type SymmetryModeType = 'none' | 'horizontal_mirror' | 'vertical_mirror' | 'quad_mirror' | 'tughra_crest';

export type TailEndingType = 'standard' | 'khanjari' | 'shamshiri' | 'helali_curved' | 'feathered';

export type SerkashStyleType = 'classic' | 'extended' | 'double' | 'detached';

export interface FreehandStrokePoint {
  x: number;
  y: number;
  pressure?: number;
  time?: number;
}

export interface FreehandStroke {
  id: string;
  points: FreehandStrokePoint[];
  nibAngle: number;    // e.g. 63 deg
  nibWidth: number;    // e.g. 14px
  color: string;
  opacity: number;
  goldEffect?: boolean;
  inkFlow?: number;    // 0 to 1
  smoothing?: number;
}

export interface CanvasElement {
  id: string;
  name?: string;
  type: 'text' | 'word' | 'letter' | 'dot' | 'tashkeel' | 'tazhib' | 'border' | 'line' | 'vector_path' | 'seal' | 'stroke' | 'group';
  text?: string;
  script?: CalligraphyScript;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation: number; // in degrees
  scaleX: number;
  scaleY: number;
  opacity: number;
  zIndex: number;
  isLocked?: boolean;
  isVisible?: boolean;
  groupId?: string;
  
  // Specific calligraphy parameters
  kashidaLevel?: number; // 0 to 10
  letterSpacing?: number; // tracking in px
  baselineShift?: number; // vertical stacking offset
  variant?: string;      // alternate glyphs (e.g. 'reversed_ye', 'extended_kaf', 'hanging_meem')
  penAngle?: number;     // e.g. 63 deg for nastaliq
  penWidth?: number;     // stroke width
  goldEffect?: boolean;  // metallic gold texture gradient
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  // Curvature & Text along path (ابزار انحنا و مسیر دلخواه)
  curveType?: TextCurvePath;
  curvature?: number; // -100 to 100
  curveRadius?: number; // radius in px

  // Dot Arrangements (آرایش پیشرفته نقطه‌ها)
  dotArrangement?: DotArrangementType;
  dotOffsetX?: number;
  dotOffsetY?: number;

  // Text Texture / Tazhib Clipping Mask (ماسک بافت طلا و تذهیب درون متن)
  textureFill?: TextTextureFillType;
  textureScale?: number; // 0.5 to 3.0

  // Calligraphic Contour / Outline & Double Stroke (خط دور و دوبله‌نویسی)
  outlineEnabled?: boolean;
  outlineWidth?: number; // 1 to 20px
  outlineColor?: string;
  outlineStyle?: 'solid' | 'double' | 'chiseled' | 'glow';

  // Symmetry & Tughra / Muthanna Studio (آینه‌نویسی، متقارن و طغرا)
  symmetryMode?: SymmetryModeType;
  symmetryGap?: number; // spacing between mirrored copies in px

  // Tail Endings & Custom Serkash (دم‌گذاری و آرایش سرکش کاف)
  tailEnding?: TailEndingType;
  serkashStyle?: SerkashStyleType;
  verticalKashida?: number; // 0.8 to 2.5 (قد الف‌ها و کشش عمودی)
  stepKashidaAngle?: number; // -45 to +45 deg (شیب پله‌ای کشیدگی)

  // Sub-parts & Ligature decomposition
  subPartType?: 'root' | 'sarkesh' | 'dayereh' | 'dasteh' | 'dots' | 'tashkeel';
  originalWord?: string;
  sarkeshAngle?: number;  // -30 to +30 deg
  sarkeshLength?: number; // 0.5 to 2.0
  dastehHeight?: number;  // 0.5 to 2.0
  dayerehDepth?: number;  // 0.5 to 2.0
  
  // Smart Anchor Tashkeel & Diacritics
  parentAnchorId?: string;
  anchorOffset?: { x: number; y: number };
  
  // Traditional Dot-Unit Kashida (3, 5, 7, 9, 11, 13 Nuqta)
  dotKashidaUnits?: number;
  
  // Welding / Ligature Joining
  isWelded?: boolean;
  weldedFromIds?: string[];
  
  // Seal / Stamp properties
  sealShape?: 'oval' | 'octagon' | 'square' | 'circle';
  sealStyle?: 'negative' | 'positive';
  sealPrefix?: string;
  sealName?: string;
  sealDate?: string;

  // Freehand reed pen stroke
  strokeData?: FreehandStroke;

  // Tazhib & Vector properties
  tazhibSvg?: string;
  tazhibName?: string;
  svgPathData?: string;
  width?: number;
  height?: number;
}

export interface EbruPaperSettings {
  patternStyle: 'comb' | 'swirl' | 'shawl' | 'cloud' | 'flow';
  baseTone: 'ivory' | 'saffron' | 'antique' | 'navy' | 'crimson' | 'emerald';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  marblingDensity: number; // 1 to 10
  goldSpeckles: number;    // 0 to 100%
  ageingDistress: number;  // 0 to 100%
  borderVignette: boolean;
}

export interface KorsiGuidesSettings {
  showGuides: boolean;
  showMabda: boolean;       // خط مبدأ (بالا)
  showVasat: boolean;       // خط کرسی وسط (زمینه)
  showForood: boolean;      // خط فرود (پایین)
  showChlipaGuides: boolean; // خطوط مورب چلیپا
  chlipaAngle: number;      // پیش‌فرض -12 درجه
  enableSnapping: boolean;  // چسبندگی مغناطیسی
  snapDistance: number;     // فاصله پیکسل گیرایی
}

export interface HistorySnapshot {
  id: string;
  title: string;
  timestamp: string;
  elementsCount: number;
  project: KelkProject;
}

export interface KelkProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  canvasWidth: number;
  canvasHeight: number;
  layoutMode: CanvasLayoutMode;
  paperTexture: PaperTextureType;
  backgroundColor: string;
  frameBorder: FrameBorderType;
  elements: CanvasElement[];
  penNibAngle: number;
  globalScript: CalligraphyScript;
  ebruSettings?: EbruPaperSettings;
  korsiGuides?: KorsiGuidesSettings;
}

export interface PoetryVerse {
  poet: string;
  source: string;
  verse1: string;
  verse2: string;
  theme: string;
  recommendedScript: CalligraphyScript;
}

export interface CalligraphyTemplate {
  id: string;
  title: string;
  category: string;
  script: CalligraphyScript;
  layoutMode: CanvasLayoutMode;
  description: string;
  previewColor: string;
  project: Partial<KelkProject>;
}

