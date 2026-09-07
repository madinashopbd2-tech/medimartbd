/**
 * Client-Side Marketing Pixel Dispatcher & Script Injector
 * Supports Meta Pixel (fbq), TikTok Pixel (ttq), GA4/Google Ads (gtag),
 * GTM (dataLayer), Scroll Depth Tracking, Time on Page Tracking, Video Watching,
 * Internal & Outbound Click Tracking, and Deterministic Event ID Deduplication (CAPI).
 */

import { StoreSettings, ProductData, OrderData } from '../../types';
import { getOrCreateDeviceId } from '../device-fingerprint';

declare global {
  interface Window {
    fbq?: any;
    ttq?: any;
    gtag?: any;
    dataLayer?: any[];
    _fbq?: any;
    _pixelInitializedSettings?: StoreSettings;
  }
}

// Session deduplication sets to avoid firing redundant events in quick succession
const firedScrollDepths = new Set<number>();
const firedTimeOnPage = new Set<number>();
let hasFiredPageView = false;
let hasFiredViewContent = false;

// Helpers to read and write first-party marketing cookies
export function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]).trim().replace(/^"|"$/g, '') : '';
}

// Alias for getCookie matching Meta nomenclature
export const getMetaCookie = getCookie;

export function setCookie(name: string, value: string, days = 90) {
  if (typeof document === 'undefined' || !value) return;
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    // Cookie restricted
  }
}

/**
 * Retrieves any saved user data (phone, name, district, email) from form inputs or localStorage
 * for Advanced Matching on Meta Pixel and Conversions API.
 */
export function getStoredUserData(): { phone?: string; name?: string; district?: string; email?: string } {
  if (typeof window === 'undefined') return {};
  let phone = '';
  let name = '';
  let district = '';
  let email = '';

  try {
    phone = localStorage.getItem('_mkt_user_phone') || '';
    name = localStorage.getItem('_mkt_user_name') || '';
    district = localStorage.getItem('_mkt_user_district') || '';
    email = localStorage.getItem('_mkt_user_email') || '';
  } catch (e) {}

  // Also probe active DOM input elements if user is currently filling out the form
  if (!phone && typeof document !== 'undefined') {
    const phoneInput = (document.querySelector('input[type="tel"]') || document.getElementById('phone')) as HTMLInputElement | null;
    if (phoneInput?.value?.trim()) {
      phone = phoneInput.value.trim();
    }
  }
  if (!name && typeof document !== 'undefined') {
    const nameInput = (document.getElementById('customerName') || document.querySelector('input[name="name"]')) as HTMLInputElement | null;
    if (nameInput?.value?.trim()) {
      name = nameInput.value.trim();
    }
  }

  const result: { phone?: string; name?: string; district?: string; email?: string } = {};
  if (phone) result.phone = phone;
  if (name) result.name = name;
  if (district) result.district = district;
  if (email) result.email = email;
  return result;
}

export function saveStoredUserData(data: { phone?: string; name?: string; district?: string; email?: string }) {
  if (typeof window === 'undefined' || !data) return;
  try {
    if (data.phone) localStorage.setItem('_mkt_user_phone', data.phone.trim());
    if (data.name) localStorage.setItem('_mkt_user_name', data.name.trim());
    if (data.district) localStorage.setItem('_mkt_user_district', data.district.trim());
    if (data.email) localStorage.setItem('_mkt_user_email', data.email.trim());
  } catch (e) {}
}

export interface MarketingClickContext {
  fbp: string;
  fbc: string;
  fbclid: string;
  ttclid: string;
  gclid: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  externalId: string;
}

/**
 * Extracts and persists first-party tracking identifiers (FBP, FBC, TTCLID, GCLID, UTMs)
 * for Maximum Event Match Quality (EMQ 9.5+) across Meta CAPI, TikTok Events API, and GA4.
 */
