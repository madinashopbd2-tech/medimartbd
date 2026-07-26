/**
 * Order Management & Checkout Server Action Handler
 * Coordinates Anti-Fraud checks, Database storage, Meta CAPI dispatching, and Telegram Alerts
 */

import { AntiFraudService } from '../../services/anti-fraud.service';
import { dispatchAllServerMarketingEvents, addMarketingLog } from '../../lib/marketing/server-capi';
import { OrderData, StoreSettings, ProductData } from '../../types';

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
 * Main Action to create order atomically
 */
export async function createOrderAction(
  input: CreateOrderInput,
  settings: StoreSettings,
  product: ProductData,
  existingPhoneOrdersCount = 0,
  isBlacklisted = false,
  ipAddress = '127.0.0.1'
): Promise<CreateOrderResult> {
  // 1. Evaluate Anti-Fraud & Risk Score
  const riskEval = await AntiFraudService.evaluateRisk({
    phone: input.phone,
    customerName: input.customerName,
    address: input.address,
    district: input.district,
    upazila: input.upazila,
    totalAmount: input.totalAmount,
    recentOrdersFromPhone: existingPhoneOrdersCount,
    isBlacklisted,
    ipAddress,
  });

  if (riskEval.isBlocked) {
    return {
      success: false,
      error: riskEval.blockReason || 'অর্ডার গ্রহণ করা সম্ভব হচ্ছে না। অনুগ্রহ করে যোগাযোগ করুন।',
    };
  }

  // 2. Check Smart OTP condition
  if (riskEval.requiresOtp && !input.isOtpVerified) {
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    return {
      success: false,
      requiresOtp: true,
      otpCodeSimulated: randomOtp,
      error: 'নিরাপত্তার স্বার্থে ওটিপি ভেরিফিকেশন প্রয়োজন।',
    };
  }

  // 3. Construct Order Record
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
    },
    customData: {
      currency: 'BDT',
      value: input.totalAmount,
      content_name: product.title,
      num_items: input.quantity,
      delivery_fee: input.deliveryFee,
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
