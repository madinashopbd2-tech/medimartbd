import React, { useState } from 'react';
import { Play, Image as ImageIcon, Video, Maximize2 } from 'lucide-react';
import { ProductData } from '../../types';

interface MediaGalleryProps {
  product: ProductData;
}

const getEmbedInfo = (url?: string) => {
  if (!url) return { isDirectMp4: false, embedUrl: '' };
  const trimmed = url.trim();
  if (trimmed.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || trimmed.startsWith('data:video/')) {
    return { isDirectMp4: true, embedUrl: trimmed };
  }
  let youtubeId = '';
  if (trimmed.includes('youtu.be/')) {
    youtubeId = trimmed.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0] || '';
  } else if (trimmed.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(trimmed.split('?')[1] || '');
    youtubeId = urlParams.get('v') || '';
  } else if (trimmed.includes('youtube.com/embed/')) {
    youtubeId = trimmed.split('youtube.com/embed/')[1]?.split('?')[0]?.split('&')[0] || '';
  } else if (trimmed.includes('youtube.com/shorts/')) {
    youtubeId = trimmed.split('youtube.com/shorts/')[1]?.split('?')[0]?.split('&')[0] || '';
  }

  if (youtubeId) {
    return {
      isDirectMp4: false,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?rel=0&autoplay=1&mute=1&controls=1`,
    };
  }
  return { isDirectMp4: false, embedUrl: trimmed };
};

export const MediaGallery: React.FC<MediaGalleryProps> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const activeImage = (selectedImage && product.images.includes(selectedImage))
    ? selectedImage
    : (product.images[0] || '');

  const videoInfo = getEmbedInfo(product.videoUrl);

  return (
    <section className="py-10 bg-slate-50 border-y border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
            {product.mediaSectionBadge || 'প্রোডাক্ট ফটো ও ভিডিও গ্যালারি'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {product.mediaSectionTitle || 'আসল ছবি ও ভিডিও রিভিউ দেখুন'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Main Selected Image */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-md relative group flex items-center justify-center min-h-[300px]">
              <img
                src={activeImage}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[700px] object-contain group-hover:scale-105 transition-transform duration-300"
              />

              {/* Video Badge Button Overlay */}
              {product.videoUrl && (
                <button
                  onClick={() => setIsVideoOpen(true)}
                  className="absolute bottom-4 right-4 bg-slate-900/90 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>বড় পর্দায় ভিডিও দেখুন</span>
                </button>
              )}
            </div>

            {/* Thumbnails list */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeImage === imgUrl ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${index + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Highlights Banner with Direct Embedded Video */}
          <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              {product.mediaHighlightsTitle || 'কেন আমাদের প্রোডাক্ট সেরা?'}
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <span>{product.mediaBullet1 || '১০০% ছবি ও ভিডিওর সাথে হুবহু মিল থাকার নিশ্চিন্ত নিশ্চয়তা।'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <span>{product.mediaBullet2 || 'উন্নত মেটেরিয়াল এবং লং-লাস্টিং ডিউরেবিলিটি টেস্ট সম্পন্ন।'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <span>{product.mediaBullet3 || 'কুরিয়ারম্যানের সামনে প্রোডাক্ট খুলে দেখে মূল্য পরিশোধের সুযোগ।'}</span>
              </li>
            </ul>

            {/* Direct Inline Video Player */}
            {product.videoUrl && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-slate-900">
                    <Video className="w-4 h-4 text-amber-500" />
                    <span>{product.mediaVideoBadgeText || 'লাইভ ভিডিও রিভিউ'}</span>
                  </span>
                  <button
                    onClick={() => setIsVideoOpen(true)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>ফুলস্ক্রিন</span>
                  </button>
                </div>

                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-sm relative">
                  {videoInfo.isDirectMp4 ? (
                    <video
                      src={videoInfo.embedUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                      poster={product.images[0]}
                    />
                  ) : (
                    <iframe
                      src={videoInfo.embedUrl}
                      title="Product Live Video"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-3xl w-full p-4 border border-slate-700 shadow-2xl relative">
            <div className="flex justify-between items-center mb-3 px-2">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-400" />
                প্রোডাক্ট ভিডিও ডেমো
              </h4>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1 bg-slate-800 rounded-lg cursor-pointer"
              >
                বন্ধ করুন ✕
              </button>
            </div>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
              {videoInfo.isDirectMp4 ? (
                <video
                  src={videoInfo.embedUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={videoInfo.embedUrl}
                  title="Product Video Demo Full"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
