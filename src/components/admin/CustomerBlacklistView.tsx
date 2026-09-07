import React, { useState } from 'react';
import { 
  Ban, 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  Search, 
  Trash2, 
  Clock, 
  Smartphone, 
  Globe, 
  Laptop, 
  AlertTriangle, 
  Save, 
  CheckCircle2, 
  RefreshCw,
  Lock,
  Unlock,
  Sliders,
  Filter
} from 'lucide-react';
import { BlacklistEntry, BlacklistType, StoreSettings, OrderData } from '../../types';

interface CustomerBlacklistViewProps {
  blacklist: BlacklistEntry[];
  orders?: OrderData[];
  settings?: StoreSettings;
  onSaveSettings?: (settings: StoreSettings) => void;
  onAddBlacklist: (payload: { type: BlacklistType; value: string; reason: string } | string, reason?: string) => void;
  onRemoveBlacklist: (id: string) => void;
}

export const CustomerBlacklistView: React.FC<CustomerBlacklistViewProps> = ({
  blacklist = [],
  orders = [],
  settings,
  onSaveSettings,
  onAddBlacklist,
  onRemoveBlacklist,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'blacklist' | 'activity'>('settings');

  // Repeat Order Blocker State
  const [enableRepeatBlock, setEnableRepeatBlock] = useState<boolean>(settings?.enableRepeatOrderBlock !== false);
  const [cooldownMinutes, setCooldownMinutes] = useState<number>(settings?.repeatOrderCooldownMinutes || 60);
  const [blockByPhone, setBlockByPhone] = useState<boolean>(settings?.blockByPhone !== false);
  const [blockByIp, setBlockByIp] = useState<boolean>(settings?.blockByIp !== false);
  const [blockByDevice, setBlockByDevice] = useState<boolean>(settings?.blockByDevice !== false);
  const [repeatMessage, setRepeatMessage] = useState<string>(
    settings?.repeatBlockMessage || 'আপনার একটি অর্ডার ইতিমধ্যে গৃহীত হয়েছে! পুনরায় অর্ডার করার জন্য অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।'
  );
  const [isSaved, setIsSaved] = useState(false);

  // Blacklist Management State
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<BlacklistType>('PHONE');
  const [modalValue, setModalValue] = useState('');
  const [modalReason, setModalReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | BlacklistType>('ALL');

  // Quick Preset Durations (in minutes)
  const COOLDOWN_PRESETS = [
    { label: '১০ মিনিট', value: 10 },
    { label: '৩০ মিনিট', value: 30 },
    { label: '১ ঘণ্টা (৬০ মি.)', value: 60 },
    { label: '২ ঘণ্টা (১২০ মি.)', value: 120 },
    { label: '৬ ঘণ্টা', value: 360 },
    { label: '১২ ঘণ্টা', value: 720 },
    { label: '২৪ ঘণ্টা (১ দিন)', value: 1440 },
    { label: '৪৮ ঘণ্টা (২ দিন)', value: 2880 },
  ];

  // Save Settings Handler
  const handleSaveFraudSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !onSaveSettings) return;

    const updatedSettings: StoreSettings = {
      ...settings,
      enableRepeatOrderBlock: enableRepeatBlock,
      repeatOrderCooldownMinutes: Math.max(1, cooldownMinutes),
      blockByPhone,
      blockByIp,
      blockByDevice,
      repeatBlockMessage: repeatMessage.trim(),
    };

    onSaveSettings(updatedSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Add Blacklist Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalValue.trim()) return;

    onAddBlacklist({
      type: modalType,
      value: modalValue.trim(),
      reason: modalReason.trim() || 'স্প্যাম বা ফেক অর্ডার রোধে অ্যাডমিন কর্তৃক ব্লক করা হয়েছে',
    });

    setShowAddModal(false);
    setModalValue('');
    setModalReason('');
  };

  // Quick 1-Click Instant Blacklist from Activity Table
  const handleQuickBlacklist = (type: BlacklistType, value: string, defaultReason: string) => {
    if (!value || value === '127.0.0.1' || value === 'server_device') return;
    onAddBlacklist({
      type,
      value,
      reason: defaultReason,
    });
  };

  // Filtered Blacklist Table
  const filteredBlacklist = blacklist.filter((b) => {
    const val = b.value || b.phone || b.ipAddress || b.deviceId || '';
    const reason = b.reason || '';
    const type = b.type || (b.phone ? 'PHONE' : b.ipAddress ? 'IP' : 'PHONE');

    const matchesSearch = val.includes(searchQuery) || reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || type === filterType;

    return matchesSearch && matchesType;
  });

  // Calculate Cooldown Remaining for an order
  const getOrderCooldownStatus = (orderCreatedAt: string) => {
    const orderTime = new Date(orderCreatedAt).getTime();
    const cooldownMs = (cooldownMinutes || 60) * 60 * 1000;
    const now = Date.now();
    const elapsed = now - orderTime;

    if (elapsed < cooldownMs) {
      const remainingMs = cooldownMs - elapsed;
      const remMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
      if (remMinutes >= 60) {
        const h = Math.floor(remMinutes / 60);
        const m = remMinutes % 60;
        return {
          isLocked: true,
          label: `লকড (আর ${h} ঘণ্টা ${m > 0 ? m + ' মি.' : ''} বাকি)`,
        };
      }
      return {
        isLocked: true,
        label: `লকড (আর ${remMinutes} মিনিট বাকি)`,
      };
    }

    return {
      isLocked: false,
      label: 'আনলকড (কুলডাউন শেষ)',
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#09090b] p-6 rounded-2xl border border-[#27272a] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                ফ্রড কাস্টমার ও রিপিট অর্ডার ব্লকার
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                  Anti-Fraud v2.5
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                একই কাস্টমার যাতে বারবার ফেক/রিপিট অর্ডার দিতে না পারে সেজন্য আইপি, ডিভাইস ও ফোন নাম্বার দিয়ে স্বয়ংক্রিয়ভাবে ব্লক করে রাখুন।
              </p>
            </div>
          </div>
        </div>

        {/* Global Protection Summary Pills */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121215] border border-[#27272a] text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400">টাইমার:</span>
            <span className="font-bold text-white font-mono">{cooldownMinutes} মিনিট</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121215] border border-[#27272a] text-xs">
            <Ban className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-zinc-400">ব্ল্যাকলিস্ট:</span>
            <span className="font-bold text-white font-mono">{blacklist.length} টি</span>
          </div>

          <button
            onClick={() => {
              setModalType('PHONE');
              setShowAddModal(true);
            }}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ব্ল্যাকলিস্ট যোগ</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-[#27272a] gap-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>রিপিট অর্ডার অটো-ব্লক সেটিংস (Cooldown Timer)</span>
        </button>

        <button
          onClick={() => setActiveTab('blacklist')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'blacklist'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Ban className="w-4 h-4" />
          <span>পার্মানেন্ট ব্ল্যাকলিস্ট ({blacklist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'activity'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>রিসেন্ট কাস্টমার ও অটো-লক ট্র্যাকার</span>
        </button>
      </div>

      {/* TAB 1: REPEAT ORDER AUTO-BLOCK SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveFraudSettings} className="space-y-6">
          {/* Master Toggle */}
          <div className="bg-[#09090b] p-6 rounded-2xl border border-[#27272a] flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${enableRepeatBlock ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                <h3 className="font-extrabold text-white text-sm">
                  রিপিট অর্ডার অটো-ব্লকার চালু রাখুন (Enable Repeat Order Protection)
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                একবার অর্ডার করার পর নির্ধারিত সময় পার না হওয়া পর্যন্ত একই ফোন নম্বর, আইপি অথবা ডিভাইস থেকে পুনরায় অর্ডার করা ব্লক থাকবে।
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={enableRepeatBlock}
                onChange={(e) => setEnableRepeatBlock(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Cooldown Time Duration Selector */}
          <div className={`bg-[#09090b] p-6 rounded-2xl border border-[#27272a] space-y-4 transition-opacity ${!enableRepeatBlock ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="space-y-1">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                অর্ডার কুলডাউন সময়সীমা (Cooldown Duration Timer)
              </h3>
              <p className="text-xs text-zinc-400">
                কাস্টমার একবার সফল অর্ডার করার পর কত সময় পর্যন্ত পুনরায় নতুন অর্ডার দিতে পারবে না তা সিলেক্ট বা টাইপ করুন:
              </p>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {COOLDOWN_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setCooldownMinutes(preset.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
                    cooldownMinutes === preset.value
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-[#121215] border-[#27272a] text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="pt-2 flex items-center gap-3">
              <div className="w-full max-w-xs">
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">কাস্টম মিনিট (Custom Minutes):</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10080"
                    value={cooldownMinutes}
                    onChange={(e) => setCooldownMinutes(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2 bg-[#121215] border border-[#27272a] rounded-xl text-xs font-mono font-bold text-white outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">মিনিট</span>
                </div>
              </div>

              <div className="text-xs text-zinc-400 pt-5">
                = <span className="text-amber-400 font-bold font-mono">
                  {cooldownMinutes >= 60 
                    ? `${(cooldownMinutes / 60).toFixed(1)} ঘণ্টা (${cooldownMinutes} মিনিট)` 
                    : `${cooldownMinutes} মিনিট`}
                </span> পর কাস্টমার আবার অর্ডার করতে পারবে।
              </div>
            </div>
          </div>

          {/* Block Criteria Toggles */}
          <div className={`bg-[#09090b] p-6 rounded-2xl border border-[#27272a] space-y-4 transition-opacity ${!enableRepeatBlock ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="space-y-1">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                কী কী তথ্য দিয়ে কাস্টমারকে ব্লক করা হবে (Block Identification Criteria)
              </h3>
              <p className="text-xs text-zinc-400">
                কাস্টমার স্প্যামিং বা মাল্টিপল অর্ডার প্রতিরোধে যেসব প্যারামিটার চেক করে সিস্টেম ব্লক কার্যকর করবে:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Phone Block Toggle */}
              <div 
                onClick={() => setBlockByPhone(!blockByPhone)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  blockByPhone 
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white' 
                    : 'bg-[#121215] border-[#27272a] text-zinc-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Smartphone className={`w-5 h-5 ${blockByPhone ? 'text-indigo-400' : 'text-zinc-600'}`} />
                  <input
                    type="checkbox"
                    checked={blockByPhone}
                    onChange={(e) => setBlockByPhone(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                </div>
                <h4 className="font-bold text-xs text-white">মোবাইল ফোন নম্বর</h4>
                <p className="text-[11px] text-zinc-400 mt-1">
                  একবার যে ফোন নম্বর দিয়ে অর্ডার হয়েছে, সেই নম্বরে কুলডাউন শেষ না হওয়া পর্যন্ত অর্ডার ব্লক থাকবে।
                </p>
              </div>

              {/* IP Address Block Toggle */}
              <div 
                onClick={() => setBlockByIp(!blockByIp)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  blockByIp 
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white' 
                    : 'bg-[#121215] border-[#27272a] text-zinc-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Globe className={`w-5 h-5 ${blockByIp ? 'text-indigo-400' : 'text-zinc-600'}`} />
                  <input
                    type="checkbox"
                    checked={blockByIp}
                    onChange={(e) => setBlockByIp(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                </div>
                <h4 className="font-bold text-xs text-white">ইন্টারনেট আইপি (IP Address)</h4>
                <p className="text-[11px] text-zinc-400 mt-1">
                  একই ইন্টারনেট কানেকশন বা ওয়াইফাই থেকে বারবার ফেক অর্ডার সাবমিট করা স্বয়ংক্রিয়ভাবে ব্লক করবে।
                </p>
              </div>

              {/* Device ID / Fingerprint Block Toggle */}
              <div 
                onClick={() => setBlockByDevice(!blockByDevice)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  blockByDevice 
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white' 
                    : 'bg-[#121215] border-[#27272a] text-zinc-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Laptop className={`w-5 h-5 ${blockByDevice ? 'text-indigo-400' : 'text-zinc-600'}`} />
                  <input
                    type="checkbox"
                    checked={blockByDevice}
                    onChange={(e) => setBlockByDevice(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                </div>
                <h4 className="font-bold text-xs text-white">ডিভাইস ফিঙ্গারপ্রিন্ট (Device ID)</h4>
                <p className="text-[11px] text-zinc-400 mt-1">
                  ফোন নম্বর বা আইপি পরিবর্তন করলেও কাস্টমারের নির্দিষ্ট মোবাইল/ব্রাউজার ডিভাইস চিনে লক রাখবে।
                </p>
              </div>
            </div>
          </div>

          {/* Custom Message to Show Customer */}
          <div className={`bg-[#09090b] p-6 rounded-2xl border border-[#27272a] space-y-3 transition-opacity ${!enableRepeatBlock ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="font-extrabold text-white text-sm">
              ব্লক অবস্থায় কাস্টমারকে দেখানোর নোটিশ মেসেজ (Blocked Notice Message)
            </h3>
            <p className="text-xs text-zinc-400">
              কুলডাউন টাইম শেষ হওয়ার আগে কাস্টমার আবার অর্ডার করতে গেলে চেকআউট পেজে এই মেসেজটি প্রদর্শিত হবে:
            </p>

            <textarea
              rows={2}
              value={repeatMessage}
              onChange={(e) => setRepeatMessage(e.target.value)}
              className="w-full p-3 bg-[#121215] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-sans"
              placeholder="আপনার একটি অর্ডার ইতিমধ্যে গৃহীত হয়েছে! পুনরায় অর্ডার করার জন্য অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।"
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {isSaved && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  ফ্রড সেটিংস সফলভাবে সেভ করা হয়েছে!
                </span>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ফ্রড ও রিপিট ব্লক সেটিংস সেভ করুন</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PERMANENT BLACKLIST */}
      {activeTab === 'blacklist' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-[#09090b] p-4 rounded-2xl border border-[#27272a] flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নম্বর, আইপি বা কারণ খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2 bg-[#121215] border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500"
                />
              </div>

              {/* Type Filter Pills */}
              <div className="flex gap-1">
                {(['ALL', 'PHONE', 'IP', 'DEVICE'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      filterType === t
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-[#121215] text-zinc-400 border border-[#27272a] hover:text-white'
                    }`}
                  >
                    {t === 'ALL' ? 'সব' : t === 'PHONE' ? 'ফোন' : t === 'IP' ? 'আইপি' : 'ডিভাইস'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setModalType('PHONE');
                setShowAddModal(true);
              }}
              className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন এন্ট্রি ব্ল্যাকলিস্ট করুন</span>
            </button>
          </div>

          {/* Blacklist Table */}
          <div className="bg-[#09090b] rounded-2xl border border-[#27272a] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#121215] text-zinc-400 uppercase text-[10px] font-mono font-extrabold border-b border-[#27272a]">
                  <tr>
                    <th className="p-4">টাইপ</th>
                    <th className="p-4">ব্লক ভ্যালু (Phone / IP / Device)</th>
                    <th className="p-4">ব্লক করার কারণ (Reason)</th>
                    <th className="p-4">তারিখ (Date)</th>
                    <th className="p-4 text-right">একশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]/60">
                  {filteredBlacklist.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-zinc-500">
                        কোনো এন্ট্রি খুঁজে পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredBlacklist.map((entry) => {
                      const type = entry.type || (entry.phone ? 'PHONE' : entry.ipAddress ? 'IP' : 'PHONE');
                      const val = entry.value || entry.phone || entry.ipAddress || entry.deviceId || '';

                      return (
                        <tr key={entry.id} className="hover:bg-zinc-900/50 transition-colors">
                          {/* Type Badge */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono ${
                              type === 'PHONE' 
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : type === 'IP'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>
                              {type === 'PHONE' ? <Smartphone className="w-3 h-3" /> : type === 'IP' ? <Globe className="w-3 h-3" /> : <Laptop className="w-3 h-3" />}
                              {type}
                            </span>
                          </td>

                          {/* Value */}
                          <td className="p-4 font-mono font-bold text-white text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                            <span className="truncate max-w-xs">{val}</span>
                          </td>

                          {/* Reason */}
                          <td className="p-4 text-zinc-300 font-medium">{entry.reason}</td>

                          {/* Date */}
                          <td className="p-4 text-zinc-500 font-mono text-[11px]">
                            {new Date(entry.createdAt).toLocaleDateString('bn-BD')}
                          </td>

                          {/* Action */}
                          <td className="p-4 text-right">
                            <button
                              onClick={() => onRemoveBlacklist(entry.id)}
                              className="px-3 py-1.5 bg-[#121215] hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 font-bold text-xs rounded-xl transition-all cursor-pointer border border-[#27272a] hover:border-emerald-500/30"
                            >
                              আনব্লক করুন
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECENT ACTIVITY & COOLDOWN TRACKER */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="bg-[#09090b] p-4 rounded-2xl border border-[#27272a] flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-white text-xs flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                লাইভ কাস্টমার কুলডাউন ও অটো-লক ট্র্যাকার
              </h3>
              <p className="text-[11px] text-zinc-400">
                যেসব কাস্টমার সম্প্রতি অর্ডার দিয়েছেন তাদের বর্তমান লক স্ট্যাটাস এবং ১-ক্লিকে ব্ল্যাকলিস্ট করার সুবিধা:
              </p>
            </div>
          </div>

          <div className="bg-[#09090b] rounded-2xl border border-[#27272a] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#121215] text-zinc-400 uppercase text-[10px] font-mono font-extrabold border-b border-[#27272a]">
                  <tr>
                    <th className="p-4">কাস্টমার ও অর্ডার</th>
                    <th className="p-4">আইপি ও ডিভাইস ইনফো</th>
                    <th className="p-4">অর্ডারের সময়</th>
                    <th className="p-4">কুলডাউন স্ট্যাটাস</th>
                    <th className="p-4 text-right">১-ক্লিক ব্ল্যাকলিস্ট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]/60">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-zinc-500">
                        এখনো কোনো অর্ডার প্লেস হয়নি।
                      </td>
                    </tr>
                  ) : (
                    orders.slice(0, 15).map((ord) => {
                      const cooldownStatus = getOrderCooldownStatus(ord.createdAt);

                      return (
                        <tr key={ord.id} className="hover:bg-zinc-900/50 transition-colors">
                          {/* Customer Name & Phone */}
                          <td className="p-4 space-y-0.5">
                            <div className="font-bold text-white">{ord.customerName}</div>
                            <div className="font-mono text-zinc-400 text-[11px] flex items-center gap-1">
                              <Smartphone className="w-3 h-3 text-indigo-400" />
                              {ord.phone}
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500">#{ord.orderNumber}</span>
                          </td>

                          {/* IP & Device */}
                          <td className="p-4 space-y-1">
                            <div className="font-mono text-zinc-300 text-[11px] flex items-center gap-1">
                              <Globe className="w-3 h-3 text-cyan-400" />
                              {ord.ipAddress || '127.0.0.1'}
                            </div>
                            {ord.deviceId && (
                              <div className="font-mono text-zinc-500 text-[10px] flex items-center gap-1 truncate max-w-[150px]">
                                <Laptop className="w-3 h-3 text-purple-400" />
                                {ord.deviceId}
                              </div>
                            )}
                          </td>

                          {/* Created Time */}
                          <td className="p-4 font-mono text-zinc-400 text-[11px]">
                            {new Date(ord.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                            <div className="text-[10px] text-zinc-500">{new Date(ord.createdAt).toLocaleDateString('bn-BD')}</div>
                          </td>

                          {/* Cooldown Status */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold font-mono ${
                              cooldownStatus.isLocked
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {cooldownStatus.isLocked ? <Lock className="w-3 h-3 text-rose-400" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
                              {cooldownStatus.label}
                            </span>
                          </td>

                          {/* 1-Click Blacklist Buttons */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleQuickBlacklist('PHONE', ord.phone, `Manual block from order #${ord.orderNumber}`)}
                                title="ফোন নম্বর পার্মানেন্ট ব্লক করুন"
                                className="p-1.5 bg-[#121215] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-[#27272a] hover:border-rose-500/40 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Smartphone className="w-3 h-3" />
                                <span>ফোন ব্লক</span>
                              </button>

                              {ord.ipAddress && ord.ipAddress !== '127.0.0.1' && (
                                <button
                                  onClick={() => handleQuickBlacklist('IP', ord.ipAddress!, `Manual IP block from order #${ord.orderNumber}`)}
                                  title="আইপি অ্যাড্রেস পার্মানেন্ট ব্লক করুন"
                                  className="p-1.5 bg-[#121215] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-[#27272a] hover:border-rose-500/40 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  <Globe className="w-3 h-3" />
                                  <span>আইপি ব্লক</span>
                                </button>
                              )}

                              {ord.deviceId && (
                                <button
                                  onClick={() => handleQuickBlacklist('DEVICE', ord.deviceId!, `Manual Device block from order #${ord.orderNumber}`)}
                                  title="ডিভাইস আইডি পার্মানেন্ট ব্লক করুন"
                                  className="p-1.5 bg-[#121215] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-[#27272a] hover:border-rose-500/40 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  <Laptop className="w-3 h-3" />
                                  <span>ডিভাইস ব্লক</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add to Blacklist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-[#27272a] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-400" />
              ফ্রড ব্ল্যাকলিস্টে যুক্ত করুন
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">ব্লক টাইপ নির্বাচন করুন *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalType('PHONE')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      modalType === 'PHONE'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-[#121215] text-zinc-400 border-[#27272a]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    ফোন
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalType('IP')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      modalType === 'IP'
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                        : 'bg-[#121215] text-zinc-400 border-[#27272a]'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    আইপি
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalType('DEVICE')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      modalType === 'DEVICE'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                        : 'bg-[#121215] text-zinc-400 border-[#27272a]'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    ডিভাইস
                  </button>
                </div>
              </div>

              {/* Target Value Input */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  {modalType === 'PHONE' ? 'মোবাইল নম্বর *' : modalType === 'IP' ? 'আইপি অ্যাড্রেস *' : 'ডিভাইস ফিঙ্গারপ্রিন্ট আইডি *'}
                </label>
                <input
                  type="text"
                  required
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  placeholder={
                    modalType === 'PHONE'
                      ? 'যেমন: 01812345678'
                      : modalType === 'IP'
                      ? 'যেমন: 103.205.71.12'
                      : 'যেমন: dev_c0_x9a8b7...'
                  }
                  className="w-full px-3.5 py-2.5 bg-[#121215] rounded-xl border border-[#27272a] text-xs font-mono text-white outline-none focus:border-rose-500"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">ব্লক করার কারণ (Reason)</label>
                <input
                  type="text"
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  placeholder="যেমন: ৩ বার পার্সেল রিটার্ন করেছে / স্প্যামিং"
                  className="w-full px-3.5 py-2.5 bg-[#121215] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-[#121215] text-zinc-400 font-bold text-xs rounded-xl border border-[#27272a] hover:text-white cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all cursor-pointer"
                >
                  পার্মানেন্ট ব্ল্যাকলিস্ট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
