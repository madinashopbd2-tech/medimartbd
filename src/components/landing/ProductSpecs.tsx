import React from 'react';
import { SlidersHorizontal, Check } from 'lucide-react';
import { ProductData } from '../../types';

interface ProductSpecsProps {
  product: ProductData;
}

export const ProductSpecs: React.FC<ProductSpecsProps> = ({ product }) => {
  return (
    <section className="py-10 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
            {product.specsSectionBadge || 'স্পেসিফিকেশন'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {product.specsSectionTitle || 'প্রোডাক্টের টেকনিক্যাল তথ্যসমূহ'}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {product.specifications.map((spec, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 px-6 py-4 text-xs sm:text-sm ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                }`}
              >
                <div className="col-span-5 font-bold text-slate-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  {spec.key}
                </div>
                <div className="col-span-7 text-slate-600 font-medium">
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
