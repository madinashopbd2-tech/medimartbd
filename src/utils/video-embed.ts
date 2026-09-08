/**
 * Video URL Parser & Universal Embed Helper
 * Supports YouTube, Facebook, Google Drive, TikTok, Instagram, Vimeo, Dailymotion, Dropbox, and Direct MP4/WebM videos.
 */

export interface VideoEmbedResult {
  type: 'youtube' | 'facebook' | 'tiktok' | 'instagram' | 'googledrive' | 'vimeo' | 'dailymotion' | 'direct' | 'iframe' | 'unknown';
  isDirectVideo: boolean;
  embedUrl: string;
  rawUrl: string;
  platformName: string;
}

/**
 * Extracts a clean URL from a string that might be a raw URL, or a full <iframe> embed tag.
 */
export function cleanVideoInput(input?: string): string {
  if (!input) return '';
  let str = input.trim();

  // If user pasted an entire <iframe> code
  if (str.includes('<iframe') && str.includes('src=')) {
    const srcMatch = str.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1].trim();
    }
  }

  // Remove surrounding quotes if present
  str = str.replace(/^["']|["']$/g, '');
  return str;
}

/**
 * Parses any video URL and converts it to a playable embed URL or direct video stream.
 */
export function parseVideoUrl(url?: string): VideoEmbedResult {
  if (!url) {
    return {
      type: 'unknown',
      isDirectVideo: false,
      embedUrl: '',
      rawUrl: '',
      platformName: 'Unknown',
    };
  }

  const rawUrl = cleanVideoInput(url);
  const trimmed = rawUrl.trim();

  // 1. Direct Video files & Cloud Storage (MP4, WebM, OGG, MOV, data:video)
  const isDirectExtension = trimmed.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i);
  const isDataVideo = trimmed.startsWith('data:video/');
  const isCloudinaryVideo = trimmed.includes('cloudinary.com') && trimmed.includes('/video/');

  // Dropbox link handling (change ?dl=0 to ?raw=1)
  if (trimmed.includes('dropbox.com')) {
    let dropboxDirect = trimmed.replace(/[?&]dl=0/, '').replace(/[?&]dl=1/, '');
    dropboxDirect += (dropboxDirect.includes('?') ? '&' : '?') + 'raw=1';
    return {
      type: 'direct',
      isDirectVideo: true,
      embedUrl: dropboxDirect,
      rawUrl: trimmed,
      platformName: 'Dropbox Direct MP4',
    };
  }

  if (isDirectExtension || isDataVideo || isCloudinaryVideo) {
    return {
      type: 'direct',
      isDirectVideo: true,
      embedUrl: trimmed,
      rawUrl: trimmed,
      platformName: 'Direct Video (MP4/WebM)',
    };
  }

  // 2. Google Drive
  if (trimmed.includes('drive.google.com')) {
    // Matches /file/d/{id}
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    // Matches ?id={id}
    const paramIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const driveId = fileIdMatch?.[1] || paramIdMatch?.[1];

    if (driveId) {
      return {
        type: 'googledrive',
        isDirectVideo: false,
        embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
        rawUrl: trimmed,
        platformName: 'Google Drive Video',
      };
    }
  }

  // 3. YouTube (watch?v=, youtu.be/, shorts/, embed/, live/, m.youtube)
  const ytRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      isDirectVideo: false,
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1`,
      rawUrl: trimmed,
      platformName: 'YouTube',
    };
  }

  // 4. Facebook Video & Reels
  if (trimmed.includes('facebook.com') || trimmed.includes('fb.watch')) {
    return {
      type: 'facebook',
      isDirectVideo: false,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=0&autoplay=1`,
      rawUrl: trimmed,
      platformName: 'Facebook Video',
    };
  }

  // 5. Instagram (Reels & Posts)
  if (trimmed.includes('instagram.com')) {
    const reelMatch = trimmed.match(/instagram\.com\/(?:reel|p|tv)\/([a-zA-Z0-9_-]+)/i);
    if (reelMatch && reelMatch[1]) {
      return {
        type: 'instagram',
        isDirectVideo: false,
        embedUrl: `https://www.instagram.com/reel/${reelMatch[1]}/embed`,
        rawUrl: trimmed,
        platformName: 'Instagram Reel',
      };
    }
  }

  // 6. TikTok
  if (trimmed.includes('tiktok.com')) {
    const tiktokVideoMatch = trimmed.match(/video\/(\d+)/);
    if (tiktokVideoMatch && tiktokVideoMatch[1]) {
      return {
        type: 'tiktok',
        isDirectVideo: false,
        embedUrl: `https://www.tiktok.com/embed/v2/${tiktokVideoMatch[1]}`,
        rawUrl: trimmed,
        platformName: 'TikTok Video',
      };
    }
  }

  // 7. Vimeo
  if (trimmed.includes('vimeo.com')) {
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[3]) {
      return {
        type: 'vimeo',
        isDirectVideo: false,
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1&muted=1`,
        rawUrl: trimmed,
        platformName: 'Vimeo',
      };
    }
  }

  // 8. Dailymotion
  if (trimmed.includes('dailymotion.com') || trimmed.includes('dai.ly')) {
    const dmMatch = trimmed.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/i);
    if (dmMatch && dmMatch[1]) {
      return {
        type: 'dailymotion',
        isDirectVideo: false,
        embedUrl: `https://www.dailymotion.com/embed/video/${dmMatch[1]}?autoplay=1&mute=1`,
        rawUrl: trimmed,
        platformName: 'Dailymotion',
      };
    }
  }

  // Fallback (Generic iframe or direct video if it has common video token)
  const isStorageOrMedia = trimmed.includes('firebasestorage.googleapis.com') ||
    trimmed.includes('s3.amazonaws.com') ||
    trimmed.includes('blob.core.windows.net');

  if (isStorageOrMedia) {
    return {
      type: 'direct',
      isDirectVideo: true,
      embedUrl: trimmed,
      rawUrl: trimmed,
      platformName: 'Cloud Storage Video',
    };
  }

  return {
    type: 'unknown',
    isDirectVideo: false,
    embedUrl: trimmed,
    rawUrl: trimmed,
    platformName: 'Web Video',
  };
}