export function getMarketingClickContext(): MarketingClickContext {
  if (typeof window === 'undefined') {
    return {
      fbp: '',
      fbc: '',
      fbclid: '',
      ttclid: '',
      gclid: '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      externalId: '',
    };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const nowTs = Math.floor(Date.now() / 1000);

  // 1. FBCLID & _fbc
  let fbclid = urlParams.get('fbclid') || '';
  if (fbclid) {
    try {
      localStorage.setItem('_mkt_fbclid', fbclid);
    } catch (e) {}
  } else {
    try {
      fbclid = localStorage.getItem('_mkt_fbclid') || '';
    } catch (e) {}
  }

  let fbc = getCookie('_fbc');
  if (!fbc && fbclid) {
    fbc = `fb.1.${nowTs}.${fbclid}`;
    setCookie('_fbc', fbc, 90);
  }

  // 2. _fbp (Facebook Browser ID)
  let fbp = getCookie('_fbp');
  if (!fbp) {
    try {
      fbp = localStorage.getItem('_mkt_fbp') || '';
    } catch (e) {}
  }
  if (!fbp) {
    const randomSubId = Math.floor(1000000000 + Math.random() * 9000000000);
    fbp = `fb.1.${nowTs}.${randomSubId}`;
    setCookie('_fbp', fbp, 90);
    try {
      localStorage.setItem('_mkt_fbp', fbp);
    } catch (e) {}
  }

  // 3. TTCLID (TikTok Click ID)
  let ttclid = urlParams.get('ttclid') || '';
  if (ttclid) {
    try {
      localStorage.setItem('_mkt_ttclid', ttclid);
    } catch (e) {}
    setCookie('_ttclid', ttclid, 90);
  } else {
    ttclid = getCookie('_ttclid');
    if (!ttclid) {
      try {
        ttclid = localStorage.getItem('_mkt_ttclid') || '';
      } catch (e) {}
    }
  }

  // 4. GCLID (Google Click ID)
  let gclid = urlParams.get('gclid') || '';
  if (gclid) {
    try {
      localStorage.setItem('_mkt_gclid', gclid);
    } catch (e) {}
    setCookie('_gclid', gclid, 90);
  } else {
    gclid = getCookie('_gclid');
    if (!gclid) {
      try {
        gclid = localStorage.getItem('_mkt_gclid') || '';
      } catch (e) {}
    }
  }

  // 5. UTM Parameters
  const utmSource = urlParams.get('utm_source') || '';
  const utmMedium = urlParams.get('utm_medium') || '';
  const utmCampaign = urlParams.get('utm_campaign') || '';

  if (utmSource) {
    try {
      localStorage.setItem('_mkt_utm_source', utmSource);
      localStorage.setItem('_mkt_utm_medium', utmMedium);
      localStorage.setItem('_mkt_utm_campaign', utmCampaign);
    } catch (e) {}
  }

  const resolvedUtmSource = utmSource || (() => {
    try { return localStorage.getItem('_mkt_utm_source') || ''; } catch (e) { return ''; }
  })();
  const resolvedUtmMedium = utmMedium || (() => {
    try { return localStorage.getItem('_mkt_utm_medium') || ''; } catch (e) { return ''; }
  })();
  const resolvedUtmCampaign = utmCampaign || (() => {
    try { return localStorage.getItem('_mkt_utm_campaign') || ''; } catch (e) { return ''; }
  })();

  const externalId = getOrCreateDeviceId();

  return {
    fbp,
    fbc,
    fbclid,
    ttclid,
    gclid,
    utmSource: resolvedUtmSource,
    utmMedium: resolvedUtmMedium,
    utmCampaign: resolvedUtmCampaign,
    externalId,
  };
}

/**
 * Send backup event to server CAPI route for 100% event capture, deduplication with browser pixel,
 * and automatic First-Party Click ID attachment.
 */
async function sendServerEvent(eventName: string, eventId: string, customData: any = {}, userData: any = {}) {
  if (typeof window === 'undefined') return;
  try {
    const clickContext = getMarketingClickContext();
    const storedUser = getStoredUserData();
    const mergedUserData = {
      fbp: clickContext.fbp,
      fbc: clickContext.fbc,
      fbclid: clickContext.fbclid,
      ttclid: clickContext.ttclid,
      gclid: clickContext.gclid,
      externalId: clickContext.externalId,
      ...storedUser,
      ...userData,
    };

    fetch('/api/marketing/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        customData: {
          utm_source: clickContext.utmSource || undefined,
          utm_medium: clickContext.utmMedium || undefined,
          utm_campaign: clickContext.utmCampaign || undefined,
          ...customData,
        },
        userData: mergedUserData,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch (err) {
    // Ignore client fetch errors
  }
}

/**
 * Generate a unique, deterministic Event ID for Pixel + CAPI deduplication
 */
export function generateEventId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Dynamically inject pixel tracking scripts into <head> and initialize
 */
export function initTrackingScripts(settings: StoreSettings, product?: ProductData | null) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  window._pixelInitializedSettings = settings;

  // Initialize dataLayer for Google Tag Manager & GA4
  window.dataLayer = window.dataLayer || [];

  // 1. Meta Domain Verification Tag
  if (settings.metaDomainVerification?.trim()) {
    let codeVal = settings.metaDomainVerification.trim();
    const contentMatch = codeVal.match(/content=["']([^"']+)["']/i);
    if (contentMatch && contentMatch[1]) {
      codeVal = contentMatch[1];
    }
    let metaTag = document.querySelector('meta[name="facebook-domain-verification"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'facebook-domain-verification');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', codeVal);
  }

  // 2. Meta (Facebook) Pixel Script
  if (settings.metaPixelId?.trim()) {
    const pixelId = settings.metaPixelId.trim();
    if (!document.getElementById('meta-pixel-script')) {
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.id = 'meta-pixel-script';
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', pixelId);
    }
  }

  // 3. TikTok Pixel Script
  if (settings.tikTokPixelId?.trim()) {
    const ttPixelId = settings.tikTokPixelId.trim();
    if (!document.getElementById('tiktok-pixel-script')) {
      (function (w: any, d: any, t: any) {
        w.TiktokAnalyticsObject = t;
        var ttq = (w[t] = w[t] || []);
        ttq.methods = [
          'page',
          'track',
          'identify',
          'instances',
          'debug',
          'on',
          'off',
          'once',
          'ready',
          'alias',
          'group',
          'enableCookie',
          'disableCookie',
        ];
        ttq.setAndDefer = function (t: any, e: any) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        };
        for (var i = 0; i < ttq.methods.length; i++)
          ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.instance = function (t: any) {
          for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)
            ttq.setAndDefer(e, ttq.methods[n]);
          return e;
        };
        ttq.load = function (e: any, n: any) {
          var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
          (ttq._i = ttq._i || {}),
            (ttq._i[e] = []),
            (ttq._i[e]._u = i),
            (ttq._t = ttq._t || {}),
            (ttq._t[e] = +new Date()),
            (ttq._o = ttq._o || {}),
            (ttq._o[e] = n || {});
          var o = document.createElement('script');
          (o.type = 'text/javascript'),
            (o.async = !0),
            (o.id = 'tiktok-pixel-script'),
            (o.src = i + '?sdkid=' + e + '&lib=' + t);
          var a = document.getElementsByTagName('script')[0];
          a.parentNode?.insertBefore(o, a);
        };

        ttq.load(ttPixelId);
      })(window, document, 'ttq');
    }
  }

  // 4. GA4 / Google Ads Script (gtag.js)
  const gaId = settings.gaMeasurementId?.trim() || settings.googleAdsConversionId?.trim();
  if (gaId && !document.getElementById('gtag-js-script')) {
    const script = document.createElement('script');
    script.id = 'gtag-js-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    function gtag(...args: any[]) {
      window.dataLayer?.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());

    if (settings.gaMeasurementId?.trim()) {
      gtag('config', settings.gaMeasurementId.trim());
    }
    if (settings.googleAdsConversionId?.trim()) {
      gtag('config', settings.googleAdsConversionId.trim());
    }
  }

  // 5. Google Tag Manager (GTM) Script
  if (settings.gtmContainerId?.trim()) {
    const gtmId = settings.gtmContainerId.trim();
    if (!document.getElementById('gtm-container-script')) {
      (function (w: any, d: any, s: any, l: any, i: any) {
        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.id = 'gtm-container-script';
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, 'script', 'dataLayer', gtmId);
    }
  }

  // Auto dispatch PageView & ViewContent
  if (!hasFiredPageView) {
    trackClientPageView();
  }

  if (product && !hasFiredViewContent) {
    trackClientViewContent(product);
  }
}

