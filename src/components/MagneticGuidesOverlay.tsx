import React from 'react';
import { KorsiGuidesSettings } from '../types/calligraphy';

interface MagneticGuidesOverlayProps {
  canvasWidth: number;
  canvasHeight: number;
  settings: KorsiGuidesSettings;
}

export const MagneticGuidesOverlay: React.FC<MagneticGuidesOverlayProps> = React.memo(({
  canvasWidth,
  canvasHeight,
  settings,
}) => {
  if (!settings.showGuides) return null;

  const centerY = canvasHeight / 2;
  const mabdaY = centerY - 70;
  const foroodY = centerY + 70;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      <svg width={canvasWidth} height={canvasHeight} className="w-full h-full">
        <defs>
          <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="20" y2="0" stroke="rgba(217, 119, 6, 0.08)" strokeWidth="0.5" />
            <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(217, 119, 6, 0.08)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Global Grid */}
        <rect width="100%" height="100%" fill="url(#gridPattern)" />

        {/* Center Canvas Crosshair */}
        <line
          x1={canvasWidth / 2}
          y1="0"
          x2={canvasWidth / 2}
          y2={canvasHeight}
          stroke="rgba(245, 158, 11, 0.25)"
          strokeWidth="1"
          strokeDasharray="4,4"
        />

        {/* 1. خط مبدأ (بالا / سرکش‌ها) */}
        {settings.showMabda && (
          <g>
            <line
              x1="30"
              y1={mabdaY}
              x2={canvasWidth - 30}
              y2={mabdaY}
              stroke="rgba(59, 130, 246, 0.6)"
              strokeWidth="1.2"
              strokeDasharray="6,3"
            />
            <text
              x={canvasWidth - 40}
              y={mabdaY - 6}
              fill="rgba(59, 130, 246, 0.8)"
              fontSize="10"
              fontFamily="sans-serif"
              textAnchor="end"
            >
              خط مبدأ (الف‌ها و کاف‌ها)
            </text>
          </g>
        )}

        {/* 2. خط کرسی وسط (زمینه کلمات) */}
        {settings.showVasat && (
          <g>
            <line
              x1="30"
              y1={centerY}
              x2={canvasWidth - 30}
              y2={centerY}
              stroke="rgba(234, 179, 8, 0.8)"
              strokeWidth="1.5"
            />
            <text
              x={canvasWidth - 40}
              y={centerY - 6}
              fill="rgba(234, 179, 8, 0.9)"
              fontSize="10"
              fontFamily="sans-serif"
              textAnchor="end"
            >
              خط کرسی زمینه (اصلی)
            </text>
          </g>
        )}

        {/* 3. خط فرود (پایین / دایره‌ها) */}
        {settings.showForood && (
          <g>
            <line
              x1="30"
              y1={foroodY}
              x2={canvasWidth - 30}
              y2={foroodY}
              stroke="rgba(239, 68, 68, 0.6)"
              strokeWidth="1.2"
              strokeDasharray="6,3"
            />
            <text
              x={canvasWidth - 40}
              y={foroodY - 6}
              fill="rgba(239, 68, 68, 0.8)"
              fontSize="10"
              fontFamily="sans-serif"
              textAnchor="end"
            >
              خط فرود (دایره‌های ن، ل، ی)
            </text>
          </g>
        )}

        {/* 4. خطوط مورب چلیپا (۱۲- درجه سنتی) */}
        {settings.showChlipaGuides && (
          <g transform={`translate(${canvasWidth / 2}, ${canvasHeight / 2}) rotate(${settings.chlipaAngle || -12}) translate(${-canvasWidth / 2}, ${-canvasHeight / 2})`}>
            {/* 4 diagonal verses lines */}
            {[0.28, 0.42, 0.58, 0.72].map((ratio, idx) => (
              <g key={idx}>
                <line
                  x1="60"
                  y1={canvasHeight * ratio}
                  x2={canvasWidth - 60}
                  y2={canvasHeight * ratio}
                  stroke="rgba(168, 85, 247, 0.7)"
                  strokeWidth="1.2"
                  strokeDasharray="8,4"
                />
                <text
                  x={canvasWidth - 80}
                  y={canvasHeight * ratio - 6}
                  fill="rgba(168, 85, 247, 0.85)"
                  fontSize="10"
                  fontFamily="sans-serif"
                  textAnchor="end"
                >
                  کرسی مصرع {idx + 1} چلیپا ({settings.chlipaAngle || -12}°)
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
});

