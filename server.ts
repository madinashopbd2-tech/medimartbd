import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_PRODUCT,
  INITIAL_SETTINGS,
  INITIAL_REVIEWS,
  INITIAL_FAQS,
  INITIAL_COUPONS,
  INITIAL_SAMPLE_ORDERS,
  INITIAL_INCOMPLETE_ORDERS,
} from './src/data/initial-store-data';
import { createOrderAction } from './src/app/actions/order-actions';
import { dispatchAllServerMarketingEvents, marketingLogsMemory } from './src/lib/marketing/server-capi';
import { ProductData, StoreSettings, OrderData, ReviewData, FaqData, CouponData, BlacklistEntry, IncompleteOrderData } from './src/types';

// Derive __dirname safely for CJS/ESM compatibility
const safeDirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
const DATA_FILE = path.join(safeDirname, 'data_store.json');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// In-Memory Database Engine
let currentProduct: ProductData = { ...INITIAL_PRODUCT };
let currentSettings: StoreSettings = { ...INITIAL_SETTINGS };
let currentReviews: ReviewData[] = [...INITIAL_REVIEWS];
let currentFaqs: FaqData[] = [...INITIAL_FAQS];
let currentCoupons: CouponData[] = [...INITIAL_COUPONS];
let currentOrders: OrderData[] = [...INITIAL_SAMPLE_ORDERS];
let currentIncompleteOrders: IncompleteOrderData[] = [...INITIAL_INCOMPLETE_ORDERS];
let currentBlacklist: BlacklistEntry[] = [
  { id: 'bl_1', type: 'PHONE', value: '01700000000', phone: '01700000000', reason: 'Sequential fake number pattern', createdAt: new Date().toISOString() },
];

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      if (data.product) currentProduct = data.product;
      if (data.settings) currentSettings = { ...currentSettings, ...data.settings };
      if (data.reviews) currentReviews = data.reviews;
      if (data.faqs) currentFaqs = data.faqs;
      if (data.coupons) currentCoupons = data.coupons;
      if (data.orders) currentOrders = data.orders;
      if (data.incompleteOrders) currentIncompleteOrders = data.incompleteOrders;
      if (data.blacklist) currentBlacklist = data.blacklist;
    } catch (err) {
      console.error('Error reading data_store.json', err);
    }
  }
}

function saveData() {
  const data = {
    product: currentProduct,
    settings: currentSettings,
    reviews: currentReviews,
    faqs: currentFaqs,
    coupons: currentCoupons,
    orders: currentOrders,
    incompleteOrders: currentIncompleteOrders,
    blacklist: currentBlacklist,
  };
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing data_store.json', err);
  }
}

// Load initial data
loadData();

