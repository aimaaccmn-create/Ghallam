import React, { useRef, useState, useEffect } from 'react';
import {
  RotateCcw,
  RotateCw,
  Plus,
  Save,
  FolderOpen,
  LayoutTemplate,
  Download,
  MoreHorizontal,
  Grid,
  Sparkles,
  Maximize2,
  Palette,
  ChevronDown,
  Wand2,
  FolderPlus,
  PenTool,
  Scissors,
  Stamp,
  History,
  Frame,
  Feather,
  X,
  Award,
  Compass,
  SunMedium,
  MoveHorizontal,
  FileCode,
  Archive,
  Image as ImageIcon,
  Zap
} from 'lucide-react';
import { CalligraphyScript, CanvasLayoutMode, CustomUserFont } from '../types/calligraphy';
import { SCRIPT_FONT_MAP } from '../utils/calligraphyEngine';

interface HeaderBarProps {
  currentScript: CalligraphyScript;
  onScriptChange: (script: CalligraphyScript) => void;
  layoutMode: CanvasLayoutMode;
  onLayoutModeChange: (mode: CanvasLayoutMode) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showKorsi: boolean;
  onToggleKorsi: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onNewProject: () => void;
  onOpenTemplates: () => void;
  onOpenPoetryAi: () => void;
  onOpenExport: () => void;
  onSaveJson: () => void;
  onLoadJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenAlternateGlyphs?: () => void;
  onOpenSealStamp?: () => void;
  onOpenDotRuler?: () => void;
  isDigitalRulerActive?: boolean;
  onToggleDigitalRuler?: () => void;
  onOpenReedPen?: () => void;
  onOpenTazhibBuilder?: () => void;
  onOpenEbruStudio?: () => void;
  onOpenHistorySnapshots?: () => void;
  onOpenFontManager?: () => void;
  onOpenSplitWord?: () => void;
  onOpenPalettes?: () => void;
  onOpenSnippets?: () => void;
  onOpenZenMode?: () => void;
  onOpenMockup?: () => void;
  onOpenCertificate?: () => void;
  onOpenCncLaser?: () => void;
  onOpenWorkspacePresets?: () => void;
  onOpenMetallicShimmer?: () => void;
  onOpenOpticalKerning?: () => void;
  onOpenCustomVectorImporter?: () => void;
  onOpenProjectBundle?: () => void;
  onOpenGhostReference?: () => void;
  isLiteMode?: boolean;
  onToggleLiteMode?: () => void;
  userFonts?: CustomUserFont[];
  isMobileStudiosOpen?: boolean;
  onCloseMobileStudios?: () => void;
  onOpenMobileStudios?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = React.memo(({
  currentScript,
  onScriptChange,
  layoutMode,
  onLayoutModeChange,
  zoom,
  onZoomChange,
  showGrid,
  onToggleGrid,
  showKorsi,
  onToggleKorsi,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onNewProject,
  onOpenTemplates,
  onOpenPoetryAi,
  onOpenExport,
  onSaveJson,
  onLoadJson,
  onOpenAlternateGlyphs,
  onOpenSealStamp,
  onOpenDotRuler,
  isDigitalRulerActive = false,
  onToggleDigitalRuler,
  onOpenReedPen,
  onOpenTazhibBuilder,
  onOpenEbruStudio,
  onOpenHistorySnapshots,
  onOpenFontManager,
  onOpenSplitWord,
  onOpenPalettes,
  onOpenSnippets,
  onOpenZenMode,
  onOpenMockup,
  onOpenCertificate,
  onOpenCncLaser,
  onOpenWorkspacePresets,
  onOpenMetallicShimmer,
  onOpenOpticalKerning,
  onOpenCustomVectorImporter,
  onOpenProjectBundle,
  onOpenGhostReference,
  isLiteMode = false,
  onToggleLiteMode,
  userFonts = [],
  isMobileStudiosOpen = false,
  onCloseMobileStudios,
  onOpenMobileStudios,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [internalStudiosOpen, setInternalStudiosOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isStudiosOpen = isMobileStudiosOpen || internalStudiosOpen;
  const handleCloseStudios = () => {
    setInternalStudiosOpen(false);
    if (onCloseMobileStudios) onCloseMobileStudios();
  };

  // Close popup menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-13 sm:h-16 w-full max-w-full bg-neutral-950/95 border-b border-amber-500/20 px-1.5 sm:px-4 flex items-center justify-between text-neutral-200 z-40 select-none backdrop-blur-xl relative font-vazir overflow-visible mobile-header-compact shadow-lg">
      {/* 1. Left Section: Brand & Script Selection */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
        {/* Brand Icon & Name */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 flex items-center justify-center shadow-md shadow-amber-950/40 border border-amber-400/40 text-amber-50 shrink-0">
            <Feather className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 drop-shadow" />
          </div>
          <div className="hidden xs:block">
            <div className="flex items-center gap-1">
              <h1 className="font-bold text-xs sm:text-sm md:text-base text-neutral-100 font-vazir tracking-tight">
                کِـلْـک
              </h1>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                استودیو خوشنویسی
              </span>
            </div>
          </div>
        </div>

        {/* Script Selection Dropdown */}
        <div className="relative max-w-[88px] xs:max-w-[115px] sm:max-w-[155px]">
          <select
            value={currentScript}
            onChange={(e) => {
              onScriptChange(e.target.value as CalligraphyScript);
            }}
            className="w-full bg-neutral-900/90 text-amber-300 text-[10px] sm:text-xs font-vazir py-1 sm:py-1.5 px-1.5 sm:px-2 pl-4 sm:pl-5 rounded-xl border border-amber-500/30 hover:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer appearance-none shadow-sm truncate mobile-select-compact"
          >
            {Object.entries(SCRIPT_FONT_MAP).map(([key, item]) => (
              <option key={key} value={key} className="bg-neutral-950 text-neutral-200">
                {item.name}
              </option>
            ))}
            {userFonts.length > 0 && (
              <optgroup label="فونت‌های اختصاصی شما">
                {userFonts.map((uf) => (
                  <option key={uf.id} value={`custom_${uf.id}`} className="bg-neutral-950 text-amber-300">
                    ★ {uf.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 absolute left-1 sm:left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Font Manager Button (Desktop / Tablet) */}
        {onOpenFontManager && (
          <button
            onClick={() => {
              onOpenFontManager();
            }}
            className="hidden sm:flex p-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-850 text-amber-400 hover:text-amber-300 border border-neutral-800 hover:border-amber-500/40 transition-all shadow-sm shrink-0 cursor-pointer"
            title="مدیریت فونت‌ها و آپلود TTF/OTF/WOFF"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        )}

        {/* Layout Mode Selector (Desktop only) */}
        <div className="hidden xl:flex items-center bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 shadow-sm text-xs font-vazir shrink-0">
          {[
            { id: 'free', label: 'آزاد' },
            { id: 'satr', label: 'سطر' },
            { id: 'chlipa', label: 'چلیپا' },
            { id: 'katibeh', label: 'کتیبه' },
            { id: 'siah_mashq', label: 'سیاه‌مشق' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                onLayoutModeChange(mode.id as CanvasLayoutMode);
              }}
              className={`py-1 px-2 rounded-lg transition-all cursor-pointer ${
                layoutMode === mode.id
                  ? 'bg-amber-600/25 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Middle Section: Desktop Guides, History & Lite Mode Toggle */}
      <div className="hidden md:flex items-center gap-1.5 lg:gap-2 shrink-0">
        {/* Undo / Redo */}
        <div className="flex items-center bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 shadow-sm">
          <button
            onClick={() => {
              onUndo();
            }}
            disabled={!canUndo}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="بازگشت به عقب (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              onRedo();
            }}
            disabled={!canRedo}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="انجام مجدد (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          {onOpenHistorySnapshots && (
            <button
              onClick={() => {
                onOpenHistorySnapshots();
              }}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-amber-400/90 hover:text-amber-300 transition-all border-r border-neutral-800 pr-1.5 mr-0.5 cursor-pointer"
              title="تاریخچه نسخه‌ها و نقاط عطف (Snapshots)"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Guides & Grid Toggles */}
        <div className="flex items-center bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 shadow-sm">
          <button
            onClick={() => {
              onToggleGrid();
            }}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              showGrid ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
            title="شبکه شطرنجی میلی‌متری"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              onToggleKorsi();
            }}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              showKorsi ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
            title="خطوط کرسی و راهنما"
          >
            <span className="text-[11px] font-bold px-0.5 leading-none">کرسی</span>
          </button>
        </div>

        {/* High-Performance / Lite Mode for Low-End Devices Toggle */}
        {onToggleLiteMode && (
          <button
            onClick={onToggleLiteMode}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border transition-all cursor-pointer font-vazir text-xs font-semibold ${
              isLiteMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-950/40'
                : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-amber-300 hover:border-neutral-700'
            }`}
            title={
              isLiteMode
                ? 'حالت بهینه‌سازی گوشی‌های ضعیف فعال است (حذف لگ، روان‌سازی شدید)'
                : 'بهینه‌سازی برای گوشی‌های ضعیف مانند Redmi Note 8 Pro (روان‌سازی و رفع لگ)'
            }
          >
            <Zap className={`w-3.5 h-3.5 ${isLiteMode ? 'text-emerald-400 fill-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-[11px]">
              {isLiteMode ? '⚡ حالت سبک (فعال)' : '⚡ بهینه‌سازی گوشی'}
            </span>
          </button>
        )}
      </div>

      {/* 3. Right Section: Studios, Mockup, CNC, Certificate, Export */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Mobile Lite Mode Quick Toggle Button (< md) */}
        {onToggleLiteMode && (
          <button
            onClick={onToggleLiteMode}
            className={`md:hidden flex items-center gap-1 p-1.5 xs:px-2 rounded-xl border transition-all cursor-pointer text-xs font-bold shrink-0 ${
              isLiteMode
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/60'
                : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-amber-300'
            }`}
            title="بهینه‌سازی برای گوشی‌های ضعیف و رفع لگ"
          >
            <Zap className={`w-3.5 h-3.5 ${isLiteMode ? 'text-emerald-400 fill-emerald-400' : 'text-amber-400'}`} />
            <span className="hidden xs:inline text-[10px]">
              {isLiteMode ? 'سبک' : 'بهینه'}
            </span>
          </button>
        )}

        {/* Undo / Redo for Mobile View */}
        <div className="flex md:hidden items-center bg-neutral-900/90 p-0.5 rounded-xl border border-neutral-800">
          <button
            onClick={() => {
              onUndo();
            }}
            disabled={!canUndo}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 disabled:opacity-20 transition-all cursor-pointer"
            title="بازگشت (Undo)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              onRedo();
            }}
            disabled={!canRedo}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 disabled:opacity-20 transition-all cursor-pointer"
            title="انجام مجدد (Redo)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Desktop Direct Studio Buttons */}
        {onOpenReedPen && (
          <button
            onClick={() => {
              onOpenReedPen();
            }}
            className="hidden xl:flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-850 text-amber-300 text-xs font-vazir py-1.5 px-2.5 rounded-xl border border-amber-500/30 hover:border-amber-500/60 transition-all shadow-sm shrink-0 cursor-pointer"
            title="شبیه‌ساز قلم‌نی طبیعی و سیاه‌مشق زنده"
          >
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span>قلم‌نی زنده</span>
          </button>
        )}

        {onOpenTazhibBuilder && (
          <button
            onClick={() => {
              onOpenTazhibBuilder();
            }}
            className="hidden xl:flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-850 text-amber-300 text-xs font-vazir py-1.5 px-2.5 rounded-xl border border-amber-500/30 hover:border-amber-500/60 transition-all shadow-sm shrink-0 cursor-pointer"
            title="استودیو ساخت تذهیب و شمسه"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>سازنده تذهیب</span>
          </button>
        )}

        {/* CNC & Laser Studio (Desktop) */}
        {onOpenCncLaser && (
          <button
            onClick={() => {
              onOpenCncLaser();
            }}
            className="hidden lg:flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-850 text-emerald-300 text-xs font-vazir py-1.5 px-2 rounded-xl border border-emerald-500/30 hover:border-emerald-500/60 transition-all shadow-sm shrink-0 cursor-pointer"
            title="استودیو برش لیزر، پلاک طلا و CNC"
          >
            <Scissors className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">لیزر و CNC</span>
          </button>
        )}

        {/* Real-World Mockup (Desktop) */}
        {onOpenMockup && (
          <button
            onClick={() => {
              onOpenMockup();
            }}
            className="hidden lg:flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-850 text-neutral-200 text-xs font-vazir py-1.5 px-2 rounded-xl border border-neutral-800 hover:border-amber-500/40 transition-all shadow-sm shrink-0 cursor-pointer"
            title="پیش‌نمایش در قاب موزه، پلاک طلا و کاشی‌کاری"
          >
            <Frame className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">موکاپ سه‌بعدی</span>
          </button>
        )}

        {/* Certificate of Authenticity (Desktop) */}
        {onOpenCertificate && (
          <button
            onClick={() => {
              onOpenCertificate();
            }}
            className="hidden lg:flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-850 text-amber-300 text-xs font-vazir py-1.5 px-2 rounded-xl border border-amber-500/30 hover:border-amber-500/60 transition-all shadow-sm shrink-0 cursor-pointer"
            title="صدور شناسنامه و گواهی‌نامه رسمی اصالت اثر"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">شناسنامه اثر</span>
          </button>
        )}

        {/* Zen Presentation Mode (Desktop) */}
        {onOpenZenMode && (
          <button
            onClick={() => {
              onOpenZenMode();
            }}
            className="hidden sm:flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-850 text-neutral-300 hover:text-amber-300 text-xs font-vazir py-1.5 px-2 rounded-xl border border-neutral-800 hover:border-amber-500/40 transition-all shadow-sm shrink-0 cursor-pointer"
            title="حالت خلوت و تمام‌صفحه (Zen Mode)"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">ذن</span>
          </button>
        )}

        {/* Masterpieces & Templates (Desktop) */}
        <button
          onClick={() => {
            onOpenTemplates();
          }}
          className="hidden md:flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-850 text-neutral-200 text-xs font-vazir py-1.5 px-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all shadow-sm shrink-0 cursor-pointer"
          title="قالب‌های آماده و شاهکارهای چلیپا"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-amber-400" />
          <span>قالب‌ها</span>
        </button>

        {/* Mobile All Studios Button (< lg) */}
        <button
          onClick={() => {
            if (onOpenMobileStudios) {
              onOpenMobileStudios();
            } else {
              setInternalStudiosOpen(true);
            }
          }}
          className="lg:hidden p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 active:scale-95 transition-all flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
          title="منوی تمام کارگاه‌ها و امکانات"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="hidden xs:inline text-[11px]">کارگاه‌ها</span>
        </button>

        {/* Project Options Menu (Save/Load/New) */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => {
              setIsToolsMenuOpen(!isToolsMenuOpen);
            }}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 bg-neutral-900/90 hover:bg-neutral-850 rounded-xl border border-neutral-800 shadow-sm transition-all cursor-pointer"
            title="گزینه‌های پروژه"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Solid Top Elevation Dropdown over canvas */}
          {isToolsMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-56 bg-neutral-950/98 border border-neutral-700/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-2 z-50 font-vazir text-xs space-y-1 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  onSaveJson();
                  setIsToolsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-neutral-200 hover:text-amber-300 hover:bg-neutral-900/90 rounded-xl transition-all text-right cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>ذخیره سند پروژه (.kelk)</span>
              </button>
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsToolsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-neutral-200 hover:text-amber-300 hover:bg-neutral-900/90 rounded-xl transition-all text-right cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 text-amber-400" />
                <span>باز کردن فایل پروژه</span>
              </button>

              {onOpenCertificate && (
                <button
                  onClick={() => {
                    onOpenCertificate();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-neutral-200 hover:text-amber-300 hover:bg-neutral-900/90 rounded-xl transition-all text-right cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>صدور شناسنامه و گواهی اصالت</span>
                </button>
              )}

              {onOpenCncLaser && (
                <button
                  onClick={() => {
                    onOpenCncLaser();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-neutral-200 hover:text-emerald-300 hover:bg-neutral-900/90 rounded-xl transition-all text-right cursor-pointer"
                >
                  <Scissors className="w-4 h-4 text-emerald-400" />
                  <span>استودیو برش لیزر و طلاسازی</span>
                </button>
              )}

              <button
                onClick={() => {
                  onNewProject();
                  setIsToolsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-neutral-200 hover:text-emerald-300 hover:bg-neutral-900/90 rounded-xl transition-all text-right border-t border-neutral-850 pt-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>صفحه جدید</span>
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={onLoadJson}
            accept=".json,.kelk"
            className="hidden"
          />
        </div>

        {/* Primary Export CTA Button */}
        <button
          onClick={() => {
            onOpenExport();
          }}
          className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs font-vazir py-1.5 px-2.5 sm:px-3 rounded-xl shadow-md shadow-amber-950/40 border border-amber-400/50 transition-all shrink-0 active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="text-[11px] sm:text-xs">خروجی</span>
        </button>
      </div>

      {/* Mobile & Tablet All-Studios Modal / Action Sheet */}
      {isStudiosOpen && (
        <div 
          onClick={handleCloseStudios}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 dir-rtl font-vazir transition-opacity duration-300 ease-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-neutral-950/98 border border-amber-500/30 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 transition-transform duration-300 ease-out animate-in slide-in-from-bottom-5"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-100">کارگاه‌ها و استودیوهای تخصصی کِلک</h3>
                  <p className="text-[11px] text-neutral-400">امکانات خوشنویسی، تذهیب، مهر سلطنتی، موکاپ و خروجی CNC</p>
                </div>
              </div>
              <button
                onClick={handleCloseStudios}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Studio Cards Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Lite Mode / Performance Mode Toggle Card */}
              {onToggleLiteMode && (
                <button
                  onClick={() => {
                    onToggleLiteMode();
                  }}
                  className={`col-span-2 p-3.5 rounded-2xl border text-right flex items-center justify-between transition-all active:scale-98 ${
                    isLiteMode
                      ? 'bg-emerald-500/20 border-emerald-500/50 shadow-md shadow-emerald-950/40'
                      : 'bg-neutral-900/90 border-neutral-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isLiteMode ? 'bg-emerald-500/30 text-emerald-300' : 'bg-neutral-800 text-amber-400'
                    }`}>
                      <Zap className={`w-5 h-5 ${isLiteMode ? 'fill-emerald-400' : ''}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${isLiteMode ? 'text-emerald-200' : 'text-neutral-200'}`}>
                          حالت بهینه‌سازی گوشی‌های ضعیف (سبک)
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          isLiteMode ? 'bg-emerald-500/30 text-emerald-300' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {isLiteMode ? 'فعال' : 'غیرفعال'}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        حذف لگ و تاری‌های پردازشی سنگین، شتاب‌دهی GPU در گوشی‌های میان‌رده و قدیمی
                      </p>
                    </div>
                  </div>
                </button>
              )}

              {/* Workspace Presets */}
              {onOpenWorkspacePresets && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenWorkspacePresets();
                  }}
                  className="p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-98 border border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-amber-200">میزکارهای هوشمند</span>
                  <span className="text-[10px] text-neutral-400">چلیپا، کتیبه، سیاه‌مشق و قلم‌نی</span>
                </button>
              )}

              {/* Metallic & Shimmer Shaders */}
              {onOpenMetallicShimmer && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenMetallicShimmer();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <SunMedium className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">طیف و شیدرهای متالیک</span>
                  <span className="text-[10px] text-neutral-400">ورق طلا، نقره مهتابی و مس چکش‌خورده</span>
                </button>
              )}

              {/* Optical Kerning & Negative Space */}
              {onOpenOpticalKerning && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenOpticalKerning();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <MoveHorizontal className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">توازن نوری حروف</span>
                  <span className="text-[10px] text-neutral-400">کرنینگ خودکار و حذف فضای منفی زائد</span>
                </button>
              )}

              {/* Custom SVG Vector Importer */}
              {onOpenCustomVectorImporter && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenCustomVectorImporter();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">ورود وکتور SVG</span>
                  <span className="text-[10px] text-neutral-400">شمسه، کتیبه و نقوش برداری شخصی</span>
                </button>
              )}

              {/* Ghost Reference Overlay */}
              {onOpenGhostReference && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenGhostReference();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">لایه مقایسه و مشق کهن</span>
                  <span className="text-[10px] text-neutral-400">تطبیق دانگ و ترکیب با اثر استادان</span>
                </button>
              )}

              {/* Project Bundle Packager */}
              {onOpenProjectBundle && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenProjectBundle();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Archive className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">بسته کامل پروژه (.kelkpkg)</span>
                  <span className="text-[10px] text-neutral-400">استخراج همراه فونت‌ها و بافت‌ها</span>
                </button>
              )}

              {/* 1. Live Reed Pen */}
              {onOpenReedPen && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenReedPen();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">قلم‌نی زنده</span>
                  <span className="text-[10px] text-neutral-400">تراش سنتی قلم و سیاه‌مشق پویا</span>
                </button>
              )}

              {/* 2. Tazhib Builder */}
              {onOpenTazhibBuilder && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenTazhibBuilder();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">سازنده تذهیب</span>
                  <span className="text-[10px] text-neutral-400">طراحی شمسه، ترنج، لچک و سرلوحه</span>
                </button>
              )}

              {/* 3. CNC & Laser Studio */}
              {onOpenCncLaser && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenCncLaser();
                  }}
                  className="p-3.5 rounded-2xl bg-emerald-950/30 hover:bg-emerald-900/40 active:scale-98 border border-emerald-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-emerald-200">برش لیزر و طلاسازی</span>
                  <span className="text-[10px] text-neutral-400">پلاک طلا، حلقه آویز، پل اتصال</span>
                </button>
              )}

              {/* 4. Seal Stamp */}
              {onOpenSealStamp && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenSealStamp();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-red-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                    <Stamp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">مهر و امضای سنتی</span>
                  <span className="text-[10px] text-neutral-400">مهر موم سرخ، عقیق و برنج قاجاری</span>
                </button>
              )}

              {/* 5. Certificate of Authenticity */}
              {onOpenCertificate && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenCertificate();
                  }}
                  className="p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-98 border border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-amber-200">شناسنامه و گواهی اصالت</span>
                  <span className="text-[10px] text-neutral-400">صدور سند تذهیب‌دار رسمی با بارکد</span>
                </button>
              )}

              {/* 6. Real-World Mockup */}
              {onOpenMockup && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenMockup();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Frame className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">موکاپ سه‌بعدی</span>
                  <span className="text-[10px] text-neutral-400">قاب طلایی موزه، کاشی و پلاک طلا</span>
                </button>
              )}

              {/* 7. Ebru Paper */}
              {onOpenEbruStudio && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenEbruStudio();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Palette className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">کاغذ ابروباد</span>
                  <span className="text-[10px] text-neutral-400">شبیه‌ساز ماربلینگ و طلاافشان سنتی</span>
                </button>
              )}

              {/* 8. Masterpiece Templates */}
              <button
                onClick={() => {
                  handleCloseStudios();
                  onOpenTemplates();
                }}
                className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <LayoutTemplate className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-neutral-200">قالب‌های شاهکار</span>
                <span className="text-[10px] text-neutral-400">چلیپای میرعماد، کتیبه و سیاه‌مشق</span>
              </button>

              {/* 9. Font Manager */}
              {onOpenFontManager && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenFontManager();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">مدیریت فونت‌ها</span>
                  <span className="text-[10px] text-neutral-400">آپلود فونت‌های TTF/OTF/WOFF</span>
                </button>
              )}

              {/* 10. Alternate Glyphs */}
              {onOpenAlternateGlyphs && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenAlternateGlyphs();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">فرم‌های جایگزین</span>
                  <span className="text-[10px] text-neutral-400">یای معکوس، کاف کشیده و تنوع حروف</span>
                </button>
              )}

              {/* 11. Word Splitting */}
              {onOpenSplitWord && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenSplitWord();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">تفکیک کلمات</span>
                  <span className="text-[10px] text-neutral-400">جداسازی کلمات و سیلاب‌ها جهت ترکیب‌بندی</span>
                </button>
              )}

              {/* 12. History Snapshots */}
              {onOpenHistorySnapshots && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenHistorySnapshots();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <History className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">تاریخچه پروژه‌ها</span>
                  <span className="text-[10px] text-neutral-400">ثبت و بازیابی نقاط عطف نسخه</span>
                </button>
              )}

              {/* 13. Palettes */}
              {onOpenPalettes && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenPalettes();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Palette className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">پالت‌های سنتی</span>
                  <span className="text-[10px] text-neutral-400">زر و لاجورد صفوی، شنگرف و مرمر</span>
                </button>
              )}

              {/* 14. Zen Presentation Mode */}
              {onOpenZenMode && (
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenZenMode();
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1.5 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">حالت خلوت (Zen)</span>
                  <span className="text-[10px] text-neutral-400">تمام‌صفحه و نورپردازی موزه</span>
                </button>
              )}

              {/* Vector & Print Export */}
              <button
                onClick={() => {
                  handleCloseStudios();
                  onOpenExport();
                }}
                className="col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-right flex flex-col gap-1 transition-all shadow-lg shadow-amber-950/50 active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span className="text-xs font-bold">خروجی و چاپ باکیفیت</span>
                </div>
                <span className="text-[10px] text-neutral-900 opacity-85">SVG برداری، PDF وکتور و PNG تا ۳۰۰DPI</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});
