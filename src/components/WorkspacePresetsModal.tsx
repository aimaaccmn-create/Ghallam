import React, { useState } from 'react';
import { 
  Type, 
  BookOpen, 
  Sparkles, 
  Feather, 
  Palette, 
  Layers, 
  Grid, 
  RotateCw, 
  Check, 
  X,
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { CanvasLayoutMode, CalligraphyScript } from '../types/calligraphy';

export type WorkspaceMode = 'free' | 'chalipa' | 'katibeh' | 'reed_pen' | 'siah_mashq';

interface WorkspacePresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: WorkspaceMode;
  onSelectPreset: (mode: WorkspaceMode) => void;
}

interface PresetOption {
  id: WorkspaceMode;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  suggestedScript: CalligraphyScript;
  layoutMode: CanvasLayoutMode;
  highlights: string[];
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'chalipa',
    title: 'میزکار چلیپانویسی و قطعه‌بندی کهن',
    subtitle: 'مخصوص شعر، غزل و دو بیتی با زاویه کرسی استاندارد',
    description: 'فعال‌سازی خودکار خطوط راهنمای مورب (شیب -۱۲ درجه)، تراز هوشمند مصراع‌ها و حاشیه‌بندی سنتی.',
    icon: <BookOpen className="w-6 h-6 text-amber-400" />,
    badge: 'سنتی و ادبی',
    suggestedScript: 'nastaliq',
    layoutMode: 'chlipa',
    highlights: ['کرسی مورب ۱۲-', 'تراز متقارن ۴ سطر', 'قاب سنتی زرافشان'],
  },
  {
    id: 'katibeh',
    title: 'میزکار کتیبه، تذهیب و پوستر فاخر',
    subtitle: 'طراحی آثار با خطوط جلی، ثلث، نسخ و نقوش زرین',
    description: 'ترکیب‌بندی فشرده با فعال‌سازی بافت‌های زرکوب، شمسه‌ها، ترنج‌ها و تذهیب‌های پیرامونی.',
    icon: <Sparkles className="w-6 h-6 text-amber-400" />,
    badge: 'طراحی و کتیبه',
    suggestedScript: 'thuluth',
    layoutMode: 'free',
    highlights: ['بافت متالیک طلا', 'خطوط راهنمای کتیبه', 'افزودن خودکار اعراب و تزئینات'],
  },
  {
    id: 'siah_mashq',
    title: 'میزکار سیاه‌مشق و کالیگرافی مدرن',
    subtitle: 'تمرین، هم‌پوشانی واژه‌ها و بافت‌های ریتمیک',
    description: 'چیدمان آزاد و زاویه‌دار کلمات، لایه‌بندی شفافیت و حروف چندتکرار به شیوه میرزا غلامرضا.',
    icon: <Layers className="w-6 h-6 text-amber-400" />,
    badge: 'هنری و اکسپرسیو',
    suggestedScript: 'shekasteh',
    layoutMode: 'siah_mashq',
    highlights: ['تکرار واژه‌ها', 'شیب ۲۵ درجه', 'تغییر آزاد Opacity'],
  },
  {
    id: 'reed_pen',
    title: 'کارگاه قلم‌نی و بداهه‌نویسی آزاد',
    subtitle: 'شبیه‌ساز قط قلم، زاویه ۶۳ درجه و مرکب‌برداری زنده',
    description: 'بوم خلوت با حداکثر فضای پویا و امکان خطاطی با موس یا قلم نوری با شبیه‌ساز فیزیک دانگ و مرکب.',
    icon: <Feather className="w-6 h-6 text-amber-400" />,
    badge: 'آزاد و تعاملی',
    suggestedScript: 'nastaliq',
    layoutMode: 'free',
    highlights: ['قلم‌نی تعاملی', 'بوم بدون حاشیه مزاحم', 'شبیه‌ساز دانگ نقطه'],
  },
];

export const WorkspacePresetsModal: React.FC<WorkspacePresetsModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectPreset,
}) => {
  const [selected, setSelected] = useState<WorkspaceMode>(currentMode);

  if (!isOpen) return null;

  const handleApply = (mode: WorkspaceMode) => {
    setSelected(mode);
    onSelectPreset(mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-neutral-200 font-vazir">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-100">چیدمان‌های هوشمند میزکار (Workspace Presets)</h3>
              <p className="text-xs text-neutral-400">تنظیم خودکار ابزارها، خطوط کرسی و محیط کار متناسب با سبک خوشنویسی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {PRESET_OPTIONS.map((preset) => {
            const isCurrent = selected === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleApply(preset.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 relative group ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                    : 'border-neutral-800 hover:border-amber-500/50 bg-neutral-950/40 hover:bg-neutral-950/70'
                }`}
              >
                {/* Top Row */}
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 group-hover:border-amber-500/40 transition">
                    {preset.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-amber-300 border border-neutral-700">
                    {preset.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-neutral-100 group-hover:text-amber-300 transition">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-800/80">
                  {preset.highlights.map((h, i) => (
                    <span key={i} className="text-[10px] bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded-md border border-neutral-800">
                      • {h}
                    </span>
                  ))}
                </div>

                {/* Selection Indicator */}
                {isCurrent && (
                  <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-xs text-neutral-400">
          <span>می‌توانید در هر لحظه چینش بوم را تغییر دهید.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold transition"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
