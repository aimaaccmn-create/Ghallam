import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CanvasElement, 
  CanvasLayoutMode, 
  FrameBorderType, 
  PaperTextureType, 
  EbruPaperSettings, 
  KorsiGuidesSettings 
} from '../types/calligraphy';
import { 
  applyKashida, 
  generateReedPenRibbonPath, 
  generateTextCurvePath 
} from '../utils/calligraphyEngine';
import { 
  getTextureCssStyle, 
  getOutlineCssStyle, 
  transformTextForDotArrangement, 
  generateAdvancedCurvePath 
} from '../utils/calligraphyEffects';
import { TAZHIB_COLLECTION, TAZHIB_MAP } from '../data/tazhibAssets';
import { DigitalRuler } from './DigitalRuler';
import { MagneticGuidesOverlay } from './MagneticGuidesOverlay';
import { CanvasMinimap } from './CanvasMinimap';
import { GhostReferenceSettings } from './GhostReferenceModal';
import { SpatialHashGrid } from '../utils/spatialGrid';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Move,
  FolderPlus,
  Trash2,
  Copy,
  X,
  Layers2
} from 'lucide-react';

export interface SnapGuideLine {
  id: string;
  type: 'x' | 'y';
  position: number;
  label?: string;
}

interface CanvasStageProps {
  width: number;
  height: number;
  elements: CanvasElement[];
  selectedElementId: string | null;
  selectedMultiIds?: string[];
  onSelectElement: (id: string | null) => void;
  onSelectMultiElements?: (ids: string[]) => void;
  onGroupElements?: (ids: string[]) => void;
  onUngroupElements?: (groupId: string) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>, saveHistory?: boolean) => void;
  onRecordHistory?: () => void;
  paperTexture: PaperTextureType;
  ebruSettings?: EbruPaperSettings;
  korsiGuides?: KorsiGuidesSettings;
  backgroundColor: string;
  frameBorder: FrameBorderType;
  layoutMode: CanvasLayoutMode;
  showGrid: boolean;
  showKorsi: boolean;
  zoom: number;
  onZoomChange?: (zoom: number) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  isDigitalRulerOpen?: boolean;
  onCloseDigitalRuler?: () => void;
  onContextMenuElement?: (element: CanvasElement) => void;
  onToggleGrid?: () => void;
  onToggleKorsi?: () => void;
  ghostReference?: GhostReferenceSettings;
  showMinimap?: boolean;
  isLiteMode?: boolean;
}

