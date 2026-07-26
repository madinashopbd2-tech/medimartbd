/**
 * Client-Side Marketing Pixel Dispatcher & Script Injector
 * Supports Meta Pixel (fbq), TikTok Pixel (ttq), GA4/Google Ads (gtag),
 * GTM (dataLayer), Scroll Depth Tracking, and Deterministic Event ID Deduplication.
 */

import { StoreSettings, ProductData, OrderData } from '../../types';

declare global {
  interface Window {
    fbq?: any;
    ttq?: any;
    gtag?: any;
    dataLayer?: any[];
    _fbq?: any;
  }
}

/**
 * Dynamically inject pixel tracking scripts into <head>
 */
export function initTrackingScripts(settings: StoreSettings, product?: ProductData | null) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

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
      window.fbq('track', 'PageView');
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
        ttq.page();
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

  // 6. Fire ViewContent Event on Load if Product exists
  if (product) {
    const price = product.offerPrice || product.regularPrice;
    
    // Meta ViewContent
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: product.title,
        content_type: 'product',
        content_ids: ['COD-PROD-01'],
        value: price,
        currency: 'BDT',
      });
    }

    // TikTok ViewContent
    if (window.ttq) {
      window.ttq.track('ViewContent', {
        content_name: product.title,
        content_type: 'product',
        content_id: 'COD-PROD-01',
        value: price,
        currency: 'BDT',
      });
    }

    // GA4 view_item
    if (window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'BDT',
        value: price,
        items: [{ item_id: 'COD-PROD-01', item_name: product.title, price }],
      });
    }

    // GTM dataLayer
    window.dataLayer?.push({
      event: 'view_item',
      ecommerce: {
        currency: 'BDT',
        value: price,
        items: [{ item_id: 'COD-PROD-01', item_name: product.title, price }],
      },
    });
  }
}

/**
 * Track Scroll Depth & Order Form Engagement
 */
export function trackClientScrollDepth(depthPercent: number, sectionName = 'LandingPage') {
  if (typeof window === 'undefined') return;

  const eventName = `Scroll_${depthPercent}%`;

  if (window.fbq) {
    window.fbq('trackCustom', 'ScrollDepth', {
      depth: `${depthPercent}%`,
      section: sectionName,
    });
  }

  if (window.ttq) {
    window.ttq.track('ViewContent', {
      content_name: `ScrollDepth_${depthPercent}%`,
    });
  }

  if (window.gtag) {
    window.gtag('event', 'scroll_depth', {
      depth: `${depthPercent}%`,
      section: sectionName,
    });
  }

  window.dataLayer?.push({
    event: 'scroll_depth',
    depth: `${depthPercent}%`,
    section: sectionName,
  });
}

/**
 * Track InitiateCheckout
 */
export function trackClientInitiateCheckout(productTitle: string, value: number) {
  if (typeof window === 'undefined') return;

  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value,
      currency: 'BDT',
      content_name: productTitle,
      content_type: 'product',
      content_ids: ['COD-PROD-01'],
    });
  }

  if (window.ttq) {
    window.ttq.track('InitiateCheckout', {
      value,
      currency: 'BDT',
      content_name: productTitle,
      content_type: 'product',
      content_id: 'COD-PROD-01',
    });
  }

  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      value,
      currency: 'BDT',
      items: [{ item_id: 'COD-PROD-01', item_name: productTitle, price: value }],
    });
  }

  window.dataLayer?.push({
    event: 'begin_checkout',
    ecommerce: {
      value,
      currency: 'BDT',
      items: [{ item_id: 'COD-PROD-01', item_name: productTitle, price: value }],
    },
  });
}

/**
 * Track Instant Purchase / CompletePayment with Deterministic Event ID Deduplication
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
