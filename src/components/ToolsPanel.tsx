import React, { useState, useRef, useEffect } from 'react';
import { 
  Type, 
  Sparkles, 
  Layers, 
  Palette, 
  Compass, 
  Copy, 
  Sliders, 
  Plus, 
  Minus,
  Scissors, 
  PenTool, 
  Orbit, 
  CheckCheck, 
  Hash,
  X,
  Split,
  Sparkle,
  Paintbrush,
  Diamond,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Move,
  RotateCw,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List
} from 'lucide-react';
import { ColorWheelPicker } from './ColorWheelPicker';
import { 
  CalligraphyScript, 
  CanvasElement, 
  CanvasLayoutMode, 
  FrameBorderType, 
  PaperTextureType,
  TextCurvePath,
  KorsiGuidesSettings,
  CustomUserFont,
  DotArrangementType,
  TextTextureFillType,
  SymmetryModeType,
  TailEndingType,
  SerkashStyleType
} from '../types/calligraphy';
import { 
  SCRIPT_FONT_MAP, 
  splitTextIntoWords,
  normalizePersianText,
  convertDigitsToPersian
} from '../utils/calligraphyEngine';
import { 
  CALLIGRAPHY_DIACRITICS, 
  DOT_PRESETS, 
  DOT_PRESETS_MAP,
  TAZHIB_COLLECTION 
} from '../data/tazhibAssets';
import { TEXTURE_FILL_PRESETS } from '../utils/calligraphyEffects';
import { LayersPanel } from './LayersPanel';

export type ToolsPanelTab = 'text' | 'curves' | 'dots' | 'effects' | 'symmetry' | 'tazhib' | 'paper' | 'layers';

const SCRIPT_SPECIMENS: Record<string, string> = {
  nastaliq: 'کلک خیال‌انگیز',
  shekasteh: 'هو الجمیل',
  thuluth: 'ن والقلم و ما یسطرون',
  mualla: 'یا علی مدد',
  reqa: 'خط رقاع اصیل',
  naskh: 'بسم الله الرحمن الرحیم',
  kufic: 'الحمد لله رب العالمین',
  diwani: 'دیوانی عثمانی',
  diwani_jali: 'دیوانی جلی کتیبه',
  titr: 'عنوان و پوستر',
  zar: 'متن و کتابت زر',
  dastnevis: 'دست‌خط شاعرانه',
  moraba: 'کوفی مربعی بنایی',
  safir: 'سفیر گرافیک',
  farhad: 'فرهاد و شیرین',
  iran_nastaliq: 'ایران نستعلیق',
};

interface ToolsPanelProps {
  currentScript: CalligraphyScript;
  onScriptChange: (script: CalligraphyScript) => void;
  selectedElement: CanvasElement | null;
  selectedMultiIds?: string[];
  onSelectMultiElements?: (ids: string[]) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onAddElement: (element: CanvasElement) => void;
  onAddElements: (elements: CanvasElement[]) => void;
  elements: CanvasElement[];
  onSelectElement: (id: string | null) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onReorderElement?: (id: string, direction: 'up' | 'down') => void;
  onGroupElements?: (ids: string[]) => void;
  onUngroupElements?: (groupId: string) => void;
  paperTexture: PaperTextureType;
  onPaperTextureChange: (texture: PaperTextureType) => void;
  frameBorder: FrameBorderType;
  onFrameBorderChange: (border: FrameBorderType) => void;
  layoutMode: CanvasLayoutMode;
  onLayoutModeChange: (mode: CanvasLayoutMode) => void;
  canvasWidth: number;
  canvasHeight: number;
  onResizeCanvas: (w: number, h: number) => void;
  korsiGuides?: KorsiGuidesSettings;
  onUpdateKorsiGuides?: (updates: Partial<KorsiGuidesSettings>) => void;
  onOpenAlternateGlyphs?: () => void;
  onOpenSealStamp?: () => void;
  onOpenDotRuler?: () => void;
  onOpenReedPen?: () => void;
  onOpenTazhibBuilder?: () => void;
  onOpenEbruStudio?: () => void;
  onOpenSplitWord?: () => void;
  isDigitalRulerActive?: boolean;
  onToggleDigitalRuler?: () => void;
  onOpenFontManager?: () => void;
  onDirectSplit?: () => void;
  onDetachDots?: (id?: string) => void;
  userFonts?: CustomUserFont[];
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
  activeTabOverride?: ToolsPanelTab;
  onTabChangeOverride?: (tab: ToolsPanelTab) => void;
}