/**
 * 1. Track PageView Event
 */
export function trackClientPageView() {
  if (typeof window === 'undefined') return;
  hasFiredPageView = true;
  const eventId = generateEventId('pageview');

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'PageView', {}, { eventID: eventId });
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq.page();
  }

  // GA4
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
    });
  }

  // GTM
  window.dataLayer?.push({
    event: 'page_view',
    page_title: document.title,
    page_location: window.location.href,
    event_id: eventId,
  });

  // Server CAPI Backup
  sendServerEvent('PageView', eventId, {
    page_title: document.title,
    page_location: window.location.href,
  });
}

/**
 * 2. Track ViewContent Event
 */
export function trackClientViewContent(product: ProductData) {
  if (typeof window === 'undefined' || !product) return;
  hasFiredViewContent = true;
  const eventId = generateEventId('viewcontent');
  const price = product.offerPrice || product.regularPrice;

  // Meta Pixel
  if (window.fbq) {
    window.fbq(
      'track',
      'ViewContent',
      {
        content_name: product.title,
        content_type: 'product',
        content_ids: ['COD-PROD-01'],
        value: price,
        currency: 'BDT',
      },
      { eventID: eventId }
    );
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track(
      'ViewContent',
      {
        content_name: product.title,
        content_type: 'product',
        content_id: 'COD-PROD-01',
        value: price,
        currency: 'BDT',
      },
      { event_id: eventId }
    );
  }

  // GA4
  if (window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'BDT',
      value: price,
      items: [{ item_id: 'COD-PROD-01', item_name: product.title, price }],
    });
  }

  // GTM
  window.dataLayer?.push({
    event: 'view_item',
    ecommerce: {
      currency: 'BDT',
      value: price,
      items: [{ item_id: 'COD-PROD-01', item_name: product.title, price }],
    },
    event_id: eventId,
  });

  // Server CAPI Backup
  sendServerEvent('ViewContent', eventId, {
    value: price,
    currency: 'BDT',
    content_name: product.title,
    content_type: 'product',
    content_ids: ['COD-PROD-01'],
  });
}

