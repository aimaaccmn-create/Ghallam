import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, 
  RotateCw, 
  Trash2, 
  Check, 
  X, 
  Undo2, 
  Sparkles, 
  Sliders, 
  Eraser,
  Palette
} from 'lucide-react';
import { FreehandStroke, FreehandStrokePoint } from '../types/calligraphy';
import { generateReedPenRibbonPath } from '../utils/calligraphyEngine';

interface ReedPenSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStrokes: (strokes: FreehandStroke[]) => void;
  canvasWidth: number;
  canvasHeight: number;
  globalNibAngle?: number;
}

export const ReedPenSimulator: React.FC<ReedPenSimulatorProps> = React.memo(({
  isOpen,
  onClose,
  onSaveStrokes,
  canvasWidth,
  canvasHeight,
  globalNibAngle = 63,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nibAngle, setNibAngle] = useState<number>(globalNibAngle);
  const [nibWidth, setNibWidth] = useState<number>(18);
  const [inkColor, setInkColor] = useState<string>('#18181b');
  const [goldInk, setGoldInk] = useState<boolean>(false);
  const [inkFlow, setInkFlow] = useState<number>(0.9);
  const [isErasing, setIsErasing] = useState<boolean>(false);

  const [strokes, setStrokes] = useState<FreehandStroke[]>([]);
  const [currentPoints, setCurrentPoints] = useState<FreehandStrokePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const INK_PALETTE = [
    { name: 'مرکب مشکی دودی', color: '#18181b' },
    { name: 'مرکب گردویی سنتی', color: '#451a03' },
    { name: 'طلاکوب زرین', color: '#d97706', gold: true },
    { name: 'شنگرف سرخ', color: '#991b1b' },
    { name: 'لاجورد نیشابوری', color: '#1e3a8a' },
    { name: 'سبز زنگاری', color: '#065f46' },
  ];

  const SCRIPT_ANGLES = [
    { label: 'نستعلیق (۶۳°)', angle: 63 },
    { label: 'شکسته (۵۵°)', angle: 55 },
    { label: 'ثلث (۷۵°)', angle: 75 },
    { label: 'رقعه (۵۰°)', angle: 50 },
    { label: 'کوفی (۹۰°)', angle: 90 },
  ];

  // Redraw all strokes on canvas
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved strokes
    strokes.forEach(stroke => {
      drawSingleStroke(ctx, stroke);
    });

    // Draw live stroke
    if (currentPoints.length > 1) {
      drawSingleStroke(ctx, {
        id: 'current',
        points: currentPoints,
        nibAngle,
        nibWidth,
        color: inkColor,
        opacity: inkFlow,
        goldEffect: goldInk,
      });
    }
  };

  const drawSingleStroke = (ctx: CanvasRenderingContext2D, stroke: FreehandStroke) => {
    const { points, nibAngle: angle, nibWidth: width, color, opacity, goldEffect } = stroke;
    if (points.length < 2) return;

    const pathD = generateReedPenRibbonPath(points, angle, width);
    const p2d = new Path2D(pathD);

    ctx.save();
    ctx.globalAlpha = opacity || 1;

    if (goldEffect) {
      const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      grad.addColorStop(0, '#fde68a');
      grad.addColorStop(0.35, '#f59e0b');
      grad.addColorStop(0.7, '#d97706');
      grad.addColorStop(1, '#b45309');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = color;
    }

    ctx.fill(p2d);
    ctx.restore();
  };

  useEffect(() => {
    if (isOpen) {
      redrawCanvas();
    }
  }, [isOpen, strokes, currentPoints, nibAngle, nibWidth, inkColor, goldInk, inkFlow]);

  // Pointer / Touch drawing handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 1;

    setIsDrawing(true);
    setCurrentPoints([{ x, y, pressure, time: Date.now() }]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 1;

    setCurrentPoints(prev => [...prev, { x, y, pressure, time: Date.now() }]);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPoints.length > 1) {
      const newStroke: FreehandStroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        points: currentPoints,
        nibAngle,
        nibWidth,
        color: inkColor,
        opacity: inkFlow,
        goldEffect: goldInk,
      };
      setStrokes(prev => [...prev, newStroke]);
    }
    setCurrentPoints([]);
  };

  const handleUndo = () => {
    setStrokes(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentPoints([]);
  };

  const handleSave = () => {
    if (strokes.length > 0) {
      onSaveStrokes(strokes);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-between p-4 dir-rtl font-vazir select-none">
      {/* Top Header Bar */}
      <div className="w-full max-w-5xl bg-neutral-900/95 border border-neutral-800 rounded-2xl p-3 px-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              کارگاه خطاطی آزاد با قلم نی زنده (Live Reed Pen)
            </h2>
            <p className="text-xs text-neutral-400">
              شبیه‌ساز فیزیک تراش قلم نی، زاویه قط قلم، دانگ متغیر و کشش مرکب سنتی
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-xs text-neutral-300 transition-all border border-neutral-700"
            title="برگشت حرکت آخر (Undo)"
          >
            <Undo2 className="w-4 h-4" />
            <span>برگشت</span>
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-xs text-red-300 transition-all border border-red-800/50"
            title="پاک‌کردن بوم"
          >
            <Trash2 className="w-4 h-4" />
            <span>پاک‌سازی</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-xs font-bold text-neutral-950 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>ثبت در صفحه کار ({strokes.length} قلم‌ضربه)</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Drawing Canvas Area */}
      <div className="flex-1 w-full max-w-5xl flex items-center justify-center my-3 overflow-hidden relative">
        <div className="relative border border-amber-900/40 rounded-2xl shadow-2xl overflow-hidden bg-[#faf6ed] cursor-crosshair">
          {/* Subtle grid lines */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage: 'radial-gradient(#b45309 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px`, touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative z-10"
          />
        </div>
      </div>

      {/* Bottom Floating Pen Tool Controls */}
      <div className="w-full max-w-5xl bg-neutral-900/95 border border-neutral-800 rounded-2xl p-3 px-5 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        {/* Nib Angle Presets & Slider */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-300">
            <RotateCw className="w-4 h-4 text-amber-400" />
            <span>زاویه قط قلم:</span>
            <span className="text-amber-400 font-mono font-bold">{nibAngle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            value={nibAngle}
            onChange={(e) => setNibAngle(Number(e.target.value))}
            className="w-24 accent-amber-500"
          />
          <div className="flex items-center gap-1">
            {SCRIPT_ANGLES.map(sa => (
              <button
                key={sa.angle}
                onClick={() => setNibAngle(sa.angle)}
                className={`px-2 py-1 rounded-lg text-[10px] transition-all border ${
                  nibAngle === sa.angle
                    ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 border-neutral-700'
                }`}
              >
                {sa.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nib Width (دانگ قلم) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-300">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>دانگ قلم:</span>
            <span className="text-amber-400 font-mono font-bold">{nibWidth}px</span>
          </div>
          <input
            type="range"
            min="4"
            max="50"
            value={nibWidth}
            onChange={(e) => setNibWidth(Number(e.target.value))}
            className="w-24 accent-amber-500"
          />
        </div>

        {/* Ink Colors & Gold Effect */}
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-400 ml-1" />
          {INK_PALETTE.map((ink, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInkColor(ink.color);
                setGoldInk(Boolean(ink.gold));
              }}
              title={ink.name}
              style={{ backgroundColor: ink.color }}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                inkColor === ink.color && (!ink.gold || goldInk)
                  ? 'border-amber-400 scale-125 shadow-md shadow-amber-500/50'
                  : 'border-neutral-600 hover:scale-110'
              }`}
            />
          ))}
          <button
            onClick={() => setGoldInk(!goldInk)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border transition-all ${
              goldInk
                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                : 'bg-neutral-800 text-amber-400 border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>طلاکوب</span>
          </button>
        </div>
      </div>
    </div>
  );
});

