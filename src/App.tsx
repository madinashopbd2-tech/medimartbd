import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Settings, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Sparkles,
  ExternalLink,
  Lock,
  X,
  Truck
} from 'lucide-react';
import { 
  ProductData, 
  StoreSettings, 
  OrderData, 
  ReviewData, 
  FaqData, 
  CouponData, 
  BlacklistEntry, 
  OrderStatus 
} from './types';
import { HeroSection } from './components/landing/HeroSection';
import { MediaGallery } from './components/landing/MediaGallery';
import { ScarcityEngine } from './components/landing/ScarcityEngine';
import { FeaturesGrid } from './components/landing/FeaturesGrid';
import { ProductSpecs } from './components/landing/ProductSpecs';
import { HowToUse } from './components/landing/HowToUse';
import { CustomerReviews } from './components/landing/CustomerReviews';
import { AccordionFAQs } from './components/landing/AccordionFAQs';
import { OrderForm } from './components/checkout/OrderForm';
import { FooterSection } from './components/landing/FooterSection';
import { StickyMobileBar } from './components/landing/StickyMobileBar';
import { FloatingChatButtons } from './components/landing/FloatingChatButtons';
import { 
  initTrackingScripts, 
  trackClientScrollDepth, 
  trackClientPurchase 
} from './lib/marketing/tracking-client';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardView } from './components/admin/DashboardView';
import { CmsBuilderView } from './components/admin/CmsBuilderView';
import { OrderManagementView } from './components/admin/OrderManagementView';
import { CustomerBlacklistView } from './components/admin/CustomerBlacklistView';
import { MarketingPixelView } from './components/admin/MarketingPixelView';
import { SettingsView } from './components/admin/SettingsView';
import { LoginView } from './components/admin/LoginView';