let hasInitiatedCheckoutInSession = false;
let lastInitiateCheckoutTime = 0;

/**
 * 3. Track InitiateCheckout Event (with Advanced Matching Signals)
 */
export function trackClientInitiateCheckout(
  productTitle: string,
  value: number,
  details?: any,
  userData?: { phone?: string; name?: string; district?: string; email?: string },
  force: boolean = false
) {
  if (typeof window === 'undefined') return;

  if (userData) {
    saveStoredUserData(userData);
  }

  // Deduplication guard: InitiateCheckout must ONLY fire once per session (15 min window)
  const now = Date.now();
  let sessionSent = false;
  try {
    sessionSent = sessionStorage.getItem('mkt_initiate_checkout_fired') === '1';
  } catch (e) {}

  if (!force && (hasInitiatedCheckoutInSession || sessionSent) && (now - lastInitiateCheckoutTime < 15 * 60 * 1000)) {
    return;
  }

  hasInitiatedCheckoutInSession = true;
  lastInitiateCheckoutTime = now;
  try {
    sessionStorage.setItem('mkt_initiate_checkout_fired', '1');
  } catch (e) {}

  const eventId = generateEventId('initiate_checkout');

  // Resolve user matching parameters (explicit + stored/DOM)
  if (userData) {
    saveStoredUserData(userData);
  }
  const storedUser = getStoredUserData();
  const resolvedUserData = {
    ...storedUser,
    ...userData,
  };

  // Meta Pixel with Advanced Matching parameters if phone/name present
  if (window.fbq) {
    if (resolvedUserData.phone || resolvedUserData.email) {
      try {
        const cleanPhone = resolvedUserData.phone ? resolvedUserData.phone.replace(/\D/g, '') : '';
        const normalizedPhone = cleanPhone.startsWith('01') ? '88' + cleanPhone : cleanPhone;
        const metaSettings = (window as any)._pixelInitializedSettings;
        if (metaSettings?.metaPixelId) {
          window.fbq('setUserProperties', metaSettings.metaPixelId, {
            ph: normalizedPhone || undefined,
            fn: resolvedUserData.name || undefined,
            ct: resolvedUserData.district || undefined,
            country: 'bd',
          });
        }
      } catch (e) {}
    }

    window.fbq(
      'track',
      'InitiateCheckout',
      {
        value,
        currency: 'BDT',
        content_name: productTitle,
        content_type: 'product',
        content_ids: ['COD-PROD-01'],
        ...details,
      },
      { eventID: eventId }
    );
  }

  // TikTok Pixel
  if (window.ttq) {
    if (resolvedUserData.phone) {
      try {
        window.ttq.identify({
          phone_number: resolvedUserData.phone,
          name: resolvedUserData.name,
        });
      } catch (e) {}
    }
    window.ttq.track(
      'InitiateCheckout',
      {
        value,
        currency: 'BDT',
        content_name: productTitle,
        content_type: 'product',
        content_id: 'COD-PROD-01',
      },
      { event_id: eventId }
    );
  }

  // GA4
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      value,
      currency: 'BDT',
      items: [{ item_id: 'COD-PROD-01', item_name: productTitle, price: value }],
    });
  }

  // GTM
  window.dataLayer?.push({
    event: 'begin_checkout',
    ecommerce: {
      value,
      currency: 'BDT',
      items: [{ item_id: 'COD-PROD-01', item_name: productTitle, price: value }],
    },
    event_id: eventId,
  });

  // Server CAPI Backup with resolvedUserData
  sendServerEvent(
    'InitiateCheckout',
    eventId,
    {
      value,
      currency: 'BDT',
      content_name: productTitle,
      content_type: 'product',
      content_ids: ['COD-PROD-01'],
      ...details,
    },
    resolvedUserData
  );
}

