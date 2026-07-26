import React, { useState } from 'react';
import { Star, CheckCircle, ThumbsUp, MessageSquarePlus } from 'lucide-react';
import { ReviewData } from '../../types';

interface CustomerReviewsProps {
  reviews: ReviewData[];
  onAddReview: (review: ReviewData) => void;
  sectionBadge?: string;
  sectionTitle?: string;
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({
  reviews,
  onAddReview,
  sectionBadge,
  sectionTitle,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [location, setLocation] = useState('Dhaka');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    const newRev: ReviewData = {
      id: `rev_${Date.now()}`,
      authorName: authorName.trim(),
      rating,
      comment: comment.trim(),
      location: location.trim() || 'Dhaka',
      isVerified: true,
      createdAt: 'এখনই',
    };

    onAddReview(newRev);
    setShowModal(false);
    setAuthorName('');
    setComment('');
  };

  return (
    <section className="py-12 bg-slate-50 border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
              {sectionBadge || 'কাস্টমার রিভিউ'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {sectionTitle || 'আমাদের সম্মানিত গ্রাহকদের মতামত'}
            </h2>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <MessageSquarePlus className="w-4 h-4 text-amber-400" />
            <span>রিভিউ লিখুন</span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{rev.authorName}</h4>
                    <span className="text-[11px] text-slate-500">{rev.location} • {rev.createdAt}</span>
                  </div>
                  {rev.isVerified && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      ভেরিফাইড বায়্যার
                    </span>
                  )}
                </div>

                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-current' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              {rev.photoUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 h-28">
                  <img
                    src={rev.photoUrl}
                    alt="Review Photo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Review Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-900 mb-4">আপনার মূল্যবান রিভিউ প্রদান করুন</h3>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">আপনার নাম *</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="যেমন: মোঃ তামিম ইকবাল"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অবস্থান / এলাকা</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="যেমন: সাভার, ঢাকা"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">রেটিং নির্বাচন করুন</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">আপনার মতামত / অভিজ্ঞতা লিখুন *</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="প্রোডাক্টের মান ও ডেলিভারি স্পিড কেমন লেগেছে জানিয়া দিন..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-sm"
                >
                  পাবলিশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
