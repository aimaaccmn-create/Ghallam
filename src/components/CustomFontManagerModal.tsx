import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Upload, 
  Trash2, 
  X, 
  Check, 
  Search, 
  Type, 
  Sparkles, 
  FolderPlus, 
  Layers, 
  RefreshCw, 
  FileText, 
  AlertCircle,
  Sliders,
  CheckCircle2,
  Bookmark,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { CalligraphyScript, CustomUserFont, CanvasElement } from '../types/calligraphy';
import { 
  SCRIPT_FONT_MAP,
  saveUserFontsToStorage
} from '../utils/calligraphyEngine';
import { 
  validateFontFile, 
  FontLifecycleManager, 
  FontValidationResult 
} from '../utils/fontManager';

interface CustomFontManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScript: CalligraphyScript;
  onSelectScript: (script: CalligraphyScript, customFont?: CustomUserFont) => void;
  selectedElement?: CanvasElement | null;
  selectedElementText?: string;
  onUpdateSelectedElementFont?: (fontFamily: string, script?: CalligraphyScript) => void;
  userFonts: CustomUserFont[];
  onAddUserFont?: (font: CustomUserFont) => Promise<void> | void;
  onDeleteUserFont?: (fontId: string) => Promise<void> | void;
  onUpdateUserFonts?: (fonts: CustomUserFont[]) => void;
}

const PERSIAN_SPECIFIC_KEYS = new Set([
  'nastaliq', 'shekasteh', 'shekasteh_darvish', 'neyrizi', 'mirza', 'gulzar',
  'lalezar', 'sahel', 'shabnam', 'samim', 'parastoo', 'katibeh', 'tahriri', 
  'moalla', 'kufi_bannai', 'gandom', 'tanha', 'vazirmatn'
]);

