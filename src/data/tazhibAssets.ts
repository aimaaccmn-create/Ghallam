// Authentic Persian Tazhib, Toranj, Shamseh, Eslimi and Calligraphic Ornaments for Kelk
export interface TazhibItem {
  id: string;
  name: string;
  category: 'toranj' | 'lachak' | 'shamseh' | 'eslimi' | 'border' | 'ornament';
  viewBox: string;
  path: string;
  defaultColor?: string;
}

export const TAZHIB_COLLECTION: TazhibItem[] = [
  {
    id: 'shamseh_royal_1',
    name: 'شمسه شاهانه هشت‌پر مذهب',
    category: 'shamseh',
    viewBox: '0 0 100 100',
    defaultColor: '#d97706',
    path: `M 50,5 C 55,20 65,25 75,15 C 70,28 80,35 95,30 C 82,40 88,50 95,65 C 80,60 70,72 75,85 C 65,75 55,80 50,95 C 45,80 35,75 25,85 C 30,72 20,60 5,65 C 12,50 18,40 5,30 C 20,35 30,28 25,15 C 35,25 45,20 50,5 Z
           M 50,22 C 60,30 70,40 78,50 C 70,60 60,70 50,78 C 40,70 30,60 22,50 C 30,40 40,30 50,22 Z
           M 50,38 C 56,44 56,56 50,62 C 44,56 44,44 50,38 Z`
  },
  {
    id: 'toranj_central_1',
    name: 'ترنج مرکزی اسلیمی ختایی',
    category: 'toranj',
    viewBox: '0 0 80 120',
    defaultColor: '#b45309',
    path: `M 40,5 C 46,20 62,30 70,50 C 78,70 65,95 40,115 C 15,95 2,70 10,50 C 18,30 34,20 40,5 Z
           M 40,25 C 45,35 56,45 60,60 C 56,75 45,85 40,95 C 35,85 24,75 20,60 C 24,45 35,35 40,25 Z
           M 40,45 C 44,52 48,58 40,68 C 32,58 36,52 40,45 Z`
  },
  {
    id: 'lachak_corner_1',
    name: 'لچک گوشه چلیپای زرنگار',
    category: 'lachak',
    viewBox: '0 0 100 100',
    defaultColor: '#d97706',
    path: `M 0,0 L 100,0 C 95,20 85,35 75,50 C 60,70 40,85 0,100 L 0,0 Z
           M 10,10 L 80,10 C 70,25 55,45 35,65 C 20,75 10,80 10,80 L 10,10 Z
           M 20,20 C 35,20 50,30 55,40 C 45,50 30,55 20,55 L 20,20 Z`
  },
  {
    id: 'eslimi_swirl_1',
    name: 'اسلیمی دهن‌اژدری چپ',
    category: 'eslimi',
    viewBox: '0 0 100 60',
    defaultColor: '#c2410c',
    path: `M 10,50 C 25,48 40,30 45,15 C 50,2 65,0 75,10 C 85,20 80,38 65,42 C 50,45 42,32 50,22 C 55,16 62,18 64,24 C 65,30 60,35 55,34 C 48,32 46,20 54,12 C 62,5 72,12 68,25 C 64,38 48,42 35,46 C 22,50 15,50 10,50 Z`
  },
  {
    id: 'eslimi_swirl_2',
    name: 'پیچک اسلیمی ماری',
    category: 'eslimi',
    viewBox: '0 0 80 80',
    defaultColor: '#b45309',
    path: `M 10,70 C 25,65 30,45 40,35 C 50,25 65,25 70,35 C 75,45 65,60 50,55 C 38,50 42,35 52,30 C 60,25 65,32 60,40 C 55,45 48,42 50,35 C 52,30 45,20 35,30 C 25,40 20,55 10,70 Z
           M 40,15 C 44,5 56,5 60,15 C 56,22 44,22 40,15 Z`
  },
  {
    id: 'gol_shahabbasi_1',
    name: 'گل شاه‌عباسی زرین',
    category: 'ornament',
    viewBox: '0 0 60 60',
    defaultColor: '#d97706',
    path: `M 30,10 C 35,18 42,18 48,12 C 45,20 52,25 58,28 C 50,32 50,40 55,48 C 46,45 40,50 38,58 C 34,50 26,50 22,58 C 20,50 14,45 5,48 C 10,40 10,32 2,28 C 8,25 15,20 12,12 C 18,18 25,18 30,10 Z
           M 30,22 C 34,22 38,26 38,30 C 38,34 34,38 30,38 C 26,38 22,34 22,30 C 22,26 26,22 30,22 Z`
  },
  {
    id: 'border_classic_band',
    name: 'بند حاشیه سنتی اسلیمی',
    category: 'border',
    viewBox: '0 0 200 40',
    defaultColor: '#b45309',
    path: `M 0,5 L 200,5 L 200,35 L 0,35 Z 
           M 10,12 L 190,12 L 190,28 L 10,28 Z
           M 25,20 C 30,15 40,15 45,20 C 40,25 30,25 25,20 Z
           M 75,20 C 80,15 90,15 95,20 C 90,25 80,25 75,20 Z
           M 125,20 C 130,15 140,15 145,20 C 140,25 130,25 125,20 Z
           M 175,20 C 180,15 190,15 195,20 C 190,25 180,25 175,20 Z`
  }
];

