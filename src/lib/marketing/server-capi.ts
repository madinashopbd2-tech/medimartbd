/**
 * Server-Side Marketing Event Engine (Meta CAPI + TikTok Events API + GA4 Measurement)
 * Handles deterministic event deduplication (event_id), SHA-256 privacy hashing,
 * and live terminal logging for Admin panel monitoring.
 */

import crypto from 'crypto';

export interface MarketingUserData {
  phone?: string;
  name?: string;
  email?: string;
  address?: string;
  district?: string;
  ipAddress?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  fbclid?: string;
  ttclid?: string;
  gclid?: string;
  externalId?: string;
}

export interface MarketingEventPayload {
  eventName: 
    | 'Purchase' 
    | 'CompletePayment' 
    | 'InitiateCheckout' 
    | 'ViewContent' 
    | 'PageView'
    | 'WatchVideo'
    | 'PageScroll'
    | 'TimeOnPage'
    | 'ScrollDepth'
    | 'InternalClick'
    | 'OutboundClick'
    | string;
  eventId: string; // e.g., purchase_ord_12345 or evt_12345
  eventTime?: number;
  eventSourceUrl?: string;
  userData: MarketingUserData;
  customData: {
    currency?: string;
    value?: number;
    content_name?: string;
    content_type?: string;
    content_ids?: string[];
    content_category?: string;
    num_items?: number;
    delivery_fee?: number;
    scroll_depth?: string | number;
    time_spent?: number;
    video_title?: string;
    video_url?: string;
    element_name?: string;
    click_target?: string;
    outbound_url?: string;
    channel?: string;
    [key: string]: any;
  };
}

export interface MarketingLogEntry {
  id: string;
  platform: 'Meta CAPI' | 'TikTok Events API' | 'GA4 MP';
  eventName: string;
  eventId: string;
  status: 'SUCCESS' | 'FAILED' | 'SIMULATED' | 'DEFERRED';
  statusCode: number;
  responseMessage: string;
  timestamp: string;
  payloadSummary: string;
  rawPayload?: any;
}

// In-memory log table accessible by Admin Dashboard
export const marketingLogsMemory: MarketingLogEntry[] = [];

