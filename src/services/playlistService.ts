import { getSampleChoice, isSamplePreferred, getCachedSample, loadSampleChannels, detectCountry } from './sampleList';

export interface Channel {
  id: string;
  name: string;
  category: string;
  logo: string;
  streamUrl: string;
}

export interface PlaylistInfo {
  id: string;
  name: string;
  count: number;
  active: boolean;
}

// Offline fallback only: royalty-free public demo streams (no broadcaster names, logos or live TV feeds).
export const DEFAULT_CHANNELS: Channel[] = [
  {
    id: '1',
    name: 'Demo: Big Buck Bunny (HLS)',
    category: 'Demo',
    logo: 'icon.png',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
  },
  {
    id: '2',
    name: 'Demo: Apple BipBop 16x9 (HLS)',
    category: 'Demo',
    logo: 'icon.png',
    streamUrl: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8'
  },
  {
    id: '3',
    name: 'Demo: Tears of Steel (HLS)',
    category: 'Demo',
    logo: 'icon.png',
    streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
  }
];

// Tarayıcı ortamına göre portal adresleri (CF Tunnel: pairiptv.ozturk.app ve yerel fallback)
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const PORTAL_ENDPOINTS = isLocalhost
  ? ['https://pairiptv.ozturk.app', 'http://localhost:8088']
  : ['https://pairiptv.ozturk.app', 'http://localhost:8088'];

// Cihaza özel tekil eşleştirme kodu (Örn: LG-8F2K). 
// Her TV/Cihaz ilk açılışta kendi benzersiz kodunu üretir ve localStorage'da saklar.
export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem('kdr_tv_device_id');
    if (existing && existing.trim()) {
      return existing.trim().toUpperCase();
    }
    // Rastgele 4 karakterli benzersiz TV kodu üret (Örn: LG-7A2B)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newId = `LG-${randomPart}`;
    localStorage.setItem('kdr_tv_device_id', newId);
    return newId;
  } catch {
    return 'LG-KDR7';
  }
}

// Portal placeholder id for devices that have not paired a playlist yet.
// v1.0.7: it is ignored on the TV; the public sample list is only loaded when the user opts in.
const PORTAL_PLACEHOLDER_ID = 'gh_tr';
export const SAMPLE_PLAYLIST_ID = 'sample_public';
export const DEMO_PLAYLIST_ID = 'demo';

export type PlaylistSource = 'user' | 'sample' | 'demo';

export interface PlaylistResult {
  currentPlaylistName: string;
  allPlaylists: PlaylistInfo[];
  channels: Channel[];
  source: PlaylistSource;
  activeId: string;
}

// Last successful paired (user) playlist, for instant start-up. v2 key: drops the v1 cache,
// which could contain the silently loaded GitHub TR list of older versions.
const CACHE_KEY_PLAYLIST = 'kdr_tv_cached_playlist_v2';

function sampleName(country: string | null): string {
  return country ? `Sample public channels (${country})` : 'Sample public channels';
}

function demoResult(allPlaylists: PlaylistInfo[] = []): PlaylistResult {
  const demo: PlaylistInfo = { id: DEMO_PLAYLIST_ID, name: 'Demo streams', count: DEFAULT_CHANNELS.length, active: true };
  return {
    currentPlaylistName: demo.name,
    allPlaylists: [...allPlaylists.map(p => ({ ...p, active: false })), demo],
    channels: DEFAULT_CHANNELS,
    source: 'demo',
    activeId: DEMO_PLAYLIST_ID
  };
}

function cleanText(v: string | undefined, fallback: string): string {
  return v ? v.replace(/[\uFFFD\uFEFF]/g, '').replace(/\s+/g, ' ').trim() : fallback;
}

/** Synchronous best guess for the first render (no network). */
export function getCachedPlaylists(): PlaylistResult | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PLAYLIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.channels) && parsed.channels.length > 0 && !(getSampleChoice() === 'yes' && isSamplePreferred())) {
        return { ...parsed, source: 'user' };
      }
    }
  } catch (_) {}
  if (getSampleChoice() === 'yes') {
    const s = getCachedSample();
    if (s) {
      const info: PlaylistInfo = { id: SAMPLE_PLAYLIST_ID, name: sampleName(s.country), count: s.channels.length, active: true };
      return { currentPlaylistName: info.name, allPlaylists: [info], channels: s.channels, source: 'sample', activeId: SAMPLE_PLAYLIST_ID };
    }
  }
  return null;
}

