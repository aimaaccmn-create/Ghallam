import { PoetryVerse } from '../types/calligraphy';

export const CLASSICAL_POEMS: PoetryVerse[] = [
  // Hafez Shirazi (حافظ شیرازی)
  {
    poet: 'حافظ شیرازی',
    source: 'غزلیات حافظ',
    verse1: 'در ازل پرتو حسنت ز تجلی دم زد',
    verse2: 'عشق پیدا شد و آتش به همه عالم زد',
    theme: 'عارفانه و عشق ازلی',
    recommendedScript: 'nastaliq'
  },
  {
    poet: 'حافظ شیرازی',
    source: 'غزلیات حافظ',
    verse1: 'دوش دیدم که ملایک در میخانه زدند',
    verse2: 'گل آدم بتخمیرند و به پیمانه زدند',
    theme: 'عرفان و آفرینش',
    recommendedScript: 'nastaliq'
  },
  {
    poet: 'حافظ شیرازی',
    source: 'غزلیات حافظ',
    verse1: 'بشنو این نکته که خود را ز غم آزاده کنی',
    verse2: 'خون خوری گر طلب روزی ننهاده کنی',
    theme: 'حکمت و قناعت',
    recommendedScript: 'nastaliq'
  },
  {
    poet: 'حافظ شیرازی',
    source: 'غزلیات حافظ',
    verse1: 'مژده وصل تو کو کز سر جان برخیزم',
    verse2: 'طایر قدسم و از دام جهان برخیزم',
    theme: 'شوق پرواز و رهایی',
    recommendedScript: 'shekasteh'
  },
  {
    poet: 'حافظ شیرازی',
    source: 'غزلیات حافظ',
    verse1: 'آنان که خاک را به نظر کیمیا کنند',
    verse2: 'آیا بود که گوشه چشمی به ما کنند',
    theme: 'طلب و ارادت',
    recommendedScript: 'nastaliq'
  },

  // Saadi Shirazi (سعدی شیرازی)
  {
    poet: 'سعدی شیرازی',
    source: 'گلستان سعدی',
    verse1: 'بنی آدم اعضای یکدیگرند',
    verse2: 'که در آفرینش ز یک گوهرند',
    theme: 'انسانیت و همبستگی',
    recommendedScript: 'nastaliq'
  },
  {
    poet: 'سعدی شیرازی',
    source: 'بوستان سعدی',
    verse1: 'تن آدمی شریف است به جان آدمیت',
    verse2: 'نه همین لباس زیباست نشان آدمیت',
    theme: 'اخلاق و کرامت انسان',
    recommendedScript: 'nastaliq'
  },
  {
    poet: 'سعدی شیرازی',
    source: 'غزلیات سعدی',
    verse1: 'همه عمر برندارم سر از این خمار مستی',
    verse2: 'که هنوز من نبودم که تو در دلم نشستی',
    theme: 'عاشقانه',
    recommendedScript: 'shekasteh'
  },
  {
    poet: 'سعدی شیرازی',
    source: 'غزلیات سعدی',
    verse1: 'مشتاقی و صبوری از حد گذشت یارا',
    verse2: 'گر تو شکیب داری طاقت نماند ما را',
    theme: 'شوق دیدار',
    recommendedScript: 'shekasteh'
  },

  // Rumi / Mowlana (مولانا جلال‌الدین بلخی)
  {
    poet: 'مولانا',
    source: 'مثنوی معنوی',
    verse1: 'بشنو این نی چون شکایت می‌کند',
    verse2: 'از جدایی‌ها حکایت می‌کند',
    theme: 'نی‌نامه و اشتیاق وصال',
    recommendedScript: 'nastaliq'
  },
  {
    poet: 'مولانا',
    source: 'دیوان شمس',
    verse1: 'ای قوم به حج رفته کجایید کجایید',
    verse2: 'معشوق همین جاست بیایید بیایید',
    theme: 'شهود باطنی',
    recommendedScript: 'shekasteh'
  },
  {
    poet: 'مولانا',
    source: 'دیوان شمس',
    verse1: 'من غلام قمرم غیر قمر هیچ مگو',
    verse2: 'پیش من جز سخن شمع و شکر هیچ مگو',
    theme: 'سماع و مستی',
    recommendedScript: 'moalla'
  },
  {
    poet: 'مولانا',
    source: 'دیوان شمس',
    verse1: 'رقصی چنین میانه میدانم آرزوست',
    verse2: 'یک دست جام باده و یک دست زلف یار',
    theme: 'شور و وجد',
    recommendedScript: 'shekasteh'
  },

  // Omar Khayyam (خیام نیشابوری)
  {
    poet: 'خیام نیشابوری',
    source: 'رباعیات خیام',
    verse1: 'بر چهره گل نسیم نوروز خوش است',
    verse2: 'در صحن چمن روی دل‌افروز خوش است',
    theme: 'بهار و غنیمت دم',
    recommendedScript: 'nastaliq'
  },
  {
    poet: 'خیام نیشابوری',
    source: 'رباعیات خیام',
    verse1: 'این قافله عمر عجب می‌گذرد',
    verse2: 'دریاب دمی که با طرب می‌گذرد',
    theme: 'گذر عمر',
    recommendedScript: 'shekasteh'
  },

  // Ferdowsi (فردوسی طوسی)
  {
    poet: 'فردوسی طوسی',
    source: 'شاهنامه',
    verse1: 'توانا بود هر که دانا بود',
    verse2: 'ز دانش دل پیر برنا بود',
    theme: 'حکمت و دانش',
    recommendedScript: 'nastaliq'
  },
  {
    poet: 'فردوسی طوسی',
    source: 'شاهنامه',
    verse1: 'چو ایران نباشد تن من مباد',
    verse2: 'بدین بوم و بر زنده یک تن مباد',
    theme: 'میهن‌دوستی و حماسه',
    recommendedScript: 'nastaliq'
  },

  // Religious & Quranic Calligraphy (کتیبه‌های مذهبی و قرآنی)
  {
    poet: 'قرآن کریم',
    source: 'سوره مبارکه فاتحه',
    verse1: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    verse2: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    theme: 'کتیبه آغازین',
    recommendedScript: 'thuluth'
  },
  {
    poet: 'قرآن کریم',
    source: 'آیة الکرسی',
    verse1: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    verse2: 'لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
    theme: 'توحید و حراست',
    recommendedScript: 'thuluth'
  },
  {
    poet: 'قرآن کریم',
    source: 'سوره مبارکه نصر',
    verse1: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ',
    verse2: 'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا',
    theme: 'نصرت و فتح',
    recommendedScript: 'thuluth'
  },
  {
    poet: 'قرآن کریم',
    source: 'سوره مبارکه انشراح',
    verse1: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    verse2: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    theme: 'امید و گشایش',
    recommendedScript: 'thuluth'
  },
  {
    poet: 'حدیث شریف',
    source: 'پیامبر اکرم (ص)',
    verse1: 'عَلِيٌّ مَعَ الْحَقِّ',
    verse2: 'وَ الْحَقُّ مَعَ عَلِيٍّ',
    theme: 'ولایت و حقیقت',
    recommendedScript: 'moalla'
  },
  {
    poet: 'نهج‌البلاغه',
    source: 'امیرالمؤمنین علی (ع)',
    verse1: 'قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ',
    verse2: 'ارزش هر انسان به اندازه هنرمندی و خوبی اوست',
    theme: 'حکمت و هنر',
    recommendedScript: 'thuluth'
  },
  {
    poet: 'باباطاهر',
    source: 'دوبیتی‌های باباطاهر',
    verse1: 'ز دست دیده و دل هر دو فریاد',
    verse2: 'که هر چه دیده بیند دل کند یاد',
    theme: 'عاشقانه سوزناک',
    recommendedScript: 'shekasteh'
  },
  {
    poet: 'شهریار',
    source: 'دیوان شهریار',
    verse1: 'آمدی جانم به قربانت ولی حالا چرا',
    verse2: 'بی‌وفا حالا که من افتاده‌ام از پا چرا',
    theme: 'عاشقانه معاصر',
    recommendedScript: 'nastaliq'
  }
];
