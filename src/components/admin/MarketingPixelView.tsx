import React, { useState, useEffect } from 'react';
import { 
  Target, 
  CheckCircle2, 
  RefreshCw, 
  Database, 
  Key, 
  Code2, 
  Activity, 
  Globe, 
  Save,
  Clock,
  ShieldCheck,
  Zap,
  AlertCircle,
  Info,
  Layers,
  Terminal
} from 'lucide-react';
import { StoreSettings } from '../../types';
import { capiLogsMemory, CapiLogEntry } from '../../lib/marketing/meta-capi';

interface MarketingPixelViewProps {
  settings: StoreSettings;
  onSaveSettings: (updated: StoreSettings) => void;
}

export const MarketingPixelView: React.FC<MarketingPixelViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [form, setForm] = useState<StoreSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);
  const [logs, setLogs] = useState<CapiLogEntry[]>([...capiLogsMemory]);

  // Check 24h Expiration status
  const testCodeSetTime = form.testCodeSetAt ? new Date(form.testCodeSetAt).getTime() : Date.now();
  const elapsedMs = Date.now() - testCodeSetTime;
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  
  const remainingMs = Math.max(0, twentyFourHoursMs - elapsedMs);
  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/marketing-logs');
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setLogs(data.logs);
        }
      }
    } catch (e) {
      setLogs([...capiLogsMemory]);
    }
  };

  // Auto clean expired codes on mount if autoExpire is active & poll live logs
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);

    if (form.autoExpireTestCodes && form.testCodeSetAt) {
      if (Date.now() - new Date(form.testCodeSetAt).getTime() >= twentyFourHoursMs) {
        if (form.metaTestEventCode || form.tikTokTestEventCode || form.gaTestEventCode) {
          const cleaned = {
            ...form,
            metaTestEventCode: '',
            tikTokTestEventCode: '',
            gaTestEventCode: '',
          };
          setForm(cleaned);
          onSaveSettings(cleaned);
        }
      }
    }

    return () => clearInterval(interval);
  }, []);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedForm = {
      ...form,
      testCodeSetAt: new Date().toISOString(), // Reset 24h timer whenever updated
    };
    onSaveSettings(updatedForm);
    setForm(updatedForm);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleClearTestCodes = () => {
    const cleared = {
      ...form,
      metaTestEventCode: '',
      tikTokTestEventCode: '',
      gaTestEventCode: '',
      testCodeSetAt: new Date().toISOString(),
    };
    setForm(cleared);
    onSaveSettings(cleared);
  };

  const handleRefreshLogs = () => {
    fetchLogs();
  };

  const hasAnyTestCode = !!(form.metaTestEventCode || form.tikTokTestEventCode || form.gaTestEventCode);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Target className="w-6 h-6 text-emerald-600" />
            মার্কেটিং ও পিক্সেল ইন্টিগ্রেশন (Pixels & Conversions API)
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Facebook Meta Pixel, Meta CAPI, TikTok Pixel, Google Analytics 4 এবং Google Ads কনভার্সন ট্র্যাকিং
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> সেটিংস সফলভাবে সেভ হয়েছে!
            </span>
          )}
          <button
            onClick={() => handleSave()}
            type="button"
            className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>পিক্সেল কনফিগারেশন সেভ করুন</span>
          </button>
        </div>
      </div>

      {/* Info Notice: Pixel Event Trigger Policy */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-emerald-950 shadow-2xs flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-900">
            ⓘ পিক্সেল ইভেন্ট ফায়ারিং পলিসি (Purchase Event Trigger Mode)
          </h4>
          <p className="text-xs text-emerald-800 leading-relaxed font-medium">
            {form.firePurchaseOnlyOnConfirm ? (
              <span>বর্তমানে <strong>কেবলমাত্র অ্যাডমিন প্যানেল থেকে অর্ডার CONFIRMED করার পরই</strong> Meta, TikTok এবং Google-এ Purchase Event পাঠানো হচ্ছে।</span>
            ) : (
              <span>বর্তমানে <strong>কাস্টমার অর্ডার ফর্ম সাবমিট করার সাথে সাথেই</strong> Meta, TikTok এবং Google Pixels/CAPI এ <strong>Purchase Event</strong> ফায়ার করা হচ্ছে।</span>
            )}
          </p>
        </div>
      </div>

      {/* 24-Hour Auto Expiration Setting Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Clock className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  টেস্ট ইভেন্ট কোড ২৪ ঘণ্টা পর স্বয়ংক্রিয়ভাবে রিমুভ (Auto-Expire Feature)
                </h3>
                <span className="bg-amber-100 text-amber-800 border border-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                  সুপার সিকিউর
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                টেস্টিং শেষ হওয়ার পর টেস্ট ইভেন্ট কোড মুছে ফেলতে ভুলে গেলেও সমস্যা নেই। ২৪ ঘণ্টা পর এটি নিজে থেকেই নিষ্ক্রিয় হয়ে সম্পূর্ণ লাইভ ট্র্যাকিং মোডে চলে যাবে।
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <label className="inline-flex items-center gap-2.5 cursor-pointer shrink-0 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-all">
            <input
              type="checkbox"
              checked={!!form.autoExpireTestCodes}
              onChange={(e) => setForm({ ...form, autoExpireTestCodes: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 relative"></div>
            <span className="text-xs font-bold text-slate-800">
              {form.autoExpireTestCodes ? '২৪ ঘণ্টা অটো-রিমুভ সক্রিয়' : 'অটো-রিমুভ নিষ্ক্রিয়'}
            </span>
          </label>
        </div>

        {/* Live Timer or Status Message */}
        {hasAnyTestCode ? (
          form.autoExpireTestCodes ? (
            <div className="bg-white/90 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <Zap className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>টেস্ট কোড সক্রিয় আছে। অবশিষ্টাংশ সময়:</span>
                <span className="font-mono bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded border border-amber-300">
                  {remainingHours} ঘণ্টা {remainingMinutes} মিনিট
                </span>
              </div>

              <button
                type="button"
                onClick={handleClearTestCodes}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
              >
                এখনই টেস্ট কোড ডিলিট করুন
              </button>
            </div>
          ) : (
            <div className="bg-slate-100 p-2.5 rounded-xl text-xs text-slate-600 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              <span>টেস্ট কোডগুলো ম্যানুয়ালি ডিলিট না করা পর্যন্ত সক্রিয় থাকবে।</span>
            </div>
          )
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>কোনো টেস্ট ইভেন্ট কোড সেট করা নেই — আপনার ওয়েবসাইট এখন ১০০% লাইভ প্রডাকশন মোডে ট্র্যাকিং করছে।</span>
          </div>
        )}
      </div>

      {/* Main 2-Column Grid (Left: Forms, Right: Live Trigger Logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column - Pixel Setup Fields (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* 1. Meta (Facebook) Pixel & Conversions API */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                ১. Meta (Facebook) Pixel & Conversions API
              </h3>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Meta Pixel ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Meta Pixel ID
                  </label>
                  <input
                    type="text"
                    value={form.metaPixelId || ''}
                    onChange={(e) => setForm({ ...form, metaPixelId: e.target.value })}
                    placeholder="3357196114461703"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-mono text-xs outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Meta Test Event Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Meta CAPI Test Event Code</span>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      Test Events
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.metaTestEventCode || ''}
                    onChange={(e) => setForm({ ...form, metaTestEventCode: e.target.value })}
                    placeholder="TEST11416"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-mono text-xs outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Meta Events Manager-এর Test Events ট্যাব থেকে প্রাপ্ত টেস্ট কোড (যেমন: TEST12345)
                  </span>
                </div>
              </div>

              {/* Meta CAPI Access Token */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meta Conversions API (CAPI) Access Token
                </label>
                <textarea
                  rows={2}
                  value={form.metaCapiToken || ''}
                  onChange={(e) => setForm({ ...form, metaCapiToken: e.target.value })}
                  placeholder="EAAwqmSJEJHoBSLFR51eBP309yF3mg00vdRIxUBSA..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-mono text-xs outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Meta Domain Verification Code / Meta Tag */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-900">
                  Meta (Facebook) Domain Verification Code / Meta Tag
                </label>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Facebook Business Manager থেকে ডোমেইন ভেরিফাই করার জন্য মেটা কোড অথবা পুরো মেটা ট্যাগ বসান। (যেমন: <code className="bg-slate-200 px-1 rounded text-slate-800">abc123xyz456...</code> অথবা <code className="bg-slate-200 px-1 rounded text-slate-800">&lt;meta name="facebook-domain-verification" content="..." /&gt;</code>)
                </p>
                <input
                  type="text"
                  value={form.metaDomainVerification || ''}
                  onChange={(e) => setForm({ ...form, metaDomainVerification: e.target.value })}
                  placeholder='abc123xyz456...  অথবা  <meta name="facebook-domain-verification" content="..." />'
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl font-mono text-xs outline-none focus:border-indigo-600 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* 2. TikTok Pixel & Events API */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                ২. TikTok Pixel & Events API
              </h3>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* TikTok Pixel ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    TikTok Pixel ID
                  </label>
                  <input
                    type="text"
                    value={form.tikTokPixelId || ''}
                    onChange={(e) => setForm({ ...form, tikTokPixelId: e.target.value })}
                    placeholder="C12345678901"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-mono text-xs outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Events API Token */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Events API Token
                  </label>
                  <input
                    type="password"
                    value={form.tikTokAccessToken || ''}
                    onChange={(e) => setForm({ ...form, tikTokAccessToken: e.target.value })}
                    placeholder="TK_123456..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-mono text-xs outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                {/* TikTok Test Event Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>TikTok Test Event Code</span>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-200 px-1 py-0.5 rounded">
                      Test Code
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.tikTokTestEventCode || ''}
                    onChange={(e) => setForm({ ...form, tikTokTestEventCode: e.target.value })}
                    placeholder="TEST1234"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-mono text-xs outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Google Analytics 4 & Google Ads Conversion */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                ৩. Google Analytics 4 & Google Ads Conversion
              </h3>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* GA4 Measurement ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GA4 Measurement ID
                  </label>
                  <input
                    type="text"
                    value={form.gaMeasurementId || ''}
                    onChange={(e) => setForm({ ...form, gaMeasurementId: e.target.value })}
                    placeholder="G-X1Y2Z3W4V5"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-mono text-xs outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Google Ads Conversion ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Google Ads Conversion ID
                  </label>
                  <input
                    type="text"
                    value={form.googleAdsConversionId || ''}
                    onChange={(e) => setForm({ ...form, googleAdsConversionId: e.target.value })}
                    placeholder="AW-987654321"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-mono text-xs outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                {/* GTM Container ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GTM Container ID
                  </label>
                  <input
                    type="text"
                    value={form.gtmContainerId || ''}
                    onChange={(e) => setForm({ ...form, gtmContainerId: e.target.value })}
                    placeholder="GTM-ABC1234"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-mono text-xs outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Fire Purchase Only on Confirm Option */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <h5 className="text-xs font-extrabold text-slate-900">
                    অর্ডার কনফার্ম করার পরেই কেবল Purchase Event পাঠান
                  </h5>
                  <p className="text-[10px] text-slate-500">
                    (Recommended for Cash on Delivery stores)
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={!!form.firePurchaseOnlyOnConfirm}
                  onChange={(e) => setForm({ ...form, firePurchaseOnlyOnConfirm: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Form Save Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.005] active:scale-95"
          >
            <Save className="w-5 h-5" />
            <span>পিক্সেল কনফিগারেশন সেভ করুন</span>
          </button>
        </form>

        {/* Right Column - Live Trigger Logs Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 sticky top-20">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 font-mono">
              <Terminal className="w-4 h-4 text-emerald-600" />
              &gt;_ পিক্সেল ইভেন্ট লগ (Live Trigger Logs)
            </h3>

            <button
              onClick={handleRefreshLogs}
              type="button"
              className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>রিফ্রেশ</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {/* Mock/Live Events display list matching user's design screenshot */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
              <div className="flex justify-between items-center">
                <span className="font-bold text-emerald-700">Google - Purchase</span>
                <span className="text-[10px] text-slate-400">ORD-5882</span>
              </div>
              <p className="text-[11px] text-slate-600 break-all bg-white p-2 rounded border border-slate-100">
                {`{"ga4_id":"${form.gaMeasurementId || 'G-X1Y2Z3W4V5'}","transaction_id":"ORD-5882","value":1720}`}
              </p>
              <div className="text-[10px] text-slate-400 text-right">20:44:44</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
              <div className="flex justify-between items-center">
                <span className="font-bold text-cyan-700">TikTok - CompletePayment</span>
                <span className="text-[10px] text-slate-400">ORD-5882</span>
              </div>
              <p className="text-[11px] text-slate-600 break-all bg-white p-2 rounded border border-slate-100">
                {`{"req":{"pixel_code":"${form.tikTokPixelId || 'C12345678901'}","event":"CompletePayment"}}`}
              </p>
              <div className="text-[10px] text-slate-400 text-right">20:44:44</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-700">Meta - Purchase</span>
                <span className="text-[10px] text-slate-400">ORD-5882</span>
              </div>
              <p className="text-[11px] text-slate-600 break-all bg-white p-2 rounded border border-slate-100">
                {`{"req":{"data":[{"event_name":"Purchase","event_time":1785077884,"event_id":"evt_9812"}]}}`}
              </p>
              <div className="text-[10px] text-slate-400 text-right">20:44:44</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
              <div className="flex justify-between items-center">
                <span className="font-bold text-indigo-700">Meta - InitiateCheckout</span>
                <span className="text-[10px] text-slate-400">ORD-5882</span>
              </div>
              <p className="text-[11px] text-slate-600 break-all bg-white p-2 rounded border border-slate-100">
                {`{"value":1720,"currency":"BDT","content_name":"ProFlex Smart Orthopedic"}`}
              </p>
              <div className="text-[10px] text-slate-400 text-right">20:44:44</div>
            </div>

            {/* CAPI Memory Logs */}
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 text-xs space-y-1 font-mono">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-400">Server CAPI - {log.eventName}</span>
                  <span className="text-[10px] text-slate-400">{log.eventId}</span>
                </div>
                <p className="text-[10px] text-slate-300 break-all">
                  {log.payloadSummary}
                </p>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Status: {log.status} ({log.statusCode})</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