/**
 * 4. Track WatchVideo Event
 */
export function trackClientWatchVideo(videoTitle: string, videoUrl?: string, details?: any) {
  if (typeof window === 'undefined') return;
  const eventId = generateEventId('watch_video');

  // Meta Pixel (trackCustom WatchVideo & standard ViewContent variant)
  if (window.fbq) {
    window.fbq(
      'trackCustom',
      'WatchVideo',
      {
        video_title: videoTitle,
        video_url: videoUrl || '',
        action: 'play_or_open',
        ...details,
      },
      { eventID: eventId }
    );
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track(
      'ViewContent',
      {
        content_name: `Video: ${videoTitle}`,
        content_type: 'video',
      },
      { event_id: eventId }
    );
  }

  // GA4
  if (window.gtag) {
    window.gtag('event', 'video_start', {
      video_title: videoTitle,
      video_url: videoUrl,
    });
  }

  // GTM
  window.dataLayer?.push({
    event: 'watch_video',
    video_title: videoTitle,
    video_url: videoUrl,
    event_id: eventId,
  });

  // Server CAPI Backup
  sendServerEvent('WatchVideo', eventId, {
    content_name: videoTitle,
    video_title: videoTitle,
    video_url: videoUrl,
    action: 'play_or_open',
    ...details,
  });
}

/**
 * 5. Track PageScroll Event
 */