export function addMarketingLog(log: Omit<MarketingLogEntry, 'id' | 'timestamp'>) {
  const fullLog: MarketingLogEntry = {
    ...log,
    id: `mkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }) + ' ' + new Date().toISOString().slice(0, 10),
  };
  marketingLogsMemory.unshift(fullLog);
  if (marketingLogsMemory.length > 100) {
    marketingLogsMemory.pop();
  }
  return fullLog;
}

/**
 * SHA-256 Hash helper for privacy compliance
 */
export function hashData(value: string | undefined | null): string {
  if (!value) return '';
  const normalized = value.trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Clean & normalize BD phone number for hashing (e.g. 017... -> 88017...)
 */
export function normalizeBdPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('01')) {
    cleaned = '88' + cleaned;
  }
  return cleaned;
}

/**
 * 1. Meta Conversions API (CAPI) Dispatcher
 */
export async function sendMetaCapiEvent(
  pixelId: string | null | undefined,
  accessToken: string | null | undefined,
  payload: MarketingEventPayload,
  testEventCode?: string | null
): Promise<{ success: boolean; log: MarketingLogEntry }> {
  const { eventName, eventId, eventTime, userData, customData, eventSourceUrl } = payload;

  const hashedPhone = hashData(normalizeBdPhone(userData.phone || ''));
  const hashedName = hashData(userData.name || '');
  const hashedCity = hashData(userData.district || '');
  const hashedEmail = hashData(userData.email || '');

  // Meta First-Party Cookie IDs: _fbp and _fbc
  const fbp = userData.fbp?.trim() || undefined;
  let fbc = userData.fbc?.trim() || undefined;
  if (!fbc && userData.fbclid?.trim()) {
    fbc = `fb.1.${Math.floor(Date.now() / 1000)}.${userData.fbclid.trim()}`;
  }
  const hashedExternalId = userData.externalId?.trim() ? hashData(userData.externalId.trim()) : undefined;

  // Build clean, compliant user_data object for Meta Graph API
  // Rule: Meta CAPI explicitly penalizes empty arrays (e.g. ph: []).
  // Parameters must ONLY be included if they have valid non-empty hashed values.
  const metaUserData: Record<string, any> = {};

  if (hashedPhone) {
    metaUserData.ph = [hashedPhone];
  }
  if (hashedName) {
    metaUserData.fn = [hashedName];
  }
  if (hashedCity) {
    metaUserData.ct = [hashedCity];
  }
  if (hashedEmail) {
    metaUserData.em = [hashedEmail];
  }

  // Country code must be SHA-256 hashed lowercase 2-letter code ('bd')
  // Only send when customer demographic or contact signals exist
  if (hashedPhone || hashedCity || hashedName || hashedEmail) {
    metaUserData.country = [hashData('bd')];
  }

  // First-party cookie parameters (never hashed)
  if (fbp) {
    metaUserData.fbp = fbp;
  }
  if (fbc) {
    metaUserData.fbc = fbc;
  }

  // External ID (hashed array of strings)
  if (hashedExternalId) {
    metaUserData.external_id = [hashedExternalId];
  }

  // Client IP address: Meta requires valid public IP. Omit loopback / private IPs (127.0.0.1, ::1)
  const clientIp = userData.ipAddress?.trim();
  const isPrivateIp =
    !clientIp ||
    clientIp === '127.0.0.1' ||
    clientIp === '::1' ||
    clientIp.startsWith('::ffff:127.') ||
    clientIp.startsWith('10.') ||
    clientIp.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(clientIp);

  if (clientIp && !isPrivateIp) {
    metaUserData.client_ip_address = clientIp;
  }

  // Client user agent
  if (userData.userAgent?.trim()) {
    metaUserData.client_user_agent = userData.userAgent.trim();
  }

  const eventObject: any = {
    event_name: eventName,
    event_time: eventTime || Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: eventSourceUrl || 'https://malaysianbd.shop',
    action_source: 'website',
    user_data: metaUserData,
    custom_data: {
      currency: customData.currency || 'BDT',
      value: customData.value !== undefined ? customData.value : undefined,
      content_name: customData.content_name || 'Single Product',
      content_type: customData.content_type || 'product',
      content_ids: customData.content_ids || ['COD-PROD-01'],
      content_category: customData.content_category,
      num_items: customData.num_items,
      scroll_depth: customData.scroll_depth,
      time_spent: customData.time_spent,
      video_title: customData.video_title,
      video_url: customData.video_url,
      element_name: customData.element_name,
      click_target: customData.click_target,
      outbound_url: customData.outbound_url,
      channel: customData.channel,
      ...customData,
    },
  };

  const formattedPayload: any = {
    data: [eventObject],
  };

  if (testEventCode) {
    formattedPayload.test_event_code = testEventCode;
  }

  const summaryStr = `Val: ৳${customData.value}, EventID: ${eventId}, User: ${userData.name || 'Anon'}`;

  const cleanPixelId = (pixelId || '').trim();
  const cleanAccessToken = (accessToken || '').trim();
  const cleanTestCode = (testEventCode || '').trim();

  if (!cleanPixelId || !cleanAccessToken) {
    const simLog = addMarketingLog({
      platform: 'Meta CAPI',
      eventId,
      eventName,
      status: 'SIMULATED',
      statusCode: 200,
      responseMessage: 'Simulated Meta CAPI (Set Meta Pixel ID & Access Token in Settings to enable live dispatch)',
      payloadSummary: summaryStr,
      rawPayload: formattedPayload,
    });
    return { success: true, log: simLog };
  }

  if (cleanTestCode) {
    formattedPayload.test_event_code = cleanTestCode;
  }

  try {
    let url = `https://graph.facebook.com/v19.0/${cleanPixelId}/events?access_token=${encodeURIComponent(cleanAccessToken)}`;
    if (cleanTestCode) {
      url += `&test_event_code=${encodeURIComponent(cleanTestCode)}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanAccessToken}`,
      },
      body: JSON.stringify(formattedPayload),
    });

    const resData: any = await response.json();
    const isOk = response.ok && !resData.error;

    console.log(`[Meta CAPI] Dispatch ${eventName} [${eventId}] -> HTTP ${response.status} (Events: ${resData?.events_received ?? 'N/A'})`);
    if (!isOk) {
      console.error('[Meta CAPI Error]', JSON.stringify(resData.error || resData));
    }

    const log = addMarketingLog({
      platform: 'Meta CAPI',
      eventId,
      eventName,
      status: isOk ? 'SUCCESS' : 'FAILED',
      statusCode: response.status,
      responseMessage: isOk ? `Events Received: ${resData.events_received || 1}` : JSON.stringify(resData.error || resData),
      payloadSummary: summaryStr,
      rawPayload: formattedPayload,
    });

    return { success: isOk, log };
  } catch (err: any) {
    console.error('[Meta CAPI Exception]', err);
    const log = addMarketingLog({
      platform: 'Meta CAPI',
      eventId,
      eventName,
      status: 'FAILED',
      statusCode: 500,
      responseMessage: err?.message || 'Network error executing CAPI fetch',
      payloadSummary: summaryStr,
      rawPayload: formattedPayload,
    });
    return { success: false, log };
  }
}

