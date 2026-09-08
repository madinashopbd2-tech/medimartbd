/**
 * Client-Side Meta Pixel Service (Browser fbq + Server CAPI Relay)
 * Ensures single initialization, exact eventID deduplication, and safe execution.
 */

import { StoreSettings } from '../../types';
import { generateEventId, generateTransactionEventId } from './eventId';
import { logMetaDebug, MetaCustomData, MetaUserData } from './metaEvents';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    _metaPixelInitialized?: boolean;
    _pixelInitializedSettings?: StoreSettings;
  }
}

let isPixelInitialized = false;
let activePixelId = '';

/**
 * Extract or generate _fbp cookie in Meta standard format: fb.1.<timestampInMs>.<random9Digits>
 */
export function getOrCreateFbp(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(^|;\s*)_fbp=([^;]*)/);
  let fbp = match ? decodeURIComponent(match[2]).trim().replace(/^"|"$/g, '') : '';
  
  if (!fbp) {
    try {
      fbp = localStorage.getItem('_mkt_fbp') || '';
    } catch (e) {}
  }

  if (!fbp) {
    const timestampMs = Date.now();
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    fbp = `fb.1.${timestampMs}.${randomDigits}`;
    try {
      const expires = new Date(Date.now() + 90 * 864e5).toUTCString();
      document.cookie = `_fbp=${encodeURIComponent(fbp)}; expires=${expires}; path=/; SameSite=Lax`;
      localStorage.setItem('_mkt_fbp', fbp);
    } catch (e) {}
  }
  return fbp;
}

/**
 * Extract or generate _fbc cookie from fbclid query parameter: fb.1.<timestampInMs>.<fbclid>
 */
export function getOrCreateFbc(): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') return '';
  const match = document.cookie.match(/(^|;\s*)_fbc=([^;]*)/);
  let fbc = match ? decodeURIComponent(match[2]).trim().replace(/^"|"$/g, '') : '';

  if (!fbc) {
    try {
      const params = new URLSearchParams(window.location.search);
      const fbclid = params.get('fbclid') || localStorage.getItem('_mkt_fbclid') || '';
      if (fbclid) {
        localStorage.setItem('_mkt_fbclid', fbclid);
        const timestampMs = Date.now();
        fbc = `fb.1.${timestampMs}.${fbclid}`;
        const expires = new Date(Date.now() + 90 * 864e5).toUTCString();
        document.cookie = `_fbc=${encodeURIComponent(fbc)}; expires=${expires}; path=/; SameSite=Lax`;
      }
    } catch (e) {}
  }
  return fbc;
}

/**
 * Get active Meta test event code from session, URL, or global settings
 */
export function getActiveTestEventCode(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('test_event_code') || params.get('test_event_code_fb');
    if (urlCode) {
      sessionStorage.setItem('meta_test_code', urlCode);
      return urlCode;
    }
    const sessionCode = sessionStorage.getItem('meta_test_code');
    if (sessionCode) return sessionCode;

    const globalSettings = (window as any)._pixelInitializedSettings;
    const settingsCode = globalSettings?.metaTestEventCode?.trim() || globalSettings?.testEventCode?.trim();
    if (settingsCode) return settingsCode;
  } catch (e) {}
  return undefined;
}

/**
 * Initialize Meta Pixel script once in document head
 */
export function initMetaPixel(pixelId?: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  
  const resolvedPixelId = (
    pixelId ||
    (window as any)._pixelInitializedSettings?.metaPixelId ||
    (import.meta as any).env?.VITE_META_PIXEL_ID ||
    '933006219330034'
  ).toString().trim();

  if (!resolvedPixelId) return false;
  if (isPixelInitialized && activePixelId === resolvedPixelId) return true;

  activePixelId = resolvedPixelId;
  isPixelInitialized = true;
  window._metaPixelInitialized = true;

  // Standard Meta Pixel snippet
  if (!window.fbq) {
    const n: any = (window.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    const t = document.createElement('script');
    t.async = !0;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const s = document.getElementsByTagName('script')[0];
    s?.parentNode?.insertBefore(t, s);
  }

  // Pixel Init with First-Party Cookies
  try {
    const fbp = getOrCreateFbp();
    const fbc = getOrCreateFbc();
    window.fbq('init', resolvedPixelId, {
      fbp: fbp || undefined,
      fbc: fbc || undefined,
    });
  } catch (e) {
    window.fbq('init', resolvedPixelId);
  }

  return true;
}

/**
 * Send server-side CAPI event using identical event_id for deduplication
 */
async function sendServerRelay(
  eventName: string,
  eventId: string,
  customData: MetaCustomData = {},
  userData: MetaUserData = {}
) {
  if (typeof window === 'undefined') return;

  const fbp = getOrCreateFbp();
  const fbc = getOrCreateFbc();
  let externalId = '';
  try {
    externalId = localStorage.getItem('_mkt_device_id') || '';
  } catch (e) {}

  const fullUserData: MetaUserData = {
    fbp: userData.fbp || fbp || undefined,
    fbc: userData.fbc || fbc || undefined,
    externalId: userData.externalId || externalId || undefined,
    country: 'bd',
    ...userData,
  };

  const testCode = getActiveTestEventCode();
  const payload = {
    event_name: eventName,
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: window.location.href,
    action_source: 'website' as const,
    user_data: fullUserData,
    custom_data: customData,
    test_event_code: testCode || undefined,
  };

  try {
    // Send to dedicated Meta CAPI endpoint
    fetch('/api/meta/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then((res) => {
        logMetaDebug(eventName, eventId, 'Server', res.ok ? 'Sent' : 'Failed');
      })
      .catch(() => {
        logMetaDebug(eventName, eventId, 'Server', 'Failed', 'Network Error');
      });
  } catch (err) {
    // Non-blocking
  }
}

