import React, { useRef, useState, useEffect } from 'react';
import { Crown, Download, Copy, Check, X, Sparkles, Share2, MessageSquare, Palette } from 'lucide-react';
import { LicensePlan, getPlanNameFa, getPlanDurationDays } from '../utils/trialVault';

interface LicenseGiftCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  licenseKey: string;
  customerName: string;
  plan?: LicensePlan | string;
  notes?: string;
  createdAt?: number;
}

// Helper for rendering rounded rectangles safely on all browsers and environments
function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === 'function') {
    try {
      ctx.roundRect(x, y, w, h, r);
      return;
    } catch {}
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export const LicenseGiftCardModal: React.FC<LicenseGiftCardModalProps> = ({
  isOpen,
  onClose,
  licenseKey,
  customerName,
  plan = 'lifetime',
  notes,
  createdAt = Date.now(),
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cardTheme, setCardTheme] = useState<'velvet' | 'parchment' | 'turquoise'>('velvet');
  const [isCopiedKey, setIsCopiedKey] = useState(false);
  const [isCopiedMsg, setIsCopiedMsg] = useState(false);
  const [isCopiedImage, setIsCopiedImage] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const planTitle = getPlanNameFa(plan);
  const durationDays = getPlanDurationDays(plan);
  const recipient = customerName.trim() || 'هنرمند و خطاط گرامی';
  const issueDateStr = new Date(createdAt).toLocaleDateString('fa-IR');

  // Draw the high-res Gift Card Canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1200;
    const H = 675;
    canvas.width = W;
    canvas.height = H;

    // 1. Background Fill
    if (cardTheme === 'velvet') {
      // Dark luxurious velvet with radial gold glow
      const grad = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, W * 0.7);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(0.5, '#12100e');
      grad.addColorStop(1, '#090807');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (cardTheme === 'turquoise') {
      // Royal Persian Turquoise & Night Blue
      const grad = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, W * 0.7);
      grad.addColorStop(0, '#06282d');
      grad.addColorStop(0.6, '#041619');
      grad.addColorStop(1, '#020b0d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      // Antique Warm Parchment
      const grad = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.8);
      grad.addColorStop(0, '#faf6ee');
      grad.addColorStop(0.6, '#f3ece0');
      grad.addColorStop(1, '#dfd3be');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // Colors according to theme
    const isDark = cardTheme !== 'parchment';
    const goldPrimary = isDark ? '#d4af37' : '#926c15';
    const goldAccent = isDark ? '#f59e0b' : '#b45309';
    const textColor = isDark ? '#f5f5f4' : '#292524';
    const textMuted = isDark ? '#a8a29e' : '#78716c';

    // 2. Ornate Tazhib Outer Border
    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = goldPrimary;
    ctx.strokeRect(36, 36, W - 72, H - 72);

    ctx.lineWidth = 1.2;
    ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.4)' : 'rgba(146, 108, 21, 0.35)';
    ctx.strokeRect(48, 48, W - 96, H - 96);
    ctx.strokeRect(54, 54, W - 108, H - 108);

    // Corner Ornaments (Lachak / Calligraphy corners)
    const drawCorner = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((angle * Math.PI) / 180);

      ctx.fillStyle = goldPrimary;
      // Diamond
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(16, 0);
      ctx.lineTo(0, 16);
      ctx.lineTo(-16, 0);
      ctx.closePath();
      ctx.fill();

      // Delicate leaf swirls
      ctx.strokeStyle = goldPrimary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(20, 20, 16, Math.PI, 1.5 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(28, 28, 10, Math.PI, 1.5 * Math.PI);
      ctx.stroke();

      ctx.restore();
    };

    drawCorner(54, 54, 0);
    drawCorner(W - 54, 54, 90);
    drawCorner(W - 54, H - 54, 180);
    drawCorner(54, H - 54, 270);
    ctx.restore();

    // 3. Central Top Emblem: Crown & Brand Title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';

    // Top Brand Tag
    ctx.font = 'bold 20px "Vazirmatn", "IRANSans", system-ui, sans-serif';
    ctx.fillStyle = goldAccent;
    ctx.fillText('❖ نـرم‌افـزار تـخصـصی خـوشـنویـسی کـِلـک ❖', W / 2, 110);

    // Card Main Title
    ctx.font = 'bold 36px "Vazirmatn", "IRANSans", system-ui, sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText('کـارت اشـتـراک زرّیـن و اخـتـصـاصـی VIP', W / 2, 165);

    // Decorative Separator Line
    ctx.strokeStyle = goldPrimary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 220, 195);
    ctx.lineTo(W / 2 + 220, 195);
    ctx.stroke();

    // Diamond in center of separator
    ctx.fillStyle = goldAccent;
    ctx.beginPath();
    ctx.moveTo(W / 2, 187);
    ctx.lineTo(W / 2 + 8, 195);
    ctx.lineTo(W / 2, 203);
    ctx.lineTo(W / 2 - 8, 195);
    ctx.closePath();
    ctx.fill();

    // Recipient line
    ctx.font = '24px "Vazirmatn", "IRANSans", system-ui, sans-serif';
    ctx.fillStyle = textMuted;
    ctx.fillText(`اهدا شده با افتخار به هنرمند گرامی:`, W / 2, 255);

    ctx.font = 'bold 32px "Vazirmatn", "IRANSans", system-ui, sans-serif';
    ctx.fillStyle = goldAccent;
    ctx.fillText(`« ${recipient} »`, W / 2, 305);

    // Plan Badge Box
    const badgeW = 420;
    const badgeH = 48;
    const badgeX = (W - badgeW) / 2;
    const badgeY = 335;

    ctx.fillStyle = isDark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(180, 83, 9, 0.12)';
    ctx.strokeStyle = goldPrimary;
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 24);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 21px "Vazirmatn", "IRANSans", system-ui, sans-serif';
    ctx.fillStyle = goldPrimary;
    ctx.fillText(`طـرح: ${planTitle} ${durationDays ? `(${durationDays} روز اعتبار)` : '(بدون محدودیت زمانی)'}`, W / 2, badgeY + 32);

    // 4. License Key Container Box
    const boxW = 680;
    const boxH = 92;
    const boxX = (W - boxW) / 2;
    const boxY = 415;

    ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = goldAccent;
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 18);
    ctx.fill();
    ctx.stroke();

    // License Key Text
    ctx.direction = 'ltr';
    ctx.font = 'bold 38px "Courier New", Courier, monospace';
    ctx.fillStyle = isDark ? '#fbbf24' : '#b45309';
    ctx.fillText(licenseKey, W / 2, boxY + 58);

    // 5. Card Footer Notes
    ctx.direction = 'rtl';
    ctx.font = '17px "Vazirmatn", "IRANSans", system-ui, sans-serif';
    ctx.fillStyle = textMuted;
    ctx.fillText('راهنمای فعال‌سازی: در برنامه کلک روی تاج طلایی کلیک کرده و کد بالا را وارد فرمایید.', W / 2, 545);

    // Authenticity stamp and date
    ctx.font = '15px "Vazirmatn", "IRANSans", system-ui, sans-serif';
    ctx.fillStyle = isDark ? 'rgba(168, 162, 158, 0.7)' : 'rgba(120, 113, 108, 0.8)';
    ctx.fillText(`تاریخ صدور: ${issueDateStr}  •  شناسه اصالت رسمی تایید شده  •  نسخه VIP اختصاصی`, W / 2, 580);

    ctx.restore();
  }, [isOpen, cardTheme, licenseKey, customerName, plan, createdAt]);

  if (!isOpen) return null;

  // Download High-Res PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDownloading(true);

    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Kelk_GiftCard_${licenseKey}.png`;
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  // Direct Image Copy to Clipboard (for pasting in Telegram, WhatsApp, etc.)
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          handleDownload();
          return;
        }
        try {
          // @ts-ignore ClipboardItem support
          if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
            // @ts-ignore
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setIsCopiedImage(true);
            setTimeout(() => setIsCopiedImage(false), 2500);
          } else {
            handleDownload();
          }
        } catch {
          handleDownload();
        }
      }, 'image/png');
    } catch {
      handleDownload();
    }
  };

  // Copy License Key
  const handleCopyKey = async () => {
    await navigator.clipboard.writeText(licenseKey);
    setIsCopiedKey(true);
    setTimeout(() => setIsCopiedKey(false), 2000);
  };

  // Copy Complete Delivery Message for Messenger / Social Media
  const handleCopyCustomerMsg = async () => {
    const text = `سلام و احترام ${recipient} عزیز 🌸