/**
 * 2. TikTok Events API Dispatcher
 */
export async function sendTikTokEventsApi(
  pixelId: string | null | undefined,
  accessToken: string | null | undefined,
  payload: MarketingEventPayload,
  testEventCode?: string | null
): Promise<{ success: boolean; log: MarketingLogEntry }> {
  const { eventName, eventId, eventTime, userData, customData } = payload;

  // Map Meta event names to TikTok Event names
  let ttEventName = 'CompletePayment';
  if (eventName === 'InitiateCheckout') ttEventName = 'InitiateCheckout';
  if (eventName === 'ViewContent') ttEventName = 'ViewContent';
  if (eventName === 'PageView') ttEventName = 'PageView';

  const hashedPhone = hashData(normalizeBdPhone(userData.phone || ''));
  const hashedEmail = hashData(userData.email || '');

  const reqBody: any = {
    event_source: 'web',
    event_source_id: pixelId || 'SIMULATED_TIKTOK_PIXEL',
    data: [
      {
        event: ttEventName,
        event_time: eventTime || Math.floor(Date.now() / 1000),
        event_id: eventId,
        user: {
          phone_number: hashedPhone || undefined,
          email: hashedEmail || undefined,
          ip: userData.ipAddress && !userData.ipAddress.startsWith('127.') && userData.ipAddress !== '::1' ? userData.ipAddress : undefined,
          user_agent: userData.userAgent || 'Mozilla/5.0',
          ttclid: userData.ttclid || undefined,
          external_id: userData.externalId ? hashData(userData.externalId) : undefined,
        },
        properties: {
          currency: customData.currency || 'BDT',
          value: customData.value,
          content_type: 'product',
          contents: [
            {
              price: customData.value,
              quantity: customData.num_items || 1,
              content_id: customData.content_ids?.[0] || 'COD-PROD-01',
              content_name: customData.content_name || 'Single Product',
            },
          ],
        },
      },
    ],
  };

  if (testEventCode) {
    reqBody.test_event_code = testEventCode;
  }

  const summaryStr = `Val: ৳${customData.value}, EventID: ${eventId}, Event: ${ttEventName}`;

  if (!pixelId || !accessToken) {
    const simLog = addMarketingLog({
      platform: 'TikTok Events API',
      eventId,
      eventName: ttEventName,
      status: 'SIMULATED',
      statusCode: 200,
      responseMessage: 'Simulated TikTok Events API (Set TikTok Pixel ID & Token in Settings to enable live dispatch)',
      payloadSummary: summaryStr,
      rawPayload: reqBody,
    });
    return { success: true, log: simLog };
  }

  try {
    const url = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken,
      },
      body: JSON.stringify(reqBody),
    });

    const resData = await response.json();
    const isOk = response.ok && resData.code === 0;

    const log = addMarketingLog({
      platform: 'TikTok Events API',
      eventId,
      eventName: ttEventName,
      status: isOk ? 'SUCCESS' : 'FAILED',
      statusCode: response.status,
      responseMessage: isOk ? 'Event Tracked Successfully' : (resData.message || JSON.stringify(resData)),
      payloadSummary: summaryStr,
      rawPayload: reqBody,
    });

    return { success: isOk, log };
  } catch (err: any) {
    const log = addMarketingLog({
      platform: 'TikTok Events API',
      eventId,
      eventName: ttEventName,
      status: 'FAILED',
      statusCode: 500,
      responseMessage: err?.message || 'TikTok CAPI fetch error',
      payloadSummary: summaryStr,
      rawPayload: reqBody,
    });
    return { success: false, log };
  }
}

