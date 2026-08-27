import { 
  CalligraphyScript, 
  CanvasElement, 
  KelkProject, 
  PaperTextureType, 
  FreehandStrokePoint, 
  TextCurvePath, 
  EbruPaperSettings,
  CustomUserFont
} from '../types/calligraphy';
import { TAZHIB_COLLECTION, TAZHIB_MAP } from '../data/tazhibAssets';
import { FontLifecycleManager, FontStorageEngine } from './fontManager';

// Font mapping for each script with category metadata for rich browser
export interface ScriptMetadata {
  name: string;
  cssFamily: string;
  defaultNibAngle: number;
  desc: string;
  category: 'traditional' | 'kufic' | 'diwani_naskh' | 'display' | 'handwriting' | 'custom';
  origin?: string;
}

export const SCRIPT_FONT_MAP: Record<CalligraphyScript, ScriptMetadata> = {
  nastaliq: {
    name: 'نستعلیق میرعماد (عروس خطوط)',
    cssFamily: 'IranNastaliq, "Noto Nastaliq Urdu", "Gulzar", serif',
    defaultNibAngle: 63,
    desc: 'خط اصیل ایرانی با کرسی متغیر، زاویه ۶۳ درجه و کشیدگی‌های شاهکار',
    category: 'traditional',
    origin: 'ایران، دوره تیموری و صفوی',
  },
  shekasteh: {
    name: 'شکسته نستعلیق (سنتی)',
    cssFamily: 'Gulzar, IranNastaliq, "Noto Nastaliq Urdu", cursive',
    defaultNibAngle: 55,
    desc: 'خط پرپیچ و تاب، سیال و رهای سنتی با اتصالات نامتعارف',
    category: 'traditional',
    origin: 'ایران، دوره صفویه',
  },
  shekasteh_darvish: {
    name: 'شکسته درویش عبدالمجید',
    cssFamily: 'Gulzar, IranNastaliq, cursive',
    defaultNibAngle: 54,
    desc: 'اوج لطافت، رهایی، حلقه‌های باز و کشیده‌های پرتابی شکسته استاد درویش',
    category: 'traditional',
    origin: 'ایران، طالقانی',
  },
  nastaliq_lahori: {
    name: 'نستعلیق لاهوری و دهلوی',
    cssFamily: '"Noto Nastaliq Urdu", Gulzar, IranNastaliq, serif',
    defaultNibAngle: 65,
    desc: 'نستعلیق با زاویه تند، دانگ فشرده و سوار شدن‌های عمودی کلمات',
    category: 'traditional',
    origin: 'شبه قاره، لاهور',
  },
  gulzar: {
    name: 'نستعلیق گلزار (Gulzar Nastaliq)',
    cssFamily: 'Gulzar, "Noto Nastaliq Urdu", IranNastaliq, serif',
    defaultNibAngle: 64,
    desc: 'نستعلیق فاخر، متوازن و دقیق با اتصالات استادانه و کشیدگی‌های چشم‌نواز',
    category: 'traditional',
    origin: 'خوشنویسی اصیل شرقی',
  },
  neyrizi: {
    name: 'نسخ احمد نیریزی (میرزا احمد نیریزی)',
    cssFamily: 'Mirza, "Scheherazade New", Amiri, "Noto Naskh Arabic", serif',
    defaultNibAngle: 70,
    desc: 'شاهکار نسخ ایرانی دوره صفوی با کرسی استوار، ظرافت و لطافت بی‌نظیر قلم میرزا احمد نیریزی',
    category: 'traditional',
    origin: 'ایران، نیریز و اصفهان (دوره صفویه)',
  },
  mirza: {
    name: 'میرزا (تایپوگرافی خوشنویسی سنتی)',
    cssFamily: 'Mirza, "Amiri", cursive, serif',
    defaultNibAngle: 68,
    desc: 'قلم باوقار الهام‌گرفته از دستخط اساتید بزرگ خوشنویسی با اتصالات اصیل',
    category: 'traditional',
    origin: 'خوشنویسی معاصر ایرانی',
  },
  thuluth: {
    name: 'ثلث جلی کتیبه‌ای (ام الخطوط)',
    cssFamily: 'Amiri, "Scheherazade New", serif',
    defaultNibAngle: 75,
    desc: 'خط باشکوه کتیبه‌های مساجد، آیات قرآن و بناهای تاریخی با ترویس‌های استوار',
    category: 'traditional',
    origin: 'عراق و ایران، قرن ۴ هجری',
  },
  thuluth_hashem: {
    name: 'ثلث استاد هاشم بغدادی',
    cssFamily: 'Amiri, "Scheherazade New", serif',
    defaultNibAngle: 75,
    desc: 'قواعد دقیق و میزان شده ثلث معاصر با تناسبات طلایی هندسی',
    category: 'traditional',
    origin: 'بغداد، استاد هاشم',
  },
  naskh: {
    name: 'نسخ قرآنی عثمان طه',
    cssFamily: '"Scheherazade New", Amiri, serif',
    defaultNibAngle: 70,
    desc: 'خط فوق‌العاده خوانا، متوازن، یکدست و منظم کتابت قرآن کریم',
    category: 'diwani_naskh',
    origin: 'شام و مدینه',
  },
  naskh_hashem: {
    name: 'نسخ کتیبه‌ای هاشم بغدادی',
    cssFamily: '"Scheherazade New", Amiri, serif',
    defaultNibAngle: 72,
    desc: 'شاهکار نسخ کتیبه‌ای با فواصل متعادل، اتصالات محکم و اعراب دقیق',
    category: 'diwani_naskh',
    origin: 'عراق، کتاب قواعد الخط العربی',
  },
  amiri_quran: {
    name: 'امیره قرآنی مصحف (Amiri Quran)',
    cssFamily: '"Amiri Quran", Amiri, "Scheherazade New", serif',
    defaultNibAngle: 72,
    desc: 'نسخ فاخر و مطلا برگرفته از مصحف امیری بولاق با اعراب‌گذاری کامل قرآنی',
    category: 'diwani_naskh',
    origin: 'مصر و ایران، چاپ بولاق',
  },
  noto_naskh: {
    name: 'نسخ کلاسیک نوتو (Noto Naskh Arabic)',
    cssFamily: '"Noto Naskh Arabic", "Scheherazade New", serif',
    defaultNibAngle: 70,
    desc: 'نسخ استاندارد و خوانا با هندسه طلایی اتصالات و فواصل منظم',
    category: 'diwani_naskh',
    origin: 'تایپوگرافی استاندارد نسخ',
  },
  moalla: {
    name: 'معلّی حماسی (استاد عجمی)',
    cssFamily: '"Aref Ruqaa", Amiri, serif',
    defaultNibAngle: 60,
    desc: 'خط حماسی، قدسی، ساختارشکن و پرانرژی معاصر با کشیدگی‌های عمودی',
    category: 'traditional',
    origin: 'ایران، استاد حمید عجمی',
  },
  diwani: {
    name: 'دیوانی عثمانی (طغرا و فرامین)',
    cssFamily: 'Lateef, Amiri, cursive',
    defaultNibAngle: 68,
    desc: 'خط همپوشان، قوسی و تزیینی فرامین درباری عثمانی با شیب ملایم',
    category: 'diwani_naskh',
    origin: 'دربار عثمانی، استانبول',
  },
  diwani_jali: {
    name: 'دیوانی جلی (ملیح و پرنقش)',
    cssFamily: 'Lateef, Amiri, cursive',
    defaultNibAngle: 68,
    desc: 'دیوانی کتیبه‌ای و بسیار پرنقش با دانگ درشت و تزیینات و نقاط پرکننده متراکم',
    category: 'diwani_naskh',
    origin: 'امپراتوری عثمانی',
  },
  ruqaa: {
    name: 'رقعه (سریع، هندسی و روان)',
    cssFamily: '"Aref Ruqaa", cursive',
    defaultNibAngle: 50,
    desc: 'خط فشرده، زاویه‌دار و سریع نگارش با زاویه قلم ۵۰ درجه',
    category: 'traditional',
    origin: 'مصر و عثمانی',
  },
  ruqaa_ink: {
    name: 'رقعه مرکبی پردانگ (Aref Ruqaa Ink)',
    cssFamily: '"Aref Ruqaa Ink", "Aref Ruqaa", cursive',
    defaultNibAngle: 50,
    desc: 'خط رقعه با ضخامت جوهر غلیظ و حس قلم نی آغشته به مرکب سیاه',
    category: 'traditional',
    origin: 'خوشنویسی سنتی',
  },
  reyhan: {
    name: 'ریحان و محقق کتیبه‌ای',
    cssFamily: 'Amiri, "Scheherazade New", serif',
    defaultNibAngle: 72,
    desc: 'از اقلام سته کهن با الف‌های کشیده، دایره‌های باز و ظرافت بالا',
    category: 'traditional',
    origin: 'اقلام سته یاقوت مستعصمی',
  },
  kufi: {
    name: 'کوفی مشرقی و کهن',
    cssFamily: '"Reem Kufi", sans-serif',
    defaultNibAngle: 90,
    desc: 'کهن‌ترین خط هندسی قرآن‌های سده‌های اولیه و کتیبه‌های ابنیه اسلامی',
    category: 'kufic',
    origin: 'کوفه، صدر اسلام',
  },
  kufi_bannai: {
    name: 'کوفی بنایی (مربع / معقلی)',
    cssFamily: '"Reem Kufi", monospace, sans-serif',
    defaultNibAngle: 90,
    desc: 'خط هندسی شطرنجی و شبکه‌ای کاشی‌کاری‌های سنتی مساجد و گنبدها',
    category: 'kufic',
    origin: 'ایران، معماری سلجوقی و صفوی',
  },
  kufi_mushajjar: {
    name: 'کوفی مشجر و گلدار تزئینی',
    cssFamily: '"Reem Kufi", "Cairo", sans-serif',
    defaultNibAngle: 90,
    desc: 'کوفی تزیینی با برگ‌ها، غنچه‌ها و اسلیمی‌های درآمیخته در سرکش‌ها',
    category: 'kufic',
    origin: 'قرون ۴ و ۵ هجری',
  },
  kufi_fatimi: {
    name: 'کوفی فاطمی (مصر و قیروان)',
    cssFamily: '"Reem Kufi", "Alkalami", serif',
    defaultNibAngle: 90,
    desc: 'کوفی با عظمت با تنه‌های بلند، گره‌های تزیینی و انحناهای متوازن',
    category: 'kufic',
    origin: 'قاهره، دوره فاطمیان',
  },
  kufi_qahiri: {
    name: 'کوفی قاهری و باستانی',
    cssFamily: 'Qahiri, "Reem Kufi", sans-serif',
    defaultNibAngle: 90,
    desc: 'خط کوفی با استیل هندسی ناب و دست‌نخورده سده‌های نخستین',
    category: 'kufic',
    origin: 'مصر باستان اسلامی',
  },
  kufi_modern: {
    name: 'کوفی مدرن هندسی (Readex Pro)',
    cssFamily: '"Readex Pro", "Reem Kufi", sans-serif',
    defaultNibAngle: 90,
    desc: 'کوفی نوین و ساختاریافته مینیمال برای پوسترهای امروزی',
    category: 'kufic',
    origin: 'طراحی تایپوگرافی معاصر',
  },
  reem_kufi_ink: {
    name: 'کوفی ریم مرکبی (Reem Kufi Ink)',
    cssFamily: '"Reem Kufi Ink", "Reem Kufi", sans-serif',
    defaultNibAngle: 90,
    desc: 'کوفی با لبه‌های جوهری و حس دست‌نویس قلم‌نی پرمرکب',
    category: 'kufic',
    origin: 'تایپوگرافی نوین کوفی',
  },
  reem_kufi_fun: {
    name: 'کوفی ریم شاداب (Reem Kufi Fun)',
    cssFamily: '"Reem Kufi Fun", "Reem Kufi", sans-serif',
    defaultNibAngle: 85,
    desc: 'کوفی پرانرژی، پویا و منعطف مناسب پوسترهای فرهنگی و هنری',
    category: 'kufic',
    origin: 'تایپوگرافی معاصر',
  },
  katibeh: {
    name: 'کتیبه سنتی عناوین (Katibeh)',
    cssFamily: 'Katibeh, serif',
    defaultNibAngle: 65,
    desc: 'قلم با انحناهای نرم و باوقار برای سرلوحه‌ها و عناوین سنتی دیوان‌ها',
    category: 'display',
    origin: 'خوشنویسی عنوان‌نویسی',
  },
  lalezar: {
    name: 'لاله‌زار (پوستر و گرافیک نوستالژیک)',
    cssFamily: 'Lalezar, cursive, sans-serif',
    defaultNibAngle: 60,
    desc: 'خط تیتر و پوستر سینمایی ایرانی با کنتراست ضخامت فوق‌العاده بالا',
    category: 'display',
    origin: 'ایران، طراحی حروف پوستر',
  },
  elmessiri: {
    name: 'المسیری (کتیبه منحنی و نرم)',
    cssFamily: '"El Messiri", serif',
    defaultNibAngle: 65,
    desc: 'خط مدرن خوش‌تراش با اتصالات قوسی و تعادل عالی در ضخامت',
    category: 'display',
    origin: 'خاورمیانه',
  },
  rakkas: {
    name: 'رقاص شرقی (Rakkas)',
    cssFamily: 'Rakkas, cursive, serif',
    defaultNibAngle: 58,
    desc: 'قلم تزئینی با ریتم رقصان، شکست‌های جسورانه و کاراکتر قدرتمند',
    category: 'display',
    origin: 'تایپوگرافی شرقی',
  },
  marhey: {
    name: 'مرحی سیال (Marhey)',
    cssFamily: 'Marhey, cursive',
    defaultNibAngle: 55,
    desc: 'خط نرم، منحنی و بسیار دوستانه و پویا برای لوگوتایپ‌ها',
    category: 'display',
    origin: 'تایپ مدرن عربی و فارسی',
  },
  changa: {
    name: 'چانگا زاویه‌دار (Changa)',
    cssFamily: 'Changa, sans-serif',
    defaultNibAngle: 75,
    desc: 'خط هندسی مدرن با زوایای تیز و خوانایی بالا در ابعاد بزرگ',
    category: 'display',
    origin: 'گرافیک مدرن',
  },
  mada: {
    name: 'مدا (Mada Calligraphic)',
    cssFamily: 'Mada, sans-serif',
    defaultNibAngle: 65,
    desc: 'قلم مدرن با اقتباس از ساختار تراز دیوانی و خط کرسی یکدست',
    category: 'display',
    origin: 'تایپوگرافی عربی و فارسی',
  },
  harmattan: {
    name: 'هارماتان (خط مغربی و سودانی)',
    cssFamily: 'Harmattan, serif',
    defaultNibAngle: 65,
    desc: 'خط سنتی منطقه مغرب اسلامی، آندلس و شمال آفریقا با دایره‌های خاص',
    category: 'traditional',
    origin: 'مغرب اسلامی و تونس',
  },
  alkalami: {
    name: 'القلمی (سبک صحرایی و حروفیه)',
    cssFamily: 'Alkalami, serif',
    defaultNibAngle: 60,
    desc: 'خط سنتی قلم‌نی با بافت بومی، نقاط آزاد و کاراکتر تاریخی ویژه',
    category: 'traditional',
    origin: 'آفریقای شمالی و کانوری',
  },
  ruwudu: {
    name: 'روودو کتیبه‌ای (Ruwudu)',
    cssFamily: 'Ruwudu, serif',
    defaultNibAngle: 65,
    desc: 'خط کتیبه‌ای کلاسیک با الف‌های کشیده و اتصالات سنتی',
    category: 'traditional',
    origin: 'خوشنویسی سنتی شرقی',
  },
  vibes: {
    name: 'وایبز سیاه‌مشق (Vibes Expressive)',
    cssFamily: 'Vibes, cursive',
    defaultNibAngle: 50,
    desc: 'خط آزاد اکسپرسیو برای سیاه‌مشق‌های مدرن و کارهای هنری مفهومی',
    category: 'display',
    origin: 'کالیگرافی معاصر',
  },
  cairo: {
    name: 'قاهره تایپوگرافیک (Cairo)',
    cssFamily: 'Cairo, sans-serif',
    defaultNibAngle: 80,
    desc: 'تایپوگرافی هندسی شیک، تمیز و حرفه‌ای برای عناوین و پوسترها',
    category: 'display',
    origin: 'مصر و بین‌الملل',
  },
  alexandria: {
    name: 'اسکندریه (Alexandria Modern)',
    cssFamily: 'Alexandria, sans-serif',
    defaultNibAngle: 75,
    desc: 'قلم مدرن کتیبه‌ای با وزن‌های متنوع و کنتراست عالی برای تیترها',
    category: 'display',
    origin: 'تایپوگرافی خاورمیانه',
  },
  almarai: {
    name: 'المرائی هندسی (Almarai)',
    cssFamily: 'Almarai, sans-serif',
    defaultNibAngle: 80,
    desc: 'قلم هندسی با لبه‌های منظم، مدرن و خوانایی بسیار بالا',
    category: 'display',
    origin: 'تایپوگرافی معاصر',
  },
  beiruti: {
    name: 'بیروت پوستر (Beiruti)',
    cssFamily: 'Beiruti, sans-serif',
    defaultNibAngle: 70,
    desc: 'تایپوگرافی پوستر با زاویه‌های خاص و سبک مدیترانه‌ای جذاب',
    category: 'display',
    origin: 'لبنان و خاورمیانه',
  },
  tajawal: {
    name: 'تجوال مدرن (Tajawal)',
    cssFamily: 'Tajawal, sans-serif',
    defaultNibAngle: 75,
    desc: 'خط مدرن و مینیمال برای ترکیب‌های لوگوتایپ و گرافیک شهری',
    category: 'display',
    origin: 'تایپوگرافی مدرن',
  },
  baloo: {
    name: 'بالو ۲ فانتزی (Baloo Bhaijaan 2)',
    cssFamily: '"Baloo Bhaijaan 2", cursive, sans-serif',
    defaultNibAngle: 50,
    desc: 'قلم نرم، پرحجم، جذاب و فانتزی برای لوگوتایپ و گرافیک‌های شاداب',
    category: 'display',
    origin: 'تایپ مدرن شرقی',
  },
  lemonada: {
    name: 'لیمونادا سیال (Lemonada)',
    cssFamily: 'Lemonada, cursive',
    defaultNibAngle: 55,
    desc: 'خط دست‌آزاد فانتزی و بازیگوش با حرکات آزاد و رهای قلم',
    category: 'handwriting',
    origin: 'تایپ دیزاین معاصر',
  },
  zain: {
    name: 'زین نمایشی (Zain)',
    cssFamily: 'Zain, sans-serif',
    defaultNibAngle: 60,
    desc: 'قلم مدرن با نسبت‌های کشیده و کاراکتر تمیز برای پوسترها و عناوین',
    category: 'display',
    origin: 'طراحی حروف مدرن',
  },
  noto_sans_arabic: {
    name: 'نوتو سانز جامع (Noto Sans Arabic)',
    cssFamily: '"Noto Sans Arabic", sans-serif',
    defaultNibAngle: 60,
    desc: 'تایپ استاندارد با پشتیبانی کامل از تمام حروف، ارقام و اعراب زبان فارسی',
    category: 'display',
    origin: 'تایپوگرافی جهانی',
  },
  tahriri: {
    name: 'تحریری (خط خودکار و دست‌نویس)',
    cssFamily: 'Vazirmatn, IranNastaliq, cursive',
    defaultNibAngle: 55,
    desc: 'خط خودکاری و دست‌نویس کتابت معاصر با حس خودکار و روان‌نویس',
    category: 'handwriting',
    origin: 'آموزش خوشنویسی با خودکار',
  },
  sahel: {
    name: 'ساحل (قلم نرم و روان)',
    cssFamily: 'Sahel, Vazirmatn, sans-serif',
    defaultNibAngle: 55,
    desc: 'قلم زیبا، متوازن و لطیف ایرانی با خوانایی فوق‌العاده',
    category: 'handwriting',
    origin: 'ایران، صابر راستی‌کردار',
  },
  shabnam: {
    name: 'شبنم (قلم عنوان و سرلوحه)',
    cssFamily: 'Shabnam, Vazirmatn, sans-serif',
    defaultNibAngle: 60,
    desc: 'قلم پاکیزه، هندسی و دلنشین برای متون و سرلوحه‌ها',
    category: 'display',
    origin: 'ایران، صابر راستی‌کردار',
  },
  parastoo: {
    name: 'پرستو (کتابت و چاپ سنتی)',
    cssFamily: 'Parastoo, Vazirmatn, serif',
    defaultNibAngle: 60,
    desc: 'قلم کلاسیک مطبوعاتی و کتابی با کاراکترهای باوقار',
    category: 'handwriting',
    origin: 'ایران، صابر راستی‌کردار',
  },
  samim: {
    name: 'صمیم (قلم گرد و مدرن)',
    cssFamily: 'Samim, Vazirmatn, sans-serif',
    defaultNibAngle: 55,
    desc: 'قلم بدون دندانه با انحناهای نرم و دوستانه',
    category: 'display',
    origin: 'ایران، صابر راستی‌کردار',
  },
  tanha: {
    name: 'تنها (قلم ساده و صمیمی فارسی)',
    cssFamily: 'Tanha, Samim, Vazirmatn, sans-serif',
    defaultNibAngle: 58,
    desc: 'قلم پاکیزه، بی‌پیرایه و پرطرفدار فارسی با خوانایی بسیار بالا',
    category: 'display',
    origin: 'ایران، صابر راستی‌کردار',
  },
  gandom: {
    name: 'گندم (قلم اصیل و روان فارسی)',
    cssFamily: 'Gandom, Sahel, Vazirmatn, sans-serif',
    defaultNibAngle: 55,
    desc: 'قلم گرم، روان و چشم‌نواز فارسی بر پایه ساختار خط نسخ روان',
    category: 'handwriting',
    origin: 'ایران، صابر راستی‌کردار',
  },
  vazirmatn: {
    name: 'وزیرمتن (استاندارد تایپوگرافی فارسی)',
    cssFamily: 'Vazirmatn, Sahel, sans-serif',
    defaultNibAngle: 60,
    desc: 'شاهکار تایپوگرافی مدرن و استاندارد فارسی و عربی با هندسه طلایی',
    category: 'display',
    origin: 'ایران، صابر راستی‌کردار',
  },
  custom: {
    name: 'فونت دلخواه آپلود شده',
    cssFamily: 'sans-serif',
    defaultNibAngle: 60,
    desc: 'قلم سفارشی و شخصی بارگذاری شده توسط کاربر (TTF, OTF, WOFF)',
    category: 'custom',
    origin: 'کاربر',
  },
};