export function trackClientPageScroll(depthPercent: number, sectionName = 'LandingPage') {
  if (typeof window === 'undefined') return;
  const eventId = generateEventId(`pagescroll_${depthPercent}`);

  // Meta Pixel
  if (window.fbq) {
    window.fbq(
      'trackCustom',
      'PageScroll',
      {
        depth: `${depthPercent}%`,
        section: sectionName,
      },
      { eventID: eventId }
    );
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track(
      'ViewContent',
      {
        content_name: `PageScroll_${depthPercent}%`,
      },
      { event_id: eventId }
    );
  }

  // GA4
  if (window.gtag) {
    window.gtag('event', 'scroll', {
      percent_scrolled: depthPercent,
      section_name: sectionName,
    });
  }

  // GTM
  window.dataLayer?.push({
    event: 'page_scroll',
    scroll_depth: `${depthPercent}%`,
    section_name: sectionName,
    event_id: eventId,
  });

  // Server CAPI Backup
  sendServerEvent('PageScroll', eventId, {
    scroll_depth: `${depthPercent}%`,
    section_name: sectionName,
  });
}

/**
 * 6. Track ScrollDepth Event (25%, 50%, 75%, 90%, 100%)
 */
export function trackClientScrollDepth(depthPercent: number, sectionName = 'LandingPage') {
  if (typeof window === 'undefined') return;
  if (firedScrollDepths.has(depthPercent)) return;
  firedScrollDepths.add(depthPercent);

  const eventId = generateEventId(`scrolldepth_${depthPercent}`);

  // Meta Pixel
  if (window.fbq) {
    window.fbq(
      'trackCustom',
      'ScrollDepth',
      {
        depth: `${depthPercent}%`,
        section: sectionName,
      },
      { eventID: eventId }
    );
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track(
      'ViewContent',
      {
        content_name: `ScrollDepth_${depthPercent}%`,
      },
      { event_id: eventId }
    );
  }

  // GA4
  if (window.gtag) {
    window.gtag('event', 'scroll_depth', {
      depth: `${depthPercent}%`,
      section: sectionName,
    });
  }

  // GTM
  window.dataLayer?.push({
    event: 'scroll_depth',
    depth: `${depthPercent}%`,
    section: sectionName,
    event_id: eventId,
  });

  // Server CAPI Backup
  sendServerEvent('ScrollDepth', eventId, {
    scroll_depth: `${depthPercent}%`,
    section_name: sectionName,
  });
}

/**
 * 7. Track TimeOnPage Event (10s, 30s, 60s, 120s, etc.)
 */
export function trackClientTimeOnPage(seconds: number) {
  if (typeof window === 'undefined') return;
  if (firedTimeOnPage.has(seconds)) return;
  firedTimeOnPage.add(seconds);

  const eventId = generateEventId(`timeonpage_${seconds}s`);

  // Meta Pixel
  if (window.fbq) {
    window.fbq(
      'trackCustom',
      'TimeOnPage',
      {
        seconds,
        time_spent_str: `${seconds} seconds`,
      },
      { eventID: eventId }
    );
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track(
      'ViewContent',
      {
        content_name: `TimeOnPage_${seconds}s`,
      },
      { event_id: eventId }
    );
  }

  // GA4
  if (window.gtag) {
    window.gtag('event', 'user_engagement', {
      engagement_time_msec: seconds * 1000,
    });
  }

  // GTM
  window.dataLayer?.push({
    event: 'time_on_page',
    seconds,
    event_id: eventId,
  });

  // Server CAPI Backup
  sendServerEvent('TimeOnPage', eventId, {
    time_spent: seconds,
    time_spent_str: `${seconds}s`,
  });
}

/**
 * 8. Track InternalClick Event (CTA clicks, pack selection, gallery thumbnails, FAQ tabs)
 */
export function trackClientInternalClick(elementName: string, clickTarget?: string, details?: any) {
  if (typeof window === 'undefined') return;
  const eventId = generateEventId('internal_click');

  // Meta Pixel
  if (window.fbq) {
    window.fbq(
      'trackCustom',
      'InternalClick',
      {
        element_name: elementName,
        click_target: clickTarget || '',
        ...details,
      },
      { eventID: eventId }
    );
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track(
      'ViewContent',
      {
        content_name: `InternalClick_${elementName}`,
      },
      { event_id: eventId }
    );
  }

  // GA4
  if (window.gtag) {
    window.gtag('event', 'select_content', {
      content_type: 'internal_element',
      item_id: elementName,
    });
  }

  // GTM
  window.dataLayer?.push({
    event: 'internal_click',
    element_name: elementName,
    click_target: clickTarget,
    event_id: eventId,
    ...details,
  });

  // Server CAPI Backup
  sendServerEvent('InternalClick', eventId, {
    element_name: elementName,
    click_target: clickTarget,
    ...details,
  });
}

