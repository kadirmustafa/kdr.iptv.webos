// Optional sample public channel list (v1.0.7).
// The app never bundles channel lists. If the user explicitly agrees on first launch,
// the public iptv-org list for the TV's country is fetched live from
// https://iptv-org.github.io/iptv/countries/<cc>.m3u. The choice is stored and can be
// changed later from Settings.
import type { Channel } from './playlistService';

const KEY_CHOICE = 'kdr_tv_sample_choice_v1'; // 'yes' | 'no' (absent = ask on launch)
const KEY_PREFER = 'kdr_tv_prefer_sample_v1'; // '1' when the user picked the sample list over a paired list
const KEY_CACHE = 'kdr_tv_sample_cache_v1';

export type SampleChoice = 'yes' | 'no' | null;

export function getSampleChoice(): SampleChoice {
  try {
    const v = localStorage.getItem(KEY_CHOICE);
    return v === 'yes' || v === 'no' ? v : null;
  } catch {
    return null;
  }
}

export function setSampleChoice(choice: 'yes' | 'no'): void {
  try {
    localStorage.setItem(KEY_CHOICE, choice);
    if (choice === 'no') {
      localStorage.removeItem(KEY_PREFER);
      localStorage.removeItem(KEY_CACHE);
    }
  } catch (_) { /* storage unavailable */ }
  sampleMemo = null;
}

export function isSamplePreferred(): boolean {
  try { return localStorage.getItem(KEY_PREFER) === '1'; } catch { return false; }
}

export function setSamplePreferred(on: boolean): void {
  try {
    if (on) localStorage.setItem(KEY_PREFER, '1');
    else localStorage.removeItem(KEY_PREFER);
  } catch (_) { /* storage unavailable */ }
}

// ---------- Country detection ----------
// webOS exposes the TV's service country as JSON on webOSSystem.country (webOS 6+) or
// PalmSystem.country (older), e.g. {"country":"TUR","smartServiceCountry":"TR"}.
// Fallback: the region part of the system locale / navigator.language.
const A3_TO_A2: Record<string, string> = {
  TUR: 'TR', USA: 'US', GBR: 'GB', DEU: 'DE', FRA: 'FR', ITA: 'IT', ESP: 'ES', RUS: 'RU', UKR: 'UA',
  NLD: 'NL', BEL: 'BE', AUT: 'AT', CHE: 'CH', POL: 'PL', CZE: 'CZ', SVK: 'SK', HUN: 'HU', ROU: 'RO',
  BGR: 'BG', GRC: 'GR', PRT: 'PT', SWE: 'SE', NOR: 'NO', DNK: 'DK', FIN: 'FI', IRL: 'IE', HRV: 'HR',
  SRB: 'RS', SVN: 'SI', BIH: 'BA', MKD: 'MK', ALB: 'AL', AZE: 'AZ', GEO: 'GE', KAZ: 'KZ', ISR: 'IL',
  SAU: 'SA', ARE: 'AE', EGY: 'EG', MAR: 'MA', DZA: 'DZ', TUN: 'TN', IRN: 'IR', IRQ: 'IQ', JOR: 'JO',
  LBN: 'LB', QAT: 'QA', KWT: 'KW', IND: 'IN', PAK: 'PK', IDN: 'ID', MYS: 'MY', THA: 'TH', VNM: 'VN',
  PHL: 'PH', SGP: 'SG', JPN: 'JP', TWN: 'TW', HKG: 'HK', AUS: 'AU', NZL: 'NZ', CAN: 'CA', MEX: 'MX',
  ARG: 'AR', CHL: 'CL', COL: 'CO', PER: 'PE', VEN: 'VE', ZAF: 'ZA', NGA: 'NG', KEN: 'KE', CYP: 'CY',
  LUX: 'LU', LTU: 'LT', LVA: 'LV', EST: 'EE', BLR: 'BY', MDA: 'MD', ARM: 'AM', UZB: 'UZ', ISL: 'IS', MLT: 'MT'
};

// iptv-org file names that differ from ISO 3166-1 alpha-2
const IPTV_ORG_ALIAS: Record<string, string> = { gb: 'uk' };

function normalizeCountry(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(v)) return v;
  if (/^[A-Z]{3}$/.test(v) && A3_TO_A2[v]) return A3_TO_A2[v];
  return null;
}

function regionFromLocale(locale: unknown): string | null {
  if (typeof locale !== 'string') return null;
  const parts = locale.replace(/_/g, '-').split('-');
  for (let i = 1; i < parts.length; i++) {
    if (/^[A-Za-z]{2}$/.test(parts[i])) return parts[i].toUpperCase();
  }
  return null;
}

