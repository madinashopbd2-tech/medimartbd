import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  MessageCircle, 
  Search, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  ArrowUpRight, 
  Sparkles,
  Edit3,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { IncompleteOrderData, OrderStatus } from '../../types';
import { getLiveTimeAgo } from '../../utils/timeAgo';

interface IncompleteOrdersViewProps {
  incompleteOrders: IncompleteOrderData[];
  onUpdateIncompleteOrder: (id: string, updates: { status?: 'ABANDONED' | 'RECOVERED' | 'REJECTED'; adminNote?: string }) => void;
  onDeleteIncompleteOrder: (id: string) => void;
  onConvertToFullOrder?: (incOrder: IncompleteOrderData) => void;
}

export const IncompleteOrdersView: React.FC<IncompleteOrdersViewProps> = ({
  incompleteOrders,
  onUpdateIncompleteOrder,
  onDeleteIncompleteOrder,
  onConvertToFullOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ABANDONED' | 'RECOVERED' | 'REJECTED'>('ALL');
  
  // Real-time ticking timestamp
  const [nowMs, setNowMs] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  const filteredIncompletes = incompleteOrders.filter((inc) => {
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = inc.customerName?.toLowerCase().includes(q);
      const matchPhone = inc.phone?.includes(q);
      const matchAddress = inc.address?.toLowerCase().includes(q);
      return matchName || matchPhone || matchAddress;
    }
    return true;
  });

  const abandonedCount = incompleteOrders.filter((i) => i.status === 'ABANDONED').length;
  const recoveredCount = incompleteOrders.filter((i) => i.status === 'RECOVERED').length;

  const handleSaveNote = (id: string) => {
    onUpdateIncompleteOrder(id, { adminNote: tempNote });
    setEditingNoteId(null);
  };

  const getWhatsAppLink = (phone: string, name: string, productTitle: string, total: number) => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '88' + cleanPhone;
    } else if (!cleanPhone.startsWith('88')) {
      cleanPhone = '88' + cleanPhone;
    }
    const message = encodeURIComponent(
      `আসসালামু আলাইকুম ${name || 'স্যার'}, আপনি আমাদের ওয়েবসাইটে ${productTitle} প্রোডাক্টটি অর্ডার করতে তথ্য দিয়েছিলেন কিন্তু অর্ডারটি সম্পন্ন করেননি। আপনি কি অর্ডারটি কনফার্ম করতে চান? পণ্য হাতে পেয়ে ক্যাশ অন ডেলিভারিতে ৳${total} পরিশোধ করতে পারবেন।`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const formatBDTime = (isoString?: string) => {
    if (!isoString) return 'কিছুক্ষণ আগে';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-amber-300/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold shrink-0">
            <PhoneCall className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              ইনকমপ্লিট অর্ডার রিকভারি (Incomplete Orders)
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                {abandonedCount} রিকভারযোগ্য
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              যেসব গ্রাহক নাম, মোবাইল বা ঠিকানা লিখে অর্ডার সাবমিট না করে চলে গেছেন, তাদের তালিকা। এখান থেকে সরাসরি কল বা হোয়াটসঅ্যাপ করে অর্ডারটি কনফার্ম করুন।
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs shrink-0">
          <div className="text-center px-3 border-r border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400">ড্রপ অফ (বাকি)</p>
            <p className="text-base font-black text-amber-600">{abandonedCount}</p>
          </div>
          <div className="text-center px-3">
            <p className="text-[10px] uppercase font-bold text-slate-400">রিকভার্ড (অর্ডার)</p>
            <p className="text-base font-black text-emerald-600">{recoveredCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, ফোন বা ঠিকানা দিয়ে সার্চ করুন..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'সবগুলো', count: incompleteOrders.length },
            { id: 'ABANDONED', label: 'ড্রপ অফ (Pending)', count: abandonedCount },
            { id: 'RECOVERED', label: 'কনভার্টেড (Recovered)', count: recoveredCount },
            { id: 'REJECTED', label: 'বাতিল (Rejected)', count: incompleteOrders.filter(i => i.status === 'REJECTED').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Incomplete Orders Table / Cards */}
      <div className="space-y-3">
        {filteredIncompletes.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">কোনো ইনকমপ্লিট অর্ডার পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              কাস্টমার চেকআউট ফর্মে নাম ও নম্বর লিখার সাথে সাথে স্বয়ংক্রিয়ভাবে এখানে ড্রাফট ডাটা সেভ হয়ে যাবে।
            </p>
          </div>
        ) : (
          filteredIncompletes.map((inc) => (
            <div
              key={inc.id}
              className={`bg-white rounded-2xl border transition-all p-4 md:p-5 shadow-2xs ${
                inc.status === 'RECOVERED'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : inc.status === 'REJECTED'
                  ? 'border-slate-200 opacity-60'
                  : 'border-amber-200/80 hover:border-amber-400'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Customer Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-black text-slate-900 text-base">
                      {inc.customerName || 'ভিজিটর (নাম পাওয়া যায়নি)'}
                    </span>
                    
                    {/* Status Badge */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        inc.status === 'RECOVERED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : inc.status === 'REJECTED'
                          ? 'bg-slate-100 text-slate-600 border border-slate-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                      }`}
                    >
                      {inc.status === 'RECOVERED' ? 'অর্ডার কনফার্মড' : inc.status === 'REJECTED' ? 'বাতিল' : 'কল করে অর্ডার নিন'}
                    </span>

                    <span className="text-[11px] text-slate-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1 font-mono font-bold">
                      <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                      <span>{getLiveTimeAgo(inc.lastActiveAt || inc.createdAt, nowMs).formatted}</span>
                    </span>
                  </div>

                  {/* Phone and Address */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{inc.phone}</span>
                    </div>

                    {inc.address ? (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate max-w-md">{inc.address}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">ঠিকানা পূরণ করেনি</span>
                    )}

                    <div className="flex items-center gap-1.5 text-slate-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                      <span className="font-semibold">{inc.productTitle} ({inc.quantity || 1}টি)</span>
                      <span className="font-bold text-emerald-700">৳{inc.totalAmount || 1520}</span>
                    </div>
                  </div>

                  {/* Admin Note if any */}
                  {inc.adminNote && (
                    <div className="mt-2 text-xs bg-indigo-50 border border-indigo-100 text-indigo-900 px-3 py-1.5 rounded-lg flex items-center justify-between">
                      <span className="font-medium">
                        <strong>নোট:</strong> {inc.adminNote}
                      </span>
                      <button
                        onClick={() => {
                          setEditingNoteId(inc.id);
                          setTempNote(inc.adminNote || '');
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold underline cursor-pointer ml-2"
                      >
                        এডিট
                      </button>
                    </div>
                  )}

                  {/* Inline Note Editor Modal/Field */}
                  {editingNoteId === inc.id && (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                        placeholder="কল করার ফলাফল লিখুন (যেমন: কাল ডেলিভারি চেয়েছে)..."
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-indigo-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleSaveNote(inc.id)}
                        className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 cursor-pointer"
                      >
                        সেভ
                      </button>
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="px-2 py-1.5 bg-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-300 cursor-pointer"
                      >
                        বাতিল
                      </button>
                    </div>
                  )}
                </div>

                {/* Direct Action Buttons (Call, WhatsApp, Convert, Reject) */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0">
                  {/* Direct Phone Call Button */}
                  <a
                    href={`tel:${inc.phone}`}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>সরাসরি কল</span>
                  </a>

                  {/* WhatsApp Quick Message Button */}
                  <a
                    href={getWhatsAppLink(inc.phone, inc.customerName, inc.productTitle, inc.totalAmount)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Note Button */}
                  {editingNoteId !== inc.id && !inc.adminNote && (
                    <button
                      onClick={() => {
                        setEditingNoteId(inc.id);
                        setTempNote('');
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                      title="নোট লিখুন"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>নোট</span>
                    </button>
                  )}

                  {/* Mark as Recovered Button */}
                  {inc.status !== 'RECOVERED' && (
                    <button
                      onClick={() => {
                        if (onConvertToFullOrder) {
                          onConvertToFullOrder(inc);
                        } else {
                          onUpdateIncompleteOrder(inc.id, { status: 'RECOVERED' });
                        }
                      }}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                      title="অর্ডারে রূপান্তর করুন"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>অর্ডার বানান</span>
                    </button>
                  )}

                  {/* Delete / Reject Button */}
                  <button
                    onClick={() => {
                      if (confirm('আপনি কি এই ইনকমপ্লিট রেকর্ডটি ডিলিট করতে চান?')) {
                        onDeleteIncompleteOrder(inc.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="ডিলিট করুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