/**
 * 9. Track OutboundClick Event (WhatsApp, Call, External Links)
 */
export function trackClientOutboundClick(channel: string, outboundUrl?: string, details?: any) {
  if (typeof window === 'undefined') return;
  const eventId = generateEventId('outbound_click');

  // Meta Pixel (Contact & OutboundClick)
  if (window.fbq) {
    window.fbq(
      'trackCustom',
      'OutboundClick',
      {
        channel,
        outbound_url: outboundUrl || '',
        ...details,
      },
      { eventID: eventId }
    );
    if (channel.toLowerCase().includes('whatsapp') || channel.toLowerCase().includes('call') || channel.toLowerCase().includes('phone')) {
      window.fbq('track', 'Contact', { channel }, { eventID: `${eventId}_contact` });
    }
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track(
      'Contact',
      {
        content_name: `Outbound_${channel}`,
      },
      { event_id: eventId }
    );
  }

  // GA4
  if (window.gtag) {
    window.gtag('event', 'click', {
      link_url: outboundUrl,
      link_domain: channel,
      outbound: true,
    });
  }

  // GTM
  window.dataLayer?.push({
    event: 'outbound_click',
    channel,
    outbound_url: outboundUrl,
    event_id: eventId,
  });

  // Server CAPI Backup
  sendServerEvent('OutboundClick', eventId, {
    channel,
    outbound_url: outboundUrl,
    ...details,
  });
}

/**
 * 10. Track Purchase Event with Deterministic Event ID Deduplication
 */
export function trackClientPurchase(
  order: OrderData,
  productTitle: string,
  googleAdsConversionId?: string
) {
  if (typeof window === 'undefined') return;

  const eventId = order.eventId || `purchase_${order.id}`;

  // 1. Meta Pixel (with eventID for server deduplication)
  if (window.fbq) {
    window.fbq(
      'track',
      'Purchase',
      {
        value: order.totalAmount,
        currency: 'BDT',
        content_name: productTitle,
        content_type: 'product',
        content_ids: ['COD-PROD-01'],
        num_items: order.quantity,
      },
      { eventID: eventId }
    );
  }

  // 2. TikTok Pixel (with event_id for server deduplication)
  if (window.ttq) {
    window.ttq.track(
      'CompletePayment',
      {
        value: order.totalAmount,
        currency: 'BDT',
        content_name: productTitle,
        content_type: 'product',
        content_id: 'COD-PROD-01',
        quantity: order.quantity,
      },
      { event_id: eventId }
    );
  }

  // 3. GA4 purchase event
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: order.orderNumber,
      value: order.totalAmount,
      currency: 'BDT',
      items: [
        {
          item_id: 'COD-PROD-01',
          item_name: productTitle,
          price: order.totalAmount,
          quantity: order.quantity,
        },
      ],
    });

    if (googleAdsConversionId?.trim()) {
      window.gtag('event', 'conversion', {
        send_to: `${googleAdsConversionId.trim()}/purchase`,
        value: order.totalAmount,
        currency: 'BDT',
        transaction_id: order.orderNumber,
      });
    }
  }

  // 4. GTM dataLayer
  window.dataLayer?.push({
    event: 'purchase',
    ecommerce: {
      transaction_id: order.orderNumber,
      event_id: eventId,
      value: order.totalAmount,
      currency: 'BDT',
      items: [
        {
          item_id: 'COD-PROD-01',
          item_name: productTitle,
          price: order.totalAmount,
          quantity: order.quantity,
        },
      ],
    },
  });
}