/**
 * 3. GA4 Measurement Protocol Dispatcher
 */
export async function sendGa4MeasurementApi(
  measurementId: string | null | undefined,
  apiSecret: string | null | undefined,
  payload: MarketingEventPayload
): Promise<{ success: boolean; log: MarketingLogEntry }> {
  const { eventName, eventId, userData, customData } = payload;

  let gaEventName = 'purchase';
  if (eventName === 'InitiateCheckout') gaEventName = 'begin_checkout';
  if (eventName === 'ViewContent') gaEventName = 'view_item';

  const clientId = userData.externalId || (userData.fbp ? userData.fbp.replace(/^fb\.\d+\./, '') : '') || `${Date.now()}.${Math.floor(Math.random() * 100000)}`;

  const reqBody: any = {
    client_id: clientId,
    events: [
      {
        name: gaEventName,
        params: {
          transaction_id: eventId,
          value: customData.value,
          currency: customData.currency || 'BDT',
          ...(userData.gclid ? { gclid: userData.gclid } : {}),
          items: [
            {
              item_id: customData.content_ids?.[0] || 'COD-PROD-01',
              item_name: customData.content_name || 'Single Product',
              price: customData.value,
              quantity: customData.num_items || 1,
            },
          ],
        },
      },
    ],
  };

  const summaryStr = `Val: ৳${customData.value}, EventID: ${eventId}, Event: ${gaEventName}`;

  if (!measurementId || !apiSecret) {
    const simLog = addMarketingLog({
      platform: 'GA4 MP',
      eventId,
      eventName: gaEventName,
      status: 'SIMULATED',
      statusCode: 200,
      responseMessage: 'Simulated GA4 Measurement Protocol (Set GA4 Measurement ID & API Secret in Settings)',
      payloadSummary: summaryStr,
      rawPayload: reqBody,
    });
    return { success: true, log: simLog };
  }

  try {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody),
    });

    const isOk = response.ok;

    const log = addMarketingLog({
      platform: 'GA4 MP',
      eventId,
      eventName: gaEventName,
      status: isOk ? 'SUCCESS' : 'FAILED',
      statusCode: response.status,
      responseMessage: isOk ? 'GA4 Measurement Payload Accepted' : `HTTP ${response.status}`,
      payloadSummary: summaryStr,
      rawPayload: reqBody,
    });

    return { success: isOk, log };
  } catch (err: any) {
    const log = addMarketingLog({
      platform: 'GA4 MP',
      eventId,
      eventName: gaEventName,
      status: 'FAILED',
      statusCode: 500,
      responseMessage: err?.message || 'GA4 MP Fetch Error',
      payloadSummary: summaryStr,
      rawPayload: reqBody,
    });
    return { success: false, log };
  }
}

/**
 * Dispatch all server-side marketing APIs in parallel
 */
export async function dispatchAllServerMarketingEvents(
  settings: any,
  payload: MarketingEventPayload
) {
  const safeSettings = settings || {};
  const metaPixelId = safeSettings.metaPixelId || safeSettings.pixelId || '';
  const metaToken = safeSettings.metaCapiToken || safeSettings.metaCapiAccessToken || safeSettings.metaAccessToken || '';
  const metaTestCode = safeSettings.metaTestEventCode || safeSettings.testEventCode || '';

  const metaPromise = sendMetaCapiEvent(
    metaPixelId,
    metaToken,
    payload,
    metaTestCode
  );

  const tikTokPromise = sendTikTokEventsApi(
    safeSettings.tikTokPixelId || safeSettings.ttPixelId || '',
    safeSettings.tikTokAccessToken || safeSettings.tikTokEventsApiToken || '',
    payload,
    safeSettings.tikTokTestEventCode || ''
  );

  const ga4Promise = sendGa4MeasurementApi(
    safeSettings.gaMeasurementId || '',
    safeSettings.gaApiSecret || '',
    payload
  );

  const [metaRes, tikTokRes, ga4Res] = await Promise.all([
    metaPromise,
    tikTokPromise,
    ga4Promise,
  ]);

  return { metaRes, tikTokRes, ga4Res };
}