export const CustomFontManagerModal: React.FC<CustomFontManagerModalProps> = React.memo(({
  isOpen,
  onClose,
  currentScript,
  onSelectScript,
  selectedElement,
  selectedElementText,
  onUpdateSelectedElementFont,
  userFonts = [],
  onAddUserFont,
  onDeleteUserFont,
  onUpdateUserFonts,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewText, setPreviewText] = useState<string>('هنر خوشنویسی تجلی روح و جان است');
  const [previewFontSize, setPreviewFontSize] = useState<number>(34);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatusStep, setUploadStatusStep] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [lastValidation, setLastValidation] = useState<FontValidationResult | null>(null);
  const [, setForceUpdate] = useState({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear any prior alert messages when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setUploadError(null);
      setUploadSuccess(null);
      if (selectedElementText && selectedElementText.trim()) {
        setPreviewText(selectedElementText);
      }
    }
  }, [isOpen, selectedElementText]);

  // Subscribe to FontLifecycleManager updates
  useEffect(() => {
    const unsub = FontLifecycleManager.subscribe(() => {
      setForceUpdate({});
    });
    return unsub;
  }, []);

  // Categories definitions
  const persianCount = useMemo(() => {
    return Object.entries(SCRIPT_FONT_MAP).filter(([key, meta]) => 
      key !== 'custom' && (PERSIAN_SPECIFIC_KEYS.has(key) || (meta.origin && meta.origin.includes('ایران')))
    ).length;
  }, []);

  const CATEGORIES = useMemo(() => [
    { id: 'all', name: 'تمام قلم‌ها', icon: Layers, count: Object.keys(SCRIPT_FONT_MAP).filter(k => k !== 'custom').length + userFonts.length },
    { id: 'persian', name: 'قلم‌ها و خطوط اصیل فارسی', icon: Sparkles, count: persianCount },
    { id: 'custom', name: 'فونت‌های من (آپلود شده)', icon: FolderPlus, count: userFonts.length },
    { id: 'traditional', name: 'خوشنویسی سنتی و اقلام', icon: Sparkles, count: Object.values(SCRIPT_FONT_MAP).filter(s => s.category === 'traditional').length },
    { id: 'kufic', name: 'کوفی و کتیبه‌ای', icon: Bookmark, count: Object.values(SCRIPT_FONT_MAP).filter(s => s.category === 'kufic').length },
    { id: 'diwani_naskh', name: 'دیوانی، نسخ و عثمانی', icon: FileText, count: Object.values(SCRIPT_FONT_MAP).filter(s => s.category === 'diwani_naskh').length },
    { id: 'display', name: 'تایپوگرافی و عناوین', icon: Type, count: Object.values(SCRIPT_FONT_MAP).filter(s => s.category === 'display').length },
    { id: 'handwriting', name: 'دست‌نویس و تحریری', icon: Sliders, count: Object.values(SCRIPT_FONT_MAP).filter(s => s.category === 'handwriting').length },
  ], [userFonts.length, persianCount]);

  if (!isOpen) return null;

  // Deep validation & upload handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setLastValidation(null);
    setUploadStatusStep('در حال خواندن و بررسی فونت...');

    const file = files[0];

    try {
      // 1. Run validation
      const validation = await validateFontFile(file);
      setLastValidation(validation);

      if (!validation.isValid) {
        setUploadError(validation.error || 'فایل قلم نامعتبر است.');
        setIsUploading(false);
        setUploadStatusStep('');
        return;
      }

      setUploadStatusStep('در حال بارگذاری و تزریق به استودیو...');

      // 2. Read as Data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('خطا در خواندن فایل'));
        reader.readAsDataURL(file);
      });

      const cleanName = validation.family || validation.fullName || file.name.replace(/\.[^/.]+$/, '').trim();
      const safeIdentifier = cleanName.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
      const fontId = `custom_font_${Date.now()}`;
      const fontFamilyName = `KelkCustom_${safeIdentifier}_${Date.now()}`;

      const formatType = validation.format === 'opentype' ? 'opentype'
        : validation.format === 'woff' ? 'woff'
        : validation.format === 'woff2' ? 'woff2'
        : 'truetype';

      const newCustomFont: CustomUserFont = {
        id: fontId,
        name: cleanName || 'فونت سفارشی',
        fontFamily: fontFamilyName,
        dataUrl,
        fileName: file.name,
        fileSize: file.size,
        format: formatType,
        addedAt: new Date().toISOString(),
        previewText: previewText || 'بسم الله الرحمن الرحیم',
      };

      setUploadStatusStep('در حال ثبت در مرورگر...');

      // 3. Register with lifecycle manager and save to storage
      await FontLifecycleManager.registerFont(newCustomFont, true);

      const updated = [newCustomFont, ...userFonts.filter(f => f.id !== newCustomFont.id)];
      if (onAddUserFont) {
        try {
          await onAddUserFont(newCustomFont);
        } catch (e) {
          console.warn('onAddUserFont notice:', e);
        }
      }
      if (onUpdateUserFonts) {
        try {
          onUpdateUserFonts(updated);
        } catch (e) {
          console.warn('onUpdateUserFonts notice:', e);
        }
      }
      saveUserFontsToStorage(updated);

      const glyphMsg = validation.glyphCountEstimate ? ` (${validation.glyphCountEstimate} گلیف شناسایی شد)` : '';
      setUploadSuccess(`قلم «${newCustomFont.name}» با موفقیت افزوده شد${glyphMsg}.`);

      // Auto select the new font
      if (selectedElement && onUpdateSelectedElementFont) {
        onUpdateSelectedElementFont(newCustomFont.fontFamily, 'custom');
      }
      onSelectScript('custom', newCustomFont);
    } catch (err: any) {
      console.error('Font upload error:', err);
      setUploadError(`مشکل در پردازش قلم: ${err?.message || 'لطفاً فایل فونت دیگری امتحان کنید.'}`);
    } finally {
      setIsUploading(false);
      setUploadStatusStep('');
    }
  };

  // Re-verify & re-activate font
  const handleReactivateFont = async (font: CustomUserFont, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await FontLifecycleManager.registerFont(font, true);
      setUploadSuccess(`قلم «${font.name}» با موفقیت فعال‌سازی شد.`);
    } catch (err) {
      console.warn('Font reactivate warning:', err);
      setUploadSuccess(`قلم «${font.name}» در دسترس است.`);
    }
  };

  // Delete custom font
  const handleDeleteCustomFont = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await FontLifecycleManager.unregisterFont(id);
      if (onDeleteUserFont) {
        try {
          await onDeleteUserFont(id);
        } catch (e) {}
      }
      const updated = userFonts.filter(f => f.id !== id);
      if (onUpdateUserFonts) {
        try {
          onUpdateUserFonts(updated);
        } catch (e) {}
      }
      saveUserFontsToStorage(updated);
    } catch (err) {
      console.warn('Error deleting custom font:', err);
    }
  };

  // Filter built-in scripts
  const filteredScripts = useMemo(() => {
    return Object.entries(SCRIPT_FONT_MAP).filter(([key, meta]) => {
      if (key === 'custom') return false;
      let matchCategory = activeCategory === 'all' || meta.category === activeCategory;
      if (activeCategory === 'persian') {
        matchCategory = PERSIAN_SPECIFIC_KEYS.has(key) || (meta.origin && meta.origin.includes('ایران')) || false;
      }
      const matchSearch = !searchQuery.trim() || 
        meta.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        meta.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (meta.origin && meta.origin.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  // Filter user fonts
  const filteredUserFonts = useMemo(() => {
    return userFonts.filter(font => {
      const matchCategory = activeCategory === 'all' || activeCategory === 'custom';
      const matchSearch = !searchQuery.trim() || 
        font.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        font.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [userFonts, activeCategory, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/85 backdrop-blur-xl animate-in fade-in select-none font-vazir text-neutral-100">
      <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] max-h-[840px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Type className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100">
                  کتابخانه جامع اقلام و مدیریت فونت‌های دلخواه
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{Object.keys(SCRIPT_FONT_MAP).length + userFonts.length - 1} قلم فعال و پایدار</span>
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                پشتیبانی از اعتبارسنجی باینری، استخراج متادیتای SFNT، ماندگاری دائم در IndexedDB و بارگذاری زنده
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Banner & Search Strip */}
        <div 
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleFileUpload(e.dataTransfer.files);
            }
          }}
          className={`p-4 bg-neutral-950/40 border-b border-neutral-800/80 space-y-3 transition-colors ${
            isDragOver ? 'bg-amber-950/40 ring-2 ring-amber-500 ring-inset' : ''
          }`}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="جستجو در نام خط، مکتب، شیوه یا فونت‌های من..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-750 focus:border-amber-500 rounded-xl pr-10 pl-4 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2,.ttc"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-neutral-950 font-bold text-xs shadow-md shadow-amber-950/40 transition-all cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
                ) : (
                  <Upload className="w-4 h-4 text-neutral-950" />
                )}
                <span>آپلود فونت دلخواه (با اعتبارسنجی باینری)</span>
              </button>
            </div>
          </div>

          {/* Upload Progress Status */}
          {isUploading && uploadStatusStep && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
              <span>{uploadStatusStep}</span>
            </div>
          )}

          {/* Feedback messages */}
          {uploadError && (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
              <button 
                onClick={() => setUploadError(null)}
                className="p-1 hover:bg-rose-500/20 rounded-lg text-rose-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {uploadSuccess && (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
              <button 
                onClick={() => setUploadSuccess(null)}
                className="p-1 hover:bg-emerald-500/20 rounded-lg text-emerald-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Live Preview Text Customizer */}
          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-neutral-400 whitespace-nowrap">متن پیش‌نمایش زنده:</span>
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="متن دلخواه جهت تست قلم..."
                className="flex-1 min-w-[200px] bg-neutral-900/90 border border-neutral-800 rounded-lg px-3 py-1 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">اندازه:</span>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={previewFontSize}
                  onChange={(e) => setPreviewFontSize(parseInt(e.target.value))}
                  className="w-24 accent-amber-500 bg-neutral-800 h-1 rounded-lg cursor-pointer"
                />
                <span className="font-mono text-xs text-amber-400 min-w-[28px]">{previewFontSize}px</span>
              </div>
            </div>

            {/* Quick Persian Sample Text Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] text-neutral-400">
              <span className="text-[10px] text-amber-400/80 font-bold whitespace-nowrap">گزیده‌های تست قلم فارسی:</span>
              {[
                'به نام خداوند جان و خرد',
                'عشق پیدا شد و آتش به همه عالم زد',
                'بنی‌آدم اعضای یکدیگرند',
                'گ چ پ ژ ک ی ۰۱۲۳۴۵۶۷۸۹',
                'هنر خوشنویسی تجلی روح و جان است',
              ].map(sample => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setPreviewText(sample)}
                  className="px-2 py-0.5 rounded-full bg-neutral-900 hover:bg-amber-600/20 text-neutral-300 hover:text-amber-300 border border-neutral-800 whitespace-nowrap text-[10px] transition-all"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="px-6 py-2.5 border-b border-neutral-800/80 bg-neutral-950/20 flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Fonts Grid */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* 1. User Uploaded Fonts Section */}
          {(activeCategory === 'all' || activeCategory === 'custom') && filteredUserFonts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-amber-500/20">
                <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4" />
                  <span>فونت‌های آپلود شده و اعتبارسنجی شده ({filteredUserFonts.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredUserFonts.map((uf) => {
                  const isCurrent = currentScript === 'custom' && selectedElement?.fontFamily === uf.fontFamily;
                  const status = FontLifecycleManager.getStatus(uf.id);
                  const isReady = status.isLoaded || typeof document !== 'undefined';

                  return (
                    <div
                      key={uf.id}
                      onClick={() => {
                        if (selectedElement && onUpdateSelectedElementFont) {
                          onUpdateSelectedElementFont(uf.fontFamily, 'custom');
                        }
                        onSelectScript('custom', uf);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-amber-600/15 border-amber-500 ring-1 ring-amber-500/50 shadow-lg'
                          : 'bg-neutral-900/90 border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-850'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                              {uf.name}
                            </span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-amber-400 border border-neutral-700">
                              {uf.format}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle className="w-3 h-3" />
                              <span>فعال و بارگذاری شده</span>
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono mt-0.5 block">
                            {(uf.fileSize / 1024).toFixed(1)} KB • {uf.fileName}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleReactivateFont(uf, e)}
                            className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                            title="بررسی مجدد و بارگذاری زنده"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteCustomFont(uf.id, e)}
                            className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                            title="حذف فونت آپلود شده"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Live text rendered with custom font */}
                      <div 
                        className="py-3 px-3 rounded-xl bg-neutral-950/70 border border-neutral-850/60 text-center text-amber-200 overflow-x-auto select-text"
                        style={{ fontFamily: uf.fontFamily, fontSize: `${previewFontSize}px`, lineHeight: 1.4 }}
                      >
                        {previewText || uf.previewText}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-400">
                        <span>کلیک جهت اعمال روی {selectedElement ? 'المان انتخابی' : 'قلم جاری'}</span>
                        <div className="flex items-center gap-1 text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                          <span>انتخاب قلم</span>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Built-in Authentic Scripts */}
          {filteredScripts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                <h3 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>اقلام و فونت‌های استاندارد کلک استودیو ({filteredScripts.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredScripts.map(([scriptKey, meta]) => {
                  const isCurrent = currentScript === scriptKey;
                  return (
                    <div
                      key={scriptKey}
                      onClick={() => {
                        if (selectedElement && onUpdateSelectedElementFont) {
                          onUpdateSelectedElementFont(meta.cssFamily, scriptKey as CalligraphyScript);
                        }
                        onSelectScript(scriptKey as CalligraphyScript);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-amber-600/15 border-amber-500 ring-1 ring-amber-500/50 shadow-lg'
                          : 'bg-neutral-900/90 border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-850'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                              {meta.name}
                            </span>
                            {meta.origin && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800/80 text-amber-300/80 border border-neutral-750">
                                {meta.origin}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{meta.desc}</p>
                        </div>

                        {isCurrent && (
                          <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <Check className="w-4 h-4" />
                          </span>
                        )}
                      </div>

                      {/* Live text rendered with script font */}
                      <div 
                        className="py-3 px-3 rounded-xl bg-neutral-950/70 border border-neutral-850/60 text-center text-amber-200 overflow-x-auto select-text"
                        style={{ fontFamily: meta.cssFamily, fontSize: `${previewFontSize}px`, lineHeight: 1.5 }}
                      >
                        {previewText}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-400">
                        <span className="font-mono text-[10px] text-neutral-500">زاویه قلم پیش‌فرض: {meta.defaultNibAngle}°</span>
                        <div className="flex items-center gap-1 text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                          <span>انتخاب قلم</span>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredScripts.length === 0 && filteredUserFonts.length === 0 && (
            <div className="py-16 text-center text-neutral-400 space-y-3 bg-neutral-950/40 rounded-3xl border border-neutral-850">
              <Type className="w-10 h-10 mx-auto text-neutral-600" />
              <p className="text-sm font-semibold">هیچ قلمی با عنوان «{searchQuery}» یافت نشد.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold"
              >
                پاک کردن جستجو
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/80 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>تمام فونت‌های بارگذاری شده به طور خودکار در فضای پایدار IndexedDB و مرورگر شما حفظ و نگهداری می‌شوند.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-semibold transition-all"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});


