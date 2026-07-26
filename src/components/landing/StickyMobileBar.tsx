import React from 'react';
import { ShoppingBag, Zap } from 'lucide-react';
import { ProductData, StoreSettings } from '../../types';

interface StickyMobileBarProps {
  product: ProductData;
  settings: StoreSettings;
  onScrollToCheckout: () => void;
}

export const StickyMobileBar: React.FC<StickyMobileBarProps> = ({
  product,
  settings,
  onScrollToCheckout,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-3 z-40 lg:hidden shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 block line-through">
            ৳{product.regularPrice}
          </span>
          <span className="text-xl font-black text-amber-400 leading-none">
            ৳{product.offerPrice}
          </span>
        </div>

        <button
          onClick={onScrollToCheckout}
          style={{ backgroundColor: settings.primaryColor || '#059669' }}
          className="flex-1 py-3 px-4 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 animate-bounce" />
          <span>অর্ডার করুন (COD)</span>
          <Zap className="w-3.5 h-3.5 text-amber-300" />
        </button>
      </div>
    </div>
  );
};
