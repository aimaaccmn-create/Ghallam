import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  Sparkles, 
  Download, 
  Eye, 
  Move,
  RotateCcw
} from 'lucide-react';
import { CanvasElement, PaperTextureType, EbruPaperSettings, FrameBorderType } from '../types/calligraphy';
import { SCRIPT_FONT_MAP, generateReedPenRibbonPath, generateTextCurvePath, applyKashida } from '../utils/calligraphyEngine';
import { TAZHIB_COLLECTION } from '../data/tazhibAssets';

interface ZenPresentationModeProps {
  isOpen: boolean;
  onClose: () => void;
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  paperTexture: PaperTextureType;
  ebruSettings?: EbruPaperSettings;
  frameBorder: FrameBorderType;
  onOpenExport?: () => void;
}

export const ZenPresentationMode: React.FC<ZenPresentationModeProps> = React.memo(({
  isOpen,
  onClose,
  elements,
  canvasWidth,
  canvasHeight,
  backgroundColor,
  paperTexture,
  ebruSettings,
  frameBorder,
  onOpenExport,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [ambientTheme, setAmbientTheme] = useState<'dark_museum' | 'warm_candle' | 'pure_black' | 'light_gallery'>('dark_museum');
  const [enableGoldShimmer, setEnableGoldShimmer] = useState<boolean>(true);
  const [showHud, setShowHud] = useState<boolean>(true);
  const hideHudTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto fit on open
  useEffect(() => {
    if (isOpen) {
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      const scaleX = (vpW - 80) / canvasWidth;
      const scaleY = (vpH - 100) / canvasHeight;
      const initialZoom = Math.min(scaleX, scaleY, 1.3);
      setZoom(Math.max(0.4, Math.min(2.5, Number(initialZoom.toFixed(2)))));
    }
  }, [isOpen, canvasWidth, canvasHeight]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'f' || e.key === 'F') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        setZoom(z => Math.min(3, z + 0.15));
      } else if (e.key === '-') {
        setZoom(z => Math.max(0.3, z - 0.15));
      } else if (e.key === 'h' || e.key === 'H') {
        setShowHud(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-hide HUD on idle
  const handleMouseMove = () => {
    setShowHud(true);
    if (hideHudTimerRef.current) clearTimeout(hideHudTimerRef.current);
    hideHudTimerRef.current = setTimeout(() => {
      setShowHud(false);
    }, 4500);
  };

  if (!isOpen) return null;

  // Background styling based on ambient theme
  const getAmbientBgClass = () => {
    switch (ambientTheme) {
      case 'warm_candle':
        return 'bg-gradient-to-b from-[#1a120b] via-[#120d08] to-[#0a0704]';
      case 'pure_black':
        return 'bg-black';
      case 'light_gallery':
        return 'bg-[#e2e8f0]';
      case 'dark_museum':
      default:
        return 'bg-gradient-to-b from-[#090d16] via-[#05070c] to-[#020305]';
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-50 flex items-center justify-center select-none overflow-hidden font-vazir transition-colors duration-700 ${getAmbientBgClass()}`}
    >
      {/* Top Ambient Vignette & Museum Lighting spotlight */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,transparent_70%)]" />

      {/* Floating Canvas Viewer Stage */}
      <div 
        className="relative flex items-center justify-center p-8 transition-transform duration-200 ease-out"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <div
          className={`relative shadow-[0_30px_100px_rgba(0,0,0,0.85)] rounded-2xl overflow-hidden transition-all border border-neutral-800/60 ${
            enableGoldShimmer ? 'ring-1 ring-amber-500/30' : ''
          }`}
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            backgroundColor: backgroundColor,
          }}
        >
          {/* Paper Texture Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
            style={{
              backgroundImage: paperTexture === 'parchment'
                ? `radial-gradient(#c29b38 0.75px, transparent 0.75px), radial-gradient(#854d0e 0.75px, #fdf6e2 0.75px)`
                : paperTexture === 'gold_fleck'
                ? `radial-gradient(#d97706 1.5px, transparent 1.5px)`
                : 'none',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Render Elements */}
          {elements.map(el => {
            if (el.isVisible === false) return null;

            if (el.type === 'stroke' && el.strokeData) {
              const strokePath = generateReedPenRibbonPath(
                el.strokeData.points,
                el.strokeData.nibWidth,
                el.strokeData.nibAngle
              );
              return (
                <svg
                  key={el.id}
                  className="absolute inset-0 pointer-events-none"
                  style={{ zIndex: el.zIndex || 1 }}
                >
                  <path
                    d={strokePath}
                    fill={el.color || el.strokeData.color}
                    opacity={el.opacity || el.strokeData.opacity || 1}
                  />
                </svg>
              );
            }

            if (el.type === 'tazhib') {
              const tazhibItem = TAZHIB_COLLECTION.find(t => t.id === el.tazhibName);
              return (
                <div
                  key={el.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width || 80}px`,
                    height: `${el.height || 80}px`,
                    transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg) scale(${el.scaleX || 1}, ${el.scaleY || 1})`,
                    opacity: el.opacity ?? 1,
                    zIndex: el.zIndex || 1,
                  }}
                >
                  <svg viewBox={tazhibItem?.viewBox || '0 0 100 100'} className="w-full h-full">
                    <path d={tazhibItem?.path || ''} fill={el.color || '#d97706'} />
                  </svg>
                </div>
              );
            }

            // Text elements
            const displayText = el.text ? applyKashida(el.text, el.kashidaLevel || 0) : '';
            return (
              <div
                key={el.id}
                className="absolute pointer-events-none select-none text-center whitespace-nowrap"
                style={{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg) scale(${el.scaleX || 1}, ${el.scaleY || 1})`,
                  fontSize: `${el.fontSize}px`,
                  fontFamily: el.fontFamily || (el.script ? SCRIPT_FONT_MAP[el.script]?.cssFamily : 'inherit'),
                  color: el.color || '#18181b',
                  opacity: el.opacity ?? 1,
                  letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
                  zIndex: el.zIndex || 1,
                  textShadow: enableGoldShimmer && el.color?.includes('#d9') 
                    ? '0 0 15px rgba(245,158,11,0.4)' 
                    : undefined,
                }}
              >
                {displayText}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Minimalist HUD (Bottom Dock) */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-950/90 border border-neutral-800/80 rounded-2xl shadow-2xl p-2 px-4 flex items-center gap-3 backdrop-blur-xl transition-all duration-300 ${
          showHud ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        {/* Exit Fullscreen Button */}
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100 border border-neutral-800 text-xs font-semibold transition-all active:scale-95"
          title="خروج از حالت تمام صفحه (Esc / F)"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>خروج (Esc)</span>
        </button>

        <div className="h-4 w-px bg-neutral-800" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
            className="p-1.5 rounded-lg hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="کوچک‌نمایی (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-amber-300 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(3, z + 0.1))}
            className="p-1.5 rounded-lg hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="بزرگ‌نمایی (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="اندازه واقعی (100%)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-neutral-800" />

        {/* Ambient Mood Selector */}
        <div className="flex items-center gap-1">
          {[
            { id: 'dark_museum', label: 'موزه تاریک', icon: Moon },
            { id: 'warm_candle', label: 'شمع و کهن', icon: Sparkles },
            { id: 'light_gallery', label: 'گالری روشن', icon: Sun },
          ].map(theme => {
            const Icon = theme.icon;
            const isSelected = ambientTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setAmbientTheme(theme.id as any)}
                className={`p-1.5 rounded-lg flex items-center gap-1 text-[11px] transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200'
                }`}
                title={theme.label}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-neutral-800" />

        {/* Gold Shimmer Toggle */}
        <button
          onClick={() => setEnableGoldShimmer(!enableGoldShimmer)}
          className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-[11px] ${
            enableGoldShimmer
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
          title="افکت درخشش طلایی (Gold Shimmer)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </button>

        {onOpenExport && (
          <>
            <div className="h-4 w-px bg-neutral-800" />
            <button
              onClick={() => {
                onClose();
                onOpenExport();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>خروجی</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
});