function fromWebOSCountryValue(v: unknown): string | null {
  if (!v) return null;
  if (typeof v === 'object') {
    const o = v as { smartServiceCountry?: string; country?: string };
    return normalizeCountry(o.smartServiceCountry) || normalizeCountry(o.country);
  }
  if (typeof v === 'string') {
    try {
      return fromWebOSCountryValue(JSON.parse(v));
    } catch {
      return normalizeCountry(v);
    }
  }
  return null;
}

export function detectCountry(): string | null {
  const w = window as unknown as {
    webOSSystem?: { country?: unknown; locale?: string };
    PalmSystem?: { country?: unknown; locale?: string };
  };
  try {
    const fromTv = fromWebOSCountryValue(w.webOSSystem && w.webOSSystem.country) ||
      fromWebOSCountryValue(w.PalmSystem && w.PalmSystem.country);
    if (fromTv) return fromTv;
  } catch (_) { /* not a webOS TV */ }
  try {
    const fromLocale = regionFromLocale(w.webOSSystem && w.webOSSystem.locale) ||
      regionFromLocale(w.PalmSystem && w.PalmSystem.locale);
    if (fromLocale) return fromLocale;
  } catch (_) { /* ignore */ }
  const langs: string[] = [];
  if (navigator.languages) langs.push(...navigator.languages);
  if (navigator.language) langs.push(navigator.language);
  for (const l of langs) {
    const r = regionFromLocale(l);
    if (r) return r;
  }
  return null;
}

export function countryDisplayName(cc: string | null, lang: string): string {
  if (!cc) return '';
  try {
    const I = Intl as unknown as { DisplayNames?: new (l: string[], o: { type: string }) => { of: (c: string) => string | undefined } };
    if (I.DisplayNames) {
      const name = new I.DisplayNames([lang, 'en'], { type: 'region' }).of(cc);
      if (name) return name;
    }
  } catch (_) { /* old Chromium */ }
  return cc;
}

export function sampleListUrl(cc: string): string {
  const lc = cc.toLowerCase();
  return `https://iptv-org.github.io/iptv/countries/${IPTV_ORG_ALIAS[lc] || lc}.m3u`;
}

// ---------- M3U parsing ----------
export function parseM3U(text: string, idPrefix: string): Channel[] {
  const lines = text.split(/\r?\n/);
  const channels: Channel[] = [];
  let current: Partial<Channel> | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.indexOf('#EXTINF:') === 0) {
      const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      const comma = line.lastIndexOf(',');
      const name = (comma >= 0 ? line.slice(comma + 1) : '').replace(/[\uFFFD\uFEFF]/g, '').trim() || 'Channel';
      let group = groupMatch ? groupMatch[1].split(';')[0].trim() : '';
      if (!group || group.toLowerCase() === 'undefined') group = 'General';
      current = { name, category: group, logo: logoMatch ? logoMatch[1] : '' };
    } else if (line.charAt(0) !== '#' && current) {
      if (/^https?:\/\//i.test(line)) {
        channels.push({ id: idPrefix + String(channels.length + 1), name: current.name || 'Channel', category: current.category || 'General', logo: current.logo || '', streamUrl: line });
      }
      current = null;
    }
  }
  return channels;
}

// ---------- Fetching ----------
export interface SampleResult { ok: boolean; country: string | null; channels: Channel[]; }

let sampleMemo: { at: number; result: SampleResult } | null = null;
const RETRY_AFTER_FAIL_MS = 5 * 60 * 1000;

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { if (controller) controller.abort(); reject(new Error('timeout')); }, ms);
  });
  return Promise.race([fetch(url, controller ? { signal: controller.signal } : {}), timeout])
    .then((r) => { clearTimeout(timer); return r; }, (e) => { clearTimeout(timer); throw e; });
}

export function getCachedSample(): SampleResult | null {
  try {
    const raw = localStorage.getItem(KEY_CACHE);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && Array.isArray(p.channels) && p.channels.length > 0) return { ok: true, country: p.country || null, channels: p.channels };
  } catch (_) { /* ignore */ }
  return null;
}

export async function loadSampleChannels(force = false): Promise<SampleResult> {
  const country = detectCountry();
  if (!force && sampleMemo) {
    const age = Date.now() - sampleMemo.at;
    if (sampleMemo.result.ok || age < RETRY_AFTER_FAIL_MS) return sampleMemo.result;
  }
  let result: SampleResult = { ok: false, country, channels: [] };
  if (country) {
    try {
      const res = await fetchWithTimeout(sampleListUrl(country), 10000);
      if (res.ok) {
        const channels = parseM3U(await res.text(), 'smp_');
        if (channels.length > 0) {
          result = { ok: true, country, channels };
          try { localStorage.setItem(KEY_CACHE, JSON.stringify({ country, channels })); } catch (_) { /* quota */ }
        }
      } else {
        console.warn(`[sample] ${country} list not available: HTTP ${res.status}`);
      }
    } catch (e) {
      console.warn('[sample] fetch failed', e);
    }
  }
  sampleMemo = { at: Date.now(), result };
  return result;
}
