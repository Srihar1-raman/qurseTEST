/**
 * Utility functions for detecting and extracting IDs from various embeddable URLs
 */

export interface YouTubeInfo {
  type: 'youtube';
  videoId: string;
  listId?: string;
  startTime?: number;
}

export interface TwitterInfo {
  type: 'twitter';
  username: string;
  tweetId: string;
}

export interface RedditInfo {
  type: 'reddit';
  subreddit: string;
  postId: string;
  commentId?: string;
}

export interface SpotifyInfo {
  type: 'spotify';
  entityType: 'track' | 'album' | 'playlist' | 'artist' | 'episode' | 'show';
  id: string;
}

export interface GistInfo {
  type: 'gist';
  username: string;
  gistId: string;
  filename?: string;
  revision?: string;
}

/**
 * Check if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/[\w-]+/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/[\w-]+/,
    /(?:https?:\/\/)?youtu\.be\/[\w-]+/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/[\w-]+/,
  ];
  return patterns.some((pattern) => pattern.test(url));
}

/**
 * Extract YouTube video ID and other info from URL
 */
export function extractYouTubeInfo(url: string): YouTubeInfo | null {
  if (!isYouTubeUrl(url)) return null;

  let videoId = '';
  let listId = '';
  let startTime = 0;

  // Extract video ID
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([\w-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }

  // Extract list ID if present
  const listMatch = url.match(/[?&]list=([\w-]+)/);
  if (listMatch) {
    listId = listMatch[1];
  }

  // Extract start time if present
  const timeMatch = url.match(/[?&](?:t|start)=(\d+)/);
  if (timeMatch) {
    startTime = parseInt(timeMatch[1], 10);
  }

  return { type: 'youtube', videoId, listId, startTime };
}

/**
 * Check if a URL is a Twitter/X URL
 */
export function isTwitterUrl(url: string): boolean {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/[\w]+\/status\/[\w]+/,
    /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/[\w]+\/statuses\/[\w]+/,
  ];
  return patterns.some((pattern) => pattern.test(url));
}

/**
 * Extract Twitter info from URL
 */
export function extractTwitterInfo(url: string): TwitterInfo | null {
  if (!isTwitterUrl(url)) return null;

  const patterns = [
    /(?:twitter|x)\.com\/([\w]+)\/status(?:es)?\/([\w]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        type: 'twitter',
        username: match[1],
        tweetId: match[2],
      };
    }
  }

  return null;
}

/**
 * Check if a URL is a Reddit URL
 */
export function isRedditUrl(url: string): boolean {
  return /(?:https?:\/\/)?(?:www\.)?reddit\.com\/r\/[\w-]+\/comments\/[\w]+/.test(url);
}

/**
 * Extract Reddit info from URL
 */
export function extractRedditInfo(url: string): RedditInfo | null {
  if (!isRedditUrl(url)) return null;

  // Reddit URL format: /r/subreddit/comments/post_id/post_slug/ or /r/subreddit/comments/post_id/post_slug/comment_id/
  const match = url.match(/reddit\.com\/r\/([\w-]+)\/comments\/([\w]+)(?:\/[\w-]+)?(?:\/([\w]+))?/);
  if (match) {
    return {
      type: 'reddit',
      subreddit: match[1],
      postId: match[2],
      commentId: match[3],
    };
  }

  return null;
}

/**
 * Check if a URL is a Spotify URL
 */
export function isSpotifyUrl(url: string): boolean {
  return /(?:https?:\/\/)?(?:open\.)?spotify\.com\/(track|album|playlist|artist|episode|show)/.test(url);
}

/**
 * Extract Spotify info from URL
 */
export function extractSpotifyInfo(url: string): SpotifyInfo | null {
  if (!isSpotifyUrl(url)) return null;

  const match = url.match(/spotify\.com\/(track|album|playlist|artist|episode|show)\/([\w]+)/);
  if (match) {
    return {
      type: 'spotify',
      entityType: match[1] as SpotifyInfo['entityType'],
      id: match[2],
    };
  }

  return null;
}

/**
 * Check if a URL is a GitHub Gist URL
 */
export function isGistUrl(url: string): boolean {
  return /(?:https?:\/\/)?gist\.github\.com\/[\w-]+\/[\w-]+/.test(url);
}

/**
 * Extract Gist info from URL
 */
export function extractGistInfo(url: string): GistInfo | null {
  if (!isGistUrl(url)) return null;

  const match = url.match(/gist\.github\.com\/([\w-]+)\/([\w-]+)(?:\/([\w-]+))?(?:\/([\w]+))?/);
  if (match) {
    return {
      type: 'gist',
      username: match[1],
      gistId: match[2],
      filename: match[3],
      revision: match[4],
    };
  }

  return null;
}

/**
 * Check if a URL is a PDF URL
 */
export function isPdfUrl(url: string): boolean {
  return /\.pdf(\?.*)?$/i.test(url);
}

/**
 * Get embed type from URL
 */
export type EmbedType =
  | 'youtube'
  | 'twitter'
  | 'reddit'
  | 'spotify'
  | 'gist'
  | 'pdf'
  | 'codepen'
  | 'codesandbox'
  | 'figma'
  | null;

export function getEmbedType(url: string): EmbedType {
  if (isYouTubeUrl(url)) return 'youtube';
  if (isTwitterUrl(url)) return 'twitter';
  if (isRedditUrl(url)) return 'reddit';
  if (isSpotifyUrl(url)) return 'spotify';
  if (isGistUrl(url)) return 'gist';
  if (isPdfUrl(url)) return 'pdf';
  if (/(?:https?:\/\/)?codepen\.io\/[\w-]+\/pen\/[\w-]+/.test(url)) return 'codepen';
  if (/(?:https?:\/\/)?codesandbox\.io\/s\/[\w-]+/.test(url)) return 'codesandbox';
  if (/(?:https?:\/\/)?(?:www\.)?figma\.com\/file\/[\w-]+/.test(url)) return 'figma';
  return null;
}

/**
 * Check if JSON code is a Vega-Lite specification
 */
export function isVegaLiteSpec(code: string): boolean {
  try {
    const parsed = JSON.parse(code);

    // Check for $schema field
    if (parsed.$schema && typeof parsed.$schema === 'string') {
      return parsed.$schema.includes('vega-lite');
    }

    // Check for Vega-Lite specific properties
    // Must have 'mark' AND either 'data' or 'encoding'
    const hasMark = parsed.mark !== undefined;
    const hasDataOrEncoding = parsed.data !== undefined || parsed.encoding !== undefined;

    return hasMark && hasDataOrEncoding;
  } catch {
    // Not valid JSON
    return false;
  }
}
