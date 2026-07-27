import React, { useState } from 'react';
import { Star, Trash2, Edit2, CheckCircle2, AlertCircle, Plus, X, Image as ImageIcon } from 'lucide-react';
import { ReviewData } from '../../types';

interface ReviewManagementViewProps {
  reviews: ReviewData[];
  onAddReview: (review: ReviewData) => void;
  onUpdateReview: (review: ReviewData) => void;
  onDeleteReview: (id: string) => void;
}

export const ReviewManagementView: React.FC<ReviewManagementViewProps> = ({
  reviews,
  onAddReview,
  onUpdateReview,
  onDeleteReview,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ReviewData | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<Partial<ReviewData>>({
    authorName: '',
    rating: 5,
    comment: '',
    location: '',
    isVerified: true,
    photoUrl: ''
  });

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

  const handleSaveNewReview = () => {
    if (addForm.authorName && addForm.comment) {
      const newReview: ReviewData = {
        id: `rev-${Date.now()}`,
        authorName: addForm.authorName,
        rating: addForm.rating || 5,
        comment: addForm.comment,
        location: addForm.location || '',
        isVerified: addForm.isVerified ?? true,
        photoUrl: addForm.photoUrl || undefined,
        createdAt: new Date().toISOString()
      };
      onAddReview(newReview);
      setIsAdding(false);
      setAddForm({
        authorName: '',
        rating: 5,
        comment: '',
        location: '',
        isVerified: true,
        photoUrl: ''
      });
    } else {
      alert('অনুগ্রহ করে নাম এবং রিভিউ দিন।');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900">কাস্টমার রিভিউ ({reviews.length})</h2>
          <p className="text-xs font-medium text-slate-500">আপনার ওয়েবসাইটের রিভিউ ম্যানেজ করুন</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          রিভিউ যোগ করুন
        </button>
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
              {isAdding && (
                <tr className="bg-indigo-50/50">
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={addForm.authorName}
                        onChange={(e) => setAddForm({ ...addForm, authorName: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-indigo-200 rounded outline-none focus:border-indigo-500 bg-white"
                        placeholder="কাস্টমারের নাম"
                      />
                      <input
                        type="text"
                        value={addForm.location}
                        onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-indigo-200 rounded outline-none focus:border-indigo-500 bg-white"
                        placeholder="ঠিকানা (যেমন: ঢাকা)"
                      />
                      <label className="flex items-center gap-2 mt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addForm.isVerified}
                          onChange={(e) => setAddForm({ ...addForm, isVerified: e.target.checked })}
                          className="w-3 h-3 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-[11px] font-medium text-slate-700">ভেরিফাইড কাস্টমার?</span>
                      </label>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={addForm.rating}
                      onChange={(e) => setAddForm({ ...addForm, rating: Number(e.target.value) })}
                      className="w-16 px-2 py-1 text-xs border border-indigo-200 rounded outline-none focus:border-indigo-500 bg-white"
                    />
                  </td>
                  <td className="px-6 py-4 w-full max-w-sm space-y-2">
                    <textarea
                      value={addForm.comment}
                      onChange={(e) => setAddForm({ ...addForm, comment: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-indigo-200 rounded outline-none focus:border-indigo-500 min-h-[60px] bg-white"
                      placeholder="রিভিউ লিখুন..."
                    />
                    <div className="flex gap-2 items-center">
                      <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={addForm.photoUrl || ''}
                        onChange={(e) => setAddForm({ ...addForm, photoUrl: e.target.value })}
                        className="flex-1 px-2 py-1 text-xs border border-indigo-200 rounded outline-none focus:border-indigo-500 bg-white"
                        placeholder="ছবির লিংক (ঐচ্ছিক)"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col gap-2 items-center justify-center">
                      <button
                        onClick={handleSaveNewReview}
                        className="w-full px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        সেভ করুন
                      </button>
                      <button
                        onClick={() => setIsAdding(false)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        বাতিল
                      </button>
                    </div>
                  </td>
                </tr>
              )}
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
                      <div className="space-y-2">
                        <textarea
                          value={editForm.comment}
                          onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                          className="w-full px-2 py-1 text-xs border rounded outline-none focus:border-indigo-500 min-h-[60px]"
                        />
                        <div className="flex gap-2 items-center">
                          <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                          <input
                            type="text"
                            value={editForm.photoUrl || ''}
                            onChange={(e) => setEditForm({ ...editForm, photoUrl: e.target.value })}
                            className="flex-1 px-2 py-1 text-xs border rounded outline-none focus:border-indigo-500"
                            placeholder="ছবির লিংক (ঐচ্ছিক)"
                          />
                        </div>
                      </div>
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