// Storage key for user custom fonts
export const USER_FONTS_STORAGE_KEY = 'kelk_custom_user_fonts_v1';

/**
 * Normalizes Persian text by converting Arabic specific characters (ي, ك, ة),
 * fixing Persian Hamza (هٔ), standardizing ZWNJ (نیم‌فاصله), and optional Persian digits.
 */
export function normalizePersianText(
  text: string,
  options: { convertDigits?: boolean; fixHamza?: boolean; cleanSpaces?: boolean } = {
    convertDigits: true,
    fixHamza: true,
    cleanSpaces: true,
  }
): string {
  if (!text) return '';

  let normalized = text;

  // 1. Replace Arabic Yeh (ي, ى) with Persian Yeh (ی)
  normalized = normalized.replace(/[\u064A\u0649]/g, 'ی');

  // 2. Replace Arabic Kaf (ك) with Persian Kaf (ک)
  normalized = normalized.replace(/[\u0643]/g, 'ک');

  // 3. Replace Arabic Ta Marbuta (ة) with Heh (ه) or Teh (ت) where appropriate
  normalized = normalized.replace(/[\u0629]/g, 'ه');

  // 4. Standardize Persian Hamza (هٔ instead of ۀ or separate non-standard hamza)
  if (options.fixHamza !== false) {
    normalized = normalized.replace(/(\u0647|\u0647\u200c)[\u0654]/g, 'هٔ');
    normalized = normalized.replace(/[\u06c0]/g, 'هٔ'); // Unicode Persian Heh with Ye above
    normalized = normalized.replace(/ه\s*ء/g, 'هٔ');
  }

  // 5. Convert Eastern Arabic (٠١٢٣٤٥٦٧٨٩) and Latin (0-9) digits to authentic Persian (۰۱۲۳۴۵۶۷۸۹)
  if (options.convertDigits) {
    normalized = convertDigitsToPersian(normalized);
  }

  // 6. Clean duplicate spaces and standardize ZWNJ (نیم‌فاصله)
  if (options.cleanSpaces !== false) {
    // Replace multiple consecutive spaces with a single space
    normalized = normalized.replace(/ +/g, ' ');
    // Remove spaces around ZWNJ
    normalized = normalized.replace(/ *\u200c */g, '\u200c');
    // Remove repeated ZWNJs
    normalized = normalized.replace(/\u200c{2,}/g, '\u200c');
  }

  return normalized;
}

