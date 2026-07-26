import React, { useState } from 'react';
import { ShieldCheck, Truck, Phone, Mail, Lock } from 'lucide-react';
import { StoreSettings } from '../../types';

interface FooterSectionProps {
  settings: StoreSettings;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ settings }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'return' | null>(null);

  const returnTitle = settings.footerReturnPolicyTitle || 'রিটার্ন ও রিফান্ড পলিসি';
  const privacyTitle = settings.footerPrivacyPolicyTitle || 'প্রাইভেসি পলিসি';
  const termsTitle = settings.footerTermsTitle || 'টার্মস ও কন্ডিশনস';

  const defaultReturnContent = `১. প্রোডাক্ট কুরিয়ারম্যানের সামনে খোলা এবং চেক করার সুযোগ থাকবে।
২. প্রোডাক্টে কোনো ত্রুটি থাকলে তাৎক্ষণিক কুরিয়ারম্যানের কাছে ফেরত দিন।
৩. পরবর্তীতে কোনো যান্ত্রিক ত্রুটি পাওয়া গেলে ৩ দিনের মধ্যে আমাদের সাপোর্ট নম্বরে যোগাযোগ করুন।`;

  const defaultPrivacyContent = `১. গ্রাহকদের সকল ব্যক্তিগত তথ্য (নাম, ফোন নম্বর, ঠিকানা) সম্পূর্ণ সুরক্ষিত রাখা হয়।
২. আপনার তথ্য শুধুমাত্র ডেলিভারি সম্পন্ন করার উদ্দেশ্যে ব্যবহৃত হবে, কোনো ৩য় পক্ষের সাথে শেয়ার করা হবে না।`;

  const defaultTermsContent = `১. ক্যাশ অন ডেলিভারিতে অর্ডারের ক্ষেত্রে ডেলিভারি চার্জ প্রযোজ্য হতে পারে।
২. ভুল তথ্য দিলে বা ফেক অর্ডার করলে আইনি ব্যবস্থা নেওয়ার অধিকার সংরক্ষণ করা হয়।`;

  const getModalContent = () => {
    if (modalType === 'return') return settings.footerReturnPolicyContent || defaultReturnContent;
    if (modalType === 'privacy') return settings.footerPrivacyPolicyContent || defaultPrivacyContent;
    if (modalType === 'terms') return settings.footerTermsContent || defaultTermsContent;
    return '';
  };

  const getModalTitle = () => {
    if (modalType === 'return') return returnTitle;
    if (modalType === 'privacy') return privacyTitle;
    if (modalType === 'terms') return termsTitle;
    return '';
  };

  return (
    <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <h3 className="text-white font-extrabold text-base">{settings.siteTitle || 'Single Product COD Store'}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              {settings.footerDescription || 'বাংলাদেশের বিশ্বস্ত ক্যাশ অন ডেলিভারি ই-কমার্স শপ। প্রিমিয়াম কোয়ালিটি ও দ্রুততম হোম ডেলিভারি সেবা।'}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">{settings.footerQuickLinksTitle || 'গুরুত্বপূর্ণ লিংকসমূহ'}</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => setModalType('return')} className="hover:text-emerald-400 transition-colors text-left">
                  {returnTitle}
                </button>
              </li>
              <li>
                <button onClick={() => setModalType('privacy')} className="hover:text-emerald-400 transition-colors text-left">
                  {privacyTitle}
                </button>
              </li>
              <li>
                <button onClick={() => setModalType('terms')} className="hover:text-emerald-400 transition-colors text-left">
                  {termsTitle}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">{settings.footerContactTitle || 'যোগাযোগ করুন'}</h4>
            <div className="space-y-1.5 text-xs">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{settings.helplinePhone || '+880 1700-000000'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{settings.helplineEmail || 'support@codstorebd.com'}</span>
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">{settings.footerTrustTitle || 'নিরাপদ শপিং'}</h4>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
              <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                {settings.footerTrustBadgeTitle || '১০০% ক্যাশ অন ডেলিভারি'}
              </p>
              <p className="text-slate-400">{settings.footerTrustBadgeDesc || 'প্রোডাক্ট হাতে পাওয়ার পর মূল্য পরিশোধ করুন।'}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 text-center text-slate-500 text-[11px]">
          {settings.footerCopyright || `© ${new Date().getFullYear()} ${settings.siteTitle || 'COD Store BD'}. সর্বস্বত্ব সংরক্ষিত।`}
        </div>
      </div>

      {/* Policy Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-200 rounded-2xl max-w-lg w-full p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-white font-bold text-base">
                {getModalTitle()}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2 leading-relaxed max-h-80 overflow-y-auto pr-2 whitespace-pre-line">
              {getModalContent()}
            </div>

            <div className="text-right">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
