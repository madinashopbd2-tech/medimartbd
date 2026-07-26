import React, { useState } from 'react';
import { Star, Trash2, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ReviewData } from '../../types';

interface ReviewManagementViewProps {
  reviews: ReviewData[];
  onUpdateReview: (review: ReviewData) => void;
  onDeleteReview: (id: string) => void;
}

export const ReviewManagementView: React.FC<ReviewManagementViewProps> = ({
  reviews,
  onUpdateReview,
  onDeleteReview,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ReviewData | null>(null);

  const startEdit = (rev: ReviewData) => {
    setEditingId(rev.id);
    setEditForm({ ...rev });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (editForm) {
      onUpdateReview(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900">কাস্টমার রিভিউ ({reviews.length})</h2>
          <p className="text-xs font-medium text-slate-500">আপনার ওয়েবসাইটের রিভিউ ম্যানেজ করুন</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">কাস্টমার</th>
                <th className="px-6 py-4">রেটিং</th>
                <th className="px-6 py-4">রিভিউ টেক্সট</th>
                <th className="px-6 py-4 text-center">একশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    {editingId === rev.id && editForm ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm.authorName}
                          onChange={(e) => setEditForm({ ...editForm, authorName: e.target.value })}
                          className="w-full px-2 py-1 text-xs border rounded outline-none focus:border-indigo-500"
                          placeholder="নাম"
                        />
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          className="w-full px-2 py-1 text-xs border rounded outline-none focus:border-indigo-500"
                          placeholder="ঠিকানা (যেমন: ঢাকা)"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          {rev.authorName}
                          {rev.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        </div>
                        <div className="text-xs text-slate-500">{rev.location}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === rev.id && editForm ? (
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={editForm.rating}
                        onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                        className="w-16 px-2 py-1 text-xs border rounded outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 w-full max-w-sm">
                    {editingId === rev.id && editForm ? (
                      <textarea
                        value={editForm.comment}
                        onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded outline-none focus:border-indigo-500 min-h-[60px]"
                      />
                    ) : (
                      <p className="text-xs text-slate-600 whitespace-normal line-clamp-2" title={rev.comment}>
                        {rev.comment}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingId === rev.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"
                        >
                          সেভ
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300"
                        >
                          বাতিল
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEdit(rev)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="এডিট করুন"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('আপনি কি নিশ্চিত এই রিভিউ ডিলিট করতে চান?')) {
                              onDeleteReview(rev.id);
                            }
                          }}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ডিলিট করুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    কোনো রিভিউ পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
