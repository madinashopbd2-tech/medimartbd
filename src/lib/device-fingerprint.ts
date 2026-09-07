/**
 * Unique Device & Browser Fingerprint Generator
 * Generates and persists a stable device identifier across browser sessions
 */

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server_device';

  const STORAGE_KEY = '_medimart_device_fingerprint';
  
  // 1. Try local storage
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length > 8) {
      return existing;
    }
  } catch (e) {
    // LocalStorage might be restricted
  }

  // 2. Try cookie
  try {
    const match = document.cookie.match(new RegExp('(^| )' + STORAGE_KEY + '=([^;]+)'));
    if (match && match[2]) {
      return match[2];
    }
  } catch (e) {
    // Cookie restricted
  }

  // 3. Generate a rich hardware/browser entropy fingerprint
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dhaka';
  const language = navigator.language || 'bn-BD';
  const platform = navigator.platform || 'web';
  const cores = navigator.hardwareConcurrency || 4;

  let canvasHash = 'c0';
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Medimart Device ID Security', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Medimart Device ID Security', 4, 17);
      const dataUrl = canvas.toDataURL();
      let hash = 0;
      for (let i = 0; i < dataUrl.length; i++) {
        hash = (hash << 5) - hash + dataUrl.charCodeAt(i);
        hash |= 0;
      }
      canvasHash = Math.abs(hash).toString(36);
    }
  } catch (e) {
    canvasHash = 'c_fallback';
  }

  const randomEntropy = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36);
  const rawId = `dev_${canvasHash}_${randomEntropy}_${timestamp}`;

  // Store in LocalStorage
  try {
    localStorage.setItem(STORAGE_KEY, rawId);
  } catch (e) {}

  // Store in Cookie for 365 days
  try {
    const maxAge = 365 * 24 * 60 * 60;
    document.cookie = `${STORAGE_KEY}=${rawId}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch (e) {}

  return rawId;
}
