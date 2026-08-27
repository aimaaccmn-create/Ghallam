import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  BookOpen, 
  Feather, 
  FileText,
  Loader2
} from 'lucide-react';
import { CalligraphyScript, CanvasElement, PoetryVerse } from '../types/calligraphy';
import { CLASSICAL_POEMS } from '../data/poemsDatabase';
import { SCRIPT_FONT_MAP } from '../utils/calligraphyEngine';

interface PoetryAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertVerse: (verse: PoetryVerse, format: 'single_line' | 'chlipa' | 'siah_mashq') => void;
  currentScript: CalligraphyScript;
  currentCanvasElements: CanvasElement[];
}

export const PoetryAiModal: React.FC<PoetryAiModalProps> = React.memo(({
  isOpen,
  onClose,
  onInsertVerse,
  currentScript,
  currentCanvasElements,
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'ai_suggest' | 'auto_tashkeel' | 'advisor'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoetFilter, setSelectedPoetFilter] = useState('همه');
  const [selectedThemeFilter, setSelectedThemeFilter] = useState('همه');

  // AI Suggest States
  const [aiTheme, setAiTheme] = useState('');
  const [aiPoet, setAiPoet] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<PoetryVerse[]>([]);

  // Auto Tashkeel States
  const [tashkeelInput, setTashkeelInput] = useState('');
  const [tashkeelOutput, setTashkeelOutput] = useState('');
  const [tashkeelLoading, setTashkeelLoading] = useState(false);

  // Composition Advisor States
  const [advisorInput, setAdvisorInput] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorResult, setAdvisorResult] = useState<any>(null);

  // Filter poems with useMemo
  const filteredPoems = useMemo(() => {
    return CLASSICAL_POEMS.filter(poem => {
      const matchesPoet = selectedPoetFilter === 'همه' || poem.poet.includes(selectedPoetFilter);
      const matchesTheme = selectedThemeFilter === 'همه' || poem.theme.includes(selectedThemeFilter);
      const matchesQuery = !searchQuery ||
        poem.verse1.includes(searchQuery) ||
        poem.verse2.includes(searchQuery) ||
        poem.theme.includes(searchQuery) ||
        poem.source.includes(searchQuery);
      return matchesPoet && matchesTheme && matchesQuery;
    });
  }, [selectedPoetFilter, selectedThemeFilter, searchQuery]);

  if (!isOpen) return null;

  // Call Gemini AI for poetry suggestion
  const handleGeneratePoems = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/calligraphy/suggest-poems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: aiTheme, poet: aiPoet }),
      });
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        setAiResults(data.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Call Auto Tashkeel
  const handleAutoTashkeel = async () => {
    if (!tashkeelInput.trim()) return;
    setTashkeelLoading(true);
    try {
      const res = await fetch('/api/calligraphy/auto-tashkeel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: tashkeelInput, scriptType: SCRIPT_FONT_MAP[currentScript].name }),
      });
      const data = await res.json();
      if (data.tashkeelText) {
        setTashkeelOutput(data.tashkeelText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTashkeelLoading(false);
    }
  };

  // Call Composition Advisor
  const handleAnalyzeComposition = async () => {
    const textToAnalyze = advisorInput || currentCanvasElements.map(e => e.text).filter(Boolean).join(' ');
    if (!textToAnalyze) return;
    setAdvisorLoading(true);
    try {
      const res = await fetch('/api/calligraphy/composition-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: textToAnalyze, 
          script: SCRIPT_FONT_MAP[currentScript].name,
          layout: 'چلیپای سنتی'
        }),
      });
      const data = await res.json();
      setAdvisorResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAdvisorLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md select-none font-vazir animate-in fade-in">
      <div className="bg-neutral-950 border border-amber-500/30 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-neutral-100">گنجینه شعر، اعراب‌گذاری و مشاور ترکیب هوشمند</h2>
              <p className="text-xs text-neutral-400">جستجوی ابیات فاخر، پیشنهاد هوش مصنوعی Gemini و ترکیب‌بندی چلیپا</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-900/40 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('library')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'library'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>گنجینه اشعار کلاسیک</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_suggest')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ai_suggest'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>پیشنهاد هوشمند ابیات (Gemini)</span>
          </button>

          <button
            onClick={() => setActiveTab('auto_tashkeel')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'auto_tashkeel'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>اعراب‌گذاری خودکار کلمات</span>
          </button>

          <button
            onClick={() => setActiveTab('advisor')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'advisor'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Feather className="w-4 h-4" />
            <span>مشاور ترکیب‌بندی چلیپا</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* ================= TAB 1: POETRY LIBRARY ================= */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              {/* Search & Poet Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو در متن شعر، شاعر یا مضمون..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pr-10 pl-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-neutral-200"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                  {['همه', 'حافظ', 'سعدی', 'مولانا', 'فردوسی', 'خیام', 'قرآن'].map((poet) => (
                    <button
                      key={poet}
                      onClick={() => setSelectedPoetFilter(poet)}
                      className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                        selectedPoetFilter === poet
                          ? 'bg-amber-600/30 text-amber-300 border-amber-500/50 font-semibold'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {poet}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme & Topic Tags Row */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                <span className="text-neutral-500 shrink-0 ml-1">مضمون:</span>
                {[
                  { id: 'همه', label: 'همه مضامین' },
                  { id: 'عارفانه', label: 'عرفانی و سلوک' },
                  { id: 'عشق', label: 'عاشقانه و وصال' },
                  { id: 'اخلاق', label: 'پند و حکمت' },
                  { id: 'حماسی', label: 'حماسی و ملی' },
                  { id: 'بهار', label: 'بهار و طراوت' },
                  { id: 'نیایش', label: 'نیایش و معنویت' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setSelectedThemeFilter(th.id)}
                    className={`px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap ${
                      selectedThemeFilter === th.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                        : 'bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>

              {/* Poetry Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredPoems.map((poem, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all hover:shadow-lg"
                  >
                    <div>
                      <div className="flex justify-between items-center text-[11px] text-amber-400/90 mb-2">
                        <span className="font-semibold">{poem.poet} • {poem.source}</span>
                        <span className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">{poem.theme}</span>
                      </div>
                      <div className="space-y-1 text-neutral-100 font-nastaliq text-base leading-relaxed">
                        <p>{poem.verse1}</p>
                        <p>{poem.verse2}</p>
                      </div>
                    </div>

                    {/* Insert Actions */}
                    <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-1.5 text-xs">
                      <button
                        onClick={() => {
                          onInsertVerse(poem, 'single_line');
                          onClose();
                        }}
                        className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-[11px] font-vazir text-center transition-all"
                      >
                        درج سطر
                      </button>
                      <button
                        onClick={() => {
                          onInsertVerse(poem, 'chlipa');
                          onClose();
                        }}
                        className="flex-1 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-vazir text-center transition-all"
                      >
                        قالب چلیپا
                      </button>
                      <button
                        onClick={() => {
                          onInsertVerse(poem, 'siah_mashq');
                          onClose();
                        }}
                        className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-[11px] font-vazir text-center transition-all"
                      >
                        سیاه‌مشق
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 2: AI SUGGEST ================= */}
          {activeTab === 'ai_suggest' && (
            <div className="space-y-5">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">موضوع یا حس و حال شعر:</label>
                    <input
                      type="text"
                      value={aiTheme}
                      onChange={(e) => setAiTheme(e.target.value)}
                      placeholder="مثال: فراق و صبوری، نوروز، حکمت..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">شاعر مورد نظر (اختیاری):</label>
                    <input
                      type="text"
                      value={aiPoet}
                      onChange={(e) => setAiPoet(e.target.value)}
                      placeholder="مثال: حافظ، سعدی، مولانا..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <button
                  onClick={handleGeneratePoems}
                  disabled={aiLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>یافتن ابیات متناسب با هوش مصنوعی</span>
                </button>
              </div>

              {/* AI Results */}
              {aiResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {aiResults.map((poem, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-900/90 border border-amber-500/40 rounded-xl p-4 space-y-3"
                    >
                      <div>
                        <span className="text-xs text-amber-400 font-semibold">{poem.poet} ({poem.source || 'دیوان اشعار'})</span>
                        <div className="mt-1 space-y-1 font-nastaliq text-base text-neutral-100">
                          <p>{poem.verse1}</p>
                          <p>{poem.verse2}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-neutral-800 flex items-center gap-2">
                        <button
                          onClick={() => {
                            onInsertVerse(poem, 'single_line');
                            onClose();
                          }}
                          className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs"
                        >
                          درج سطر
                        </button>
                        <button
                          onClick={() => {
                            onInsertVerse(poem, 'chlipa');
                            onClose();
                          }}
                          className="flex-1 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 rounded-lg text-xs"
                        >
                          قالب چلیپا
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: AUTO TASHKEEL ================= */}
          {activeTab === 'auto_tashkeel' && (
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                <label className="text-xs text-neutral-400 block">متن بدون اعراب را وارد کنید:</label>
                <textarea
                  value={tashkeelInput}
                  onChange={(e) => setTashkeelInput(e.target.value)}
                  placeholder="متن دلخواه جهت اعراب‌گذاری خودکار را اینجا وارد کنید..."
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  onClick={handleAutoTashkeel}
                  disabled={tashkeelLoading}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {tashkeelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  <span>اعراب‌گذاری خودکار و دقیق خوشنویسی</span>
                </button>
              </div>

              {tashkeelOutput && (
                <div className="bg-neutral-900/90 border border-amber-500/40 rounded-xl p-4 space-y-3">
                  <span className="text-xs text-amber-400 font-semibold">متن اعراب‌گذاری شده:</span>
                  <div className="p-4 bg-neutral-950 rounded-xl font-thuluth text-xl text-amber-300 text-center leading-loose">
                    {tashkeelOutput}
                  </div>
                  <button
                    onClick={() => {
                      onInsertVerse({
                        poet: '',
                        source: '',
                        verse1: tashkeelOutput,
                        verse2: '',
                        theme: '',
                        recommendedScript: currentScript
                      }, 'single_line');
                      onClose();
                    }}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs"
                  >
                    درج این عبارت در صفحه خوشنویسی
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: COMPOSITION ADVISOR ================= */}
          {activeTab === 'advisor' && (
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                <label className="text-xs text-neutral-400 block">متن مصراع یا عبارت جهت تحلیل ترکیب‌بندی:</label>
                <input
                  type="text"
                  value={advisorInput}
                  onChange={(e) => setAdvisorInput(e.target.value)}
                  placeholder="مثال: مصراع یا عبارت مورد نظر را بنویسید..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  onClick={handleAnalyzeComposition}
                  disabled={advisorLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {advisorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Feather className="w-4 h-4" />}
                  <span>تحلیل هوشمند کشیده‌ها و چیدمان کرسی</span>
                </button>
              </div>

              {advisorResult && (
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 space-y-4">
                  {advisorResult.kashidaSuggestions && (
                    <div>
                      <h4 className="text-xs font-semibold text-amber-400 mb-1">پیشنهاد جایگاه کشیده‌ها (Kashida):</h4>
                      <ul className="list-disc list-inside text-xs text-neutral-300 space-y-1">
                        {advisorResult.kashidaSuggestions.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {advisorResult.stackingAdvice && (
                    <div>
                      <h4 className="text-xs font-semibold text-amber-400 mb-1">ترتیب سوارکردن کلمات روی خط کرسی:</h4>
                      <ul className="list-disc list-inside text-xs text-neutral-300 space-y-1">
                        {advisorResult.stackingAdvice.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {advisorResult.overallTips && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 leading-relaxed">
                      <strong>توصیه کلی استاد خوشنویس: </strong>
                      {advisorResult.overallTips}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
