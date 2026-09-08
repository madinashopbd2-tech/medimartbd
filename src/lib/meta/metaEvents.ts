/**
 * Meta Standard & Custom Event Definitions and Types
 */

export const META_STANDARD_EVENTS = {
  PAGE_VIEW: 'PageView',
  VIEW_CONTENT: 'ViewContent',
  ADD_TO_CART: 'AddToCart',
  INITIATE_CHECKOUT: 'InitiateCheckout',
  PURCHASE: 'Purchase',
} as const;

export const META_CUSTOM_EVENTS = {
  MANTRA_PAID_WEBINAR: 'Mantra Paid Webinar',
} as const;

export interface MetaUserData {
  phone?: string;
  name?: string;
  email?: string;
  address?: string;
  district?: string;
  city?: string;
  country?: string;
  ipAddress?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  fbclid?: string;
  externalId?: string;
}

export interface MetaCustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_type?: string;
  content_ids?: string[];
  content_category?: string;
  num_items?: number;
  delivery_fee?: number;
  order_id?: string;
  webinar_title?: string;
  webinar_date?: string;
  [key: string]: any;
}

export interface MetaEventPayload {
  event_name: string;
  event_id: string;
  event_time?: number;
  event_source_url?: string;
  action_source?: 'website' | 'system_generated' | 'app';
  user_data?: MetaUserData;
  custom_data?: MetaCustomData;
}

/**
 * Development-only Meta Tracking Debug Logger
 * Prints non-sensitive tracking flow information to the console
 */
export function logMetaDebug(
  eventName: string,
  eventId: string,
  channel: 'Browser' | 'Server' | 'Browser+Server',
  status: 'Sent' | 'Failed' | 'Simulated' | 'Pending',
  extraInfo?: string
) {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return;
  }
  const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
  console.log(
    `%c[Meta Tracking]%c Event: %c${eventName}%c | Event ID: %c${eventId}%c | ${channel}: %c${status}%c${extraInfo ? ` (${extraInfo})` : ''} [${timestamp}]`,
    'color: #0084ff; font-weight: bold;',
    'color: inherit;',
    'color: #059669; font-weight: bold;',
    'color: inherit;',
    'color: #d97706; font-weight: bold;',
    'color: inherit;',
    status === 'Sent' || status === 'Simulated' ? 'color: #059669; font-weight: bold;' : 'color: #dc2626; font-weight: bold;',
    'color: inherit;'
  );
}
