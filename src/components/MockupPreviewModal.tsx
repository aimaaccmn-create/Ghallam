import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Sparkles, 
  Maximize2, 
  Layers, 
  Frame, 
  BookOpen, 
  Image as ImageIcon,
  Check,
  ZoomIn,
  Gem,
  Building,
  ScrollText
} from 'lucide-react';
import { CanvasElement, PaperTextureType, EbruPaperSettings, FrameBorderType } from '../types/calligraphy';
import { SCRIPT_FONT_MAP, applyKashida, generateReedPenRibbonPath } from '../utils/calligraphyEngine';
import { TAZHIB_COLLECTION } from '../data/tazhibAssets';
import { SoundEngine } from '../utils/soundEffects';

interface MockupPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  paperTexture: PaperTextureType;
  ebruSettings?: EbruPaperSettings;
  frameBorder: FrameBorderType;
}

export type MockupSceneType = 
  | 'classic_museum_frame'
  | 'modern_luxury_living'
  | 'gold_jewelry_box'
  | 'isfahan_mosaic_tile'
  | 'walnut_wood_inlay'
  | 'antique_manuscript_book'
  | 'parchment_wall_scroll';

export const MockupPreviewModal: React.FC<MockupPreviewModalProps> = React.memo(({
  isOpen,
  onClose,
  elements,
  canvasWidth,
  canvasHeight,
  backgroundColor,
  paperTexture,
  ebruSettings,
  frameBorder,
}) => {
  const [selectedScene, setSelectedScene] = useState<MockupSceneType>('classic_museum_frame');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const mockupContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const SCENES = [
    {
      id: 'classic_museum_frame',
      title: 'قاب طلای موزه',
      subtitle: 'قاب چوبی منبت‌کاری عتیق با نور گالری',
      icon: Frame,
    },
    {
      id: 'modern_luxury_living',
      title: 'دکور لابی مدرن',
      subtitle: 'فضای معاصر با قاب مشکی مات و پاسپارتو',
      icon: ImageIcon,
    },
    {
      id: 'gold_jewelry_box',
      title: 'پلاک طلا و مخمل',
      subtitle: 'پلاک زرین روی جعبه جواهر و مخمل درباری',
      icon: Gem,
    },
    {
      id: 'isfahan_mosaic_tile',
      title: 'کاشی‌کاری شیخ‌لطف‌الله',
      subtitle: 'معرق فیروزه‌ای و لاجوردی ابنیه تاریخی',
      icon: Sparkles,
    },
    {
      id: 'walnut_wood_inlay',
      title: 'معرق چوب گردو',
      subtitle: 'تابلو چوب منبت روی بتن اکسپوز',
      icon: Building,
    },
    {
      id: 'antique_manuscript_book',
      title: 'جلد چرم دیوان کهن',
      subtitle: 'رحل چوبی سنتی و دیوان طلاکوب',
      icon: BookOpen,
    },
    {
      id: 'parchment_wall_scroll',
      title: 'طومار ابریشمی',
      subtitle: 'طومار آویزان با دسته‌های چوب عناب',
      icon: ScrollText,
    },
  ];

  const handleDownloadMockup = async () => {
    SoundEngine.playChime();
    setIsExporting(true);
    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 1200;
      exportCanvas.height = 800;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) {
        setIsExporting(false);
        return;
      }

      // 1. Draw Scene Background & Lighting
      if (selectedScene === 'classic_museum_frame') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, exportCanvas.height);
        bgGrad.addColorStop(0, '#1c1917');
        bgGrad.addColorStop(0.5, '#141210');
        bgGrad.addColorStop(1, '#0c0a09');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Gallery Spotlight
        const spot = ctx.createRadialGradient(600, 320, 10, 600, 320, 500);
        spot.addColorStop(0, 'rgba(251, 191, 36, 0.22)');
        spot.addColorStop(1, 'transparent');
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Gold Museum Frame
        const frameW = 680;
        const frameH = 500;
        const frameX = (exportCanvas.width - frameW) / 2;
        const frameY = (exportCanvas.height - frameH) / 2;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;

        const goldGrad = ctx.createLinearGradient(frameX, frameY, frameX + frameW, frameY + frameH);
        goldGrad.addColorStop(0, '#78350f');
        goldGrad.addColorStop(0.5, '#d97706');
        goldGrad.addColorStop(1, '#fbbf24');
        ctx.fillStyle = goldGrad;
        ctx.fillRect(frameX, frameY, frameW, frameH);

        ctx.shadowColor = 'transparent';

        // Ivory Matting
        ctx.fillStyle = '#faf7ee';
        ctx.fillRect(frameX + 30, frameY + 30, frameW - 60, frameH - 60);

        // Inner Artwork
        const artW = frameW - 100;
        const artH = frameH - 100;
        const artX = frameX + 50;
        const artY = frameY + 50;
        ctx.fillStyle = backgroundColor || '#fbf7ee';
        ctx.fillRect(artX, artY, artW, artH);

        // Draw Artwork Text & Elements
        elements.forEach(el => {
          if (el.isVisible === false || !el.text) return;
          ctx.save();
          ctx.translate(artX + (el.x / canvasWidth) * artW, artY + (el.y / canvasHeight) * artH);
          ctx.rotate((el.rotation || 0) * Math.PI / 180);
          ctx.fillStyle = el.color || '#18181b';
          ctx.font = `${(el.fontSize || 48) * (artW / canvasWidth)}px IranNastaliq, Gulzar, serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(el.text, 0, 0);
          ctx.restore();
        });
      } else if (selectedScene === 'modern_luxury_living') {
        const bgGrad = ctx.createLinearGradient(0, 0, exportCanvas.width, exportCanvas.height);
        bgGrad.addColorStop(0, '#020617');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        const frameW = 680;
        const frameH = 500;
        const frameX = (exportCanvas.width - frameW) / 2;
        const frameY = (exportCanvas.height - frameH) / 2;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 45;
        ctx.shadowOffsetY = 25;

        ctx.fillStyle = '#09090b';
        ctx.fillRect(frameX, frameY, frameW, frameH);

        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(frameX + 16, frameY + 16, frameW - 32, frameH - 32);

        const artW = frameW - 120;
        const artH = frameH - 120;
        const artX = frameX + 60;
        const artY = frameY + 60;
        ctx.fillStyle = backgroundColor || '#fbf7ee';
        ctx.fillRect(artX, artY, artW, artH);

        elements.forEach(el => {
          if (el.isVisible === false || !el.text) return;
          ctx.save();
          ctx.translate(artX + (el.x / canvasWidth) * artW, artY + (el.y / canvasHeight) * artH);
          ctx.rotate((el.rotation || 0) * Math.PI / 180);
          ctx.fillStyle = el.color || '#18181b';
          ctx.font = `${(el.fontSize || 48) * (artW / canvasWidth)}px IranNastaliq, Gulzar, serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(el.text, 0, 0);
          ctx.restore();
        });
      } else {
        // General Luxury & Architectural Scene
        const bgGrad = ctx.createLinearGradient(0, 0, 0, exportCanvas.height);
        bgGrad.addColorStop(0, '#1e1b4b');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        const frameW = 680;
        const frameH = 500;
        const frameX = (exportCanvas.width - frameW) / 2;
        const frameY = (exportCanvas.height - frameH) / 2;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;

        ctx.fillStyle = '#881337';
        ctx.fillRect(frameX, frameY, frameW, frameH);

        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(frameX + 20, frameY + 20, frameW - 40, frameH - 40);

        const artW = frameW - 80;
        const artH = frameH - 80;
        const artX = frameX + 40;
        const artY = frameY + 40;
        ctx.fillStyle = backgroundColor || '#faf5e8';
        ctx.fillRect(artX, artY, artW, artH);

        elements.forEach(el => {
          if (el.isVisible === false || !el.text) return;
          ctx.save();
          ctx.translate(artX + (el.x / canvasWidth) * artW, artY + (el.y / canvasHeight) * artH);
          ctx.rotate((el.rotation || 0) * Math.PI / 180);
          ctx.fillStyle = el.color || '#18181b';
          ctx.font = `${(el.fontSize || 48) * (artW / canvasWidth)}px IranNastaliq, Gulzar, serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(el.text, 0, 0);
          ctx.restore();
        });
      }

      // Download
      exportCanvas.toBlob((blob) => {
        if (!blob) {
          setIsExporting(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kelk_mockup_${selectedScene}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsExporting(false);
      }, 'image/png');
    } catch (err) {
      console.error('Failed to export mockup:', err);
      setIsExporting(false);
    }
  };

  // Render Inner Artwork Canvas
  const renderArtwork = (scale: number = 0.52) => {
    return (
      <div
        id="kelk-mockup-artwork-container"
        className="relative overflow-hidden shadow-2xl transition-all select-none"
        style={{
          width: `${canvasWidth * scale}px`,
          height: `${canvasHeight * scale}px`,
          backgroundColor: backgroundColor,
        }}
      >
        {/* Paper texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
          style={{
            backgroundImage: paperTexture === 'parchment'
              ? `radial-gradient(#c29b38 0.75px, transparent 0.75px), radial-gradient(#854d0e 0.75px, #fdf6e2 0.75px)`
              : paperTexture === 'gold_fleck'
              ? `radial-gradient(#d97706 1.5px, transparent 1.5px)`
              : 'none',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Elements */}
        {elements.map(el => {
          if (el.isVisible === false) return null;

          if (el.type === 'stroke' && el.strokeData) {
            const strokePath = generateReedPenRibbonPath(
              el.strokeData.points.map(p => ({ ...p, x: p.x * scale, y: p.y * scale })),
              el.strokeData.nibWidth * scale,
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
                className="absolute pointer-events-none flex items-center justify-center"
                style={{
                  left: `${el.x * scale}px`,
                  top: `${el.y * scale}px`,
                  width: `${(el.width || 80) * scale}px`,
                  height: `${(el.height || 80) * scale}px`,
                  transform: `translate(-50%, -50%) rotate(${el.rotation}deg) scale(${el.scaleX}, ${el.scaleY})`,
                  color: el.color || '#d97706',
                  opacity: el.opacity,
                  zIndex: el.zIndex || 1,
                }}
              >
                {tazhibItem ? (
                  <svg viewBox={tazhibItem.viewBox} className="w-full h-full">
                    <path d={tazhibItem.path} fill="currentColor" />
                  </svg>
                ) : (
                  <div className="text-[10px] text-amber-500 font-nastaliq">{el.text}</div>
                )}
              </div>
            );
          }

          // Text element
          const appliedText = el.kashidaLevel || el.dotKashidaUnits
            ? applyKashida(el.text || '', el.kashidaLevel || 0, el.dotKashidaUnits)
            : (el.text || '');

          return (
            <div
              key={el.id}
              className="absolute pointer-events-none select-none text-center whitespace-pre leading-none"
              style={{
                left: `${el.x * scale}px`,
                top: `${el.y * scale}px`,
                transform: `translate(-50%, -50%) rotate(${el.rotation}deg) scale(${el.scaleX}, ${el.scaleY})`,
                fontSize: `${(el.fontSize || 48) * scale}px`,
                fontFamily: el.fontFamily ? el.fontFamily : SCRIPT_FONT_MAP[el.script || 'nastaliq'],
                color: el.color || '#18181b',
                opacity: el.opacity,
                zIndex: el.zIndex || 1,
                textShadow: el.shadowBlur ? `${el.shadowOffsetX || 0}px ${el.shadowOffsetY || 0}px ${el.shadowBlur * scale}px ${el.shadowColor || 'rgba(0,0,0,0.5)'}` : 'none',
              }}
            >
              {appliedText}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md select-none font-vazir animate-in fade-in">
      <div className="bg-neutral-950 border border-amber-500/30 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-neutral-100">استودیوی موکاپ‌های سه‌بعدی و نمایش دکوراسیون</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  کیفیت خروجی گالری
                </span>
              </div>
              <p className="text-xs text-neutral-400">پیش‌نمایش واقع‌گرایانه خطاطی در محیط‌های موزه، پلاک طلا، کاشی‌کاری معرق و دکوراسیون داخلی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scene Selector Strip */}
        <div className="p-2.5 bg-neutral-900/60 border-b border-neutral-800 flex gap-2 overflow-x-auto no-scrollbar">
          {SCENES.map(scene => {
            const Icon = scene.icon;
            const isSelected = selectedScene === scene.id;
            return (
              <button
                key={scene.id}
                onClick={() => {
                  setSelectedScene(scene.id as MockupSceneType);
                  SoundEngine.playReedScrape(0.8);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-amber-500/25 text-amber-300 border-amber-500 shadow-md ring-1 ring-amber-400/40'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-4 h-4 text-amber-400" />
                <span>{scene.title}</span>
              </button>
            );
          })}
        </div>

        {/* Mockup Stage Body */}
        <div 
          ref={mockupContainerRef}
          className="flex-1 min-h-[380px] max-h-[58vh] overflow-hidden flex items-center justify-center p-6 relative"
        >
          {/* Scene 1: Classic Museum Gold Frame */}
          {selectedScene === 'classic_museum_frame' && (
            <div className="relative w-full h-full flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-b from-[#1c1917] via-[#141210] to-[#0c0a09] border border-neutral-800 p-8 shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(251,191,36,0.18)_0%,transparent_65%)] pointer-events-none" />
              <div className="relative p-5 rounded-2xl bg-gradient-to-tr from-[#78350f] via-[#d97706] to-[#fbbf24] shadow-[0_30px_80px_rgba(0,0,0,0.95)] border-4 border-[#92400e]">
                <div className="p-3 bg-[#faf7ee] rounded-lg shadow-inner border border-[#d4af37]/40">
                  {renderArtwork(0.52)}
                </div>
              </div>
            </div>
          )}

          {/* Scene 2: Modern Luxury Living */}
          {selectedScene === 'modern_luxury_living' && (
            <div className="relative w-full h-full flex items-center justify-center rounded-2xl overflow-hidden bg-[#0f172a] border border-neutral-800 p-8">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#020617] via-[#0f172a] to-[#1e293b] opacity-95" />
              <div className="relative p-7 rounded-xl bg-white shadow-[0_35px_80px_rgba(0,0,0,0.9)] border-2 border-neutral-900">
                {renderArtwork(0.48)}
              </div>
            </div>
          )}

          {/* Scene 3: Gold Jewelry Box */}
          {selectedScene === 'gold_jewelry_box' && (
            <div className="relative w-full h-full flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-b from-[#1e1b4b] via-[#0f172a] to-[#020617] border border-neutral-800 p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.22)_0%,transparent_70%)] pointer-events-none" />
              <div className="relative p-6 rounded-3xl bg-gradient-to-b from-[#881337] via-[#4c0519] to-[#1c0209] shadow-[0_35px_90px_rgba(0,0,0,0.95)] border-4 border-[#ca8a04]">
                <div className="p-4 bg-gradient-to-br from-[#fef08a] via-[#eab308] to-[#ca8a04] rounded-2xl shadow-2xl border-2 border-[#854d0e]">
                  {renderArtwork(0.5)}
                </div>
              </div>
            </div>
          )}

          {/* Scene 4: Isfahan Sheikh Lotfollah Mosaic Tile */}
          {selectedScene === 'isfahan_mosaic_tile' && (
            <div className="relative w-full h-full flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-b from-[#082f49] via-[#0c4a6e] to-[#042f2e] border border-neutral-800 p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.25)_0%,transparent_65%)] pointer-events-none" />
              <div className="relative p-6 rounded-3xl bg-gradient-to-tr from-[#0284c7] via-[#0d9488] to-[#0369a1] shadow-[0_35px_80px_rgba(0,0,0,0.95)] border-4 border-[#38bdf8]">
                <div className="p-3 bg-[#f0fdf4] rounded-xl shadow-inner border border-[#0d9488]/50">
                  {renderArtwork(0.5)}
                </div>
              </div>
            </div>
          )}

          {/* Scene 5: Walnut Wood Inlay */}
          {selectedScene === 'walnut_wood_inlay' && (
            <div className="relative w-full h-full flex items-center justify-center rounded-2xl overflow-hidden bg-[#262626] border border-neutral-800 p-8">
              <div className="relative p-6 rounded-2xl bg-gradient-to-b from-[#451a03] via-[#291305] to-[#1a0a02] shadow-[0_35px_80px_rgba(0,0,0,0.95)] border-4 border-[#78350f]">
                <div className="p-3 bg-[#fed7aa]/90 rounded-xl shadow-inner border border-[#b45309]">
                  {renderArtwork(0.5)}
                </div>
              </div>
            </div>
          )}

          {/* Scene 6: Antique Manuscript Book */}
          {selectedScene === 'antique_manuscript_book' && (
            <div className="relative w-full h-full flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-b from-[#291e13] to-[#120c06] border border-neutral-800 p-8">
              <div className="relative p-5 rounded-2xl bg-gradient-to-r from-[#451a03] via-[#78350f] to-[#451a03] shadow-[0_30px_70px_rgba(0,0,0,0.95)] border-2 border-[#b45309]/50">
                <div className="p-2.5 bg-[#fefce8] rounded-xl shadow-inner border border-amber-600/30">
                  {renderArtwork(0.52)}
                </div>
              </div>
            </div>
          )}

          {/* Scene 7: Parchment Wall Scroll */}
          {selectedScene === 'parchment_wall_scroll' && (
            <div className="relative w-full h-full flex flex-col items-center justify-center rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 p-8">
              <div className="w-[380px] h-3.5 rounded-full bg-gradient-to-r from-[#451a03] via-[#78350f] to-[#451a03] shadow-lg border border-amber-900/60 z-10" />
              <div className="p-3 bg-[#fef9c3]/90 shadow-2xl border-x-4 border-[#ca8a04]/40 my-[-2px]">
                {renderArtwork(0.5)}
              </div>
              <div className="w-[380px] h-4 rounded-full bg-gradient-to-r from-[#451a03] via-[#78350f] to-[#451a03] shadow-xl border border-amber-900/60 z-10" />
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>خروجی آماده جهت ارائه به مشتریان، گالری‌ها و شبکه‌های اجتماعی</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold transition-all"
            >
              بستن
            </button>
            <button
              onClick={handleDownloadMockup}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'در حال تهیه تصویر...' : 'دریافت تصویر موکاپ باکیفیت'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