export const ToolsPanel: React.FC<ToolsPanelProps> = React.memo(({
  currentScript,
  onScriptChange,
  selectedElement,
  selectedMultiIds,
  onSelectMultiElements,
  onUpdateElement,
  onAddElement,
  onAddElements,
  elements,
  onSelectElement,
  onDeleteElement,
  onDuplicateElement,
  onReorderElement = () => {},
  onGroupElements = () => {},
  onUngroupElements = () => {},
  paperTexture,
  onPaperTextureChange,
  frameBorder,
  onFrameBorderChange,
  layoutMode,
  onLayoutModeChange,
  canvasWidth,
  canvasHeight,
  onResizeCanvas,
  korsiGuides,
  onUpdateKorsiGuides,
  onOpenAlternateGlyphs,
  onOpenSealStamp,
  onOpenDotRuler,
  onOpenReedPen,
  onOpenTazhibBuilder,
  onOpenEbruStudio,
  onOpenSplitWord,
  onDirectSplit,
  onDetachDots,
  isDigitalRulerActive = false,
  onToggleDigitalRuler,
  onOpenFontManager,
  userFonts = [],
  isMobileDrawerOpen = false,
  onCloseMobileDrawer,
  activeTabOverride,
  onTabChangeOverride,
}) => {
  const [internalTab, setInternalTab] = useState<ToolsPanelTab>('text');
  const activeTab = activeTabOverride || internalTab;

  const setActiveTab = (tab: ToolsPanelTab) => {
    setInternalTab(tab);
    if (onTabChangeOverride) {
      onTabChangeOverride(tab);
    }
  };

  const [inputText, setInputText] = useState('');
  const [textColor, setTextColor] = useState('#18181b');
  const [fontSize, setFontSize] = useState(48);
  const [kashidaLevel, setKashidaLevel] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Collapsible section states for clean organization (Item #4)
  const [isFontSectionOpen, setIsFontSectionOpen] = useState(true);
  const [isVisualCardsOpen, setIsVisualCardsOpen] = useState(false);
  const [isInputSectionOpen, setIsInputSectionOpen] = useState(true);
  const [isPersianToolsOpen, setIsPersianToolsOpen] = useState(false);
  const [isDimensionsOpen, setIsDimensionsOpen] = useState(true);

  // Expanded Diacritics & Harakat state
  const [diacriticCategoryFilter, setDiacriticCategoryFilter] = useState<'all' | 'harakat' | 'tanween' | 'compound' | 'symbol' | 'ornament' | 'sacred'>('all');
  const [diacriticSearch, setDiacriticSearch] = useState('');
  const [diacriticScaleMultiplier, setDiacriticScaleMultiplier] = useState<number>(1);
  const [diacriticCustomColor, setDiacriticCustomColor] = useState<string>('');
  const [quickDiacriticCategory, setQuickDiacriticCategory] = useState<'core' | 'tanween' | 'compounds' | 'poetry' | 'ornaments' | 'sacred'>('core');

  // Sync textColor when selected element changes
  useEffect(() => {
    if (selectedElement && selectedElement.color) {
      setTextColor(selectedElement.color);
    }
  }, [selectedElement?.id, selectedElement?.color]);

  // Normalizes Persian text (fixes Arabic Kaf/Yeh, fixes Hamza, cleans spaces, converts digits)
  const handleNormalizePersian = () => {
    if (selectedElement && selectedElement.text) {
      const normalized = normalizePersianText(selectedElement.text);
      onUpdateElement(selectedElement.id, { text: normalized });
    }
    if (inputText) {
      setInputText(normalizePersianText(inputText));
    }
  };

  // Insert ZWNJ (نیم‌فاصله)
  const handleInsertZWNJ = () => {
    if (textareaRef.current) {
      const ta = textareaRef.current;
      const start = ta.selectionStart || 0;
      const end = ta.selectionEnd || 0;
      const before = inputText.substring(0, start);
      const after = inputText.substring(end);
      const updated = before + '\u200c' + after;
      setInputText(updated);
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(start + 1, start + 1);
      }, 0);
    } else {
      setInputText(prev => prev + '\u200c');
    }
    if (selectedElement && selectedElement.text) {
      onUpdateElement(selectedElement.id, { text: selectedElement.text + '\u200c' });
    }
  };

  // Convert digits to Persian (۰۱۲۳۴۵۶۷۸۹)
  const handleConvertDigits = () => {
    if (selectedElement && selectedElement.text) {
      onUpdateElement(selectedElement.id, { text: convertDigitsToPersian(selectedElement.text) });
    }
    if (inputText) {
      setInputText(convertDigitsToPersian(inputText));
    }
  };

  // Insert specific Persian character or diacritic
  const handleInsertChar = (char: string) => {
    if (textareaRef.current) {
      const ta = textareaRef.current;
      const start = ta.selectionStart || 0;
      const end = ta.selectionEnd || 0;
      const before = inputText.substring(0, start);
      const after = inputText.substring(end);
      const updated = before + char + after;
      setInputText(updated);
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(start + char.length, start + char.length);
      }, 0);
    } else {
      setInputText(prev => prev + char);
    }
    if (selectedElement && selectedElement.text) {
      onUpdateElement(selectedElement.id, { text: selectedElement.text + char });
    }
  };

  // Traditional Ink Color Palette
  const TRADITIONAL_INKS = [
    { name: 'مشکی دوده', color: '#18181b' },
    { name: 'سرمه‌ای لاجوردی', color: '#0f172a' },
    { name: 'قهوه‌ای گردویی', color: '#451a03' },
    { name: 'عنابی کهن', color: '#881337' },
    { name: 'زر طلا / زعفرانی', color: '#d97706' },
    { name: 'لاجورد نیشابور', color: '#1e3a8a' },
    { name: 'سبز زنگار', color: '#064e3b' },
    { name: 'شنگرف سرخ', color: '#991b1b' },
  ];

  // Add Full Line
  const handleAddFullLine = () => {
    if (!inputText.trim()) return;
    const resolvedFontFamily = (currentScript === 'custom' && userFonts.length > 0)
      ? userFonts[0].fontFamily
      : (SCRIPT_FONT_MAP[currentScript]?.cssFamily || 'IranNastaliq, serif');

    const newEl: CanvasElement = {
      id: `text_${Date.now()}`,
      type: 'text',
      text: inputText.trim(),
      script: currentScript,
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      fontSize: fontSize,
      fontFamily: resolvedFontFamily,
      color: textColor,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: elements.length + 1,
      kashidaLevel: kashidaLevel,
    };
    onAddElement(newEl);
  };

  // Add Word by Word
  const handleAddWordByWord = () => {
    if (!inputText.trim()) return;
    const customFont = (currentScript === 'custom' && userFonts.length > 0) ? userFonts[0].fontFamily : undefined;
    const words = splitTextIntoWords(
      inputText.trim(),
      currentScript,
      canvasWidth * 0.35,
      canvasHeight * 0.45,
      fontSize,
      textColor,
      customFont
    );
    onAddElements(words);
  };

  // Insert Diacritic / Tashkeel
  const handleInsertDiacritic = (char: string, scaleMul?: number, customColor?: string) => {
    const mul = scaleMul !== undefined ? scaleMul : diacriticScaleMultiplier;
    const finalSize = Math.max(16, Math.round(fontSize * 0.75 * mul));
    const finalColor = customColor || diacriticCustomColor || (selectedElement ? selectedElement.color : textColor);

    const newEl: CanvasElement = {
      id: `tashkeel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'tashkeel',
      text: char,
      x: selectedElement ? selectedElement.x + (Math.random() * 20 - 10) : canvasWidth / 2,
      y: selectedElement ? selectedElement.y - 32 : canvasHeight / 2,
      fontSize: finalSize,
      fontFamily: SCRIPT_FONT_MAP[currentScript].cssFamily,
      color: finalColor,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: elements.length + 1,
    };
    onAddElement(newEl);
  };

  // Insert Dot Preset
  const handleInsertDot = (dotPresetId: string) => {
    let dotChar = '◆';
    if (dotPresetId === 'double_nastaliq_dots') dotChar = '◆ ◆';
    if (dotPresetId === 'triple_pyramid_dots' || dotPresetId === 'triple_inverted_dots') dotChar = '⁂';
    if (dotPresetId === 'shekasteh_slash_dot') dotChar = 'ــــ';

    const preset = DOT_PRESETS_MAP.get(dotPresetId);

    const newEl: CanvasElement = {
      id: `dot_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: preset ? preset.name : 'نقطه',
      type: 'dot',
      dotPreset: dotPresetId,
      text: dotChar,
      x: selectedElement ? selectedElement.x + 20 : Math.round(canvasWidth / 2),
      y: selectedElement ? selectedElement.y + 35 : Math.round(canvasHeight / 2),
      fontSize: selectedElement ? Math.round(selectedElement.fontSize * 0.7) : Math.round(fontSize * 0.6),
      fontFamily: selectedElement ? selectedElement.fontFamily : SCRIPT_FONT_MAP[currentScript].cssFamily,
      color: selectedElement ? selectedElement.color : textColor,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: elements.length + 1,
    };
    onAddElement(newEl);
  };

  // Insert Tazhib Ornament
  const handleInsertTazhib = (tazhibId: string) => {
    const item = TAZHIB_COLLECTION.find(t => t.id === tazhibId);
    if (!item) return;

    const newEl: CanvasElement = {
      id: `tazhib_${Date.now()}`,
      type: 'tazhib',
      tazhibName: item.id,
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      fontSize: 40,
      fontFamily: '',
      color: item.defaultColor || '#d97706',
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 0.9,
      zIndex: 1,
      width: item.category === 'border' ? 200 : (item.category === 'shamseh' ? 100 : 80),
      height: item.category === 'border' ? 40 : (item.category === 'shamseh' ? 100 : 80),
    };
    onAddElement(newEl);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      <div 
        onClick={onCloseMobileDrawer}
        className={`lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 ease-out ${
          isMobileDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside 
        className={`
          fixed lg:relative inset-y-0 right-0 z-50 lg:z-20 w-full sm:w-[380px] lg:w-96 flex flex-col
          h-full bg-neutral-950/98 border-r lg:border-r-0 lg:border-l border-neutral-800/80 select-none backdrop-blur-xl
          transition-transform duration-300 ease-out pb-16 lg:pb-0
          ${isMobileDrawerOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Header Bar with Close Button */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-sm font-bold text-neutral-100 font-vazir">جعبه‌ابزار و تنظیمات قلم</span>
          </div>
          <button
            onClick={onCloseMobileDrawer}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            title="بستن پنل"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (2 Rows, 4 Tabs each - 100% visible and accessible without scrolling) */}
        <div className="grid grid-cols-4 gap-1 p-1.5 border-b border-neutral-800/80 bg-neutral-900/70 shrink-0">
        {[
          { id: 'text', label: 'قلم و کلمات', icon: Type },
          { id: 'dots', label: 'اعراب و نقاط', icon: Sparkles },
          { id: 'curves', label: 'انحنا و کتیبه', icon: Orbit },
          { id: 'effects', label: 'بافت و افکت', icon: Paintbrush },
          { id: 'symmetry', label: 'المثنی و طغرا', icon: Split },
          { id: 'tazhib', label: 'تذهیب و اسلیمی', icon: Compass },
          { id: 'paper', label: 'کاغذ و قاب', icon: Palette },
          { id: 'layers', label: 'لایه‌ها', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 text-[11px] font-vazir font-semibold flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap text-[10px] leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-neutral-200 font-vazir">
        {/* =================== TAB 1: TEXT & KASHIDA =================== */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            {/* Master Font / Script Selection Card (Item #4 Collapsible & Item #5 Visual Script Cards) */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3.5 space-y-2.5 transition-all shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => setIsFontSectionOpen(!isFontSectionOpen)}
                  className="font-semibold text-neutral-200 flex items-center gap-1.5 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <Type className="w-3.5 h-3.5 text-amber-400" />
                  <span>انتخاب قلم و فونت:</span>
                  <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono mr-1">
                    {SCRIPT_FONT_MAP[selectedElement?.script || currentScript]?.name}
                  </span>
                  {isFontSectionOpen ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsVisualCardsOpen(!isVisualCardsOpen)}
                    className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                      isVisualCardsOpen
                        ? 'bg-amber-500/25 text-amber-300 border-amber-500/50'
                        : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                    title={isVisualCardsOpen ? 'نمایش به صورت فهرست فشرده' : 'نمایش کارت‌های بصری قلم'}
                  >
                    {isVisualCardsOpen ? <List className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
                    <span className="text-[10px] hidden sm:inline">{isVisualCardsOpen ? 'فهرست' : 'کارت‌ها'}</span>
                  </button>

                  {onOpenFontManager && (
                    <button
                      onClick={onOpenFontManager}
                      className="text-[11px] text-amber-400 hover:text-amber-300 p-1.5 rounded-lg bg-neutral-950/70 border border-neutral-800 hover:border-amber-500/40 flex items-center gap-1 font-semibold transition-colors"
                      title="مدیریت و آپلود فونت"
                    >
                      <Sparkles className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {isFontSectionOpen && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  {/* Visual Script Cards Gallery View */}
                  {isVisualCardsOpen ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1 no-scrollbar">
                      {/* User Custom Fonts if any */}
                      {userFonts.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-amber-400 font-bold px-1">فونت‌های اختصاصی شما:</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {userFonts.map(uf => {
                              const isSelected = selectedElement 
                                ? (selectedElement.script === 'custom' && selectedElement.fontFamily === uf.fontFamily)
                                : (currentScript === 'custom');
                              return (
                                <button
                                  key={uf.id}
                                  type="button"
                                  onClick={() => {
                                    onScriptChange('custom');
                                    if (selectedElement) {
                                      onUpdateElement(selectedElement.id, { script: 'custom', fontFamily: uf.fontFamily });
                                    }
                                  }}
                                  className={`p-2 rounded-xl border text-right transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-sm'
                                      : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                                  }`}
                                >
                                  <div className="text-xs font-bold truncate">★ {uf.name}</div>
                                  <div className="text-[11px] mt-1 text-amber-200/80 line-clamp-1" style={{ fontFamily: uf.fontFamily }}>
                                    کلک هنر و خطاطی
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Traditional & Classical Scripts */}
                      <div className="grid grid-cols-2 gap-1.5">
                        {Object.entries(SCRIPT_FONT_MAP)
                          .filter(([k]) => k !== 'custom')
                          .map(([key, item]) => {
                            const scriptKey = key as CalligraphyScript;
                            const isSelected = selectedElement ? selectedElement.script === scriptKey : currentScript === scriptKey;
                            const specimen = SCRIPT_SPECIMENS[scriptKey] || 'کلک هنر و خوشنویسی';
                            return (
                              <button
                                key={scriptKey}
                                type="button"
                                onClick={() => {
                                  onScriptChange(scriptKey);
                                  if (selectedElement) {
                                    onUpdateElement(selectedElement.id, {
                                      script: scriptKey,
                                      fontFamily: item.cssFamily
                                    });
                                  }
                                }}
                                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer relative overflow-hidden group ${
                                  isSelected
                                    ? 'bg-amber-600/25 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40'
                                    : 'bg-neutral-950/85 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/90 text-neutral-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold">{item.name}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-sans ${
                                    item.category === 'traditional' ? 'bg-amber-500/15 text-amber-300' :
                                    item.category === 'kufic' ? 'bg-blue-500/15 text-blue-300' :
                                    item.category === 'diwani_naskh' ? 'bg-emerald-500/15 text-emerald-300' :
                                    item.category === 'display' ? 'bg-purple-500/15 text-purple-300' :
                                    'bg-rose-500/15 text-rose-300'
                                  }`}>
                                    {item.category === 'traditional' ? 'اصیل سنتی' :
                                     item.category === 'kufic' ? 'کوفی' :
                                     item.category === 'diwani_naskh' ? 'دیوانی/نسخ' :
                                     item.category === 'display' ? 'پوستر' : 'تحریری'}
                                  </span>
                                </div>
                                <div 
                                  className="text-sm mt-1.5 text-amber-100/90 line-clamp-1 py-0.5" 
                                  style={{ fontFamily: item.cssFamily }}
                                >
                                  {specimen}
                                </div>
                                <div className="text-[9px] text-neutral-500 line-clamp-1 mt-0.5">
                                  {item.desc}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ) : (
                    /* Compact Dropdown Selector */
                    <div className="space-y-1.5">
                      <select
                        value={
                          selectedElement
                            ? (selectedElement.script === 'custom'
                                ? (userFonts.find(f => f.fontFamily === selectedElement.fontFamily)
                                    ? `custom_${userFonts.find(f => f.fontFamily === selectedElement.fontFamily)!.id}`
                                    : 'custom')
                                : selectedElement.script)
                            : (currentScript === 'custom' && userFonts.length > 0
                                ? `custom_${userFonts[0].id}`
                                : currentScript)
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('custom_')) {
                            const ufId = val.replace('custom_', '');
                            const uf = userFonts.find(f => f.id === ufId);
                            onScriptChange('custom');
                            if (selectedElement && uf) {
                              onUpdateElement(selectedElement.id, {
                                script: 'custom',
                                fontFamily: uf.fontFamily
                              });
                            }
                          } else if (val === 'custom') {
                            onScriptChange('custom');
                            if (selectedElement && userFonts.length > 0) {
                              onUpdateElement(selectedElement.id, {
                                script: 'custom',
                                fontFamily: userFonts[0].fontFamily
                              });
                            }
                          } else {
                            const scriptVal = val as CalligraphyScript;
                            onScriptChange(scriptVal);
                            if (selectedElement) {
                              const meta = SCRIPT_FONT_MAP[scriptVal];
                              if (meta) {
                                onUpdateElement(selectedElement.id, { 
                                  script: scriptVal,
                                  fontFamily: meta.cssFamily 
                                });
                              }
                            }
                          }
                        }}
                        className="w-full bg-neutral-950/90 border border-neutral-700/80 hover:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                      >
                        {userFonts.length > 0 && (
                          <optgroup label="فونت‌های اختصاصی شما (آپلود شده)" className="bg-neutral-950 text-amber-400 font-bold">
                            {userFonts.map(uf => (
                              <option key={uf.id} value={`custom_${uf.id}`} className="bg-neutral-900 text-neutral-200">
                                ★ {uf.name} (فونت من)
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="خوشنویسی سنتی و اقلام اصیل" className="bg-neutral-950 text-neutral-400 font-bold">
                          {Object.entries(SCRIPT_FONT_MAP)
                            .filter(([k, v]) => k !== 'custom' && v.category === 'traditional')
                            .map(([key, item]) => (
                              <option key={key} value={key} className="bg-neutral-900 text-neutral-200">
                                {item.name}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="کوفی و کتیبه‌ای" className="bg-neutral-950 text-neutral-400 font-bold">
                          {Object.entries(SCRIPT_FONT_MAP)
                            .filter(([k, v]) => v.category === 'kufic')
                            .map(([key, item]) => (
                              <option key={key} value={key} className="bg-neutral-900 text-neutral-200">
                                {item.name}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="دیوانی، نسخ و عثمانی" className="bg-neutral-950 text-neutral-400 font-bold">
                          {Object.entries(SCRIPT_FONT_MAP)
                            .filter(([k, v]) => v.category === 'diwani_naskh')
                            .map(([key, item]) => (
                              <option key={key} value={key} className="bg-neutral-900 text-neutral-200">
                                {item.name}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="تایپوگرافی و عناوین پوستر" className="bg-neutral-950 text-neutral-400 font-bold">
                          {Object.entries(SCRIPT_FONT_MAP)
                            .filter(([k, v]) => v.category === 'display')
                            .map(([key, item]) => (
                              <option key={key} value={key} className="bg-neutral-900 text-neutral-200">
                                {item.name}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="دست‌نویس و تحریری" className="bg-neutral-950 text-neutral-400 font-bold">
                          {Object.entries(SCRIPT_FONT_MAP)
                            .filter(([k, v]) => v.category === 'handwriting')
                            .map(([key, item]) => (
                              <option key={key} value={key} className="bg-neutral-900 text-neutral-200">
                                {item.name}
                              </option>
                            ))}
                        </optgroup>
                      </select>

                      <p className="text-[11px] text-neutral-400 line-clamp-1 px-1">
                        {SCRIPT_FONT_MAP[selectedElement?.script || currentScript]?.desc}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Card (Item #4 Collapsible) */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3.5 space-y-2.5 transition-all shadow-sm">
              <button
                type="button"
                onClick={() => setIsInputSectionOpen(!isInputSectionOpen)}
                className="w-full flex justify-between items-center text-xs text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-amber-400" />
                  <span>نگارش متن و سطر خوشنویسی</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-mono text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {SCRIPT_FONT_MAP[currentScript]?.name}
                  </span>
                  {isInputSectionOpen ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
                </div>
              </button>

              {isInputSectionOpen && (
                <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
                  {/* Persian Typography Optimizer Quick Toolbar (Collapsible Sub-accordion) */}
                  <div className="bg-neutral-950/70 border border-neutral-800/90 rounded-xl p-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsPersianToolsOpen(!isPersianToolsOpen)}
                      className="w-full flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-[11px] font-bold text-amber-400/90 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>بهینه‌ساز خط فارسی و اعراب سریع</span>
                      </span>
                      <span className="text-[10px] text-neutral-500 flex items-center gap-0.5">
                        {isPersianToolsOpen ? 'بستن' : 'ابزارها'}
                        {isPersianToolsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </span>
                    </button>

                    {isPersianToolsOpen && (
                      <div className="space-y-2 pt-1 animate-in fade-in duration-150">

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={handleNormalizePersian}
                    className="flex items-center justify-center gap-1 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-700/40 py-1 px-1.5 rounded-lg transition-all"
                    title="تبدیل خودکار ك به ک، ي به ی، ة به ه، استانداردسازی هٔ و فواصل"
                  >
                    <CheckCheck className="w-3 h-3 text-amber-400" />
                    <span>اصلاح فارسی (ک/ی/هٔ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleInsertZWNJ}
                    className="flex items-center justify-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/70 py-1 px-1.5 rounded-lg transition-all font-mono"
                    title="درج نیم‌فاصله استاندارد فارسی (Zero-Width Non-Joiner)"
                  >
                    <span className="text-amber-400 font-bold text-xs">‌</span>
                    <span>نیم‌فاصله (ZWNJ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConvertDigits}
                    className="flex items-center justify-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/70 py-1 px-1.5 rounded-lg transition-all font-mono"
                    title="تبدیل اعداد انگلیسی و عربی به ارقام فارسی (۰۱۲۳۴۵۶۷۸۹)"
                  >
                    <Hash className="w-3 h-3 text-amber-400" />
                    <span>ارقام فارسی (۱۲۳)</span>
                  </button>
                </div>

                {/* Quick Persian Specific Characters Pills */}
                <div className="space-y-1 pt-1 border-t border-neutral-850">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span>حروف اصیل فارسی:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['گ', 'چ', 'پ', 'ژ', 'ک', 'ی', 'هٔ', 'آ', 'ے', 'ـ'].map(ch => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => handleInsertChar(ch)}
                        className="px-2 py-0.5 rounded-md bg-neutral-900 hover:bg-amber-600/30 text-amber-200 hover:text-amber-300 border border-neutral-800 hover:border-amber-500/40 text-xs font-bold transition-all"
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Persian Diacritics & Aerab - Comprehensive & Grouped */}
                <div className="space-y-1.5 pt-1 border-t border-neutral-850">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="font-bold text-amber-300/90">اعراب و حرکات سریع متن:</span>
                    <div className="flex items-center gap-1">
                      {[
                        { id: 'core', label: 'حرکات' },
                        { id: 'tanween', label: 'تنوین' },
                        { id: 'compounds', label: 'ترکیب‌ها' },
                        { id: 'poetry', label: 'شعر' },
                        { id: 'ornaments', label: 'تزیینات' },
                        { id: 'sacred', label: 'صلوات' }
                      ].map(g => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setQuickDiacriticCategory(g.id as any)}
                          className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
                            quickDiacriticCategory === g.id
                              ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40'
                              : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {quickDiacriticCategory === 'core' && [
                      { sym: 'َ', name: 'فتحه / زبر' },
                      { sym: 'ِ', name: 'کسره / زیر' },
                      { sym: 'ُ', name: 'ضمه / پیش' },
                      { sym: 'ّ', name: 'تشدید' },
                      { sym: 'ْ', name: 'سکون / جزم' },
                      { sym: 'ٓ', name: 'مد روی الف' },
                      { sym: 'ٰ', name: 'الف مقصوره' },
                      { sym: 'ٔ', name: 'همزه بالا' },
                      { sym: 'ٕ', name: 'همزه زیرین' },
                      { sym: 'ٗ', name: 'اشباع واو' },
                      { sym: 'ٖ', name: 'اشباع یاء' },
                    ].map(dia => (
                      <button
                        key={dia.name}
                        type="button"
                        onClick={() => handleInsertChar(dia.sym)}
                        title={dia.name}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-900 hover:bg-amber-500/20 text-amber-300 border border-neutral-800 text-base font-bold transition-all hover:scale-105 active:scale-95"
                      >
                        {dia.sym}
                      </button>
                    ))}

                    {quickDiacriticCategory === 'tanween' && [
                      { sym: 'ً', name: 'تنوین نصب (ـاً)' },
                      { sym: 'ٌ', name: 'تنوین رفع (ـٌ)' },
                      { sym: 'ٍ', name: 'تنوین جر (ـٍ)' },
                    ].map(dia => (
                      <button
                        key={dia.name}
                        type="button"
                        onClick={() => handleInsertChar(dia.sym)}
                        title={dia.name}
                        className="h-7 px-2 flex items-center justify-center rounded-lg bg-neutral-900 hover:bg-amber-500/20 text-amber-300 border border-neutral-800 text-sm font-bold transition-all hover:scale-105 active:scale-95"
                      >
                        {dia.sym}
                      </button>
                    ))}

                    {quickDiacriticCategory === 'compounds' && [
                      { sym: 'َّ', name: 'تشدید با فتحه' },
                      { sym: 'ُّ', name: 'تشدید با ضمه' },
                      { sym: 'ِّ', name: 'تشدید با کسره' },
                      { sym: 'ًّ', name: 'تشدید با تنوین نصب' },
                      { sym: 'ٌّ', name: 'تشدید با تنوین رفع' },
                      { sym: 'ـ', name: 'کشیده / تطویل' },
                      { sym: 'ۛ', name: 'زلفی و سرکج' },
                      { sym: 'ٱ', name: 'همزه وصل' },
                    ].map(dia => (
                      <button
                        key={dia.name}
                        type="button"
                        onClick={() => handleInsertChar(dia.sym)}
                        title={dia.name}
                        className="h-7 px-2 flex items-center justify-center rounded-lg bg-neutral-900 hover:bg-amber-500/20 text-amber-300 border border-neutral-800 text-sm font-bold transition-all hover:scale-105 active:scale-95"
                      >
                        {dia.sym}
                      </button>
                    ))}

                    {quickDiacriticCategory === 'poetry' && [
                      { sym: '؏', name: 'علامت مصرع شعر' },
                      { sym: 'ؔ', name: 'علامت تخلص شاعر' },
                      { sym: '؁', name: 'علامت سنه تاریخی' },
                      { sym: '؂', name: 'علامت صفحه' },
                      { sym: '؃', name: 'علامت شماره بیت' },
                      { sym: '﴾', name: 'پرانتز اسلیمی راست' },
                      { sym: '﴿', name: 'پرانتز اسلیمی چپ' },
                      { sym: '،', name: 'ویرگول سنتی' },
                      { sym: '؛', name: 'سجاوندی سنتی' },
                    ].map(dia => (
                      <button
                        key={dia.name}
                        type="button"
                        onClick={() => handleInsertChar(dia.sym)}
                        title={dia.name}
                        className="h-7 px-2 flex items-center justify-center rounded-lg bg-neutral-900 hover:bg-amber-500/20 text-amber-300 border border-neutral-800 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                      >
                        {dia.sym}
                      </button>
                    ))}

                    {quickDiacriticCategory === 'ornaments' && [
                      { sym: '۝', name: 'گل ختم آیه و ترنج' },
                      { sym: '۞', name: 'ستاره هشت‌پر زرین' },
                      { sym: '۩', name: 'سجده و ربع الحزب' },
                      { sym: '◆', name: 'دانگ نقطه قلم لوزی' },
                      { sym: '◇', name: 'لوزی میان‌تهی' },
                      { sym: '⁂', name: 'سه نقطه تاجی' },
                      { sym: '❀', name: 'گل پنج‌پر' },
                      { sym: '❦', name: 'برگ ختایی' },
                      { sym: '✦', name: 'ستاره چهارپر' },
                      { sym: '✵', name: 'شمسه هشت‌پر' },
                    ].map(dia => (
                      <button
                        key={dia.name}
                        type="button"
                        onClick={() => handleInsertChar(dia.sym)}
                        title={dia.name}
                        className="h-7 px-2 flex items-center justify-center rounded-lg bg-neutral-900 hover:bg-amber-500/20 text-amber-300 border border-neutral-800 text-sm font-bold transition-all hover:scale-105 active:scale-95"
                      >
                        {dia.sym}
                      </button>
                    ))}

                    {quickDiacriticCategory === 'sacred' && [
                      { sym: '﷽', name: 'بسم الله الرحمن الرحیم' },
                      { sym: 'ﷻ', name: 'جل جلاله' },
                      { sym: 'ﷺ', name: 'صلی الله علیه و آله' },
                      { sym: 'ؑ', name: 'علیه السلام' },
                      { sym: 'ؓ', name: 'رضی الله عنه' },
                      { sym: 'ؒ', name: 'رحمه الله' },
                    ].map(dia => (
                      <button
                        key={dia.name}
                        type="button"
                        onClick={() => handleInsertChar(dia.sym)}
                        title={dia.name}
                        className="h-7 px-2 flex items-center justify-center rounded-lg bg-neutral-900 hover:bg-amber-500/20 text-amber-300 border border-neutral-800 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                      >
                        {dia.sym}
                      </button>
                    ))}
                  </div>
                </div>
                      </div>
                    )}
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onPaste={(e) => {
                      const pasted = e.clipboardData?.getData('text');
                      if (pasted) {
                        e.preventDefault();
                        const sanitized = normalizePersianText(pasted, { convertDigits: true, fixHamza: true, cleanSpaces: true });
                        const ta = textareaRef.current;
                        if (ta) {
                          const start = ta.selectionStart || 0;
                          const end = ta.selectionEnd || 0;
                          const updated = inputText.substring(0, start) + sanitized + inputText.substring(end);
                          setInputText(updated);
                          setTimeout(() => {
                            ta.setSelectionRange(start + sanitized.length, start + sanitized.length);
                          }, 0);
                        } else {
                          setInputText(prev => prev + sanitized);
                        }
                      }
                    }}
                    rows={2}
                    placeholder="متن دلخواه یا شعر فارسی را بنویسید..."
                    className="w-full bg-neutral-950/80 border border-neutral-700/80 rounded-xl p-3 text-neutral-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed font-vazir"
                  />

                  {/* Insertion Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleAddFullLine}
                      className="flex items-center justify-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold py-2 px-3 rounded-xl border border-neutral-700 text-xs transition-all active:scale-95 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>درج سطر کامل</span>
                    </button>
                    <button
                      onClick={handleAddWordByWord}
                      className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-600/30 to-amber-700/30 hover:from-amber-600/50 hover:to-amber-700/50 text-amber-200 font-semibold py-2 px-3 rounded-xl border border-amber-500/40 text-xs transition-all active:scale-95 shadow-sm cursor-pointer"
                      title="تفکیک به کلمات مستقل جهت سوار کردن و ترکیب دستی (ویژگی کلیدی کلک)"
                    >
                      <Sliders className="w-4 h-4 text-amber-300" />
                      <span>تفکیک کلمات (کلک)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Studios Bar */}
            <div className="grid grid-cols-2 gap-2">
              {(onOpenSplitWord || onDirectSplit) && (
                <button
                  onClick={() => {
                    if (selectedElement && onDirectSplit) {
                      onDirectSplit();
                    } else if (onOpenSplitWord) {
                      onOpenSplitWord();
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-850 hover:border-amber-500/40 border border-neutral-800 text-xs text-neutral-300 hover:text-amber-300 transition-all cursor-pointer"
                  title={selectedElement ? 'تفکیک فوری کلمه یا سطر انتخابی به اجزا' : 'کارگاه تفکیک کلمه به حروف'}
                >
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedElement ? 'تفکیک فوری المان' : 'تفکیک کلمه به حروف'}</span>
                </button>
              )}
              {onOpenReedPen && (
                <button
                  onClick={onOpenReedPen}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-800 text-xs text-amber-300 transition-all cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5 text-amber-400" />
                  <span>قلم‌نی زنده (سیاه‌مشق)</span>
                </button>
              )}
            </div>

            {/* Live Kashida & Parameters (Item #4 Collapsible) */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3.5 space-y-3.5 shadow-sm transition-all">
              <button
                type="button"
                onClick={() => setIsDimensionsOpen(!isDimensionsOpen)}
                className="w-full flex items-center justify-between text-xs font-semibold hover:text-amber-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-neutral-200">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>ابعاد قلم، کشیدگی و رنگ مرکب:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {selectedElement ? (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                      المان انتخابی
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-500">تنظیم کلی</span>
                  )}
                  {isDimensionsOpen ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
                </div>
              </button>

              {isDimensionsOpen && (
                <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
                  {/* Kashida Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>میزان کشیدگی (مد / کشیده):</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {selectedElement ? (selectedElement.kashidaLevel || 0) : kashidaLevel}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      value={selectedElement ? (selectedElement.kashidaLevel || 0) : kashidaLevel}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (selectedElement) {
                          onUpdateElement(selectedElement.id, { kashidaLevel: val });
                        } else {
                          setKashidaLevel(val);
                        }
                      }}
                      className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Font Size */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>دانگ و ضخامت قلم (اندازه):</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {selectedElement ? selectedElement.fontSize : fontSize} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="180"
                      value={selectedElement ? selectedElement.fontSize : fontSize}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (selectedElement) {
                          onUpdateElement(selectedElement.id, { fontSize: val });
                        } else {
                          setFontSize(val);
                        }
                      }}
                      className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Baseline Vertical Shift */}
                  {selectedElement && (
                    <div className="space-y-1.5 pt-1 border-t border-neutral-800">
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>سوار کردن / جابجایی خط کرسی:</span>
                        <span className="font-mono text-amber-400 font-bold">
                          {selectedElement.baselineShift || 0} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-80"
                        max="80"
                        value={selectedElement.baselineShift || 0}
                        onChange={(e) => {
                          onUpdateElement(selectedElement.id, { baselineShift: Number(e.target.value) });
                        }}
                        className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Color Wheel & Traditional Inks */}
                  <div className="pt-2 border-t border-neutral-800">
                    <ColorWheelPicker
                      color={selectedElement ? (selectedElement.color || textColor) : textColor}
                      onChange={(newColor) => {
                        setTextColor(newColor);
                        if (selectedElement) {
                          onUpdateElement(selectedElement.id, { color: newColor });
                        }
                      }}
                      goldEffect={selectedElement?.goldEffect || false}
                      onToggleGoldEffect={selectedElement ? () => {
                        onUpdateElement(selectedElement.id, { goldEffect: !selectedElement.goldEffect });
                      } : undefined}
                      title="دایره انتخاب رنگ و مرکب کلمه"
                      showPresets={true}
                      compact={false}
                      wordsList={selectedElement && selectedElement.text && selectedElement.type !== 'dot' && selectedElement.type !== 'tazhib' && selectedElement.text.trim().includes(' ')
                        ? selectedElement.text.trim().split(/\s+/).map(w => ({ text: w, color: selectedElement.color || textColor }))
                        : undefined
                      }
                      onSplitToColoredWords={onDirectSplit}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================== TAB 2: CURVES & PATHS =================== */}
        {activeTab === 'curves' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
                <Orbit className="w-4 h-4 text-amber-400" />
                <span>انحنای متن روی مسیرهای هندسی و سنتی</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                چیدمان متن روی قوس‌های هندسی، دایره‌های کتیبه، امواج و محراب‌های سنتی
              </p>

              {selectedElement && selectedElement.type !== 'tazhib' ? (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'none', label: 'مستقیم (صاف)' },
                      { id: 'arc_up', label: 'قوس محدب (بالا)' },
                      { id: 'arc_down', label: 'قوس مقعر (پایین)' },
                      { id: 'wave', label: 'موج اسلیمی (S)' },
                      { id: 'circle', label: 'دایره / کتیبه گرد' },
                      { id: 'arch', label: 'طاق محرابی' },
                      { id: 'spiral', label: 'اسپیرال حلزونی' },
                    ].map((curve) => (
                      <button
                        key={curve.id}
                        onClick={() => onUpdateElement(selectedElement.id, { 
                          curveType: curve.id as TextCurvePath,
                          curvature: selectedElement.curvature || 50,
                          curveRadius: selectedElement.curveRadius || 180
                        })}
                        className={`p-2.5 rounded-xl border text-xs font-vazir text-center transition-all ${
                          (selectedElement.curveType || 'none') === curve.id
                            ? 'bg-amber-500/25 text-amber-300 border-amber-500 font-bold shadow-sm'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {curve.label}
                      </button>
                    ))}
                  </div>

                  {selectedElement.curveType && selectedElement.curveType !== 'none' && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-neutral-400">
                          <span>شدت انحنا و قوس:</span>
                          <span className="font-mono text-amber-400 font-bold">{selectedElement.curvature || 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={selectedElement.curvature || 50}
                          onChange={(e) => onUpdateElement(selectedElement.id, { curvature: Number(e.target.value) })}
                          className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
                        />
                      </div>

                      {selectedElement.curveType === 'circle' && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-neutral-400">
                            <span>شعاع دایره کتیبه:</span>
                            <span className="font-mono text-amber-400 font-bold">{selectedElement.curveRadius || 180} px</span>
                          </div>
                          <input
                            type="range"
                            min="60"
                            max="360"
                            value={selectedElement.curveRadius || 180}
                            onChange={(e) => onUpdateElement(selectedElement.id, { curveRadius: Number(e.target.value) })}
                            className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-neutral-500">
                  ابتدا یک متن یا کلمه را در صفحه انتخاب کنید تا تنظیمات انحنا برای آن فعال شود.
                </div>
              )}
            </div>

            {/* Korsi Guides Settings Card */}
            {korsiGuides && onUpdateKorsiGuides && (
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-200">
                  <span>راهنماهای مغناطیسی و خطوط کرسی:</span>
                  <label className="flex items-center gap-1.5 text-xs text-amber-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={korsiGuides.showGuides}
                      onChange={(e) => onUpdateKorsiGuides({ showGuides: e.target.checked })}
                      className="accent-amber-500 rounded"
                    />
                    <span>نمایش</span>
                  </label>
                </div>

                {korsiGuides.showGuides && (
                  <div className="space-y-2 pt-2 text-xs">
                    <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-850 cursor-pointer">
                      <span>خط مبدأ (سرکش‌های بالا)</span>
                      <input
                        type="checkbox"
                        checked={korsiGuides.showMabda}
                        onChange={(e) => onUpdateKorsiGuides({ showMabda: e.target.checked })}
                        className="accent-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-850 cursor-pointer">
                      <span>خط کرسی زمینه (اصلی)</span>
                      <input
                        type="checkbox"
                        checked={korsiGuides.showVasat}
                        onChange={(e) => onUpdateKorsiGuides({ showVasat: e.target.checked })}
                        className="accent-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-850 cursor-pointer">
                      <span>خط فرود (دایره‌های نون و ی)</span>
                      <input
                        type="checkbox"
                        checked={korsiGuides.showForood}
                        onChange={(e) => onUpdateKorsiGuides({ showForood: e.target.checked })}
                        className="accent-red-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-850 cursor-pointer">
                      <span>چسبندگی مغناطیسی (Magnetic Snapping)</span>
                      <input
                        type="checkbox"
                        checked={korsiGuides.enableSnapping}
                        onChange={(e) => onUpdateKorsiGuides({ enableSnapping: e.target.checked })}
                        className="accent-amber-500"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =================== TAB 3: DOTS & DIACRITICS =================== */}
        {activeTab === 'dots' && (
          <div className="space-y-4">
            {/* Case A: Selected Element is an Independent Dot Element */}
            {selectedElement && selectedElement.type === 'dot' && (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/30 to-neutral-900/90 border border-amber-500/40 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                    <Diamond className="w-4 h-4 text-amber-400" />
                    <span>تنظیم و جابجایی نقطه انتخاب‌شده {selectedElement.dotLetterTarget ? `(حرف ${selectedElement.dotLetterTarget})` : ''}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                    X: {selectedElement.x} | Y: {selectedElement.y}
                  </span>
                </div>

                {/* Dot Style Preset Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-neutral-300 font-semibold block">سبک و هندسه نقطه:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DOT_PRESETS.map((dp) => (
                      <button
                        key={dp.id}
                        onClick={() => onUpdateElement(selectedElement.id, { dotPreset: dp.id, name: dp.name })}
                        className={`p-2 rounded-xl border text-xs font-vazir text-center transition-all flex items-center gap-2 ${
                          (selectedElement.dotPreset === dp.id || (!selectedElement.dotPreset && dp.id === 'single_nastaliq_dot'))
                            ? 'bg-amber-500/25 text-amber-300 border-amber-500 font-bold shadow-sm'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <div 
                          className="w-5 h-5 text-amber-400 shrink-0 [&>svg]:w-full [&>svg]:h-full"
                          dangerouslySetInnerHTML={{ __html: dp.svg }}
                        />
                        <span className="text-[11px] truncate">{dp.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* D-Pad 4-Way Fine Movement Controller for this Dot */}
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-300">
                    <span className="font-semibold flex items-center gap-1">
                      <Move className="w-3.5 h-3.5 text-amber-400" />
                      جابجایی میلی‌متری نقطه:
                    </span>
                    <span className="text-[10px] text-neutral-400">گام‌های ۲ پیکسل</span>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                    <button
                      onClick={() => onUpdateElement(selectedElement.id, { y: selectedElement.y - 2 })}
                      className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-neutral-200 hover:text-amber-300 transition-all shadow-sm active:scale-95"
                      title="بالا (Up)"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onUpdateElement(selectedElement.id, { x: selectedElement.x + 2 })}
                        className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-neutral-200 hover:text-amber-300 transition-all shadow-sm active:scale-95"
                        title="راست (Right)"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Diamond className="w-3.5 h-3.5" />
                      </div>
                      <button
                        onClick={() => onUpdateElement(selectedElement.id, { x: selectedElement.x - 2 })}
                        className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-neutral-200 hover:text-amber-300 transition-all shadow-sm active:scale-95"
                        title="چپ (Left)"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => onUpdateElement(selectedElement.id, { y: selectedElement.y + 2 })}
                      className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-neutral-200 hover:text-amber-300 transition-all shadow-sm active:scale-95"
                      title="پایین (Down)"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Size & Rotation */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-neutral-400">
                      <span>اندازه دانگ:</span>
                      <span className="font-mono text-amber-400">{selectedElement.fontSize} px</span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="160"
                      value={selectedElement.fontSize}
                      onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                      className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-neutral-400">
                      <span>زاویه چرخش:</span>
                      <span className="font-mono text-amber-400">{selectedElement.rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={selectedElement.rotation}
                      onChange={(e) => onUpdateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                      className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Case B: Selected Element is Text with Dots */}
            {selectedElement && selectedElement.type === 'text' && (
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-300 font-bold block">مدیریت و جابجایی نقطه‌های متن:</span>
                </div>

                {/* Detach Dots Trigger Button */}
                {onDetachDots && (
                  <button
                    onClick={() => onDetachDots(selectedElement.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600/30 to-amber-700/30 hover:from-amber-600/50 hover:to-amber-700/50 text-amber-300 border border-amber-500/50 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    <Diamond className="w-4 h-4 text-amber-400" />
                    <span>⚡ استخراج نقطه‌ها به المان آزاد (کلمه سالم می‌ماند)</span>
                  </button>
                )}

                {/* Dot Arrangement Selector */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-neutral-400 font-medium block">آرایش نقطه‌های کلمه:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'standard', label: 'مورب کلاسیک' },
                      { id: 'connected_line', label: 'خطی پیوسته' },
                      { id: 'horizontal', label: 'افقی جفتی' },
                      { id: 'vertical_stack', label: 'ستونی عمودی' },
                      { id: 'hidden', label: 'حذف اعراب' },
                    ].map((arr) => (
                      <button
                        key={arr.id}
                        onClick={() => onUpdateElement(selectedElement.id, { dotArrangement: arr.id as DotArrangementType })}
                        className={`p-2 rounded-xl border text-xs font-vazir text-center transition-all cursor-pointer ${
                          (selectedElement.dotArrangement || 'standard') === arr.id
                            ? 'bg-amber-500/25 text-amber-300 border-amber-500 font-bold shadow-sm'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {arr.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guidance for Moving Dots Independently */}
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-neutral-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>جابجایی آزاد و مستقل نقطه‌ها:</span>
                  </div>
                  <p className="text-neutral-400 leading-relaxed text-[11px]">
                    کلمه اصلی بدون کوچک‌ترین تغییر یا به هم ریختگی باقی می‌ماند و نقطه‌ها به صورت المان‌های مستقل بر روی بوم قرار می‌گیرند تا بتوانید آزادانه با ماوس یا کلیدهای ۴ جهت کیبورد آن‌ها را جابجا کنید.
                  </p>
                </div>
              </div>
            )}

            {/* Dot Presets Library (Insert as Independent Draggable Elements) */}
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <span className="text-xs text-neutral-300 font-bold block">درج نقاط اصیل خوشنویسی (المان مستقل):</span>
              <div className="grid grid-cols-2 gap-2">
                {DOT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleInsertDot(preset.id)}
                    className="p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/40 transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer"
                  >
                    <div 
                      className="text-amber-400 flex items-center justify-center h-6 [&>svg]:w-6 [&>svg]:h-6"
                      dangerouslySetInnerHTML={{ __html: preset.svg }}
                    />
                    <span className="text-[11px] text-neutral-300 truncate w-full">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Diacritics, Harakat & Calligraphic Ornaments - Expanded Studio */}
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-200 font-bold block">گنجینه جامع اعراب و نشانه‌های خوشنویسی:</span>
                  <span className="text-[10px] text-neutral-400">کلیک روی هر علامت برای درج آزاد و شناور روی بوم</span>
                </div>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {CALLIGRAPHY_DIACRITICS.length} نشانه
                </span>
              </div>

              {/* Controls: Scale & Color */}
              <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">اندازه درج علامت:</span>
                  <div className="flex items-center gap-1">
                    {[
                      { mul: 0.75, label: 'ریز' },
                      { mul: 1.0, label: 'متوسط' },
                      { mul: 1.4, label: 'درشت' },
                      { mul: 1.9, label: 'کتیبه' },
                    ].map(s => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setDiacriticScaleMultiplier(s.mul)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                          diacriticScaleMultiplier === s.mul
                            ? 'bg-amber-500 text-neutral-950 shadow-sm'
                            : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">رنگ جوهر علامت:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { color: '', label: 'هم‌رنگ متن', border: 'border-neutral-600' },
                      { color: '#d97706', label: 'طلایی', border: 'border-amber-500' },
                      { color: '#991b1b', label: 'شنگرف', border: 'border-red-600' },
                      { color: '#1e3a8a', label: 'لاجورد', border: 'border-blue-700' },
                      { color: '#064e3b', label: 'زنگار', border: 'border-emerald-700' },
                    ].map(c => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setDiacriticCustomColor(c.color)}
                        title={c.label}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          diacriticCustomColor === c.color ? 'ring-2 ring-amber-400 scale-110' : 'opacity-70 hover:opacity-100'
                        } ${c.border}`}
                        style={{ background: c.color || (selectedElement ? selectedElement.color : textColor) }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'all', label: 'همه نشانه‌ها' },
                  { id: 'harakat', label: 'حرکات و تنوین' },
                  { id: 'compound', label: 'ترکیب‌های ثلث' },
                  { id: 'ornament', label: 'گل و تزیینات' },
                  { id: 'symbol', label: 'شعر و ادبیات' },
                  { id: 'sacred', label: 'صلوات و کتیبه' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setDiacriticCategoryFilter(cat.id as any)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                      diacriticCategoryFilter === cat.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-850'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Live Search */}
              <div className="relative">
                <input
                  type="text"
                  value={diacriticSearch}
                  onChange={(e) => setDiacriticSearch(e.target.value)}
                  placeholder="جستجو در نام یا علامت (مانند: فتحه، تشدید، مصرع، ترنج، آیه)..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50"
                />
                {diacriticSearch && (
                  <button
                    onClick={() => setDiacriticSearch('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-neutral-300"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Grid of Calligraphic Diacritics */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[360px] overflow-y-auto no-scrollbar p-0.5">
                {CALLIGRAPHY_DIACRITICS
                  .filter(item => {
                    if (diacriticCategoryFilter === 'harakat') {
                      return item.category === 'harakat' || item.category === 'tanween';
                    }
                    if (diacriticCategoryFilter !== 'all' && item.category !== diacriticCategoryFilter) {
                      return false;
                    }
                    if (diacriticSearch.trim()) {
                      const q = diacriticSearch.trim().toLowerCase();
                      return item.name.toLowerCase().includes(q) || item.char.includes(q) || item.scriptRecommended.toLowerCase().includes(q);
                    }
                    return true;
                  })
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleInsertDiacritic(item.char)}
                      className="p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/50 transition-all text-center flex flex-col items-center justify-between gap-1.5 group cursor-pointer active:scale-95 shadow-sm"
                      title={`${item.name} (${item.scriptRecommended})`}
                    >
                      <span className="text-2xl text-amber-400 group-hover:scale-125 transition-transform duration-200 font-thuluth leading-none py-1">
                        {item.char}
                      </span>
                      <span className="text-[10px] text-neutral-300 font-medium truncate w-full group-hover:text-amber-300">
                        {item.name}
                      </span>
                      <span className="text-[8px] text-neutral-500 truncate w-full">
                        {item.scriptRecommended}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* =================== TAB 4: EFFECTS & TEXTURES =================== */}
        {activeTab === 'effects' && (
          <div className="space-y-4">
            {/* Texture Fill Masks Card */}
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
                <Sparkle className="w-4 h-4 text-amber-400" />
                <span>ماسک و بافت زرنگار حروف (Texture Fill)</span>
              </div>
              <p className="text-xs text-neutral-400">
                پوشش طلاکوب، لاجورد، مرمر و تذهیب اسلیمی درون کلمات
              </p>

              {selectedElement ? (
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {TEXTURE_FILL_PRESETS.map((tex) => {
                    const isSelected = (selectedElement.textureFill || 'none') === tex.id;
                    return (
                      <button
                        key={tex.id}
                        onClick={() => onUpdateElement(selectedElement.id, { textureFill: tex.id })}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 ring-1 ring-amber-500 shadow-sm'
                            : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-8 h-8 rounded-lg border border-white/20 shadow-inner shrink-0"
                            style={{ background: tex.previewGradient }}
                          />
                          <div className="text-right">
                            <div className="text-xs font-bold text-neutral-200">{tex.name}</div>
                            <div className="text-[10px] text-neutral-400">{tex.desc}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-neutral-500">
                  یک کلمه یا متن را انتخاب کنید تا بافت زرنگار روی آن اعمال شود.
                </div>
              )}
            </div>

            {/* Calligraphic Outline & Double Stroke Card */}
            {selectedElement && (
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-200">
                  <span>خط دور و دوبله‌نویسی (Outline):</span>
                  <label className="flex items-center gap-1.5 text-xs text-amber-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!selectedElement.outlineEnabled}
                      onChange={(e) => onUpdateElement(selectedElement.id, { 
                        outlineEnabled: e.target.checked,
                        outlineWidth: selectedElement.outlineWidth || 2,
                        outlineColor: selectedElement.outlineColor || '#f59e0b',
                        outlineStyle: selectedElement.outlineStyle || 'solid'
                      })}
                      className="accent-amber-500 rounded"
                    />
                    <span>فعال</span>
                  </label>
                </div>

                {selectedElement.outlineEnabled && (
                  <div className="space-y-3 pt-2">
                    {/* Outline Style Selector */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'solid', label: 'خط دور ساده' },
                        { id: 'double', label: 'دوبله مشبک سنتی' },
                        { id: 'chiseled', label: 'قلم‌تراش برجسته ۳D' },
                        { id: 'glow', label: 'هاله زرین نورانی' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          onClick={() => onUpdateElement(selectedElement.id, { outlineStyle: st.id as any })}
                          className={`p-2 rounded-xl border text-xs font-vazir text-center transition-all ${
                            (selectedElement.outlineStyle || 'solid') === st.id
                              ? 'bg-amber-500/25 text-amber-300 border-amber-500 font-bold'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    {/* Width Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>ضخامت خط دور:</span>
                        <span className="font-mono text-amber-400">{selectedElement.outlineWidth || 2} px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="16"
                        value={selectedElement.outlineWidth || 2}
                        onChange={(e) => onUpdateElement(selectedElement.id, { outlineWidth: Number(e.target.value) })}
                        className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Outline Colors */}
                    <div className="space-y-1.5">
                      <span className="text-xs text-neutral-400 block">رنگ خط دور:</span>
                      <div className="grid grid-cols-6 gap-2">
                        {['#f59e0b', '#d97706', '#ffffff', '#18181b', '#1e3a8a', '#991b1b'].map((c) => (
                          <button
                            key={c}
                            onClick={() => onUpdateElement(selectedElement.id, { outlineColor: c })}
                            className={`h-6 rounded-lg border transition-all ${
                              selectedElement.outlineColor === c ? 'border-amber-400 ring-2 ring-amber-400 scale-105' : 'border-neutral-700'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Serkash & Tail Customizer Card */}
            {selectedElement && (
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-neutral-200 block">سرکش کاف و دم‌نویسی سنتی:</span>

                {/* Serkash Styles */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-neutral-400 block">فرم سرکش کاف و گاف:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'classic', label: 'کلاسیک' },
                      { id: 'extended', label: 'کشیده بلند' },
                      { id: 'double', label: 'دو سرکش' },
                      { id: 'detached', label: 'شناور مستقل' },
                    ].map((sk) => (
                      <button
                        key={sk.id}
                        onClick={() => onUpdateElement(selectedElement.id, { serkashStyle: sk.id as SerkashStyleType })}
                        className={`p-2 rounded-xl border text-xs text-center transition-all ${
                          (selectedElement.serkashStyle || 'classic') === sk.id
                            ? 'bg-amber-500/25 text-amber-300 border-amber-500 font-bold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        {sk.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tail Endings */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block">فرم انتهای حروف و دم‌ها:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'standard', label: 'استاندارد' },
                      { id: 'khanjari', label: 'خنجری نوک‌تیز' },
                      { id: 'shamshiri', label: 'شمشیری کشیده' },
                      { id: 'helali_curved', label: 'هلالی معکوس' },
                    ].map((tl) => (
                      <button
                        key={tl.id}
                        onClick={() => onUpdateElement(selectedElement.id, { tailEnding: tl.id as TailEndingType })}
                        className={`p-2 rounded-xl border text-xs text-center transition-all ${
                          (selectedElement.tailEnding || 'standard') === tl.id
                            ? 'bg-amber-500/25 text-amber-300 border-amber-500 font-bold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        {tl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vertical Kashida Height Elongation */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>کشیدگی ارتفاع عمودی (دانگ عمودی):</span>
                    <span className="font-mono text-amber-400 font-bold">{(selectedElement.verticalKashida || 1).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.1"
                    value={selectedElement.verticalKashida || 1}
                    onChange={(e) => onUpdateElement(selectedElement.id, { verticalKashida: Number(e.target.value) })}
                    className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================== TAB 5: SYMMETRY & TUGHRA =================== */}
        {activeTab === 'symmetry' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
                <Split className="w-4 h-4 text-amber-400" />
                <span>استودیو قرینه‌سازی و طغرای شاهی (المثنی)</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                ایجاد قطعات متقارن آینه‌ای، شمسه‌های چهارطرفه و طغراهای سلطنتی عثمانی و صفوی
              </p>

              {selectedElement ? (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'none', label: 'تک‌جهته عادی (بدون تقارن)', desc: 'نمایش ساده متن' },
                      { id: 'horizontal_mirror', label: 'المثنی (قرینه آینه‌ای افقی)', desc: 'انعکاس روبه‌روی هم مثل آثار کهن خوشنویسی' },
                      { id: 'vertical_mirror', label: 'انعکاس عمودی آینه‌ای', desc: 'قرینه در جهت پایین' },
                      { id: 'quad_mirror', label: 'قرینه چهارگانه (طرح شمسه)', desc: 'چیدمان شعاعی ۴ جهت برای ترنج و شمسه' },
                      { id: 'tughra_crest', label: 'طغرای سلطنتی با تاج و زلفین', desc: 'افزودن تاج و قوس‌های سنتی طغرا بر فراز کلمات' },
                    ].map((sym) => (
                      <button
                        key={sym.id}
                        onClick={() => onUpdateElement(selectedElement.id, { 
                          symmetryMode: sym.id as SymmetryModeType,
                          symmetryGap: selectedElement.symmetryGap || 40
                        })}
                        className={`p-3 rounded-xl border text-right transition-all ${
                          (selectedElement.symmetryMode || 'none') === sym.id
                            ? 'bg-amber-500/25 text-amber-200 border-amber-500 font-bold shadow-md'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-850'
                        }`}
                      >
                        <div className="text-xs font-bold text-amber-300">{sym.label}</div>
                        <div className="text-[10px] text-neutral-400">{sym.desc}</div>
                      </button>
                    ))}
                  </div>

                  {selectedElement.symmetryMode && selectedElement.symmetryMode !== 'none' && (
                    <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>فاصله بین دو قرینه (Gap):</span>
                        <span className="font-mono text-amber-400 font-bold">{selectedElement.symmetryGap || 40} px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="160"
                        value={selectedElement.symmetryGap || 40}
                        onChange={(e) => onUpdateElement(selectedElement.id, { symmetryGap: Number(e.target.value) })}
                        className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Duplicate as independent layer button */}
                  {selectedElement.symmetryMode && selectedElement.symmetryMode === 'horizontal_mirror' && (
                    <button
                      onClick={() => {
                        const duplicate: CanvasElement = {
                          ...selectedElement,
                          id: `sym_twin_${Date.now()}`,
                          x: selectedElement.x + (selectedElement.symmetryGap || 40),
                          scaleX: -selectedElement.scaleX,
                          symmetryMode: 'none',
                          zIndex: elements.length + 1
                        };
                        onAddElement(duplicate);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>تبدیل قرینه به لایه مستقل قابل ویرایش</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-neutral-500">
                  ابتدا یک متن را انتخاب کنید تا قرینه‌سازی یا طغرا بر روی آن اعمال شود.
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================== TAB 4: TAZHIB & ISLIMI =================== */}
        {activeTab === 'tazhib' && (
          <div className="space-y-4">
            {/* Tazhib Builder Banner */}
            {onOpenTazhibBuilder && (
              <button
                onClick={onOpenTazhibBuilder}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-600/30 to-amber-700/30 hover:from-amber-600/50 hover:to-amber-700/50 border border-amber-500/40 text-right flex items-center justify-between transition-all shadow-md"
              >
                <div>
                  <div className="text-xs font-bold text-amber-200">استودیو ساخت تذهیب و شمسه</div>
                  <div className="text-[10px] text-neutral-400">طراحی لچک، ترنج و تقارن ۴ گوشه</div>
                </div>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </button>
            )}

            {/* Tazhib Categories */}
            <div className="space-y-3">
              {['corner', 'shamseh', 'border', 'accent'].map((cat) => {
                const items = TAZHIB_COLLECTION.filter(t => t.category === cat);
                const catTitle = cat === 'corner' ? 'لچک و گوشه‌ها' : (cat === 'shamseh' ? 'شمسه و ترنج' : (cat === 'border' ? 'کتیبه و حاشیه' : 'نقوش تزیینی'));
                return (
                  <div key={cat} className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                    <span className="text-xs font-bold text-neutral-300">{catTitle}</span>
                    <div className="grid grid-cols-3 gap-2">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleInsertTazhib(item.id)}
                          className="p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/50 transition-all flex flex-col items-center gap-1.5"
                        >
                          <svg viewBox={item.viewBox} className="w-8 h-8">
                            <path d={item.path} fill={item.defaultColor || '#d97706'} />
                          </svg>
                          <span className="text-[10px] text-neutral-400 truncate w-full text-center">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =================== TAB 5: PAPER & FRAMES =================== */}
        {activeTab === 'paper' && (
          <div className="space-y-4">
            {/* Ebru Studio Banner */}
            {onOpenEbruStudio && (
              <button
                onClick={onOpenEbruStudio}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-600/30 to-amber-700/30 hover:from-amber-600/50 hover:to-amber-700/50 border border-amber-500/40 text-right flex items-center justify-between transition-all shadow-md"
              >
                <div>
                  <div className="text-xs font-bold text-amber-200">استودیو کاغذ ابروباد پویا (Ebru)</div>
                  <div className="text-[10px] text-neutral-400">تولید الگوهای ماربلینگ سنتی با فیلتر برداری</div>
                </div>
                <Palette className="w-5 h-5 text-amber-400" />
              </button>
            )}

            {/* Paper Textures */}
            <div className="space-y-2">
              <span className="text-xs text-neutral-400 font-semibold block">بافت کاغذ سنتی و دست‌ساز:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'parchment', name: 'آهار مهره سنتی' },
                  { id: 'ebru', name: 'ابر و باد دست‌ساز' },
                  { id: 'custom_ebru', name: 'ابروباد سفارشی' },
                  { id: 'gold_fleck', name: 'زرافشان طلاکوب' },
                  { id: 'dark_velvet', name: 'مخمل شب زرین' },
                  { id: 'kraft', name: 'کرافت کتان' },
                  { id: 'marble_black', name: 'مرمر سیاه زرنگار' },
                  { id: 'cream', name: 'کرم نخودی' },
                  { id: 'white_clean', name: 'سفید خالص برداری' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onPaperTextureChange(item.id as PaperTextureType)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-vazir text-center transition-all ${
                      paperTexture === item.id
                        ? 'bg-amber-600/25 text-amber-300 border-amber-500 font-semibold shadow-sm'
                        : 'bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:bg-neutral-850'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Border Selection */}
            <div className="space-y-2">
              <span className="text-xs text-neutral-400 font-semibold block">قاب و تذهیب حاشیه قطعه:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'none', name: 'بدون کادر' },
                  { id: 'classic_gold', name: 'کادر طلاکوب دوبل' },
                  { id: 'tazhib_full', name: 'تذهیب زرین کتیبه' },
                  { id: 'chlipa_traditional', name: 'جدول‌کشی سنتی چلیپا' },
                  { id: 'minimal_double', name: 'کادر مینی‌مال' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onFrameBorderChange(item.id as FrameBorderType)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-vazir text-center transition-all ${
                      frameBorder === item.id
                        ? 'bg-amber-600/25 text-amber-300 border-amber-500 font-semibold shadow-sm'
                        : 'bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:bg-neutral-850'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Dimensions Presets */}
            <div className="space-y-2">
              <span className="text-xs text-neutral-400 font-semibold block">ابعاد صفحه کارگاه:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'A4 افقی (900 × 650)', w: 900, h: 650 },
                  { name: 'A4 عمودی (650 × 900)', w: 650, h: 900 },
                  { name: 'مربع زرین (800 × 800)', w: 800, h: 800 },
                  { name: 'کتیبه طولی (1000 × 500)', w: 1000, h: 500 },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => onResizeCanvas(preset.w, preset.h)}
                    className={`py-2.5 px-2 text-[11px] rounded-xl border font-vazir text-center transition-all ${
                      canvasWidth === preset.w && canvasHeight === preset.h
                        ? 'bg-amber-600/25 text-amber-300 border-amber-500 font-semibold shadow-sm'
                        : 'bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:bg-neutral-850'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =================== TAB 6: LAYERS PANEL =================== */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <LayersPanel
              elements={elements}
              selectedElementId={selectedElement?.id || null}
              selectedMultiIds={selectedMultiIds}
              onSelectElement={onSelectElement}
              onSelectMultiElements={onSelectMultiElements}
              onUpdateElement={onUpdateElement}
              onDeleteElement={onDeleteElement}
              onDuplicateElement={onDuplicateElement}
              onReorderElement={onReorderElement}
              onGroupElements={onGroupElements}
              onUngroupElements={onUngroupElements}
            />
          </div>
        )}
      </div>
    </aside>
    </>
  );
});