export default function App() {
  // Navigation Mode: 'storefront' vs 'admin' based on URL path (/admin)
  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || path.endsWith('/admin') || hash === '#admin' || hash === '#/admin') {
        return 'admin';
      }
    }
    return 'storefront';
  });

  const [adminTab, setAdminTab] = useState<'dashboard' | 'cms' | 'orders' | 'customers' | 'marketing' | 'settings'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // URL route sync effect
  useEffect(() => {
    const handleLocationCheck = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const hash = window.location.hash;
        const isPathAdmin = path === '/admin' || path.endsWith('/admin') || hash === '#admin' || hash === '#/admin';

        if (isPathAdmin) {
          setViewMode('admin');
        } else {
          setViewMode('storefront');
        }
      }
    };

    window.addEventListener('popstate', handleLocationCheck);
    window.addEventListener('hashchange', handleLocationCheck);
    return () => {
      window.removeEventListener('popstate', handleLocationCheck);
      window.removeEventListener('hashchange', handleLocationCheck);
    };
  }, []);

  const handleExitAdmin = () => {
    setViewMode('storefront');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
  };

  // Core App State
  const [product, setProduct] = useState<ProductData | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [faqs, setFaqs] = useState<FaqData[]>([]);
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Success Order Modal (Thank You Page)
  const [completedOrder, setCompletedOrder] = useState<OrderData | null>(null);

  // Smooth scroll reference to order form
  const orderFormRef = useRef<HTMLDivElement>(null);

  // Fetch initial data from Express API
  const fetchStoreData = async () => {
    try {
      const res = await fetch('/api/store-data');
      const data = await res.json();
      setProduct(data.product);
      setSettings(data.settings);
      setReviews(data.reviews);
      setFaqs(data.faqs);
      setCoupons(data.coupons);
      setOrders(data.orders);
      setBlacklist(data.blacklist);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading store data:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  // Initialize Tracking Scripts (Meta Pixel, TikTok Pixel, GA4, GTM, Domain Verification) & Scroll Depth Tracking
  useEffect(() => {
    if (!settings) return;
    initTrackingScripts(settings, product);

    let scrolled50 = false;
    let scrolled75 = false;
    let formReached = false;

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const currentScroll = window.scrollY;
      const scrollPercent = (currentScroll / totalHeight) * 100;

      if (scrollPercent >= 50 && !scrolled50) {
        scrolled50 = true;
        trackClientScrollDepth(50, 'MidContent');
      }
      if (scrollPercent >= 75 && !scrolled75) {
        scrolled75 = true;
        trackClientScrollDepth(75, 'BottomContent');
      }

      const formEl = document.getElementById('checkout-form-section') || document.getElementById('order-form');
      if (formEl && !formReached) {
        const rect = formEl.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.8) {
          formReached = true;
          trackClientScrollDepth(100, 'OrderFormSection');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [settings, product]);

  const scrollToCheckout = () => {
    const el = document.getElementById('checkout-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Submit Order to Server API
  const handleOrderSubmit = async (payload: any) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (result.success && result.order) {
      setOrders((prev) => [result.order, ...prev]);
      setCompletedOrder(result.order);

      // Client-Side Purchase/CompletePayment Pixel Trigger
      if (settings && !settings.firePurchaseOnlyOnConfirm) {
        trackClientPurchase(result.order, product?.title || 'Product', settings.googleAdsConversionId);
      }
    }

    return result;
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Save Product Changes
  const handleSaveProduct = async (updated: ProductData) => {
    setProduct(updated);
    await fetch('/api/product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  };

  // Save Settings Changes
  const handleSaveSettings = async (updated: StoreSettings) => {
    setSettings(updated);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  };

  // Add Blacklist Entry
  const handleAddBlacklist = async (phone: string, reason: string) => {
    const res = await fetch('/api/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, reason }),
    });
    const data = await res.json();
    if (data.success) {
      setBlacklist(data.blacklist);
    }
  };

  // Remove Blacklist Entry
  const handleRemoveBlacklist = async (id: string) => {
    const res = await fetch(`/api/blacklist/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setBlacklist(data.blacklist);
    }
  };

  // Add Review
  const handleAddReview = async (rev: ReviewData) => {
    setReviews((prev) => [rev, ...prev]);
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rev),
    });
  };

  // Coupon Actions
  const handleAddCoupon = async (code: string, discountValue: number) => {
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, discountValue }),
    });
    const data = await res.json();
    if (data.success) setCoupons(data.coupons);
  };

  const handleDeleteCoupon = async (id: string) => {
    const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) setCoupons(data.coupons);
  };

  if (isLoading || !product || !settings) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-bold">লোডিং হচ্ছে...</h2>
          <p className="text-xs text-slate-400">সিএমএস ইঞ্জিনের রেডিমেড স্টোর কনফিগারেশন রিসিভ করা হচ্ছে।</p>
        </div>
      </div>
    );
  }

  // Section Render Map
  const sectionMap: Record<string, React.ReactNode> = {
    hero: (
      <HeroSection
        key="hero"
        product={product}
        settings={settings}
        onScrollToCheckout={scrollToCheckout}
      />
    ),
    media: <MediaGallery key="media" product={product} />,
    scarcity: (
      <ScarcityEngine
        key="scarcity"
        product={product}
        onScrollToCheckout={scrollToCheckout}
      />
    ),
    features: <FeaturesGrid key="features" product={product} />,
    specs: <ProductSpecs key="specs" product={product} />,
    howtouse: <HowToUse key="howtouse" product={product} />,
    reviews: (
      <CustomerReviews
        key="reviews"
        reviews={reviews}
        onAddReview={handleAddReview}
      />
    ),
    faqs: <AccordionFAQs key="faqs" faqs={faqs} />,
    checkout: (
      <section key="checkout" className="py-12 bg-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <OrderForm
            product={product}
            settings={settings}
            onSubmitOrder={handleOrderSubmit}
          />
        </div>
      </section>
    ),
    footer: <FooterSection key="footer" settings={settings} />,
  };

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const highRiskCount = orders.filter((o) => o.riskLevel === 'HIGH').length;

  return (
    <div className="min-h-screen font-sans antialiased text-slate-900 bg-white">
      {/* Render Mode Switcher */}
      {viewMode === 'admin' ? (
        !isAuthenticated ? (
          <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />
        ) : (
        <AdminLayout
          activeTab={adminTab}
          setActiveTab={setAdminTab}
          pendingOrdersCount={pendingCount}
          highRiskCount={highRiskCount}
          onExitAdmin={handleExitAdmin}
          onLogout={() => setIsAuthenticated(false)}
        >
          {adminTab === 'dashboard' && (
            <DashboardView orders={orders} onViewOrders={() => setAdminTab('orders')} />
          )}
          {adminTab === 'cms' && (
            <CmsBuilderView
              product={product}
              settings={settings}
              onSaveProduct={handleSaveProduct}
              onSaveSettings={handleSaveSettings}
            />
          )}
          {adminTab === 'orders' && (
            <OrderManagementView
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onBlacklistCustomer={handleAddBlacklist}
            />
          )}
          {adminTab === 'customers' && (
            <CustomerBlacklistView
              blacklist={blacklist}
              onAddBlacklist={handleAddBlacklist}
              onRemoveBlacklist={handleRemoveBlacklist}
            />
          )}
          {adminTab === 'marketing' && (
            <MarketingPixelView
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
          {adminTab === 'settings' && (
            <SettingsView
              settings={settings}
              coupons={coupons}
              onSaveSettings={handleSaveSettings}
              onAddCoupon={handleAddCoupon}
              onDeleteCoupon={handleDeleteCoupon}
            />
          )}
        </AdminLayout>
        )
      ) : (
        /* Customer Facing Dynamic Landing Page */
        <main className="pb-16 lg:pb-0">
          {settings.sectionOrder.map((sectionKey) => {
            if (settings.sectionVisibility[sectionKey] === false) return null;
            return sectionMap[sectionKey] || null;
          })}

          <StickyMobileBar
            product={product}
            settings={settings}
            onScrollToCheckout={scrollToCheckout}
          />
          <FloatingChatButtons />
        </main>
      )}

      {/* Thank You Page Order Confirmation Modal */}
      {completedOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-center space-y-4 animate-in zoom-in duration-200">
            <button
              onClick={() => setCompletedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1 font-bold cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                অর্ডার সফলভাবে গৃহীত হয়েছে!
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">ধন্যবাদ, {completedOrder.customerName}!</h3>
              <p className="text-xs text-slate-600">
                আপনার ক্যাশ অন ডেলিভারি অর্ডারটি কনফার্ম করা হয়েছে। আমাদের কুরিয়ার টিম শীঘ্রই ফোন করবে।
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
                <span>অর্ডার আইডি:</span>
                <span className="font-mono text-emerald-700">{completedOrder.orderNumber}</span>
              </div>

              <div className="flex justify-between text-slate-700">
                <span>মোবাইল নম্বর:</span>
                <span className="font-mono font-semibold">{completedOrder.phone}</span>
              </div>

              <div className="flex justify-between text-slate-700">
                <span>ডেলিভারি ঠিকানা:</span>
                <span className="font-medium text-right max-w-[200px]">
                  {completedOrder.address}, {completedOrder.upazila}, {completedOrder.district}
                </span>
              </div>

              <div className="flex justify-between font-extrabold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                <span>মোট বিল (ক্যাশ অন ডেলিভারি):</span>
                <span className="text-emerald-600">৳{completedOrder.totalAmount}</span>
              </div>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2 text-left">
              <Truck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>২৪ থেকে ৪৮ ঘন্টার মধ্যে ডেলিভারিম্যান আপনার গন্তব্যে কল দিয়ে পার্সেল পৌঁছাবে।</span>
            </div>

            <button
              onClick={() => setCompletedOrder(null)}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
