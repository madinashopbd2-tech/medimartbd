/**
 * Converts an ISO date or timestamp into a live, dynamic Bengali elapsed time counter.
 * e.g. "০ মিনিট ১২ সেকেন্ড আগে (Just Now)", "৫ মিনিট ৩৪ সেকেন্ড আগে", "২ ঘণ্টা ১৫ মিনিট আগে", etc.
 */
export function getLiveTimeAgo(isoString: string | number | Date, nowMs: number = Date.now()): {
  formatted: string;
  isJustNow: boolean;
  minutes: number;
  seconds: number;
  hours: number;
  days: number;
} {
  const createdMs = new Date(isoString).getTime();
  if (isNaN(createdMs)) {
    return {
      formatted: 'কিছুক্ষণ আগে',
      isJustNow: false,
      minutes: 0,
      seconds: 0,
      hours: 0,
      days: 0,
    };
  }

  const diffMs = Math.max(0, nowMs - createdMs);
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const toBn = (n: number) => n.toLocaleString('bn-BD');

  let formatted = '';
  let isJustNow = false;

  if (totalSeconds < 10) {
    formatted = 'এইমাত্র (Just Now)';
    isJustNow = true;
  } else if (totalSeconds < 60) {
    formatted = `${toBn(seconds)} সেকেন্ড আগে`;
    isJustNow = true;
  } else if (hours === 0 && days === 0) {
    formatted = `${toBn(minutes)} মিনিট ${toBn(seconds)} সেকেন্ড আগে`;
    if (minutes < 5) isJustNow = true;
  } else if (days === 0) {
    formatted = `${toBn(hours)} ঘণ্টা ${toBn(minutes)} মিনিট আগে`;
  } else if (days < 30) {
    formatted = `${toBn(days)} দিন ${toBn(hours)} ঘণ্টা আগে`;
  } else {
    formatted = new Date(isoString).toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return {
    formatted,
    isJustNow,
    minutes,
    seconds,
    hours,
    days,
  };
}
