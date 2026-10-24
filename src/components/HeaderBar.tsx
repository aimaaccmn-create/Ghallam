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
  Zap,
  Crown,
  Ruler,
  BookOpen
} from 'lucide-react';
import { CalligraphyScript, CanvasLayoutMode, CustomUserFont } from '../types/calligraphy';
import { SCRIPT_FONT_MAP } from '../utils/calligraphyEngine';
import { TrialState, getOrInitializeTrialState } from '../utils/trialVault';
import { TrialUpgradeModal } from './TrialUpgradeModal';
import { AdminPanelModal } from './AdminPanelModal';

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
  const [trialState, setTrialState] = useState<TrialState | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getOrInitializeTrialState().then(setTrialState);
  }, []);

  // Stealth shortcut Ctrl+Shift+L or Ctrl+Alt+A to open Admin Panel secretly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret key combination known only to owner
      const isShiftL = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'l' || e.key === 'L' || e.key === 'م');
      const isAltA = (e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'a' || e.key === 'A' || e.key === 'ش');
      if (isShiftL || isAltA) {
        e.preventDefault();
        setIsAdminPanelOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

        {/* Layout Mode Selector (Only on wide 2xl screens to avoid crowding) */}
        <div className="hidden 2xl:flex items-center bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 shadow-sm text-xs font-vazir shrink-0">
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
      <div className="hidden xl:flex items-center gap-1.5 shrink-0">
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
            className={`flex items-center gap-1.5 py-1.5 px-2 rounded-xl border transition-all cursor-pointer font-vazir text-xs font-semibold ${
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
            <span className="text-[11px] hidden 2xl:inline">
              {isLiteMode ? '⚡ حالت سبک' : '⚡ بهینه‌سازی'}
            </span>
          </button>
        )}
      </div>

      {/* 3. Right Section: Studios, Mockup, CNC, Certificate, Export */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 min-w-0">
        {/* Mobile Lite Mode Quick Toggle Button (< xl) */}
        {onToggleLiteMode && (
          <button
            onClick={onToggleLiteMode}
            className={`xl:hidden flex items-center gap-1 p-1.5 xs:px-2 rounded-xl border transition-all cursor-pointer text-xs font-bold shrink-0 ${
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

        {/* Undo / Redo for Mobile / Tablet View (< xl) */}
        <div className="flex xl:hidden items-center bg-neutral-900/90 p-0.5 rounded-xl border border-neutral-800">
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

        {/* Masterpieces & Templates */}
        <button
          onClick={() => {
            onOpenTemplates();
          }}
          className="hidden xl:flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-850 text-neutral-200 text-xs font-vazir py-1.5 px-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all shadow-sm shrink-0 cursor-pointer"
          title="قالب‌های آماده و شاهکارهای چلیپا"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-amber-400" />
          <span>قالب‌ها</span>
        </button>

        {/* Unified Studios & Creative Suites Trigger */}
        <button
          onClick={() => {
            if (onOpenMobileStudios) {
              onOpenMobileStudios();
            } else {
              setInternalStudiosOpen(true);
            }
          }}
          className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-500/70 text-amber-300 font-bold text-xs font-vazir shadow-sm transition-all shrink-0 cursor-pointer active:scale-95"
          title="کارگاه‌های تخصصی: قلم‌نی، تذهیب، لیزر و CNC، موکاپ، شناسنامه اثر و..."
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="inline text-[11px] sm:text-xs">کارگاه‌ها</span>
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        </button>

        {/* Zen Presentation Mode */}
        {onOpenZenMode && (
          <button
            onClick={() => {
              onOpenZenMode();
            }}
            className="hidden 2xl:flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-850 text-neutral-300 hover:text-amber-300 text-xs font-vazir py-1.5 px-2 rounded-xl border border-neutral-800 hover:border-amber-500/40 transition-all shadow-sm shrink-0 cursor-pointer"
            title="حالت خلوت و تمام‌صفحه (Zen Mode)"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>تمام‌صفحه</span>
          </button>
        )}

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
            <div className="absolute left-0 top-full mt-2 w-60 max-w-[calc(100vw-24px)] bg-neutral-950/98 border border-neutral-700/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-2 z-50 font-vazir text-xs space-y-1 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
              {/* Quick Layout Mode Switcher (Accessible for all screen sizes) */}
              <div className="p-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 mb-1">
                <span className="text-[10px] text-neutral-400 block mb-1 px-1 font-semibold">چیدمان خوشنویسی:</span>
                <div className="grid grid-cols-5 gap-1">
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
                        setIsToolsMenuOpen(false);
                      }}
                      className={`py-1 text-[10px] rounded-lg transition-all text-center cursor-pointer ${
                        layoutMode === mode.id
                          ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/50'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

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

        {/* VIP / Trial Free Credit Badge */}
        {trialState && (
          trialState.isVip ? (
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs py-1.5 px-2 sm:px-2.5 rounded-xl shadow-sm transition-all shrink-0 cursor-pointer"
              title="نسخه طلایی نامحدود VIP فعال است"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px]">VIP دائمی</span>
            </button>
          ) : (
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="flex items-center gap-1 bg-neutral-900/90 hover:bg-neutral-850 border border-amber-500/40 text-amber-300 font-bold text-xs py-1.5 px-2 sm:px-2.5 rounded-xl shadow-sm transition-all shrink-0 cursor-pointer active:scale-95"
              title="مشاهده وضعیت تست رایگان یا ارتقا به VIP"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-[11px]">
                {Math.max(0, trialState.freeExportsAllowed - trialState.exportsUsed)} تست
              </span>
            </button>
          )
        )}

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

            {/* Quick Performance Toggle at Top */}
            {onToggleLiteMode && (
              <button
                onClick={() => {
                  onToggleLiteMode();
                }}
                className={`w-full p-3 rounded-2xl border text-right flex items-center justify-between transition-all active:scale-98 cursor-pointer ${
                  isLiteMode
                    ? 'bg-emerald-500/20 border-emerald-500/50 shadow-md shadow-emerald-950/40'
                    : 'bg-neutral-900/90 border-neutral-800 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isLiteMode ? 'bg-emerald-500/30 text-emerald-300' : 'bg-neutral-800 text-amber-400'
                  }`}>
                    <Zap className={`w-4 h-4 ${isLiteMode ? 'fill-emerald-400' : ''}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isLiteMode ? 'text-emerald-200' : 'text-neutral-200'}`}>
                        حالت بهینه‌سازی گوشی‌های ضعیف (روان‌سازی و رفع لگ)
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        isLiteMode ? 'bg-emerald-500/30 text-emerald-300' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {isLiteMode ? 'فعال' : 'غیرفعال'}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      شتاب‌دهی پردازش برای گوشی‌های شیائومی و سامسونگ میان‌رده
                    </p>
                  </div>
                </div>
              </button>
            )}

            {/* Category 1: خطاطی، قلم و مهندسی خط */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 border-b border-neutral-800/80 pb-1.5">
                <PenTool className="w-3.5 h-3.5" />
                <span>۱. خطاطی، قلم و مهندسی کلمات</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {onOpenReedPen && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenReedPen();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <PenTool className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">قلم‌نی زنده</span>
                    <span className="text-[10px] text-neutral-400">تراش سنتی قلم، قط قلم و دانگ</span>
                  </button>
                )}

                {onOpenAlternateGlyphs && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenAlternateGlyphs();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Wand2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">فرم‌های جایگزین و کشیدگی</span>
                    <span className="text-[10px] text-neutral-400">یای معکوس، کاف کشیده و تنوع حروف</span>
                  </button>
                )}

                {onOpenSplitWord && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenSplitWord();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Scissors className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">تفکیک کلمات و سیلاب‌ها</span>
                    <span className="text-[10px] text-neutral-400">جداسازی اجزا جهت سوارکردن در چلیپا</span>
                  </button>
                )}

                {onOpenDotRuler && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenDotRuler();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Ruler className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">خط‌کش نقطه‌ای خوشنویسی</span>
                    <span className="text-[10px] text-neutral-400">سنجش ابعاد و دانگ بر اساس نقطه اصیل</span>
                  </button>
                )}

                {onToggleDigitalRuler && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onToggleDigitalRuler();
                    }}
                    className={`p-3 rounded-2xl border text-right flex flex-col gap-1 transition-all active:scale-98 cursor-pointer ${
                      isDigitalRulerActive
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-neutral-900/90 border-neutral-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Ruler className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-200">خط‌کش دیجیتال میلی‌متری</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${isDigitalRulerActive ? 'bg-amber-500 text-black font-bold' : 'text-neutral-400'}`}>
                        {isDigitalRulerActive ? 'فعال' : 'روی بوم'}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400">اندازه‌گیری و شطرنجی دقیق میلی‌متری</span>
                  </button>
                )}

                {onOpenOpticalKerning && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenOpticalKerning();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <MoveHorizontal className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">توازن نوری حروف</span>
                    <span className="text-[10px] text-neutral-400">کرنینگ خودکار و حذف فضای منفی زائد</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category 2: تذهیب، مهر و تزیینات سنتی */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 border-b border-neutral-800/80 pb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>۲. تذهیب، مهر و تزیینات کهن</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {onOpenTazhibBuilder && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenTazhibBuilder();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">سازنده تذهیب و نقوش زرین</span>
                    <span className="text-[10px] text-neutral-400">طراحی شمسه، ترنج، لچک و سرلوحه</span>
                  </button>
                )}

                {onOpenSealStamp && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenSealStamp();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-red-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                      <Stamp className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">مهر موم و امضای سنتی</span>
                    <span className="text-[10px] text-neutral-400">مهر موم سرخ، عقیق و برنج قاجاری</span>
                  </button>
                )}

                {onOpenEbruStudio && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenEbruStudio();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Palette className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">کاغذ ابروباد و طلاافشان</span>
                    <span className="text-[10px] text-neutral-400">شبیه‌ساز ماربلینگ و طلاافشان دست‌ساز</span>
                  </button>
                )}

                {onOpenPalettes && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenPalettes();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Palette className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">پالت‌های رنگی سنتی</span>
                    <span className="text-[10px] text-neutral-400">زر و لاجورد صفوی، شنگرف و زنگار</span>
                  </button>
                )}

                {onOpenMetallicShimmer && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenMetallicShimmer();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <SunMedium className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">شیدرهای متالیک و طلا</span>
                    <span className="text-[10px] text-neutral-400">ورق طلا، نقره مهتابی و مس کهن</span>
                  </button>
                )}

                {onOpenCustomVectorImporter && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenCustomVectorImporter();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <FileCode className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">ورود وکتور SVG شخصی</span>
                    <span className="text-[10px] text-neutral-400">شمسه، کتیبه و نقوش وکتور دلخواه</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category 3: صنایع دستی، موکاپ و تولید */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 border-b border-neutral-800/80 pb-1.5">
                <Frame className="w-3.5 h-3.5" />
                <span>۳. صنایع دستی، موکاپ و تولید</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {onOpenCncLaser && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenCncLaser();
                    }}
                    className="p-3 rounded-2xl bg-emerald-950/30 hover:bg-emerald-900/40 active:scale-98 border border-emerald-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Scissors className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-emerald-200">برش لیزر و طلاسازی</span>
                    <span className="text-[10px] text-neutral-400">پلاک طلا، بدون تقاطع و پل‌های اتصال</span>
                  </button>
                )}

                {onOpenMockup && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenMockup();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Frame className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">موکاپ سه‌بعدی و نمایشگاهی</span>
                    <span className="text-[10px] text-neutral-400">قاب موزه، دیوار گالری و تابلوی چوبی</span>
                  </button>
                )}

                {onOpenCertificate && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenCertificate();
                    }}
                    className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-98 border border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-amber-200">شناسنامه و گواهی اصالت اثر</span>
                    <span className="text-[10px] text-neutral-400">سند رسمی دوزبانه با کد پیگیری و امضا</span>
                  </button>
                )}

                {onOpenProjectBundle && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenProjectBundle();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Archive className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">بسته کامل پروژه (.kelkpkg)</span>
                    <span className="text-[10px] text-neutral-400">استخراج فایل همراه فونت‌ها و تصاویر</span>
                  </button>
                )}

                {onOpenGhostReference && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenGhostReference();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">لایه مشق کهن و مقایسه</span>
                    <span className="text-[10px] text-neutral-400">تطبیق ترکیب و دانگ با خط استادان</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category 4: الهام‌بخش، الگوها و ابزارهای پروژه */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 border-b border-neutral-800/80 pb-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>۴. الهام‌بخش، هوش مصنوعی و الگوها</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenPoetryAi();
                  }}
                  className="p-3 rounded-2xl bg-purple-950/20 hover:bg-purple-900/30 active:scale-98 border border-purple-500/30 text-right flex flex-col gap-1 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <Feather className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-purple-200">هوش مصنوعی شعر و ترکیب</span>
                  <span className="text-[10px] text-neutral-400">پیشنهاد ابیات کهن و ترکیب مصراع‌ها</span>
                </button>

                <button
                  onClick={() => {
                    handleCloseStudios();
                    onOpenTemplates();
                  }}
                  className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <LayoutTemplate className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">قالب‌های شاهکار و چلیپا</span>
                  <span className="text-[10px] text-neutral-400">چلیپای میرعماد، کتیبه و سیاه‌مشق</span>
                </button>

                {onOpenSnippets && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenSnippets();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">ترکیب‌های آماده خوشنویسی</span>
                    <span className="text-[10px] text-neutral-400">صلوات، بسم‌الله و عبارات قدسی</span>
                  </button>
                )}

                {onOpenFontManager && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenFontManager();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <FolderPlus className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">مدیریت فونت‌ها</span>
                    <span className="text-[10px] text-neutral-400">نصب قلم‌های شخصی TTF/OTF/WOFF</span>
                  </button>
                )}

                {onOpenHistorySnapshots && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenHistorySnapshots();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <History className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">تاریخچه و نسخه‌ها</span>
                    <span className="text-[10px] text-neutral-400">ثبت و بازگشت به نسخه‌های قبلی</span>
                  </button>
                )}

                {onOpenWorkspacePresets && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenWorkspacePresets();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Compass className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">میزکارهای هوشمند</span>
                    <span className="text-[10px] text-neutral-400">چلیپا، کتیبه، سیاه‌مشق و قلم‌نی</span>
                  </button>
                )}

                {onOpenZenMode && (
                  <button
                    onClick={() => {
                      handleCloseStudios();
                      onOpenZenMode();
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:scale-98 border border-neutral-800 hover:border-amber-500/40 text-right flex flex-col gap-1 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-200">حالت خلوت (Zen)</span>
                    <span className="text-[10px] text-neutral-400">تمام‌صفحه و نورپردازی موزه</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Primary Export CTA */}
            <div className="pt-2">
              <button
                onClick={() => {
                  handleCloseStudios();
                  onOpenExport();
                }}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-right flex items-center justify-between transition-all shadow-lg shadow-amber-950/50 active:scale-98 cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span className="text-xs font-bold">خروجی و چاپ باکیفیت اثر</span>
                  </div>
                  <span className="text-[10px] text-neutral-900 opacity-90 block mt-0.5">
                    SVG برداری، PDF وکتور، PNG شفاف تا ۳۰۰DPI
                  </span>
                </div>
                <span className="text-xs bg-neutral-950/20 px-2.5 py-1 rounded-lg">شروع خروجی ←</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Trial & VIP Upgrade Modal */}
      {isUpgradeModalOpen && trialState && (
        <TrialUpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          trialState={trialState}
          onActivated={(updated) => {
            setTrialState(updated);
          }}
          onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        />
      )}

      {/* Admin Panel Modal */}
      {isAdminPanelOpen && trialState && (
        <AdminPanelModal
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          trialState={trialState}
          onTrialStateUpdated={(updated) => {
            setTrialState(updated);
          }}
        />
      )}
    </header>
  );
});
