import React from 'react';
import { X, LayoutTemplate } from 'lucide-react';
import { CalligraphyTemplate } from '../types/calligraphy';
import { SAMPLE_TEMPLATES } from '../data/samplePresets';
import { SCRIPT_FONT_MAP } from '../utils/calligraphyEngine';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CalligraphyTemplate) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = React.memo(({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md select-none font-vazir animate-in fade-in">
      <div className="bg-neutral-950 border border-amber-500/30 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-neutral-100">شاهکارهای آماده و قالب‌های سنتی (Templates)</h2>
              <p className="text-xs text-neutral-400">چلیپاهای میرعماد، سیاه‌مشق‌های قاجار و کتیبه‌های زرین ثلث</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => {
                onSelectTemplate(tmpl);
                onClose();
              }}
              className="group bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/60 rounded-2xl p-5 cursor-pointer flex flex-col justify-between space-y-4 transition-all hover:shadow-xl hover:shadow-amber-950/20"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-amber-400 font-mono">
                    {SCRIPT_FONT_MAP[tmpl.script].name}
                  </span>
                  <span className="text-[11px] bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded-full border border-neutral-700">
                    {tmpl.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              {/* Visual Preview Box */}
              <div 
                className="h-28 rounded-xl border border-neutral-700/60 flex items-center justify-center p-3 text-center overflow-hidden relative shadow-inner"
                style={{ backgroundColor: tmpl.project.backgroundColor || '#fbf7ee' }}
              >
                <div className="font-nastaliq text-neutral-900 text-sm opacity-90 line-clamp-2 leading-loose">
                  {tmpl.project.elements?.[0]?.text || 'نمونه متن خوشنویسی'}
                </div>
                {/* Decorative Pill */}
                <div className="absolute bottom-2 left-2 text-[10px] bg-neutral-900/70 text-amber-300 px-2 py-0.5 rounded backdrop-blur-sm">
                  {tmpl.project.elements?.length || 0} المان برداری
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs text-amber-400 font-semibold group-hover:translate-x-[-4px] transition-transform">
                <span>بارگذاری قالب در صفحه</span>
                <span>←</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

