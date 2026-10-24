import React, { useState } from 'react';
import { Crown, Sparkles, CheckCircle, ShieldCheck, Key, ArrowLeft, ExternalLink, Gift, X, ShieldAlert, Calendar } from 'lucide-react';
import { TrialState, activateVipLicense, getPlanNameFa } from '../utils/trialVault';

interface TrialUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialState: TrialState;
  onActivated: (newState: TrialState) => void;
  onOpenAdminPanel?: () => void;
  title?: string;
  subtitle?: string;
}

export const TrialUpgradeModal: React.FC<TrialUpgradeModalProps> = ({
  isOpen,
  onClose,
  trialState,
  onActivated,
  onOpenAdminPanel,
  title = 'پایان مهلت تست رایگان کلک',
  subtitle = 'برای دریافت خروجی نامحدود با کیفیت 4K و وکتور، نسخه نامحدود را فعال کنید.',
}) => {
  const [licenseInput, setLicenseInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleActivate = async () => {
    const trimmed = licenseInput.trim();
    if (!trimmed) {
      setErrorMsg('لطفاً کد لایسنس را وارد کنید.');
      return;
    }

    // Stealth Admin Command: if owner types 'admin' or 'kelkadmin' in the license box
    if (trimmed.toLowerCase() === 'admin' || trimmed.toLowerCase() === 'kelkadmin' || trimmed.toLowerCase() === 'owner') {
      if (onOpenAdminPanel) {
        onClose();
        onOpenAdminPanel();
        return;
      }
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await activateVipLicense(licenseInput);
      if (res.success) {
        setSuccessMsg(res.message);
        onActivated(res.state);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('خطا در اعتبارسنجی لایسنس.');
    } finally {
      setIsLoading(false);
    }
  };

  const remainingExports = Math.max(0, trialState.freeExportsAllowed - trialState.exportsUsed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-vazir">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden text-neutral-100 p-6 md:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="بستن"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Crown */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
              <Crown className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            {trialState.isVip
              ? `عضویت نسخه طلایی VIP (${getPlanNameFa(trialState.vipPlan || 'lifetime')})`
              : `وضعیت: ${remainingExports} خروجی رایگان باقی‌مانده`}
          </span>

          <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            {title}
          </h3>

          <p className="text-sm text-neutral-300 max-w-md leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Subscription Plans Overview Pill Row */}
        <div className="mt-5 mb-3">
          <div className="text-[11px] text-neutral-400 mb-2 text-center">پلن‌های منعطف قابل سفارش از مدیر سایت:</div>
          <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
            <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center">
              <span className="font-bold text-amber-300">۱ ماهه</span>
              <span className="text-neutral-500 text-[9px]">پروژه‌ای</span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center">
              <span className="font-bold text-amber-300">۳ ماهه</span>
              <span className="text-neutral-500 text-[9px]">فصلی</span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center">
              <span className="font-bold text-amber-300">۶ ماهه</span>
              <span className="text-neutral-500 text-[9px]">نیم‌ساله</span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center">
              <span className="font-bold text-amber-300">۱ ساله</span>
              <span className="text-neutral-500 text-[9px]">حرفه‌ای</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/40 flex flex-col items-center">
              <span className="font-bold text-amber-400">مادام‌العمر</span>
              <span className="text-amber-300/80 text-[9px]">محبوب‌ترین</span>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2 bg-neutral-950/60 p-3.5 rounded-2xl border border-neutral-800/80 text-xs">
          <div className="flex items-center gap-2 text-neutral-200">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>خروجی نامحدود بدون سقف</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-200">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>رزولوشن فوق‌العاده 4K و چاپ تخته شاسی</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-200">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>وکتور خالص SVG مخصوص طراحان و لیزر</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-200">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>بدون هیچ‌گونه واترمارک یا محدودیت ابزار</span>
          </div>
        </div>

        {/* Active VIP Status Reminder if VIP */}
        {trialState.isVip && trialState.vipExpiresAt && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>اعتبار اشتراک فعلی شما:</span>
            </div>
            <span className="font-bold">
              {new Date(trialState.vipExpiresAt).toLocaleDateString('fa-IR')}
            </span>
          </div>
        )}

        {/* Device Fingerprint Note */}
        <div className="mb-4 flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-950/90 border border-neutral-800 text-[11px] text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>شناسه سخت‌افزاری دستگاه:</span>
          </div>
          <span className="font-mono text-neutral-300 font-semibold">{trialState.deviceId.slice(0, 16)}...</span>
        </div>

        {/* License Input Form */}
        <div className="space-y-3">
          <label className="block text-xs text-neutral-300 font-medium">
            کد فعال‌سازی لایسنس کلک را وارد کنید:
          </label>
          <div className="relative">
            <Key className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <input
              type="text"
              value={licenseInput}
              onChange={(e) => setLicenseInput(e.target.value)}
              placeholder="مثال: KELK-VIP-9821-7546"
              dir="ltr"
              className="w-full bg-neutral-950 border border-neutral-700/90 rounded-xl py-3 pr-10 pl-4 text-sm text-center tracking-widest font-mono text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase placeholder:text-neutral-600"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 text-center animate-in fade-in duration-150">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-xs text-emerald-400 text-center font-bold animate-in fade-in duration-150 flex items-center justify-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {successMsg}
            </p>
          )}

          <div className="pt-2">
            <button
              onClick={handleActivate}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Crown className="w-4 h-4" />
              <span>{isLoading ? 'در حال تایید لایسنس...' : 'فعال‌سازی لایسنس طلایی'}</span>
            </button>
          </div>
        </div>

        {/* Footer info: Public customer view (no visible admin links) */}
        <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-2">
            <span>تهیه لایسنس و پشتیبانی:</span>
            <span className="text-amber-400 font-medium">
              تماس با مدیر سایت یا واحد فروش
            </span>
          </div>
          <span className="text-neutral-500 text-[10px]">نسخه اصیل و معتبر</span>
        </div>
      </div>
    </div>
  );
};
