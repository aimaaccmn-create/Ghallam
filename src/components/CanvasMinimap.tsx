import React from 'react';
import { CanvasElement } from '../types/calligraphy';

interface CanvasMinimapProps {
  canvasWidth: number;
  canvasHeight: number;
  elements: CanvasElement[];
  zoom: number;
  viewportRef: React.RefObject<HTMLDivElement>;
  backgroundColor?: string;
  isVisible?: boolean;
}

export const CanvasMinimap: React.FC<CanvasMinimapProps> = React.memo(({
  canvasWidth,
  canvasHeight,
  elements,
  zoom,
  viewportRef,
  backgroundColor = '#faf5e8',
  isVisible = true,
}) => {
  if (!isVisible) return null;

  const mapWidth = 140;
  const scaleRatio = mapWidth / Math.max(canvasWidth, 1);
  const mapHeight = Math.max(50, Math.round(canvasHeight * scaleRatio));

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetCanvasX = clickX / scaleRatio;
    const targetCanvasY = clickY / scaleRatio;

    const viewport = viewportRef.current;
    const scrollTargetX = (targetCanvasX * zoom) - (viewport.clientWidth / 2);
    const scrollTargetY = (targetCanvasY * zoom) - (viewport.clientHeight / 2);

    viewport.scrollTo({
      left: Math.max(0, scrollTargetX),
      top: Math.max(0, scrollTargetY),
      behavior: 'smooth',
    });
  };

  return (
    <div
      onClick={handleMinimapClick}
      title="ناوبری سریع بوم (Minimap)"
      className="absolute bottom-6 left-6 z-40 bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 rounded-xl p-1.5 shadow-2xl cursor-pointer hover:border-amber-500/80 transition-all select-none group hidden sm:block"
      style={{ width: `${mapWidth + 12}px` }}
    >
      <div className="flex items-center justify-between px-1 pb-1 text-[10px] text-neutral-400 font-medium font-vazir">
        <span>رادار بوم</span>
        <span className="text-[9px] text-amber-400/80">{elements.length} جزء</span>
      </div>

      <div
        className="relative overflow-hidden rounded-lg border border-neutral-700/50"
        style={{
          width: `${mapWidth}px`,
          height: `${mapHeight}px`,
          backgroundColor: backgroundColor || '#faf5e8',
        }}
      >
        {/* Render simplified dots/boxes for elements */}
        {elements
          .filter(el => el.isVisible !== false)
          .map(el => {
            const posX = Math.max(0, Math.min(mapWidth - 4, el.x * scaleRatio));
            const posY = Math.max(0, Math.min(mapHeight - 4, el.y * scaleRatio));
            const size = Math.max(2, Math.min(12, (el.fontSize || 30) * scaleRatio * 0.4));

            return (
              <div
                key={`mini_${el.id}`}
                className="absolute rounded-sm bg-neutral-900/80 border border-neutral-950/40"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  width: `${size * (el.text ? Math.max(1, el.text.length * 0.4) : 1)}px`,
                  height: `${size}px`,
                  backgroundColor: el.color || '#1e1b18',
                }}
              />
            );
          })}

        {/* Viewport radar box */}
        <div
          className="absolute border border-amber-400 bg-amber-400/15 rounded pointer-events-none transition-all"
          style={{
            left: '10%',
            top: '10%',
            width: '80%',
            height: '80%',
          }}
        />
      </div>
    </div>
  );
});
