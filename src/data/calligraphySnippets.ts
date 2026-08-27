import { CanvasElement, CalligraphyScript } from '../types/calligraphy';

export interface CalligraphySnippet {
  id: string;
  title: string;
  category: 'bismillah' | 'sacred' | 'prayer' | 'signature' | 'composition' | 'user';
  description: string;
  script: CalligraphyScript;
  elements: Partial<CanvasElement>[];
  previewText: string;
  isCustom?: boolean;
  createdAt?: string;
}

export const BUILT_IN_SNIPPETS: CalligraphySnippet[] = [
  {
    id: 'bismillah_nastaliq_traditional',
    title: 'بسم الله الرحمن الرحیم (نستعلیق سنتی)',
    category: 'bismillah',
    description: 'ترکیب کلاسیک تسمیه با سین کشیده و میم آویزان و اعراب ظریف',
    script: 'nastaliq',
    previewText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    elements: [
      {
        type: 'text',
        text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        script: 'nastaliq',
        fontSize: 52,
        color: '#18181b',
        kashidaLevel: 3,
        x: 450,
        y: 250,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
      }
    ]
  },
  {
    id: 'bismillah_thuluth_katibeh',
    title: 'تسمیه ثلث کتیبه‌ای مطبق',
    category: 'bismillah',
    description: 'ترکیب هندسی دو طبقه ثلث مناسب سرلوحه و کتیبه‌های تاریخی',
    script: 'thuluth',
    previewText: 'بسم الله الرحمن الرحیم',
    elements: [
      {
        type: 'text',
        text: 'بِسْمِ اللهِ',
        script: 'thuluth',
        fontSize: 60,
        color: '#d97706',
        x: 450,
        y: 220,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
      },
      {
        type: 'text',
        text: 'الرَّحْمٰنِ الرَّحِيمِ',
        script: 'thuluth',
        fontSize: 54,
        color: '#18181b',
        x: 450,
        y: 290,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
      }
    ]
  },
  {
    id: 'in_the_name_of_god_shekasteh',
    title: 'به نام خداوند جان و خرد (شکسته نستعلیق)',
    category: 'composition',
    description: 'شاه‌بیت آغازین فردوسی با کشیدگی‌های دوار درویش عبدالمجید طالقانی',
    script: 'shekasteh',
    previewText: 'به نام خداوند جان و خرد',
    elements: [
      {
        type: 'text',
        text: 'به نام خداوند جان و خرد',
        script: 'shekasteh',
        fontSize: 48,
        color: '#18181b',
        kashidaLevel: 4,
        x: 450,
        y: 230,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
      },
      {
        type: 'text',
        text: 'کزین برتر اندیشه برنگذرد',
        script: 'shekasteh',
        fontSize: 48,
        color: '#18181b',
        kashidaLevel: 4,
        x: 450,
        y: 310,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
      }
    ]
  },
  {
    id: 'hoo_al_aziz_crest',
    title: 'هو العزیز (تاج کتیبه و سرلوحه)',
    category: 'sacred',
    description: 'ترکیب علیا سنتی برای بالای قطعات چلیپا و سیاه‌مشق',
    script: 'nastaliq',
    previewText: 'هو العزیز',
    elements: [
      {
        type: 'text',
        text: 'هُوَ الْعَزِيزُ',
        script: 'nastaliq',
        fontSize: 42,
        color: '#b45309',
        x: 450,
        y: 120,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
      }
    ]
  },
  {
    id: 'salawat_thuluth_medallion',
    title: 'صلوات شریف در ترکیب مدور (اللهم صل علی محمد...)',
    category: 'sacred',
    description: 'صلوات کامل با قلم ثلث ممتاز مناسب شمسه‌های مدور',
    script: 'thuluth',
    previewText: 'اللهم صل علی محمد و آل محمد',
    elements: [
      {
        type: 'text',
        text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ',
        script: 'thuluth',
        fontSize: 46,
        color: '#0f4c5c',
        x: 450,
        y: 260,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
      }
    ]
  },
  {
    id: 'tarqim_katabahu_signature',
    title: 'ترقیم و امضای استاد (کتبه العبد المذنب...)',
    category: 'signature',
    description: 'ترقیم سنتی خوشنویسان قاجاری با قلم خفی در گوشه پایین چپ',
    script: 'shekasteh',
    previewText: 'کتبه العبد الحقیر فی شهر ربیع‌الاول',
    elements: [
      {
        type: 'text',
        text: 'کتبه العبد الحقیر المسکین غفر ذنوبه',
        script: 'shekasteh',
        fontSize: 24,
        color: '#713f12',
        x: 250,
        y: 540,
        rotation: -8,
        scaleX: 1,
        scaleY: 1,
        opacity: 0.85,
      }
    ]
  }
];

export const SNIPPETS_STORAGE_KEY = 'kelk_user_custom_snippets_v1';

export function loadUserSnippets(): CalligraphySnippet[] {
  try {
    const raw = localStorage.getItem(SNIPPETS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load custom snippets:', e);
    return [];
  }
}

export function saveUserSnippets(snippets: CalligraphySnippet[]): void {
  try {
    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(snippets));
  } catch (e) {
    console.error('Failed to save custom snippets:', e);
  }
}
