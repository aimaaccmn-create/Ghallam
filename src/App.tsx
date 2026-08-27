import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CalligraphyScript, 
  CanvasElement, 
  CanvasLayoutMode, 
  FrameBorderType, 
  KelkProject, 
  PaperTextureType, 
  PoetryVerse,
  CalligraphyTemplate,
  HistorySnapshot,
  KorsiGuidesSettings,
  EbruPaperSettings,
  FreehandStroke,
  CustomUserFont
} from './types/calligraphy';
import { 
  SCRIPT_FONT_MAP, 
  createChlipaLayout, 
  createSiahMashqLayout, 
  weldElements, 
  copySvgToClipboard,
  loadAllSavedUserFonts,
  saveUserFontsToStorage,
  splitTextIntoWords,
  decomposePersianWord
} from './utils/calligraphyEngine';
import { 
  FontLifecycleManager, 
  FontStorageEngine 
} from './utils/fontManager';
import { HeaderBar } from './components/HeaderBar';
import { CanvasStage } from './components/CanvasStage';
import { ToolsPanel } from './components/ToolsPanel';
import { FloatingElementControls } from './components/FloatingElementControls';
import { PoetryAiModal } from './components/PoetryAiModal';
import { TemplatesModal } from './components/TemplatesModal';
import { ExportModal } from './components/ExportModal';
import { AlternateGlyphsModal } from './components/AlternateGlyphsModal';
import { ContextualVariantPopover } from './components/ContextualVariantPopover';
import { SealStampModal } from './components/SealStampModal';
import { DotRulerModal } from './components/DotRulerModal';
import { ReedPenSimulator } from './components/ReedPenSimulator';
import { TazhibBuilderModal } from './components/TazhibBuilderModal';
import { EbruPaperModal } from './components/EbruPaperModal';
import { WordSplittingModal } from './components/WordSplittingModal';
import { HistorySnapshotsModal } from './components/HistorySnapshotsModal';
import { CustomFontManagerModal } from './components/CustomFontManagerModal';
import { MockupPreviewModal } from './components/MockupPreviewModal';
import { CertificateModal } from './components/CertificateModal';
import { CncLaserStudioModal } from './components/CncLaserStudioModal';
import { CalligraphyPalettesModal } from './components/CalligraphyPalettesModal';
import { SnippetsPresetsModal } from './components/SnippetsPresetsModal';
import { ZenPresentationMode } from './components/ZenPresentationMode';
import { WorkspacePresetsModal, WorkspaceMode } from './components/WorkspacePresetsModal';
import { MetallicShimmerModal } from './components/MetallicShimmerModal';
import { OpticalKerningModal } from './components/OpticalKerningModal';
import { CustomVectorImporterModal } from './components/CustomVectorImporterModal';
import { ProjectBundleModal } from './components/ProjectBundleModal';
import { GhostReferenceModal, GhostReferenceSettings } from './components/GhostReferenceModal';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { AppLayoutWrapper } from './components/AppLayoutWrapper';
import { ToolsPanelTab } from './components/ToolsPanel';
import { AlternateGlyph } from './data/alternateGlyphs';
import { CalligraphySnippet } from './data/calligraphySnippets';

const LOCAL_STORAGE_KEY = 'kelk_calligraphy_project_v1';
const SNAPSHOTS_STORAGE_KEY = 'kelk_history_snapshots_v1';
const LITE_MODE_STORAGE_KEY = 'kelk_lite_mode_v1';

