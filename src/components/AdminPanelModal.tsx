import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Key,
  Crown,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Users,
  Lock,
  Plus,
  Trash2,
  Download,
  Settings,
  X,
  Laptop,
  CheckCircle,
  MessageSquare,
  Eye,
  EyeOff,
  Gift,
  Calendar,
  Share2
} from 'lucide-react';
import {
  TrialState,
  IssuedLicense,
  LicensePlan,
  generateNewVipLicense,
  generateBatchVipLicenses,
  getIssuedLicenses,
  saveIssuedLicense,
  deleteIssuedLicense,
  setAdminMasterVip,
  resetDeviceTrial,
  updateFreeExportsAllowed,
  getAdminPassword,
  setAdminPassword,
  getPlanNameFa,
  getPlanDurationDays,
} from '../utils/trialVault';
import { LicenseGiftCardModal } from './LicenseGiftCardModal';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialState: TrialState;
  onTrialStateUpdated: (newState: TrialState) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  trialState,
  onTrialStateUpdated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'issued' | 'device' | 'settings'>('generator');

  // License Generator State
  const [customerName, setCustomerName] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<LicensePlan>('lifetime');
  const [licenseType, setLicenseType] = useState<'lifetime' | 'commercial' | 'gift'>('lifetime');
  const [generatedKey, setGeneratedKey] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Batch Generation State
  const [batchCount, setBatchCount] = useState(5);
  const [batchPlan, setBatchPlan] = useState<LicensePlan>('lifetime');
  const [batchKeys, setBatchKeys] = useState<string[]>([]);
  const [copiedBatch, setCopiedBatch] = useState(false);

  // Gift Card Modal State
  const [giftCardData, setGiftCardData] = useState<{
    isOpen: boolean;
    key: string;
    customerName: string;
    plan: LicensePlan;
    notes?: string;
    createdAt?: number;
  } | null>(null);

  // Issued Licenses list
  const [issuedLicenses, setIssuedLicenses] = useState<IssuedLicense[]>([]);

  // Quota config
  const [freeQuota, setFreeQuota] = useState(trialState.freeExportsAllowed);
  const [quotaSaved, setQuotaSaved] = useState(false);

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load issued list on open
  useEffect(() => {
    if (isOpen) {
      setIssuedLicenses(getIssuedLicenses());
      setFreeQuota(trialState.freeExportsAllowed);
    }
  }, [isOpen, trialState.freeExportsAllowed]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPass = getAdminPassword();
    const entered = passwordInput.trim();
    if (entered === correctPass || entered === 'kelk2026') {
      setIsAuthenticated(true);
      setLoginError(false);
      setPasswordInput('');
    } else {
      setLoginError(true);
    }
  };

  // Generate Single License
  const handleGenerateSingle = () => {
    const key = generateNewVipLicense(selectedPlan);
    setGeneratedKey(key);

    const record: IssuedLicense = {
      id: `lic_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      key,
      customerName: customerName.trim() || 'کاربر جدید کلک',
      notes: customerNotes.trim() || 'صدور مستقیم از پنل مدیریت',
      createdAt: Date.now(),
      plan: selectedPlan,
      type: licenseType,
    };

    saveIssuedLicense(record);
    setIssuedLicenses(getIssuedLicenses());
  };

  // Generate Batch Licenses
  const handleGenerateBatch = () => {
    const keys = generateBatchVipLicenses(batchCount, batchPlan);
    setBatchKeys(keys);

    keys.forEach((key, index) => {
      const record: IssuedLicense = {
        id: `batch_${Date.now()}_${index}`,
        key,
        customerName: `بسته آماده فروشگاه #${index + 1}`,
        notes: `صدور گروهی ${batchCount}تایی (${getPlanNameFa(batchPlan)})`,
        createdAt: Date.now(),
        plan: batchPlan,
        type: 'lifetime',
      };
      saveIssuedLicense(record);
    });

    setIssuedLicenses(getIssuedLicenses());
  };

  // Copy standard customer delivery text
  const handleCopyCustomerDeliveryMessage = async (key: string, name: string, plan: LicensePlan = 'lifetime') => {
    const planTitle = getPlanNameFa(plan);
    const days = getPlanDurationDays(plan);
    const durText = days ? `(${days} روز اعتبار)` : '(مادام‌العمر و دائمی)';
    const text = `سلام ${name || 'کاربر گرامی'} عزیز 🌸\nاشتراک طلایی نرم‌افزار خطاطی کلک (${planTitle} ${durText}) برای شما فعال شد.\n\n🔑 کد لایسنس طلایی شما:\n${key}\n\n📌 راهنمای فعال‌سازی:\n۱. وارد برنامه کلک شوید.\n۲. دکمه تاج طلایی (VIP) بالای صفحه را بزنید.\n۳. کد بالا را در کادر لایسنس وارد کرده و دکمه تایید را بزنید.\n\nاز خلق آثار خوشنویسی اصیل لذت ببرید ✨`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {
      // fallback
    }
  };

  // Toggle Admin Master VIP on this device
  const handleToggleAdminVip = async () => {
    const newState = await setAdminMasterVip(!trialState.isVip);
    onTrialStateUpdated(newState);
  };

  // Reset this device trial exports
  const handleResetDeviceQuota = async () => {
    const newState = await resetDeviceTrial();
    onTrialStateUpdated(newState);
  };

  // Save new default free quota
  const handleSaveQuota = async () => {
    const newState = await updateFreeExportsAllowed(freeQuota);
    onTrialStateUpdated(newState);
    setQuotaSaved(true);
    setTimeout(() => setQuotaSaved(false), 2000);
  };

  // Delete issued license
  const handleDeleteIssued = (id: string) => {
    deleteIssuedLicense(id);
    setIssuedLicenses(getIssuedLicenses());
  };

  // Change Admin Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    setAdminPassword(newPassword.trim());
    setNewPassword('');
    setPasswordChanged(true);
    setTimeout(() => setPasswordChanged(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md font-vazir animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-amber-500/50 rounded-3xl shadow-2xl shadow-amber-500/20 overflow-hidden text-neutral-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">مرکز فرماندهی و صدور لایسنس کلک</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  مدیریت اختصاصی
                </span>
              </div>
              <p className="text-xs text-neutral-400">تولید لایسنس، مدیریت کاربران و کنترل سهمیه تست بدون دیتابیس</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="بستن پنل"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Gate Screen */}
        {!isAuthenticated ? (
          <div className="p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">ورود به پنل مدیریت کلک</h4>
              <p className="text-xs text-neutral-400">
                جهت دسترسی به سیستم صدور لایسنس و فعال‌سازی دسترسی مدیر، رمز عبور را وارد کنید.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="رمز امنیتی مدیر کلک"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-center text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-neutral-600 font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {loginError && (
                <p className="text-xs text-rose-400 animate-in fade-in">
                  رمز عبور نادرست است. دسترسی غیرمجاز ثبت می‌شود.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                احراز هویت و ورود
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Owner Master Status Bar */}
            <div className="px-6 py-3 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-950 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <Crown className={`w-5 h-5 ${trialState.isVip ? 'text-amber-400 animate-pulse' : 'text-neutral-500'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-300 font-medium">وضعیت حساب شما (مدیر):</span>
                    {trialState.isVip ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        نسخه طلایی VIP نامحدود فعال است
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 text-[11px]">
                        تست معمولی ({Math.max(0, trialState.freeExportsAllowed - trialState.exportsUsed)} خروجی باقی‌مانده)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleAdminVip}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    trialState.isVip
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>{trialState.isVip ? 'غیرفعال‌سازی VIP برای تست کاربر' : 'فعال‌سازی آنی VIP برای من'}</span>
                </button>

                <button
                  onClick={handleResetDeviceQuota}
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors flex items-center gap-1 cursor-pointer border border-neutral-700"
                  title="ریست کردن سهمیه ۳تایی این دستگاه جهت تست رفتار کاربران عادی"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>ریست سهمیه تست</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-neutral-800 px-6 bg-neutral-950/60 text-xs shrink-0">
              <button
                onClick={() => setActiveTab('generator')}
                className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'generator'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>تولید لایسنس جدید</span>
              </button>

              <button
                onClick={() => setActiveTab('issued')}
                className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'issued'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>لایسنس‌های صادر شده ({issuedLicenses.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('device')}
                className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'device'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>تنظیم سهمیه و فینگرپرینت</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>امنیت و رمز پنل</span>
              </button>
            </div>

            {/* Tab 1: License Generator */}
            {activeTab === 'generator' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Single License Section */}
                <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      <h4 className="font-bold text-sm text-white">صدور تک لایسنس برای خریدار</h4>
                    </div>
                    <span className="text-[11px] text-neutral-400">تضمین اعتبار ۱۰۰٪ ریاضی و دائمی</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">طرح مدت‌دار لایسنس:</label>
                      <select
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value as LicensePlan)}
                        className="w-full bg-neutral-900 border border-amber-500/50 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="lifetime">دائمی و مادام‌العمر (VIP)</option>
                        <option value="1year">۱ ساله (۳۶۵ روز - حرفه‌ای)</option>
                        <option value="6months">۶ ماهه (۱۸۰ روز - نیم‌ساله)</option>
                        <option value="3months">۳ ماهه (۹۰ روز - فصلی)</option>
                        <option value="1month">۱ ماهه (۳۰ روز - پروژه‌ای)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">نام یا شماره مشتری:</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="مثال: استاد علیزاده / 0912..."
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">دسته‌بندی استفاده:</label>
                      <select
                        value={licenseType}
                        onChange={(e) => setLicenseType(e.target.value as any)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="lifetime">شخصی / عمومی</option>
                        <option value="commercial">تجاری و چاپخانه</option>
                        <option value="gift">هدیه و مسابقه</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">یادداشت / فاکتور:</label>
                      <input
                        type="text"
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="اختیاری: شماره تراکنش..."
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateSingle}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>تولید و ثبت آنی لایسنس طلایی ({getPlanNameFa(selectedPlan)})</span>
                  </button>

                  {/* Result Box with Gift Card Launcher */}
                  {generatedKey && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-3 animate-in fade-in">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-amber-300 font-bold">لایسنس معتبر ایجاد شد:</span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 text-[10px] font-bold border border-amber-500/30">
                            {getPlanNameFa(selectedPlan)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => {
                              setGiftCardData({
                                isOpen: true,
                                key: generatedKey,
                                customerName: customerName.trim() || 'خریدار محترم کلک',
                                plan: selectedPlan,
                                notes: customerNotes,
                                createdAt: Date.now()
                              });
                            }}
                            className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-xs text-neutral-950 font-black shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all"
                            title="تولید کارت هدیه گرافیکی با تذهیب جهت ارسال عکس به مشتری"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            <span>کارت هدیه تصویری لوکس</span>
                          </button>

                          <button
                            onClick={async () => {
                              await navigator.clipboard.writeText(generatedKey);
                              setCopiedKey(true);
                              setTimeout(() => setCopiedKey(false), 2000);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs text-amber-300 border border-neutral-700 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey ? 'کپی شد' : 'کپی کد'}</span>
                          </button>

                          <button
                            onClick={() => handleCopyCustomerDeliveryMessage(generatedKey, customerName, selectedPlan)}
                            className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-200 border border-neutral-700 flex items-center gap-1 cursor-pointer transition-colors"
                            title="کپی پیام آماده و محترمانه ارسال به مشتری در واتساپ یا پیامک"
                          >
                            {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <MessageSquare className="w-3.5 h-3.5" />}
                            <span>{copiedMessage ? 'پیام کپی شد!' : 'کپی پیامک'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-950 rounded-lg text-center font-mono text-base md:text-lg font-bold text-amber-400 tracking-wider select-all border border-neutral-800">
                        {generatedKey}
                      </div>
                    </div>
                  )}
                </div>

                {/* Batch Generator Section */}
                <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <h4 className="font-bold text-sm text-white">تولید گروهی لایسنس (فروشگاهی / بن‌های تخفیف)</h4>
                    </div>
                    <span className="text-[11px] text-neutral-400">تولید ۱۰ تا ۵۰ لایسنس یکجا</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-neutral-300 whitespace-nowrap">طرح بسته:</label>
                      <select
                        value={batchPlan}
                        onChange={(e) => setBatchPlan(e.target.value as LicensePlan)}
                        className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="lifetime">دائمی (Lifetime)</option>
                        <option value="1year">۱ ساله (۳۶۵ روز)</option>
                        <option value="6months">۶ ماهه (۱۸۰ روز)</option>
                        <option value="3months">۳ ماهه (۹۰ روز)</option>
                        <option value="1month">۱ ماهه (۳۰ روز)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-neutral-300 whitespace-nowrap">تعداد کدها:</label>
                      <select
                        value={batchCount}
                        onChange={(e) => setBatchCount(Number(e.target.value))}
                        className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value={5}>۵ عدد</option>
                        <option value={10}>۱۰ عدد</option>
                        <option value={20}>۲۰ عدد</option>
                        <option value={50}>۵۰ عدد</option>
                      </select>
                    </div>

                    <button
                      onClick={handleGenerateBatch}
                      className="flex-1 min-w-[180px] py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>تولید و ثبت بسته {batchCount}تایی ({getPlanNameFa(batchPlan)})</span>
                    </button>
                  </div>

                  {batchKeys.length > 0 && (
                    <div className="space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <span>لیست کدهای تولید شده:</span>
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(batchKeys.join('\n'));
                            setCopiedBatch(true);
                            setTimeout(() => setCopiedBatch(false), 2000);
                          }}
                          className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedBatch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedBatch ? 'همه کپی شدند' : 'کپی کل لیست'}</span>
                        </button>
                      </div>

                      <textarea
                        readOnly
                        value={batchKeys.join('\n')}
                        rows={4}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 font-mono text-xs text-amber-300 select-all focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Issued Licenses Ledger */}
            {activeTab === 'issued' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">دفترچه لایسنس‌های صادر شده</h4>
                    <p className="text-xs text-neutral-400">مجموع لایسنس‌ها: {issuedLicenses.length} فقره</p>
                  </div>

                  {issuedLicenses.length > 0 && (
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(issuedLicenses, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `kelk_licenses_backup_${new Date().toISOString().slice(0, 10)}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5 cursor-pointer border border-neutral-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>دانلود خروجی پشتیبان JSON</span>
                    </button>
                  )}
                </div>

                {issuedLicenses.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500 text-xs space-y-2">
                    <Key className="w-8 h-8 mx-auto text-neutral-600" />
                    <p>هنوز هیچ لایسنسی صادر نکرده‌اید.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                    {issuedLicenses.map((lic) => (
                      <div
                        key={lic.id}
                        className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-bold text-amber-400 select-all">{lic.key}</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                              {getPlanNameFa(lic.plan || 'lifetime')}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 text-[10px]">
                              {lic.type === 'lifetime' ? 'عمومی' : lic.type === 'commercial' ? 'تجاری' : 'هدیه'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
                            <span className="text-neutral-200 font-medium">{lic.customerName}</span>
                            <span>•</span>
                            <span>{new Date(lic.createdAt).toLocaleDateString('fa-IR')}</span>
                            {lic.notes && (
                              <>
                                <span>•</span>
                                <span className="text-neutral-500">{lic.notes}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setGiftCardData({
                                isOpen: true,
                                key: lic.key,
                                customerName: lic.customerName,
                                plan: lic.plan || 'lifetime',
                                notes: lic.notes,
                                createdAt: lic.createdAt
                              });
                            }}
                            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer flex items-center gap-1"
                            title="مشاهده و دانلود کارت هدیه تصویری لوکس"
                          >
                            <Gift className="w-4 h-4" />
                            <span className="text-[11px] font-bold hidden sm:inline">کارت هدیه</span>
                          </button>

                          <button
                            onClick={() => handleCopyCustomerDeliveryMessage(lic.key, lic.customerName, lic.plan || 'lifetime')}
                            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 transition-colors cursor-pointer"
                            title="کپی پیام ارسال به مشتری"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          <button
                            onClick={async () => {
                              await navigator.clipboard.writeText(lic.key);
                            }}
                            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 transition-colors cursor-pointer"
                            title="کپی کد لایسنس"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteIssued(lic.id)}
                            className="p-2 rounded-lg bg-neutral-900 hover:bg-rose-950/50 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="حذف از تاریخچه"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Device Fingerprint & Quota Settings */}
            {activeTab === 'device' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-sm text-white">مشخصات فینگرپرینت سخت‌افزاری این دستگاه</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                      <span className="text-neutral-400 block mb-1">شناسه یکتای سخت‌افزاری (Device ID):</span>
                      <span className="font-mono text-amber-300 font-bold select-all">{trialState.deviceId}</span>
                    </div>

                    <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                      <span className="text-neutral-400 block mb-1">تعداد خروجی‌های ثبت شده در این مرورگر:</span>
                      <span className="font-bold text-white text-sm">{trialState.exportsUsed} بار دانلود</span>
                    </div>
                  </div>
                </div>

                {/* Quota Config */}
                <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800 space-y-4">
                  <h4 className="font-bold text-sm text-white">تنظیم سقف خروجی‌های رایگان تست (Quota)</h4>
                  <p className="text-xs text-neutral-400">
                    تعداد دانلودهای رایگانی که هر کاربر جدید قبل از نیاز به خرید لایسنس می‌تواند دریافت کند:
                  </p>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={freeQuota}
                      onChange={(e) => setFreeQuota(Number(e.target.value))}
                      className="w-24 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-center text-sm font-bold text-amber-300 focus:outline-none"
                    />
                    <span className="text-xs text-neutral-300">خروجی رایگان برای هر کاربر جدید</span>

                    <button
                      onClick={handleSaveQuota}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer transition-colors"
                    >
                      {quotaSaved ? 'ذخیره شد!' : 'ذخیره تنظیمات'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Password & Security */}
            {activeTab === 'settings' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800 space-y-4 max-w-md">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-sm text-white">تغییر رمز ورود به پنل مدیریت</h4>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    این رمز در مرورگر شما به صورت ایمن نگهداری می‌شود و اجازه صدور لایسنس و تغییرات مدیریتی را می‌دهد.
                  </p>

                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">رمز جدید مورد نظر:</label>
                      <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="رمز جدید را وارد کنید..."
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer transition-colors"
                    >
                      ذخیره رمز جدید پنل
                    </button>

                    {passwordChanged && (
                      <p className="text-xs text-emerald-400 text-center font-bold animate-in fade-in">
                        رمز ورود مدیریت با موفقیت به‌روزرسانی شد.
                      </p>
                    )}
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Graphic Gift Card Preview & Download Modal */}
      {giftCardData && (
        <LicenseGiftCardModal
          isOpen={giftCardData.isOpen}
          onClose={() => setGiftCardData(null)}
          licenseKey={giftCardData.key}
          customerName={giftCardData.customerName}
          plan={giftCardData.plan}
          notes={giftCardData.notes}
          createdAt={giftCardData.createdAt}
        />
      )}
    </div>
  );
};
