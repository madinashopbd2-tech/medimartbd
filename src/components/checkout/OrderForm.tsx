import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  User, 
  Truck, 
  ShieldCheck, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Lock,
  MessageSquare
} from 'lucide-react';
import { BANGLADESH_DISTRICTS } from '../../data/bangladesh-locations';
import { ProductData, StoreSettings, OrderData } from '../../types';
import { trackClientInitiateCheckout } from '../../lib/marketing/tracking-client';

interface OrderFormProps {
  product: ProductData;
  settings: StoreSettings;
  onSubmitOrder: (formData: any) => Promise<{ success: boolean; order?: OrderData; error?: string; requiresOtp?: boolean; otpCodeSimulated?: string }>;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  product,
  settings,
  onSubmitOrder
}) => {
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState<'inside' | 'outside'>('inside');
  const [quantity, setQuantity] = useState(1);
  const [orderNote, setOrderNote] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponSuccess, setCouponSuccess] = useState('');

  // UI / Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // OTP Modal state for High Risk Smart OTP verification
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('5892');
  const [pendingFormData, setPendingFormData] = useState<any>(null);

  // Pricing calculations
  const unitPrice = product.offerPrice || product.regularPrice;
  const subtotal = unitPrice * quantity;
  
  // Delivery Fee: Inside Dhaka vs Outside Dhaka
  const insideFee = settings.deliveryFeeInside || 70;
  const outsideFee = settings.deliveryFeeOutside || 130;
  const deliveryFee = deliveryLocation === 'inside' ? insideFee : outsideFee;

  const grandTotal = Math.max(0, subtotal + deliveryFee - appliedDiscount);

  // Apply Coupon
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (cleanCode === 'SAVE100') {
      setAppliedDiscount(100);
      setCouponSuccess('Coupon SAVE100 applied! ৳100 discount deducted.');
      setErrorMsg('');
    } else if (cleanCode === 'FREE70' || cleanCode === 'FREESHIP') {
      setAppliedDiscount(deliveryFee);
      setCouponSuccess('Free Shipping coupon applied!');
      setErrorMsg('');
    } else if (cleanCode === 'PROMO200' && subtotal >= 2000) {
      setAppliedDiscount(200);
      setCouponSuccess('Promo discount ৳200 applied!');
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid or expired coupon code. Try SAVE100 or FREE70');
      setCouponSuccess('');
    }
  };

  // Main Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Client validation checks
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setErrorMsg('Please enter a valid 11-digit Bangladeshi mobile number starting with 013-019.');
      return;
    }

    if (customerName.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (address.trim().length < 15) {
      setErrorMsg('Address must be at least 15 characters long (Include House/Road/Village & Thana).');
      return;
    }

    setIsSubmitting(true);

    // Trigger InitiateCheckout pixel event
    trackClientInitiateCheckout(product.title, grandTotal);

    const district = deliveryLocation === 'inside' ? 'Dhaka' : 'Outside Dhaka';
    const upazila = deliveryLocation === 'inside' ? 'Dhaka City' : 'Outside Dhaka';

    const payload = {
      customerName: customerName.trim(),
      phone: cleanPhone,
      address: address.trim(),
      district,
      upazila,
      quantity,
      unitPrice,
      deliveryFee,
      discountAmount: appliedDiscount,
      totalAmount: grandTotal,
      orderNote: orderNote.trim(),
      isOtpVerified: false,
    };

    try {
      const result = await onSubmitOrder(payload);
      setIsSubmitting(false);

      if (!result.success) {
        if (result.requiresOtp) {
          // Open Smart OTP Modal
          setPendingFormData(payload);
          setSimulatedOtp(result.otpCodeSimulated || '5892');
          setShowOtpModal(true);
        } else {
          setErrorMsg(result.error || 'Failed to place order. Please try again.');
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Server connection error. Please try again.');
    }
  };

  // Verify OTP Modal Action
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim() !== simulatedOtp) {
      setErrorMsg('Incorrect OTP code entered. Please check the SMS code.');
      return;
    }

    setIsSubmitting(true);
    setShowOtpModal(false);

    try {
      const verifiedPayload = { ...pendingFormData, isOtpVerified: true };
      const res = await onSubmitOrder(verifiedPayload);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.error || 'OTP verification failed. Please try again.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg('OTP submission error.');
    }
  };

  return (
    <div id="checkout-form-section" className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
      {/* Header Banner */}
      <div 
        className="px-6 py-5 text-white flex items-center justify-between"
        style={{ backgroundColor: settings.primaryColor || '#059669' }}
      >
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 animate-bounce" />
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              {product.orderFormTitle || 'ক্যাশ অন ডেলিভারিতে অর্ডার করুন'}
            </h3>
            <p className="text-xs opacity-90">
              {product.orderFormSubtitle || 'পণ্য হাতে পেয়ে টাকা পরিশোধ করুন (১০০% নিরাপদ)'}
            </p>
          </div>
        </div>
        <span className="bg-amber-400 text-slate-900 font-extrabold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
          {product.orderFormBadgeText || 'Cash On Delivery'}
        </span>
      </div>

      <div className="p-6 md:p-8">
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">অর্ডার দিতে সমস্যা হচ্ছে:</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bundle & Quantity Selection */}
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
            <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              পরিমাণ ও অফার নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setQuantity(1)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  quantity === 1 
                    ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-sm' 
                    : 'border-slate-200 bg-white/80 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-semibold text-slate-500">১ টি পিস</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">৳{unitPrice}</div>
                <span className="text-[11px] text-emerald-600 font-medium">রেগুলার প্রাইস</span>
              </button>

              <button
                type="button"
                onClick={() => setQuantity(2)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  quantity === 2 
                    ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-sm' 
                    : 'border-slate-200 bg-white/80 hover:border-slate-300'
                }`}
              >
                <span className="absolute -top-2.5 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  জনপ্রিয় অফার
                </span>
                <div className="text-xs font-semibold text-slate-500">২ টি পিস</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">৳{unitPrice * 2}</div>
                <span className="text-[11px] text-amber-700 font-bold">ফ্রি গিফট / ডেলিভারি ডিসকাউন্ট</span>
              </button>

              <button
                type="button"
                onClick={() => setQuantity(3)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  quantity === 3 
                    ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-sm' 
                    : 'border-slate-200 bg-white/80 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-semibold text-slate-500">৩ টি পিস (ফ্যামিলি প্যাক)</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">৳{unitPrice * 3}</div>
                <span className="text-[11px] text-emerald-700 font-bold">সর্বোচ্চ সেভিং</span>
              </button>
            </div>
          </div>

          {/* Customer Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                আপনার নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="যেমন: মোঃ সাকিব হাসান"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                মোবাইল নম্বর <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="যেমন: 01712345678"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 text-sm font-medium"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                ১১ ডিজিটের সঠিক মোবাইল নম্বর দিন।
              </span>
            </div>
          </div>

          {/* Simple Delivery Location Selector (Inside Dhaka vs Outside Dhaka) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              ডেলিভারি এরিয়া সিলেক্ট করুন <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryLocation('inside')}
                className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  deliveryLocation === 'inside'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    deliveryLocation === 'inside' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                  }`}>
                    {deliveryLocation === 'inside' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">ঢাকার ভেতরে</div>
                    <div className="text-xs text-slate-500">হোম ডেলিভারি</div>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-700 bg-emerald-100/90 px-3 py-1 rounded-lg">
                  ৳{insideFee}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryLocation('outside')}
                className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  deliveryLocation === 'outside'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    deliveryLocation === 'outside' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                  }`}>
                    {deliveryLocation === 'outside' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">ঢাকার বাহিরে</div>
                    <div className="text-xs text-slate-500">কুরিয়ার ডেলিভারি</div>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-700 bg-emerald-100/90 px-3 py-1 rounded-lg">
                  ৳{outsideFee}
                </span>
              </button>
            </div>
          </div>

          {/* Full Delivery Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="জেলা, থানা, এলাকা, বাসা/রোড নম্বর বা গ্রামের নাম বিস্তারিত লিখুন..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 text-sm"
            />
          </div>

          {/* Coupon Code Section */}
          <div className="border-t border-dashed border-slate-200 pt-4">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="কুপন কোড থাকলে দিন (যেমন: SAVE100)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500 uppercase"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-2.5 bg-slate-800 text-white font-semibold text-xs rounded-xl hover:bg-slate-900 transition-colors shrink-0"
              >
                কুপন অ্যাপ্লাই
              </button>
            </div>
            {couponSuccess && (
              <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {couponSuccess}
              </p>
            )}
          </div>

          {/* Order Note Option */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> বিশেষ দ্রষ্টব্য / অর্ডার নোট (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="কুরিয়ারকে কোনো মেসেজ থাকলে দিন..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none"
            />
          </div>

          {/* Pricing Summary Table */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>পণ্যের দাম ({quantity} পিস):</span>
              <span className="font-semibold text-slate-900">৳{subtotal}</span>
            </div>
            
            <div className="flex justify-between text-slate-600">
              <span>ডেলিভারি চার্জ ({deliveryLocation === 'inside' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}):</span>
              <span className="font-semibold text-slate-900">৳{deliveryFee}</span>
            </div>

            {appliedDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>কুপন ডিসকাউন্ট:</span>
                <span>-৳{appliedDiscount}</span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center text-slate-900">
              <span className="text-base font-extrabold">সর্বমোট (Grand Total):</span>
              <span className="text-xl font-black text-emerald-600">৳{grandTotal}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: settings.primaryColor || '#059669' }}
            className="w-full py-4 text-white text-lg font-extrabold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                অর্ডার প্রসেস হচ্ছে...
              </div>
            ) : (
              <>
                <ShoppingBag className="w-6 h-6" />
                {product.orderFormButtonText
                  ? product.orderFormButtonText.replace('{totalAmount}', String(grandTotal))
                  : `অর্ডার কনফার্ম করুন (৳${grandTotal})`}
              </>
            )}
          </button>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-slate-500">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>১০০% আসল পণ্য</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>২৪-৪৮ ঘন্টায় ডেলিভারি</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>পণ্য দেখে টাকা দিন</span>
            </div>
          </div>
        </form>
      </div>

      {/* Smart OTP Verification Modal for High Risk Checkouts */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">স্মার্ট ওটিপি (OTP) ভেরিফিকেশন</h3>
              <p className="text-xs text-slate-600 mt-1">
                নিরাপত্তার স্বার্থে আপনার মোবাইল নম্বর ({phone}) এ পাঠানো ৪ ডিজিটের পিন কোডটি লিখুন।
              </p>
            </div>

            {/* Test Simulation Alert Banner */}
            <div className="my-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <p className="font-bold flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> টেস্ট এসএমএস মেসেজ:
              </p>
              <p className="mt-0.5">আপনার ওটিপি কোড হলো: <span className="font-extrabold text-slate-900 text-sm tracking-widest">{simulatedOtp}</span></p>
            </div>

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="৪ ডিজিটের ওটিপি লিখুন"
                  className="w-full text-center text-2xl font-black tracking-widest py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-sm"
                >
                  ভেরিফাই করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
