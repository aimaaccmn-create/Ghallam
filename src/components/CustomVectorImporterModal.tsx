import React, { useRef, useState } from 'react';
import { Upload, FileCode, Check, Copy, Sparkles, X, Layers } from 'lucide-react';
import { CanvasElement } from '../types/calligraphy';

interface CustomVectorImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVectorElement: (element: Partial<CanvasElement>) => void;
}

export const CustomVectorImporterModal: React.FC<CustomVectorImporterModalProps> = ({
  isOpen,
  onClose,
  onAddVectorElement,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [svgText, setSvgText] = useState('');
  const [vectorName, setVectorName] = useState('نقش برداری سفارشی');
  const [vectorColor, setVectorColor] = useState('#d4af37');
  const [previewSvg, setPreviewSvg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/svg+xml' || file.name.endsWith('.svg'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setSvgText(content);
        setPreviewSvg(content);
        setVectorName(file.name.replace('.svg', ''));
      };
      reader.readAsText(file);
    }
  };

  const handlePasteSvg = (text: string) => {
    setSvgText(text);
    if (text.includes('<svg')) {
      setPreviewSvg(text);
    } else {
      setPreviewSvg(null);
    }
  };

  const handleImport = () => {
    if (!svgText.trim()) return;

    onAddVectorElement({
      type: 'tazhib',
      name: vectorName || 'نقش برداری',
      tazhibSvg: svgText,
      tazhibName: vectorName,
      color: vectorColor,
      fontSize: 120,
      width: 150,
      height: 150,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 1,
      zIndex: 50,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-neutral-200 font-vazir">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100">واردکننده نقوش برداری اختصاصی (SVG Importer)</h3>
              <p className="text-[11px] text-neutral-400">ورود کالیگرام، شمسه، کتیبه و تذهیب‌های وکتور شخصی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* File input button */}
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-700 bg-neutral-800/70 hover:bg-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 text-neutral-200 transition"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              انتخاب فایل SVG از کامپیوتر
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Svg Code Paste Box */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-400 font-medium">یا کد XML / SVG را در اینجا الصاق (Paste) کنید:</label>
            <textarea
              value={svgText}
              onChange={(e) => handlePasteSvg(e.target.value)}
              placeholder="<svg ...> ... </svg>"
              rows={4}
              className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl p-3 text-xs text-neutral-300 font-mono focus:outline-none focus:border-amber-500/80 resize-none dir-ltr text-left"
            />
          </div>

          {/* Properties */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-neutral-400">نام المان</label>
              <input
                type="text"
                value={vectorName}
                onChange={(e) => setVectorName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-neutral-400">رنگ اولیه بردار</label>
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-700 rounded-xl px-2 py-1">
                <input
                  type="color"
                  value={vectorColor}
                  onChange={(e) => setVectorColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-neutral-300">{vectorColor}</span>
              </div>
            </div>
          </div>

          {/* SVG Preview Box */}
          {previewSvg && (
            <div className="border border-neutral-700 rounded-xl p-4 bg-neutral-950/50 flex flex-col items-center justify-center gap-2">
              <span className="text-[10px] text-neutral-400">پیش‌نمایش زنده نقش</span>
              <div
                className="w-24 h-24 flex items-center justify-center text-amber-400"
                dangerouslySetInnerHTML={{ __html: previewSvg }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-medium"
          >
            انصراف
          </button>
          <button
            onClick={handleImport}
            disabled={!svgText.trim()}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            افزودن وکتور به بوم
          </button>
        </div>
      </div>
    </div>
  );
};