/**
 * Converts English and Arabic numbers into Persian numerals (۰۱۲۳۴۵۶۷۸۹)
 */
export function convertDigitsToPersian(text: string): string {
  if (!text) return '';
  const latinDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const easternArabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  let result = text;
  for (let i = 0; i < 10; i++) {
    result = result.split(latinDigits[i]).join(persianDigits[i]);
    result = result.split(easternArabicDigits[i]).join(persianDigits[i]);
  }
  return result;
}

/**
 * Converts Persian and Arabic digits back to standard Latin (0123456789)
 */
export function convertDigitsToLatin(text: string): string {
  if (!text) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const easternArabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const latinDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let result = text;
  for (let i = 0; i < 10; i++) {
    result = result.split(persianDigits[i]).join(latinDigits[i]);
    result = result.split(easternArabicDigits[i]).join(latinDigits[i]);
  }
  return result;
}

/**
 * Inserts Persian Half-Space (نیم‌فاصله - ZWNJ '\u200c') at specific position
 */
export function insertZWNJAtPosition(
  text: string, 
  selectionStart: number, 
  selectionEnd: number
): { text: string; newCursor: number } {
  const before = text.substring(0, selectionStart);
  const after = text.substring(selectionEnd);
  const newText = before + '\u200c' + after;
  return {
    text: newText,
    newCursor: selectionStart + 1,
  };
}

/**
 * Register a custom user font dynamically into the document and font registry
 */
export async function registerUserFontInDOM(font: CustomUserFont): Promise<boolean> {
  return FontLifecycleManager.registerFont(font, true);
}

/**
 * Load and register all saved user custom fonts from durable storage
 */
export function loadAllSavedUserFonts(): CustomUserFont[] {
  if (typeof window === 'undefined') return [];
  try {
    // Attempt local storage sync + trigger async DB restoration
    const raw = localStorage.getItem('kelk_custom_user_fonts_v2') || localStorage.getItem(USER_FONTS_STORAGE_KEY);
    if (!raw) {
      FontLifecycleManager.initialize().catch(console.error);
      return [];
    }
    const fonts: CustomUserFont[] = JSON.parse(raw);
    fonts.forEach(f => {
      FontLifecycleManager.registerFont(f, false).catch(console.error);
    });
    return fonts;
  } catch (e) {
    console.error('Error loading saved user fonts:', e);
    return [];
  }
}

/**
 * Save user custom fonts to durable storage (IndexedDB + LocalStorage)
 */
export function saveUserFontsToStorage(fonts: CustomUserFont[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('kelk_custom_user_fonts_v2', JSON.stringify(fonts));
    fonts.forEach(f => FontStorageEngine.saveFont(f).catch(console.error));
  } catch (e) {
    console.error('Error saving user fonts:', e);
  }
}

// Apply intelligent Kashida (Tatweel) to words with support for dot-based units & Persian letter rules
export function applyKashida(text: string, level: number = 1, dotUnits?: number): string {
  if (!text) return text;
  
  // If specific dot units requested (3, 5, 7, 9, 11, 13 Nuqta)
  let count = level;
  if (dotUnits && dotUnits > 0) {
    // Map dot units (3, 5, 7, 9, 11, 13) to tatweel repeats
    count = Math.max(1, Math.round(dotUnits / 1.5));
  }

  if (count <= 0) return text;

  // Persian characters that connect on both left and right
  // (ب، پ، ت، ث، ج، چ، ح، خ، س، ش، ص، ض، ط، ظ، ع، غ، ف، ق، ک، گ، ل، م، ن، ه، ی، ئ)
  // Non-connectors on left: (ا، آ، د، ذ، ر، ز، ژ، و، ؤ، ۀ)
  // Persian ZWNJ (\u200c) must NEVER have a kashida inserted directly before or after it!
  const tatweel = 'ـ'.repeat(Math.min(count, 14));

  // Regex matching extendable Persian connecting letters followed by any connecting or non-connecting letter except ZWNJ
  const extendableChars = /([بتپثجچحخسشصضطظعغفقکگلمنهیئ])(?=[بتپثجچحخسشصضطظعغفقکگلمنهیئیاودذرزژآؤ])/g;

  let result = text.replace(extendableChars, (match) => {
    return match + tatweel;
  });

  // If no mid-connections matched, try adding to last extendable character before word boundary or end (without breaking ZWNJ)
  if (result === text) {
    const endExtendable = /([بتپثجچحخسشصضطظعغفقکگلمنهیئ])(?=\s|$|[.,،؛:!?])/g;
    result = text.replace(endExtendable, (match) => {
      return match + tatweel;
    });
  }

  return result;
}

