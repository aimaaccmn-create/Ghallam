import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Eye, EyeOff, Lock, Unlock, Upload, Trash2, X, Move } from 'lucide-react';

export interface GhostReferenceSettings {
  url: string | null;
  opacity: number; // 0 to 1
  scale: number; // 0.2 to 3.0
  x: number;
  y: number;
  rotation: number;
  isLocked: boolean;
  isVisible: boolean;
}

interface GhostReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GhostReferenceSettings;
  onChangeSettings: (settings: GhostReferenceSettings) => void;
}

export const GhostReferenceModal: React.FC<GhostReferenceModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onChangeSettings({
          ...settings,
          url: dataUrl,
          isVisible: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    onChangeSettings({
      ...settings,
      url: null,
      isVisible: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-neutral-200 font-vazir">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100">لایه مقایسه و مشق کهن (Ghost Reference)</h3>
              <p className="text-[11px] text-neutral-400">بارگذاری تصویر الگو برای تطبیق دانگ و ترکیب‌بندی خط</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Upload Area */}
          {!settings.url ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    onChangeSettings({
                      ...settings,
                      url: event.target?.result as string,
                      isVisible: true,
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                dragOver
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-neutral-700 hover:border-amber-500/50 hover:bg-neutral-800/40 bg-neutral-950/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-amber-400">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-neutral-200">انتخاب یا رها کردن تصویر سطر مرجع</p>
                <p className="text-[10px] text-neutral-400">خطوط میرعماد، میرزا غلامرضا، کلهر، امیرخانی و...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview with Controls */}
              <div className="relative rounded-xl overflow-hidden border border-neutral-700 bg-neutral-950 h-32 flex items-center justify-center">
                <img
                  src={settings.url}
                  alt="Reference"
                  className="max-h-full max-w-full object-contain"
                  style={{ opacity: settings.isVisible ? settings.opacity : 0.2 }}
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-neutral-900/80 backdrop-blur px-2 py-1 rounded-lg border border-neutral-700 text-xs">
                  <button
                    onClick={() => onChangeSettings({ ...settings, isVisible: !settings.isVisible })}
                    className={`p-1 rounded ${settings.isVisible ? 'text-amber-400' : 'text-neutral-500'}`}
                    title="نمایش/مخفی"
                  >
                    {settings.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onChangeSettings({ ...settings, isLocked: !settings.isLocked })}
                    className={`p-1 rounded ${settings.isLocked ? 'text-amber-400' : 'text-neutral-400'}`}
                    title="قفل/بازکردن موقعیت"
                  >
                    {settings.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleClear}
                    className="p-1 rounded text-red-400 hover:text-red-300"
                    title="حذف تصویر"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3 bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-800">
                {/* Opacity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">میزان شفافیت لایه (Opacity)</span>
                    <span className="font-mono text-amber-400 font-bold">{Math.round(settings.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.9"
                    step="0.05"
                    value={settings.opacity}
                    onChange={(e) => onChangeSettings({ ...settings, opacity: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                </div>

                {/* Scale */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">بزرگ‌نمایی تصویر (Scale)</span>
                    <span className="font-mono text-amber-400 font-bold">{Math.round(settings.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="2.5"
                    step="0.05"
                    value={settings.scale}
                    onChange={(e) => onChangeSettings({ ...settings, scale: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition"
          >
            تأیید و بازگشت به بوم
          </button>
        </div>
      </div>
    </div>
  );
};
