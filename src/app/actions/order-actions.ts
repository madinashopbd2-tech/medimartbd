/**
 * Order Management & Checkout Server Action Handler
 * Coordinates Anti-Fraud checks, Database storage, Meta CAPI dispatching, and Telegram Alerts
 */

import { AntiFraudService } from '../../services/anti-fraud.service';
import { dispatchAllServerMarketingEvents, addMarketingLog } from '../../lib/marketing/server-capi';
import { OrderData, StoreSettings, ProductData, BlacklistEntry } from '../../types';

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  address: string;
  district: string;
  upazila: string;
  quantity: number;
  unitPrice: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  orderNote?: string;
  isOtpVerified?: boolean;
  deviceId?: string;
  fbp?: string;
  fbc?: string;
  fbclid?: string;
  ttclid?: string;
  gclid?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface CreateOrderResult {
  success: boolean;
  order?: OrderData;
  error?: string;
  requiresOtp?: boolean;
  otpCodeSimulated?: string;
}

/**
 * Handle Telegram Bot Instant Order Notification
 */
async function sendTelegramAlert(botToken?: string, chatId?: string, order?: OrderData) {
  if (!botToken || !chatId || !order) return;
  
  const textMsg = `🛍️ *নতুন ক্যাশ অন ডেলিভারি অর্ডার!*
  
📦 *অর্ডার আইডি:* \`${order.orderNumber}\`
👤 *গ্রাহক:* ${order.customerName}
📞 *ফোন:* \`${order.phone}\`
📍 *ঠিকানা:* ${order.address}, ${order.upazila}, ${order.district}
💰 *মোট টাকা:* ৳${order.totalAmount} (কুরিয়ার চার্জ ৳${order.deliveryFee})
⚠️ *ঝুঁকি মাত্রা (Risk):* ${order.riskLevel} (স্কোর: ${order.riskScore}/100)
  
গাড়ির চাকা ঘোরান, ডেলিভারি রেডি করুন!🚀`;

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: textMsg,
        parse_mode: 'Markdown',
      }),
    });
  } catch (err) {
    console.warn('Telegram notification failed:', err);
  }
}

/**
 * Main Action to create order atomically with Anti-Fraud and Repeat Order Blocking
 */
