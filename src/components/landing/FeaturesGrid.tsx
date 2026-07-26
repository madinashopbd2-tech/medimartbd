import React from 'react';
import { 
  Watch, 
  HeartPulse, 
  ShieldCheck, 
  BatteryCharging, 
  CheckCircle2, 
  Sparkles,
  Star,
  Zap,
  Award,
  Gift,
  Truck,
  ThumbsUp,
  Flame,
  Shield,
  Activity,
  Check
} from 'lucide-react';
import { ProductData } from '../../types';

interface FeaturesGridProps {
  product: ProductData;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Watch,
  HeartPulse,
  ShieldCheck,
  BatteryCharging,
  CheckCircle2,
  Sparkles,
  Star,
  Zap,
  Award,
  Gift,
  Truck,
  ThumbsUp,
  Flame,
  Shield,
  Activity,
  Check
};

export const FeaturesGrid: React.FC<FeaturesGridProps> = ({ product }) => {
  const getIconComponent = (iconName: string | undefined, idx: number) => {
    if (iconName && ICON_MAP[iconName]) {
      const IconComponent = ICON_MAP[iconName];
      return <IconComponent className="w-6 h-6" />;
    }
    if (idx === 0) return <Watch className="w-6 h-6" />;
    if (idx === 1) return <HeartPulse className="w-6 h-6" />;
    if (idx === 2) return <ShieldCheck className="w-6 h-6" />;
    if (idx === 3) return <BatteryCharging className="w-6 h-6" />;
    return <Sparkles className="w-6 h-6" />;
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
            {product.featuresSectionBadge || 'প্রোডাক্ট এর উপকারিতা'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2.5">
            {product.featuresSectionTitle || 'কেন এই স্মার্টওয়াচটি আপনার জন্য সেরা পছন্দ?'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1.5">
            {product.featuresSectionDesc || 'দৈনন্দিন ব্যবহারের জন্য আধুনিক প্রযুক্তি ও প্রিমিয়াম ডিজাইনের অসাধারণ সমন্বয়।'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {product.features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                  {getIconComponent(feat.icon, idx)}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