const NON_CONNECTING_CHARS = new Set(['ا', 'آ', 'أ', 'إ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'و', 'ؤ', 'ء', 'ة', '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']);

// Decompose Persian text into authentic cursive ligature clusters (خوشه‌ها و تکه‌های چسبیده خطاطی)
export function decomposePersianIntoLigatures(text: string): string[] {
  const clean = text.trim();
  if (!clean) return [];
  const words = clean.split(/\s+/).filter(Boolean);
  const allClusters: string[] = [];

  for (const word of words) {
    const chars = Array.from(word);
    let currentCluster = '';

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      if (ch === '\u200c') {
        if (currentCluster) {
          allClusters.push(currentCluster);
          currentCluster = '';
        }
        continue;
      }

      currentCluster += ch;

      // Non-connecting letters cannot connect forward, so a calligraphy cluster ends here
      if (NON_CONNECTING_CHARS.has(ch) || i === chars.length - 1) {
        if (currentCluster) {
          allClusters.push(currentCluster);
          currentCluster = '';
        }
      }
    }
    if (currentCluster) {
      allClusters.push(currentCluster);
    }
  }

  return allClusters.filter(Boolean);
}

// Split full line/poetry into individual draggable words with coordinate offsets, respecting Persian ZWNJ
export function splitTextIntoWords(
  text: string, 
  script: CalligraphyScript, 
  baseX: number, 
  baseY: number, 
  fontSize: number, 
  color: string,
  customFontFamily?: string
): CanvasElement[] {
  // Normalize Persian text before splitting
  const cleanText = normalizePersianText(text.trim(), { convertDigits: false, fixHamza: true, cleanSpaces: true });
  // Split on standard whitespace (spaces/newlines), preserving ZWNJ within compound Persian words (e.g. "می‌شود", "خانه‌ها")
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return [];

  const elements: CanvasElement[] = [];
  const spacing = fontSize * 0.95;
  const totalSpan = (words.length - 1) * spacing;
  let currentX = baseX + (totalSpan / 2);
  const resolvedFontFamily = customFontFamily || SCRIPT_FONT_MAP[script]?.cssFamily || 'IranNastaliq, "Noto Nastaliq Urdu", serif';

  words.forEach((word, index) => {
    elements.push({
      id: `word_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 4)}`,
      name: `کلمه: ${word}`,
      type: 'text',
      text: word,
      script: script,
      x: Math.round(currentX),
      y: baseY + (index % 2 === 1 ? -4 : 4), // subtle natural baseline variation for traditional stacking
      fontSize: fontSize,
      fontFamily: resolvedFontFamily,
      color: color,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: 10 + index,
      kashidaLevel: 0,
    });
    currentX -= spacing;
  });

  return elements;
}

// Decompose text into individual standalone letters
export function decomposeIntoLetters(
  text: string,
  script: CalligraphyScript,
  baseX: number,
  baseY: number,
  fontSize: number,
  color: string,
  customFontFamily?: string
): CanvasElement[] {
  const clean = text.replace(/\s+/g, '').replace(/\u200c/g, '');
  const chars = Array.from(clean);
  if (chars.length === 0) return [];

  const elements: CanvasElement[] = [];
  const spacing = fontSize * 0.55;
  const totalSpan = (chars.length - 1) * spacing;
  let currentX = baseX + (totalSpan / 2);
  const resolvedFontFamily = customFontFamily || SCRIPT_FONT_MAP[script]?.cssFamily || 'IranNastaliq, "Noto Nastaliq Urdu", serif';

  chars.forEach((char, index) => {
    elements.push({
      id: `letter_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 4)}`,
      name: `حرف منفصل: ${char}`,
      type: 'letter',
      text: char,
      script: script,
      x: Math.round(currentX),
      y: baseY,
      fontSize: fontSize,
      fontFamily: resolvedFontFamily,
      color: color,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: 10 + index,
    });
    currentX -= spacing;
  });

  return elements;
}

// Decompose a single word or phrase into constituent calligraphy syllables/ligatures
export function decomposePersianWord(
  word: string,
  script: CalligraphyScript,
  x: number,
  y: number,
  fontSize: number,
  color: string,
  customFontFamily?: string
): CanvasElement[] {
  const clusters = decomposePersianIntoLigatures(word);
  if (clusters.length <= 1) {
    // If only 1 cluster, break into individual letters so user gets a meaningful split
    return decomposeIntoLetters(word, script, x, y, fontSize, color, customFontFamily);
  }

  const elements: CanvasElement[] = [];
  const spacing = fontSize * 0.7;
  const totalSpan = (clusters.length - 1) * spacing;
  let currentX = x + (totalSpan / 2);
  const resolvedFontFamily = customFontFamily || SCRIPT_FONT_MAP[script]?.cssFamily || 'IranNastaliq, serif';

  clusters.forEach((chunk, idx) => {
    elements.push({
      id: `ligature_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
      name: `جزء کلمه: ${chunk}`,
      type: 'letter',
      text: chunk,
      originalWord: word,
      script,
      x: Math.round(currentX),
      y: y + (idx % 2 === 0 ? 0 : -6), // slight vertical stagger for authentic Nastaliq stacking
      fontSize,
      fontFamily: resolvedFontFamily,
      color,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: 20 + idx,
      baselineShift: 0,
    });
    currentX -= spacing;
  });

  return elements;
}

// Mathematical calculation for Persian Reed Pen (قلم نی خیزران)
// Creates a polygonal ribbon stroke with natural thick/thin variation based on cut angle
export function generateReedPenRibbonPath(
  points: FreehandStrokePoint[],
  nibAngleDeg: number = 63,
  nibWidth: number = 16
): string {
  if (!points || points.length < 2) return '';

  const rad = (nibAngleDeg * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  const leftEdge: { x: number; y: number }[] = [];
  const rightEdge: { x: number; y: number }[] = [];

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const pressure = pt.pressure || 1;
    const currentHalfW = (nibWidth * pressure) / 2;

    const dx = currentHalfW * cosA;
    const dy = currentHalfW * sinA;

    leftEdge.push({ x: pt.x - dx, y: pt.y - dy });
    rightEdge.push({ x: pt.x + dx, y: pt.y + dy });
  }

  // Construct SVG polygon / curve path
  let pathD = `M ${leftEdge[0].x.toFixed(1)} ${leftEdge[0].y.toFixed(1)}`;

  // Forward along left edge
  for (let i = 1; i < leftEdge.length; i++) {
    const prev = leftEdge[i - 1];
    const curr = leftEdge[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    pathD += ` Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }
  const lastLeft = leftEdge[leftEdge.length - 1];
  pathD += ` L ${lastLeft.x.toFixed(1)} ${lastLeft.y.toFixed(1)}`;

  // Connect to end of right edge
  const lastRight = rightEdge[rightEdge.length - 1];
  pathD += ` L ${lastRight.x.toFixed(1)} ${lastRight.y.toFixed(1)}`;

  // Backward along right edge
  for (let i = rightEdge.length - 2; i >= 0; i--) {
    const next = rightEdge[i + 1];
    const curr = rightEdge[i];
    const midX = (next.x + curr.x) / 2;
    const midY = (next.y + curr.y) / 2;
    pathD += ` Q ${next.x.toFixed(1)} ${next.y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }

  const firstRight = rightEdge[0];
  pathD += ` L ${firstRight.x.toFixed(1)} ${firstRight.y.toFixed(1)} Z`;

  return pathD;
}

// Generate SVG text path curvature definitions
export function generateTextCurvePath(
  curveType: TextCurvePath, 
  curvature: number = 50, 
  width: number = 300, 
  height: number = 80
): { pathId: string; pathD: string } {
  const pathId = `curve_${Math.abs(curvature)}_${curveType}`;
  const halfW = width / 2;
  const curveMagnitude = (curvature / 100) * (height || 80);

  let pathD = `M 0,${height / 2} L ${width},${height / 2}`;

  if (curveType === 'arc_up') {
    pathD = `M 0,${height / 2 + curveMagnitude} Q ${halfW},${height / 2 - curveMagnitude} ${width},${height / 2 + curveMagnitude}`;
  } else if (curveType === 'arc_down') {
    pathD = `M 0,${height / 2 - curveMagnitude} Q ${halfW},${height / 2 + curveMagnitude} ${width},${height / 2 - curveMagnitude}`;
  } else if (curveType === 'wave') {
    pathD = `M 0,${height / 2} Q ${width * 0.25},${height / 2 - curveMagnitude} ${halfW},${height / 2} T ${width},${height / 2}`;
  } else if (curveType === 'circle') {
    const r = Math.max(40, width / 2);
    pathD = `M ${halfW - r},${height / 2} A ${r},${r} 0 1,1 ${halfW + r},${height / 2} A ${r},${r} 0 1,1 ${halfW - r},${height / 2}`;
  } else if (curveType === 'arch') {
    pathD = `M 0,${height} C ${width * 0.2},0 ${width * 0.8},0 ${width},${height}`;
  }

  return { pathId, pathD };
}

// Generate Dynamic Ebru (ابروباد سنتی) SVG background pattern
export function generateDynamicEbruSvgDef(settings: EbruPaperSettings, canvasWidth: number, canvasHeight: number): string {
  const { patternStyle, primaryColor, secondaryColor, accentColor, goldSpeckles, ageingDistress } = settings;

  const goldPoints: string[] = [];
  const speckleCount = Math.floor((goldSpeckles / 100) * 120);
  for (let i = 0; i < speckleCount; i++) {
    const gx = ((i * 137.5) % canvasWidth).toFixed(1);
    const gy = ((i * 241.7) % canvasHeight).toFixed(1);
    const gr = ((i % 3) + 1.2).toFixed(1);
    goldPoints.push(`<circle cx="${gx}" cy="${gy}" r="${gr}" fill="#fbbf24" opacity="0.75" />`);
  }

  // Wavy Ebru ribbons
  const ribbons: string[] = [];
  const ribbonCount = patternStyle === 'comb' ? 14 : 8;
  for (let i = 0; i < ribbonCount; i++) {
    const yPos = (canvasHeight / ribbonCount) * i;
    const waveAmp = patternStyle === 'swirl' ? 35 : (patternStyle === 'comb' ? 18 : 28);
    const color = i % 3 === 0 ? primaryColor : (i % 3 === 1 ? secondaryColor : accentColor);
    const path = `M 0,${yPos} Q ${canvasWidth * 0.25},${yPos - waveAmp} ${canvasWidth * 0.5},${yPos} T ${canvasWidth},${yPos} L ${canvasWidth},${yPos + 40} L 0,${yPos + 40} Z`;
    ribbons.push(`<path d="${path}" fill="${color}" opacity="0.22" />`);
  }

  return `
    <defs>
      <linearGradient id="ebruBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fffef7" />
        <stop offset="50%" stop-color="#f8ecd5" />
        <stop offset="100%" stop-color="#ebd8b5" />
      </linearGradient>
      <filter id="ebruTurbulence">
        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="${ageingDistress * 0.3}" />
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#ebruBaseGrad)" />
    <g filter="url(#ebruTurbulence)">
      ${ribbons.join('\n')}
    </g>
    <g id="goldZarafshan">
      ${goldPoints.join('\n')}
    </g>
  `;
}

// Generate traditional Chlipa layout (4 diagonal verses)
export function createChlipaLayout(
  verse1: string, 
  verse2: string, 
  verse3: string, 
  verse4: string,
  script: CalligraphyScript = 'nastaliq',
  canvasWidth: number = 900,
  canvasHeight: number = 700
): CanvasElement[] {
  const angle = -12; // traditional 12-14 degree diagonal slope

  const elements: CanvasElement[] = [
    {
      id: `chlipa_v1_${Date.now()}`,
      name: 'مصرع اول (راست بالا)',
      type: 'text',
      text: verse1,
      script,
      x: canvasWidth * 0.25,
      y: canvasHeight * 0.28,
      fontSize: 36,
      fontFamily: SCRIPT_FONT_MAP[script].cssFamily,
      color: '#18181b',
      rotation: angle,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: 2,
      kashidaLevel: 3,
    },
    {
      id: `chlipa_v2_${Date.now()}`,
      name: 'مصرع دوم (چپ بالا)',
      type: 'text',
      text: verse2,
      script,
      x: canvasWidth * 0.32,
      y: canvasHeight * 0.42,
      fontSize: 36,
      fontFamily: SCRIPT_FONT_MAP[script].cssFamily,
      color: '#18181b',
      rotation: angle,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: 3,
      kashidaLevel: 4,
    },
    {
      id: `chlipa_v3_${Date.now()}`,
      name: 'مصرع سوم (راست پایین)',
      type: 'text',
      text: verse3,
      script,
      x: canvasWidth * 0.25,
      y: canvasHeight * 0.58,
      fontSize: 36,
      fontFamily: SCRIPT_FONT_MAP[script].cssFamily,
      color: '#18181b',
      rotation: angle,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: 4,
      kashidaLevel: 2,
    },
    {
      id: `chlipa_v4_${Date.now()}`,
      name: 'مصرع چهارم (چپ پایین)',
      type: 'text',
      text: verse4,
      script,
      x: canvasWidth * 0.32,
      y: canvasHeight * 0.72,
      fontSize: 36,
      fontFamily: SCRIPT_FONT_MAP[script].cssFamily,
      color: '#18181b',
      rotation: angle,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: 5,
      kashidaLevel: 4,
    },
    {
      id: `chlipa_tazhib_1_${Date.now()}`,
      name: 'لچک گوشه بالا',
      type: 'tazhib',
      tazhibName: 'lachak_corner_1',
      x: 60,
      y: 60,
      fontSize: 40,
      fontFamily: '',
      color: '#b45309',
      rotation: 0,
      scaleX: 1.1,
      scaleY: 1.1,
      opacity: 0.85,
      zIndex: 1,
      width: 75,
      height: 75
    },
    {
      id: `chlipa_tazhib_2_${Date.now()}`,
      name: 'لچک گوشه پایین',
      type: 'tazhib',
      tazhibName: 'lachak_corner_1',
      x: canvasWidth - 135,
      y: canvasHeight - 135,
      fontSize: 40,
      fontFamily: '',
      color: '#b45309',
      rotation: 180,
      scaleX: 1.1,
      scaleY: 1.1,
      opacity: 0.85,
      zIndex: 1,
      width: 75,
      height: 75
    }
  ];

  return elements;
}

// Generate Siah-Mashq Layered Composition
export function createSiahMashqLayout(
  basePhrase: string, 
  script: CalligraphyScript = 'nastaliq',
  canvasWidth: number = 850,
  canvasHeight: number = 750
): CanvasElement[] {
  const lines = [
    basePhrase,
    basePhrase.slice(0, Math.floor(basePhrase.length * 0.7)),
    basePhrase.slice(Math.floor(basePhrase.length * 0.3)),
    basePhrase,
    'هو العزیز الحکیم'
  ];

  const rotations = [-12, -18, -8, -15, 0];
  const opacities = [0.95, 0.9, 0.85, 0.9, 0.8];
  const fontSizes = [50, 45, 52, 42, 36];
  const colors = ['#18181b', '#0f172a', '#27272a', '#18181b', '#3f3f46'];

  return lines.map((line, idx) => ({
    id: `siah_mashq_${Date.now()}_${idx}`,
    name: `لایه سیاه‌مشق ${idx + 1}`,
    type: 'text',
    text: line,
    script,
    x: canvasWidth * 0.2 + (idx * 20),
    y: canvasHeight * 0.22 + (idx * 110),
    fontSize: fontSizes[idx % fontSizes.length],
    fontFamily: SCRIPT_FONT_MAP[script].cssFamily,
    color: colors[idx % colors.length],
    rotation: rotations[idx % rotations.length],
    scaleX: 1.05,
    scaleY: 1.05,
    opacity: opacities[idx % opacities.length],
    zIndex: idx + 1,
    kashidaLevel: idx % 2 === 0 ? 4 : 1,
  }));
}

// Export Project as Vector SVG string (High Precision Vector Quality)
export function exportToSvg(project: KelkProject): string {
  const { canvasWidth, canvasHeight, elements, backgroundColor, paperTexture, frameBorder, ebruSettings } = project;

  let bgDef = `<rect width="100%" height="100%" fill="${backgroundColor || '#ffffff'}" />`;
  if (paperTexture === 'parchment') {
    bgDef = `
      <defs>
        <radialGradient id="parchmentGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#fffef5" />
          <stop offset="70%" stop-color="#f5ecda" />
          <stop offset="100%" stop-color="#ebd8b5" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#parchmentGrad)" />
    `;
  } else if (paperTexture === 'dark_velvet') {
    bgDef = `
      <defs>
        <radialGradient id="velvetGrad" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stop-color="#141e33" />
          <stop offset="100%" stop-color="#080d18" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#velvetGrad)" />
    `;
  } else if (paperTexture === 'gold_fleck') {
    bgDef = `
      <defs>
        <radialGradient id="goldFleckGrad" cx="50%" cy="50%" r="75%">
          <stop offset="0%" stop-color="#fffef9" />
          <stop offset="100%" stop-color="#f7edd8" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#goldFleckGrad)" />
    `;
  } else if (paperTexture === 'custom_ebru' && ebruSettings) {
    bgDef = generateDynamicEbruSvgDef(ebruSettings, canvasWidth, canvasHeight);
  }

  // Vector Frame Borders in SVG
  let borderSvg = '';
  if (frameBorder === 'classic_gold') {
    borderSvg = `
      <g opacity="0.8">
        <rect x="16" y="16" width="${canvasWidth - 32}" height="${canvasHeight - 32}" fill="none" stroke="#d97706" stroke-width="2" rx="4" />
        <rect x="22" y="22" width="${canvasWidth - 44}" height="${canvasHeight - 44}" fill="none" stroke="#d97706" stroke-width="1" stroke-opacity="0.6" rx="2" />
      </g>
    `;
  } else if (frameBorder === 'tazhib_full') {
    borderSvg = `
      <g opacity="0.9">
        <rect x="24" y="24" width="${canvasWidth - 48}" height="${canvasHeight - 48}" fill="none" stroke="#f59e0b" stroke-width="3" rx="6" />
        <rect x="32" y="32" width="${canvasWidth - 64}" height="${canvasHeight - 64}" fill="none" stroke="#d97706" stroke-width="1.5" stroke-dasharray="4,2" />
        <rect x="38" y="38" width="${canvasWidth - 76}" height="${canvasHeight - 76}" fill="none" stroke="#b45309" stroke-width="2" />
        <!-- Corner Gold Lozenges -->
        <polygon points="24,18 30,24 24,30 18,24" fill="#f59e0b" />
        <polygon points="${canvasWidth - 24},18 ${canvasWidth - 18},24 ${canvasWidth - 24},30 ${canvasWidth - 30},24" fill="#f59e0b" />
        <polygon points="24,${canvasHeight - 30} 30,${canvasHeight - 24} 24,${canvasHeight - 18} 18,${canvasHeight - 24}" fill="#f59e0b" />
        <polygon points="${canvasWidth - 24},${canvasHeight - 30} ${canvasWidth - 18},${canvasHeight - 24} ${canvasWidth - 24},${canvasHeight - 18} ${canvasWidth - 30},${canvasHeight - 24}" fill="#f59e0b" />
      </g>
    `;
  } else if (frameBorder === 'chlipa_traditional') {
    borderSvg = `
      <g opacity="0.8">
        <rect x="32" y="32" width="${canvasWidth - 64}" height="${canvasHeight - 64}" fill="none" stroke="#92400e" stroke-width="2" />
        <rect x="36" y="36" width="${canvasWidth - 72}" height="${canvasHeight - 72}" fill="none" stroke="#b45309" stroke-width="1" stroke-opacity="0.5" />
        <rect x="52" y="52" width="${canvasWidth - 104}" height="${canvasHeight - 104}" fill="none" stroke="#d97706" stroke-width="1" stroke-dasharray="6,4" stroke-opacity="0.4" />
      </g>
    `;
  } else if (frameBorder === 'minimal_double') {
    borderSvg = `
      <g opacity="0.7">
        <rect x="20" y="20" width="${canvasWidth - 40}" height="${canvasHeight - 40}" fill="none" stroke="#71717a" stroke-width="1" />
        <rect x="24" y="24" width="${canvasWidth - 48}" height="${canvasHeight - 48}" fill="none" stroke="#a1a1aa" stroke-width="0.75" />
      </g>
    `;
  }

  // Generate SVG elements
  const elementsSvg = elements
    .filter(el => el.isVisible !== false)
    .sort((a, b) => a.zIndex - b.zIndex)
    .map(el => {
      // 1. Freehand Reed Pen Stroke (قلم نی آزاد)
      if (el.type === 'stroke' && el.strokeData) {
        const ribbonPath = generateReedPenRibbonPath(el.strokeData.points, el.strokeData.nibAngle, el.strokeData.nibWidth);
        const fillVal = el.strokeData.goldEffect ? 'url(#goldTextGrad)' : el.strokeData.color;
        return `
          <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation}) scale(${el.scaleX}, ${el.scaleY})" opacity="${el.opacity}">
            <path d="${ribbonPath}" fill="${fillVal}" />
          </g>
        `;
      }

      // 2. Traditional Seal Stamp (مهر و امضای سنتی)
      if (el.type === 'seal' || (el.type === 'tazhib' && (el.tazhibName?.includes('seal') || el.tazhibName?.startsWith('seal_') || el.tazhibName?.startsWith('royal_seal_')))) {
        const tag = el.tazhibName || '';
        const isPositive = tag.includes('positive');
        const isCircle = tag.includes('circle');
        const isSquare = tag.includes('square');
        const isOctagon = tag.includes('octagon');
        const isArch = tag.includes('arch');
        const isOval = !isCircle && !isSquare && !isOctagon && !isArch;

        let sealBg = '#991b1b';
        let sealBorder = '#f87171';
        let sealTextColor = '#fef2f2';

        if (tag.includes('agate_gold')) {
          sealBg = '#451a03';
          sealBorder = '#ca8a04';
          sealTextColor = '#fde047';
        } else if (tag.includes('brass_qajar')) {
          sealBg = '#b45309';
          sealBorder = '#fef08a';
          sealTextColor = '#18181b';
        } else if (tag.includes('lapis_royal')) {
          sealBg = '#1e3a8a';
          sealBorder = '#60a5fa';
          sealTextColor = '#f0fdf4';
        } else if (tag.includes('charcoal_black')) {
          sealBg = '#18181b';
          sealBorder = '#52525b';
          sealTextColor = '#faf5e8';
        } else if (tag.includes('emerald_green')) {
          sealBg = '#065f46';
          sealBorder = '#34d399';
          sealTextColor = '#fef08a';
        }

        if (isPositive) {
          sealBg = '#faf5e8';
          sealTextColor = sealBorder;
        }

        const w = el.width || 120;
        const h = el.height || 90;

        const parts = (el.text || '').split(' ');
        const prefix = parts.length > 2 ? parts[0] + ' ' + parts[1] : (parts[0] || 'العبد');
        const mainName = parts.length > 2 ? parts.slice(2, -1).join(' ') : (parts[1] || el.text || 'میرعلی');
        const dateStr = parts.length > 1 ? parts[parts.length - 1] : '۱۴۴۷';

        let shapeElement = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="12" fill="${sealBg}" stroke="${sealBorder}" stroke-width="2.5" />`;
        if (isCircle) {
          shapeElement = `<circle cx="0" cy="0" r="${Math.min(w, h) / 2}" fill="${sealBg}" stroke="${sealBorder}" stroke-width="2.5" />`;
        } else if (isOval) {
          shapeElement = `<ellipse cx="0" cy="0" rx="${w / 2}" ry="${h / 2}" fill="${sealBg}" stroke="${sealBorder}" stroke-width="2.5" />`;
        } else if (isOctagon) {
          shapeElement = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="24" fill="${sealBg}" stroke="${sealBorder}" stroke-width="2.5" />`;
        } else if (isSquare) {
          shapeElement = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="${sealBg}" stroke="${sealBorder}" stroke-width="2.5" />`;
        } else if (isArch) {
          shapeElement = `<path d="M ${-w/2} ${h/2} L ${-w/2} ${-h/4} A ${w/2} ${h/2} 0 0 1 ${w/2} ${-h/4} L ${w/2} ${h/2} Z" fill="${sealBg}" stroke="${sealBorder}" stroke-width="2.5" />`;
        }

        return `
          <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation}) scale(${el.scaleX}, ${el.scaleY})" opacity="${el.opacity}">
            ${shapeElement}
            <text x="0" y="${-h * 0.18}" font-family="IranNastaliq, 'Noto Nastaliq Urdu', serif" font-size="12px" fill="${sealTextColor}" text-anchor="middle" direction="rtl">${prefix}</text>
            <text x="0" y="${h * 0.1}" font-family="Amiri, 'Scheherazade New', serif" font-size="18px" font-weight="bold" fill="${sealTextColor}" text-anchor="middle" direction="rtl">${mainName}</text>
            <text x="0" y="${h * 0.32}" font-family="Vazirmatn, sans-serif" font-size="10px" fill="${sealTextColor}" text-anchor="middle" opacity="0.85">${dateStr}</text>
          </g>
        `;
      }

      // 3. Tazhib Ornaments & Borders (تذهیب و اسلیمی)
      if (el.type === 'tazhib') {
        const tazhibItem = TAZHIB_MAP.get(el.tazhibName || '');
        if (!tazhibItem) return '';
        const width = el.width || 80;
        const height = el.height || 80;
        return `
          <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation}) scale(${el.scaleX}, ${el.scaleY})" opacity="${el.opacity}">
            <g transform="translate(${-width / 2}, ${-height / 2})">
              <svg width="${width}" height="${height}" viewBox="${tazhibItem.viewBox}">
                <path d="${tazhibItem.path}" fill="${el.color || tazhibItem.defaultColor || '#d97706'}" />
              </svg>
            </g>
          </g>
        `;
      }

      // 4. Calligraphy Text / Word / Letter / Tashkeel
      const textToRender = el.kashidaLevel ? applyKashida(el.text || '', el.kashidaLevel) : (el.text || '');
      const filterAttr = el.shadowBlur ? `filter="drop-shadow(${el.shadowOffsetX || 2}px ${el.shadowOffsetY || 2}px ${el.shadowBlur || 4}px ${el.shadowColor || '#000000'})"` : '';
      const fillVal = el.goldEffect ? 'url(#goldTextGrad)' : el.color;

      // Curved Text (انحنای متن)
      if (el.curveType && el.curveType !== 'none') {
        const curveDef = generateTextCurvePath(el.curveType, el.curvature || 50, el.width || 260, el.height || 80);
        return `
          <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation}) scale(${el.scaleX}, ${el.scaleY})" opacity="${el.opacity}">
            <defs>
              <path id="${curveDef.pathId}_${el.id}" d="${curveDef.pathD}" fill="none" />
            </defs>
            <text font-family="${el.fontFamily || 'IranNastaliq, serif'}" font-size="${el.fontSize}px" fill="${fillVal}" direction="rtl" ${filterAttr}>
              <textPath href="#${curveDef.pathId}_${el.id}" startOffset="50%" text-anchor="middle">
                ${textToRender}
              </textPath>
            </text>
          </g>
        `;
      }

      // Standard Multiline or Single Line Calligraphy text
      const lines = textToRender.split('\n');
      const textLinesSvg = lines.map((line, idx) => {
        const dy = idx === 0 ? '0' : '1.2em';
        return `<tspan x="0" dy="${dy}">${line}</tspan>`;
      }).join('');

      return `
        <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation}) scale(${el.scaleX}, ${el.scaleY})" opacity="${el.opacity}">
          <text 
            x="0" 
            y="${el.baselineShift || 0}" 
            font-family="${el.fontFamily || 'IranNastaliq, serif'}" 
            font-size="${el.fontSize}px" 
            fill="${fillVal}" 
            direction="rtl"
            text-anchor="middle"
            dominant-baseline="central"
            ${filterAttr}
          >
            ${textLinesSvg}
          </text>
        </g>
      `;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasWidth} ${canvasHeight}" width="${canvasWidth}" height="${canvasHeight}" dir="rtl">
  <defs>
    <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde68a" />
      <stop offset="35%" stop-color="#f59e0b" />
      <stop offset="70%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&amp;family=Aref+Ruqaa:wght@400;700&amp;family=Gulzar&amp;family=Lateef:wght@300;400;600;700;800&amp;family=Noto+Nastaliq+Urdu:wght@400;500;600;700&amp;family=Reem+Kufi:wght@400;500;600;700&amp;family=Scheherazade+New:wght@400;500;600;700&amp;family=Vazirmatn:wght@300;400;500;600;700;800;900&amp;display=swap');
    @font-face {
      font-family: 'IranNastaliq';
      src: url('https://cdn.jsdelivr.net/gh/rastikerdar/iran-nastaliq-webfont@v1.0.0/dist/IranNastaliq.woff2') format('woff2');
    }
    text {
      user-select: none;
    }
  </style>
  ${bgDef}
  ${borderSvg}
  ${elementsSvg}
</svg>`;
}

// Specialized CAM / Laser CNC Export (Hairline pure vector outlines, zero fills)
export function exportToCamCncSvg(project: KelkProject): string {
  const { canvasWidth, canvasHeight, elements } = project;

  const outlines = elements
    .filter(el => el.isVisible !== false)
    .map(el => {
      if (el.type === 'stroke' && el.strokeData) {
        const path = generateReedPenRibbonPath(el.strokeData.points, el.strokeData.nibAngle, el.strokeData.nibWidth);
        return `<path d="${path}" fill="none" stroke="#ff0000" stroke-width="0.1" />`;
      }
      if (el.type === 'tazhib') {
        const item = TAZHIB_MAP.get(el.tazhibName || '');
        if (!item) return '';
        const w = el.width || 80;
        const h = el.height || 80;
        return `
          <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation}) scale(${el.scaleX}, ${el.scaleY})">
            <g transform="translate(${-w / 2}, ${-h / 2})">
              <svg width="${w}" height="${h}" viewBox="${item.viewBox}">
                <path d="${item.path}" fill="none" stroke="#ff0000" stroke-width="0.1" />
              </svg>
            </g>
          </g>
        `;
      }
      const textToRender = el.kashidaLevel ? applyKashida(el.text || '', el.kashidaLevel) : (el.text || '');
      return `
        <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation}) scale(${el.scaleX}, ${el.scaleY})">
          <text 
            x="0" 
            y="${el.baselineShift || 0}" 
            font-family="${el.fontFamily || 'IranNastaliq, serif'}" 
            font-size="${el.fontSize}px" 
            fill="none" 
            stroke="#ff0000" 
            stroke-width="0.2"
            direction="rtl"
            text-anchor="middle"
            dominant-baseline="central"
          >
            ${textToRender}
          </text>
        </g>
      `;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Production-Ready CAM / Laser / CNC Cut File (0.1mm Hairline Cut Paths) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasWidth} ${canvasHeight}" width="${canvasWidth}" height="${canvasHeight}" dir="rtl">
  <rect width="100%" height="100%" fill="none" stroke="#0000ff" stroke-width="0.1" />
  <g id="CNC_CUT_LAYER">
    ${outlines}
  </g>
</svg>`;
}

