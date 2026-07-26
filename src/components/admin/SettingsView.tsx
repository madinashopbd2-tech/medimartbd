import React, { useState } from 'react';
import { Settings as SettingsIcon, Truck, Send, Tag, Plus, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { StoreSettings, CouponData } from '../../types';

interface SettingsViewProps {
  settings: StoreSettings;
  coupons: CouponData[];
  onSaveSettings: (updated: StoreSettings) => void;
  onAddCoupon: (code: string, discount: number) => void;
  onDeleteCoupon: (id: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  coupons,
  onSaveSettings,
  onAddCoupon,
  onDeleteCoupon,
}) => {
  const [form, setForm] = useState<StoreSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);
  const [testTelegramStatus, setTestTelegramStatus] = useState('');

  // Coupon inputs
  const [couponCode, setCouponCode] = useState('');
  const [discountVal, setDiscountVal] = useState(100);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSendTestTelegramAlert = async () => {
    if (!form.telegramBotToken || !form.telegramChatId) {
      setTestTelegramStatus('বট টোকেন এবং চ্যাট আইডি উভয়ই পূরণ করুন।');
      return;
    }

    setTestTelegramStatus('মেসেজ পাঠানো হচ্ছে...');
    try {
      const url = `https://api.telegram.org/bot${form.telegramBotToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: form.telegramChatId,
          text: `🔔 *COD Landing Page Test Alert!* \n\nআপনার টেলিগ্রাম বট সফলভাবে কানেক্ট হয়েছে। এখন থেকে নতুন যেকোনো অর্ডার আসলে সাথে সাথে নোটিফিকেশন পাবেন!🚀`,
          parse_mode: 'Markdown',
        }),
      });

      if (res.ok) {
        setTestTelegramStatus('✅ টেলিগ্রামে টেস্ট অ্যালার্ট সফলভাবে পাঠানো হয়েছে!');
      } else {
        const err = await res.json();
        setTestTelegramStatus(`❌ টেলিগ্রাম এরর: ${err.description || 'Failed'}`);
      }
    } catch (err: any) {
      setTestTelegramStatus(`❌ কানেকশন এরর: ${err.message}`);
    }
  };

  const handleAddCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || discountVal <= 0) return;
    onAddCoupon(couponCode.trim().toUpperCase(), discountVal);
    setCouponCode('');
    setDiscountVal(100);
  };

  return (
    <div className="space-y-6">
      {/* Password & Security */}
      <form onSubmit={handleSave} className="bg-[#09090b] p-6 rounded-2xl border border-[#27272a] space-y-4">
        <div className="flex justify-between items-center border-b border-[#27272a] pb-4">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              পাসওয়ার্ড ও সিকিউরিটি
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              এডমিন প্যানেলে লগইন করার ইউজারনেম এবং পাসওয়ার্ড পরিবর্তন করুন।
            </p>
          </div>
          {isSaved && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> সেভ হয়েছে
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">ইউজারনেম</label>
            <input
              type="text"
              required
              value={form.adminUsername || ''}
              onChange={(e) => setForm({ ...form, adminUsername: e.target.value })}
              className="w-full px-3.5 py-2 bg-[#121215] border border-[#27272a] text-white rounded-xl font-mono text-xs outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">নতুন পাসওয়ার্ড</label>
            <input
              type="text"
              required
              value={form.adminPassword || ''}
              onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
              className="w-full px-3.5 py-2 bg-[#121215] border border-[#27272a] text-white rounded-xl font-mono text-xs outline-none focus:border-emerald-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.15)] cursor-pointer transition-all"
        >
          সিকিউরিটি আপডেট করুন
        </button>
      </form>

      {/* System & Courier API Settings */}
      <form onSubmit={handleSave} className="bg-[#09090b] p-6 rounded-2xl border border-[#27272a] space-y-6">
        <div className="flex justify-between items-center border-b border-[#27272a] pb-4">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-emerald-400" />
              সিস্টেম ও কুরিয়ার এপিআই সেটিংস (Courier & Telegram)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              স্টিডফাস্ট, পাঠাও এপিআই টোকেন এবং টেলিগ্রাম অলার্ট কানেকশন।
            </p>
          </div>

          {isSaved && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> সেভ হয়েছে
            </span>
          )}
        </div>

        {/* Courier API Keys */}
        <div className="space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-400" />
            স্টিডফাস্ট ও পাঠাও কুরিয়ার এপিআই
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Steadfast Courier API Key</label>
              <input
                type="text"
                value={form.steadfastApiKey || ''}
                onChange={(e) => setForm({ ...form, steadfastApiKey: e.target.value })}
                placeholder="st_key_xxxx"
                className="w-full px-3.5 py-2 bg-[#121215] border border-[#27272a] text-white rounded-xl font-mono text-xs outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Steadfast Secret Key</label>
              <input
                type="password"
                value={form.steadfastSecretKey || ''}
                onChange={(e) => setForm({ ...form, steadfastSecretKey: e.target.value })}
                placeholder="st_secret_xxxx"
                className="w-full px-3.5 py-2 bg-[#121215] border border-[#27272a] text-white rounded-xl font-mono text-xs outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Telegram Instant Order Notification */}
        <div className="space-y-4 pt-4 border-t border-[#27272a]">
          <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
            <Send className="w-4 h-4 text-blue-400" />
            টেলিগ্রাম বটে তাৎক্ষণিক অর্ডার মেসেজ অ্যালার্ট
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Telegram Bot Token</label>
              <input
                type="text"
                value={form.telegramBotToken || ''}
                onChange={(e) => setForm({ ...form, telegramBotToken: e.target.value })}
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                className="w-full px-3.5 py-2 bg-[#121215] border border-[#27272a] text-white rounded-xl font-mono text-xs outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Telegram Chat ID / Channel ID</label>
              <input
                type="text"
                value={form.telegramChatId || ''}
                onChange={(e) => setForm({ ...form, telegramChatId: e.target.value })}
                placeholder="-100123456789"
                className="w-full px-3.5 py-2 bg-[#121215] border border-[#27272a] text-white rounded-xl font-mono text-xs outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSendTestTelegramAlert}
              className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>টেস্ট মেসেজ পাঠান</span>
            </button>
            {testTelegramStatus && <span className="text-xs font-bold text-zinc-300 font-mono">{testTelegramStatus}</span>}
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer transition-all"
        >
          সেটিংসমূহ সেভ করুন
        </button>
      </form>

      {/* Discount Coupon Code Manager */}
      <div className="bg-[#09090b] p-6 rounded-2xl border border-[#27272a] space-y-4">
        <h3 className="font-extrabold text-white text-base flex items-center gap-2">
          <Tag className="w-5 h-5 text-amber-400" />
          ডিসকাউন্ট কুপন কোড ম্যানেজার
        </h3>

        <form onSubmit={handleAddCouponSubmit} className="flex gap-2 max-w-lg">
          <input
            type="text"
            required
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="কুপন কোড (যেমন: SAVE100)"
            className="flex-1 px-3.5 py-2 bg-[#121215] border border-[#27272a] text-white rounded-xl text-xs font-mono font-bold uppercase outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            required
            value={discountVal}
            onChange={(e) => setDiscountVal(Number(e.target.value))}
            placeholder="ডিসকাউন্ট টাকা"
            className="w-28 px-3.5 py-2 bg-[#121215] border border-[#27272a] text-white rounded-xl text-xs font-mono font-bold outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            কুপন যোগ করুন
          </button>
        </form>

        <div className="divide-y divide-[#27272a] border border-[#27272a] rounded-xl overflow-hidden">
          {coupons.map((c) => (
            <div key={c.id} className="p-3 bg-[#121215] flex justify-between items-center text-xs">
              <div>
                <span className="font-mono font-black text-white bg-[#09090b] px-2 py-0.5 rounded border border-[#27272a]">
                  {c.code}
                </span>
                <span className="ml-2 font-mono font-bold text-emerald-400">৳{c.discountValue} ছাড়</span>
              </div>
              <button
                onClick={() => onDeleteCoupon(c.id)}
                className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
