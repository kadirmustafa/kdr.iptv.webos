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

// GitHub TR Varsayılan kanalları (önbellek)
let cachedGithubChannels: Channel[] | null = null;

async function getGithubTRChannels(): Promise<Channel[]> {
  if (cachedGithubChannels && cachedGithubChannels.length > 0) {
    return cachedGithubChannels;
  }
  try {
    const res = await fetch('https://iptv-org.github.io/iptv/countries/tr.m3u');
    if (!res.ok) throw new Error('GitHub network error');
    const text = await res.text();
    const lines = text.split(/\r?\n/);
    const channels: Channel[] = [];
    let current: Partial<Channel> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
        const groupMatch = line.match(/group-title="([^"]+)"/i);
        const nameParts = line.split(',');
        const name = nameParts.length > 1 ? nameParts[nameParts.length - 1].trim() : 'Kanal';

        current = {
          id: 'gh_' + String(channels.length + 1),
          name: name,
          category: groupMatch ? groupMatch[1] : 'Genel',
          logo: logoMatch ? logoMatch[1] : ''
        };
      } else if (line.length > 0 && !line.startsWith('#') && current.name) {
        current.streamUrl = line;
        channels.push(current as Channel);
        current = {};
      }
    }
    cachedGithubChannels = channels.length > 0 ? channels : DEFAULT_CHANNELS;
    return cachedGithubChannels;
  } catch (e) {
    return DEFAULT_CHANNELS;
  }
}

// Yerel önbelleğe alınmış son başarılı çalma listesi (ilk açılışı anında yapmak için)
const CACHE_KEY_PLAYLIST = 'kdr_tv_cached_playlist_v1';

export function getCachedPlaylists(): { currentPlaylistName: string; allPlaylists: PlaylistInfo[]; channels: Channel[] } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PLAYLIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.channels) && parsed.channels.length > 0) {
        return parsed;
      }
    }
  } catch (_) {}
  return null;
}

export async function fetchPlaylists(deviceCode: string = getDeviceId()): Promise<{ currentPlaylistName: string; allPlaylists: PlaylistInfo[]; channels: Channel[] }> {
  console.log(`[DEBUG] fetchPlaylists çağrıldı. Cihaz Kodu: ${deviceCode}`);

  for (const baseUrl of PORTAL_ENDPOINTS) {
    try {
      const url = `${baseUrl}/api/get-playlist?code=${encodeURIComponent(deviceCode)}`;
      console.log(`[DEBUG] Portal sorgulanıyor: ${url}`);
      
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

      if (res.ok) {
        const data = await res.json();
        console.log(`[DEBUG] Portal yanıtı başarılı:`, {
          ok: data.ok,
          name: data.name,
          channelCount: data.channels ? data.channels.length : 0
        });

        if (data.ok && Array.isArray(data.channels) && data.channels.length > 0) {
          // Eğer aktif liste GitHub listesi ise ve server'da sadece placeholder varsa GitHub'dan al
          let activeChannels = data.channels;
          if (data.id === 'gh_tr' && data.channels.length <= 10) {
            const ghChannels = await getGithubTRChannels();
            activeChannels = ghChannels;
          }

          let plList: PlaylistInfo[] = data.allPlaylists || [];
          // GitHub listesinin her zaman allPlaylists içinde olduğundan emin ol
          if (!plList.some(p => p.id === 'gh_tr')) {
            plList.unshift({
              id: 'gh_tr',
              name: 'Varsayılan TR Yayınları (GitHub)',
              count: 85,
              active: data.id === 'gh_tr'
            });
          }

          // Kanallardaki bozuk UTF-8 karakterlerini (U+FFFD ve U+FEFF) temizle
          const cleanedChannels = activeChannels.map((ch: Channel) => ({
            ...ch,
            name: ch.name ? ch.name.replace(/[\uFFFD\uFEFF]/g, '').replace(/\s+/g, ' ').trim() : '',
            category: ch.category ? ch.category.replace(/[\uFFFD\uFEFF]/g, '').replace(/\s+/g, ' ').trim() : 'Genel'
          }));

          const result = {
            currentPlaylistName: (data.name || 'Yüklü IPTV Listesi').replace(/[\uFFFD\uFEFF]/g, '').trim(),
            allPlaylists: plList,
            channels: cleanedChannels
          };

          // Hızlı açılış için localStorage'a kaydet
          try {
            localStorage.setItem(CACHE_KEY_PLAYLIST, JSON.stringify(result));
          } catch (_) {}

          return result;
        }
      } else {
        console.warn(`[DEBUG] Portal yanıt vermedi: HTTP ${res.status} (${baseUrl})`);
      }
    } catch (err) {
      console.debug(`[DEBUG] Portal bağlantı denemesi başarısız (${baseUrl}):`, err);
    }
  }

  // Eğer sunucuda özel liste henüz atanmamışsa veya erişilemiyorsa:
  // Önce yerel önbelleğe bak
  const localCached = getCachedPlaylists();
  if (localCached) {
    return localCached;
  }

  // Fallback: GitHub Açık Kaynak
  console.log(`[DEBUG] Portalda liste bulunamadı, fallback GitHub TR listesi çekiliyor...`);
  const ghChannels = await getGithubTRChannels();
  const fallbackResult = {
    currentPlaylistName: 'Varsayılan TR Yayınları (GitHub)',
    allPlaylists: [{ id: 'gh_tr', name: 'Varsayılan TR Yayınları (GitHub)', count: ghChannels.length, active: true }],
    channels: ghChannels
  };
  return fallbackResult;
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