export interface TrackMetaEventOptions {
  eventName: string;
  parameters?: MetaCustomData;
  eventId?: string;
  userData?: MetaUserData;
  isCustom?: boolean;
}

/**
 * Centralized Meta Event Dispatcher (Fires Browser Pixel + Server CAPI with identical eventID)
 */
export function trackMetaEvent({
  eventName,
  parameters = {},
  eventId,
  userData = {},
  isCustom = false,
}: TrackMetaEventOptions): string {
  if (typeof window === 'undefined') return '';

  // 1. Ensure a unique, stable eventId is generated if not provided
  const resolvedEventId = eventId || generateEventId(eventName.toLowerCase().replace(/[^a-z0-9]/g, '_'));

  // 2. Prepare Meta Pixel Options with exact eventID and test_event_code (if active)
  const metaOptions: { eventID: string; test_event_code?: string } = {
    eventID: resolvedEventId,
  };
  const testCode = getActiveTestEventCode();
  if (testCode) {
    metaOptions.test_event_code = testCode;
  }

  // 3. Fire Browser Meta Pixel (if loaded)
  if (window.fbq) {
    try {
      if (isCustom) {
        window.fbq('trackCustom', eventName, parameters, metaOptions);
      } else {
        window.fbq('track', eventName, parameters, metaOptions);
      }
      logMetaDebug(eventName, resolvedEventId, 'Browser', 'Sent');
    } catch (e) {
      logMetaDebug(eventName, resolvedEventId, 'Browser', 'Failed');
    }
  } else {
    logMetaDebug(eventName, resolvedEventId, 'Browser', 'Pending', 'Pixel loading');
  }

  // 4. Relay to Server CAPI with the EXACT SAME eventName and eventId
  sendServerRelay(eventName, resolvedEventId, parameters, userData);

  return resolvedEventId;
}

// Transaction safeguards: Prevent duplicate Purchase events on page refresh
const firedPurchases = new Set<string>();

/**
 * Specialized Purchase Event Tracker
 * Guarantees stable transaction event ID and strictly prevents duplicate firing on refresh
 */
export function trackMetaPurchase({
  orderId,
  value,
  currency = 'BDT',
  contentIds = ['COD-PROD-01'],
  contentName = 'Product Order',
  numItems = 1,
  userData = {},
}: {
  orderId: string;
  value: number;
  currency?: string;
  contentIds?: string[];
  contentName?: string;
  numItems?: number;
  userData?: MetaUserData;
}): string | null {
  if (typeof window === 'undefined') return null;

  const sessionKey = `mkt_meta_purchase_fired_${orderId}`;
  try {
    if (sessionStorage.getItem(sessionKey) === '1' || firedPurchases.has(orderId)) {
      logMetaDebug('Purchase', `purchase_${orderId}`, 'Browser+Server', 'Simulated', 'Duplicate prevented on refresh');
      return null;
    }
    sessionStorage.setItem(sessionKey, '1');
  } catch (e) {}
  firedPurchases.add(orderId);

  const eventId = generateTransactionEventId(orderId);

  trackMetaEvent({
    eventName: 'Purchase',
    eventId,
    parameters: {
      value,
      currency,
      content_ids: contentIds,
      content_name: contentName,
      content_type: 'product',
      num_items: numItems,
      order_id: orderId,
    },
    userData,
    isCustom: false,
  });

  return eventId;
}

/**
 * Track Custom Event: Mantra Paid Webinar
 * Fires Browser `fbq('trackCustom', 'Mantra Paid Webinar', ...)`
 * and Server CAPI `event_name: 'Mantra Paid Webinar'` with the EXACT SAME eventID.
 */
export function trackMantraPaidWebinar(
  parameters: MetaCustomData = {},
  userData: MetaUserData = {},
  explicitEventId?: string
): string {
  const eventId = explicitEventId || generateEventId('webinar');
  return trackMetaEvent({
    eventName: 'Mantra Paid Webinar',
    parameters: {
      currency: 'BDT',
      value: parameters.value || 499,
      content_name: parameters.content_name || 'Mantra Paid Webinar Registration',
      ...parameters,
    },
    eventId,
    userData,
    isCustom: true,
  });
}
