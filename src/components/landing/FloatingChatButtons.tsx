import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';

export const FloatingChatButtons: React.FC = () => {
  const whatsappNumber = '8801700000000';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('আসসালামু আলাইকুম, আমি প্রোডাক্ট সম্পর্কে জানতে চাই।')}`;

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2.5">
      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 group relative"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="absolute right-14 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
          হোয়াটসঅ্যাপ মেসেজ দিন
        </span>
      </a>

      {/* Phone Call Button */}
      <a
        href={`tel:${whatsappNumber}`}
        className="w-12 h-12 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 group relative"
      >
        <Phone className="w-5 h-5 fill-current" />
        <span className="absolute right-14 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
          সরাসরি কল করুন
        </span>
      </a>
    </div>
  );
};