// Specialized Silk Screen & Hot Foil Color Separation (تفکیک رنگ و فیلم لیتوگرافی)
export function exportColorSeparationSvg(
  project: KelkProject, 
  layerName: 'black_ink' | 'gold_foil' | 'red_seal' | 'blue_tazhib'
): string {
  const { canvasWidth, canvasHeight, elements } = project;

  // Filter elements matching the selected separation layer
  const filteredElements = elements.filter(el => {
    if (el.isVisible === false) return false;
    const isGold = el.goldEffect || (el.color && (el.color.includes('d97706') || el.color.includes('f59e0b') || el.color.includes('amber')));
    const isRed = el.type === 'seal' || (el.color && (el.color.includes('991b1b') || el.color.includes('red') || el.color.includes('c2410c')));
    const isBlue = el.color && (el.color.includes('1e3a8a') || el.color.includes('0284c7') || el.color.includes('blue'));

    if (layerName === 'gold_foil') return isGold;
    if (layerName === 'red_seal') return isRed;
    if (layerName === 'blue_tazhib') return isBlue;
    // Default black ink: everything else
    return !isGold && !isRed && !isBlue;
  });

  // Solid 100% black film output with alignment crosshairs (رجیستر چاپ)
  const crosshairs = `
    <g id="RegistrationCrosshairs" stroke="#000000" stroke-width="0.8">
      <circle cx="20" cy="20" r="10" fill="none" />
      <line x1="10" y1="20" x2="30" y2="20" />
      <line x1="20" y1="10" x2="20" y2="30" />
      <circle cx="${canvasWidth - 20}" cy="20" r="10" fill="none" />
      <line x1="${canvasWidth - 30}" y1="20" x2="${canvasWidth - 10}" y2="20" />
      <line x1="${canvasWidth - 20}" y1="10" x2="${canvasWidth - 20}" y2="30" />
      <circle cx="20" cy="${canvasHeight - 20}" r="10" fill="none" />
      <line x1="10" y1="${canvasHeight - 20}" x2="30" y2="${canvasHeight - 20}" />
      <line x1="20" y1="${canvasHeight - 30}" x2="20" y2="${canvasHeight - 10}" />
      <circle cx="${canvasWidth - 20}" cy="${canvasHeight - 20}" r="10" fill="none" />
      <line x1="${canvasWidth - 30}" y1="${canvasHeight - 20}" x2="${canvasWidth - 10}" y2="${canvasHeight - 20}" />
      <line x1="${canvasWidth - 20}" y1="${canvasHeight - 30}" x2="${canvasWidth - 20}" y2="${canvasHeight - 10}" />
    </g>
  `;

  const layerContent = filteredElements.map(el => {
    if (el.type === 'stroke' && el.strokeData) {
      const path = generateReedPenRibbonPath(el.strokeData.points, el.strokeData.nibAngle, el.strokeData.nibWidth);
      return `<path d="${path}" fill="#000000" />`;
    }
    if (el.type === 'tazhib') {
      const item = TAZHIB_COLLECTION.find(t => t.id === el.tazhibName || t.name === el.tazhibName);
      if (!item) return '';
      const w = el.width || 80;
      const h = el.height || 80;
      return `
        <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation}) scale(${el.scaleX}, ${el.scaleY})">
          <g transform="translate(${-w / 2}, ${-h / 2})">
            <svg width="${w}" height="${h}" viewBox="${item.viewBox}">
              <path d="${item.path}" fill="#000000" />
            </svg>
          </g>
        </g>
      `;
    }
    const textToRender = el.kashidaLevel ? applyKashida(el.text || '', el.kashidaLevel) : (el.text || '');
    return `
      <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation}) scale(${el.scaleX}, ${el.scaleY})">
        <text 
          x="0" 
          y="${el.baselineShift || 0}" 
          font-family="${el.fontFamily || 'IranNastaliq, serif'}" 
          font-size="${el.fontSize}px" 
          fill="#000000" 
          direction="rtl"
          text-anchor="middle"
          dominant-baseline="central"
        >
          ${textToRender}
        </text>
      </g>
    `;
  }).join('\n');

  const layerTitles: Record<string, string> = {
    black_ink: 'فیلم زینک مرکب مشکی (Black Film)',
    gold_foil: 'کلیشه داغی طلاکوب (Gold Foil Stamp)',
    red_seal: 'زینک شنگرف و مهر قرمز (Crimson Seal)',
    blue_tazhib: 'زینک لاجورد تذهیب (Azure Film)',
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Silk Screen & Litho Print Film: ${layerTitles[layerName]} -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasWidth} ${canvasHeight}" width="${canvasWidth}" height="${canvasHeight}" dir="rtl">
  <rect width="100%" height="100%" fill="#ffffff" />
  ${crosshairs}
  <text x="35" y="30" font-family="sans-serif" font-size="10px" fill="#000000">${layerTitles[layerName]}</text>
  <g id="PRINT_FILM_LAYER">
    ${layerContent}
  </g>
</svg>`;
}

// Copy vector SVG directly to system clipboard for instant paste into Adobe Illustrator / Photoshop
export async function copySvgToClipboard(svgString: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const textBlob = new Blob([svgString], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/svg+xml': blob,
          'text/plain': textBlob,
        })
      ]);
      return true;
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(svgString);
      return true;
    }
  } catch (err) {
    console.warn('Direct image/svg+xml clipboard write failed, falling back to text:', err);
    try {
      await navigator.clipboard.writeText(svgString);
      return true;
    } catch (fallbackErr) {
      console.error('Clipboard copy failed:', fallbackErr);
      return false;
    }
  }
  return false;
}

// Weld / Join multiple words or characters into a single compound ligature element
export function weldElements(elementsToWeld: CanvasElement[]): CanvasElement | null {
  if (elementsToWeld.length < 2) return null;

  // Sort by X descending (RTL order: rightmost first)
  const sorted = [...elementsToWeld].sort((a, b) => b.x - a.x);
  
  const mergedText = sorted.map(el => el.text || '').join(' ');
  const minX = Math.min(...sorted.map(el => el.x));
  const maxX = Math.max(...sorted.map(el => el.x));
  const avgY = Math.round(sorted.reduce((acc, el) => acc + el.y, 0) / sorted.length);
  const primaryEl = sorted[0];

  const weldedElement: CanvasElement = {
    ...primaryEl,
    id: `welded_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: `اتصال پیوسته: ${mergedText}`,
    type: 'word',
    text: mergedText,
    x: Math.round((minX + maxX) / 2),
    y: avgY,
    isWelded: true,
    weldedFromIds: sorted.map(el => el.id),
  };

  return weldedElement;
}