export default function App() {
  // Initial clean project (Blank Canvas)
  const defaultProject: KelkProject = {
    id: `project_${Date.now()}`,
    name: 'قطعه خوشنویسی جدید',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    canvasWidth: 900,
    canvasHeight: 650,
    layoutMode: 'free',
    paperTexture: 'parchment',
    backgroundColor: '#faf5e8',
    frameBorder: 'none',
    globalScript: 'nastaliq',
    penNibAngle: 63,
    elements: [],
  };

  // State: High-Performance / Lite Mode for lower-end phones (e.g. Redmi Note 8 Pro)
  const [isLiteMode, setIsLiteMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LITE_MODE_STORAGE_KEY);
      if (saved !== null) return JSON.parse(saved);
      // Auto-detect mobile devices or constrained concurrency
      if (typeof window !== 'undefined') {
        const isMobileScreen = window.innerWidth <= 768;
        const isConstrainedCpu = ('navigator' in window && (navigator.hardwareConcurrency || 4) <= 4);
        return isMobileScreen || isConstrainedCpu;
      }
    } catch (e) {
      // fallback
    }
    return false;
  });

  // Synchronize Lite Mode class with DOM root to immediately eliminate GPU bottlenecks on mobile devices
  useEffect(() => {
    if (isLiteMode) {
      document.documentElement.classList.add('lite-mode');
      document.body.classList.add('lite-mode');
    } else {
      document.documentElement.classList.remove('lite-mode');
      document.body.classList.remove('lite-mode');
    }
  }, [isLiteMode]);

  const toggleLiteMode = useCallback(() => {
    setIsLiteMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem(LITE_MODE_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}
      showToast(next ? '⚡ حالت بهینه‌سازی گوشی فعال شد (حذف لگ و تاری‌های سنگین)' : 'حالت گرافیک کامل فعال شد');
      return next;
    });
  }, []);

  // State: Project
  const [project, setProject] = useState<KelkProject>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id === 'project_default') {
          return defaultProject;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading saved project:', e);
    }
    return defaultProject;
  });

  // State: Canvas Selection & View
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedMultiIds, setSelectedMultiIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState<number>(0.95);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showKorsi, setShowKorsi] = useState<boolean>(true);

  // State: History for Undo / Redo
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [redoStack, setRedoStack] = useState<CanvasElement[][]>([]);

  // State: Snapshots & Korsi Guides
  const [snapshots, setSnapshots] = useState<HistorySnapshot[]>(() => {
    try {
      const saved = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // State: Mobile & Responsive Layout
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isMobileStudiosModalOpen, setIsMobileStudiosModalOpen] = useState<boolean>(false);
  const [activeToolsTab, setActiveToolsTab] = useState<ToolsPanelTab>('text');
  const [mobileBottomTab, setMobileBottomTab] = useState<MobileTab>('canvas');

  const handleMobileTabChange = (tab: MobileTab) => {
    setMobileBottomTab(tab);
    if (tab === 'canvas') {
      setIsMobileDrawerOpen(false);
    } else if (tab === 'menu') {
      setIsMobileDrawerOpen(false);
      setIsMobileStudiosModalOpen(true);
    } else {
      setActiveToolsTab(tab as ToolsPanelTab);
      setIsMobileDrawerOpen(true);
    }
  };

  const [korsiGuides, setKorsiGuides] = useState<KorsiGuidesSettings>({
    showGuides: false,
    showMabda: true,
    showVasat: true,
    showForood: true,
    showChlipaGuides: false,
    chlipaAngle: -12,
    enableSnapping: true,
    snapDistance: 12,
  });

  const [ebruSettings, setEbruSettings] = useState<EbruPaperSettings>({
    style: 'battal',
    primaryColor: '#0f172a',
    secondaryColor: '#881337',
    accentColor: '#d97706',
    marblingDensity: 5,
    turbulence: 0.04,
    waveFrequency: 2,
    goldSpeckles: 40,
  });

  // State: Modals
  const [isPoetryAiOpen, setIsPoetryAiOpen] = useState<boolean>(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isAlternateGlyphsOpen, setIsAlternateGlyphsOpen] = useState<boolean>(false);
  const [isContextualVariantsOpen, setIsContextualVariantsOpen] = useState<boolean>(false);
  const [isSealStampOpen, setIsSealStampOpen] = useState<boolean>(false);
  const [isDotRulerOpen, setIsDotRulerOpen] = useState<boolean>(false);
  const [isDigitalRulerOpen, setIsDigitalRulerOpen] = useState<boolean>(false);
  const [isReedPenOpen, setIsReedPenOpen] = useState<boolean>(false);
  const [isTazhibBuilderOpen, setIsTazhibBuilderOpen] = useState<boolean>(false);
  const [isEbruStudioOpen, setIsEbruStudioOpen] = useState<boolean>(false);
  const [isWordSplittingOpen, setIsWordSplittingOpen] = useState<boolean>(false);
  const [isHistorySnapshotsOpen, setIsHistorySnapshotsOpen] = useState<boolean>(false);
  const [isFontManagerOpen, setIsFontManagerOpen] = useState<boolean>(false);
  const [isMockupOpen, setIsMockupOpen] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [isCncLaserOpen, setIsCncLaserOpen] = useState<boolean>(false);
  const [isPalettesOpen, setIsPalettesOpen] = useState<boolean>(false);
  const [isSnippetsOpen, setIsSnippetsOpen] = useState<boolean>(false);
  const [isZenModeOpen, setIsZenModeOpen] = useState<boolean>(false);
  const [isWorkspacePresetsOpen, setIsWorkspacePresetsOpen] = useState<boolean>(false);
  const [isMetallicShimmerOpen, setIsMetallicShimmerOpen] = useState<boolean>(false);
  const [isOpticalKerningOpen, setIsOpticalKerningOpen] = useState<boolean>(false);
  const [isCustomVectorImporterOpen, setIsCustomVectorImporterOpen] = useState<boolean>(false);
  const [isProjectBundleOpen, setIsProjectBundleOpen] = useState<boolean>(false);
  const [isGhostReferenceOpen, setIsGhostReferenceOpen] = useState<boolean>(false);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('free');

  const [ghostReferenceSettings, setGhostReferenceSettings] = useState<GhostReferenceSettings>({
    url: null,
    opacity: 0.35,
    scale: 1,
    x: 0,
    y: 0,
    rotation: 0,
    isLocked: true,
    isVisible: true,
  });
  const [userFonts, setUserFonts] = useState<CustomUserFont[]>(() => {
    return loadAllSavedUserFonts();
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initialize and register all custom fonts with persistent lifecycle manager
  useEffect(() => {
    FontLifecycleManager.initialize().then(loadedFonts => {
      if (loadedFonts && loadedFonts.length > 0) {
        setUserFonts(loadedFonts);
      }
    }).catch(err => {
      console.warn('Font initialization notice:', err);
    });

    const unsub = FontLifecycleManager.subscribe(async () => {
      try {
        const allFonts = await FontStorageEngine.getAllFonts();
        if (allFonts) {
          setUserFonts(allFonts);
        }
      } catch (e) {
        console.warn('Failed to sync fonts on change:', e);
      }
    });

    return unsub;
  }, []);

  const handleAddCustomFont = async (newFont: CustomUserFont) => {
    await FontLifecycleManager.registerFont(newFont, true);
    const updated = [newFont, ...userFonts.filter(f => f.id !== newFont.id)];
    setUserFonts(updated);
    saveUserFontsToStorage(updated);
    showToast(`فونت «${newFont.name}» با موفقیت افزوده شد`);
  };

  const handleDeleteCustomFont = async (fontId: string) => {
    await FontLifecycleManager.unregisterFont(fontId);
    const updated = userFonts.filter(f => f.id !== fontId);
    setUserFonts(updated);
    saveUserFontsToStorage(updated);
    showToast('فونت اختصاصی حذف شد');
  };

  // Debounced Save to LocalStorage to eliminate main-thread lag during dragging & editing
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(project));
      } catch (e) {
        console.error('Failed to save project:', e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [project]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(snapshots));
      } catch (e) {
        console.error('Failed to save snapshots:', e);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [snapshots]);

  // Keep a stable ref to project elements to prevent re-creating recordHistory on every render
  const elementsRef = useRef(project.elements);
  useEffect(() => {
    elementsRef.current = project.elements;
  }, [project.elements]);

  // Record history snapshot before mutating elements
  const recordHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(-30), elementsRef.current]);
    setRedoStack([]);
  }, []);

  // Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack(prev => [elementsRef.current, ...prev]);
    setHistory(prev => prev.slice(0, prev.length - 1));
    setProject(prev => ({ ...prev, elements: previous }));
  }, [history]);

  // Redo
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory(prev => [...prev, elementsRef.current]);
    setRedoStack(prev => prev.slice(1));
    setProject(prev => ({ ...prev, elements: next }));
  }, [redoStack]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveSnapshot(`نسخه زمان ${new Date().toLocaleTimeString('fa-IR')}`);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleUndo, handleRedo]);

  // Snapshots Management
  const handleSaveSnapshot = useCallback((title: string) => {
    const newSnapshot: HistorySnapshot = {
      id: `snap_${Date.now()}`,
      title,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      elementsCount: project.elements.length,
      project: { ...project },
    };
    setSnapshots(prev => [newSnapshot, ...prev]);
  }, [project]);

  const handleRestoreSnapshot = useCallback((snap: HistorySnapshot) => {
    recordHistory();
    setProject({ ...snap.project, id: project.id, updatedAt: new Date().toISOString() });
    setSelectedElementId(null);
  }, [project.id, recordHistory]);

  const handleDeleteSnapshot = useCallback((id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id));
  }, []);

  // Update Single Element (with optional saveHistory to prevent drag-state thrashing)
  const handleUpdateElement = useCallback((id: string, updates: Partial<CanvasElement>, saveHistory: boolean = true) => {
    if (saveHistory) {
      recordHistory();
    }
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => (el.id === id ? { ...el, ...updates } : el)),
    }));
  }, [recordHistory]);

  // Update Multiple Elements in a single batch (prevents multiple renders during gestures)
  const handleBatchUpdateElements = useCallback((updates: Array<{ id: string; updates: Partial<CanvasElement> }>, saveHistory: boolean = false) => {
    if (saveHistory) {
      recordHistory();
    }
    const updateMap = new Map(updates.map(u => [u.id, u.updates]));
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        const up = updateMap.get(el.id);
        return up ? { ...el, ...up } : el;
      }),
    }));
  }, [recordHistory]);

  // Add Element
  const handleAddElement = useCallback((element: CanvasElement) => {
    recordHistory();
    setProject(prev => ({
      ...prev,
      elements: [...prev.elements, element],
    }));
    setSelectedElementId(element.id);
  }, [recordHistory]);

  // Add Multiple Elements
  const handleAddElements = useCallback((newElements: CanvasElement[]) => {
    recordHistory();
    setProject(prev => ({
      ...prev,
      elements: [...prev.elements, ...newElements],
    }));
    if (newElements.length > 0) {
      setSelectedElementId(newElements[0].id);
    }
  }, [recordHistory]);

  // Delete Element
  const handleDeleteElement = useCallback((id: string) => {
    recordHistory();
    setProject(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id),
    }));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  }, [recordHistory, selectedElementId]);

  // Direct 1-Click Decomposition / Splitting on Canvas
  const handleDirectSplit = useCallback((elementId?: string) => {
    const targetId = elementId || selectedElementId;
    if (!targetId) {
      showToast('لطفاً یک متن را برای تفکیک انتخاب کنید');
      return;
    }
    const current = project.elements.find(e => e.id === targetId);
    if (!current || !current.text) {
      showToast('المان انتخاب شده فاقد متن است');
      return;
    }

    recordHistory();

    // If text contains multiple words, split into words. Otherwise, decompose into ligatures!
    const hasSpaces = current.text.trim().includes(' ');
    const parts = hasSpaces
      ? splitTextIntoWords(current.text, current.script, current.x, current.y, current.fontSize, current.color, current.fontFamily)
      : decomposePersianWord(current.text, current.script, current.x, current.y, current.fontSize, current.color, current.fontFamily);

    if (parts && parts.length > 0) {
      // Inherit visual properties from parent element (scale, rotation, opacity, effects, etc.)
      const enhancedParts = parts.map((p, idx) => ({
        ...p,
        fontFamily: current.fontFamily || p.fontFamily,
        color: current.color,
        fontSize: current.fontSize,
        rotation: current.rotation || 0,
        scaleX: current.scaleX ?? 1,
        scaleY: current.scaleY ?? 1,
        opacity: current.opacity ?? 1,
        goldEffect: current.goldEffect,
        textureFill: current.textureFill,
        outlineWidth: current.outlineWidth,
        outlineColor: current.outlineColor,
        shadowColor: current.shadowColor,
        shadowBlur: current.shadowBlur,
        zIndex: (current.zIndex || 10) + idx,
      }));

      setProject(prev => ({
        ...prev,
        elements: [...prev.elements.filter(e => e.id !== targetId), ...enhancedParts],
      }));
      setSelectedElementId(enhancedParts[0].id);
      showToast(`متن با موفقیت به ${enhancedParts.length} جزء مستقل تفکیک شد`);
    } else {
      showToast('تفکیک این متن مقدور نبود');
    }
  }, [selectedElementId, project.elements, recordHistory]);

  // Insert Calligraphy Snippet (Pre-composed royal verses)
  const handleInsertSnippet = useCallback((snippet: CalligraphySnippet) => {
    recordHistory();
    if (snippet.elements && snippet.elements.length > 0) {
      const fullElements: CanvasElement[] = snippet.elements.map((el, idx) => ({
        id: el.id || `snippet_el_${Date.now()}_${idx}`,
        type: el.type || 'text',
        name: el.name || snippet.title,
        text: el.text || '',
        script: el.script || snippet.script,
        x: el.x ?? project.canvasWidth / 2,
        y: el.y ?? project.canvasHeight / 2,
        fontSize: el.fontSize || 54,
        fontFamily: el.fontFamily || SCRIPT_FONT_MAP[snippet.script]?.cssFamily || 'IranNastaliq, serif',
        color: el.color || '#18181b',
        rotation: el.rotation || 0,
        scaleX: el.scaleX || 1,
        scaleY: el.scaleY || 1,
        opacity: el.opacity || 1,
        zIndex: (el.zIndex || 1) + project.elements.length,
        kashidaLevel: el.kashidaLevel || 0,
      }));
      handleAddElements(fullElements);
    } else {
      handleAddElement({
        id: `snippet_${Date.now()}`,
        type: 'text',
        name: snippet.title,
        text: snippet.previewText || snippet.title,
        script: snippet.script,
        x: project.canvasWidth / 2,
        y: project.canvasHeight / 2,
        fontSize: 54,
        fontFamily: SCRIPT_FONT_MAP[snippet.script]?.cssFamily || 'IranNastaliq, serif',
        color: '#18181b',
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        zIndex: project.elements.length + 1,
      });
    }
    showToast(`قطعه «${snippet.title}» روی بوم درج شد`);
  }, [project.canvasWidth, project.canvasHeight, project.elements.length, handleAddElement, handleAddElements, recordHistory]);

  // Apply Traditional Color Palette
  const handleApplyPaletteElements = useCallback((updates: { id: string; changes: Partial<CanvasElement> }[]) => {
    recordHistory();
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        const match = updates.find(u => u.id === el.id);
        return match ? { ...el, ...match.changes } : el;
      }),
    }));
    showToast('پالت سنتی با موفقیت روی بوم اعمال شد');
  }, [recordHistory]);

  // Select Alternate Glyph
  const handleSelectAlternateGlyph = useCallback((glyph: AlternateGlyph) => {
    recordHistory();
    const current = project.elements.find(e => e.id === selectedElementId);
    if (current && current.text && current.text.length <= 2) {
      handleUpdateElement(current.id, { text: glyph.char });
      showToast(`فرم جایگزین «${glyph.name}» اعمال شد`);
    } else {
      handleAddElement({
        id: `glyph_${Date.now()}`,
        type: 'text',
        name: glyph.name,
        text: glyph.char,
        script: glyph.script === 'all' ? (current?.script || project.globalScript) : glyph.script,
        x: current ? current.x : project.canvasWidth / 2,
        y: current ? current.y - 30 : project.canvasHeight / 2,
        fontSize: current ? current.fontSize : 56,
        fontFamily: SCRIPT_FONT_MAP[glyph.script === 'all' ? (current?.script || project.globalScript) : glyph.script]?.cssFamily || 'IranNastaliq, serif',
        color: current ? current.color : '#18181b',
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        zIndex: project.elements.length + 1,
      });
      showToast(`فرم «${glyph.name}» روی بوم درج شد`);
    }
  }, [selectedElementId, project.elements, project.globalScript, project.canvasWidth, project.canvasHeight, handleUpdateElement, handleAddElement, recordHistory]);

  // Weld adjacent elements
  const handleWeldAdjacent = useCallback(() => {
    if (!selectedElementId) return;
    const current = project.elements.find(e => e.id === selectedElementId);
    if (!current) return;

    // Find nearest text or letter element
    const other = project.elements.find(
      e => e.id !== current.id && 
      (e.type === 'text' || e.type === 'letter' || !e.type) &&
      e.text && 
      Math.abs(e.x - current.x) < 200 && 
      Math.abs(e.y - current.y) < 80
    );
    if (!other) {
      showToast('کلمه یا حرف نزدیکی برای اتصال یافت نشد (المان‌ها را به یکدیگر نزدیک‌تر کنید)');
      return;
    }

    recordHistory();
    const welded = weldElements([current, other]);
    setProject(prev => ({
      ...prev,
      elements: prev.elements.filter(e => e.id !== current.id && e.id !== other.id).concat(welded),
    }));
    setSelectedElementId(welded.id);
    showToast(`کلمات «${current.text}» و «${other.text}» با موفقیت متصل شدند`);
  }, [selectedElementId, project.elements, recordHistory]);

  // Direct Vector Clipboard Copy (for Illustrator / Photoshop)
  const handleCopyVectorClipboard = useCallback(async () => {
    const el = project.elements.find(e => e.id === selectedElementId);
    const textToExport = el ? el.text || '' : 'کلک استودیو';
    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400">
  <text x="400" y="200" text-anchor="middle" dominant-baseline="central" font-family="${el?.fontFamily || 'IranNastaliq'}" font-size="${el?.fontSize || 64}" fill="${el?.color || '#000000'}">
    ${textToExport}
  </text>
</svg>`;

    const success = await copySvgToClipboard(svgCode);
    if (success) {
      showToast('وکتور با موفقیت در کلیپ‌بورد کپی شد (آماده Paste در فتوشاپ و ایلوستریتور)');
    } else {
      showToast('کپی در کلیپ‌بورد با خطا مواجه شد');
    }
  }, [selectedElementId, project.elements]);

  // Duplicate Element
  const handleDuplicateElement = useCallback((id: string) => {
    const elToDup = project.elements.find(el => el.id === id);
    if (!elToDup) return;
    recordHistory();
    const newEl: CanvasElement = {
      ...elToDup,
      id: `${elToDup.type}_${Date.now()}`,
      x: elToDup.x + 25,
      y: elToDup.y + 25,
      zIndex: project.elements.length + 1,
    };
    setProject(prev => ({
      ...prev,
      elements: [...prev.elements, newEl],
    }));
    setSelectedElementId(newEl.id);
  }, [project.elements, recordHistory]);

  // Layer Reordering (Z-Index)
  const handleReorderElement = useCallback((id: string, direction: 'up' | 'down') => {
    recordHistory();
    setProject(prev => {
      const el = prev.elements.find(e => e.id === id);
      if (!el) return prev;
      const currentZ = el.zIndex || 1;
      const newZ = direction === 'up' ? currentZ + 1 : Math.max(1, currentZ - 1);
      return {
        ...prev,
        elements: prev.elements.map(e => (e.id === id ? { ...e, zIndex: newZ } : e)),
      };
    });
  }, [recordHistory]);

  // Group Elements
  const handleGroupElements = useCallback((elementIds: string[]) => {
    if (elementIds.length <= 1) return;
    recordHistory();
    const groupId = `group_${Date.now()}`;
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(e => 
        elementIds.includes(e.id) ? { ...e, groupId } : e
      ),
    }));
  }, [recordHistory]);

  // Ungroup Elements
  const handleUngroupElements = useCallback((groupId: string) => {
    recordHistory();
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(e => 
        e.groupId === groupId ? { ...e, groupId: undefined } : e
      ),
    }));
  }, [recordHistory]);

  // Script Change
  const handleApplyPreset = useCallback((mode: WorkspaceMode) => {
    recordHistory();
    setWorkspaceMode(mode);

    if (mode === 'chalipa') {
      setKorsiGuides(prev => ({
        ...prev,
        showGuides: true,
        showChlipaGuides: true,
        chlipaAngle: -12,
        enableSnapping: true,
      }));
      setProject(prev => ({
        ...prev,
        layoutMode: 'chlipa',
        frameBorder: 'chlipa_traditional',
        globalScript: 'nastaliq',
      }));
      showToast('میزکار چلیپانویسی با خطوط کرسی و قاب سنتی فعال شد');
    } else if (mode === 'katibeh') {
      setKorsiGuides(prev => ({
        ...prev,
        showGuides: true,
        showChlipaGuides: false,
        enableSnapping: true,
      }));
      setProject(prev => ({
        ...prev,
        layoutMode: 'free',
        frameBorder: 'tazhib_full',
        globalScript: 'thuluth',
      }));
      showToast('میزکار کتیبه و تذهیب فاخر فعال شد');
    } else if (mode === 'siah_mashq') {
      setProject(prev => ({
        ...prev,
        layoutMode: 'siah_mashq',
        frameBorder: 'none',
        globalScript: 'shekasteh',
      }));
      showToast('میزکار سیاه‌مشق و چیدمان ریتمیک فعال شد');
    } else if (mode === 'reed_pen') {
      setProject(prev => ({
        ...prev,
        layoutMode: 'free',
        frameBorder: 'none',
      }));
      setIsReedPenOpen(true);
      showToast('کارگاه شبیه‌ساز قلم‌نی فعال شد');
    }
  }, [recordHistory]);

  // Apply Metallic Shimmer Shader to selected element
  const handleApplyShimmer = useCallback((shimmerId: string, customAngle: number) => {
    if (!selectedElementId) return;
    recordHistory();
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (el.id === selectedElementId) {
          return {
            ...el,
            textureFill: 'gold_leaf',
            goldEffect: true,
            penAngle: customAngle,
          };
        }
        return el;
      })
    }));
    showToast('شیدر نوری و متالیک با موفقیت اعمال شد');
  }, [selectedElementId, recordHistory]);

  // Optical Kerning & Balance distribution
  const handleAutoBalanceKerning = useCallback((strength: number) => {
    recordHistory();
    setProject(prev => {
      const textEls = prev.elements.filter(e => (e.type === 'text' || e.type === 'word' || !e.type) && e.isVisible !== false);
      if (textEls.length <= 1) return prev;

      // Sort by horizontal position (RTL: largest X first)
      const sorted = [...textEls].sort((a, b) => b.x - a.x);
      const factor = strength / 100;

      let currentX = sorted[0].x;
      const updatedMap = new Map<string, number>();
      updatedMap.set(sorted[0].id, currentX);

      for (let i = 1; i < sorted.length; i++) {
        const prevEl = sorted[i - 1];
        const el = sorted[i];
        const prevWidth = (prevEl.text?.length || 3) * (prevEl.fontSize || 40) * 0.35;
        const opticalGap = Math.max(20, Math.round(prevWidth * (1 - factor * 0.4)));
        currentX -= opticalGap;
        updatedMap.set(el.id, currentX);
      }

      return {
        ...prev,
        elements: prev.elements.map(el => {
          if (updatedMap.has(el.id)) {
            return { ...el, x: updatedMap.get(el.id)! };
          }
          return el;
        })
      };
    });
    showToast('توازن و کرنینگ نوری با موفقیت تنظیم شد');
  }, [recordHistory]);

  // Linear baseline alignment
  const handleAlignBaselineRow = useCallback((spacing: number) => {
    recordHistory();
    setProject(prev => {
      const textEls = prev.elements.filter(e => (e.type === 'text' || e.type === 'word' || !e.type) && e.isVisible !== false);
      if (textEls.length <= 1) return prev;

      const avgY = Math.round(textEls.reduce((acc, el) => acc + el.y, 0) / textEls.length);
      const sorted = [...textEls].sort((a, b) => b.x - a.x);

      let currentX = sorted[0].x;
      const updatedMap = new Map<string, { x: number; y: number }>();
      updatedMap.set(sorted[0].id, { x: currentX, y: avgY });

      for (let i = 1; i < sorted.length; i++) {
        const prevEl = sorted[i - 1];
        const el = sorted[i];
        const prevWidth = (prevEl.text?.length || 2) * (prevEl.fontSize || 40) * 0.4;
        currentX -= (prevWidth + spacing);
        updatedMap.set(el.id, { x: currentX, y: avgY });
      }

      return {
        ...prev,
        elements: prev.elements.map(el => {
          if (updatedMap.has(el.id)) {
            const coords = updatedMap.get(el.id)!;
            return { ...el, x: coords.x, y: coords.y, rotation: 0 };
          }
          return el;
        })
      };
    });
    showToast('کلمات روی یک خط کرسی ردیف شدند');
  }, [recordHistory]);

  // Import Project Package Bundle
  const handleImportBundle = useCallback((importedProject: KelkProject, importedFonts: CustomUserFont[]) => {
    recordHistory();
    setProject(importedProject);
    if (importedFonts.length > 0) {
      importedFonts.forEach(font => handleAddCustomFont(font));
    }
    showToast(`بسته پروژه «${importedProject.name}» با موفقیت بازنشانی شد`);
  }, [recordHistory]);

  // Script Change
  const handleScriptChange = (script: string, customFont?: CustomUserFont) => {
    let targetScript: CalligraphyScript = 'nastaliq';
    let targetFamily = 'IranNastaliq, serif';
    let defaultAngle = 63;

    if (script.startsWith('custom_')) {
      const ufId = script.replace('custom_', '');
      const foundFont = userFonts.find(f => f.id === ufId) || customFont;
      targetScript = 'custom';
      if (foundFont) {
        targetFamily = foundFont.fontFamily;
      }
    } else if (script === 'custom') {
      targetScript = 'custom';
      if (customFont) {
        targetFamily = customFont.fontFamily;
      } else if (userFonts.length > 0) {
        targetFamily = userFonts[0].fontFamily;
      }
    } else {
      targetScript = (script in SCRIPT_FONT_MAP ? script : 'nastaliq') as CalligraphyScript;
      const meta = SCRIPT_FONT_MAP[targetScript];
      if (meta) {
        targetFamily = meta.cssFamily;
        defaultAngle = meta.defaultNibAngle;
      }
    }

    setProject(prev => ({
      ...prev,
      globalScript: targetScript,
      penNibAngle: defaultAngle,
    }));

    if (selectedElementId) {
      handleUpdateElement(selectedElementId, {
        script: targetScript,
        fontFamily: targetFamily,
      });
    }
  };

  // Layout Mode Change
  const handleLayoutModeChange = (mode: CanvasLayoutMode) => {
    recordHistory();
    setProject(prev => ({
      ...prev,
      layoutMode: mode,
      frameBorder: mode === 'chlipa' ? 'chlipa_traditional' : (mode === 'katibeh' ? 'tazhib_full' : prev.frameBorder),
    }));
  };

  // Insert Poetry Verse from Modal
  const handleInsertVerse = (verse: PoetryVerse, format: 'single_line' | 'chlipa' | 'siah_mashq') => {
    recordHistory();
    if (format === 'chlipa') {
      const chlipaElements = createChlipaLayout(
        verse.verse1,
        verse.verse2,
        'جلوه‌ای کرد رخت دید ملک عشق نداشت',
        'عین آتش شد از این غیرت و بر آدم زد',
        project.globalScript,
        project.canvasWidth,
        project.canvasHeight
      );
      setProject(prev => ({
        ...prev,
        layoutMode: 'chlipa',
        frameBorder: 'chlipa_traditional',
        elements: chlipaElements,
      }));
    } else if (format === 'siah_mashq') {
      const siahElements = createSiahMashqLayout(
        `${verse.verse1} ${verse.verse2}`,
        project.globalScript,
        project.canvasWidth,
        project.canvasHeight
      );
      setProject(prev => ({
        ...prev,
        layoutMode: 'siah_mashq',
        elements: siahElements,
      }));
    } else {
      const newEl: CanvasElement = {
        id: `verse_${Date.now()}`,
        type: 'text',
        text: `${verse.verse1}  •  ${verse.verse2}`,
        script: verse.recommendedScript || project.globalScript,
        x: project.canvasWidth / 2,
        y: project.canvasHeight / 2,
        fontSize: 42,
        fontFamily: SCRIPT_FONT_MAP[verse.recommendedScript || project.globalScript].cssFamily,
        color: '#18181b',
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        zIndex: project.elements.length + 1,
        kashidaLevel: 2,
      };
      handleAddElement(newEl);
    }
  };

  // Load Template Preset
  const handleSelectTemplate = (template: CalligraphyTemplate) => {
    recordHistory();
    setProject(prev => ({
      ...prev,
      name: template.title,
      layoutMode: template.layoutMode,
      globalScript: template.script,
      penNibAngle: template.project.penNibAngle || SCRIPT_FONT_MAP[template.script].defaultNibAngle,
      paperTexture: template.project.paperTexture || prev.paperTexture,
      backgroundColor: template.project.backgroundColor || prev.backgroundColor,
      frameBorder: template.project.frameBorder || prev.frameBorder,
      canvasWidth: template.project.canvasWidth || prev.canvasWidth,
      canvasHeight: template.project.canvasHeight || prev.canvasHeight,
      elements: (template.project.elements || []) as CanvasElement[],
    }));
    setSelectedElementId(null);
  };

  // New Blank Project
  const handleNewProject = () => {
    if (window.confirm('آیا می‌خواهید یک صفحه جدید و خالی ایجاد کنید؟ (پروژه فعلی پاک خواهد شد)')) {
      recordHistory();
      setProject({
        id: `project_${Date.now()}`,
        name: 'قطعه خوشنویسی جدید',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        canvasWidth: 900,
        canvasHeight: 650,
        layoutMode: 'free',
        paperTexture: 'parchment',
        backgroundColor: '#faf5e8',
        frameBorder: 'none',
        globalScript: 'nastaliq',
        penNibAngle: 63,
        elements: [],
      });
      setSelectedElementId(null);
    }
  };

  // Save Project as JSON (.kelk)
  const handleSaveJson = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name || 'kelk_project'}.kelk`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load Project JSON (.kelk)
  const handleLoadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedProject = JSON.parse(event.target?.result as string);
        if (loadedProject && loadedProject.elements) {
          recordHistory();
          setProject(loadedProject);
          setSelectedElementId(null);
          showToast('پروژه کلک با موفقیت بازخوانی شد');
        }
      } catch (err) {
        showToast('فایل پروژه نامعتبر است');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Insert Freehand Stroke from Reed Pen Simulator
  const handleInsertReedPenStroke = (stroke: FreehandStroke) => {
    const newEl: CanvasElement = {
      id: `stroke_${Date.now()}`,
      type: 'stroke',
      x: project.canvasWidth / 2,
      y: project.canvasHeight / 2,
      fontSize: 48,
      fontFamily: '',
      color: stroke.color,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: project.elements.length + 1,
      strokeData: stroke,
    };
    handleAddElement(newEl);
  };

  // Apply Ebru Paper Settings
  const handleApplyEbruSettings = useCallback((settings: EbruPaperSettings) => {
    setEbruSettings(settings);
    setProject(prev => ({
      ...prev,
      paperTexture: 'custom_ebru',
    }));
  }, []);

  // Replace element with split word parts
  const handleReplaceSplitWords = useCallback((elementId: string, parts: CanvasElement[]) => {
    recordHistory();
    setProject(prev => ({
      ...prev,
      elements: [...prev.elements.filter(e => e.id !== elementId), ...parts],
    }));
    if (parts.length > 0) {
      setSelectedElementId(parts[0].id);
    }
  }, [recordHistory]);

  const handlePaperTextureChange = useCallback((texture: PaperTextureType) => {
    setProject(p => ({ ...p, paperTexture: texture }));
  }, []);

  const handleFrameBorderChange = useCallback((border: FrameBorderType) => {
    setProject(p => ({ ...p, frameBorder: border }));
  }, []);

  const handleResizeCanvas = useCallback((w: number, h: number) => {
    setProject(p => ({ ...p, canvasWidth: w, canvasHeight: h }));
  }, []);

  const handleUpdateKorsiGuides = useCallback((updates: Partial<KorsiGuidesSettings>) => {
    setKorsiGuides(prev => ({ ...prev, ...updates }));
  }, []);

  const handleOpenAlternateGlyphs = useCallback(() => setIsAlternateGlyphsOpen(true), []);
  const handleOpenSealStamp = useCallback(() => setIsSealStampOpen(true), []);
  const handleOpenDotRuler = useCallback(() => setIsDotRulerOpen(true), []);
  const handleOpenReedPen = useCallback(() => setIsReedPenOpen(true), []);
  const handleOpenTazhibBuilder = useCallback(() => setIsTazhibBuilderOpen(true), []);
  const handleOpenEbruStudio = useCallback(() => setIsEbruStudioOpen(true), []);
  const handleOpenSplitWord = useCallback(() => setIsWordSplittingOpen(true), []);
  const handleOpenTemplates = useCallback(() => setIsTemplatesOpen(true), []);
  const handleOpenPoetryAi = useCallback(() => setIsPoetryAiOpen(true), []);
  const handleOpenExport = useCallback(() => setIsExportOpen(true), []);
  const handleOpenHistorySnapshots = useCallback(() => setIsHistorySnapshotsOpen(true), []);
  const handleOpenFontManager = useCallback(() => setIsFontManagerOpen(true), []);
  const handleOpenPalettes = useCallback(() => setIsPalettesOpen(true), []);
  const handleOpenSnippets = useCallback(() => setIsSnippetsOpen(true), []);
  const handleOpenZenMode = useCallback(() => setIsZenModeOpen(true), []);
  const handleOpenMockup = useCallback(() => setIsMockupOpen(true), []);
  const handleOpenCertificate = useCallback(() => setIsCertificateOpen(true), []);
  const handleOpenCncLaser = useCallback(() => setIsCncLaserOpen(true), []);
  const handleOpenMobileStudios = useCallback(() => setIsMobileStudiosModalOpen(true), []);
  const handleCloseMobileStudios = useCallback(() => setIsMobileStudiosModalOpen(false), []);
  const handleToggleDigitalRuler = useCallback(() => setIsDigitalRulerOpen(prev => !prev), []);
  const handleCloseDigitalRuler = useCallback(() => setIsDigitalRulerOpen(false), []);
  const handleToggleGrid = useCallback(() => setShowGrid(prev => !prev), []);
  const handleToggleKorsi = useCallback(() => setShowKorsi(prev => !prev), []);
  const handleCloseMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen(false);
    setMobileBottomTab('canvas');
  }, []);
  const handleTabChangeOverride = useCallback((tab: ToolsPanelTab) => {
    setActiveToolsTab(tab);
    setMobileBottomTab(tab as MobileTab);
  }, []);
  const handleDirectSplitSelected = useCallback(() => {
    handleDirectSplit(selectedElementId || undefined);
  }, [handleDirectSplit, selectedElementId]);

  const selectedElement = project.elements.find(el => el.id === selectedElementId) || null;

  return (
    <AppLayoutWrapper
      isMobileDrawerOpen={isMobileDrawerOpen}
      onCloseMobileDrawer={handleCloseMobileDrawer}
      toast={
        toastMessage ? (
          <div className="bg-neutral-900/95 border border-amber-500/60 text-amber-300 text-xs px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 font-vazir">
            {toastMessage}
          </div>
        ) : undefined
      }
      header={
        <HeaderBar
          currentScript={project.globalScript}
          onScriptChange={handleScriptChange}
          layoutMode={project.layoutMode}
          onLayoutModeChange={handleLayoutModeChange}
          zoom={zoom}
          onZoomChange={setZoom}
          showGrid={showGrid}
          onToggleGrid={handleToggleGrid}
          showKorsi={showKorsi}
          onToggleKorsi={handleToggleKorsi}
          canUndo={history.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onNewProject={handleNewProject}
          onOpenTemplates={handleOpenTemplates}
          onOpenPoetryAi={handleOpenPoetryAi}
          onOpenExport={handleOpenExport}
          onSaveJson={handleSaveJson}
          onLoadJson={handleLoadJson}
          onOpenAlternateGlyphs={handleOpenAlternateGlyphs}
          onOpenSealStamp={handleOpenSealStamp}
          onOpenDotRuler={handleOpenDotRuler}
          isDigitalRulerActive={isDigitalRulerOpen}
          onToggleDigitalRuler={handleToggleDigitalRuler}
          onOpenReedPen={handleOpenReedPen}
          onOpenTazhibBuilder={handleOpenTazhibBuilder}
          onOpenEbruStudio={handleOpenEbruStudio}
          onOpenHistorySnapshots={handleOpenHistorySnapshots}
          onOpenFontManager={handleOpenFontManager}
          onOpenSplitWord={handleOpenSplitWord}
          onOpenPalettes={handleOpenPalettes}
          onOpenSnippets={handleOpenSnippets}
          onOpenZenMode={handleOpenZenMode}
          onOpenMockup={handleOpenMockup}
          onOpenCertificate={handleOpenCertificate}
          onOpenCncLaser={handleOpenCncLaser}
          onOpenWorkspacePresets={() => setIsWorkspacePresetsOpen(true)}
          onOpenMetallicShimmer={() => setIsMetallicShimmerOpen(true)}
          onOpenOpticalKerning={() => setIsOpticalKerningOpen(true)}
          onOpenCustomVectorImporter={() => setIsCustomVectorImporterOpen(true)}
          onOpenProjectBundle={() => setIsProjectBundleOpen(true)}
          onOpenGhostReference={() => setIsGhostReferenceOpen(true)}
          userFonts={userFonts}
          isLiteMode={isLiteMode}
          onToggleLiteMode={toggleLiteMode}
          isMobileStudiosOpen={isMobileStudiosModalOpen}
          onCloseMobileStudios={handleCloseMobileStudios}
          onOpenMobileStudios={handleOpenMobileStudios}
        />
      }
      canvas={
        <>
          <CanvasStage
            width={project.canvasWidth}
            height={project.canvasHeight}
            elements={project.elements}
            selectedElementId={selectedElementId}
            selectedMultiIds={selectedMultiIds}
            onSelectElement={setSelectedElementId}
            onSelectMultiElements={setSelectedMultiIds}
            onGroupElements={handleGroupElements}
            onUngroupElements={handleUngroupElements}
            onUpdateElement={handleUpdateElement}
            onUpdateBatchElements={handleBatchUpdateElements}
            onRecordHistory={recordHistory}
            paperTexture={project.paperTexture}
            ebruSettings={ebruSettings}
            korsiGuides={korsiGuides}
            isLiteMode={isLiteMode}
            backgroundColor={project.backgroundColor}
            frameBorder={project.frameBorder}
            layoutMode={project.layoutMode}
            showGrid={showGrid}
            showKorsi={showKorsi}
            zoom={zoom}
            onZoomChange={setZoom}
            ghostReference={ghostReferenceSettings}
            showMinimap={true}
            onToggleGrid={handleToggleGrid}
            onToggleKorsi={handleToggleKorsi}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            isDigitalRulerOpen={isDigitalRulerOpen}
            onCloseDigitalRuler={handleCloseDigitalRuler}
            onContextMenuElement={(el) => {
              setSelectedElementId(el.id);
              setIsContextualVariantsOpen(true);
            }}
          />

          {/* In-Place Contextual Letter Variants & Sub-Glyph Studio Popover */}
          {isContextualVariantsOpen && selectedElement && (
            <ContextualVariantPopover
              element={selectedElement}
              allElements={project.elements}
              onUpdateElement={handleUpdateElement}
              onWeldWithAdjacent={handleWeldAdjacent}
              onCopyVectorClipboard={handleCopyVectorClipboard}
              onClose={() => setIsContextualVariantsOpen(false)}
            />
          )}
        </>
      }
      sidebar={
        <ToolsPanel
          currentScript={project.globalScript}
          onScriptChange={handleScriptChange}
          selectedElement={selectedElement}
          selectedMultiIds={selectedMultiIds}
          onSelectMultiElements={setSelectedMultiIds}
          onUpdateElement={handleUpdateElement}
          onAddElement={handleAddElement}
          onAddElements={handleAddElements}
          elements={project.elements}
          onSelectElement={setSelectedElementId}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onReorderElement={handleReorderElement}
          onGroupElements={handleGroupElements}
          onUngroupElements={handleUngroupElements}
          paperTexture={project.paperTexture}
          onPaperTextureChange={handlePaperTextureChange}
          frameBorder={project.frameBorder}
          onFrameBorderChange={handleFrameBorderChange}
          layoutMode={project.layoutMode}
          onLayoutModeChange={handleLayoutModeChange}
          canvasWidth={project.canvasWidth}
          canvasHeight={project.canvasHeight}
          onResizeCanvas={handleResizeCanvas}
          korsiGuides={korsiGuides}
          onUpdateKorsiGuides={handleUpdateKorsiGuides}
          onOpenAlternateGlyphs={handleOpenAlternateGlyphs}
          onOpenSealStamp={handleOpenSealStamp}
          onOpenDotRuler={handleOpenDotRuler}
          onOpenReedPen={handleOpenReedPen}
          onOpenTazhibBuilder={handleOpenTazhibBuilder}
          onOpenEbruStudio={handleOpenEbruStudio}
          onOpenSplitWord={handleOpenSplitWord}
          onDirectSplit={handleDirectSplitSelected}
          isDigitalRulerActive={isDigitalRulerOpen}
          onToggleDigitalRuler={handleToggleDigitalRuler}
          onOpenFontManager={handleOpenFontManager}
          userFonts={userFonts}
          isMobileDrawerOpen={isMobileDrawerOpen}
          onCloseMobileDrawer={handleCloseMobileDrawer}
          activeTabOverride={activeToolsTab}
          onTabChangeOverride={handleTabChangeOverride}
        />
      }
      floatingControls={
        <FloatingElementControls
          element={selectedElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onDirectSplit={handleDirectSplitSelected}
          onOpenSplitWord={handleOpenSplitWord}
          onOpenContextualVariants={() => setIsContextualVariantsOpen(true)}
          onWeldAdjacent={handleWeldAdjacent}
          onCopyVector={handleCopyVectorClipboard}
        />
      }
      bottomNav={
        <MobileBottomNav
          activeTab={mobileBottomTab}
          onSelectTab={handleMobileTabChange}
          selectedElement={selectedElement}
          elementsCount={project.elements.length}
          onOpenMenu={handleOpenMobileStudios}
        />
      }
      modals={
        <>
          {isPoetryAiOpen && (
            <PoetryAiModal
              isOpen={isPoetryAiOpen}
              onClose={() => setIsPoetryAiOpen(false)}
              onInsertVerse={handleInsertVerse}
              currentScript={project.globalScript}
              currentCanvasElements={project.elements}
            />
          )}

          {isTemplatesOpen && (
            <TemplatesModal
              isOpen={isTemplatesOpen}
              onClose={() => setIsTemplatesOpen(false)}
              onSelectTemplate={handleSelectTemplate}
            />
          )}

          {isExportOpen && (
            <ExportModal
              isOpen={isExportOpen}
              onClose={() => setIsExportOpen(false)}
              project={project}
              onSaveJson={handleSaveJson}
            />
          )}

          {isAlternateGlyphsOpen && (
            <AlternateGlyphsModal
              isOpen={isAlternateGlyphsOpen}
              onClose={() => setIsAlternateGlyphsOpen(false)}
              onSelectGlyph={handleSelectAlternateGlyph}
              selectedElementText={selectedElement?.text}
              currentScript={project.globalScript}
            />
          )}

          {isSealStampOpen && (
            <SealStampModal
              isOpen={isSealStampOpen}
              onClose={() => setIsSealStampOpen(false)}
              onInsertSeal={handleAddElement}
              canvasWidth={project.canvasWidth}
              canvasHeight={project.canvasHeight}
            />
          )}

          {isDotRulerOpen && (
            <DotRulerModal
              isOpen={isDotRulerOpen}
              onClose={() => setIsDotRulerOpen(false)}
              onInsertDotGuide={handleAddElement}
              canvasWidth={project.canvasWidth}
              canvasHeight={project.canvasHeight}
            />
          )}

          {/* Feature 4: Reed Pen Simulator */}
          {isReedPenOpen && (
            <ReedPenSimulator
              isOpen={isReedPenOpen}
              onClose={() => setIsReedPenOpen(false)}
              onSaveStrokes={(strokes) => strokes.forEach(handleInsertReedPenStroke)}
              canvasWidth={project.canvasWidth}
              canvasHeight={project.canvasHeight}
            />
          )}

          {/* Feature 6: Tazhib & Shamseh Modular Builder */}
          {isTazhibBuilderOpen && (
            <TazhibBuilderModal
              isOpen={isTazhibBuilderOpen}
              onClose={() => setIsTazhibBuilderOpen(false)}
              onAddElements={handleAddElements}
              canvasWidth={project.canvasWidth}
              canvasHeight={project.canvasHeight}
            />
          )}

          {/* Feature 8: Dynamic Ebru Paper Studio */}
          {isEbruStudioOpen && (
            <EbruPaperModal
              isOpen={isEbruStudioOpen}
              onClose={() => setIsEbruStudioOpen(false)}
              currentSettings={ebruSettings}
              onApplyEbru={(settings) => setEbruSettings(settings)}
              onApplyTextureType={(texture) => setProject(p => ({ ...p, paperTexture: texture }))}
            />
          )}

          {/* Feature 2: Word & Syllable Splitting Tool */}
          {isWordSplittingOpen && (
            <WordSplittingModal
              isOpen={isWordSplittingOpen}
              onClose={() => setIsWordSplittingOpen(false)}
              selectedElement={selectedElement}
              onReplaceWithSplitWords={handleReplaceSplitWords}
              onReplaceElementWithParts={handleReplaceSplitWords}
              onAddWords={handleAddElements}
              globalScript={project.globalScript}
            />
          )}

          {/* Feature 9: History Snapshots & Version History */}
          {isHistorySnapshotsOpen && (
            <HistorySnapshotsModal
              isOpen={isHistorySnapshotsOpen}
              onClose={() => setIsHistorySnapshotsOpen(false)}
              currentProject={project}
              snapshots={snapshots}
              onSaveSnapshot={handleSaveSnapshot}
              onRestoreSnapshot={handleRestoreSnapshot}
              onDeleteSnapshot={handleDeleteSnapshot}
              undoStackLength={history.length}
              redoStackLength={redoStack.length}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />
          )}

          {/* Feature: Comprehensive Font Library & Custom User Font Upload Studio */}
          {isFontManagerOpen && (
            <CustomFontManagerModal
              isOpen={isFontManagerOpen}
              onClose={() => setIsFontManagerOpen(false)}
              currentScript={project.globalScript}
              userFonts={userFonts}
              selectedElement={selectedElement}
              onUpdateSelectedElementFont={(fontFamily, script) => {
                if (selectedElementId) {
                  handleUpdateElement(selectedElementId, {
                    fontFamily,
                    script: script || 'custom',
                  });
                }
              }}
              onSelectScript={(script, customFont) => {
                if (customFont) {
                  handleScriptChange('custom');
                  if (selectedElementId) {
                    handleUpdateElement(selectedElementId, {
                      script: 'custom',
                      fontFamily: customFont.fontFamily,
                    });
                  }
                } else {
                  handleScriptChange(script);
                  if (selectedElementId) {
                    const meta = SCRIPT_FONT_MAP[script];
                    if (meta) {
                      handleUpdateElement(selectedElementId, {
                        script: script,
                        fontFamily: meta.cssFamily,
                      });
                    }
                  }
                }
              }}
              onAddUserFont={handleAddCustomFont}
              onDeleteUserFont={handleDeleteCustomFont}
              onUpdateUserFonts={(fonts) => {
                setUserFonts(fonts);
                saveUserFontsToStorage(fonts);
              }}
              selectedElementText={selectedElement?.text}
            />
          )}

          {/* Feature: 3D Real-World Architectural Mockup Studio */}
          {isMockupOpen && (
            <MockupPreviewModal
              isOpen={isMockupOpen}
              onClose={() => setIsMockupOpen(false)}
              elements={project.elements}
              canvasWidth={project.canvasWidth}
              canvasHeight={project.canvasHeight}
              backgroundColor={project.backgroundColor}
              paperTexture={project.paperTexture}
              ebruSettings={ebruSettings}
              frameBorder={project.frameBorder}
            />
          )}

          {/* Feature: Royal Persian Certificate of Authenticity Generator */}
          {isCertificateOpen && (
            <CertificateModal
              isOpen={isCertificateOpen}
              onClose={() => setIsCertificateOpen(false)}
              elements={project.elements}
              canvasWidth={project.canvasWidth}
              canvasHeight={project.canvasHeight}
              projectName={project.name}
              globalScript={project.globalScript}
            />
          )}

          {/* Feature: CNC Laser Cut & Gold Jewelry Vector Boolean Studio */}
          {isCncLaserOpen && (
            <CncLaserStudioModal
              isOpen={isCncLaserOpen}
              onClose={() => setIsCncLaserOpen(false)}
              elements={project.elements}
              canvasWidth={project.canvasWidth}
              canvasHeight={project.canvasHeight}
            />
          )}

          {/* Feature: Curated Calligraphy Palettes Studio */}
          {isPalettesOpen && (
            <CalligraphyPalettesModal
              isOpen={isPalettesOpen}
              onClose={() => setIsPalettesOpen(false)}
              elements={project.elements}
              onUpdateElements={handleApplyPaletteElements}
              onPaperTextureChange={(texture) => setProject(p => ({ ...p, paperTexture: texture }))}
              onBackgroundColorChange={(color) => setProject(p => ({ ...p, backgroundColor: color }))}
              currentBackgroundColor={project.backgroundColor}
              currentPaperTexture={project.paperTexture}
            />
          )}

          {/* Feature: Snippets & Presets Composition Library */}
          {isSnippetsOpen && (
            <SnippetsPresetsModal
              isOpen={isSnippetsOpen}
              onClose={() => setIsSnippetsOpen(false)}
              currentElements={project.elements}
              selectedElementId={selectedElementId}
              selectedMultiIds={selectedMultiIds}
              currentScript={project.globalScript}
              onInsertSnippet={handleInsertSnippet}
            />
          )}

          {/* Feature: Museum Zen Presentation Mode */}
          {isZenModeOpen && (
            <ZenPresentationMode
              isOpen={isZenModeOpen}
              onClose={() => setIsZenModeOpen(false)}
              elements={project.elements}
              canvasWidth={project.canvasWidth}
              canvasHeight={project.canvasHeight}
              backgroundColor={project.backgroundColor}
              paperTexture={project.paperTexture}
              ebruSettings={ebruSettings}
              frameBorder={project.frameBorder}
              onOpenExport={() => {
                setIsZenModeOpen(false);
                setIsExportOpen(true);
              }}
            />
          )}

          {/* Feature 6: Workspace Presets Modal */}
          {isWorkspacePresetsOpen && (
            <WorkspacePresetsModal
              isOpen={isWorkspacePresetsOpen}
              onClose={() => setIsWorkspacePresetsOpen(false)}
              currentMode={workspaceMode}
              onSelectPreset={handleApplyPreset}
            />
          )}

          {/* Feature 7: Metallic Shimmer & Gold leaf Shader Studio */}
          {isMetallicShimmerOpen && (
            <MetallicShimmerModal
              isOpen={isMetallicShimmerOpen}
              onClose={() => setIsMetallicShimmerOpen(false)}
              selectedElement={selectedElement}
              onApplyShimmer={handleApplyShimmer}
            />
          )}

          {/* Feature 4 & 9: Optical Kerning & Negative Space Inspector */}
          {isOpticalKerningOpen && (
            <OpticalKerningModal
              isOpen={isOpticalKerningOpen}
              onClose={() => setIsOpticalKerningOpen(false)}
              elements={project.elements}
              onAutoBalance={handleAutoBalanceKerning}
              onAlignBaseline={handleAlignBaselineRow}
            />
          )}

          {/* Feature 5: Custom SVG Vector Importer */}
          {isCustomVectorImporterOpen && (
            <CustomVectorImporterModal
              isOpen={isCustomVectorImporterOpen}
              onClose={() => setIsCustomVectorImporterOpen(false)}
              onImportSvg={(element) => {
                handleAddElement(element);
                showToast('عنصر برداری با موفقیت به بوم اضافه شد');
              }}
            />
          )}

          {/* Feature 8: Project Bundle (.kelkpkg) Packager */}
          {isProjectBundleOpen && (
            <ProjectBundleModal
              isOpen={isProjectBundleOpen}
              onClose={() => setIsProjectBundleOpen(false)}
              project={project}
              userFonts={userFonts}
              onImportBundle={handleImportBundle}
            />
          )}

          {/* Feature 10: Ghost Reference Masterpiece Overlay */}
          {isGhostReferenceOpen && (
            <GhostReferenceModal
              isOpen={isGhostReferenceOpen}
              onClose={() => setIsGhostReferenceOpen(false)}
              settings={ghostReferenceSettings}
              onUpdateSettings={(updated) => {
                setGhostReferenceSettings(prev => ({ ...prev, ...updated }));
              }}
            />
          )}

          {/* Elegant In-App Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-neutral-900/95 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 select-none">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{toastMessage}</span>
            </div>
          )}
        </>
      }
    />
  );
}
