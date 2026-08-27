import { PaperTextureType } from '../types/calligraphy';

export interface CalligraphyPalette {
  id: string;
  name: string;
  category: 'traditional' | 'royal' | 'modern' | 'illumination' | 'earthy';
  description: string;
  textColor: string;
  secondaryTextColor: string;
  accentColor: string;
  tazhibColor: string;
  backgroundColor: string;
  paperTexture: PaperTextureType;
  gradient?: string;
  isPopular?: boolean;
}

export const CURATED_PALETTES: CalligraphyPalette[] = [
  {
    id: 'safavid_lapis_gold',
    name: 'زر و لاجورد صفوی',
    category: 'royal',
    description: 'الهام‌گرفته از قرآن‌های زرین و مرقعات عصر شاه‌عباس با لاجورد اعلا و طلای ۲۴ عیار',
    textColor: '#1a2744',
    secondaryTextColor: '#b45309',
    accentColor: '#d97706',
    tazhibColor: '#f59e0b',
    backgroundColor: '#faf6ee',
    paperTexture: 'gold_fleck',
    isPopular: true,
  },
  {
    id: 'qajar_crimson_turquoise',
    name: 'شنگرف و فیروزه قاجاری',
    category: 'traditional',
    description: 'رنگ‌های گرم و درخشان شنگرف سرخ، عنابی و فیروزه نیشابور در کاخ گلستان',
    textColor: '#881337',
    secondaryTextColor: '#0d9488',
    accentColor: '#d97706',
    tazhibColor: '#b45309',
    backgroundColor: '#fffdf5',
    paperTexture: 'parchment',
    isPopular: true,
  },
  {
    id: 'mir_emad_soot_parchment',
    name: 'دوده اعلا و آهارمهره میرعماد',
    category: 'traditional',
    description: 'مرکب سنتی دوده چوب گردو با درخشش مخملی روی کاغذ دست‌ساز آهارمهره کهن',
    textColor: '#18181b',
    secondaryTextColor: '#713f12',
    accentColor: '#b45309',
    tazhibColor: '#d97706',
    backgroundColor: '#f6eedb',
    paperTexture: 'parchment',
    isPopular: true,
  },
  {
    id: 'midnight_lapis_gold',
    name: 'شبانه لاجوردی و طلای ناب',
    category: 'royal',
    description: 'زمینه لاجوردی تیره و کتیبه‌نویسی با طلای دست‌ساز و تذهیب شمسه زرین',
    textColor: '#fbbf24',
    secondaryTextColor: '#38bdf8',
    accentColor: '#f59e0b',
    tazhibColor: '#fde68a',
    backgroundColor: '#091326',
    paperTexture: 'dark_velvet',
    isPopular: true,
  },
  {
    id: 'charcoal_marble_gold',
    name: 'مرمر سیاه و خط زر سوخته',
    category: 'modern',
    description: 'ترکیب مدرن و چشم‌نواز بافت سنگ مرمر مشکی و حروف برجسته زرین و طلایی',
    textColor: '#fbbf24',
    secondaryTextColor: '#94a3b8',
    accentColor: '#d97706',
    tazhibColor: '#eab308',
    backgroundColor: '#0c0e14',
    paperTexture: 'marble_black',
    isPopular: true,
  },
  {
    id: 'antique_walnut_terracotta',
    name: 'گردویی عتیق و سفالین',
    category: 'earthy',
    description: 'تونالیته گرم قهوه‌ای پوست گردو، خشت خام و زعفران اصیل ایرانی',
    textColor: '#451a03',
    secondaryTextColor: '#78350f',
    accentColor: '#d97706',
    tazhibColor: '#b45309',
    backgroundColor: '#fbf5e6',
    paperTexture: 'kraft',
  },
  {
    id: 'neyshabur_turquoise_emerald',
    name: 'فیروزه نیشابور و سبز زنگار',
    category: 'illumination',
    description: 'رنگ‌های آرامش‌بخش کتیبه‌های مساجد اصفهان و گنبدهای فیروزه‌ای',
    textColor: '#0f4c5c',
    secondaryTextColor: '#065f46',
    accentColor: '#d97706',
    tazhibColor: '#10b981',
    backgroundColor: '#f8faf9',
    paperTexture: 'cream',
  },
  {
    id: 'ebru_marbled_saffron',
    name: 'ابروباد شاهانه و زعفرانی',
    category: 'illumination',
    description: 'الگوهای دست‌ساز ابروباد سنتی با رگه‌های طلایی و قلم مشکی براق',
    textColor: '#1e1b4b',
    secondaryTextColor: '#991b1b',
    accentColor: '#d97706',
    tazhibColor: '#eab308',
    backgroundColor: '#f5efe6',
    paperTexture: 'ebru',
  },
  {
    id: 'contemporary_pure_monochrome',
    name: 'مونوکروم معاصر (مینیمال)',
    category: 'modern',
    description: 'تایپوگرافی تمیز و با کنتراست فوق‌العاده بالا برای پوسترهای مدرن و نمایشگاهی',
    textColor: '#09090b',
    secondaryTextColor: '#52525b',
    accentColor: '#18181b',
    tazhibColor: '#71717a',
    backgroundColor: '#ffffff',
    paperTexture: 'white_clean',
  },
  {
    id: 'ruby_damask_rose',
    name: 'گلگون گلاب و یاقوت انار',
    category: 'traditional',
    description: 'عنابی غلیظ، گل محمدی و یاقوت سرخ در پیوند با سرلوحه‌های مرقعات گل و بوته',
    textColor: '#701a75',
    secondaryTextColor: '#9f1239',
    accentColor: '#d97706',
    tazhibColor: '#e11d48',
    backgroundColor: '#fdf2f8',
    paperTexture: 'parchment',
  }
];
