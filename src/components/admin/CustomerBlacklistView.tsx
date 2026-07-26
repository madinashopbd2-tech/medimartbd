import React, { useState } from 'react';
import { Users, Ban, ShieldAlert, CheckCircle, Plus, Search, Trash2 } from 'lucide-react';
import { BlacklistEntry } from '../../types';

interface CustomerBlacklistViewProps {
  blacklist: BlacklistEntry[];
  onAddBlacklist: (phone: string, reason: string) => void;
  onRemoveBlacklist: (id: string) => void;
}

export const CustomerBlacklistView: React.FC<CustomerBlacklistViewProps> = ({
  blacklist,
  onAddBlacklist,
  onRemoveBlacklist,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    onAddBlacklist(phone.trim(), reason.trim() || 'Spam order attempt / Return history');
    setShowAddModal(false);
    setPhone('');
    setReason('');
  };

  const filteredBlacklist = blacklist.filter(
    (b) =>
      (b.phone && b.phone.includes(searchQuery)) ||
      (b.reason && b.reason.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#09090b] p-6 rounded-2xl border border-[#27272a] flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Ban className="w-5 h-5 text-rose-400" />
            ব্ল্যাকলিস্ট ফিল্টার অ্যান্ড ফ্রড প্রোটেকশন
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            যেসব মোবাইল নম্বর থেকে ঘনঘন ফেক বা ভুয়া অর্ডার বা পার্সেল রিটার্ন করা হয়েছে, তাদের ব্লক করে রাখুন।
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন নম্বর ব্ল্যাকলিস্ট করুন</span>
        </button>
      </div>

      {/* Blacklist Table */}
      <div className="bg-[#09090b] rounded-2xl border border-[#27272a] overflow-hidden">
        <div className="p-4 border-b border-[#27272a]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ব্ল্যাকলিস্টেড নম্বর বা কারণ খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 bg-[#121215] border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500 transition-all font-sans"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#121215] text-zinc-400 uppercase text-[10px] font-mono font-extrabold border-b border-[#27272a]">
              <tr>
                <th className="p-4">ব্ল্যাকলিস্টেড মোবাইল নম্বর</th>
                <th className="p-4">ব্লক করার কারণ (Reason)</th>
                <th className="p-4">তারিখ (Date)</th>
                <th className="p-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/60">
              {filteredBlacklist.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-zinc-500">
                    কোনো নম্বর ব্ল্যাকলিস্ট করা নেই।
                  </td>
                </tr>
              ) : (
                filteredBlacklist.map((entry) => (
                  <tr key={entry.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-white text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      {entry.phone}
                    </td>
                    <td className="p-4 text-zinc-300 font-medium">{entry.reason}</td>
                    <td className="p-4 text-zinc-500 font-mono">{new Date(entry.createdAt).toLocaleDateString('bn-BD')}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onRemoveBlacklist(entry.id)}
                        className="px-3 py-1.5 bg-[#121215] hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 font-bold text-xs rounded-xl transition-all cursor-pointer border border-[#27272a] hover:border-emerald-500/30"
                      >
                        আনব্লক করুন
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-[#27272a] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="font-extrabold text-white text-base">মোবাইল নম্বর ব্ল্যাকলিস্ট করুন</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: 01812345678"
                  className="w-full px-3.5 py-2.5 bg-[#121215] rounded-xl border border-[#27272a] text-xs font-mono text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">ব্লক করার কারণ</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="যেমন: ৩ বার পার্সেল রিসিভ না করে রিটার্ন পাঠিয়েছে"
                  className="w-full px-3.5 py-2.5 bg-[#121215] rounded-xl border border-[#27272a] text-xs text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-[#121215] text-zinc-400 font-bold text-xs rounded-xl border border-[#27272a] hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all cursor-pointer"
                >
                  ব্ল্যাকলিস্ট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