// Helper: draw rounded rectangle on Canvas 2D
function drawCanvasRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * High-performance, 100% reliable direct Canvas 2D renderer for Kelk Calligraphy projects.
 * Renders background textures, borders, text, kashida, tazhib ornaments, seals, and strokes directly
 * without any external SVG Image CORS or rasterization bugs.
 */
export async function renderProjectToCanvas(
  project: KelkProject,
  scale: number = 2,
  transparentBg: boolean = false,
  onProgress?: (progress: number, status: string) => void
): Promise<HTMLCanvasElement> {
  onProgress?.(5, 'در حال آماده‌سازی و اعتبارسنجی قلم‌ها...');
  // Ensure all registered custom fonts and system fonts are active and ready
  await FontLifecycleManager.ensureAllActive();
  await FontLifecycleManager.ready();

  onProgress?.(20, 'در حال رندر کادرها و بافت پس‌زمینه...');
  const { canvasWidth, canvasHeight, elements, backgroundColor, paperTexture, frameBorder, ebruSettings } = project;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(canvasWidth * scale);
  canvas.height = Math.round(canvasHeight * scale);

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    throw new Error('Canvas 2D context not supported');
  }

  // Scale for ultra-high DPI output (1x, 2x, 4K)
  ctx.scale(scale, scale);

  // 1. Draw Background
  if (!transparentBg) {
    if (paperTexture === 'parchment') {
      const grad = ctx.createRadialGradient(
        canvasWidth / 2, canvasHeight / 2, 20,
        canvasWidth / 2, canvasHeight / 2, Math.max(canvasWidth, canvasHeight) * 0.75
      );
      grad.addColorStop(0, '#fffef5');
      grad.addColorStop(0.65, '#f5ecda');
      grad.addColorStop(1, '#ebd8b5');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (paperTexture === 'gold_fleck') {
      const grad = ctx.createRadialGradient(
        canvasWidth / 2, canvasHeight / 2, 30,
        canvasWidth / 2, canvasHeight / 2, Math.max(canvasWidth, canvasHeight) * 0.8
      );
      grad.addColorStop(0, '#fffef9');
      grad.addColorStop(1, '#f7edd8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Gold Flecks
      ctx.fillStyle = 'rgba(217, 119, 6, 0.35)';
      const step = 80;
      for (let x = 20; x < canvasWidth; x += step) {
        for (let y = 20; y < canvasHeight; y += step) {
          const offsetX = ((x * 17) % 40) - 20;
          const offsetY = ((y * 23) % 40) - 20;
          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (paperTexture === 'dark_velvet') {
      const grad = ctx.createRadialGradient(
        canvasWidth / 2, canvasHeight / 2, 40,
        canvasWidth / 2, canvasHeight / 2, Math.max(canvasWidth, canvasHeight) * 0.85
      );
      grad.addColorStop(0, '#15233c');
      grad.addColorStop(1, '#080d18');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (paperTexture === 'kraft') {
      ctx.fillStyle = '#edd8b4';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (paperTexture === 'marble_black') {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (paperTexture === 'custom_ebru' && ebruSettings) {
      const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      grad.addColorStop(0, ebruSettings.primaryColor || '#0f172a');
      grad.addColorStop(0.5, ebruSettings.secondaryColor || '#881337');
      grad.addColorStop(1, ebruSettings.accentColor || '#d97706');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else {
      ctx.fillStyle = backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  }

  // 2. Draw Frame Borders
  if (frameBorder === 'classic_gold') {
    ctx.save();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, canvasWidth - 32, canvasHeight - 32);
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(22, 22, canvasWidth - 44, canvasHeight - 44);
    ctx.restore();
  } else if (frameBorder === 'tazhib_full') {
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, canvasWidth - 48, canvasHeight - 48);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 2]);
    ctx.strokeRect(32, 32, canvasWidth - 64, canvasHeight - 64);
    ctx.setLineDash([]);

    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.strokeRect(38, 38, canvasWidth - 76, canvasHeight - 76);

    // Corner Gold Diamonds
    ctx.fillStyle = '#f59e0b';
    const drawDiamond = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      ctx.fill();
    };
    drawDiamond(24, 24, 6);
    drawDiamond(canvasWidth - 24, 24, 6);
    drawDiamond(24, canvasHeight - 24, 6);
    drawDiamond(canvasWidth - 24, canvasHeight - 24, 6);
    ctx.restore();
  } else if (frameBorder === 'chlipa_traditional') {
    ctx.save();
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 32, canvasWidth - 64, canvasHeight - 64);

    ctx.strokeStyle = 'rgba(180, 83, 9, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 36, canvasWidth - 72, canvasHeight - 72);

    ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(52, 52, canvasWidth - 104, canvasHeight - 104);
    ctx.restore();
  } else if (frameBorder === 'minimal_double') {
    ctx.save();
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, canvasWidth - 40, canvasHeight - 40);
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 0.75;
    ctx.strokeRect(24, 24, canvasWidth - 48, canvasHeight - 48);
    ctx.restore();
  }

  // 3. Render Canvas Elements (sorted by zIndex)
  const sortedElements = [...elements]
    .filter(el => el.isVisible !== false)
    .sort((a, b) => a.zIndex - b.zIndex);

  const totalElements = sortedElements.length;
  for (let idx = 0; idx < totalElements; idx++) {
    const el = sortedElements[idx];
    if (idx % 10 === 0 && totalElements > 0) {
      const pct = Math.round(30 + ((idx / totalElements) * 65));
      onProgress?.(pct, `در حال رندر اجزا و کلمات (${idx + 1}/${totalElements})...`);
      // Yield to event loop for silky smooth UI
      await new Promise(r => setTimeout(r, 0));
    }
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.rotate(((el.rotation || 0) * Math.PI) / 180);
    ctx.scale(el.scaleX ?? 1, el.scaleY ?? 1);
    ctx.globalAlpha = el.opacity ?? 1;

    // 3.1 Freehand Reed Pen Stroke
    if (el.type === 'stroke' && el.strokeData) {
      const ribbonPath = generateReedPenRibbonPath(
        el.strokeData.points,
        el.strokeData.nibAngle,
        el.strokeData.nibWidth
      );
      const path2d = new Path2D(ribbonPath);
      if (el.strokeData.goldEffect) {
        const grad = ctx.createLinearGradient(-100, -50, 100, 50);
        grad.addColorStop(0, '#fde68a');
        grad.addColorStop(0.35, '#f59e0b');
        grad.addColorStop(0.7, '#d97706');
        grad.addColorStop(1, '#b45309');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = el.strokeData.color || '#18181b';
      }
      ctx.fill(path2d);
    }
    // 3.2 Traditional Seal Stamp
    else if (el.type === 'seal' || (el.type === 'tazhib' && (el.tazhibName?.includes('seal') || el.tazhibName?.startsWith('seal_') || el.tazhibName?.startsWith('royal_seal_')))) {
      const tag = el.tazhibName || '';
      const isPositive = tag.includes('positive');
      const isCircle = tag.includes('circle');
      const isSquare = tag.includes('square');
      const isOctagon = tag.includes('octagon');
      const isArch = tag.includes('arch');
      const isOval = !isCircle && !isSquare && !isOctagon && !isArch;

      const w = el.width || 120;
      const h = el.height || 90;

      let sealBg = '#991b1b';
      let sealBorder = '#f87171';
      let sealTextColor = '#fef2f2';

      if (tag.includes('agate_gold')) {
        sealBg = '#451a03';
        sealBorder = '#ca8a04';
        sealTextColor = '#fde047';
      } else if (tag.includes('brass_qajar')) {
        sealBg = '#b45309';
        sealBorder = '#fef08a';
        sealTextColor = '#18181b';
      } else if (tag.includes('lapis_royal')) {
        sealBg = '#1e3a8a';
        sealBorder = '#60a5fa';
        sealTextColor = '#f0fdf4';
      } else if (tag.includes('charcoal_black')) {
        sealBg = '#18181b';
        sealBorder = '#52525b';
        sealTextColor = '#faf5e8';
      } else if (tag.includes('emerald_green')) {
        sealBg = '#065f46';
        sealBorder = '#34d399';
        sealTextColor = '#fef08a';
      }

      if (isPositive) {
        sealBg = '#faf5e8';
        sealTextColor = sealBorder;
      }

      ctx.fillStyle = sealBg;
      ctx.strokeStyle = sealBorder;
      ctx.lineWidth = 2.5;

      if (isCircle) {
        const r = Math.min(w, h) / 2;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, r - 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = isPositive ? 'rgba(24, 24, 27, 0.3)' : 'rgba(254, 243, 199, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (isOval) {
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(0, 0, (w / 2) - 3.5, (h / 2) - 3.5, 0, 0, Math.PI * 2);
        ctx.strokeStyle = isPositive ? 'rgba(24, 24, 27, 0.3)' : 'rgba(254, 243, 199, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (isOctagon) {
        drawCanvasRoundedRect(ctx, -w / 2, -h / 2, w, h, 20);
        ctx.fill();
        ctx.stroke();
      } else if (isSquare) {
        drawCanvasRoundedRect(ctx, -w / 2, -h / 2, w, h, 8);
        ctx.fill();
        ctx.stroke();
      } else {
        drawCanvasRoundedRect(ctx, -w / 2, -h / 2, w, h, 12);
        ctx.fill();
        ctx.stroke();
      }

      const parts = (el.text || '').split(' ');
      const prefix = parts.length > 2 ? parts[0] + ' ' + parts[1] : (parts[0] || 'العبد');
      const mainName = parts.length > 2 ? parts.slice(2, -1).join(' ') : (parts[1] || el.text || 'میرعلی');
      const dateStr = parts.length > 1 ? parts[parts.length - 1] : '۱۴۴۷';

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';
      ctx.fillStyle = sealTextColor;

      ctx.font = '12px IranNastaliq, "Noto Nastaliq Urdu", Gulzar, serif';
      ctx.fillText(prefix, 0, -h * 0.2);

      ctx.font = 'bold 18px Amiri, "Scheherazade New", serif';
      ctx.fillText(mainName, 0, h * 0.08);

      ctx.font = '10px Vazirmatn, sans-serif';
      ctx.fillText(dateStr, 0, h * 0.32);
    }
    // 3.3 Tazhib Ornament
    else if (el.type === 'tazhib') {
      const item = TAZHIB_COLLECTION.find(t => t.id === el.tazhibName || t.name === el.tazhibName);
      if (item) {
        const w = el.width || 80;
        const h = el.height || 80;
        const path2d = new Path2D(item.path);

        const vbParts = item.viewBox.split(' ').map(Number);
        const vbW = vbParts[2] || 100;
        const vbH = vbParts[3] || 100;

        ctx.translate(-w / 2, -h / 2);
        ctx.scale(w / vbW, h / vbH);
        ctx.fillStyle = el.color || item.defaultColor || '#d97706';
        ctx.fill(path2d);
      }
    }
    // 3.4 Calligraphy Text / Words / Tashkeel / Dots
    else {
      let rawText = el.kashidaLevel || el.dotKashidaUnits
        ? applyKashida(el.text || '', el.kashidaLevel || 0, el.dotKashidaUnits)
        : (el.text || '');

      // Dot arrangement
      if (el.dotArrangement === 'hidden') {
        const dotlessMap: Record<string, string> = {
          'ب': 'ٮ', 'پ': 'ٮ', 'ت': 'ٮ', 'ث': 'ٮ',
          'ج': 'ح', 'چ': 'ح', 'خ': 'ح',
          'ذ': 'د', 'ز': 'ر', 'ژ': 'ر',
          'ش': 'س', 'ض': 'ص', 'ظ': 'ط',
          'غ': 'ع', 'ف': 'ڡ', 'ق': 'ٯ',
          'ک': 'ک', 'گ': 'ک', 'ن': 'ں',
          'ی': 'ى', 'ئ': 'ى', 'ي': 'ى',
        };
        rawText = rawText.replace(/[بتپثجچخذرزژشضظغفقنگيیئة]/g, (ch) => dotlessMap[ch] || ch)
          .replace(/[\u064B-\u065F\u0670]/g, '');
      }
      const textContent = rawText;

      // Shadows
      if (el.shadowBlur) {
        ctx.shadowColor = el.shadowColor || 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = el.shadowBlur;
        ctx.shadowOffsetX = el.shadowOffsetX || 2;
        ctx.shadowOffsetY = el.shadowOffsetY || 2;
      }

      // Color or Texture Gradient
      if (el.textureFill === 'gold_leaf' || el.goldEffect) {
        const grad = ctx.createLinearGradient(-100, -50, 100, 50);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.35, '#eab308');
        grad.addColorStop(0.7, '#ca8a04');
        grad.addColorStop(1, '#854d0e');
        ctx.fillStyle = grad;
      } else if (el.textureFill === 'lapis_lazuli') {
        const grad = ctx.createLinearGradient(-100, -50, 100, 50);
        grad.addColorStop(0, '#1e3a8a');
        grad.addColorStop(0.4, '#172554');
        grad.addColorStop(0.45, '#fbbf24');
        grad.addColorStop(1, '#1e40af');
        ctx.fillStyle = grad;
      } else if (el.textureFill === 'marble_veins') {
        const grad = ctx.createLinearGradient(-100, -50, 100, 50);
        grad.addColorStop(0, '#f8fafc');
        grad.addColorStop(0.5, '#94a3b8');
        grad.addColorStop(1, '#334155');
        ctx.fillStyle = grad;
      } else if (el.textureFill === 'mother_of_pearl') {
        const grad = ctx.createLinearGradient(-100, -50, 100, 50);
        grad.addColorStop(0, '#ccfbf1');
        grad.addColorStop(0.4, '#fbcfe8');
        grad.addColorStop(0.7, '#fef08a');
        grad.addColorStop(1, '#bae6fd');
        ctx.fillStyle = grad;
      } else if (el.textureFill === 'copper_patina') {
        const grad = ctx.createLinearGradient(-100, -50, 100, 50);
        grad.addColorStop(0, '#b45309');
        grad.addColorStop(0.4, '#78350f');
        grad.addColorStop(0.75, '#0d9488');
        grad.addColorStop(1, '#042f2e');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = el.color || '#18181b';
      }

      const fontFam = el.fontFamily || 'IranNastaliq, "Noto Nastaliq Urdu", Gulzar, serif';
      const fontSize = el.fontSize || 40;
      ctx.font = `${fontSize}px ${fontFam}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';

      const lines = textContent.split('\n');
      const lineHeight = fontSize * 1.22;
      const totalH = lines.length * lineHeight;
      const startY = (el.baselineShift || 0) - (totalH / 2) + (lineHeight / 2);

      const renderLines = () => {
        lines.forEach((line, idx) => {
          if (el.outlineEnabled && el.outlineWidth) {
            ctx.lineWidth = el.outlineWidth;
            ctx.strokeStyle = el.outlineColor || '#f59e0b';
            ctx.strokeText(line, 0, startY + (idx * lineHeight));
          }
          ctx.fillText(line, 0, startY + (idx * lineHeight));
        });
      };

      // Draw primary text
      renderLines();

      // Draw symmetry twins if enabled
      if (el.symmetryMode === 'horizontal_mirror') {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(- (el.symmetryGap || 40), 0);
        renderLines();
        ctx.restore();
      } else if (el.symmetryMode === 'vertical_mirror') {
        ctx.save();
        ctx.scale(1, -1);
        ctx.translate(0, - (fontSize * 1.1 + (el.symmetryGap || 40)));
        renderLines();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  return canvas;
}

// Update anchored diacritics / tashkeel when parent element moves or changes
export function updateAnchoredElements(
  elements: CanvasElement[], 
  parentId: string, 
  newParentX: number, 
  newParentY: number,
  deltaX: number,
  deltaY: number
): CanvasElement[] {
  return elements.map(el => {
    if (el.parentAnchorId === parentId) {
      return {
        ...el,
        x: el.x + deltaX,
        y: el.y + deltaY,
      };
    }
    return el;
  });
}



