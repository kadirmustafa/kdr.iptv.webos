import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, logEvent as firebaseLogEvent, type Analytics } from 'firebase/analytics';

/**
 * webOS TV Analytics & Telemetry Helper
 * Integrates official Firebase Web SDK + GA4 Measurement Protocol fallback
 */

const firebaseConfig = {
  apiKey: "AIzaSyC9Gg0ycaWT2Md2c0Md_51giAEhJDBTZRE",
  authDomain: "kdr-iptv-player.firebaseapp.com",
  projectId: "kdr-iptv-player",
  storageBucket: "kdr-iptv-player.firebasestorage.app",
  messagingSenderId: "1012320171481",
  appId: "1:1012320171481:web:e62c15e129725b5c12d5c8",
  measurementId: "G-0PSD3ZEWFQ"
};

class TVAnalyticsService {
  private measurementId: string = 'G-0PSD3ZEWFQ';
  private clientId: string = '';
  private app: FirebaseApp | null = null;
  private analytics: Analytics | null = null;

  constructor() {
    this.clientId = this.getOrCreateClientId();
    this.initFirebase();
  }

  private initFirebase() {
    try {
      if (typeof window !== 'undefined') {
        this.app = initializeApp(firebaseConfig);
        // Firebase Analytics tarayıcı / webOS ortamında çalışır
        this.analytics = getAnalytics(this.app);
        console.log('[TV Analytics] Firebase initialized successfully with ID:', this.measurementId);
      }
    } catch (e) {
      console.warn('[TV Analytics] Firebase SDK init warning (fallback to direct protocol):', e);
    }
  }

  private getOrCreateClientId(): string {
    let id = localStorage.getItem('kdr_tv_client_id');
    if (!id) {
      id = 'tv_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      localStorage.setItem('kdr_tv_client_id', id);
    }
    return id;
  }

  /**
   * Log TV event across Firebase SDK and direct GA4 Measurement Protocol
   */
  public logEvent(eventName: string, params: Record<string, string | number | boolean> = {}) {
    const enrichedParams = {
      ...params,
      platform: 'lg_webos',
      screen_resolution: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '1920x1080',
      timestamp: Date.now()
    };

    console.log('[TV Analytics Event]', eventName, enrichedParams);

    // 1. Firebase Web SDK üzerinden loglama
    if (this.analytics) {
      try {
        firebaseLogEvent(this.analytics, eventName, enrichedParams);
      } catch (err) {
        console.debug('[TV Analytics] Firebase SDK log error:', err);
      }
    }

    // 2. Doğrudan GA4 HTTP Measurement Protocol üzerinden iletim (webOS arka plan ve offline garantisi için)
    try {
      const url = `https://www.google-analytics.com/mp/collect?measurement_id=${this.measurementId}&api_secret=`;
      const payload = {
        client_id: this.clientId,
        events: [
          {
            name: eventName,
            params: enrichedParams
          }
        ]
      };

      fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {});
    } catch (_) {}
  }

  // Predefined events
  public logAppOpen() {
    this.logEvent('tv_app_open');
  }

  public logChannelPlay(channelName: string, category: string) {
    this.logEvent('tv_play_channel', {
      channel_name: channelName,
      category: category
    });
  }

  public logPlaylistLoaded(channelCount: number) {
    this.logEvent('tv_playlist_loaded', {
      total_channels: channelCount
    });
  }
}

export const TVAnalytics = new TVAnalyticsService();
