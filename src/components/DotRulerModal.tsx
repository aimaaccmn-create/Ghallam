import React, { useState } from 'react';
import { X, Ruler, Plus } from 'lucide-react';
import { CanvasElement } from '../types/calligraphy';

interface DotRulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertDotGuide: (element: CanvasElement) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export const DotRulerModal: React.FC<DotRulerModalProps> = React.memo(({
  isOpen,
  onClose,
  onInsertDotGuide,
  canvasWidth,
  canvasHeight,
}) => {
  const [dotCount, setDotCount] = useState<number>(3);
  const [direction, setDirection] = useState<'vertical' | 'horizontal' | 'diagonal'>('vertical');
  const [dotSize, setDotSize] = useState<number>(24);
  const [dotColor, setDotColor] = useState<string>('#b45309'); // Amber ochre guide

  if (!isOpen) return null;

  const TRADITIONAL_RULES = [
    { name: 'الف نستعلیق (۳ نقطه)', count: 3, desc: 'ارتفاع استاندارد الف در دانگ متوسط قلم.' },
    { name: 'دایره نون (۵ نقطه)', count: 5, desc: 'عرض و عمق دایره نون و لام.' },
    { name: 'دال نستعلیق (۳ نقطه)', count: 3, desc: 'طول قامت و نشیمنگاه دال.' },
    { name: 'کشیده متوسط (۷ نقطه)', count: 7, desc: 'طول کشیده متعادل سین و باء.' },
    { name: 'کشیده بلند شاهکار (۱۱ نقطه)', count: 11, desc: 'کشیده پرقدرت در چلیپا و کتیبه.' },
    { name: 'الف ثلث (۹ نقطه)', count: 9, desc: 'قامت کشیده و باصلابت خط ثلث.' },
  ];

  const handleCreateDotRuler = () => {
    const diamondChar = '◆';
    const dotsString = Array(dotCount).fill(diamondChar).join(direction === 'vertical' ? '\n' : ' ');

    const newElement: CanvasElement = {
      id: `dot_ruler_${Date.now()}`,
      type: 'dot',
      text: dotsString,
      script: 'nastaliq',
      x: canvasWidth * 0.45,
      y: canvasHeight * 0.45,
      fontSize: dotSize,
      fontFamily: 'IranNastaliq, serif',
      color: dotColor,
      rotation: direction === 'diagonal' ? -12 : 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 0.75,
      zIndex: 40,
    };

    onInsertDotGuide(newElement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md select-none font-vazir animate-in fade-in">
      <div className="bg-neutral-950 border border-amber-500/30 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-neutral-100">خط‌کش نقطه‌ای دانگ قلم (Calligraphy Dot Ruler)</h2>
              <p className="text-xs text-neutral-400">تنظیم دقیق تناسبات حروف بر اساس نقاط قلم‌تراش سنتی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Quick presets according to traditional rules */}
          <div>
            <span className="text-xs text-neutral-400 font-semibold block mb-2">قواعد سنتی دانگ قلم:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TRADITIONAL_RULES.map((rule, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDotCount(rule.count);
                    if (rule.count >= 7) setDirection('horizontal');
                  }}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    dotCount === rule.count
                      ? 'bg-amber-600/20 text-amber-300 border-amber-500 font-semibold'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{rule.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                      {rule.count} نقطه
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1 font-normal leading-relaxed">{rule.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-900/60 p-4 rounded-xl border border-neutral-850">
            <div>
              <label className="text-xs text-neutral-400 block mb-1">تعداد نقاط:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={dotCount}
                  onChange={(e) => setDotCount(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-center font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">راستای چیدمان:</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="vertical">عمودی (ارتفاع حروف)</option>
                <option value="horizontal">افقی (طول کشیده‌ها)</option>
                <option value="diagonal">مورب ۱۲ درجه (چلیپا)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">دانگ قلم (اندازه):</label>
              <input
                type="range"
                min={14}
                max={60}
                value={dotSize}
                onChange={(e) => setDotSize(Number(e.target.value))}
                className="w-full accent-amber-500 mt-2"
              />
              <span className="text-[10px] text-neutral-400 font-mono text-center block">{dotSize}px</span>
            </div>
          </div>

          {/* Insert Action */}
          <button
            onClick={handleCreateDotRuler}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>درج خط‌کش نقطه‌ای در صفحه</span>
          </button>
        </div>
      </div>
    </div>
  );
});

