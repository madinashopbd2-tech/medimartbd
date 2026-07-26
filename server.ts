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
} from './src/data/initial-store-data';
import { createOrderAction } from './src/app/actions/order-actions';
import { dispatchAllServerMarketingEvents, marketingLogsMemory } from './src/lib/marketing/server-capi';
import { ProductData, StoreSettings, OrderData, ReviewData, FaqData, CouponData, BlacklistEntry } from './src/types';

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
let currentBlacklist: BlacklistEntry[] = [
  { id: 'bl_1', phone: '01700000000', reason: 'Sequential fake number pattern', createdAt: new Date().toISOString() },
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
      blacklist: currentBlacklist,
    });
  });

  // Place New Order Action
  app.post('/api/orders', async (req, res) => {
    try {
      const input = req.body;
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      // Check if phone is blacklisted
      const isBlacklisted = currentBlacklist.some((b) => b.phone === input.phone);

      // Count recent orders from same phone
      const phoneOrdersCount = currentOrders.filter((o) => o.phone === input.phone).length;

      const result = await createOrderAction(
        input,
        currentSettings,
        currentProduct,
        phoneOrdersCount,
        isBlacklisted,
        clientIp
      );

      if (result.success && result.order) {
        currentOrders.unshift(result.order);
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
    const { phone, reason } = req.body;
    const newEntry: BlacklistEntry = {
      id: `bl_${Date.now()}`,
      phone,
      reason,
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
