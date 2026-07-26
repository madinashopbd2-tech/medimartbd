import React, { useState } from 'react';
import { 
  Eye, 
  Smartphone, 
  Monitor, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Palette, 
  Plus, 
  Trash2, 
  Save, 
  Code,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Film,
  CheckCircle2
} from 'lucide-react';
import { ProductData, StoreSettings } from '../../types';

interface CmsBuilderViewProps {
  product: ProductData;
  settings: StoreSettings;
  onSaveProduct: (updated: ProductData) => void;
  onSaveSettings: (updated: StoreSettings) => void;
}

const SECTION_LABELS: Record<string, string> = {
  hero: '1. হিরো সেকশন (Hero Banner & Price)',
  media: '2. মিডিয়া গ্যালারি ও ভিডিও প্লেয়ার',
  scarcity: '3. স্টক কাউন্টডাউন টাইমার (Scarcity)',
  features: '4. প্রোডাক্ট এর উপকারিতা (Features & Benefits)',
  specs: '5. টেকনিক্যাল স্পেসিফিকেশন টেবিল',
  howtouse: '6. ব্যবহার প্রণালী (How To Use)',
  reviews: '7. কাস্টমার রিভিউ ও ফটো রেটিং',
  faqs: '8. প্রশ্নোত্তর একর্ডিয়ন (FAQ)',
  checkout: '9. চেকআউট / ক্যাশ অন ডেলিভারি ফর্ম',
  footer: '10. ফুটপার ও পলিসি লিংക്‌স',
};

const THEME_PRESETS = [
  { name: 'Emerald (ইমারেল্ড গ্রিন)', primary: '#059669', accent: '#d97706' },
  { name: 'Royal Blue (রয়েল ব্লু)', primary: '#2563eb', accent: '#f59e0b' },
  { name: 'Crimson Red (লাল)', primary: '#dc2626', accent: '#f59e0b' },
  { name: 'Luxury Dark Gold (গোল্ডেন)', primary: '#b45309', accent: '#059669' },
  { name: 'Purple Violet (ভায়োলেট)', primary: '#7c3aed', accent: '#10b981' },
];