// Diacritics, Tashkeel and Traditional Calligraphy Marks
export interface DiacriticItem {
  id: string;
  name: string;
  char: string;
  category: 'harakat' | 'tanween' | 'ornament' | 'symbol';
  scriptRecommended: string;
}

export const CALLIGRAPHY_DIACRITICS: DiacriticItem[] = [
  // Harakat
  { id: 'fatha', name: 'زبر (فتحه)', char: 'َ', category: 'harakat', scriptRecommended: 'همه' },
  { id: 'damma', name: 'پیش (ضمه)', char: 'ُ', category: 'harakat', scriptRecommended: 'همه' },
  { id: 'kasra', name: 'زیر (کسره)', char: 'ِ', category: 'harakat', scriptRecommended: 'همه' },
  { id: 'sukoon', name: 'سکون (جزم)', char: 'ْ', category: 'harakat', scriptRecommended: 'همه' },
  { id: 'shadda', name: 'تشدید', char: 'ّ', category: 'harakat', scriptRecommended: 'همه' },
  { id: 'tanwin_fath', name: 'تنوین نصب (ـاً)', char: 'ً', category: 'tanween', scriptRecommended: 'همه' },
  { id: 'tanwin_damm', name: 'تنوین رفع (ـٌ)', char: 'ٌ', category: 'tanween', scriptRecommended: 'همه' },
  { id: 'tanwin_kasr', name: 'تنوین جر (ـٍ)', char: 'ٍ', category: 'tanween', scriptRecommended: 'همه' },
  { id: 'madda', name: 'مد روی الف (آ)', char: 'ٓ', category: 'harakat', scriptRecommended: 'همه' },
  { id: 'hamza_above', name: 'همزه بالا', char: 'ٔ', category: 'harakat', scriptRecommended: 'همه' },
  { id: 'dagger_alif', name: 'الف مقصوره بالایی', char: 'ٰ', category: 'harakat', scriptRecommended: 'همه' },

  // Calligraphic Symbols & Marks (علائم سنتی)
  { id: 'poetic_sign', name: 'علامت مصرع شعر (؏)', char: '؏', category: 'symbol', scriptRecommended: 'نستعلیق' },
  { id: 'takhallus_sign', name: 'علامت تخلص شاعر (ؔ)', char: 'ؔ', category: 'symbol', scriptRecommended: 'نستعلیق' },
  { id: 'sanah_sign', name: 'علامت سنه تاریخی (؁)', char: '؁', category: 'symbol', scriptRecommended: 'همه' },
  { id: 'traditional_comma', name: 'ویرگول سنتی (،)', char: '،', category: 'symbol', scriptRecommended: 'همه' },
  { id: 'star_eight', name: 'ستاره هشت‌پر زرین (۞)', char: '۞', category: 'ornament', scriptRecommended: 'ثلث' },
  { id: 'end_of_ayah', name: 'علامت ختم آیه (۝)', char: '۝', category: 'ornament', scriptRecommended: 'ثلث' },
  { id: 'rub_el_hizb', name: 'ربع الحزب (۩)', char: '۩', category: 'ornament', scriptRecommended: 'ثلث' },
  { id: 'flower_ornament', name: 'گل‌بوته کوچک (❀)', char: '❀', category: 'ornament', scriptRecommended: 'همه' },
  { id: 'leaf_ornament', name: 'برگ ختایی (❦)', char: '❦', category: 'ornament', scriptRecommended: 'همه' },
  { id: 'swirl_ornament', name: 'پیچک ظریف (❧)', char: '❧', category: 'ornament', scriptRecommended: 'همه' },
  { id: 'calligraphy_diamond', name: 'دانگ نقطه قلم (◆)', char: '◆', category: 'ornament', scriptRecommended: 'همه' },
  { id: 'three_dots', name: 'سه نقطه تاجی (⁂)', char: '⁂', category: 'ornament', scriptRecommended: 'همه' },
];

