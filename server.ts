import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI Client
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: Poetry & Quote Assistant for Calligraphy
app.post('/api/calligraphy/suggest-poems', async (req, res) => {
  try {
    const { query, theme, poet } = req.body;

    const prompt = `شما یک ادیب و کارشناس شعر و خوشنویسی اصیل ایرانی هستید.
موضوع درخواستی: ${query || theme || 'عشق و عرفان'}
شاعر درخواستی (در صورت تعیین): ${poet || 'شاعران بزرگ مانند حافظ، سعدی، مولانا، خیام، فردوسی، عطار یا صائب'}

لطفاً ۴ بیت شعر فاخر، اصیل، دلنشین و بسیار مناسب برای خوشنویسی و قطعه‌نویسی چلیپا و سیاه‌مشق پیشنهاد دهید.
خروجی باید صرفاً یک آرایه JSON معتبر باشد با فیلدهای زیر:
[
  {
    "poet": "نام شاعر",
    "source": "منبع یا دیوان",
    "verse1": "مصرع اول",
    "verse2": "مصرع دوم",
    "theme": "مضمون",
    "recommendedScript": "nastaliq یا shekasteh یا thuluth یا moalla"
  }
]
فقط آرایه JSON را بدون هیچ توضیح اضافی تولید کن.`;

    const ai = getAi();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    res.json({ results: JSON.parse(text) });
  } catch (error: any) {
    console.error('Error suggesting poems:', error);
    res.status(500).json({ error: error.message || 'خطا در دریافت پیشنهاد شعر' });
  }
});

// API: Auto-Tashkeel & Diacritics
app.post('/api/calligraphy/auto-tashkeel', async (req, res) => {
  try {
    const { text, scriptType } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'متن الزامی است.' });
    }

    const prompt = `شما یک استاد مسلط به اعراب‌گذاری ادبی و خوشنویسی خط ${scriptType || 'نستعلیق و ثلث'} هستید.
عبارت زیر را با دقت بسیار بالا، اعراب‌گذاری کامل (فتحه، کسره، ضمه، تنوین، تشدید، سکون، مد) کنید تا مناسب کتیبه‌نویسی و خطاطی گردد:
متن: "${text}"

پاسخ را فقط در قالب JSON با ساختار زیر بدهید:
{
  "tashkeelText": "متن کامل همراه با تمام حرکات و اعراب دقیق",
  "meaning": "توضیح کوتاه معنایی یا ادبی"
}
فقط JSON خروجی داده شود.`;

    const ai = getAi();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const resultText = response.text || '{}';
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error('Error in auto-tashkeel:', error);
    res.status(500).json({ error: error.message || 'خطا در اعراب‌گذاری' });
  }
});

// API: Calligraphic Composition Critique & Layout Advisor
app.post('/api/calligraphy/composition-advisor', async (req, res) => {
  try {
    const { text, layout, script } = req.body;

    const prompt = `شما یک استاد کهنه‌کار و داور مسابقات خوشنویسی نستعلیق و چلیپانویسی هستید.
قالب: "${layout || 'چلیپای سنتی'}"
قلم: "${script || 'نستعلیق'}"
متن: "${text}"

بررسی و راهنمایی دقیقی درباره جایگاه کشیده‌ها (کشیدن کدام کلمات زیباتر است و چرا)، سوار کردن کلمات روی کرسی، و تعادل سیاه و سفید صفحه ارائه دهید.
پاسخ فقط به صورت JSON باشد با ساختار زیر:
{
  "kashidaSuggestions": ["پیشنهاد ۱ برای کشیده فلان کلمه", "پیشنهاد ۲"],
  "stackingAdvice": ["توصیه برای سوار کردن کلمات روی هم", "نحوه قرارگیری روی خط کرسی"],
  "overallTips": "نکته کلیدی استاد برای اجرای این ترکیب"
}
فقط JSON تولید شود.`;

    const ai = getAi();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const resultText = response.text || '{}';
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error('Error advising composition:', error);
    res.status(500).json({ error: error.message || 'خطا در مشاوره ترکیب‌بندی' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kelk Calligraphy Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
