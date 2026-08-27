import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Bookmark, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  FolderPlus, 
  Save, 
  Feather,
  Layers,
  Search
} from 'lucide-react';
import { CanvasElement, CalligraphyScript } from '../types/calligraphy';
import { 
  BUILT_IN_SNIPPETS, 
  CalligraphySnippet, 
  loadUserSnippets, 
  saveUserSnippets 
} from '../data/calligraphySnippets';
import { SCRIPT_FONT_MAP } from '../utils/calligraphyEngine';

interface SnippetsPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentElements: CanvasElement[];
  selectedElementId: string | null;
  selectedMultiIds?: string[];
  currentScript: CalligraphyScript;
  onInsertSnippet: (snippet: CalligraphySnippet) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'همه قالب‌ها و قطعات' },
  { id: 'user', label: 'قطعات ذخیره‌شده من (Custom)' },
  { id: 'bismillah', label: 'تسمیه و بسم الله' },
  { id: 'sacred', label: 'اسامی و عبارات متبرکه' },
  { id: 'composition', label: 'ترکیبات و شاه‌بیت‌ها' },
  { id: 'signature', label: 'امضا و ترقیم' },
];

export const SnippetsPresetsModal: React.FC<SnippetsPresetsModalProps> = React.memo(({
  isOpen,
  onClose,
  currentElements,
  selectedElementId,
  selectedMultiIds = [],
  currentScript,
  onInsertSnippet,
}) => {
  const [userSnippets, setUserSnippets] = useState<CalligraphySnippet[]>(() => loadUserSnippets());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSavingNew, setIsSavingNew] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUserSnippets(loadUserSnippets());
    }
  }, [isOpen]);

  const allSnippets = useMemo(() => [...userSnippets, ...BUILT_IN_SNIPPETS], [userSnippets]);

  const filteredSnippets = useMemo(() => {
    return allSnippets.filter(s => {
      const matchCategory = selectedCategory === 'all' || 
        (selectedCategory === 'user' ? s.isCustom : s.category === selectedCategory);
      
      const matchQuery = !searchQuery || 
        s.title.includes(searchQuery) ||
        s.description.includes(searchQuery) ||
        s.previewText.includes(searchQuery);

      return matchCategory && matchQuery;
    });
  }, [allSnippets, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleSaveCurrentAsSnippet = () => {
    if (!newTitle.trim()) return;

    let targetElements: CanvasElement[] = [];
    if (selectedMultiIds.length > 0) {
      targetElements = currentElements.filter(e => selectedMultiIds.includes(e.id));
    } else if (selectedElementId) {
      const el = currentElements.find(e => e.id === selectedElementId);
      if (el) targetElements = [el];
    } else {
      targetElements = currentElements;
    }

    if (targetElements.length === 0) return;

    const minX = Math.min(...targetElements.map(e => e.x));
    const minY = Math.min(...targetElements.map(e => e.y));

    // Normalize coordinates relative to origin
    const normalizedElements = targetElements.map(el => ({
      ...el,
      id: undefined,
      x: el.x - minX + 450,
      y: el.y - minY + 300,
    }));

    const previewText = targetElements.map(e => e.text || e.name).filter(Boolean).join(' ') || 'قطعه خوشنویسی';

    const newSnippet: CalligraphySnippet = {
      id: `snippet_${Date.now()}`,
      title: newTitle.trim(),
      category: 'user',
      description: newDescription.trim() || 'قطعه ترکیبی ذخیره‌شده کاربر',
      script: currentScript,
      elements: normalizedElements,
      previewText: previewText.slice(0, 45),
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [newSnippet, ...userSnippets];
    setUserSnippets(updated);
    saveUserSnippets(updated);
    setIsSavingNew(false);
    setNewTitle('');
    setNewDescription('');
    setNotification('قطعه با موفقیت در مخزن قالب‌های شما ذخیره شد');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteUserSnippet = (snippetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = userSnippets.filter(s => s.id !== snippetId);
    setUserSnippets(updated);
    saveUserSnippets(updated);
    setNotification('قطعه حذف شد');
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md select-none font-vazir animate-in fade-in">
      <div className="bg-neutral-950 border border-amber-500/30 w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-neutral-100">
                مخزن قطعات و ترکیب‌های آماده (Snippets & Presets)
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                درج یک‌کلیکه بسم‌الله، صلوات، ترکیبات کتیبه‌ای و ذخیره قطعات دلخواه شما
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

        {/* Action / Search Bar */}
        <div className="p-3 border-b border-neutral-850 bg-neutral-900/40 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-neutral-500" />
              <input
                type="text"
                placeholder="جستجو در قطعات و ترکیبات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => setIsSavingNew(!isSavingNew)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>ذخیره کار فعلی به عنوان قطعه</span>
            </button>
          </div>

          {/* New Snippet Save Form */}
          {isSavingNew && (
            <div className="p-3 bg-neutral-950/90 border border-amber-500/40 rounded-xl space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span>ذخیره ترکیب روی بوم به عنوان قطعه جدید:</span>
                <span className="text-[10px] text-neutral-400 font-normal">
                  {selectedMultiIds.length > 0
                    ? `${selectedMultiIds.length} المان انتخاب‌شده`
                    : (selectedElementId ? '۱ المان انتخاب‌شده' : `کل صفحه (${currentElements.length} لایه)`)}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="عنوان قطعه (مثلاً: چلیپای حافظ یا امضای زرین)..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-100 outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="توضیح کوتاه یا شیوه خوشنویسی..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-100 outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsSavingNew(false)}
                  className="px-3 py-1 text-xs text-neutral-400 hover:text-neutral-200"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSaveCurrentAsSnippet}
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold disabled:opacity-40 hover:bg-amber-400 transition-all flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ثبت در مخزن</span>
                </button>
              </div>
            </div>
          )}

          {/* Categories Horizontal Scroll */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl border text-xs whitespace-nowrap transition-all ${
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

        {/* Notification */}
        {notification && (
          <div className="px-4 py-2 bg-emerald-950/60 border-b border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Snippets Grid */}
        <div className="p-4 overflow-y-auto max-h-[55vh] grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredSnippets.map(snippet => (
            <div
              key={snippet.id}
              onClick={() => {
                onInsertSnippet(snippet);
                onClose();
              }}
              className="p-4 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                      {snippet.title}
                    </span>
                    {snippet.isCustom && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        شخصی
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                      {SCRIPT_FONT_MAP[snippet.script]?.name || snippet.script}
                    </span>
                    {snippet.isCustom && (
                      <button
                        onClick={(e) => handleDeleteUserSnippet(snippet.id, e)}
                        className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                        title="حذف این قطعه"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 mb-3 line-clamp-1">
                  {snippet.description}
                </p>

                {/* Calligraphic Display Card */}
                <div className="h-16 rounded-xl bg-neutral-950/90 border border-neutral-850 flex items-center justify-center p-2 text-center group-hover:border-amber-500/40 transition-colors">
                  <span className="text-xl sm:text-2xl text-amber-200 font-nastaliq group-hover:scale-105 transition-transform truncate px-2">
                    {snippet.previewText}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs text-amber-400 font-semibold">
                <span className="text-[11px] text-neutral-400">
                  {snippet.elements.length} جزء خوشنویسی
                </span>
                <span className="flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform text-xs">
                  <span>کلیک برای درج روی بوم</span>
                  <span>←</span>
                </span>
              </div>
            </div>
          ))}

          {filteredSnippets.length === 0 && (
            <div className="col-span-full py-12 text-center text-neutral-500 text-xs">
              قطعه‌ای مطابق با جستجو یافت نشد.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>قطعات با مقیاس و مختصات بهینه روی بوم قرار می‌گیرند</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-all font-semibold"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
});

