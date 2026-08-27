import React, { useState } from 'react';
import { 
  PackageCheck, 
  Download, 
  Upload, 
  FileJson, 
  Check, 
  X, 
  Archive, 
  Layers, 
  Type, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { KelkProject, CustomUserFont } from '../types/calligraphy';
import { renderProjectToCanvas } from '../utils/calligraphyEngine';

interface ProjectBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: KelkProject;
  userFonts: CustomUserFont[];
  onImportBundle: (project: KelkProject, importedFonts: CustomUserFont[]) => void;
}

export const ProjectBundleModal: React.FC<ProjectBundleModalProps> = ({
  isOpen,
  onClose,
  project,
  userFonts,
  onImportBundle,
}) => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [includeFonts, setIncludeFonts] = useState(true);
  const [includeThumbnail, setIncludeThumbnail] = useState(true);

  if (!isOpen) return null;

  // Export Bundle as JSON Package
  const handleExportBundle = async () => {
    try {
      setExporting(true);
      let thumbnailDataUrl = '';

      if (includeThumbnail) {
        try {
          const canvas = await renderProjectToCanvas(project, 1, false);
          thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        } catch (e) {
          console.warn('Thumbnail generation skipped:', e);
        }
      }

      // Filter fonts used in this project
      const usedFontFamilies = new Set(project.elements.map(el => el.fontFamily));
      const relevantFonts = includeFonts
        ? userFonts.filter(f => usedFontFamilies.has(f.fontFamily) || usedFontFamilies.has(f.name))
        : [];

      const bundle = {
        version: 'kelk_pkg_v1',
        exportedAt: new Date().toISOString(),
        project: {
          ...project,
          thumbnail: thumbnailDataUrl,
        },
        customFonts: relevantFonts,
        meta: {
          elementsCount: project.elements.length,
          author: 'استودیو خوشنویسی کلک',
        }
      };

      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name || 'kelk_project'}.kelkpkg.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExporting(false);
      onClose();
    } catch (err) {
      console.error('Bundle export failed:', err);
      setExporting(false);
    }
  };

  // Import Bundle File
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);

        if (parsed.project && Array.isArray(parsed.project.elements)) {
          const importedProject: KelkProject = {
            ...parsed.project,
            id: `project_imported_${Date.now()}`,
            updatedAt: new Date().toISOString(),
          };

          const importedFonts: CustomUserFont[] = Array.isArray(parsed.customFonts)
            ? parsed.customFonts
            : [];

          onImportBundle(importedProject, importedFonts);
          setImporting(false);
          onClose();
        } else {
          alert('فرمت فایل بسته نامعتبر است');
          setImporting(false);
        }
      } catch (err) {
        console.error('Failed to parse bundle:', err);
        alert('خطا در بازخوانی فایل بسته پروژه');
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-neutral-200 font-vazir">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Archive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100">بسته‌بندی و آرشیو یکپارچه (Zip & Project Package)</h3>
              <p className="text-[11px] text-neutral-400">استخراج و بازنشانی کامل پروژه به همراه فونت‌ها و بافت‌ها</p>
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
          {/* Options */}
          <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-800 space-y-3">
            <h4 className="text-xs font-bold text-neutral-200">محتویات بسته خروجی:</h4>
            
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={includeFonts}
                onChange={(e) => setIncludeFonts(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500"
              />
              <span>جای‌گذاری فونت‌های اختصاصی پروژه در بسته</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={includeThumbnail}
                onChange={(e) => setIncludeThumbnail(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500"
              />
              <span>تولید خودکار پیش‌نمایش بندانگشتی با کیفیت بالا</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportBundle}
              disabled={exporting}
              className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              دانلود بسته (.kelkpkg)
            </button>

            <label className="py-3 px-4 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer">
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-amber-400" />}
              بازگشایی بسته پروژه
              <input
                type="file"
                accept=".json,.kelkpkg,.kelkpkg.json"
                className="hidden"
                onChange={handleImportFile}
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-medium"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
