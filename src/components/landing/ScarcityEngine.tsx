import React, { useState, useEffect } from 'react';
import { Clock, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { ProductData } from '../../types';

interface ScarcityEngineProps {
  product: ProductData;
  onScrollToCheckout: () => void;
}

export const ScarcityEngine: React.FC<ScarcityEngineProps> = ({
  product,
  onScrollToCheckout,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 18,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const stockPercent = Math.round((product.stockQuantity / 100) * 100);

  return (
    <section className="py-8 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-amber-400/40 relative overflow-hidden">
          {/* Top Banner Accent */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>অফার শেষ হওয়ার আগেই অর্ডার করুন!</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                বিশেষ ছাড়ের সময়সীমা শেষ হতে বাকি:
              </h3>
            </div>

            {/* Countdown Box Grid */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="bg-slate-900 border border-slate-700 px-3.5 py-2.5 rounded-2xl text-center min-w-[64px]">
                <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">ঘণ্টা</span>
              </div>
              <span className="text-2xl font-black text-amber-400">:</span>

              <div className="bg-slate-900 border border-slate-700 px-3.5 py-2.5 rounded-2xl text-center min-w-[64px]">
                <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">মিনিট</span>
              </div>
              <span className="text-2xl font-black text-amber-400">:</span>

              <div className="bg-slate-900 border border-slate-700 px-3.5 py-2.5 rounded-2xl text-center min-w-[64px]">
                <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">সেকেন্ড</span>
              </div>
            </div>
          </div>

          {/* Stock Progress Bar */}
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                ওয়ারহাউজে মাত্র {product.stockQuantity} টি প্রোডাক্ট বাকি আছে!
              </span>
              <span className="text-amber-400">{stockPercent}% স্টক ফিনিশড</span>
            </div>

            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-1000 animate-pulse"
                style={{ width: `${Math.min(stockPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