// Special Persian Calligraphic Dot configurations
export interface CalligraphyDotPreset {
  id: string;
  name: string;
  svg: string;
  description: string;
}

export const DOT_PRESETS: CalligraphyDotPreset[] = [
  {
    id: 'single_nastaliq_dot',
    name: 'تک نقطه لوزی نستعلیق',
    description: 'نقطه با زاویه ۶۳ درجه قلم‌تراش',
    svg: `<svg viewBox="0 0 30 30" width="24" height="24"><polygon points="15,2 28,15 15,28 2,15" fill="currentColor"/></svg>`
  },
  {
    id: 'double_nastaliq_dots',
    name: 'دو نقطه افقی پیوسته',
    description: 'دو نقطه متصل به شیوه کلاسیک',
    svg: `<svg viewBox="0 0 45 25" width="36" height="20"><polygon points="12,2 24,12 12,22 2,12" fill="currentColor"/><polygon points="32,2 44,12 32,22 22,12" fill="currentColor"/></svg>`
  },
  {
    id: 'triple_pyramid_dots',
    name: 'سه نقطه هرمی نستعلیق',
    description: 'سه نقطه تاجی شین، پ و ث',
    svg: `<svg viewBox="0 0 40 40" width="32" height="32"><polygon points="20,2 30,12 20,22 10,12" fill="currentColor"/><polygon points="10,18 20,28 10,38 2,28" fill="currentColor"/><polygon points="30,18 38,28 30,38 22,28" fill="currentColor"/></svg>`
  },
  {
    id: 'thuluth_vertical_dots',
    name: 'دو نقطه عمودی ثلث',
    description: 'دو نقطه متوالی خط ثلث',
    svg: `<svg viewBox="0 0 25 45" width="20" height="36"><polygon points="12,2 22,12 12,22 2,12" fill="currentColor"/><polygon points="12,22 22,32 12,42 2,32" fill="currentColor"/></svg>`
  },
  {
    id: 'shekasteh_slash_dot',
    name: 'نقطه پرتابی شکسته (خطی)',
    description: 'نقطه کشیده و سرعتی شیوه شکسته',
    svg: `<svg viewBox="0 0 40 20" width="32" height="16"><path d="M 5,5 Q 20,2 35,12 Q 20,18 5,5 Z" fill="currentColor"/></svg>`
  }
];

export const TAZHIB_MAP = new Map<string, TazhibItem>();
TAZHIB_COLLECTION.forEach(item => {
  TAZHIB_MAP.set(item.id, item);
  TAZHIB_MAP.set(item.name, item);
});

