import React from 'react';
import { ShoppingCart, Star, ShieldCheck, Truck, Zap, Flame, Sparkles } from 'lucide-react';
import { ProductData, StoreSettings } from '../../types';

interface HeroSectionProps {
  product: ProductData;
  settings: StoreSettings;
  onScrollToCheckout: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  product,
  settings,
  onScrollToCheckout,
}) => {
  const discountPercent = Math.round(
    ((product.regularPrice - product.offerPrice) / product.regularPrice) * 100
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-8 pb-12">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Top Promotional Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/30 px-4 py-1.5 rounded-full backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold tracking-wide text-amber-300">
              {product.customPromoBadgeText 
                ? product.customPromoBadgeText.replace('{discount}', String(discountPercent))
                : `🔥 আজকের বিশেষ অফারে ${discountPercent}% ছাড়! (স্টক সীমিত)`}
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              {product.title}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {product.subtitle}
            </p>

            {/* Ratings & Orders Count */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-white ml-1">
                  {product.customRatingText || '4.9 / 5.0 (২৮৪+ রিভিউ)'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-emerald-300 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>{product.customDeliveryBadgeText || '১২৫০+ সফল ডেলিভারি'}</span>
              </div>
            </div>

            {/* Price Cards */}
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
              <div className="bg-emerald-950/60 border border-emerald-500/30 px-5 py-3 rounded-2xl flex items-baseline gap-3 shadow-lg">
                <span className="text-slate-400 line-through text-sm sm:text-base font-semibold">
                  ৳{product.regularPrice}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-emerald-400">
                  ৳{product.offerPrice}
                </span>
              </div>

              <div className="bg-amber-500 text-slate-950 font-black text-xs sm:text-sm px-3.5 py-2.5 rounded-xl uppercase tracking-wider shadow-md">
                {discountPercent}% সেভ
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                onClick={onScrollToCheckout}
                style={{ backgroundColor: settings.primaryColor || '#059669' }}
                className="w-full sm:w-auto px-8 py-4 text-white text-lg sm:text-xl font-extrabold rounded-2xl shadow-xl shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <ShoppingCart className="w-6 h-6 animate-bounce" />
                <span>{product.customCtaButtonText || 'অর্ডার করতে ক্লিক করুন'}</span>
                <Zap className="w-5 h-5 text-amber-300" />
              </button>
              <p className="text-xs text-slate-400 mt-2.5 flex items-center justify-center lg:justify-start gap-2">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                {product.customTrustText || 'ক্যাশ অন ডেলিভারি: আগে প্রোডাক্ট দেখুন, তারপর টাকা দিন।'}
              </p>
            </div>
          </div>

          {/* Right Product Image Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700/60 shadow-2xl bg-slate-800/40 group">
                <img
                  src={product.images[0] || 'https://picsum.photos/600/600'}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[600px] object-contain bg-black/20 group-hover:scale-105 transition-transform duration-500"
                />

                {/* Stock Tag Overlay */}
                <div className="absolute top-4 left-4 bg-rose-600 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                  <Flame className="w-3.5 h-3.5" />
                  <span>
                    {product.customStockAlertText 
                      ? product.customStockAlertText.replace('{stock}', String(product.stockQuantity))
                      : `স্টক সীমিত: মাত্র ${product.stockQuantity} টি বাকি!`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
