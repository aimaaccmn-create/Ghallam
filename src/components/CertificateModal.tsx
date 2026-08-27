import React, { useState, useRef } from 'react';
import { X, Award, Download, Printer, ShieldCheck, QrCode, Sparkles, Copy, Check } from 'lucide-react';
import { CanvasElement, CalligraphyScript } from '../types/calligraphy';
import { SoundEngine } from '../utils/soundEffects';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  projectName: string;
  globalScript: CalligraphyScript;
}

export const CertificateModal: React.FC<CertificateModalProps> = React.memo(({
  isOpen,
  onClose,
  elements,
  canvasWidth,
  canvasHeight,
  projectName,
  globalScript,
}) => {
  const [artistName, setArtistName] = useState<string>('استاد خوشنویس');
  const [artworkTitle, setArtworkTitle] = useState<string>(projectName || 'شاهکار خطاطی اصیل');
  const [techniqueDesc, setTechniqueDesc] = useState<string>('مرکب سنتی، دانگ کتیبه، آهار مهره و تذهیب زرین');
  const [serialNumber] = useState<string>(() => `KLK-${Math.floor(100000 + Math.random() * 900000)}-AUT`);
  const [dateShamsi, setDateShamsi] = useState<string>('۱۴۰۴ هـ.ش / ۱۴۴۷ هـ.ق');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const scriptNames: Record<string, string> = {
    nastaliq: 'خط نستعلیق اصیل قاجاری و صفوی',
    shekasteh: 'خط شکسته نستعلیق قدما',
    thuluth: 'خط ثلث جلی و کتیبه‌ای',
    kufi: 'خط کوفی بنایی و مغربی',
    muhaqqaq: 'خط محقق و ریحان',
    diwani: 'خط دیوانی و جلی دیوانی عثمانی',
    ruqaa: 'خط رقاع و اجازه',
    moalla: 'خط معلی کتیبه‌ای',
    custom_font: 'خط اختصاصی هنرمند',
  };

  const handlePrint = () => {
    SoundEngine.playChime();
    window.print();
  };

  const handleCopyText = () => {
    const text = `گواهی‌نامه اصالت و ثبت اثر خوشنویسی
شماره ثبت: ${serialNumber}
نام اثر: ${artworkTitle}
نام خطاط / استاد: ${artistName}
شیوه خط: ${scriptNames[globalScript] || 'خط فارسی'}
ابعاد قطعه: ${canvasWidth} × ${canvasHeight} پیکسل
تکنیک: ${techniqueDesc}
تاریخ صدور: ${dateShamsi}
مرکز ثبت آثار و استودیو کلک`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    SoundEngine.playSnap();
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleDownloadImage = async () => {
    SoundEngine.playChime();
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 850;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Parchment Background
      ctx.fillStyle = '#faf5e8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Texture tint
      ctx.fillStyle = 'rgba(217, 119, 6, 0.04)';
      for (let x = 0; x < canvas.width; x += 15) {
        for (let y = 0; y < canvas.height; y += 15) {
          if ((x + y) % 30 === 0) {
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }

      // 2. Ornate Double Gold Borders
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.strokeRect(44, 44, canvas.width - 88, canvas.height - 88);

      ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

      // 3. Header Text
      ctx.textAlign = 'center';
      ctx.fillStyle = '#854d0e';
      ctx.font = 'bold 16px Vazirmatn, sans-serif';
      ctx.fillText('سند ثبت رسمی اصالت اثر خوشنویسی', canvas.width / 2, 95);

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 36px "Aref Ruqaa", "Noto Nastaliq Urdu", serif';
      ctx.fillText('گواهی‌نامه اصالت و مرقع هنری', canvas.width / 2, 145);

      ctx.fillStyle = 'rgba(120, 53, 15, 0.7)';
      ctx.font = '13px serif';
      ctx.fillText('Certificate of Calligraphic Authenticity & Provenance', canvas.width / 2, 172);

      // Divider line
      ctx.strokeStyle = 'rgba(180, 83, 9, 0.3)';
      ctx.beginPath();
      ctx.moveTo(100, 195);
      ctx.lineTo(canvas.width - 100, 195);
      ctx.stroke();

      // 4. Metadata Details (Right Side in RTL)
      ctx.textAlign = 'right';
      ctx.direction = 'rtl';
      
      const startX = canvas.width - 120;
      let curY = 250;
      const rowGap = 42;

      const fields = [
        { label: 'عنوان اثر:', value: artworkTitle },
        { label: 'پدیدآورنده و خطاط:', value: artistName },
        { label: 'سبک و شیوه نگارش:', value: scriptNames[globalScript] || 'خط فارسی' },
        { label: 'ابعاد قطعه اصلی:', value: `${canvasWidth} × ${canvasHeight} پیکسل` },
        { label: 'تکنیک و بستر:', value: techniqueDesc },
        { label: 'تاریخ صدور و ثبت:', value: dateShamsi },
        { label: 'شماره ثبت یکتا:', value: serialNumber },
      ];

      fields.forEach(f => {
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 16px Vazirmatn, sans-serif';
        ctx.fillText(f.label, startX, curY);

        ctx.fillStyle = '#1c1917';
        ctx.font = '16px Vazirmatn, sans-serif';
        ctx.fillText(f.value, startX - 170, curY);

        ctx.strokeStyle = 'rgba(180, 83, 9, 0.15)';
        ctx.beginPath();
        ctx.moveTo(startX, curY + 12);
        ctx.lineTo(startX - 500, curY + 12);
        ctx.stroke();

        curY += rowGap;
      });

      // 5. Artwork Preview Box (Left Side)
      const boxX = 110;
      const boxY = 240;
      const boxW = 400;
      const boxH = 260;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = '#18181b';
      ctx.font = '32px IranNastaliq, Gulzar, serif';
      ctx.textAlign = 'center';
      const previewText = elements.find(e => e.type === 'text')?.text || artworkTitle;
      ctx.fillText(previewText.slice(0, 35), boxX + boxW / 2, boxY + boxH / 2 + 10);

      // Stamp in Certificate
      ctx.save();
      ctx.translate(boxX + boxW / 2, boxY + boxH + 80);
      ctx.rotate(-0.1);
      ctx.fillStyle = 'rgba(153, 27, 27, 0.85)';
      ctx.strokeStyle = 'rgba(153, 27, 27, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = 'bold 15px IranNastaliq, serif';
      ctx.fillText('مهر اصالت و ثبت', 0, -5);
      ctx.font = '11px Vazirmatn, sans-serif';
      ctx.fillText(serialNumber, 0, 18);
      ctx.restore();

      // 6. Footer Declaration
      ctx.fillStyle = '#44403c';
      ctx.font = '13px Vazirmatn, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('بدین‌وسیله گواهی می‌شود این اثر با رعایت اصول و هندسه خوشنویسی اصیل ایرانی خلق و در دفتر رسمی آثار ثبت شده است.', canvas.width / 2, canvas.height - 100);

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 18px IranNastaliq, serif';
      ctx.fillText(`امضا و ترقیم: ${artistName}`, canvas.width / 2, canvas.height - 65);

      // Trigger Download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate_${serialNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (err) {
      console.error('Failed to export certificate:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md select-none font-vazir animate-in fade-in">
      <div className="bg-neutral-950 border border-amber-500/30 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-neutral-100">صدور شناسنامه و گواهی‌نامه اصالت اثر (Certificate of Authenticity)</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  سند رسمی هنری
                </span>
              </div>
              <p className="text-xs text-neutral-400">تولید سند رسمی تذهیب‌دار همراه با بارکد اعتبارسنجی جهت ارائه به مشتریان و نمایشگاه‌ها</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[78vh]">
          {/* Certificate Editor Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
            <div>
              <label className="text-xs text-neutral-400 block mb-1">نام خطاط و پدیدآورنده:</label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">عنوان رسمی قطعه:</label>
              <input
                type="text"
                value={artworkTitle}
                onChange={(e) => setArtworkTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">تاریخ خلق اثر:</label>
              <input
                type="text"
                value={dateShamsi}
                onChange={(e) => setDateShamsi(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Printable Royal Certificate Document */}
          <div 
            ref={certRef}
            className="relative p-8 md:p-12 rounded-3xl bg-[#faf5e8] text-[#1c1917] border-8 border-double border-[#b45309] shadow-2xl overflow-hidden font-vazir select-text"
            style={{
              backgroundImage: 'radial-gradient(#e2d5b8 1px, transparent 1px), radial-gradient(#d6c6a2 1px, #faf5e8 1px)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px',
            }}
          >
            {/* Corner Tazhib Arabesque Insets */}
            <div className="absolute top-2 left-2 w-16 h-16 pointer-events-none opacity-80 border-t-2 border-l-2 border-[#b45309]">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#ca8a04]">
                <path d="M 0,0 L 50,0 Q 20,20 0,50 Z" fill="currentColor" />
              </svg>
            </div>
            <div className="absolute top-2 right-2 w-16 h-16 pointer-events-none opacity-80 border-t-2 border-r-2 border-[#b45309]">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#ca8a04]">
                <path d="M 100,0 L 50,0 Q 80,20 100,50 Z" fill="currentColor" />
              </svg>
            </div>
            <div className="absolute bottom-2 left-2 w-16 h-16 pointer-events-none opacity-80 border-b-2 border-l-2 border-[#b45309]">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#ca8a04]">
                <path d="M 0,100 L 50,100 Q 20,80 0,50 Z" fill="currentColor" />
              </svg>
            </div>
            <div className="absolute bottom-2 right-2 w-16 h-16 pointer-events-none opacity-80 border-b-2 border-r-2 border-[#b45309]">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#ca8a04]">
                <path d="M 100,100 L 50,100 Q 80,80 100,50 Z" fill="currentColor" />
              </svg>
            </div>

            {/* Certificate Header */}
            <div className="text-center space-y-2 border-b-2 border-[#b45309]/40 pb-6 relative">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-1 rounded-full bg-[#fef08a] border border-[#ca8a04] text-[#854d0e] text-xs font-bold shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>سند ثبت رسمی اصالت اثر خوشنویسی</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-thuluth font-bold text-[#78350f] tracking-wide pt-1">
                گواهی‌نامه اصالت و مرقع هنری
              </h1>
              <p className="text-xs text-[#78350f]/80 font-serif tracking-widest uppercase">
                Certificate of Calligraphic Authenticity & Provenance
              </p>
            </div>

            {/* Certificate Core Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 items-center">
              {/* Metadata Details */}
              <div className="space-y-3.5 text-xs text-[#292524] leading-relaxed">
                <div className="flex justify-between border-b border-[#b45309]/20 pb-1.5">
                  <span className="font-bold text-[#78350f]">عنوان اثر:</span>
                  <span className="font-semibold">{artworkTitle}</span>
                </div>
                <div className="flex justify-between border-b border-[#b45309]/20 pb-1.5">
                  <span className="font-bold text-[#78350f]">پدیدآورنده و خطاط:</span>
                  <span className="font-semibold text-sm">{artistName}</span>
                </div>
                <div className="flex justify-between border-b border-[#b45309]/20 pb-1.5">
                  <span className="font-bold text-[#78350f]">سبک و شیوه نگارش:</span>
                  <span>{scriptNames[globalScript]}</span>
                </div>
                <div className="flex justify-between border-b border-[#b45309]/20 pb-1.5">
                  <span className="font-bold text-[#78350f]">ابعاد قطعه اصلی:</span>
                  <span className="font-mono">{canvasWidth} × {canvasHeight} px</span>
                </div>
                <div className="flex justify-between border-b border-[#b45309]/20 pb-1.5">
                  <span className="font-bold text-[#78350f]">تکنیک و بستر:</span>
                  <span>{techniqueDesc}</span>
                </div>
                <div className="flex justify-between border-b border-[#b45309]/20 pb-1.5">
                  <span className="font-bold text-[#78350f]">تاریخ صدور و ثبت:</span>
                  <span className="font-mono">{dateShamsi}</span>
                </div>
              </div>

              {/* Artwork Miniature Inset & Gold Seal */}
              <div className="flex flex-col items-center justify-center p-4 bg-white/70 rounded-2xl border border-[#ca8a04]/50 shadow-inner space-y-3">
                <span className="text-[10px] text-[#78350f] font-bold">نمایه دیجیتال اثر:</span>
                <div className="w-48 h-32 bg-[#faf5e8] border-2 border-[#b45309] rounded-xl flex items-center justify-center overflow-hidden shadow-md relative p-2">
                  <div className="text-center">
                    <span className="text-xs font-nastaliq text-[#18181b] block truncate max-w-[170px]">
                      {elements.find(e => e.type === 'text')?.text || projectName}
                    </span>
                    <span className="text-[9px] text-[#854d0e] font-mono mt-1 block">
                      {elements.length} جزء و قطعه نگارش‌شده
                    </span>
                  </div>
                </div>

                {/* Simulated Royal Stamp Badge */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#b45309] bg-[#fef3c7] flex items-center justify-center text-[#991b1b] shadow-sm font-nastaliq text-[10px] rotate-[-8deg]">
                    مهر اصالت
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono font-bold text-[#854d0e]">{serialNumber}</div>
                    <div className="text-[9px] text-[#78350f]">شناسه یکتای اعتبارسنجی اثر</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Declaration & Signature Footer */}
            <div className="border-t-2 border-[#b45309]/40 pt-6 mt-4 grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-[#78350f] block">تعهدنامه و اصالت:</span>
                <p className="text-[10px] text-[#44403c] leading-relaxed">
                  بدین‌وسیله گواهی می‌شود این اثر هنری با رعایت اصول هندسه، سواد و بیاض خوشنویسی اصیل ایرانی خلق و در دفتر رسمی آثار به ثبت رسیده است.
                </p>
              </div>
              <div className="flex flex-col items-center justify-end text-center space-y-1">
                <div className="w-36 border-b border-[#78350f] pb-1 font-nastaliq text-base text-[#78350f]">
                  {artistName}
                </div>
                <span className="text-[10px] text-[#78350f] font-semibold">امضا و ترقیم پدیدآورنده</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>چاپ مستقیم شناسنامه (Print)</span>
            </button>

            <button
              onClick={handleCopyText}
              className="py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              <span>{isCopied ? 'متن کپی شد' : 'کپی متن شناسنامه اثر'}</span>
            </button>

            <button
              onClick={handleDownloadImage}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-neutral-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-neutral-950" />
              <span>دریافت و صدور گواهی‌نامه رسمی</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