کارت اشتراک اختصاصی نرم‌افزار خطاطی و خوشنویسی «کِلک» تقدیم شما می‌گردد.

🌟 طرح اشتراک: ${planTitle} ${durationDays ? `(${durationDays} روز اعتبار)` : '(مادام‌العمر)'}
🔑 کد فعال‌سازی VIP:
${licenseKey}

📌 نحوه فعال‌سازی در برنامه:
۱. وارد برنامه خوشنویسی کلک شوید.
۲. آیکون تاج زرین (VIP) بالای صفحه را لمس کنید.
۳. کد لایسنس بالا را در کادر وارد کرده و تایید نمایید.

امیدواریم از خلق آثار هنری و خوشنویسی اصیل لذت ببرید ✨`;

    await navigator.clipboard.writeText(text);
    setIsCopiedMsg(true);
    setTimeout(() => setIsCopiedMsg(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-md font-vazir animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-amber-500/60 rounded-3xl shadow-2xl shadow-amber-500/20 overflow-hidden text-neutral-100 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>کارت هدیه لایسنس زرین کلک</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  فرمت ویژه اشتراک‌گذاری
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                طراحی شکیل و سنتی لایسنس جهت ارسال تصویر به مشتری در تلگرام، واتساپ یا چاپ لوکس
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Canvas Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 flex flex-col items-center justify-center bg-neutral-950/60">
          {/* Theme Selector */}
          <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-2xl border border-neutral-800 text-xs">
            <Palette className="w-4 h-4 text-amber-400" />
            <span className="text-neutral-400">قالب تذهیب کارت:</span>
            <div className="flex items-center gap-1 mr-2">
              {[
                { id: 'velvet', label: 'مخمل زرنگار تیره' },
                { id: 'parchment', label: 'پوستی کهن' },
                { id: 'turquoise', label: 'فیروزه درباری' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setCardTheme(t.id as any)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    cardTheme === t.id
                      ? 'bg-amber-500 text-neutral-950 shadow-md'
                      : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Render Element */}
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-amber-500/30 ring-1 ring-white/10 bg-black">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block"
              style={{ aspectRatio: '16/9' }}
            />
          </div>

          {/* Quick License & Plan Summary Pill */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-300">
            <div className="px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2">
              <span className="text-neutral-500">خریدار:</span>
              <span className="text-amber-300 font-bold">{recipient}</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2">
              <span className="text-neutral-500">پلن:</span>
              <span className="text-amber-300 font-bold">{planTitle}</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2 font-mono">
              <span className="text-amber-400 font-bold">{licenseKey}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="p-4 md:px-6 bg-neutral-950 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyKey}
              className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-bold border border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isCopiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              <span>{isCopiedKey ? 'کد کپی شد' : 'کپی کد لایسنس'}</span>
            </button>

            <button
              onClick={handleCopyCustomerMsg}
              className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-bold border border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="کپی متن کامل پیام تبریک و راهنما جهت ارسال به خریدار"
            >
              {isCopiedMsg ? <Check className="w-4 h-4 text-emerald-400" /> : <MessageSquare className="w-4 h-4 text-amber-400" />}
              <span>{isCopiedMsg ? 'متن پیام کپی شد!' : 'کپی متن تبریک و راهنما'}</span>
            </button>

            <button
              onClick={handleCopyImage}
              className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="کپی مستقیم تصویر کارت در کلیپ‌بورد برای چسباندن (Paste) مستقیم در تلگرام یا واتساپ"
            >
              {isCopiedImage ? <Check className="w-4 h-4 text-emerald-400" /> : <Palette className="w-4 h-4 text-amber-400" />}
              <span>{isCopiedImage ? 'تصویر کارت کپی شد!' : 'کپی تصویر کارت'}</span>
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'در حال خروجی...' : 'دانلود تصویر باکیفیت کارت (PNG)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
