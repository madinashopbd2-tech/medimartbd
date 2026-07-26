import React from 'react';
import { ProductData } from '../../types';

interface HowToUseProps {
  product: ProductData;
}

export const HowToUse: React.FC<HowToUseProps> = ({ product }) => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {product.howToUseSectionBadge || 'সহজ ৩ ধাপ'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {product.howToUseSectionTitle || 'স্মার্টওয়াচটি যেভাবে ব্যবহার করবেন'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {product.howToUseSteps.map((step) => (
            <div
              key={step.step}
              className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative text-center space-y-3"
            >
              <div className="w-10 h-10 bg-amber-500 text-slate-950 font-extrabold rounded-full flex items-center justify-center mx-auto text-base shadow-md">
                {step.step}
              </div>
              <h3 className="font-bold text-slate-900 text-base">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
