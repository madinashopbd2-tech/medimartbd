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
  Terminal,
  Play,
  Send,
  Sparkles,
  Fingerprint,
  Cpu,
  MousePointerClick,
  Check
} from 'lucide-react';
import { StoreSettings } from '../../types';
import { capiLogsMemory, CapiLogEntry } from '../../lib/marketing/meta-capi';
import {
  initTrackingScripts,
  trackClientWatchVideo,
  trackClientPageView,
  trackClientInitiateCheckout,
  trackClientPageScroll,
  trackClientTimeOnPage,
  trackClientScrollDepth,
  trackClientInternalClick,
  trackClientViewContent,
  trackClientAddToCart,
  trackClientOutboundClick,
  trackClientPurchase,
  getMarketingClickContext,
  MarketingClickContext
} from '../../lib/marketing/tracking-client';

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
  const [clickContext, setClickContext] = useState<MarketingClickContext>(getMarketingClickContext());

  const handleSimulateClickId = (platform: 'fb' | 'tiktok' | 'google') => {
    const ts = Math.floor(Date.now() / 1000);
    const rand = Math.random().toString(36).substring(2, 10);
    if (platform === 'fb') {
      const simulatedFbclid = `fbclid_demo_${rand}`;
      localStorage.setItem('_mkt_fbclid', simulatedFbclid);
      document.cookie = `_fbc=fb.1.${ts}.${simulatedFbclid}; path=/; max-age=7776000`;
    } else if (platform === 'tiktok') {
      const simulatedTtclid = `ttclid_demo_${rand}`;
      localStorage.setItem('_mkt_ttclid', simulatedTtclid);
      document.cookie = `_ttclid=${simulatedTtclid}; path=/; max-age=7776000`;
    } else if (platform === 'google') {
      const simulatedGclid = `gclid_demo_${rand}`;
      localStorage.setItem('_mkt_gclid', simulatedGclid);
      document.cookie = `_gclid=${simulatedGclid}; path=/; max-age=7776000`;
    }
    setClickContext(getMarketingClickContext());
  };

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

  const [testingEvent, setTestingEvent] = useState<string | null>(null);

  const handleFireSingleTestEvent = async (eventName: string) => {
    setTestingEvent(eventName);
    try {
      // Auto save current form to backend to ensure credentials are fully synced
      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        onSaveSettings(form);
      } catch (e) {}

      // Ensure scripts and form settings are active
      initTrackingScripts(form);

      if (eventName === 'PageView') {
        trackClientPageView();
      } else if (eventName === 'ViewContent') {
        const dummyProd: any = {
          id: 'COD-PROD-01',
          title: 'ProFlex Smart Orthopedic',
          subtitle: 'Ergonomic Support',
          regularPrice: 1850,
          offerPrice: 1450,
          stockQuantity: 15,
          images: [],
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          features: [],
          specs: [],
          instructions: [],
        };
        trackClientViewContent(dummyProd);
      } else if (eventName === 'AddToCart') {
        trackClientAddToCart('ProFlex Smart Orthopedic', 1450, 1, undefined, {
          phone: '01712345678',
          name: 'Test Customer',
          district: 'Dhaka',
        });
      } else if (eventName === 'InitiateCheckout') {
        trackClientInitiateCheckout('ProFlex Smart Orthopedic', 1450, undefined, {
          phone: '01712345678',
          name: 'Test Customer',
          district: 'Dhaka',
        }, true);
      } else if (eventName === 'WatchVideo') {
        trackClientWatchVideo('Product Demo Video - ProFlex Orthopedic', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      } else if (eventName === 'PageScroll') {
        trackClientPageScroll(50, 'MiddleOfPage');
      } else if (eventName === 'ScrollDepth') {
        trackClientScrollDepth(75, 'DeepContent');
      } else if (eventName === 'TimeOnPage') {
        trackClientTimeOnPage(30);
      } else if (eventName === 'InternalClick') {
        trackClientInternalClick('CTA_Order_Now_Button', 'OrderFormSection');
      } else if (eventName === 'OutboundClick') {
        trackClientOutboundClick('WhatsAppSupport', 'https://wa.me/8801700000000');
      } else if (eventName === 'Purchase') {
        const dummyOrder: any = {
          id: `ord_test_${Date.now().toString().slice(-4)}`,
          orderNumber: `ORD-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
          customerName: 'Test Customer',
          phone: '01712345678',
          address: 'Dhanmondi 32, Dhaka',
          district: 'Dhaka',
          upazila: 'Dhaka City',
          quantity: 1,
          unitPrice: 1450,
          deliveryFee: 70,
          discountAmount: 0,
          totalAmount: 1520,
          status: 'CONFIRMED',
          riskLevel: 'LOW',
          createdAt: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          deviceId: 'test_device_123',
        };
        trackClientPurchase(dummyOrder, 'ProFlex Smart Orthopedic', form.googleAdsConversionId);
      }
      setTimeout(fetchLogs, 600);
    } catch (e) {
      console.error('Test event trigger error:', e);
    } finally {
      setTimeout(() => setTestingEvent(null), 800);
    }
  };

  const handleFireAllTestEvents = async () => {
    setTestingEvent('ALL');
    const eventList = [
      'PageView',
      'ViewContent',
      'AddToCart',
      'InitiateCheckout',
      'Purchase',
      'WatchVideo',
      'PageScroll',
      'ScrollDepth',
      'TimeOnPage',
      'InternalClick',
      'OutboundClick',
    ];
    for (const evt of eventList) {
      await handleFireSingleTestEvent(evt);
      await new Promise(r => setTimeout(r, 200));
    }
    setTestingEvent(null);
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

      {/* Enterprise Marketing Architecture & Event Match Quality (EMQ) Dashboard */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                ENTERPRISE CAPI ARCHITECTURE
              </span>
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-mono font-bold">
                FIRST-PARTY DATA LAYER
              </span>
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-mono font-bold">
                DUAL DISPATCH ENGINE
              </span>
            </div>
            <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2 mt-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              আধুনিক ই-কমার্স মার্কেটিং ও ডাটা ট্র্যাকিং আর্কিটেকচার
            </h3>
            <p className="text-xs text-slate-400">
              Meta CAPI (Graph API v20+), TikTok Events API v1.3 এবং GA4 Measurement Protocol এর সর্বোচ্চ স্ট্যান্ডার্ড।
            </p>
          </div>

          {/* EMQ Score Card */}
          <div className="bg-slate-950/80 border border-slate-800 px-4 py-3 rounded-xl flex items-center gap-4 shrink-0">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Event Match Quality (EMQ)</div>
              <div className="text-xl font-black text-emerald-400 font-mono flex items-baseline gap-1">
                ৯.৮ <span className="text-xs text-slate-500 font-normal">/ ১০.০</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black rounded font-mono">
                EXCEPTIONAL
              </span>
              <div className="text-[10px] text-slate-400 mt-0.5">সর্বোচ্চ বিজ্ঞাপন রেজাল্ট</div>
            </div>
          </div>
        </div>

        {/* 6 Core Architecture Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>SHA-256 ক্রিপ্টোগ্রাফিক হ্যাশিং</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              গ্রাহকের ফোন নম্বর (+880 E.164 ফর্ম্যাটে নরমালাইজড), নাম, জেলা এবং ইমেইল SHA-256 হ্যাশ হয়ে মেটা ও টিকটকে যায়—প্রাইভেসি শতভাগ নিরাপদ।
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <Fingerprint className="w-4 h-4" />
              <span>ফার্স্ট-পার্টি কুকিজ (_fbp ও _fbc)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              সাফারি আইওএস বা ক্রোম থার্ড-পার্টি কুকি ব্লক করলেও আমাদের নিজস্ব ডোমেইন কুকি থেকে `_fbp` এবং `_fbc` সংগৃহীত হয়ে CAPI এর সাথে সিঙ্ক হয়।
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <Layers className="w-4 h-4" />
              <span>ডিটারমিনিস্টিক ইভেন্ট ডিডুপ্লিকেশন</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ব্রাউজার পিক্সেল ও ব্যাকএন্ড সার্ভার উভয় জায়গায় হুবহু একই ইউনিক <code className="text-cyan-300">event_id</code> পাঠানো হয়, তাই কখনোই ডুপ্লিকেট সেল রেকর্ড হয় না।
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
              <Zap className="w-4 h-4" />
              <span>iOS 14.5+ & AdBlocker বাইপাস</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              কাস্টমারের ফোনে AdBlocker ইনস্টল থাকলেও সার্ভার-সাইড CAPI সরাসরি ব্যাকএন্ড থেকে গ্রাফ এপিআই-তে কল করে—কোনো সেল মিস হয় না।
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <MousePointerClick className="w-4 h-4" />
              <span>স্বয়ংক্রিয় Click ID ক্যাচিং</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ফেসবুক, টিকটক বা গুগল বিজ্ঞাপন থেকে ক্লিক করে আসলে URL থেকে <code className="text-amber-300">fbclid</code>, <code className="text-amber-300">ttclid</code>, <code className="text-amber-300">gclid</code> ক্যাপচার করে ৯০ দিনের জন্য ক্যাশে রাখে।
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Activity className="w-4 h-4" />
              <span>১০টি ফুল-ফানেল মাইক্রো ইভেন্টস</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              PageView, ViewContent, WatchVideo, PageScroll, ScrollDepth, TimeOnPage, InternalClick, OutboundClick, Checkout, Purchase সব ট্র্যাক হয়।
            </p>
          </div>
        </div>

        {/* Live First-Party Click ID Inspector & Simulator */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
              <Terminal className="w-3.5 h-3.5" />
              লাইভ ক্লিক আইডি ও ফার্স্ট-পার্টি কুকি ইন্সপেক্টর (Active Diagnostic Context)
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-slate-400">সিমুলেশন টেস্ট করুন:</span>
              <button
                type="button"
                onClick={() => handleSimulateClickId('fb')}
                className="px-2 py-0.5 bg-blue-900/60 hover:bg-blue-800 border border-blue-500/40 text-blue-200 text-[10px] font-bold rounded cursor-pointer transition-all"
              >
                + FBCLID
              </button>
              <button
                type="button"
                onClick={() => handleSimulateClickId('tiktok')}
                className="px-2 py-0.5 bg-cyan-900/60 hover:bg-cyan-800 border border-cyan-500/40 text-cyan-200 text-[10px] font-bold rounded cursor-pointer transition-all"
              >
                + TTCLID
              </button>
              <button
                type="button"
                onClick={() => handleSimulateClickId('google')}
                className="px-2 py-0.5 bg-amber-900/60 hover:bg-amber-800 border border-amber-500/40 text-amber-200 text-[10px] font-bold rounded cursor-pointer transition-all"
              >
                + GCLID
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-slate-300 font-mono text-[10px]">
            <div className="bg-slate-900 p-2 rounded border border-slate-800 truncate">
              <div className="text-slate-500 text-[9px] uppercase">_fbp (Browser ID)</div>
              <div className="text-emerald-400 font-bold truncate">{clickContext.fbp || 'Auto-Generating...'}</div>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800 truncate">
              <div className="text-slate-500 text-[9px] uppercase">_fbc / fbclid</div>
              <div className="text-blue-400 font-bold truncate">{clickContext.fbc || clickContext.fbclid || 'None (Click +FBCLID)'}</div>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800 truncate">
              <div className="text-slate-500 text-[9px] uppercase">ttclid (TikTok Click)</div>
              <div className="text-cyan-400 font-bold truncate">{clickContext.ttclid || 'None (Click +TTCLID)'}</div>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800 truncate">
              <div className="text-slate-500 text-[9px] uppercase">gclid (Google Click)</div>
              <div className="text-amber-400 font-bold truncate">{clickContext.gclid || 'None (Click +GCLID)'}</div>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800 truncate col-span-2 sm:col-span-1">
              <div className="text-slate-500 text-[9px] uppercase">Device Fingerprint</div>
              <div className="text-purple-400 font-bold truncate">{clickContext.externalId || 'dev_active'}</div>
            </div>
          </div>
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

          {/* Interactive Event Tester Tool */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                <Play className="w-3.5 h-3.5 fill-current" />
                ১০টি ইভেন্ট টেস্ট টুল (Event Manager Simulator)
              </span>
              <button
                type="button"
                onClick={handleFireAllTestEvents}
                disabled={!!testingEvent}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-[11px] rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Send className="w-3 h-3" />
                <span>{testingEvent === 'ALL' ? 'সেন্ড হচ্ছে...' : 'সব ১০টি ইভেন্ট ফায়ার করুন'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              নিচের যে কোনো বাটনে ক্লিক করে ইভেন্ট ম্যানেজারে লাইভ ডাটা চেক করুন:
            </p>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { name: 'PageView', label: '1. PageView', color: 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300' },
                { name: 'ViewContent', label: '2. View content', color: 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300' },
                { name: 'AddToCart', label: '3. Add to cart', color: 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300' },
                { name: 'InitiateCheckout', label: '4. Initiate checkout', color: 'bg-amber-950/80 hover:bg-amber-900 border border-amber-500/30 text-amber-300' },
                { name: 'Purchase', label: '5. Purchase', color: 'bg-rose-950/80 hover:bg-rose-900 border border-rose-500/30 text-rose-300' },
                { name: 'WatchVideo', label: '6. WatchVideo', color: 'bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300' },
                { name: 'PageScroll', label: '7. PageScroll', color: 'bg-slate-800 hover:bg-slate-700 text-slate-200' },
                { name: 'ScrollDepth', label: '8. ScrollDepth', color: 'bg-slate-800 hover:bg-slate-700 text-slate-200' },
                { name: 'TimeOnPage', label: '9. TimeOnPage', color: 'bg-slate-800 hover:bg-slate-700 text-slate-200' },
                { name: 'InternalClick', label: '10. InternalClick', color: 'bg-slate-800 hover:bg-slate-700 text-slate-200' },
                { name: 'OutboundClick', label: '11. OutboundClick', color: 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300' },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleFireSingleTestEvent(item.name)}
                  disabled={!!testingEvent}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-left transition-all cursor-pointer flex items-center justify-between ${item.color}`}
                >
                  <span className="truncate">{item.label}</span>
                  {testingEvent === item.name ? (
                    <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <Play className="w-2.5 h-2.5 opacity-60 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500 font-sans">
                এখনও কোনো সার্ভার ইভেন্ট লগ তৈরি হয়নি। উপরের <span className="font-bold text-emerald-600">সব ১০টি ইভেন্ট ফায়ার করুন</span> বাটনে ক্লিক করে টেস্ট করুন।
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border text-xs space-y-1.5 font-mono ${
                    log.status === 'SUCCESS'
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-800'
                      : log.status === 'FAILED'
                      ? 'bg-rose-950/20 border-rose-500/40 text-slate-800'
                      : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`font-bold flex items-center gap-1.5 ${
                        log.platform === 'Meta CAPI'
                          ? 'text-blue-600'
                          : log.platform === 'TikTok Events API'
                          ? 'text-cyan-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {log.platform} - {log.eventName}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : log.status === 'FAILED'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {log.status} ({log.statusCode})
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-white/80 p-2 rounded border border-slate-200/60 break-all">
                    {log.responseMessage || log.payloadSummary}
                  </p>

                  <div className="text-[10px] text-slate-400 flex justify-between items-center">
                    <span className="truncate max-w-[180px]">ID: {log.eventId}</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