export const CmsBuilderView: React.FC<CmsBuilderViewProps> = ({
  product,
  settings,
  onSaveProduct,
  onSaveSettings,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'media' | 'benefits' | 'specs' | 'howToUse' | 'bundles' | 'footer' | 'theme' | 'sections' | 'code'>('content');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');

  // Local editable states
  const [productForm, setProductForm] = useState<ProductData>({ ...product });
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({ ...settings });
  const [isSavedToast, setIsSavedToast] = useState(false);

  // Section visibility toggles
  const handleToggleSection = (sectionKey: string) => {
    const updatedVis = {
      ...settingsForm.sectionVisibility,
      [sectionKey]: !settingsForm.sectionVisibility[sectionKey],
    };
    const updatedSettings = { ...settingsForm, sectionVisibility: updatedVis };
    setSettingsForm(updatedSettings);
    onSaveSettings(updatedSettings);
  };

  // Section reorder up/down
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...settingsForm.sectionOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;

    const updatedSettings = { ...settingsForm, sectionOrder: newOrder };
    setSettingsForm(updatedSettings);
    onSaveSettings(updatedSettings);
  };

  // Save product changes
  const handleSaveProductChanges = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProduct(productForm);
    onSaveSettings(settingsForm);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Save Confirmation Toast */}
      {isSavedToast && (
        <div className="fixed top-20 right-8 bg-emerald-500 text-slate-950 font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2 border border-emerald-400">
          <Check className="w-5 h-5" />
          <span>সকল পরিবর্তন সিএমএস-এ সফলভাবে সেভ হয়েছে!</span>
        </div>
      )}

      {/* Top Builder Control Bar */}
      <div className="bg-[#09090b] p-4 rounded-2xl border border-[#27272a] flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Subtab Switches */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'content', label: 'প্রোডাক্ট কন্টেন্ট' },
            { id: 'media', label: '📸 ছবি ও ভিডিও লিংক' },
            { id: 'benefits', label: '✨ প্রোডাক্ট এর উপকারিতা' },
            { id: 'specs', label: '⚙️ টেকনিক্যাল স্পেসিফিকেশন' },
            { id: 'howToUse', label: '🛠️ ব্যবহার বিধি (How To Use)' },
            { id: 'bundles', label: '📦 প্যাক সাইজ ও অফার' },
            { id: 'footer', label: '🦶 ফুটার সেকশন এডিটর' },
            { id: 'theme', label: 'কালার ও থিম প্রেসট' },
            { id: 'sections', label: 'সেকশন লেআউট ও অর্ডার' },
            { id: 'code', label: 'Custom CSS / JS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                activeSubTab === tab.id
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'bg-[#121215] border-[#27272a] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Viewport Device Toggle */}
        <div className="flex items-center gap-2 bg-[#121215] p-1 rounded-xl border border-[#27272a]">
          <button
            onClick={() => setViewportMode('desktop')}
            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewportMode === 'desktop' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-500'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>ডেস্কটপ</span>
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewportMode === 'mobile' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-500'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>মোবাইল</span>
          </button>
        </div>
      </div>

      {/* Main CMS Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Editor Controls */}
        <div className="lg:col-span-5 bg-[#09090b] p-6 rounded-2xl border border-[#27272a] space-y-6">
          <form onSubmit={handleSaveProductChanges} className="space-y-5">
            {activeSubTab === 'content' && (
              <div className="space-y-6">
                <div className="border-b border-[#27272a] pb-3 flex justify-between items-center">
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    সমস্ত লেখা ও কন্টেন্ট এডিটর (Page Text Customizer)
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-500/20">
                    ১০০% কাস্টমাইজেবল
                  </span>
                </div>

                {/* 1. Basic Product Info & Pricing */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    ১. প্রোডাক্ট প্রাইসিং ও ল্যান্ডিং হেডার
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">ওয়েবসাইট / ল্যান্ডিং প্রোডাক্ট টাইটেল</label>
                    <input
                      type="text"
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white font-bold outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">সাবটাইটেল / সংক্ষিপ্ত ক্যাচি বিবরণ</label>
                    <textarea
                      rows={2}
                      value={productForm.subtitle}
                      onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">রেগুলার প্রাইস (৳)</label>
                      <input
                        type="number"
                        value={productForm.regularPrice}
                        onChange={(e) => setProductForm({ ...productForm, regularPrice: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs font-mono text-zinc-300 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">অফার প্রাইস (৳)</label>
                      <input
                        type="number"
                        value={productForm.offerPrice}
                        onChange={(e) => setProductForm({ ...productForm, offerPrice: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs font-mono font-bold text-emerald-400 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">ডেলিভারি (ঢাকার ভেতরে ৳)</label>
                      <input
                        type="number"
                        value={settingsForm.deliveryFeeInside}
                        onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFeeInside: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs font-mono text-zinc-300 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">ডেলিভারি (ঢাকার বাইরে ৳)</label>
                      <input
                        type="number"
                        value={settingsForm.deliveryFeeOutside}
                        onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFeeOutside: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs font-mono text-zinc-300 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">স্টক পরিমাণ (Stock Left)</label>
                      <input
                        type="number"
                        value={productForm.stockQuantity}
                        onChange={(e) => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs font-mono font-bold text-rose-400 outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">ভিডিও লিংক (YouTube / MP4)</label>
                      <input
                        type="text"
                        value={productForm.videoUrl || ''}
                        onChange={(e) => setProductForm({ ...productForm, videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Hero Section Texts */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    ২. হিরো ব্যানার টেক্সট (Hero Banner Texts)
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">অফার প্রমোশন ব্যাজ টেক্সট</label>
                    <input
                      type="text"
                      value={productForm.customPromoBadgeText || ''}
                      onChange={(e) => setProductForm({ ...productForm, customPromoBadgeText: e.target.value })}
                      placeholder="🔥 আজকের বিশেষ অফারে {discount}% ছাড়! (স্টক সীমিত)"
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-amber-300 font-bold outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-zinc-500 mt-1 block">ছাড়ের শতাংশ দেখানোর জন্য &#123;discount&#125; লিখুন</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">স্টার রিভিউ ব্যাজ টেক্সট</label>
                      <input
                        type="text"
                        value={productForm.customRatingText || ''}
                        onChange={(e) => setProductForm({ ...productForm, customRatingText: e.target.value })}
                        placeholder="4.9 / 5.0 (২৮৪+ রিভিউ)"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">ডেলিভারি কাউন্ট ব্যাজ</label>
                      <input
                        type="text"
                        value={productForm.customDeliveryBadgeText || ''}
                        onChange={(e) => setProductForm({ ...productForm, customDeliveryBadgeText: e.target.value })}
                        placeholder="১২৫০+ সফল ডেলিভারি"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">অর্ডার বাটন (CTA) টেক্সট</label>
                    <input
                      type="text"
                      value={productForm.customCtaButtonText || ''}
                      onChange={(e) => setProductForm({ ...productForm, customCtaButtonText: e.target.value })}
                      placeholder="অর্ডার করতে ক্লিক করুন"
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs font-bold text-emerald-400 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">বাটনের নিচের সেফটি টেক্সট</label>
                    <input
                      type="text"
                      value={productForm.customTrustText || ''}
                      onChange={(e) => setProductForm({ ...productForm, customTrustText: e.target.value })}
                      placeholder="ক্যাশ অন ডেলিভারি: আগে প্রোডাক্ট দেখুন, তারপর টাকা দিন।"
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">ছবিতে স্টক অ্যালার্ট ব্যাজ টেক্সট</label>
                    <input
                      type="text"
                      value={productForm.customStockAlertText || ''}
                      onChange={(e) => setProductForm({ ...productForm, customStockAlertText: e.target.value })}
                      placeholder="স্টক সীমিত: মাত্র {stock} টি বাকি!"
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-rose-400 font-bold outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* 3. Media & Highlights Section Texts */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-3">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    ৩. মিডিয়া গ্যালারি ও হাইলাইটস (Media Texts)
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">গ্যালারি সাব-টাইটেল (Badge)</label>
                      <input
                        type="text"
                        value={productForm.mediaSectionBadge || ''}
                        onChange={(e) => setProductForm({ ...productForm, mediaSectionBadge: e.target.value })}
                        placeholder="প্রোডাক্ট ফটো ও ভিডিও গ্যালারি"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">গ্যালারি মেইন হেডিং</label>
                      <input
                        type="text"
                        value={productForm.mediaSectionTitle || ''}
                        onChange={(e) => setProductForm({ ...productForm, mediaSectionTitle: e.target.value })}
                        placeholder="আসল ছবি ও ভিডিও রিভিউ দেখুন"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white font-bold outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">হাইলাইটস বক্স হেডিং</label>
                    <input
                      type="text"
                      value={productForm.mediaHighlightsTitle || ''}
                      onChange={(e) => setProductForm({ ...productForm, mediaHighlightsTitle: e.target.value })}
                      placeholder="কেন আমাদের প্রোডাক্ট সেরা?"
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white font-bold outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400">৩টি মেইন বেনিফিট বুলেট পয়েন্ট</label>
                    <input
                      type="text"
                      value={productForm.mediaBullet1 || ''}
                      onChange={(e) => setProductForm({ ...productForm, mediaBullet1: e.target.value })}
                      placeholder="১০০% ছবি ও ভিডিওর সাথে হুবহু মিল থাকার নিশ্চিন্ত নিশ্চয়তা।"
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-sky-500"
                    />
                    <input
                      type="text"
                      value={productForm.mediaBullet2 || ''}
                      onChange={(e) => setProductForm({ ...productForm, mediaBullet2: e.target.value })}
                      placeholder="উন্নত মেটেরিয়াল এবং লং-লাস্টিং ডিউরেবিলিটি টেস্ট সম্পন্ন।"
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-sky-500"
                    />
                    <input
                      type="text"
                      value={productForm.mediaBullet3 || ''}
                      onChange={(e) => setProductForm({ ...productForm, mediaBullet3: e.target.value })}
                      placeholder="কুরিয়ারম্যানের সামনে প্রোডাক্ট খুলে দেখে মূল্য পরিশোধের সুযোগ।"
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* 4. Features Section & Items Editor */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    ৪. ফিচার সেকশন ও আইটেমসমূহ (Features Grid)
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">ফিচার সেকশন ব্যাজ</label>
                      <input
                        type="text"
                        value={productForm.featuresSectionBadge || ''}
                        onChange={(e) => setProductForm({ ...productForm, featuresSectionBadge: e.target.value })}
                        placeholder="প্রিমিয়াম ফিচারসমূহ"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">ফিচার সেকশন হেডিং</label>
                      <input
                        type="text"
                        value={productForm.featuresSectionTitle || ''}
                        onChange={(e) => setProductForm({ ...productForm, featuresSectionTitle: e.target.value })}
                        placeholder="কেন এই স্মার্টওয়াচটি আপনার জন্য সেরা পছন্দ?"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white font-bold outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">ফিচার সেকশন বিবরণ (Subtitle)</label>
                    <input
                      type="text"
                      value={productForm.featuresSectionDesc || ''}
                      onChange={(e) => setProductForm({ ...productForm, featuresSectionDesc: e.target.value })}
                      placeholder="দৈনন্দিন ব্যবহারের জন্য আধুনিক প্রযুক্তি ও প্রিমিয়াম ডিজাইনের অসাধারণ সমন্বয়।"
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Feature Items List Editor */}
                  <div className="space-y-2.5 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-zinc-300">ফিচার কার্ডের তালিকা ({productForm.features.length})</label>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedFeats = [
                            ...productForm.features,
                            { icon: 'Sparkles', title: 'নতুন ফিচার টাইটেল', desc: 'ফিচারের বিস্তারিত বিবরণ এখানে লিখুন' },
                          ];
                          setProductForm({ ...productForm, features: updatedFeats });
                        }}
                        className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] rounded-lg hover:bg-emerald-500/30 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> ফিচার যোগ করুন
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {productForm.features.map((feat, fIdx) => (
                        <div key={fIdx} className="p-3 bg-[#09090b] rounded-xl border border-[#27272a] space-y-2 relative">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={feat.title}
                              onChange={(e) => {
                                const newFeats = [...productForm.features];
                                newFeats[fIdx].title = e.target.value;
                                setProductForm({ ...productForm, features: newFeats });
                              }}
                              placeholder="ফিচার টাইটেল"
                              className="flex-1 px-2.5 py-1.5 bg-[#121215] rounded-lg border border-[#27272a] text-xs font-bold text-white outline-none focus:border-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newFeats = productForm.features.filter((_, i) => i !== fIdx);
                                setProductForm({ ...productForm, features: newFeats });
                              }}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={feat.desc}
                            onChange={(e) => {
                              const newFeats = [...productForm.features];
                              newFeats[fIdx].desc = e.target.value;
                              setProductForm({ ...productForm, features: newFeats });
                            }}
                            placeholder="ফিচার বিবরণ"
                            className="w-full px-2.5 py-1.5 bg-[#121215] rounded-lg border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-emerald-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>





                {/* 7. Checkout Form Texts */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    ৭. চেকআউট ফর্ম টেক্সটসমূহ (Checkout Form Texts)
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">ফর্ম হেডার টাইটেল</label>
                    <input
                      type="text"
                      value={productForm.orderFormTitle || ''}
                      onChange={(e) => setProductForm({ ...productForm, orderFormTitle: e.target.value })}
                      placeholder="ক্যাশ অন ডেলিভারিতে অর্ডার করুন"
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white font-bold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">ফর্ম সাব-টাইটেল / নির্দেশিকা</label>
                    <input
                      type="text"
                      value={productForm.orderFormSubtitle || ''}
                      onChange={(e) => setProductForm({ ...productForm, orderFormSubtitle: e.target.value })}
                      placeholder="পণ্য হাতে পেয়ে টাকা পরিশোধ করুন (১০০% নিরাপদ)"
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">ডিসকাউন্ট ব্যাজ টেক্সট</label>
                      <input
                        type="text"
                        value={productForm.orderFormBadgeText || ''}
                        onChange={(e) => setProductForm({ ...productForm, orderFormBadgeText: e.target.value })}
                        placeholder="Cash On Delivery"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-amber-300 font-bold outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">সাবমিট বাটন টেক্সট</label>
                      <input
                        type="text"
                        value={productForm.orderFormButtonText || ''}
                        onChange={(e) => setProductForm({ ...productForm, orderFormButtonText: e.target.value })}
                        placeholder="অর্ডার কনফার্ম করুন (৳{totalAmount})"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-emerald-400 font-bold outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 8. Footer & Helpline Contacts */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    ৮. ফুটপার ও হেল্পলাইন কন্টাক্ট (Footer Texts)
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">ফুটার শপ বিবরণ</label>
                    <textarea
                      rows={2}
                      value={settingsForm.footerDescription || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerDescription: e.target.value })}
                      placeholder="বাংলাদেশের বিশ্বস্ত ক্যাশ অন ডেলিভারি ই-কমার্স শপ। প্রিমিয়াম কোয়ালিটি ও দ্রুততম হোম ডেলিভারি সেবা।"
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-slate-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">হেল্পলাইন ফোন নম্বর</label>
                      <input
                        type="text"
                        value={settingsForm.helplinePhone || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, helplinePhone: e.target.value })}
                        placeholder="+880 1700-000000"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">সাপোর্ট ইমেইল</label>
                      <input
                        type="text"
                        value={settingsForm.helplineEmail || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, helplineEmail: e.target.value })}
                        placeholder="support@codstorebd.com"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'media' && (
              <div className="space-y-6">
                <div className="border-b border-[#27272a] pb-3 flex justify-between items-center">
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                    প্রোডাক্ট ফটো ও ভিডিও চেঞ্জার (Photo & Video Link Manager)
                  </h3>
                  <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2.5 py-1 rounded-full font-bold border border-sky-500/20">
                    ইনস্ট্যান্ট লাইভ আপডেট
                  </span>
                </div>

                {/* 1. PRODUCT IMAGES LIST */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-sky-400" />
                        ১. প্রোডাক্ট ছবি লিংকসমূহ ({productForm.images.length} টি ছবি)
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        প্রোডাক্টের যেকোনো ছবি URL লিংক দিন। ১ম লিংকটি ল্যান্ডিং পেজের মেইন হিরো ছবি হিসেবে থাকবে।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedImages = [
                          ...productForm.images,
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
                        ];
                        const updated = { ...productForm, images: updatedImages };
                        setProductForm(updated);
                        onSaveProduct(updated);
                      }}
                      className="px-3 py-1.5 bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold text-xs rounded-xl hover:bg-sky-500/30 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" /> নতুন ছবি লিংক
                    </button>
                  </div>

                  <div className="space-y-3">
                    {productForm.images.map((imgUrl, imgIdx) => (
                      <div key={imgIdx} className="p-3 bg-[#09090b] rounded-xl border border-[#27272a] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {imgIdx === 0 ? '⭐ মেইন হিরো ছবি (Primary Photo)' : `ছবি #${imgIdx + 1}`}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={imgIdx === 0}
                              onClick={() => {
                                const newImgs = [...productForm.images];
                                const temp = newImgs[imgIdx];
                                newImgs[imgIdx] = newImgs[imgIdx - 1];
                                newImgs[imgIdx - 1] = temp;
                                const updated = { ...productForm, images: newImgs };
                                setProductForm(updated);
                                onSaveProduct(updated);
                              }}
                              className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                              title="উপরে নিন"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={imgIdx === productForm.images.length - 1}
                              onClick={() => {
                                const newImgs = [...productForm.images];
                                const temp = newImgs[imgIdx];
                                newImgs[imgIdx] = newImgs[imgIdx + 1];
                                newImgs[imgIdx + 1] = temp;
                                const updated = { ...productForm, images: newImgs };
                                setProductForm(updated);
                                onSaveProduct(updated);
                              }}
                              className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                              title="নিচে নিন"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={productForm.images.length <= 1}
                              onClick={() => {
                                const newImgs = productForm.images.filter((_, i) => i !== imgIdx);
                                const updated = { ...productForm, images: newImgs };
                                setProductForm(updated);
                                onSaveProduct(updated);
                              }}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer disabled:opacity-20"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-900 border border-[#27272a] shrink-0 relative group">
                            <img
                              src={imgUrl}
                              alt={`Preview ${imgIdx + 1}`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>

                          <div className="flex-1">
                            <input
                              type="text"
                              value={imgUrl}
                              onChange={(e) => {
                                const newImgs = [...productForm.images];
                                newImgs[imgIdx] = e.target.value;
                                const updated = { ...productForm, images: newImgs };
                                setProductForm(updated);
                                onSaveProduct(updated);
                              }}
                              placeholder="https://example.com/photo.jpg"
                              className="w-full px-3 py-2 bg-[#121215] rounded-xl border border-[#27272a] text-xs font-mono text-white outline-none focus:border-sky-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. PRODUCT VIDEO LINK */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-amber-400" />
                      ২. প্রোডাক্ট ভিডিও লিংক (YouTube / MP4 Video URL)
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      ইউটিউব ভিডিও লিংক (যেমন: https://www.youtube.com/watch?v=... বা https://youtu.be/...) অথবা ডাইরেক্ট .mp4 লিংক বসান।
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">ভিডিও রিভিউ লিংক (URL)</label>
                      <input
                        type="text"
                        value={productForm.videoUrl || ''}
                        onChange={(e) => {
                          const updated = { ...productForm, videoUrl: e.target.value };
                          setProductForm(updated);
                          onSaveProduct(updated);
                        }}
                        placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        className="w-full px-3.5 py-2.5 bg-[#09090b] rounded-xl border border-[#27272a] text-xs font-mono text-amber-300 outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Video Player Preview Box in Admin */}
                    {productForm.videoUrl && (
                      <div className="p-3 bg-[#09090b] rounded-xl border border-[#27272a] space-y-2">
                        <span className="text-[10px] font-bold text-zinc-400 block">ভিডিও লাইভ প্রিভিউ (Test):</span>
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border border-[#27272a] relative">
                          {productForm.videoUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) ? (
                            <video src={productForm.videoUrl} controls className="w-full h-full object-contain" />
                          ) : (
                            <iframe
                              src={
                                productForm.videoUrl.includes('youtu.be/')
                                  ? `https://www.youtube.com/embed/${productForm.videoUrl.split('youtu.be/')[1]?.split('?')[0]}?rel=0`
                                  : productForm.videoUrl.includes('watch?v=')
                                  ? `https://www.youtube.com/embed/${productForm.videoUrl.split('watch?v=')[1]?.split('&')[0]}?rel=0`
                                  : productForm.videoUrl
                              }
                              title="Video Preview"
                              className="w-full h-full border-0"
                              allowFullScreen
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'benefits' && (
              <div className="space-y-6">
                <div className="border-b border-[#27272a] pb-3 flex justify-between items-center">
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    প্রোডাক্ট এর উপকারিতা এডিটর (Features & Benefits Manager)
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-500/20">
                    ইনস্ট্যান্ট লাইভ আপডেট
                  </span>
                </div>

                {/* 1. Section Title & Header Texts */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    ১. সেকশন টাইটেল ও হেডার টেক্সট
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">সেকশন ব্যাজ টেক্সট (Badge Text)</label>
                      <input
                        type="text"
                        value={productForm.featuresSectionBadge || ''}
                        onChange={(e) => {
                          const updated = { ...productForm, featuresSectionBadge: e.target.value };
                          setProductForm(updated);
                          onSaveProduct(updated);
                        }}
                        placeholder="প্রোডাক্ট এর উপকারিতা"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-emerald-400 font-bold outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">মেইন হেডিং (Main Heading)</label>
                      <input
                        type="text"
                        value={productForm.featuresSectionTitle || ''}
                        onChange={(e) => {
                          const updated = { ...productForm, featuresSectionTitle: e.target.value };
                          setProductForm(updated);
                          onSaveProduct(updated);
                        }}
                        placeholder="কেন এই স্মার্টওয়াচটি আপনার জন্য সেরা পছন্দ?"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white font-extrabold outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">সেকশন সাবটাইটেল / সংক্ষিপ্ত বিবরণ (Subtitle)</label>
                    <textarea
                      rows={2}
                      value={productForm.featuresSectionDesc || ''}
                      onChange={(e) => {
                        const updated = { ...productForm, featuresSectionDesc: e.target.value };
                        setProductForm(updated);
                        onSaveProduct(updated);
                      }}
                      placeholder="দৈনন্দিন ব্যবহারের জন্য আধুনিক প্রযুক্তি ও প্রিমিয়াম ডিজাইনের অসাধারণ সমন্বয়।"
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* 2. Benefit Cards List */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        ২. উপকারিতা / ফিচার কার্ডসমূহ ({productForm.features.length} টি)
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        প্রতিটি কার্ডে আইকন, টাইটেল ও বিস্তারিত বিবরণ দিয়ে এডিট করুন।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedFeats = [
                          ...productForm.features,
                          { icon: 'Sparkles', title: 'নতুন উপকারিতা / ফিচার', desc: 'এখানে আপনার প্রোডাক্টের নতুন ফিচার বা উপকারিতার বিবরণ লিখুন।' }
                        ];
                        const updated = { ...productForm, features: updatedFeats };
                        setProductForm(updated);
                        onSaveProduct(updated);
                      }}
                      className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs rounded-xl hover:bg-amber-500/30 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" /> নতুন কার্ড যোগ করুন
                    </button>
                  </div>

                  <div className="space-y-3">
                    {productForm.features.map((feat, fIdx) => (
                      <div key={fIdx} className="p-3.5 bg-[#09090b] rounded-xl border border-[#27272a] space-y-3 relative">
                        <div className="flex items-center justify-between gap-2 border-b border-[#1f1f23] pb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                            কার্ড #{fIdx + 1}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={fIdx === 0}
                              onClick={() => {
                                const newFeats = [...productForm.features];
                                const temp = newFeats[fIdx];
                                newFeats[fIdx] = newFeats[fIdx - 1];
                                newFeats[fIdx - 1] = temp;
                                const updated = { ...productForm, features: newFeats };
                                setProductForm(updated);
                                onSaveProduct(updated);
                              }}
                              className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                              title="উপরে নিন"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={fIdx === productForm.features.length - 1}
                              onClick={() => {
                                const newFeats = [...productForm.features];
                                const temp = newFeats[fIdx];
                                newFeats[fIdx] = newFeats[fIdx + 1];
                                newFeats[fIdx + 1] = temp;
                                const updated = { ...productForm, features: newFeats };
                                setProductForm(updated);
                                onSaveProduct(updated);
                              }}
                              className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                              title="নিচে নিন"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={productForm.features.length <= 1}
                              onClick={() => {
                                const newFeats = productForm.features.filter((_, i) => i !== fIdx);
                                const updated = { ...productForm, features: newFeats };
                                setProductForm(updated);
                                onSaveProduct(updated);
                              }}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer disabled:opacity-20"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-zinc-400 mb-1">আইকন নির্বাচন (Icon)</label>
                            <select
                              value={feat.icon || 'Sparkles'}
                              onChange={(e) => {
                                const newFeats = [...productForm.features];
                                newFeats[fIdx] = { ...newFeats[fIdx], icon: e.target.value };
                                const updated = { ...productForm, features: newFeats };
                                setProductForm(updated);
                                onSaveProduct(updated);
                              }}
                              className="w-full px-3 py-2 bg-[#121215] rounded-xl border border-[#27272a] text-xs text-emerald-400 font-bold outline-none focus:border-emerald-500 cursor-pointer"
                            >
                              <option value="Watch">⌚ স্মার্টওয়াচ (Watch)</option>
                              <option value="HeartPulse">❤️ হার্টরেট / হেলথ (HeartPulse)</option>
                              <option value="ShieldCheck">🛡️ ওয়াটারপ্রুফ / নিরাপত্তা (ShieldCheck)</option>
                              <option value="BatteryCharging">🔋 ব্যাটারি ব্যাকআপ (BatteryCharging)</option>
                              <option value="Sparkles">✨ স্পেশাল ফিচার (Sparkles)</option>
                              <option value="CheckCircle2">✅ গ্যারান্টি (CheckCircle2)</option>
                              <option value="Star">⭐ স্টার রেটিং (Star)</option>
                              <option value="Zap">⚡ দ্রুত গতি (Zap)</option>
                              <option value="Award">🏆 প্রিমিয়াম কোয়ালিটি (Award)</option>
                              <option value="Gift">🎁 বিশেষ উপহার (Gift)</option>
                              <option value="Truck">🚚 দ্রুত ডেলিভারি (Truck)</option>
                              <option value="ThumbsUp">👍 সেরা পছন্দ (ThumbsUp)</option>
                              <option value="Flame">🔥 হট অফার (Flame)</option>
                              <option value="Activity">📈 একটিভিটি (Activity)</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-zinc-400 mb-1">উপকারিতার নাম (Card Title)</label>
                            <input
                              type="text"
                              value={feat.title}
                              onChange={(e) => {
                                const newFeats = [...productForm.features];
                                newFeats[fIdx] = { ...newFeats[fIdx], title: e.target.value };
                                const updated = { ...productForm, features: newFeats };
                                setProductForm(updated);
                                onSaveProduct(updated);
                              }}
                              placeholder="উপকারিতার শিরোনাম"
                              className="w-full px-3 py-2 bg-[#121215] rounded-xl border border-[#27272a] text-xs font-bold text-white outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 mb-1">বিস্তারিত বর্ণনা (Description)</label>
                          <textarea
                            rows={2}
                            value={feat.desc}
                            onChange={(e) => {
                              const newFeats = [...productForm.features];
                              newFeats[fIdx] = { ...newFeats[fIdx], desc: e.target.value };
                              const updated = { ...productForm, features: newFeats };
                              setProductForm(updated);
                              onSaveProduct(updated);
                            }}
                            placeholder="উপকারিতার বিস্তারিত তথ্য লিখুন..."
                            className="w-full px-3 py-2 bg-[#121215] rounded-xl border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'specs' && (
              <div className="space-y-6">
                <div className="border-b border-[#27272a] pb-3 flex justify-between items-center">
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                    ⚙️ টেকনিক্যাল স্পেসিফিকেশন এডিটর
                  </h3>
                </div>
                {/* 5. Specifications Table Editor */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">স্পেক্স সেকশন ব্যাজ</label>
                      <input
                        type="text"
                        value={productForm.specsSectionBadge || ''}
                        onChange={(e) => setProductForm({ ...productForm, specsSectionBadge: e.target.value })}
                        placeholder="স্পেসিফিকেশন"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">স্পেক্স সেকশন হেডিং</label>
                      <input
                        type="text"
                        value={productForm.specsSectionTitle || ''}
                        onChange={(e) => setProductForm({ ...productForm, specsSectionTitle: e.target.value })}
                        placeholder="প্রোডাক্টের টেকনিক্যাল তথ্যসমূহ"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white font-bold outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Specs List */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-zinc-300">স্পেক্স টেবিল তথ্য ({productForm.specifications.length})</label>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedSpecs = [
                            ...productForm.specifications,
                            { key: 'নতুন বৈশিষ্ট্য', value: 'মান / বিবরণ' },
                          ];
                          setProductForm({ ...productForm, specifications: updatedSpecs });
                        }}
                        className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[11px] rounded-lg hover:bg-amber-500/30 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> স্পেক্স যোগ করুন
                      </button>
                    </div>

                    <div className="space-y-2 overflow-y-auto pr-1">
                      {productForm.specifications.map((spec, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 bg-[#09090b] p-2 rounded-xl border border-[#27272a]">
                          <input
                            type="text"
                            value={spec.key}
                            onChange={(e) => {
                              const newSpecs = [...productForm.specifications];
                              newSpecs[sIdx].key = e.target.value;
                              setProductForm({ ...productForm, specifications: newSpecs });
                            }}
                            placeholder="বৈশিষ্ট্য (যেমন: ব্যাটারি)"
                            className="w-1/2 px-2.5 py-1.5 bg-[#121215] rounded-lg border border-[#27272a] text-xs font-bold text-white outline-none focus:border-amber-500"
                          />
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) => {
                              const newSpecs = [...productForm.specifications];
                              newSpecs[sIdx].value = e.target.value;
                              setProductForm({ ...productForm, specifications: newSpecs });
                            }}
                            placeholder="মান (যেমন: 280mAh)"
                            className="w-1/2 px-2.5 py-1.5 bg-[#121215] rounded-lg border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newSpecs = productForm.specifications.filter((_, i) => i !== sIdx);
                              setProductForm({ ...productForm, specifications: newSpecs });
                            }}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'howToUse' && (
              <div className="space-y-6">
                <div className="border-b border-[#27272a] pb-3 flex justify-between items-center">
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                    🛠️ ব্যবহার বিধি (How To Use)
                  </h3>
                </div>

                {/* How To Use Steps Editor */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">স্টেপস সেকশন ব্যাজ</label>
                      <input
                        type="text"
                        value={productForm.howToUseSectionBadge || ''}
                        onChange={(e) => setProductForm({ ...productForm, howToUseSectionBadge: e.target.value })}
                        placeholder="সহজ ৩ ধাপ"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">স্টেপস সেকশন হেডিং</label>
                      <input
                        type="text"
                        value={productForm.howToUseSectionTitle || ''}
                        onChange={(e) => setProductForm({ ...productForm, howToUseSectionTitle: e.target.value })}
                        placeholder="স্মার্টওয়াচটি যেভাবে ব্যবহার করবেন"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white font-bold outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Steps List */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-zinc-300">ব্যবহার বিধি ধাপসমূহ ({productForm.howToUseSteps.length})</label>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedSteps = [
                            ...productForm.howToUseSteps,
                            { step: productForm.howToUseSteps.length + 1, title: 'নতুন ধাপ টাইটেল', desc: 'ধাপের বিস্তারিত বিবরণ' },
                          ];
                          setProductForm({ ...productForm, howToUseSteps: updatedSteps });
                        }}
                        className="px-2.5 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold text-[11px] rounded-lg hover:bg-purple-500/30 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> ধাপ যোগ করুন
                      </button>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {productForm.howToUseSteps.map((st, stIdx) => (
                        <div key={stIdx} className="p-3 bg-[#09090b] rounded-xl border border-[#27272a] space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              ধাপ {st.step}
                            </span>
                            <input
                              type="text"
                              value={st.title}
                              onChange={(e) => {
                                const newSteps = [...productForm.howToUseSteps];
                                newSteps[stIdx].title = e.target.value;
                                setProductForm({ ...productForm, howToUseSteps: newSteps });
                              }}
                              placeholder="ধাপের টাইটেল"
                              className="flex-1 px-2.5 py-1.5 bg-[#121215] rounded-lg border border-[#27272a] text-xs font-bold text-white outline-none focus:border-purple-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newSteps = productForm.howToUseSteps.filter((_, i) => i !== stIdx);
                                setProductForm({ ...productForm, howToUseSteps: newSteps });
                              }}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={st.desc}
                            onChange={(e) => {
                              const newSteps = [...productForm.howToUseSteps];
                              newSteps[stIdx].desc = e.target.value;
                              setProductForm({ ...productForm, howToUseSteps: newSteps });
                            }}
                            placeholder="ধাপের বিবরণ"
                            className="w-full px-2.5 py-1.5 bg-[#121215] rounded-lg border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-purple-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'bundles' && (
              <div className="space-y-6">
                <div className="border-b border-[#27272a] pb-3 flex justify-between items-center">
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                    📦 প্যাক সাইজ ও অফার এডিটর
                  </h3>
                </div>

                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-zinc-300">প্যাকেজ সমূহ ({productForm.bundles?.length || 0})</label>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedBundles = [
                          ...(productForm.bundles || []),
                          { quantity: 1, title: 'নতুন প্যাক', savingsText: 'অফার', pricePerUnit: 1000 },
                        ];
                        setProductForm({ ...productForm, bundles: updatedBundles });
                      }}
                      className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[11px] rounded-lg hover:bg-amber-500/30 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> প্যাক যোগ করুন
                    </button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {(productForm.bundles || []).map((bundle, bIdx) => (
                      <div key={bIdx} className="p-3 bg-[#09090b] rounded-xl border border-[#27272a] space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => {
                            const newBundles = productForm.bundles?.filter((_, i) => i !== bIdx);
                            setProductForm({ ...productForm, bundles: newBundles });
                          }}
                          className="absolute top-2 right-2 p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="grid grid-cols-2 gap-3 pr-8">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">প্যাক টাইটেল</label>
                            <input
                              type="text"
                              value={bundle.title}
                              onChange={(e) => {
                                const newBundles = [...(productForm.bundles || [])];
                                newBundles[bIdx].title = e.target.value;
                                setProductForm({ ...productForm, bundles: newBundles });
                              }}
                              placeholder="যেমন: ১ টি পিস"
                              className="w-full px-2.5 py-1.5 bg-[#121215] rounded-lg border border-[#27272a] text-xs font-bold text-white outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">পরিমাণ (Quantity)</label>
                            <input
                              type="number"
                              value={bundle.quantity}
                              onChange={(e) => {
                                const newBundles = [...(productForm.bundles || [])];
                                newBundles[bIdx].quantity = Number(e.target.value);
                                setProductForm({ ...productForm, bundles: newBundles });
                              }}
                              className="w-full px-2.5 py-1.5 bg-[#121215] rounded-lg border border-[#27272a] text-xs font-mono text-zinc-300 outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">সেভিংস টেক্সট / অফার</label>
                            <input
                              type="text"
                              value={bundle.savingsText}
                              onChange={(e) => {
                                const newBundles = [...(productForm.bundles || [])];
                                newBundles[bIdx].savingsText = e.target.value;
                                setProductForm({ ...productForm, bundles: newBundles });
                              }}
                              placeholder="যেমন: নিয়মিত প্রাইস"
                              className="w-full px-2.5 py-1.5 bg-[#121215] rounded-lg border border-[#27272a] text-xs font-bold text-emerald-400 outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">প্রতি পিস দাম (৳)</label>
                            <input
                              type="number"
                              value={bundle.pricePerUnit}
                              onChange={(e) => {
                                const newBundles = [...(productForm.bundles || [])];
                                newBundles[bIdx].pricePerUnit = Number(e.target.value);
                                setProductForm({ ...productForm, bundles: newBundles });
                              }}
                              className="w-full px-2.5 py-1.5 bg-[#121215] rounded-lg border border-[#27272a] text-xs font-mono text-zinc-300 outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'footer' && (
              <div className="space-y-6">
                <div className="border-b border-[#27272a] pb-3 flex justify-between items-center">
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    ফুটার সেকশন কাস্টমাইজেশন (Footer Manager)
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-500/20">
                    ইনস্ট্যান্ট লাইভ আপডেট
                  </span>
                </div>

                {/* 1. Brand & Shop Description */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    ১. শপ ব্র্যান্ডিং ও ডেসক্রিপশন
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">সাইট / শপের নাম (Brand Title)</label>
                      <input
                        type="text"
                        value={settingsForm.siteTitle || ''}
                        onChange={(e) => {
                          const updated = { ...settingsForm, siteTitle: e.target.value };
                          setSettingsForm(updated);
                          onSaveSettings(updated);
                        }}
                        placeholder="অরিজিনাল আল্ট্রা ৯ প্রমোশনাল অফার"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">ফুটার শপ শর্ট বিবরণ (Footer Shop Description)</label>
                      <textarea
                        rows={2}
                        value={settingsForm.footerDescription || ''}
                        onChange={(e) => {
                          const updated = { ...settingsForm, footerDescription: e.target.value };
                          setSettingsForm(updated);
                          onSaveSettings(updated);
                        }}
                        placeholder="বাংলাদেশের বিশ্বস্ত ক্যাশ অন ডেলিভারি ই-কমার্স শপ। প্রিমিয়াম কোয়ালিটি ও দ্রুততম হোম ডেলিভারি সেবা।"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Helpline & Contacts */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-3">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    ২. যোগাযোগ ও হেল্পলাইন কন্টাক্ট
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">সেকশন হেডিং</label>
                      <input
                        type="text"
                        value={settingsForm.footerContactTitle || ''}
                        onChange={(e) => {
                          const updated = { ...settingsForm, footerContactTitle: e.target.value };
                          setSettingsForm(updated);
                          onSaveSettings(updated);
                        }}
                        placeholder="যোগাযোগ করুন"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">হেল্পলাইন ফোন নম্বর</label>
                      <input
                        type="text"
                        value={settingsForm.helplinePhone || ''}
                        onChange={(e) => {
                          const updated = { ...settingsForm, helplinePhone: e.target.value };
                          setSettingsForm(updated);
                          onSaveSettings(updated);
                        }}
                        placeholder="+880 1700-000000"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-emerald-400 font-bold outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">সাপোর্ট ইমেইল</label>
                      <input
                        type="text"
                        value={settingsForm.helplineEmail || ''}
                        onChange={(e) => {
                          const updated = { ...settingsForm, helplineEmail: e.target.value };
                          setSettingsForm(updated);
                          onSaveSettings(updated);
                        }}
                        placeholder="support@codstorebd.com"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-amber-300 font-bold outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Quick Links & Policy Modals */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-4">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    ৩. গুরুত্বপূর্ণ লিংকসমূহ ও পলিসি টেক্সট কাস্টমাইজেশন
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">লিংকসমূহ সেকশন হেডিং</label>
                    <input
                      type="text"
                      value={settingsForm.footerQuickLinksTitle || ''}
                      onChange={(e) => {
                        const updated = { ...settingsForm, footerQuickLinksTitle: e.target.value };
                        setSettingsForm(updated);
                        onSaveSettings(updated);
                      }}
                      placeholder="গুরুত্বপূর্ণ লিংকসমূহ"
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Policy 1: Return */}
                  <div className="p-3 bg-[#09090b] rounded-xl border border-[#27272a] space-y-2">
                    <label className="block text-xs font-bold text-purple-300">১. রিটার্ন ও রিফান্ড পলিসি</label>
                    <input
                      type="text"
                      value={settingsForm.footerReturnPolicyTitle || ''}
                      onChange={(e) => {
                        const updated = { ...settingsForm, footerReturnPolicyTitle: e.target.value };
                        setSettingsForm(updated);
                        onSaveSettings(updated);
                      }}
                      placeholder="রিটার্ন ও রিফান্ড পলিসি"
                      className="w-full px-3 py-1.5 bg-[#121215] rounded-lg border border-[#27272a] text-xs text-white outline-none focus:border-purple-500"
                    />
                    <textarea
                      rows={3}
                      value={settingsForm.footerReturnPolicyContent || ''}
                      onChange={(e) => {
                        const updated = { ...settingsForm, footerReturnPolicyContent: e.target.value };
                        setSettingsForm(updated);
                        onSaveSettings(updated);
                      }}
                      placeholder="১. প্রোডাক্ট কুরিয়ারম্যানের সামনে খোলা এবং চেক করার সুযোগ থাকবে।&#10;২. প্রোডাক্টে কোনো ত্রুটি থাকলে তাৎক্ষণিক ফেরত দিন।"
                      className="w-full px-3 py-2 bg-[#121215] rounded-lg border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Policy 2: Privacy */}
                  <div className="p-3 bg-[#09090b] rounded-xl border border-[#27272a] space-y-2">
                    <label className="block text-xs font-bold text-purple-300">২. প্রাইভেসি পলিসি</label>
                    <input
                      type="text"
                      value={settingsForm.footerPrivacyPolicyTitle || ''}
                      onChange={(e) => {
                        const updated = { ...settingsForm, footerPrivacyPolicyTitle: e.target.value };
                        setSettingsForm(updated);
                        onSaveSettings(updated);
                      }}
                      placeholder="প্রাইভেসি পলিসি"
                      className="w-full px-3 py-1.5 bg-[#121215] rounded-lg border border-[#27272a] text-xs text-white outline-none focus:border-purple-500"
                    />
                    <textarea
                      rows={3}
                      value={settingsForm.footerPrivacyPolicyContent || ''}
                      onChange={(e) => {
                        const updated = { ...settingsForm, footerPrivacyPolicyContent: e.target.value };
                        setSettingsForm(updated);
                        onSaveSettings(updated);
                      }}
                      placeholder="১. গ্রাহকদের সকল ব্যক্তিগত তথ্য সম্পূর্ণ সুরক্ষিত রাখা হয়।&#10;২. তথ্য ৩য় পক্ষের সাথে শেয়ার করা হবে না।"
                      className="w-full px-3 py-2 bg-[#121215] rounded-lg border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Policy 3: Terms */}
                  <div className="p-3 bg-[#09090b] rounded-xl border border-[#27272a] space-y-2">
                    <label className="block text-xs font-bold text-purple-300">৩. টার্মস ও কন্ডিশনস</label>
                    <input
                      type="text"
                      value={settingsForm.footerTermsTitle || ''}
                      onChange={(e) => {
                        const updated = { ...settingsForm, footerTermsTitle: e.target.value };
                        setSettingsForm(updated);
                        onSaveSettings(updated);
                      }}
                      placeholder="টার্মস ও কন্ডিশনস"
                      className="w-full px-3 py-1.5 bg-[#121215] rounded-lg border border-[#27272a] text-xs text-white outline-none focus:border-purple-500"
                    />
                    <textarea
                      rows={3}
                      value={settingsForm.footerTermsContent || ''}
                      onChange={(e) => {
                        const updated = { ...settingsForm, footerTermsContent: e.target.value };
                        setSettingsForm(updated);
                        onSaveSettings(updated);
                      }}
                      placeholder="১. ক্যাশ অন ডেলিভারিতে অর্ডারের ক্ষেত্রে ডেলিভারি চার্জ প্রযোজ্য।&#10;২. ফেক অর্ডার করলে ব্যবস্থা নেওয়া হবে।"
                      className="w-full px-3 py-2 bg-[#121215] rounded-lg border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* 4. Trust Badges */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    ৪. নিরাপদ শপিং ব্যাজ (Trust Badge)
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">ব্যাজ বক্স হেডিং</label>
                      <input
                        type="text"
                        value={settingsForm.footerTrustTitle || ''}
                        onChange={(e) => {
                          const updated = { ...settingsForm, footerTrustTitle: e.target.value };
                          setSettingsForm(updated);
                          onSaveSettings(updated);
                        }}
                        placeholder="নিরাপদ শপিং"
                        className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-1">ব্যাজ মেইন টাইটেল</label>
                        <input
                          type="text"
                          value={settingsForm.footerTrustBadgeTitle || ''}
                          onChange={(e) => {
                            const updated = { ...settingsForm, footerTrustBadgeTitle: e.target.value };
                            setSettingsForm(updated);
                            onSaveSettings(updated);
                          }}
                          placeholder="১০০% ক্যাশ অন ডেলিভারি"
                          className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-emerald-400 font-bold outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-1">ব্যাজ সাবটাইটেল / নোটিশ</label>
                        <input
                          type="text"
                          value={settingsForm.footerTrustBadgeDesc || ''}
                          onChange={(e) => {
                            const updated = { ...settingsForm, footerTrustBadgeDesc: e.target.value };
                            setSettingsForm(updated);
                            onSaveSettings(updated);
                          }}
                          placeholder="প্রোডাক্ট হাতে পাওয়ার পর মূল্য পরিশোধ করুন।"
                          className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Copyright Bar */}
                <div className="bg-[#121215] p-4 rounded-xl border border-[#27272a] space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    ৫. ফুটার কপিরাইট টেক্সট (Copyright Notice)
                  </h4>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">কপিরাইট লাইন</label>
                    <input
                      type="text"
                      value={settingsForm.footerCopyright || ''}
                      onChange={(e) => {
                        const updated = { ...settingsForm, footerCopyright: e.target.value };
                        setSettingsForm(updated);
                        onSaveSettings(updated);
                      }}
                      placeholder={`© ${new Date().getFullYear()} ${settingsForm.siteTitle || 'COD Store BD'}. সর্বস্বত্ব সংরক্ষিত।`}
                      className="w-full px-3.5 py-2 bg-[#09090b] rounded-xl border border-[#27272a] text-xs text-zinc-300 outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'theme' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-white text-sm border-b border-[#27272a] pb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  থিম কালার স্কিম ও বাটনের স্টাইল
                </h3>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-400">রেডিমেড প্রিমিয়াম কালার প্রেসট</label>
                  <div className="space-y-2">
                    {THEME_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          const updated = { ...settingsForm, primaryColor: preset.primary, accentColor: preset.accent };
                          setSettingsForm(updated);
                          onSaveSettings(updated);
                        }}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          settingsForm.primaryColor === preset.primary
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-[#27272a] hover:border-zinc-700 bg-[#121215]'
                        }`}
                      >
                        <span className="text-xs font-bold text-zinc-200">{preset.name}</span>
                        <div className="flex gap-1.5 items-center">
                          <span className="w-5 h-5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: preset.primary }} />
                          <span className="w-5 h-5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: preset.accent }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-zinc-400 mb-1">কাস্টম প্রাইমারি কালার কোড (Hex)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settingsForm.primaryColor || '#059669'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-[#27272a] bg-[#121215]"
                    />
                    <input
                      type="text"
                      value={settingsForm.primaryColor || '#059669'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                      className="flex-1 px-3.5 py-2 bg-[#121215] rounded-xl border border-[#27272a] text-xs font-mono font-bold text-white uppercase outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'sections' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-white text-sm border-b border-[#27272a] pb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  সেকশন হাইড/শো ও সিকোয়েন্স কন্ট্রোল
                </h3>

                <div className="space-y-2">
                  {settingsForm.sectionOrder.map((secKey, idx) => {
                    const isVisible = settingsForm.sectionVisibility[secKey] !== false;
                    return (
                      <div
                        key={secKey}
                        className="p-3 bg-[#121215] rounded-xl border border-[#27272a] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={() => handleToggleSection(secKey)}
                            className="w-4 h-4 text-emerald-500 rounded cursor-pointer accent-emerald-500"
                          />
                          <span className={`text-xs font-bold ${isVisible ? 'text-zinc-200' : 'text-zinc-600 line-through'}`}>
                            {SECTION_LABELS[secKey] || secKey}
                          </span>
                        </div>

                        <div className="flex gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSection(idx, 'up')}
                            className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === settingsForm.sectionOrder.length - 1}
                            onClick={() => handleMoveSection(idx, 'down')}
                            className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSubTab === 'code' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-white text-sm border-b border-[#27272a] pb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Custom Code Injection (CSS / JavaScript)
                </h3>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Custom CSS Code</label>
                  <textarea
                    rows={4}
                    value={settingsForm.customCss || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, customCss: e.target.value })}
                    placeholder="/* Custom CSS overrides e.g. .hero-title { color: gold; } */"
                    className="w-full p-3 rounded-xl border border-[#27272a] font-mono text-xs bg-[#121215] text-emerald-400 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Custom JS Header Code</label>
                  <textarea
                    rows={4}
                    value={settingsForm.customJs || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, customJs: e.target.value })}
                    placeholder="// Custom analytics scripts or chatbot scripts"
                    className="w-full p-3 rounded-xl border border-[#27272a] font-mono text-xs bg-[#121215] text-emerald-400 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>সেভ করুন ও লাইভ পেজে আপডেট পাঠান</span>
            </button>
          </form>
        </div>

        {/* Right Live Device Frame Preview */}
        <div className="lg:col-span-7 bg-[#09090b] p-4 sm:p-6 rounded-2xl border border-[#27272a] space-y-3">
          <div className="flex justify-between items-center text-zinc-400 text-xs px-2">
            <span className="font-bold flex items-center gap-1.5 text-white">
              <Eye className="w-4 h-4 text-emerald-400" /> লাইভ প্রিভিউ মোড ({viewportMode})
            </span>
            <span className="text-[11px] bg-[#121215] px-2.5 py-1 rounded-full text-emerald-400 font-mono border border-[#27272a]">
              Realtime Sync Enabled
            </span>
          </div>

          <div
            className={`mx-auto bg-zinc-950 rounded-2xl overflow-hidden border-2 border-[#27272a] shadow-2xl transition-all duration-300 ${
              viewportMode === 'mobile' ? 'max-w-sm aspect-[9/18] overflow-y-auto' : 'w-full max-h-[650px] overflow-y-auto'
            }`}
          >
            {/* Embedded Live Preview Canvas */}
            <div className="p-4 bg-zinc-900/90 text-white border-b border-[#27272a] text-center">
              <h1 className="font-black text-lg text-zinc-100">{productForm.title}</h1>
              <p className="text-xs text-zinc-400 mt-1">{productForm.subtitle}</p>
              <div className="mt-3 inline-flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30">
                <span className="text-zinc-500 line-through text-xs font-mono">৳{productForm.regularPrice}</span>
                <span className="text-lg font-mono font-black text-emerald-400">৳{productForm.offerPrice}</span>
              </div>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="bg-[#121215] p-4 rounded-2xl border border-[#27272a]">
                <p className="text-xs font-bold text-zinc-300">ক্যাশ অন ডেলিভারি চেকআউট ফর্ম</p>
                <div className="mt-3 space-y-2">
                  <div className="h-9 bg-zinc-900 border border-[#27272a] rounded-xl text-left px-3 text-xs flex items-center text-zinc-500">
                    আপনার নাম
                  </div>
                  <div className="h-9 bg-zinc-900 border border-[#27272a] rounded-xl text-left px-3 text-xs flex items-center text-zinc-500">
                    মোবাইল নম্বর (017...)
                  </div>
                  <div
                    className="h-10 text-white font-extrabold text-xs rounded-xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: settingsForm.primaryColor || '#059669' }}
                  >
                    অর্ডার কনফার্ম করুন (৳{productForm.offerPrice + settingsForm.deliveryFeeInside})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