export const CanvasStage: React.FC<CanvasStageProps> = React.memo(({
  width,
  height,
  elements,
  selectedElementId,
  selectedMultiIds: externalMultiIds,
  onSelectElement,
  onSelectMultiElements,
  onGroupElements,
  onUngroupElements,
  onUpdateElement,
  onRecordHistory,
  paperTexture,
  ebruSettings,
  ghostReference,
  showMinimap = true,
  isLiteMode = false,
  korsiGuides = {
    showGuides: false,
    showMabda: true,
    showVasat: true,
    showForood: true,
    showChlipaGuides: false,
    chlipaAngle: -12,
    enableSnapping: true,
    snapDistance: 12,
  },
  backgroundColor,
  frameBorder,
  layoutMode,
  showGrid,
  showKorsi,
  zoom,
  onZoomChange,
  onDeleteElement,
  onDuplicateElement,
  isDigitalRulerOpen = false,
  onCloseDigitalRuler,
  onContextMenuElement,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingPointerRef = useRef<PointerEvent | null>(null);

  const [internalMultiIds, setInternalMultiIds] = useState<string[]>([]);
  const selectedMultiIds = externalMultiIds ?? internalMultiIds;
  const updateMultiIds = (ids: string[]) => {
    if (onSelectMultiElements) {
      onSelectMultiElements(ids);
    } else {
      setInternalMultiIds(ids);
    }
  };

  // Active snap lines for visual magnetic feedback during drag
  const [activeSnapLines, setActiveSnapLines] = useState<SnapGuideLine[]>([]);

  // Marquee rectangle selection state
  const [marquee, setMarquee] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Spatial Hash Grid for high-speed O(1) snapping lookups
  const spatialGridRef = useRef<SpatialHashGrid>(new SpatialHashGrid(120));

  // Sync spatial hash grid on elements change
  useEffect(() => {
    spatialGridRef.current.populate(elements);
  }, [elements]);

  // Gesture State Machine: IDLE | PANNING | PINCHING | ELEMENT_DRAG | ELEMENT_ROTATE | MARQUEE_SELECT
  type GestureState = 'IDLE' | 'PANNING' | 'PINCHING' | 'ELEMENT_DRAG' | 'ELEMENT_ROTATE' | 'MARQUEE_SELECT';
  const gestureStateRef = useRef<GestureState>('IDLE');

  // Active dragging ref to eliminate any react state latency during touch / mouse movement
  const dragTrackerRef = useRef<{
    elementId: string;
    startElemX: number;
    startElemY: number;
    pointerStartX: number;
    pointerStartY: number;
    dragOffsetX: number;
    dragOffsetY: number;
  } | null>(null);

  // Active rotation ref
  const rotateTrackerRef = useRef<{
    elementId: string;
    centerX: number;
    centerY: number;
    initialElemRotation: number;
    initialAngle: number;
  } | null>(null);

  const [isDraggingActive, setIsDraggingActive] = useState(false);
  const [isRotatingActive, setIsRotatingActive] = useState(false);

  // Multi-touch pinch zoom state for viewport
  const pinchStateRef = useRef<{ initialDistance: number; initialZoom: number } | null>(null);

  // Precision Touch D-Pad toggle for mobile
  const [showTouchDPad, setShowTouchDPad] = useState(false);
  const [nudgeStep, setNudgeStep] = useState<1 | 5 | 10>(5);

  // Long press timer for mobile context menu
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Clear any active long press timer safely
  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressStartPosRef.current = null;
  }, []);

  // Selected element helper
  const selectedElement = elements.find(el => el.id === selectedElementId);

  // Unified Multi-Selection Group Bounding Box
  const multiBounds = useMemo(() => {
    if (selectedMultiIds.length <= 1) return null;
    const multiEls = elements.filter(el => selectedMultiIds.includes(el.id) && el.isVisible !== false);
    if (multiEls.length <= 1) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of multiEls) {
      const halfW = (el.fontSize || 40) * (el.scaleX || 1) * 0.75;
      const halfH = (el.fontSize || 40) * (el.scaleY || 1) * 0.75;
      minX = Math.min(minX, el.x - halfW);
      maxX = Math.max(maxX, el.x + halfW);
      minY = Math.min(minY, el.y - halfH);
      maxY = Math.max(maxY, el.y + halfH);
    }
    if (!isFinite(minX) || !isFinite(minY)) return null;
    return { minX: minX - 16, minY: minY - 16, width: maxX - minX + 32, height: maxY - minY + 32 };
  }, [selectedMultiIds, elements]);

  // Auto fit canvas to screen function
  const handleAutoFit = useCallback(() => {
    if (!viewportRef.current || !onZoomChange) return;
    const vpWidth = viewportRef.current.clientWidth;
    const vpHeight = viewportRef.current.clientHeight;
    
    const paddingX = vpWidth < 640 ? 20 : 48;
    const paddingY = vpHeight < 640 ? 20 : 48;

    const availableWidth = Math.max(160, vpWidth - paddingX);
    const availableHeight = Math.max(160, vpHeight - paddingY);

    const scaleX = availableWidth / width;
    const scaleY = availableHeight / height;
    const bestZoom = Math.min(scaleX, scaleY, 1.2);
    const clamped = Math.max(0.25, Math.min(2.5, Number(bestZoom.toFixed(2))));
    onZoomChange(clamped);
  }, [width, height, onZoomChange]);

  // Initial auto fit for mobile/tablet screens on mount
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        handleAutoFit();
      }
    };
    const timer = setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleAutoFit]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElementId) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const el = elements.find(item => item.id === selectedElementId);
      if (!el || el.isLocked) return;

      const step = e.shiftKey ? 10 : 2;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onUpdateElement(selectedElementId, { y: el.y - step });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onUpdateElement(selectedElementId, { y: el.y + step });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onUpdateElement(selectedElementId, { x: el.x - step });
      } else if (e.key === 'Right' || e.key === 'ArrowRight') {
        e.preventDefault();
        onUpdateElement(selectedElementId, { x: el.x + step });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteElement(selectedElementId);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onSelectElement(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onDuplicateElement(selectedElementId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, elements, onUpdateElement, onDeleteElement, onSelectElement, onDuplicateElement]);

  // Move element target coordinates with high-speed O(1) spatial snapping & tandem multi-selection
  const moveElementTo = useCallback((targetX: number, targetY: number, elementId: string) => {
    const el = elements.find(item => item.id === elementId);
    if (!el) return;

    let finalX = targetX;
    let finalY = targetY;
    let activeGuides: SnapGuideLine[] = [];

    if (korsiGuides.enableSnapping) {
      const snapResult = spatialGridRef.current.computeMagneticSnapping(
        targetX,
        targetY,
        elementId,
        width,
        height,
        korsiGuides.snapDistance || 12,
        korsiGuides.showVasat,
        korsiGuides.showMabda,
        korsiGuides.showForood,
        selectedMultiIds
      );
      finalX = snapResult.finalX;
      finalY = snapResult.finalY;
      activeGuides = snapResult.guides;
    }

    if (activeGuides.length > 0 && activeSnapLines.length === 0) {
      // Magnetic guideline snapped
    }
    setActiveSnapLines(activeGuides);

    const deltaX = finalX - el.x;
    const deltaY = finalY - el.y;

    if (deltaX === 0 && deltaY === 0) return;

    // Move all multi-selected elements together if dragging one of them
    if (selectedMultiIds.includes(elementId) && selectedMultiIds.length > 1) {
      selectedMultiIds.forEach(id => {
        const item = elements.find(e => e.id === id);
        if (item && !item.isLocked) {
          onUpdateElement(id, {
            x: item.x + deltaX,
            y: item.y + deltaY,
          }, false);
        }
      });
    } else {
      // Move anchored children synchronously (Smart Tashkeel Anchoring)
      elements.forEach(otherEl => {
        if (otherEl.parentAnchorId === elementId) {
          onUpdateElement(otherEl.id, {
            x: otherEl.x + deltaX,
            y: otherEl.y + deltaY,
          }, false);
        }
      });

      onUpdateElement(elementId, { x: finalX, y: finalY }, false);
    }
  }, [elements, height, width, korsiGuides, selectedMultiIds, onUpdateElement]);

  // ----------------------------------------------------
  // Global Window Pointer Move & Up with RequestAnimationFrame (RAF) 60fps throttling
  // ----------------------------------------------------
  useEffect(() => {
    const processPointerMove = (e: PointerEvent) => {
      // 1. Handle Marquee Drag Selection
      if (marquee && containerRef.current) {
        const canvasRect = containerRef.current.getBoundingClientRect();
        const px = (e.clientX - canvasRect.left) / zoom;
        const py = (e.clientY - canvasRect.top) / zoom;

        setMarquee(prev => prev ? { ...prev, currentX: px, currentY: py } : null);

        const minX = Math.min(marquee.startX, px);
        const maxX = Math.max(marquee.startX, px);
        const minY = Math.min(marquee.startY, py);
        const maxY = Math.max(marquee.startY, py);

        const insideIds = elements
          .filter(el => el.isVisible !== false && el.x >= minX && el.x <= maxX && el.y >= minY && el.y <= maxY)
          .map(el => el.id);

        if (insideIds.length > 0) {
          updateMultiIds(insideIds);
        }
        return;
      }

      // 2. Handle Element Dragging
      if (dragTrackerRef.current && containerRef.current) {
        const tracker = dragTrackerRef.current;
        const canvasRect = containerRef.current.getBoundingClientRect();
        const px = (e.clientX - canvasRect.left) / zoom;
        const py = (e.clientY - canvasRect.top) / zoom;

        const targetX = Math.round(px - tracker.dragOffsetX);
        const targetY = Math.round(py - tracker.dragOffsetY);

        moveElementTo(targetX, targetY, tracker.elementId);
      }

      // 3. Handle Rotating
      if (rotateTrackerRef.current && containerRef.current) {
        const tracker = rotateTrackerRef.current;
        const canvasRect = containerRef.current.getBoundingClientRect();
        const px = (e.clientX - canvasRect.left) / zoom;
        const py = (e.clientY - canvasRect.top) / zoom;

        const dx = px - tracker.centerX;
        const dy = py - tracker.centerY;
        const radians = Math.atan2(dy, dx);
        const currentAngle = (radians * 180) / Math.PI;
        const deltaAngle = currentAngle - tracker.initialAngle;
        const newRotation = Math.round(tracker.initialElemRotation + deltaAngle);

        onUpdateElement(tracker.elementId, { rotation: newRotation }, false);
      }
    };

    const handleGlobalPointerMove = (e: PointerEvent) => {
      // If user moved finger more than 6px from pointer down start position, cancel long press immediately!
      if (longPressTimerRef.current && longPressStartPosRef.current) {
        const dist = Math.hypot(
          e.clientX - longPressStartPosRef.current.x,
          e.clientY - longPressStartPosRef.current.y
        );
        if (dist > 6) {
          cancelLongPress();
        }
      }

      if (!dragTrackerRef.current && !rotateTrackerRef.current && !marquee) return;
      pendingPointerRef.current = e;

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          if (pendingPointerRef.current) {
            processPointerMove(pendingPointerRef.current);
          }
        });
      }
    };

    const handleGlobalPointerUp = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      cancelLongPress();
      if (dragTrackerRef.current) {
        dragTrackerRef.current = null;
        setIsDraggingActive(false);
        setActiveSnapLines([]);
      }
      if (rotateTrackerRef.current) {
        rotateTrackerRef.current = null;
        setIsRotatingActive(false);
      }
      if (marquee) {
        setMarquee(null);
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [zoom, moveElementTo, onUpdateElement, marquee, elements, cancelLongPress]);

  // Pointer Down on Canvas Stage Background (starts marquee box selection)
  const handleStagePointerDown = (e: React.PointerEvent) => {
    cancelLongPress();

    // On touch devices without shift key, allow regular touch pan/scroll without trapping pointer with marquee
    if (e.pointerType === 'touch' && !e.shiftKey) {
      onSelectElement(null);
      updateMultiIds([]);
      return;
    }

    if (e.target === containerRef.current || (e.target as HTMLElement)?.classList?.contains('canvas-stage-bg')) {
      const canvasRect = containerRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const px = (e.clientX - canvasRect.left) / zoom;
        const py = (e.clientY - canvasRect.top) / zoom;
        setMarquee({ startX: px, startY: py, currentX: px, currentY: py });
        if (!e.shiftKey) {
          onSelectElement(null);
          updateMultiIds([]);
        }
      }
    }
  };

  // Pointer Down on Element
  const handlePointerDownElement = (e: React.PointerEvent, element: CanvasElement) => {
    // If right-clicked with mouse, allow onContextMenu to handle it without starting a drag
    if (e.button === 2) {
      cancelLongPress();
      return;
    }

    e.stopPropagation();
    if (element.isLocked) return;

    if (e.shiftKey) {
      // Toggle Shift Multi-Selection
      const updated = selectedMultiIds.includes(element.id)
        ? selectedMultiIds.filter(id => id !== element.id)
        : [...selectedMultiIds, element.id];
      updateMultiIds(updated);
      onSelectElement(element.id);
      return;
    }

    if (!selectedMultiIds.includes(element.id)) {
      updateMultiIds([element.id]);
    }
    onSelectElement(element.id);
    onRecordHistory?.();

    const canvasRect = containerRef.current?.getBoundingClientRect();
    if (canvasRect) {
      const px = (e.clientX - canvasRect.left) / zoom;
      const py = (e.clientY - canvasRect.top) / zoom;

      dragTrackerRef.current = {
        elementId: element.id,
        startElemX: element.x,
        startElemY: element.y,
        pointerStartX: px,
        pointerStartY: py,
        dragOffsetX: px - element.x,
        dragOffsetY: py - element.y,
      };
      setIsDraggingActive(true);
    }

    // Long press timer (550ms stationary hold) for context menu on mobile touch
    cancelLongPress();
    if (e.pointerType === 'touch') {
      longPressStartPosRef.current = { x: e.clientX, y: e.clientY };
      longPressTimerRef.current = setTimeout(() => {
        // Only trigger if no active drag movement occurred
        if (onContextMenuElement && !isDraggingActive) {
          onContextMenuElement(element);
        }
        cancelLongPress();
      }, 550);
    }
  };

  // Rotation Knob Pointer Down
  const handleRotatePointerDown = (e: React.PointerEvent, el: CanvasElement) => {
    cancelLongPress();
    e.stopPropagation();
    setIsRotatingActive(true);
    onRecordHistory?.();

    const canvasRect = containerRef.current?.getBoundingClientRect();
    if (canvasRect) {
      const px = (e.clientX - canvasRect.left) / zoom;
      const py = (e.clientY - canvasRect.top) / zoom;
      const dx = px - el.x;
      const dy = py - el.y;
      const initialAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

      rotateTrackerRef.current = {
        elementId: el.id,
        centerX: el.x,
        centerY: el.y,
        initialElemRotation: el.rotation || 0,
        initialAngle,
      };
    }
  };

  // Multi-Touch Pinch to Zoom & Touch Cancellation on Viewport
  const handleTouchStartViewport = (e: React.TouchEvent) => {
    if (e.touches.length >= 2) {
      // 2-finger pinch/zoom or pan: cancel all element drags and long-presses immediately
      cancelLongPress();
      if (dragTrackerRef.current) {
        dragTrackerRef.current = null;
        setIsDraggingActive(false);
        setActiveSnapLines([]);
      }
      if (rotateTrackerRef.current) {
        rotateTrackerRef.current = null;
        setIsRotatingActive(false);
      }
      if (marquee) {
        setMarquee(null);
      }
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const distance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      pinchStateRef.current = { initialDistance: distance, initialZoom: zoom };
    }
  };

  const handleTouchMoveViewport = (e: React.TouchEvent) => {
    // If moving or pinching, clear any stationary long-press timer
    cancelLongPress();

    if (e.touches.length === 2 && onZoomChange) {
      e.preventDefault();
      // Ensure drag tracker is wiped during pinch zoom
      if (dragTrackerRef.current) {
        dragTrackerRef.current = null;
        setIsDraggingActive(false);
        setActiveSnapLines([]);
      }
      if (rotateTrackerRef.current) {
        rotateTrackerRef.current = null;
        setIsRotatingActive(false);
      }
      if (marquee) {
        setMarquee(null);
      }

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const distance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

      if (!pinchStateRef.current) {
        pinchStateRef.current = { initialDistance: distance, initialZoom: zoom };
      } else {
        const factor = distance / pinchStateRef.current.initialDistance;
        const targetZoom = Math.min(2.5, Math.max(0.25, Number((pinchStateRef.current.initialZoom * factor).toFixed(2))));
        onZoomChange(targetZoom);
      }
    }
  };

  const handleTouchEndViewport = () => {
    cancelLongPress();
    pinchStateRef.current = null;
  };

  // Touch Nudge D-Pad step execution
  const handleNudge = (dx: number, dy: number) => {
    if (!selectedElement || selectedElement.isLocked) return;
    moveElementTo(selectedElement.x + dx * nudgeStep, selectedElement.y + dy * nudgeStep, selectedElement.id);
  };

  // Background Paper Texture Styles
  const getTextureStyle = (): React.CSSProperties => {
    // High-performance Lite Mode: use flat/fast CSS gradients without heavy SVG feTurbulence
    if (isLiteMode) {
      switch (paperTexture) {
        case 'parchment':
          return {
            backgroundColor: '#faf5e8',
            backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.6) 0%, rgba(217, 186, 140, 0.25) 100%)',
          };
        case 'ebru':
        case 'custom_ebru':
          return {
            backgroundColor: '#faf5e8',
          };
        case 'gold_fleck':
          return {
            backgroundColor: '#fcf8ef',
          };
        case 'dark_velvet':
          return {
            backgroundColor: '#0a0f1d',
          };
        case 'kraft':
          return {
            backgroundColor: '#d8b688',
          };
        case 'white':
        default:
          return {
            backgroundColor: backgroundColor || '#ffffff'
          };
      }
    }

    switch (paperTexture) {
      case 'parchment':
        return {
          backgroundColor: '#faf5e8',
          backgroundImage: `
            radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.4) 0%, rgba(217, 186, 140, 0.3) 100%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
          `
        };
      case 'ebru':
        return {
          backgroundColor: '#f8fafc',
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(217, 119, 6, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(136, 19, 55, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.06) 0%, transparent 60%)
          `
        };
      case 'custom_ebru':
        return {
          backgroundColor: '#faf5e8',
        };
      case 'gold_fleck':
        return {
          backgroundColor: '#fcf8ef',
          backgroundImage: `
            radial-gradient(circle at 15% 25%, rgba(234, 179, 8, 0.3) 1px, transparent 1px),
            radial-gradient(circle at 75% 35%, rgba(217, 119, 6, 0.3) 1.5px, transparent 1.5px),
            radial-gradient(circle at 45% 65%, rgba(234, 179, 8, 0.25) 1px, transparent 1px),
            radial-gradient(circle at 85% 80%, rgba(217, 119, 6, 0.3) 2px, transparent 2px)
          `,
          backgroundSize: '120px 120px'
        };
      case 'dark_velvet':
        return {
          backgroundColor: '#0a0f1d',
          backgroundImage: `
            radial-gradient(ellipse at 50% 40%, #15233c 0%, #080d18 100%)
          `
        };
      case 'kraft':
        return {
          backgroundColor: '#d8b688',
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        };
      case 'white':
      default:
        return {
          backgroundColor: backgroundColor || '#ffffff'
        };
    }
  };

  return (
    <div 
      ref={viewportRef}
      className="flex-1 h-full w-full overflow-auto bg-neutral-900 flex items-center justify-center p-2 sm:p-6 md:p-8 relative select-none"
      onTouchStart={handleTouchStartViewport}
      onTouchMove={handleTouchMoveViewport}
      onTouchEnd={handleTouchEndViewport}
      onTouchCancel={handleTouchEndViewport}
      onScroll={cancelLongPress}
      onClick={() => onSelectElement(null)}
    >
      {/* Canvas Wrapper with Zoom Scaling */}
      <div 
        style={{ 
          transform: `scale(${zoom}) translateZ(0)`, 
          transformOrigin: 'center center',
          touchAction: 'none'
        }}
        className="shadow-2xl relative will-change-transform"
      >
        {/* Main Vector Calligraphy Stage */}
        <div
          ref={containerRef}
          onPointerDown={handleStagePointerDown}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            ...getTextureStyle(),
          }}
          className={`canvas-stage-bg relative overflow-hidden rounded-md shadow-2xl border border-neutral-700/50 touch-none select-none ${
            isDraggingActive ? 'cursor-grabbing' : ''
          }`}
        >
          {/* Dynamic Ebru Shader Background */}
          {paperTexture === 'custom_ebru' && ebruSettings && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: `linear-gradient(135deg, ${ebruSettings.primaryColor} 0%, transparent 40%, ${ebruSettings.secondaryColor} 70%, ${ebruSettings.accentColor} 100%)`,
                  filter: isLiteMode ? 'none' : `blur(${10 - ebruSettings.marblingDensity}px)`,
                }}
              />
              {!isLiteMode && ebruSettings.goldSpeckles > 0 && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#fbbf24 1.5px, transparent 1.5px)',
                    backgroundSize: `${Math.max(12, 35 - ebruSettings.goldSpeckles * 0.25)}px ${Math.max(12, 35 - ebruSettings.goldSpeckles * 0.25)}px`,
                    opacity: ebruSettings.goldSpeckles / 100,
                  }}
                />
              )}
            </div>
          )}

          {/* Traditional Frame Borders */}
          {ghostReference && ghostReference.isVisible && ghostReference.url && (
            <div
              style={{
                position: 'absolute',
                left: `${ghostReference.x || 0}px`,
                top: `${ghostReference.y || 0}px`,
                transform: `scale(${ghostReference.scale || 1}) rotate(${ghostReference.rotation || 0}deg)`,
                transformOrigin: 'center center',
                opacity: ghostReference.opacity || 0.35,
                zIndex: 15,
                pointerEvents: ghostReference.isLocked ? 'none' : 'auto',
              }}
              className="select-none mix-blend-multiply"
            >
              <img
                src={ghostReference.url}
                alt="Ghost Reference"
                className="pointer-events-none max-w-none shadow-sm"
              />
            </div>
          )}

          {/* Traditional Frame Borders */}
          {frameBorder === 'classic_gold' && (
            <div className="absolute inset-4 border-2 border-amber-600/70 pointer-events-none rounded">
              <div className="absolute inset-1.5 border border-amber-600/40" />
            </div>
          )}
          {frameBorder === 'tazhib_full' && (
            <div className="absolute inset-6 border-[3px] border-amber-500 pointer-events-none rounded">
              <div className="absolute inset-2 border border-amber-400/60" />
              <div className="absolute inset-3.5 border-2 border-amber-600/70" />
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber-500 rotate-45" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 rotate-45" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-500 rotate-45" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-500 rotate-45" />
            </div>
          )}
          {frameBorder === 'chlipa_traditional' && (
            <div className="absolute inset-8 border-2 border-amber-800/60 pointer-events-none">
              <div className="absolute inset-1 border border-amber-700/40" />
              <div className="absolute inset-8 border border-dashed border-amber-600/30" />
            </div>
          )}
          {frameBorder === 'minimal_double' && (
            <div className="absolute inset-5 border border-neutral-400/60 pointer-events-none">
              <div className="absolute inset-1 border border-neutral-400/40" />
            </div>
          )}

          {/* Guidelines: Millimeter Grid */}
          {showGrid && (
            <div className="absolute inset-0 bg-grid-pattern-light pointer-events-none opacity-60" />
          )}

          {/* Guidelines: Traditional Korsi lines */}
          {showKorsi && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {layoutMode === 'chlipa' ? (
                <svg width="100%" height="100%" className="opacity-30">
                  <line x1="100" y1="180" x2="800" y2="330" stroke="#d97706" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="100" y1="280" x2="800" y2="430" stroke="#d97706" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="100" y1="380" x2="800" y2="530" stroke="#d97706" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="100" y1="480" x2="800" y2="630" stroke="#d97706" strokeWidth="1" strokeDasharray="5,5" />
                </svg>
              ) : (
                <div className="w-full h-full flex flex-col justify-around opacity-30">
                  <div className="w-full border-b border-dashed border-amber-600" />
                  <div className="w-full border-b border-dashed border-amber-600" />
                  <div className="w-full border-b border-dashed border-amber-600" />
                  <div className="w-full border-b border-dashed border-amber-600" />
                  <div className="w-full border-b border-dashed border-amber-600" />
                </div>
              )}
            </div>
          )}

          {/* Smart Magnetic Guides Overlay */}
          <MagneticGuidesOverlay
            canvasWidth={width}
            canvasHeight={height}
            settings={korsiGuides}
          />

          {/* Dynamic Active Drag Snap Guides (Visual Magnetic Lines) */}
          {activeSnapLines.map(guide => (
            <div
              key={guide.id}
              style={{
                position: 'absolute',
                left: guide.type === 'x' ? `${guide.position}px` : '0px',
                top: guide.type === 'y' ? `${guide.position}px` : '0px',
                width: guide.type === 'x' ? '1px' : '100%',
                height: guide.type === 'y' ? '1px' : '100%',
                zIndex: 90,
              }}
              className="pointer-events-none"
            >
              <div 
                className={`w-full h-full ${
                  guide.type === 'x' 
                    ? 'border-r-2 border-dashed border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' 
                    : 'border-b-2 border-dashed border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                }`}
              />
              {guide.label && (
                <div 
                  style={{
                    position: 'absolute',
                    left: guide.type === 'x' ? '4px' : '16px',
                    top: guide.type === 'y' ? '4px' : '16px',
                  }}
                  className="bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 px-1.5 py-0.5 rounded text-[9px] font-vazir shadow font-bold"
                >
                  {guide.label}
                </div>
              )}
            </div>
          ))}

          {/* Marquee Selection Rectangle */}
          {marquee && (() => {
            const minX = Math.min(marquee.startX, marquee.currentX);
            const maxX = Math.max(marquee.startX, marquee.currentX);
            const minY = Math.min(marquee.startY, marquee.currentY);
            const maxY = Math.max(marquee.startY, marquee.currentY);
            return (
              <div
                style={{
                  position: 'absolute',
                  left: `${minX}px`,
                  top: `${minY}px`,
                  width: `${maxX - minX}px`,
                  height: `${maxY - minY}px`,
                  zIndex: 85,
                }}
                className="border border-dashed border-amber-400 bg-amber-500/15 pointer-events-none rounded shadow-sm"
              />
            );
          })()}

          {/* Render All Canvas Elements */}
          {elements.map((el) => {
            if (el.isVisible === false) return null;
            const isSelected = el.id === selectedElementId;
            const isMultiSelected = selectedMultiIds.includes(el.id);
            const isBeingDragged = dragTrackerRef.current?.elementId === el.id;
            
            let rawText = el.kashidaLevel || el.dotKashidaUnits 
              ? applyKashida(el.text || '', el.kashidaLevel || 0, el.dotKashidaUnits) 
              : (el.text || '');

            // Apply dot arrangement (normal, connected line, horizontal, hidden)
            const textContent = transformTextForDotArrangement(rawText, el.dotArrangement);

            // Compute texture & outline styles
            const textureStyle = getTextureCssStyle(el.textureFill, el.color);
            const outlineStyle = getOutlineCssStyle(el.outlineEnabled, el.outlineWidth, el.outlineColor, el.outlineStyle);

            const verticalScale = el.verticalKashida || 1;
            const stepSkew = el.stepKashidaAngle ? `skewY(${el.stepKashidaAngle}deg)` : '';

            return (
              <div
                key={el.id}
                id={`el_${el.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (e.shiftKey) {
                    const updated = selectedMultiIds.includes(el.id)
                      ? selectedMultiIds.filter(id => id !== el.id)
                      : [...selectedMultiIds, el.id];
                    updateMultiIds(updated);
                  }
                  onSelectElement(el.id);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectElement(el.id);
                  if (onContextMenuElement) {
                    onContextMenuElement(el);
                  }
                }}
                onPointerDown={(e) => handlePointerDownElement(e, el)}
                style={{
                  position: 'absolute',
                  left: `${el.x + (el.dotOffsetX || 0)}px`,
                  top: `${el.y + (el.dotOffsetY || 0)}px`,
                  transform: `translate(-50%, -50%) rotate(${el.rotation}deg) scale(${el.scaleX}, ${el.scaleY * verticalScale}) ${stepSkew}`,
                  zIndex: isSelected ? 99 : isMultiSelected ? 95 : el.zIndex,
                  cursor: el.isLocked ? 'not-allowed' : (isBeingDragged ? 'grabbing' : 'grab'),
                  opacity: el.opacity,
                  touchAction: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  willChange: isBeingDragged || isSelected ? 'transform' : 'auto',
                  contain: 'layout style',
                }}
                className={`group select-none min-w-[36px] min-h-[36px] p-1.5 sm:p-2 rounded-xl flex items-center justify-center ${
                  isSelected 
                    ? 'ring-2 ring-amber-500/90 bg-amber-500/10 shadow-lg shadow-amber-950/20' 
                    : isMultiSelected
                    ? 'ring-2 ring-amber-400/60 bg-amber-500/5'
                    : 'hover:ring-1 hover:ring-amber-500/40 hover:bg-amber-500/5'
                }`}
              >
                {/* 1. Freehand Reed Pen Stroke */}
                {el.type === 'stroke' && el.strokeData ? (
                  (() => {
                    const ribbonPath = generateReedPenRibbonPath(
                      el.strokeData.points, 
                      el.strokeData.nibAngle, 
                      el.strokeData.nibWidth
                    );
                    return (
                      <svg
                        width={width}
                        height={height}
                        style={{ position: 'absolute', left: `${-el.x}px`, top: `${-el.y}px` }}
                        className="pointer-events-none"
                      >
                        <defs>
                          <linearGradient id={`goldStroke_${el.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fde68a" />
                            <stop offset="35%" stopColor="#f59e0b" />
                            <stop offset="70%" stopColor="#d97706" />
                            <stop offset="100%" stopColor="#b45309" />
                          </linearGradient>
                        </defs>
                        <path 
                          d={ribbonPath} 
                          fill={el.strokeData.goldEffect ? `url(#goldStroke_${el.id})` : el.strokeData.color} 
                        />
                      </svg>
                    );
                  })()
                ) : el.type === 'seal' || (el.type === 'tazhib' && (el.tazhibName?.includes('seal') || el.tazhibName?.startsWith('seal_') || el.tazhibName?.startsWith('royal_seal_'))) ? (
                  // 2. Traditional Seal Stamp
                  (() => {
                    const tag = el.tazhibName || '';
                    const isPositive = tag.includes('positive');
                    const isCircle = tag.includes('circle');
                    const isSquare = tag.includes('square');
                    const isOctagon = tag.includes('octagon');
                    const isArch = tag.includes('arch');
                    const isShamseh = tag.includes('shamseh');
                    const isOval = !isCircle && !isSquare && !isOctagon && !isArch && !isShamseh;

                    // Detect material
                    let bgGrad = 'radial-gradient(circle at 35% 35%, #b91c1c 0%, #991b1b 50%, #7f1d1d 90%, #450a0a 100%)';
                    let borderCol = '#f87171';
                    let textCol = '#fef2f2';
                    let glow = '0 4px 14px rgba(185, 28, 28, 0.45)';

                    if (tag.includes('agate_gold')) {
                      bgGrad = 'radial-gradient(circle at 30% 30%, #7c2d12 0%, #451a03 60%, #1c1917 100%)';
                      borderCol = '#ca8a04';
                      textCol = '#fde047';
                      glow = '0 4px 14px rgba(202, 138, 4, 0.45)';
                    } else if (tag.includes('brass_qajar')) {
                      bgGrad = 'radial-gradient(circle at 30% 30%, #d97706 0%, #b45309 60%, #78350f 100%)';
                      borderCol = '#fef08a';
                      textCol = '#18181b';
                      glow = '0 4px 12px rgba(217, 119, 6, 0.35)';
                    } else if (tag.includes('lapis_royal')) {
                      bgGrad = 'radial-gradient(circle at 30% 30%, #1d4ed8 0%, #1e3a8a 60%, #0f172a 100%)';
                      borderCol = '#60a5fa';
                      textCol = '#f0fdf4';
                      glow = '0 4px 14px rgba(29, 78, 216, 0.4)';
                    } else if (tag.includes('charcoal_black')) {
                      bgGrad = 'radial-gradient(circle at 30% 30%, #27272a 0%, #18181b 60%, #09090b 100%)';
                      borderCol = '#52525b';
                      textCol = '#faf5e8';
                      glow = '0 4px 12px rgba(0, 0, 0, 0.5)';
                    } else if (tag.includes('emerald_green')) {
                      bgGrad = 'radial-gradient(circle at 30% 30%, #047857 0%, #065f46 60%, #022c22 100%)';
                      borderCol = '#34d399';
                      textCol = '#fef08a';
                      glow = '0 4px 14px rgba(4, 120, 87, 0.4)';
                    }

                    if (isPositive) {
                      bgGrad = '#faf5e8';
                      textCol = borderCol;
                    }

                    const parts = (el.text || '').split(' ');
                    const prefix = parts.length > 2 ? parts[0] + ' ' + parts[1] : (parts[0] || 'العبد');
                    const mainName = parts.length > 2 ? parts.slice(2, -1).join(' ') : (parts[1] || el.text || 'میرعلی');
                    const dateStr = parts.length > 1 ? parts[parts.length - 1] : '۱۴۴۷';

                    const shapeClasses = isCircle
                      ? 'rounded-full'
                      : isOval
                      ? 'rounded-[40px]'
                      : isOctagon
                      ? 'rounded-2xl'
                      : isSquare
                      ? 'rounded-xl'
                      : isArch
                      ? 'rounded-t-[44px] rounded-b-xl'
                      : 'rounded-2xl';

                    return (
                      <div
                        style={{
                          width: el.width || 120,
                          height: el.height || 90,
                          background: bgGrad,
                          borderColor: borderCol,
                          boxShadow: glow,
                        }}
                        className={`p-2 flex flex-col items-center justify-center text-center border-2 relative overflow-hidden pointer-events-none ${shapeClasses}`}
                      >
                        <div 
                          className={`absolute inset-1 border pointer-events-none ${shapeClasses}`}
                          style={{ borderColor: isPositive ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.35)' }}
                        />
                        <div className="space-y-0.5 leading-tight select-none z-10" style={{ color: textCol }}>
                          <div className="text-[10px] font-nastaliq opacity-90">{prefix}</div>
                          <div className="text-sm font-thuluth font-bold tracking-wide">{mainName}</div>
                          <div className="text-[9px] font-vazir opacity-80 font-mono">{dateStr}</div>
                        </div>
                      </div>
                    );
                  })()
                ) : el.type === 'tazhib' ? (
                  // 3. Tazhib Ornament
                  <div style={{ width: el.width || 80, height: el.height || 80 }} className="pointer-events-none">
                    {(() => {
                      const item = TAZHIB_MAP.get(el.tazhibName || '');
                      if (!item) return <div className="text-xs text-amber-500">تذهیب</div>;
                      return (
                        <svg viewBox={item.viewBox} className="w-full h-full drop-shadow-sm">
                          <path d={item.path} fill={el.color || item.defaultColor || '#d97706'} />
                        </svg>
                      );
                    })()}
                  </div>
                ) : el.curveType && el.curveType !== 'none' ? (
                  // 4. Curved Text along SVG Path with Advanced Curves
                  (() => {
                    const w = el.width || Math.max(260, (el.text?.length || 5) * el.fontSize * 0.75);
                    const h = el.height || el.fontSize * 2.8;
                    const curve = generateAdvancedCurvePath(
                      el.curveType, 
                      el.curvature || 50, 
                      el.curveRadius || 180, 
                      w, 
                      h
                    );

                    return (
                      <div className="relative pointer-events-none">
                        <svg width={w} height={h} className="overflow-visible">
                          <defs>
                            <path id={`path_${el.id}`} d={curve.pathD} fill="none" />
                          </defs>
                          <text
                            fontFamily={el.fontFamily || 'IranNastaliq, serif'}
                            fontSize={`${el.fontSize}px`}
                            fill={el.goldEffect ? '#d97706' : (el.color || '#18181b')}
                            stroke={el.outlineEnabled ? (el.outlineColor || '#f59e0b') : undefined}
                            strokeWidth={el.outlineEnabled ? el.outlineWidth : undefined}
                            direction="rtl"
                            className={el.goldEffect ? 'drop-shadow-md' : ''}
                          >
                            <textPath href={`#path_${el.id}`} startOffset="50%" textAnchor="middle">
                              {textContent}
                            </textPath>
                          </text>
                        </svg>

                        {/* Symmetry Reflected Copy for Curves */}
                        {el.symmetryMode === 'horizontal_mirror' && (
                          <svg width={w} height={h} style={{ transform: 'scaleX(-1)', opacity: 0.9 }} className="overflow-visible absolute top-0 left-0">
                            <text
                              fontFamily={el.fontFamily || 'IranNastaliq, serif'}
                              fontSize={`${el.fontSize}px`}
                              fill={el.goldEffect ? '#d97706' : (el.color || '#18181b')}
                              stroke={el.outlineEnabled ? (el.outlineColor || '#f59e0b') : undefined}
                              strokeWidth={el.outlineEnabled ? el.outlineWidth : undefined}
                              direction="rtl"
                            >
                              <textPath href={`#path_${el.id}`} startOffset="50%" textAnchor="middle">
                                {textContent}
                              </textPath>
                            </text>
                          </svg>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  // 5. Standard & Symmetrical Calligraphy Text
                  <div className="relative pointer-events-none">
                    {/* Tughra Imperial Crest (تاج و زلفین طغرا) */}
                    {el.symmetryMode === 'tughra_crest' && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-14 pointer-events-none opacity-90">
                        <svg viewBox="0 0 120 50" className="w-full h-full">
                          <path
                            d="M 10,48 C 20,5 50,5 60,35 C 70,5 100,5 110,48 M 60,35 L 60,2 M 35,28 C 45,15 75,15 85,28"
                            fill="none"
                            stroke={el.color || '#d97706'}
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Primary Text */}
                    <div
                      style={{
                        fontFamily: el.fontFamily || 'IranNastaliq, serif',
                        fontSize: `${el.fontSize}px`,
                        letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
                        marginTop: el.baselineShift ? `${el.baselineShift}px` : undefined,
                        textShadow: el.shadowBlur
                          ? `${el.shadowOffsetX || 2}px ${el.shadowOffsetY || 2}px ${el.shadowBlur}px ${el.shadowColor || '#000000'}`
                          : undefined,
                        whiteSpace: el.type === 'dot' || textContent.includes('\n') ? 'pre' : 'nowrap',
                        lineHeight: '1.2',
                        textAlign: 'center',
                        ...textureStyle,
                        ...outlineStyle,
                      }}
                      className={`dir-rtl select-none ${
                        el.goldEffect && !el.textureFill
                          ? 'bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 bg-clip-text text-transparent drop-shadow-md'
                          : ''
                      }`}
                    >
                      {textContent}
                    </div>

                    {/* Symmetry: Horizontal Mirror (المثنی) */}
                    {el.symmetryMode === 'horizontal_mirror' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: `${el.symmetryGap || 0}px`,
                          fontFamily: el.fontFamily || 'IranNastaliq, serif',
                          fontSize: `${el.fontSize}px`,
                          letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
                          whiteSpace: el.type === 'dot' || textContent.includes('\n') ? 'pre' : 'nowrap',
                          lineHeight: '1.2',
                          textAlign: 'center',
                          transform: 'scaleX(-1)',
                          opacity: 0.92,
                          ...textureStyle,
                          ...outlineStyle,
                        }}
                        className="dir-rtl select-none pointer-events-none"
                      >
                        {textContent}
                      </div>
                    )}

                    {/* Symmetry: Vertical Mirror */}
                    {el.symmetryMode === 'vertical_mirror' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: `${(el.fontSize * 1.1) + (el.symmetryGap || 0)}px`,
                          left: 0,
                          fontFamily: el.fontFamily || 'IranNastaliq, serif',
                          fontSize: `${el.fontSize}px`,
                          letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
                          whiteSpace: el.type === 'dot' || textContent.includes('\n') ? 'pre' : 'nowrap',
                          lineHeight: '1.2',
                          textAlign: 'center',
                          transform: 'scaleY(-1)',
                          opacity: 0.85,
                          ...textureStyle,
                          ...outlineStyle,
                        }}
                        className="dir-rtl select-none pointer-events-none"
                      >
                        {textContent}
                      </div>
                    )}

                    {/* Symmetry: Quad Mirror (۴ طرفه شمسه) */}
                    {el.symmetryMode === 'quad_mirror' && (
                      <>
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            fontFamily: el.fontFamily || 'IranNastaliq, serif',
                            fontSize: `${el.fontSize}px`,
                            transform: 'scaleX(-1)',
                            opacity: 0.85,
                            ...textureStyle,
                            ...outlineStyle,
                          }}
                          className="dir-rtl select-none pointer-events-none"
                        >
                          {textContent}
                        </div>
                        <div
                          style={{
                            position: 'absolute',
                            top: `${el.fontSize}px`,
                            left: 0,
                            fontFamily: el.fontFamily || 'IranNastaliq, serif',
                            fontSize: `${el.fontSize}px`,
                            transform: 'scaleY(-1)',
                            opacity: 0.85,
                            ...textureStyle,
                            ...outlineStyle,
                          }}
                          className="dir-rtl select-none pointer-events-none"
                        >
                          {textContent}
                        </div>
                        <div
                          style={{
                            position: 'absolute',
                            top: `${el.fontSize}px`,
                            left: 0,
                            fontFamily: el.fontFamily || 'IranNastaliq, serif',
                            fontSize: `${el.fontSize}px`,
                            transform: 'scale(-1, -1)',
                            opacity: 0.85,
                            ...textureStyle,
                            ...outlineStyle,
                          }}
                          className="dir-rtl select-none pointer-events-none"
                        >
                          {textContent}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Selection Handle & Touch-Optimized Rotation Handle */}
                {isSelected && !el.isLocked && (
                  <div className="absolute -inset-2 pointer-events-none">
                    {/* Top Rotation Knob with 44px touch area */}
                    <div
                      onPointerDown={(e) => handleRotatePointerDown(e, el)}
                      className="absolute -top-9 left-1/2 -translate-x-1/2 w-11 h-11 flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 transition-transform touch-none"
                      title="چرخش آزاد زاویه"
                    >
                      <div className="w-6 h-6 bg-amber-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-[10px] text-neutral-950 font-bold">
                        <RotateCw className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Composite Multi-Selection Group Bounding Box */}
          {multiBounds && (
            <div
              style={{
                position: 'absolute',
                left: `${multiBounds.minX}px`,
                top: `${multiBounds.minY}px`,
                width: `${multiBounds.width}px`,
                height: `${multiBounds.height}px`,
                zIndex: 96,
                pointerEvents: 'none',
              }}
              className="border-2 border-dashed border-amber-400/90 rounded-2xl bg-amber-500/5 shadow-2xl transition-all"
            >
              <div className="absolute -top-3.5 right-3 bg-amber-500 text-neutral-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md font-vazir">
                گروه انتخابی ({selectedMultiIds.length})
              </div>
            </div>
          )}

          {/* Digital Calligraphy Ruler */}
          <DigitalRuler
            isVisible={isDigitalRulerOpen}
            onClose={() => onCloseDigitalRuler && onCloseDigitalRuler()}
            canvasWidth={width}
            canvasHeight={height}
            zoom={zoom}
          />
        </div>
      </div>

      {/* Floating Multi-Selection Action Toolbar (Top Center) */}
      {selectedMultiIds.length > 1 && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-neutral-950/95 border border-amber-500/60 backdrop-blur-2xl px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-2 font-vazir animate-in fade-in slide-in-from-top-3"
        >
          <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-800 text-xs font-bold text-amber-300">
            <Layers2 className="w-4 h-4 text-amber-400" />
            <span>{selectedMultiIds.length} عنصر انتخاب‌شده</span>
          </div>

          {onGroupElements && (
            <button
              onClick={() => {
                onGroupElements(selectedMultiIds);
                updateMultiIds([]);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold transition-all active:scale-95"
              title="ایجاد گروه از لایه‌های انتخاب‌شده"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>گروه‌بندی</span>
            </button>
          )}

          <button
            onClick={() => {
              selectedMultiIds.forEach(id => onDuplicateElement(id));
            }}
            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 border border-neutral-800 transition-all text-xs flex items-center gap-1 px-2"
            title="تکثیر تمام عناصر انتخاب‌شده"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>تکثیر</span>
          </button>

          <button
            onClick={() => {
              selectedMultiIds.forEach(id => onDeleteElement(id));
              updateMultiIds([]);
              onSelectElement(null);
            }}
            className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 transition-all text-xs flex items-center gap-1 px-2"
            title="حذف عناصر انتخاب‌شده"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف</span>
          </button>

          <button
            onClick={() => {
              updateMultiIds([]);
              onSelectElement(null);
            }}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="لغو انتخاب"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Canvas Minimap / Radar Navigation */}
      {showMinimap && (
        <CanvasMinimap
          canvasWidth={width}
          canvasHeight={height}
          elements={elements}
          zoom={zoom}
          viewportRef={viewportRef}
          backgroundColor={backgroundColor}
          isVisible={showMinimap}
        />
      )}

      {/* Floating Canvas Navigation & Zoom Controller HUD (Bottom Right) */}
      <div className="absolute bottom-20 lg:bottom-6 right-2 sm:right-6 z-30 flex flex-col items-center gap-1.5 bg-neutral-950/95 border border-neutral-800/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl font-vazir text-neutral-300">
        {/* Zoom In */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onZoomChange) onZoomChange(Math.min(2.5, Number((zoom + 0.1).toFixed(2))));
          }}
          className="p-2 sm:p-2.5 rounded-xl hover:bg-neutral-850 active:bg-neutral-800 text-neutral-300 hover:text-amber-300 transition-all"
          title="بزرگ‌نمایی (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Level Indicator & 100% Reset */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onZoomChange) onZoomChange(1);
          }}
          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-400 hover:text-amber-300 transition-colors"
          title="اندازه ۱۰۰٪"
        >
          {Math.round(zoom * 100)}%
        </button>

        {/* Zoom Out */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onZoomChange) onZoomChange(Math.max(0.25, Number((zoom - 0.1).toFixed(2))));
          }}
          className="p-2 sm:p-2.5 rounded-xl hover:bg-neutral-850 active:bg-neutral-800 text-neutral-300 hover:text-amber-300 transition-all"
          title="کوچک‌نمایی (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Auto Fit to Screen (تطبیق بوم با صفحه نمایش) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAutoFit();
          }}
          className="p-2 sm:p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 active:scale-95 transition-all"
          title="تطبیق کامل بوم با صفحه نمایش (Auto-Fit)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* D-Pad Toggle for Mobile Precision Alignment */}
        {selectedElement && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTouchDPad(!showTouchDPad);
            }}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
              showTouchDPad
                ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-lg shadow-amber-950/50'
                : 'bg-neutral-900 text-amber-400 border-neutral-800 hover:bg-neutral-850'
            }`}
            title="پد هدایتگر لمسی (D-Pad)"
          >
            <Move className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating Precision D-Pad for Mobile Touch Interaction */}
      {selectedElement && showTouchDPad && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-20 left-4 z-40 bg-neutral-950/98 border border-amber-500/50 p-2.5 rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col items-center gap-1.5 animate-in fade-in zoom-in-95 font-vazir text-neutral-200"
        >
          <div className="flex items-center justify-between w-full px-1 mb-1">
            <span className="text-[10px] text-amber-400 font-bold">پد جابجایی دقیق</span>
            <div className="flex gap-1">
              {[1, 5, 10].map((step) => (
                <button
                  key={step}
                  onClick={() => setNudgeStep(step as any)}
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    nudgeStep === step ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-900 text-neutral-400'
                  }`}
                >
                  {step}px
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1">
            <div />
            <button
              onClick={() => handleNudge(0, -1)}
              className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 flex items-center justify-center border border-neutral-800 shadow-sm transition-all"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div />

            <button
              onClick={() => handleNudge(-1, 0)}
              className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 flex items-center justify-center border border-neutral-800 shadow-sm transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const centerY = height / 2;
                const centerX = width / 2;
                moveElementTo(centerX, centerY, selectedElement.id);
              }}
              className="w-9 h-9 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 flex items-center justify-center border border-amber-500/30 text-[9px] font-bold"
              title="مرکز بوم"
            >
              مرکز
            </button>
            <button
              onClick={() => handleNudge(1, 0)}
              className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 flex items-center justify-center border border-neutral-800 shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div />
            <button
              onClick={() => handleNudge(0, 1)}
              className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-amber-500 active:text-neutral-950 flex items-center justify-center border border-neutral-800 shadow-sm transition-all"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <div />
          </div>
        </div>
      )}
    </div>
  );
});