export async function createOrderAction(
  input: CreateOrderInput,
  settings: StoreSettings,
  product: ProductData,
  existingOrders: OrderData[] = [],
  blacklist: BlacklistEntry[] = [],
  ipAddress = '127.0.0.1'
): Promise<CreateOrderResult> {
  const cleanPhone = input.phone.replace(/\s+/g, '').replace(/^(\+88|88)/, '');

  // 1. Permanent Blacklist Check (by Phone, IP, or Device ID)
  const isPhoneBlacklisted = blacklist.some((b) => {
    const val = (b.value || b.phone || '').replace(/\s+/g, '').replace(/^(\+88|88)/, '');
    return (b.type === 'PHONE' || !b.type) && val === cleanPhone;
  });

  const isIpBlacklisted = ipAddress && ipAddress !== '127.0.0.1' && blacklist.some((b) => {
    const val = b.value || b.ipAddress || '';
    return (b.type === 'IP' || b.ipAddress) && val === ipAddress;
  });

  const isDeviceBlacklisted = input.deviceId && blacklist.some((b) => {
    const val = b.value || b.deviceId || '';
    return (b.type === 'DEVICE' || b.deviceId) && val === input.deviceId;
  });

  if (isPhoneBlacklisted || isIpBlacklisted || isDeviceBlacklisted) {
    const matchedEntry = blacklist.find((b) => {
      const pVal = (b.value || b.phone || '').replace(/\s+/g, '').replace(/^(\+88|88)/, '');
      if ((b.type === 'PHONE' || !b.type) && pVal === cleanPhone) return true;
      if (ipAddress && (b.type === 'IP' || b.ipAddress) && (b.value === ipAddress || b.ipAddress === ipAddress)) return true;
      if (input.deviceId && (b.type === 'DEVICE' || b.deviceId) && (b.value === input.deviceId || b.deviceId === input.deviceId)) return true;
      return false;
    });

    return {
      success: false,
      error: `অর্ডার গ্রহণ করা সম্ভব হচ্ছে না। সিকিউরিটি সতর্কতা: ${matchedEntry?.reason || 'আপনার ফোন নম্বর/আইপি বা ডিভাইস ব্ল্যাকলিস্টেড রয়েছে'}। সহায়তার জন্য যোগাযোগ করুন।`,
    };
  }

  // 2. Repeat Order Cooldown Timer Engine
  // Blocks customers from placing multiple orders within the admin-defined cooldown window
  if (settings.enableRepeatOrderBlock !== false) {
    const cooldownMinutes = settings.repeatOrderCooldownMinutes && settings.repeatOrderCooldownMinutes > 0
      ? settings.repeatOrderCooldownMinutes
      : 60;
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const now = Date.now();

    const blockPhone = settings.blockByPhone !== false;
    const blockIp = settings.blockByIp !== false;
    const blockDevice = settings.blockByDevice !== false;

    // Find any recent order from same phone, IP, or device
    const matchingRecentOrder = existingOrders.find((ord) => {
      if (ord.status === 'CANCELLED') return false; // Ignore cancelled orders
      const orderTime = new Date(ord.createdAt).getTime();
      const elapsed = now - orderTime;
      if (elapsed > cooldownMs) return false;

      const cleanOrdPhone = ord.phone.replace(/\s+/g, '').replace(/^(\+88|88)/, '');
      const phoneMatch = blockPhone && cleanOrdPhone === cleanPhone;
      const ipMatch = blockIp && ipAddress && ipAddress !== '127.0.0.1' && ord.ipAddress === ipAddress;
      const devMatch = blockDevice && input.deviceId && ord.deviceId === input.deviceId;

      return phoneMatch || ipMatch || devMatch;
    });

    if (matchingRecentOrder) {
      const orderTime = new Date(matchingRecentOrder.createdAt).getTime();
      const elapsed = now - orderTime;
      const remainingMs = cooldownMs - elapsed;
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));

      let timeText = '';
      if (remainingMinutes >= 60) {
        const hours = Math.floor(remainingMinutes / 60);
        const mins = remainingMinutes % 60;
        timeText = mins > 0 ? `${hours} ঘণ্টা ${mins} মিনিট` : `${hours} ঘণ্টা`;
      } else {
        timeText = `${remainingMinutes} মিনিট`;
      }

      const defaultMsg = `আপনার একটি অর্ডার (#${matchingRecentOrder.orderNumber}) ইতিমধ্যে সফলভাবে গ্রহণ করা হয়েছে! একই সাথে একাধিক রিপিট অর্ডার গ্রহণ করা হয় না। সিকিউরিটির স্বার্থে আর ${timeText} পর পুনরায় নতুন অর্ডার করতে পারবেন।`;
      
      const responseMsg = settings.repeatBlockMessage 
        ? `${settings.repeatBlockMessage} (অবশিষ্ট সময়: ${timeText})`
        : defaultMsg;

      return {
        success: false,
        error: responseMsg,
      };
    }
  }

  // 3. Evaluate Anti-Fraud & Risk Score
  const existingPhoneOrdersCount = existingOrders.filter((o) => {
    const op = o.phone.replace(/\s+/g, '').replace(/^(\+88|88)/, '');
    return op === cleanPhone;
  }).length;

  const riskEval = await AntiFraudService.evaluateRisk({
    phone: input.phone,
    customerName: input.customerName,
    address: input.address,
    district: input.district,
    upazila: input.upazila,
    totalAmount: input.totalAmount,
    recentOrdersFromPhone: existingPhoneOrdersCount,
    isBlacklisted: false,
    ipAddress,
  });

  if (riskEval.isBlocked) {
    return {
      success: false,
      error: riskEval.blockReason || 'অর্ডার গ্রহণ করা সম্ভব হচ্ছে না। অনুগ্রহ করে যোগাযোগ করুন।',
    };
  }

  // 4. Check Smart OTP condition
  if (riskEval.requiresOtp && !input.isOtpVerified) {
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    return {
      success: false,
      requiresOtp: true,
      otpCodeSimulated: randomOtp,
      error: 'নিরাপত্তার স্বার্থে ওটিপি ভেরিফিকেশন প্রয়োজন।',
    };
  }

  // 5. Construct Order Record
  const timestamp = Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `ord_${timestamp}_${randomSuffix}`;
  const orderNumber = `COD-${Math.floor(10000 + Math.random() * 90000)}`;
  const eventId = `purchase_${orderId}`; // Deterministic event_id for Meta CAPI deduplication

  const newOrder: OrderData = {
    id: orderId,
    orderNumber,
    customerName: input.customerName,
    phone: input.phone,
    address: input.address,
    district: input.district,
    upazila: input.upazila,
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    deliveryFee: input.deliveryFee,
    discountAmount: input.discountAmount,
    totalAmount: input.totalAmount,
    paymentMethod: 'COD',
    status: 'PENDING',
    riskLevel: riskEval.riskLevel,
    riskScore: riskEval.riskScore,
    riskReasons: riskEval.reasons,
    orderNote: input.orderNote,
    ipAddress,
    deviceId: input.deviceId,
    eventId,
    isOtpVerified: !!input.isOtpVerified,
    createdAt: new Date().toISOString(),
  };

  // 4. Fire Server-Side Marketing Events (Meta CAPI, TikTok Events API, GA4 MP)
  const eventPayload = {
    eventName: 'Purchase' as const,
    eventId,
    eventTime: Math.floor(Date.now() / 1000),
    userData: {
      phone: input.phone,
      name: input.customerName,
      address: input.address,
      district: input.district,
      ipAddress,
      fbp: input.fbp,
      fbc: input.fbc,
      fbclid: input.fbclid,
      ttclid: input.ttclid,
      gclid: input.gclid,
      externalId: input.deviceId,
    },
    customData: {
      currency: 'BDT',
      value: input.totalAmount,
      content_name: product.title,
      num_items: input.quantity,
      delivery_fee: input.deliveryFee,
      utm_source: input.utmSource,
      utm_medium: input.utmMedium,
      utm_campaign: input.utmCampaign,
    },
  };

  if (settings.firePurchaseOnlyOnConfirm) {
    // Log deferred status
    const summaryStr = `Val: ৳${input.totalAmount}, OrderID: ${orderNumber}, Customer: ${input.customerName}`;
    addMarketingLog({
      platform: 'Meta CAPI',
      eventId,
      eventName: 'Purchase',
      status: 'DEFERRED',
      statusCode: 200,
      responseMessage: 'Purchase CAPI deferred until Admin confirms order',
      payloadSummary: summaryStr,
    });
    addMarketingLog({
      platform: 'TikTok Events API',
      eventId,
      eventName: 'CompletePayment',
      status: 'DEFERRED',
      statusCode: 200,
      responseMessage: 'CompletePayment deferred until Admin confirms order',
      payloadSummary: summaryStr,
    });
    addMarketingLog({
      platform: 'GA4 MP',
      eventId,
      eventName: 'purchase',
      status: 'DEFERRED',
      statusCode: 200,
      responseMessage: 'Purchase deferred until Admin confirms order',
      payloadSummary: summaryStr,
    });

    // Fire InitiateCheckout server CAPI event immediately
    await dispatchAllServerMarketingEvents(settings, {
      ...eventPayload,
      eventName: 'InitiateCheckout',
      eventId: `init_${eventId}`,
    });
  } else {
    // Fire Purchase / CompletePayment events immediately
    await dispatchAllServerMarketingEvents(settings, eventPayload);
  }

  // 5. Send Telegram Notification
  if (settings.telegramBotToken && settings.telegramChatId) {
    sendTelegramAlert(settings.telegramBotToken, settings.telegramChatId, newOrder);
  }

  return {
    success: true,
    order: newOrder,
  };
}