async function startServer() {
  const app = express();

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get Store Data
  app.get('/api/store-data', (req, res) => {
    res.json({
      product: currentProduct,
      settings: currentSettings,
      reviews: currentReviews,
      faqs: currentFaqs,
      coupons: currentCoupons,
      orders: currentOrders,
      incompleteOrders: currentIncompleteOrders,
      blacklist: currentBlacklist,
    });
  });

  // Track Incomplete / Abandoned Order Lead (Auto-captured when user fills name/phone/address)
  app.post('/api/incomplete-orders', (req, res) => {
    try {
      const { customerName = '', phone = '', address = '', deliveryLocation, quantity = 1, discountAmount = 0 } = req.body;
      
      const cleanPhone = phone.trim();
      const cleanName = customerName.trim();

      // Only save if at least phone or name is entered
      if (!cleanPhone && !cleanName) {
        return res.json({ success: true, ignored: true });
      }

      const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const clientIp = rawIp.split(',')[0].trim();
      const deviceId = (req.headers['x-device-id'] as string) || req.body.deviceId || '';

      const unitPrice = currentProduct.offerPrice || currentProduct.regularPrice;
      const insideFee = currentSettings.deliveryFeeInside ?? 70;
      const outsideFee = currentSettings.deliveryFeeOutside ?? 130;
      const deliveryFee = deliveryLocation === 'outside' ? outsideFee : insideFee;
      const totalAmount = Math.max(0, unitPrice * quantity + deliveryFee - discountAmount);

      // Check if this phone or IP already has an existing incomplete order that was not completed
      const existingIdx = currentIncompleteOrders.findIndex(
        (inc) => (cleanPhone && inc.phone === cleanPhone) || (deviceId && inc.deviceId === deviceId)
      );

      const nowIso = new Date().toISOString();

      if (existingIdx !== -1) {
        // Update existing record
        currentIncompleteOrders[existingIdx] = {
          ...currentIncompleteOrders[existingIdx],
          customerName: cleanName || currentIncompleteOrders[existingIdx].customerName,
          phone: cleanPhone || currentIncompleteOrders[existingIdx].phone,
          address: address || currentIncompleteOrders[existingIdx].address,
          deliveryLocation: deliveryLocation || currentIncompleteOrders[existingIdx].deliveryLocation,
          quantity: quantity || currentIncompleteOrders[existingIdx].quantity,
          unitPrice,
          deliveryFee,
          discountAmount,
          totalAmount,
          lastActiveAt: nowIso,
        };
      } else {
        // Create new incomplete order
        const newIncomplete: IncompleteOrderData = {
          id: `inc_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
          customerName: cleanName || 'ভিজিটর (নাম ছাড়া)',
          phone: cleanPhone || 'নম্বর লিখছেন...',
          address: address || '',
          deliveryLocation: deliveryLocation || 'inside',
          productTitle: currentProduct.title,
          quantity,
          unitPrice,
          deliveryFee,
          discountAmount,
          totalAmount,
          ipAddress: clientIp,
          deviceId,
          status: 'ABANDONED',
          lastActiveAt: nowIso,
          createdAt: nowIso,
        };
        currentIncompleteOrders.unshift(newIncomplete);
      }

      saveData();
      res.json({ success: true, incompleteOrders: currentIncompleteOrders });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Error tracking incomplete order' });
    }
  });

  // Update Incomplete Order Note / Status / Convert to Confirmed Order
  app.put('/api/incomplete-orders/:id', (req, res) => {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    const idx = currentIncompleteOrders.findIndex((inc) => inc.id === id);
    if (idx !== -1) {
      if (status) currentIncompleteOrders[idx].status = status;
      if (adminNote !== undefined) currentIncompleteOrders[idx].adminNote = adminNote;
      saveData();
      res.json({ success: true, incompleteOrder: currentIncompleteOrders[idx], incompleteOrders: currentIncompleteOrders });
    } else {
      res.status(404).json({ success: false, error: 'Incomplete order record not found' });
    }
  });

  // Delete Incomplete Order
  app.delete('/api/incomplete-orders/:id', (req, res) => {
    const { id } = req.params;
    currentIncompleteOrders = currentIncompleteOrders.filter((inc) => inc.id !== id);
    saveData();
    res.json({ success: true, incompleteOrders: currentIncompleteOrders });
  });

  // Place New Order Action
  app.post('/api/orders', async (req, res) => {
    try {
      const input = req.body;
      const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const clientIp = rawIp.split(',')[0].trim();

      const result = await createOrderAction(
        input,
        currentSettings,
        currentProduct,
        currentOrders,
        currentBlacklist,
        clientIp
      );

      if (result.success && result.order) {
        currentOrders.unshift(result.order);

        // Mark matching incomplete order as RECOVERED
        const matchedIncIdx = currentIncompleteOrders.findIndex(
          (inc) => (input.phone && inc.phone === input.phone) || (input.deviceId && inc.deviceId === input.deviceId)
        );
        if (matchedIncIdx !== -1) {
          currentIncompleteOrders[matchedIncIdx].status = 'RECOVERED';
          currentIncompleteOrders[matchedIncIdx].recoveredOrderId = result.order.id;
        }

        saveData();
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Server error creating order' });
    }
  });

  // Get Marketing Logs for Admin Terminal
  app.get('/api/marketing-logs', (req, res) => {
    res.json({ logs: marketingLogsMemory });
  });

  // Direct Server CAPI Event Dispatcher (for PageView, ViewContent, InitiateCheckout, WatchVideo, PageScroll, TimeOnPage, ScrollDepth, InternalClick, OutboundClick)
  app.post('/api/marketing/event', async (req, res) => {
    try {
      const { eventName, eventId, customData = {}, userData = {}, eventSourceUrl, settings } = req.body;
      if (!eventName) {
        return res.status(400).json({ success: false, error: 'eventName is required' });
      }

      // Merge client-sent settings with currentSettings
      if (settings && typeof settings === 'object') {
        currentSettings = {
          ...currentSettings,
          ...settings,
        };
        saveData();
      }

      // 1. Resolve real client IP across Cloudflare, Nginx, and direct proxies
      const rawIp =
        (req.headers['cf-connecting-ip'] as string) ||
        (req.headers['x-real-ip'] as string) ||
        (req.headers['x-forwarded-for'] as string) ||
        req.socket.remoteAddress ||
        '';
      const clientIp = rawIp.split(',')[0].trim();
      const userAgent = (req.headers['user-agent'] as string) || 'Mozilla/5.0';

      // 2. Parse HTTP request cookies for backup _fbp and _fbc
      const cookieHeader = req.headers.cookie || '';
      const requestCookies: Record<string, string> = {};
      if (cookieHeader) {
        cookieHeader.split(';').forEach((cookie) => {
          const parts = cookie.split('=');
          const name = parts.shift()?.trim();
          if (name) {
            requestCookies[name] = decodeURIComponent(parts.join('=').trim().replace(/^"|"$/g, ''));
          }
        });
      }
      const cookieFbp = requestCookies['_fbp'] || '';
      const cookieFbc = requestCookies['_fbc'] || '';

      // 3. Fallback domain
      const defaultDomain = req.headers.host ? `https://${req.headers.host}` : 'https://malaysianbd.shop';

      const payload = {
        eventName,
        eventId: eventId || `evt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        eventTime: Math.floor(Date.now() / 1000),
        eventSourceUrl: eventSourceUrl || req.headers.referer || defaultDomain,
        userData: {
          ipAddress: clientIp || undefined,
          userAgent,
          fbp: userData.fbp || cookieFbp || undefined,
          fbc: userData.fbc || cookieFbc || undefined,
          ...userData,
        },
        customData: {
          currency: 'BDT',
          value: customData.value || currentProduct.offerPrice || currentProduct.regularPrice,
          content_name: customData.content_name || currentProduct.title,
          content_type: 'product',
          content_ids: ['COD-PROD-01'],
          ...customData,
        },
      };

      const result = await dispatchAllServerMarketingEvents(currentSettings, payload);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Error dispatching marketing event' });
    }
  });

  // Update Order Status
  app.put('/api/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const idx = currentOrders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      const prevStatus = currentOrders[idx].status;
      currentOrders[idx].status = status;

      // If status changed to CONFIRMED, dispatch CAPI Purchase event
      if (status === 'CONFIRMED' && prevStatus !== 'CONFIRMED') {
        const ord = currentOrders[idx];
        dispatchAllServerMarketingEvents(currentSettings, {
          eventName: 'Purchase',
          eventId: ord.eventId || `purchase_${ord.id}`,
          userData: {
            phone: ord.phone,
            name: ord.customerName,
            address: ord.address,
            district: ord.district,
          },
          customData: {
            currency: 'BDT',
            value: ord.totalAmount,
            content_name: currentProduct.title,
            num_items: ord.quantity,
          },
        });
      }

      saveData();
      res.json({ success: true, order: currentOrders[idx] });
    } else {
      res.status(404).json({ success: false, error: 'Order not found' });
    }
  });

  // Update Product Details from CMS
  app.post('/api/product', (req, res) => {
    currentProduct = { ...currentProduct, ...req.body };
    saveData();
    res.json({ success: true, product: currentProduct });
  });

  // Update Store Settings from CMS
  app.post('/api/settings', (req, res) => {
    currentSettings = { ...currentSettings, ...req.body };
    saveData();
    res.json({ success: true, settings: currentSettings });
  });

  // Blacklist Management
  app.post('/api/blacklist', (req, res) => {
    const { type = 'PHONE', value, phone, ipAddress, deviceId, reason } = req.body;
    const targetValue = value || phone || ipAddress || deviceId || '';
    
    // Determine actual type
    let finalType: 'PHONE' | 'IP' | 'DEVICE' = type;
    if (phone && !value) finalType = 'PHONE';
    else if (ipAddress && !value) finalType = 'IP';
    else if (deviceId && !value) finalType = 'DEVICE';

    const newEntry: BlacklistEntry = {
      id: `bl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: finalType,
      value: targetValue,
      phone: finalType === 'PHONE' ? targetValue : phone,
      ipAddress: finalType === 'IP' ? targetValue : ipAddress,
      deviceId: finalType === 'DEVICE' ? targetValue : deviceId,
      reason: reason || 'Suspicious repeat spam or fake order activity',
      createdAt: new Date().toISOString(),
    };
    currentBlacklist.unshift(newEntry);
    saveData();
    res.json({ success: true, blacklist: currentBlacklist });
  });

  app.delete('/api/blacklist/:id', (req, res) => {
    const { id } = req.params;
    currentBlacklist = currentBlacklist.filter((b) => b.id !== id);
    saveData();
    res.json({ success: true, blacklist: currentBlacklist });
  });

  // Submit Review
  app.post('/api/reviews', (req, res) => {
    const newRev = req.body;
    currentReviews.unshift(newRev);
    saveData();
    res.json({ success: true, reviews: currentReviews });
  });

  // Edit Review
  app.put('/api/reviews/:id', (req, res) => {
    const { id } = req.params;
    const idx = currentReviews.findIndex((r) => r.id === id);
    if (idx !== -1) {
      currentReviews[idx] = { ...currentReviews[idx], ...req.body };
      saveData();
      res.json({ success: true, reviews: currentReviews });
    } else {
      res.status(404).json({ success: false, error: 'Review not found' });
    }
  });

  // Delete Review
  app.delete('/api/reviews/:id', (req, res) => {
    const { id } = req.params;
    currentReviews = currentReviews.filter((r) => r.id !== id);
    saveData();
    res.json({ success: true, reviews: currentReviews });
  });

  // Manage Coupons
  app.post('/api/coupons', (req, res) => {
    const { code, discountValue } = req.body;
    const newCoupon: CouponData = {
      id: `c_${Date.now()}`,
      code,
      discountType: 'FIXED',
      discountValue,
      minOrderValue: 0,
      isActive: true,
    };
    currentCoupons.unshift(newCoupon);
    saveData();
    res.json({ success: true, coupons: currentCoupons });
  });

  app.delete('/api/coupons/:id', (req, res) => {
    const { id } = req.params;
    currentCoupons = currentCoupons.filter((c) => c.id !== id);
    saveData();
    res.json({ success: true, coupons: currentCoupons });
  });

  // Admin Login
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (
      username === currentSettings.adminUsername &&
      password === currentSettings.adminPassword
    ) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: 'ভুল ইউজারনেম বা পাসওয়ার্ড' });
    }
  });

  // Vite Middleware for Development vs Static for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
