import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileCode, 
  Image, 
  Printer, 
  Save, 
  Check, 
  Copy,
  Scissors,
  Layers,
  Sparkles,
  Cpu,
  FileText,
  Loader2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { KelkProject } from '../types/calligraphy';
import { 
  exportToSvg, 
  exportToCamCncSvg, 
  exportColorSeparationSvg,
  renderProjectToCanvas 
} from '../utils/calligraphyEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: KelkProject;
  onSaveJson: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = React.memo(({
  isOpen,
  onClose,
  project,
  onSaveJson,
}) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'cnc' | 'separation'>('standard');
  const [exporting, setExporting] = useState(false);
  const [exportStatusText, setExportStatusText] = useState<string>('');
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [resolutionScale, setResolutionScale] = useState<number>(2); // 1x, 2x, 4x
  const [transparentBg, setTransparentBg] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [separationLayer, setSeparationLayer] = useState<'black_ink' | 'gold_foil' | 'red_seal' | 'blue_tazhib'>('black_ink');

  if (!isOpen) return null;

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadTextFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    downloadBlob(blob, filename);
  };

  // 1. Download SVG Vector File
  const handleDownloadSvg = () => {
    const svgContent = exportToSvg(project);
    downloadTextFile(svgContent, `${project.name || 'kelk_calligraphy'}.svg`, 'image/svg+xml;charset=utf-8');
  };

  // 2. Download CAM / CNC Laser Cut file
  const handleDownloadCncSvg = () => {
    const svgContent = exportToCamCncSvg(project);
    downloadTextFile(svgContent, `${project.name || 'kelk_calligraphy'}_laser_cnc.svg`, 'image/svg+xml;charset=utf-8');
  };

  // 3. Download Color Separated Film
  const handleDownloadSeparationSvg = () => {
    const svgContent = exportColorSeparationSvg(project, separationLayer);
    downloadTextFile(svgContent, `${project.name || 'kelk_calligraphy'}_film_${separationLayer}.svg`, 'image/svg+xml;charset=utf-8');
  };

  // 4. Copy SVG Code to Clipboard
  const handleCopySvgCode = async () => {
    try {
      const svgContent = activeTab === 'cnc' ? exportToCamCncSvg(project) : exportToSvg(project);
      await navigator.clipboard.writeText(svgContent);
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2500);
    } catch (err) {
      console.error('Failed to copy SVG code', err);
    }
  };

  // 5. Direct Bulletproof Raster Export (PNG, JPG, WebP)
  const handleDownloadRaster = async (format: 'png' | 'jpeg' | 'webp') => {
    try {
      setExporting(true);
      setExportProgress(10);
      setExportStatusText(
        format === 'png' ? 'در حال رندر و ساخت تصویر باکیفیت PNG...' :
        format === 'jpeg' ? 'در حال رندر و پردازش تصویر JPG...' : 'در حال رندر تصویر WebP...'
      );

      // Render directly to in-memory HTML5 Canvas 2D with progress
      const isTransparent = transparentBg && format !== 'jpeg';
      const canvas = await renderProjectToCanvas(
        project, 
        resolutionScale, 
        isTransparent,
        (progress, status) => {
          setExportProgress(progress);
          setExportStatusText(status);
        }
      );

      setExportProgress(95);
      setExportStatusText('در حال فشرده‌سازی و دانلود فایل...');

      const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
      const ext = format === 'jpeg' ? 'jpg' : format;
      const quality = format === 'jpeg' ? 0.96 : 0.95;

      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `${project.name || 'kelk_calligraphy'}_${resolutionScale}x.${ext}`);
        } else {
          // Fallback via data URL
          const dataUrl = canvas.toDataURL(mimeType, quality);
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `${project.name || 'kelk_calligraphy'}_${resolutionScale}x.${ext}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        setExportProgress(100);
        setTimeout(() => {
          setExporting(false);
          setExportStatusText('');
          setExportProgress(0);
        }, 400);
      }, mimeType, quality);
    } catch (err) {
      console.error('Raster export failed:', err);
      alert('خطا در رندر تصویر. لطفاً مجدداً امتحان نمایید.');
      setExporting(false);
      setExportStatusText('');
      setExportProgress(0);
    }
  };

  // 6. Direct High-Resolution PDF Export
  const handleDownloadPdf = async () => {
    try {
      setExporting(true);
      setExportProgress(15);
      setExportStatusText('در حال آماده‌سازی سند PDF با رزولوشن چاپ...');

      const scale = Math.max(2, resolutionScale);
      const canvas = await renderProjectToCanvas(
        project, 
        scale, 
        false,
        (progress, status) => {
          setExportProgress(progress);
          setExportStatusText(status);
        }
      );
      setExportProgress(90);
      setExportStatusText('در حال ساخت صفحات PDF...');

      const dataUrl = canvas.toDataURL('image/jpeg', 0.98);

      const orientation = project.canvasWidth >= project.canvasHeight ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [project.canvasWidth, project.canvasHeight],
        hotfixes: ['px_scaling'],
      });

      pdf.addImage(dataUrl, 'JPEG', 0, 0, project.canvasWidth, project.canvasHeight);
      pdf.save(`${project.name || 'kelk_calligraphy'}.pdf`);

      setExportProgress(100);
      setTimeout(() => {
        setExporting(false);
        setExportStatusText('');
        setExportProgress(0);
      }, 400);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('خطا در ساخت فایل PDF');
      setExporting(false);
      setExportStatusText('');
      setExportProgress(0);
    }
  };

  // 7. Print Calligraphy
  const handlePrint = () => {
    const svgContent = exportToSvg(project);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
          <head>
            <title>${project.name || 'خوشنویسی کلک'}</title>
            <style>
              body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
              svg { max-width: 100%; max-height: 100%; }
              @media print {
                body { background: transparent; }
              }
            </style>
          </head>
          <body>
            ${svgContent}
            <script>
              window.onload = () => { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md select-none font-vazir animate-in fade-in">
      <div className="bg-neutral-950 border border-amber-500/40 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="p-4 px-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-neutral-100">خروجی تخصصی چاپ، تصویر، PDF و برش لیزر</h2>
              <p className="text-xs text-neutral-400">دانلود فرمت‌های PNG، JPG، PDF، SVG، فیلم تفکیک رنگ و CNC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="p-3 px-6 border-b border-neutral-800/80 bg-neutral-900/40 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('standard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border whitespace-nowrap ${
              activeTab === 'standard'
                ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-neutral-850 text-neutral-300 hover:text-neutral-100 border-neutral-750'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>تصویر و وکتور (PNG, JPG, PDF, SVG)</span>
          </button>

          <button
            onClick={() => setActiveTab('cnc')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border whitespace-nowrap ${
              activeTab === 'cnc'
                ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-neutral-850 text-neutral-300 hover:text-neutral-100 border-neutral-750'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>برش لیزر و CNC (CAM Hairline)</span>
          </button>

          <button
            onClick={() => setActiveTab('separation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border whitespace-nowrap ${
              activeTab === 'separation'
                ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-neutral-850 text-neutral-300 hover:text-neutral-100 border-neutral-750'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>تفکیک رنگ چاپ سیلک و طلاکوب</span>
          </button>
        </div>

        {/* Status bar if exporting */}
        {exporting && (
          <div className="bg-amber-950/40 border-b border-amber-500/30 px-6 py-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-amber-300">
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 text-amber-400" />
                <span className="font-semibold">{exportStatusText || 'در حال آماده‌سازی و دانلود فایل...'}</span>
              </div>
              <span className="text-amber-400 font-mono font-bold text-xs">{exportProgress}%</span>
            </div>
            {/* Progress Track */}
            <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden border border-amber-500/20">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-200 ease-out shadow-sm shadow-amber-500/50"
                style={{ width: `${Math.max(5, exportProgress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* TAB 1: Standard Vector & Raster */}
          {activeTab === 'standard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SVG Vector */}
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                      <FileCode className="w-4 h-4" />
                      <span>وکتور برداری SVG (کیفیت بی‌نهایت)</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                      خروجی استاندارد وکتور، سازگار با ایلوستریتور، فتوشاپ، کورل‌دراو، فیگما و چاپخانه‌های دیجیتال.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadSvg}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
                    >
                      <Download className="w-4 h-4" />
                      <span>دانلود وکتور SVG</span>
                    </button>
                    <button
                      onClick={handleCopySvgCode}
                      className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center justify-center gap-1.5 transition-all border border-neutral-700"
                      title="کپی مستقیم کد SVG"
                    >
                      {copiedSvg ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedSvg ? 'کپی شد' : 'کپی کد'}</span>
                    </button>
                  </div>
                </div>

                {/* PDF Document */}
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                      <FileText className="w-4 h-4" />
                      <span>سند چاپی PDF (Direct Print Ready)</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                      سند استاندارد PDF با رزولوشن بالای چاپی، مناسب برای پلات، چاپ قاب تابلو و آرشیو.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={exporting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-950/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>دانلود سند PDF</span>
                  </button>
                </div>
              </div>

              {/* Raster PNG / JPG / WebP */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-neutral-200 font-bold text-sm">
                    <Image className="w-4 h-4 text-amber-400" />
                    <span>تصویر باکیفیت و رستر (PNG / JPG / WebP)</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-neutral-400">وضوح / رزولوشن:</span>
                      {[1, 2, 4].map(s => (
                        <button
                          key={s}
                          onClick={() => setResolutionScale(s)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                            resolutionScale === s
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          {s}x {s === 4 && '(4K Ultra)'}
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 select-none">
                      <input
                        type="checkbox"
                        checked={transparentBg}
                        onChange={(e) => setTransparentBg(e.target.checked)}
                        className="accent-amber-500 rounded"
                      />
                      <span>زمینه شفاف (PNG)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => handleDownloadRaster('png')}
                    disabled={exporting}
                    className="py-3 rounded-xl bg-neutral-850 hover:bg-neutral-750 text-neutral-100 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-neutral-750 hover:border-amber-500/50"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>دانلود PNG {transparentBg ? '(شفاف)' : ''}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadRaster('jpeg')}
                    disabled={exporting}
                    className="py-3 rounded-xl bg-neutral-850 hover:bg-neutral-750 text-neutral-100 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-neutral-750 hover:border-amber-500/50"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>دانلود JPG (تصویر اثر)</span>
                  </button>

                  <button
                    onClick={() => handleDownloadRaster('webp')}
                    disabled={exporting}
                    className="py-3 rounded-xl bg-neutral-850 hover:bg-neutral-750 text-neutral-100 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-neutral-750 hover:border-amber-500/50"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>دانلود WebP (کم‌حجم وب)</span>
                  </button>
                </div>
              </div>

              {/* Print & Project Save */}
              <div className="flex flex-wrap items-center justify-between p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 transition-all border border-neutral-700"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>چاپ مستقیم اثر (Print)</span>
                  </button>
                  <button
                    onClick={onSaveJson}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 transition-all border border-neutral-700"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>ذخیره سند پروژه (.kelk)</span>
                  </button>
                </div>

                <span className="text-[11px] text-neutral-500">
                  ابعاد بوم: {project.canvasWidth} × {project.canvasHeight} پیکسل
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Laser & CNC CAM */}
          {activeTab === 'cnc' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Scissors className="w-4 h-4" />
                  <span>فایل بهینه‌شده خط برش دستگاه لیزر و کاترپلاتر (CAM Outline)</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  مسیرهای برداری با ضخامت خط مویی (Hairline 0.1mm) با رنگ استاندارد قرمز (#FF0000) بدون پرکردگی و بدون همپوشانی مسیرها، آماده جهت ارسال مستقیم به نرم‌افزارهای RDWorks، LaserCAD، LightBurn، ArtCAM و Corel.
                </p>

                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs text-neutral-300 space-y-1">
                  <div>✓ تنظیم خط برش پیوسته (Single Cut Path)</div>
                  <div>✓ کالیبراسیون مختصات میلی‌متری بوم</div>
                  <div>✓ سازگاری کامل با برش چوب، طلق پلکسی، برنج و شبرنگ</div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleDownloadCncSvg}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>دانلود فایل وکتور برش لیزر (Laser SVG)</span>
                  </button>
                  <button
                    onClick={handleCopySvgCode}
                    className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center justify-center gap-1.5 transition-all border border-neutral-700"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copiedSvg ? 'کپی شد' : 'کپی کد مسیرها'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Silk Screen & Hot Foil Separation */}
          {activeTab === 'separation' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                    <Layers className="w-4 h-4" />
                    <span>تفکیک رنگ تخصصی و فیلم لیتوگرافی (Color Separation Films)</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    تولید فیلم‌های تفکیک‌شده ۱۰۰٪ مشکی همراه با نشانه‌های تراز و انطباق چاپ (Registration Crosshairs) جهت ساخت شابلون سیلک‌اسکرین و کلیشه‌های داغی طلاکوب.
                  </p>
                </div>

                {/* Layer Selector */}
                <div>
                  <label className="text-xs text-neutral-300 font-bold block mb-2">انتخاب لایه و فیلم تفکیکی:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'black_ink', label: 'فیلم مرکب مشکی (متن و خطوط اصلی)' },
                      { id: 'gold_foil', label: 'کلیشه داغی طلاکوب (تذهیب و طلایی)' },
                      { id: 'red_seal', label: 'شابلون شنگرف و مهر قرمز' },
                      { id: 'blue_tazhib', label: 'فیلم لاجورد نقوش تذهیب' },
                    ].map(layer => (
                      <button
                        key={layer.id}
                        onClick={() => setSeparationLayer(layer.id as any)}
                        className={`p-3 rounded-xl border text-right transition-all text-xs ${
                          separationLayer === layer.id
                            ? 'bg-amber-500/20 border-amber-500/80 text-amber-200 font-bold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {layer.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleDownloadSeparationSvg}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all mt-2"
                >
                  <Download className="w-4 h-4" />
                  <span>دانلود فیلم تفکیک‌شده {separationLayer} (SVG با رجیستر)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});