async function fetchUserPlaylist(deviceCode: string): Promise<PlaylistResult | null> {
  for (const baseUrl of PORTAL_ENDPOINTS) {
    try {
      const url = `${baseUrl}/api/get-playlist?code=${encodeURIComponent(deviceCode)}`;
      // AbortController is missing on older webOS (Chromium < 66): fall back to a timeout race
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const timeout = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          if (controller) controller.abort();
          reject(new Error('timeout'));
        }, 2500);
      });
      const res = await Promise.race([
        fetch(url, controller ? { signal: controller.signal } : {}),
        timeout
      ]);
      clearTimeout(timeoutId);
      if (!res.ok) {
        console.warn(`[DEBUG] Portal HTTP ${res.status} (${baseUrl})`);
        continue;
      }
      const data = await res.json();
      // Only playlists the user added through the pairing portal count; the portal placeholder is ignored.
      const plList: PlaylistInfo[] = (Array.isArray(data.allPlaylists) ? data.allPlaylists : [])
        .filter((p: PlaylistInfo) => p && p.id !== PORTAL_PLACEHOLDER_ID);
      if (data.ok && data.id !== PORTAL_PLACEHOLDER_ID && Array.isArray(data.channels) && data.channels.length > 0) {
        const channels = data.channels.map((ch: Channel) => ({
          ...ch,
          name: cleanText(ch.name, ''),
          category: cleanText(ch.category, 'General')
        }));
        const result: PlaylistResult = {
          currentPlaylistName: cleanText(data.name, 'My playlist'),
          allPlaylists: plList,
          channels,
          source: 'user',
          activeId: data.id
        };
        try { localStorage.setItem(CACHE_KEY_PLAYLIST, JSON.stringify(result)); } catch (_) {}
        return result;
      }
      // Portal reachable but the user has no playlist (anymore)
      try { localStorage.removeItem(CACHE_KEY_PLAYLIST); } catch (_) {}
      return null;
    } catch (err) {
      console.debug(`[DEBUG] Portal unreachable (${baseUrl}):`, err);
    }
  }
  // Portal unreachable: keep using the last known paired playlist
  try {
    const raw = localStorage.getItem(CACHE_KEY_PLAYLIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.channels) && parsed.channels.length > 0) return { ...parsed, source: 'user' };
    }
  } catch (_) {}
  return null;
}

/**
 * Priority: 1) playlist the user added through the pairing portal,
 * 2) the opt-in sample public list for the TV's country (or when the user picked it explicitly),
 * 3) built-in royalty-free demo streams (also used when the sample list is unavailable).
 */
export async function fetchPlaylists(deviceCode: string = getDeviceId()): Promise<PlaylistResult> {
  const user = await fetchUserPlaylist(deviceCode);
  const sampleOn = getSampleChoice() === 'yes';
  const userLists = user ? user.allPlaylists : [];

  if (user && !(sampleOn && isSamplePreferred())) {
    const all = userLists.map(p => ({ ...p, active: p.id === user.activeId }));
    if (sampleOn) all.push({ id: SAMPLE_PLAYLIST_ID, name: sampleName(detectCountry()), count: 0, active: false });
    return { ...user, allPlaylists: all };
  }

  if (sampleOn) {
    const s = await loadSampleChannels();
    if (s.ok) {
      const info: PlaylistInfo = { id: SAMPLE_PLAYLIST_ID, name: sampleName(s.country), count: s.channels.length, active: true };
      return {
        currentPlaylistName: info.name,
        allPlaylists: [...userLists.map(p => ({ ...p, active: false })), info],
        channels: s.channels,
        source: 'sample',
        activeId: SAMPLE_PLAYLIST_ID
      };
    }
  }
  if (user) {
    return { ...user, allPlaylists: userLists.map(p => ({ ...p, active: p.id === user.activeId })) };
  }
  return demoResult(userLists);
}

export async function switchPlaylistOnServer(deviceCode: string, playlistId: string): Promise<boolean> {
  console.log(`[DEBUG] switchPlaylistOnServer çağrıldı: ${playlistId}`);
  for (const baseUrl of PORTAL_ENDPOINTS) {
    try {
      const res = await fetch(`${baseUrl}/api/switch-playlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: deviceCode, playlistId })
      });
      if (res.ok) return true;
    } catch (_) {}
  }
  return false;
}
