import React, { useState, useMemo } from 'react';
import { X, Sparkles, Search, Eye, Info, Check, Filter } from 'lucide-react';
import { ALTERNATE_GLYPHS_DATABASE, AlternateGlyph } from '../data/alternateGlyphs';
import { CalligraphyScript } from '../types/calligraphy';

interface AlternateGlyphsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGlyph: (glyph: AlternateGlyph) => void;
  selectedElementText?: string;
  currentScript: CalligraphyScript;
}

const CATEGORIES = [
  { id: 'all', label: 'همه فرم‌ها' },
  { id: 'persian_letters', label: 'حروف اصیل فارسی (گ، چ، پ، ژ، ک، ی)' },
  { id: 'persian_poetry', label: 'شاهکارهای شعر و ادب فارسی' },
  { id: 'ye_makoos', label: 'یای معکوس (برگشته)' },
  { id: 'kaf_extended', label: 'کاف و گاف کشیده' },
  { id: 'sin_kashida', label: 'سین و شین کشیده' },
  { id: 'noon_rounded', label: 'نون گرد و کشیده' },
  { id: 'meem_hanging', label: 'میم معلق' },
  { id: 'he_do_chashm', label: 'هـ دوچشم و گره' },
  { id: 'sacred_ligature', label: 'اسامی و عبارات متبرکه' },
  { id: 'calligrapher_signature', label: 'امضا و ترقیم' },
];

export const AlternateGlyphsModal: React.FC<AlternateGlyphsModalProps> = React.memo(({
  isOpen,
  onClose,
  onSelectGlyph,
  currentScript,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScriptFilter, setSelectedScriptFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredGlyph, setHoveredGlyph] = useState<AlternateGlyph | null>(null);

  const filteredGlyphs = useMemo(() => {
    return ALTERNATE_GLYPHS_DATABASE.filter(g => {
      const matchCat = selectedCategory === 'all' || g.category === selectedCategory;
      const matchScript = selectedScriptFilter === 'all' || g.script === selectedScriptFilter || g.script === 'all';
      const matchSearch = !searchQuery || 
        g.name.includes(searchQuery) || 
        g.description.includes(searchQuery) ||
        g.displaySample.includes(searchQuery);
      return matchCat && matchScript && matchSearch;
    });
  }, [selectedCategory, selectedScriptFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md select-none font-vazir animate-in fade-in">
      <div className="bg-neutral-950 border border-amber-500/30 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-neutral-100">
                فرم‌ها و اتصالات جایگزین خوشنویسی (Alternate Glyphs)
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                انتخاب یای معکوس، کاف کشیده، نون مدور و کتیبه‌های اصیل با پیش‌نمایش زنده شناور
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-850 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Search */}
        <div className="p-3 border-b border-neutral-850 space-y-2.5 bg-neutral-900/40">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در حروف، اتصالات، کلمات و عبارات..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Script filter pills */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-850 text-xs shrink-0">
              {[
                { id: 'all', label: 'همه اقلام' },
                { id: 'nastaliq', label: 'نستعلیق' },
                { id: 'shekasteh', label: 'شکسته' },
                { id: 'thuluth', label: 'ثلث' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScriptFilter(s.id)}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    selectedScriptFilter === s.id
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl border whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600/25 text-amber-300 border-amber-500 font-bold shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Grid & Live Preview Bar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Glyphs Grid */}
          <div className="flex-1 p-3.5 overflow-y-auto max-h-[52vh] md:max-h-[58vh] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredGlyphs.map(glyph => {
              const isHovered = hoveredGlyph?.id === glyph.id;
              return (
                <div
                  key={glyph.id}
                  onMouseEnter={() => setHoveredGlyph(glyph)}
                  onClick={() => {
                    onSelectGlyph(glyph);
                    onClose();
                  }}
                  className={`p-3 bg-neutral-900/90 hover:bg-neutral-850 border rounded-2xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group shadow-sm ${
                    isHovered
                      ? 'border-amber-500 ring-1 ring-amber-400/40 bg-neutral-850'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-neutral-200 group-hover:text-amber-300 transition-colors truncate">
                        {glyph.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-950 text-amber-400 font-mono border border-neutral-800">
                        {glyph.script}
                      </span>
                    </div>

                    {/* Visual Calligraphy Display Box */}
                    <div className="h-16 bg-neutral-950/90 rounded-xl flex items-center justify-center border border-neutral-850 my-1 overflow-hidden group-hover:border-amber-500/40 transition-colors">
                      <span className="text-2xl sm:text-3xl text-amber-100 font-nastaliq group-hover:scale-110 transition-transform duration-300">
                        {glyph.displaySample}
                      </span>
                    </div>

                    <p className="text-[10px] text-neutral-400 line-clamp-1 mt-1.5 leading-relaxed">
                      {glyph.description}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-amber-400/90 group-hover:text-amber-300 font-semibold">
                    <span>درج روی بوم</span>
                    <span className="text-xs group-hover:translate-x-[-3px] transition-transform">←</span>
                  </div>
                </div>
              );
            })}

            {filteredGlyphs.length === 0 && (
              <div className="col-span-full py-12 text-center text-neutral-500 text-xs">
                موردی مطابق با عبارت جستجو یافت نشد.
              </div>
            )}
          </div>

          {/* Live Hover Preview Sidebar (Feature #5) */}
          <div className="w-full md:w-64 bg-neutral-950/80 border-t md:border-t-0 md:border-r border-neutral-800 p-4 flex flex-col justify-between shrink-0">
            {hoveredGlyph ? (
              <div className="space-y-3 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>پیش‌نمایش زنده با بزرگ‌نمایی:</span>
                </div>

                {/* Magnified Stage */}
                <div className="h-32 bg-neutral-900/90 rounded-2xl border border-amber-500/40 flex items-center justify-center p-4 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1)_0%,transparent_70%)]" />
                  <span className="text-4xl sm:text-5xl text-amber-200 font-nastaliq drop-shadow-md z-10">
                    {hoveredGlyph.displaySample}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-neutral-100">{hoveredGlyph.name}</h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    {hoveredGlyph.description}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">قلم مرجع:</span>
                    <span className="font-mono text-amber-300">{hoveredGlyph.script}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">خروجی:</span>
                    <span className="text-emerald-400 font-semibold">وکتور بدون افت کیفیت</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectGlyph(hoveredGlyph);
                    onClose();
                  }}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-md active:scale-95"
                >
                  درج این فرم در قطعه
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 text-xs py-8 space-y-2">
                <Info className="w-6 h-6 text-neutral-600" />
                <p>نشانگر ماوس را روی هر فرم ببرید تا پیش‌نمایش بزرگ‌نمایی‌شده آن نمایش داده شود.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-neutral-900/90 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>پشتیبانی کامل از ترکیبات اصیل میرعماد، درویش عبدالمجید و کتیبه‌های تاریخی</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold transition-all"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
});

