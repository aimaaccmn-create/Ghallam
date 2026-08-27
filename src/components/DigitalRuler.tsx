import React, { useState, useRef, useEffect } from 'react';
import { 
  Ruler, 
  X, 
  RotateCw, 
  Maximize2, 
  Move, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff 
} from 'lucide-react';

export type MeasurementUnit = 'mm' | 'px' | 'pt';

interface DigitalRulerProps {
  isVisible: boolean;
  onClose: () => void;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
}

export const DigitalRuler: React.FC<DigitalRulerProps> = React.memo(({
  isVisible,
  onClose,
  canvasWidth,
  canvasHeight,
  zoom,
}) => {
  // Calibration: standard screen PPI assumption (96 DPI -> 1mm ≈ 3.7795px)
  const MM_TO_PX = 3.779527559;

  // Ruler state
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 60, y: 60 });
  const [length, setLength] = useState<number>(360); // Length in pixels
  const [angle, setAngle] = useState<number>(0); // Rotation angle in degrees
  const [unit, setUnit] = useState<MeasurementUnit>('mm');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [showPerpendicularGuide, setShowPerpendicularGuide] = useState<boolean>(true);

  // Dragging & Interaction refs
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const rulerElementRef = useRef<HTMLDivElement>(null);

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0,
    mouseY: 0,
    posX: 0,
    posY: 0,
  });

  const rotateStartRef = useRef<{ initialAngle: number; startMouseAngle: number }>({
    initialAngle: 0,
    startMouseAngle: 0,
  });

  const rotateCenterRef = useRef<{ centerX: number; centerY: number }>({
    centerX: 0,
    centerY: 0,
  });

  // Calculate current measured values
  const measuredPixels = length;
  const measuredMm = Math.round((length / MM_TO_PX) * 10) / 10;

  // Dragging logic
  const handleMouseDownDrag = (e: React.MouseEvent) => {
    if (isLocked) return;
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  // Resize end handle
  const handleMouseDownResize = (e: React.MouseEvent) => {
    if (isLocked) return;
    e.stopPropagation();
    setIsResizing(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: length,
      posY: 0,
    };
  };

  // Rotate handle
  const handleMouseDownRotate = (e: React.MouseEvent) => {
    if (isLocked) return;
    e.stopPropagation();
    setIsRotating(true);
    const rect = rulerElementRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width / 2 : e.clientX;
    const centerY = rect ? rect.top + rect.height / 2 : e.clientY;
    rotateCenterRef.current = { centerX, centerY };

    const rad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    rotateStartRef.current = {
      initialAngle: angle,
      startMouseAngle: (rad * 180) / Math.PI,
    };
  };

  // Global Mouse Move & Up Listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = (e.clientX - dragStartRef.current.mouseX) / zoom;
        const dy = (e.clientY - dragStartRef.current.mouseY) / zoom;
        setPosition({
          x: Math.round(dragStartRef.current.posX + dx),
          y: Math.round(dragStartRef.current.posY + dy),
        });
      } else if (isResizing) {
        // Calculate projected distance along the ruler angle
        const dx = (e.clientX - dragStartRef.current.mouseX) / zoom;
        const dy = (e.clientY - dragStartRef.current.mouseY) / zoom;
        const angleRad = (angle * Math.PI) / 180;
        const deltaProj = dx * Math.cos(angleRad) + dy * Math.sin(angleRad);
        const newLen = Math.max(80, Math.min(1200, Math.round(dragStartRef.current.posX + deltaProj)));
        setLength(newLen);
      } else if (isRotating) {
        const currentMouseAngle = (Math.atan2(
          e.clientY - rotateCenterRef.current.centerY,
          e.clientX - rotateCenterRef.current.centerX
        ) * 180) / Math.PI;
        let newAngle = Math.round(rotateStartRef.current.initialAngle + (currentMouseAngle - rotateStartRef.current.startMouseAngle));
        
        // Snapping: snap to 0°, 45°, 90°, -12° (Chlipa angle), 180° when close
        if (Math.abs(newAngle % 45) < 3) {
          newAngle = Math.round(newAngle / 45) * 45;
        } else if (Math.abs(newAngle - -12) < 2 || Math.abs(newAngle - 12) < 2) {
          newAngle = newAngle < 0 ? -12 : 12;
        }
        setAngle(newAngle);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
    };

    if (isDragging || isResizing || isRotating) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, isRotating, angle, length, position, zoom]);

  if (!isVisible) return null;

  // Generate tick marks based on active unit
  const renderTicks = () => {
    const ticks = [];
    if (unit === 'mm') {
      const stepPx = MM_TO_PX; // ~3.78px per mm
      const totalMm = Math.floor(length / stepPx);
      for (let i = 0; i <= totalMm; i++) {
        const x = i * stepPx;
        const isCm = i % 10 === 0;
        const isHalfCm = i % 5 === 0 && !isCm;
        const tickHeight = isCm ? 18 : (isHalfCm ? 12 : 7);

        ticks.push(
          <g key={`mm_${i}`} transform={`translate(${x}, 0)`}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={tickHeight}
              stroke={isCm ? '#fbbf24' : (isHalfCm ? '#fef08a' : '#a3a3a3')}
              strokeWidth={isCm ? 1.5 : 1}
              opacity={isCm ? 1 : 0.75}
            />
            {isCm && (
              <text
                x="0"
                y="28"
                fontSize="9"
                fontFamily="monospace"
                fill="#fde68a"
                textAnchor="middle"
                className="select-none font-bold"
              >
                {i / 10}
              </text>
            )}
          </g>
        );
      }
    } else {
      // Pixel / Point ticks (every 10px / 50px / 100px)
      const totalPx = Math.floor(length);
      for (let i = 0; i <= totalPx; i += 10) {
        const is100 = i % 100 === 0;
        const is50 = i % 50 === 0 && !is100;
        const tickHeight = is100 ? 18 : (is50 ? 12 : 7);

        ticks.push(
          <g key={`px_${i}`} transform={`translate(${i}, 0)`}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={tickHeight}
              stroke={is100 ? '#fbbf24' : (is50 ? '#fef08a' : '#a3a3a3')}
              strokeWidth={is100 ? 1.5 : 1}
              opacity={is100 ? 1 : 0.75}
            />
            {is100 && (
              <text
                x="0"
                y="28"
                fontSize="9"
                fontFamily="monospace"
                fill="#fde68a"
                textAnchor="middle"
                className="select-none font-bold"
              >
                {i}
              </text>
            )}
          </g>
        );
      }
    }
    return ticks;
  };

  return (
    <>
      {/* Floating Control HUD / Info Pill */}
      <div 
        className="fixed top-20 right-6 md:right-80 bg-neutral-950/95 border border-amber-500/50 rounded-2xl shadow-2xl p-3 z-50 text-neutral-100 font-vazir text-xs backdrop-blur-xl select-none min-w-[280px] animate-in fade-in slide-in-from-top-2"
        style={{ direction: 'rtl' }}
      >
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-neutral-100 block">خط‌کش هوشمند خوشنویسی</span>
              <span className="text-[10px] text-neutral-400">اندازه‌گیری میلی‌متری و زاویه‌سنج کرسی</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 transition-all"
            title="بستن خط‌کش"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Readout Values */}
        <div className="grid grid-cols-3 gap-2 my-2.5">
          <div className="bg-neutral-900/90 p-2 rounded-xl border border-neutral-800 text-center">
            <span className="text-[10px] text-neutral-400 block mb-0.5">طول (mm)</span>
            <span className="text-amber-300 font-mono font-bold text-sm">{measuredMm}</span>
            <span className="text-[9px] text-neutral-500 mr-1">mm</span>
          </div>
          <div className="bg-neutral-900/90 p-2 rounded-xl border border-neutral-800 text-center">
            <span className="text-[10px] text-neutral-400 block mb-0.5">پیکسل</span>
            <span className="text-neutral-200 font-mono font-bold text-sm">{measuredPixels}</span>
            <span className="text-[9px] text-neutral-500 mr-1">px</span>
          </div>
          <div className="bg-neutral-900/90 p-2 rounded-xl border border-neutral-800 text-center">
            <span className="text-[10px] text-neutral-400 block mb-0.5">زاویه شیب</span>
            <span className="text-amber-400 font-mono font-bold text-sm">{angle}°</span>
          </div>
        </div>

        {/* Unit Toggle & Quick Presets */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            {(['mm', 'px'] as MeasurementUnit[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                  unit === u
                    ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {u.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Preset Angles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAngle(0)}
              className={`px-2 py-1 rounded-lg text-[10px] border transition-all ${
                angle === 0 ? 'bg-neutral-800 text-amber-300 border-amber-500/50' : 'bg-neutral-900 text-neutral-400 border-neutral-800'
              }`}
              title="افقی کامل"
            >
              ۰°
            </button>
            <button
              onClick={() => setAngle(90)}
              className={`px-2 py-1 rounded-lg text-[10px] border transition-all ${
                angle === 90 ? 'bg-neutral-800 text-amber-300 border-amber-500/50' : 'bg-neutral-900 text-neutral-400 border-neutral-800'
              }`}
              title="عمودی کامل"
            >
              ۹۰°
            </button>
            <button
              onClick={() => setAngle(-12)}
              className={`px-2 py-1 rounded-lg text-[10px] border transition-all ${
                angle === -12 ? 'bg-amber-600/30 text-amber-300 border-amber-500 font-bold' : 'bg-neutral-900 text-amber-400/80 border-neutral-800'
              }`}
              title="زاویه چلیپای سنتی"
            >
              ۱۲-° چلیپا
            </button>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-neutral-800/80 text-[11px]">
          <button
            onClick={() => setShowPerpendicularGuide(!showPerpendicularGuide)}
            className="flex items-center gap-1.5 text-neutral-300 hover:text-amber-300 transition-colors"
          >
            {showPerpendicularGuide ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-500" />}
            <span>خط عمود راهنما</span>
          </button>
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border transition-all ${
              isLocked ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-neutral-900 text-neutral-400 border-neutral-800'
            }`}
          >
            {isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
            <span>{isLocked ? 'قفل شده' : 'آزاد'}</span>
          </button>
        </div>
      </div>

      {/* Actual On-Canvas Interactive Ruler Body */}
      <div
        ref={rulerElementRef}
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${length}px`,
          height: '48px',
          transform: `rotate(${angle}deg)`,
          transformOrigin: '0 0',
          zIndex: 45,
          cursor: isLocked ? 'default' : (isDragging ? 'grabbing' : 'grab'),
        }}
        onMouseDown={handleMouseDownDrag}
        className="select-none group"
      >
        {/* Semi-transparent acrylic dark body */}
        <div className="w-full h-full bg-neutral-950/85 border border-amber-500/70 rounded-md shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
          {/* Subtle gold sheen gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/15 via-transparent to-black/40 pointer-events-none" />
          
          {/* SVG Tick Marks */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none">
            {renderTicks()}
          </svg>

          {/* Drag Handle Label Center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1.5 bg-neutral-950/90 px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm">
              <Move className="w-3 h-3 text-amber-400 opacity-70" />
              <span className="font-mono text-[11px] font-bold text-amber-300">
                {unit === 'mm' ? `${measuredMm} mm` : `${measuredPixels} px`}
              </span>
            </div>
          </div>
        </div>

        {/* Start Pivot Anchor Point */}
        <div 
          className="absolute -left-2.5 -top-2.5 w-5 h-5 bg-amber-500 rounded-full border-2 border-neutral-950 shadow-lg flex items-center justify-center text-neutral-950 pointer-events-none"
          title="نقطه مبنای خط‌کش"
        >
          <div className="w-1.5 h-1.5 bg-neutral-950 rounded-full" />
        </div>

        {/* End Length Resize Handle */}
        {!isLocked && (
          <div
            onMouseDown={handleMouseDownResize}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-neutral-900 border-2 border-amber-400 hover:bg-amber-500 hover:text-neutral-950 text-amber-400 rounded-full shadow-xl flex items-center justify-center cursor-ew-resize transition-transform hover:scale-125 z-50"
            title="تغییر طول خط‌کش"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Rotation Arm Handle */}
        {!isLocked && (
          <div
            onMouseDown={handleMouseDownRotate}
            className="absolute left-1/2 -bottom-7 -translate-x-1/2 w-6 h-6 bg-neutral-900 border border-amber-400/80 hover:bg-amber-500 hover:text-neutral-950 text-amber-400 rounded-full shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform hover:scale-125 z-50"
            title="چرخش خط‌کش"
          >
            <RotateCw className="w-3 h-3" />
          </div>
        )}

        {/* Perpendicular / Normal Projection Guide */}
        {showPerpendicularGuide && (
          <div
            style={{
              position: 'absolute',
              left: `${length / 2}px`,
              top: '48px',
              width: '1px',
              height: '300px',
              backgroundColor: 'rgba(245, 158, 11, 0.4)',
              boxShadow: '0 0 4px rgba(245, 158, 11, 0.5)',
              borderStyle: 'dashed',
              borderWidth: '0 0 0 1px',
              borderColor: 'rgba(245, 158, 11, 0.6)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </>
  );
});

