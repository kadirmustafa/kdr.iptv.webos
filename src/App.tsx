import { useState, useEffect, useMemo, useRef } from 'react';
import { RemoteKeys } from './components/FocusableItem';
import { TVPlayer } from './components/TVPlayer';
import { TVAnalytics } from './services/analytics';
import { fetchPlaylists, getCachedPlaylists, switchPlaylistOnServer, getDeviceId, PORTAL_ENDPOINTS, DEFAULT_CHANNELS, type Channel, type PlaylistInfo } from './services/playlistService';
import { getChannelEPG } from './services/epgService';
import { detectSystemLanguage, TRANSLATIONS, type SupportedLanguage } from './services/i18n';
import { 
  Tv, Film, Clapperboard, Settings, 
  Play, Clock, Star, Search, X, RefreshCw, Folder, Layers, ChevronRight, ListMusic, Check, Globe, Copy, Loader2, Radio
} from 'lucide-react';

export function App() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() => detectSystemLanguage());
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [activeTab, setActiveTab] = useState<'live' | 'movies' | 'series' | 'favorites' | 'settings'>('live');

  // Önbellekteki son yüklenen listeyi al (açılışta anında göstermek için)
  const initialCache = getCachedPlaylists();
  const [channels, setChannels] = useState<Channel[]>(() => initialCache?.channels || DEFAULT_CHANNELS);
  const [activePlaylistTitle, setActivePlaylistTitle] = useState<string>(() => initialCache?.currentPlaylistName || (initialCache ? 'Varsayılan TR Yayınları' : 'Varsayılan Liste'));
  const [allPlaylists, setAllPlaylists] = useState<PlaylistInfo[]>(() => initialCache?.allPlaylists || []);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState<boolean>(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(false);


  // Favoriler (Tüm listelerden eklenen kanalların stream ve metadata bilgileriyle birlikte saklanır)
  const [favorites, setFavorites] = useState<Channel[]>(() => {
    try {
      const saved = localStorage.getItem('kdr_tv_favorites_v2');
      if (saved) return JSON.parse(saved);
      // Eski versiyondan (string[] isim listesi) göç desteği
      const oldSaved = localStorage.getItem('kdr_tv_favorites');
      if (oldSaved) {
        const names: string[] = JSON.parse(oldSaved);
        return DEFAULT_CHANNELS.filter(ch => names.includes(ch.name));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  
  // D-PAD Focus Management
  const [activeFocusArea, setActiveFocusArea] = useState<'categories' | 'channels'>('channels');
  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState<number>(0);
  const [focusedChannelIndex, setFocusedChannelIndex] = useState<number>(0);
  
  const [playingChannel, setPlayingChannel] = useState<Channel | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('20:45');
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);

  const channelsContainerRef = useRef<HTMLDivElement>(null);
  const categoriesContainerRef = useRef<HTMLDivElement>(null);

  // Favori Ekle / Kaldır (Tüm listelerden bağımsız, kanalı bütünüyle saklar)
  const toggleFavorite = (channel: Channel) => {
    setFavorites(prev => {
      const exists = prev.some(c => c.name === channel.name);
      const next = exists ? prev.filter(c => c.name !== channel.name) : [...prev, channel];
      localStorage.setItem('kdr_tv_favorites_v2', JSON.stringify(next));
      return next;
    });
  };

  // Cihaza özel tekil TV Eşleştirme Kodu
  const [deviceId] = useState<string>(() => getDeviceId());
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCode = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(deviceId);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = deviceId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  // Portal URL (Cloudflare Tunnel: pairiptv.ozturk.app)
  const portalUrl = PORTAL_ENDPOINTS[0] || 'https://pairiptv.ozturk.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${portalUrl}/?code=${deviceId}`)}`;

  // Saat güncellemesi
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listeleri Çekme
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const refreshList = (showToast = false) => {
    setIsLoadingList(true);
    fetchPlaylists(deviceId).then((res) => {
      if (res && res.channels.length > 0) {
        setChannels(res.channels);
        setActivePlaylistTitle(res.currentPlaylistName);
        setAllPlaylists(res.allPlaylists);
        TVAnalytics.logPlaylistLoaded(res.channels.length);
        if (showToast) {
          setNotificationMsg(`🎉 Yeni liste yüklendi: "${res.currentPlaylistName}" (${res.channels.length} kanal)`);
          setTimeout(() => setNotificationMsg(null), 6000);
        }
      }
      setIsLoadingList(false);
    });
  };

  useEffect(() => {
    TVAnalytics.logAppOpen();
    refreshList();

    // Portal üzerinden her 4 saniyede bir yeni liste gelip gelmediğini kontrol et
    const pollInterval = setInterval(() => {
      fetchPlaylists(deviceId).then((res) => {
        if (res && res.channels.length > 0) {
          setChannels((prevChannels) => {
            if (res.channels.length !== prevChannels.length || res.currentPlaylistName !== activePlaylistTitle) {
              console.log(`[DEBUG] Yeni IPTV listesi algılandı! Ekran yenileniyor...`);
              setActivePlaylistTitle(res.currentPlaylistName);
              setAllPlaylists(res.allPlaylists);
              setNotificationMsg(`🎉 Yeni liste yüklendi: "${res.currentPlaylistName}" (${res.channels.length} kanal)`);
              setTimeout(() => setNotificationMsg(null), 6000);
              return res.channels;
            }
            return prevChannels;
          });
        }
      });
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [activePlaylistTitle, deviceId]);


  // Kategorileri A-Z Alfabetik Sırala
  const categories = useMemo(() => {
    const cats = new Set<string>();
    const pool = activeTab === 'favorites' ? favorites : channels;
    pool.forEach(ch => {
      if (ch.category) {
        const cleanCat = ch.category.replace(/[\uFFFD\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
        if (cleanCat) cats.add(cleanCat);
      }
    });
    const sorted = Array.from(cats).sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }));
    return ['ALL', ...sorted];
  }, [channels, favorites, activeTab]);

  // Filtrelenmiş Kanallar (Favoriler sekmesinde tüm listelerden eklenenler listelenir)
  const filteredChannels = useMemo(() => {
    const pool = activeTab === 'favorites' ? favorites : channels;

    return pool.filter((ch) => {
      // Filmler Sekmesi
      if (activeTab === 'movies') {
        const isMovie = ch.category.toLowerCase().includes('movie') || 
                        ch.category.toLowerCase().includes('sinema') || 
                        ch.category.toLowerCase().includes('film') ||
                        ch.category.toLowerCase().includes('vod');
        if (!isMovie) return false;
      } 
      // Diziler Sekmesi
      else if (activeTab === 'series') {
        const isSeries = ch.category.toLowerCase().includes('dizi') || 
                         ch.category.toLowerCase().includes('series');
        if (!isSeries) return false;
      }

      // Kategori Filtresi
      if (selectedCategory !== 'ALL') {
        const cleanCat = (ch.category || '').replace(/[\uFFFD\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
        if (cleanCat !== selectedCategory) return false;
      }

      // Arama Filtresi
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return ch.name.toLowerCase().includes(query) || ch.category.toLowerCase().includes(query);
      }
      return true;
    });
  }, [channels, activeTab, selectedCategory, searchQuery, favorites]);

  // Kumanda D-pad Yönetimi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.keyCode === RemoteKeys.BACK || e.keyCode === RemoteKeys.ESCAPE) {
        if (playingChannel) {
          setPlayingChannel(null);
          return;
        }
        if (isPlaylistModalOpen) {
          setIsPlaylistModalOpen(false);
          return;
        }
        if (isSearchOpen) {
          setIsSearchOpen(false);
          setSearchQuery('');
          return;
        }
        if (activeFocusArea === 'channels') {
          setActiveFocusArea('categories');
          return;
        }
      }

      // Sarı Buton Kısayolu (Kumandada Favoriye Ekle / Kaldır)
      if (e.keyCode === RemoteKeys.YELLOW && focusedChannel) {
        toggleFavorite(focusedChannel);
        return;
      }

      if (playingChannel || isPlaylistModalOpen) return;

      // Sol / Sağ sütun geçişleri
      if (e.keyCode === RemoteKeys.RIGHT) {
        if (activeFocusArea === 'categories') {
          setActiveFocusArea('channels');
          setFocusedChannelIndex(0);
        }
      } else if (e.keyCode === RemoteKeys.LEFT) {
        if (activeFocusArea === 'channels') {
          setActiveFocusArea('categories');
        }
      }

      // Yukarı / Aşağı dikey kaydırma
      if (e.keyCode === RemoteKeys.DOWN) {
        if (activeFocusArea === 'categories') {
          setFocusedCategoryIndex((prev) => {
            const next = Math.min(prev + 1, categories.length - 1);
            setSelectedCategory(categories[next]);
            return next;
          });
        } else {
          setFocusedChannelIndex((prev) => Math.min(prev + 1, filteredChannels.length - 1));
        }
      } else if (e.keyCode === RemoteKeys.UP) {
        if (activeFocusArea === 'categories') {
          setFocusedCategoryIndex((prev) => {
            const next = Math.max(prev - 1, 0);
            setSelectedCategory(categories[next]);
            return next;
          });
        } else {
          setFocusedChannelIndex((prev) => Math.max(prev - 1, 0));
        }
      }

      // OK / Enter Tuşu
      if (e.keyCode === RemoteKeys.ENTER) {
        if (activeFocusArea === 'categories') {
          setSelectedCategory(categories[focusedCategoryIndex]);
          setActiveFocusArea('channels');
        } else if (filteredChannels.length > 0) {
          const ch = filteredChannels[focusedChannelIndex] || filteredChannels[0];
          TVAnalytics.logChannelPlay(ch.name, ch.category);
          setPlayingChannel(ch);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playingChannel, isPlaylistModalOpen, isSearchOpen, activeFocusArea, focusedCategoryIndex, focusedChannelIndex, categories, filteredChannels]);

  // Kaydırma odakları
  useEffect(() => {
    if (activeFocusArea === 'channels' && channelsContainerRef.current) {
      const activeEl = channelsContainerRef.current.querySelector('[data-focused="true"]');
      if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusedChannelIndex, activeFocusArea]);

  useEffect(() => {
    if (activeFocusArea === 'categories' && categoriesContainerRef.current) {
      const activeEl = categoriesContainerRef.current.querySelector('[data-focused="true"]');
      if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusedCategoryIndex, activeFocusArea]);

  // Video Oynatıcı (PIP için sıradaki kanalı ikinci akış olarak ilet)
  if (playingChannel) {
    const nextPipChannel = channels.find(c => c.name !== playingChannel.name) || DEFAULT_CHANNELS[1];
    return (
      <TVPlayer
        streamUrl={playingChannel.streamUrl}
        channelName={playingChannel.name}
        category={playingChannel.category}
        pipStreamUrl={nextPipChannel?.streamUrl}
        pipChannelName={nextPipChannel?.name}
        onBack={() => setPlayingChannel(null)}
      />
    );
  }

  const focusedChannel = filteredChannels[focusedChannelIndex] || filteredChannels[0] || DEFAULT_CHANNELS[0];
  const isFocusedChannelFavorite = focusedChannel ? favorites.some(c => c.name === focusedChannel.name) : false;

  return (
    <div className="relative w-screen h-screen bg-[#070b14] text-white flex flex-col justify-between p-6 select-none overflow-hidden font-sans">
      
      {/* Arka Plan Ambiyans */}
      <div 
        className="absolute inset-0 opacity-15 bg-cover bg-center filter blur-3xl pointer-events-none transition-all duration-700 scale-105"
        style={{ backgroundImage: `url(${focusedChannel?.logo || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600'})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/95 to-transparent pointer-events-none" />

      {/* CANLI BİLDİRİM TOAST BANNER */}
      {notificationMsg && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-cyan-500 to-blue-600 text-black px-6 py-3 rounded-2xl font-black text-sm shadow-2xl shadow-cyan-500/50 flex items-center gap-3 animate-bounce">
          <span>{notificationMsg}</span>
          <button onClick={() => setNotificationMsg(null)} className="ml-2 hover:opacity-75">✕</button>
        </div>
      )}


      {/* --- 1. ÜST HEADER --- */}
      <header className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-8">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="icon.png" 
              alt="KDR IPTV" 
              className="w-10 h-10 rounded-xl shadow-lg shadow-cyan-500/30 object-cover border border-white/10"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <div>
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-gray-200 to-cyan-300 bg-clip-text text-transparent">
                KDR IPTV
              </span>
              <span className="block text-[9px] tracking-widest text-cyan-400 font-bold uppercase">Smart Stream Player</span>
            </div>
          </div>

          {/* Menü Sekmeleri: Favoriler Başta */}
          <nav className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('favorites'); setFocusedChannelIndex(0); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                activeTab === 'favorites'
                  ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/40 scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Star size={15} className="text-yellow-400" /> {t.favorites} ({favorites.length})
            </button>
            <button
              onClick={() => { setActiveTab('live'); setSelectedCategory('ALL'); setFocusedChannelIndex(0); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/40 scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tv size={15} /> {t.liveTv}
            </button>

            <button
              onClick={() => { setActiveTab('movies'); setSelectedCategory('ALL'); setFocusedChannelIndex(0); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                activeTab === 'movies'
                  ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/40 scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film size={15} /> {t.movies}
            </button>
            <button
              onClick={() => { setActiveTab('series'); setSelectedCategory('ALL'); setFocusedChannelIndex(0); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                activeTab === 'series'
                  ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/40 scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clapperboard size={15} /> {t.series}
            </button>
            <button
              onClick={() => { setActiveTab('settings'); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/40 scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings size={15} /> {t.settings}
            </button>
          </nav>
        </div>

        {/* Sağ Taraf: Aktif Çalma Listesi Rozeti, Dil, Arama */}
        <div className="flex items-center gap-3 text-sm text-gray-300">
          
          {/* Hangi IPTV Listesi Olduğunu Gösteren ve Değiştiren Buton */}
          <button
            onClick={() => setIsPlaylistModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-900/60 to-cyan-950/80 border border-cyan-500/40 hover:border-cyan-400 rounded-xl text-xs font-bold text-cyan-300 transition-all cursor-pointer shadow-md"
          >
            <ListMusic size={15} className="text-cyan-400" />
            <span className="truncate max-w-[170px]">{activePlaylistTitle}</span>
            {allPlaylists.length > 1 && (
              <span className="bg-cyan-400 text-black text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {allPlaylists.length}
              </span>
            )}
          </button>

          {/* Dil Seçici Buton */}
          <button
            onClick={() => setIsLangModalOpen(true)}
            title={t.language}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-200 transition-all cursor-pointer"
          >
            <Globe size={14} className="text-cyan-400" />
            <span className="uppercase">{currentLang}</span>
          </button>

          {/* Arama Alanı */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-[#101726] border border-cyan-400/80 rounded-xl px-3 py-1.5 shadow-lg shadow-cyan-500/20">
                <Search size={15} className="text-cyan-400 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  placeholder={t.searchPlaceholder}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="bg-transparent border-none text-white text-xs outline-none w-44 font-medium"
                />
                <button 
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                  className="text-gray-400 hover:text-white ml-2 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-200 transition-all cursor-pointer"
              >
                <Search size={14} className="text-cyan-400" /> {t.search}
              </button>
            )}
          </div>

          {/* Yenile Butonu */}
          <button
            onClick={() => refreshList(true)}
            title="Listeyi Yenile"
            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 hover:text-cyan-400 cursor-pointer transition-all"
          >
            <RefreshCw size={15} className={isLoadingList ? 'animate-spin text-cyan-400' : ''} />
          </button>

          {/* Saat */}
          <div className="flex items-center gap-1.5 font-mono font-bold text-base text-white ml-1">
            <Clock size={16} className="text-cyan-400" />

            {currentTime}
          </div>
        </div>
      </header>

      {/* --- 2. ÇOKLU ÇALMA LİSTESİ MODALI (PLAYLIST SWITCHER) --- */}
      {isPlaylistModalOpen && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-8">
          <div className="w-full max-w-lg bg-[#0f172a] border border-cyan-400/50 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <ListMusic size={20} className="text-cyan-400" />
                <h3 className="text-lg font-black text-white">{t.installedPlaylists}</h3>
              </div>
              <button 
                onClick={() => setIsPlaylistModalOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="my-4 max-h-72 overflow-y-auto space-y-2 pr-1">
              {allPlaylists.map((pl) => {
                const isActive = pl.name === activePlaylistTitle || pl.active;
                return (
                  <div
                    key={pl.id}
                    onClick={() => {
                      switchPlaylistOnServer(deviceId, pl.id).then(() => {
                        refreshList();
                        setIsPlaylistModalOpen(false);
                      });
                    }}
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-950 to-blue-950 border-2 border-cyan-400 text-white'
                        : 'bg-[#141d33] border border-white/5 hover:border-white/20 text-gray-300'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-sm">{pl.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{pl.count} {t.totalChannels}</div>
                    </div>
                    {isActive ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800">
                        <Check size={14} /> {t.active}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 font-semibold">{t.select}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- DİL SEÇİM MODALI --- */}
      {isLangModalOpen && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-[#0f172a] border border-cyan-400/50 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Globe size={20} className="text-cyan-400" />
                <h3 className="text-lg font-black text-white">{t.language}</h3>
              </div>
              <button 
                onClick={() => setIsLangModalOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="my-4 grid grid-cols-2 gap-2.5">
              {[
                { code: 'en', label: 'English' },
                { code: 'tr', label: 'Türkçe' },
                { code: 'de', label: 'Deutsch' },
                { code: 'fr', label: 'Français' },
                { code: 'it', label: 'Italiano' },
                { code: 'es', label: 'Español' },
                { code: 'ru', label: 'Русский' },
                { code: 'ar', label: 'العربية' }
              ].map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang.code as SupportedLanguage);
                      localStorage.setItem('kdr_tv_lang', lang.code);
                      setIsLangModalOpen(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/40 font-black'
                        : 'bg-[#141d33] text-gray-300 hover:bg-[#1f2b4a]'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- 3. ORTA BÖLÜM: 3 SÜTUNLU TV REHBERİ --- */}
      {activeTab === 'settings' ? (
        /* AYARLAR EKRANI */
        <section className="relative z-10 grid grid-cols-12 gap-8 my-auto items-center">
          <div className="col-span-6 bg-[#0f172a]/90 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400">{t.settings}</span>
            <h2 className="text-3xl font-black mt-2 mb-4">{t.pairPhone}</h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              {t.pairPhoneDesc}
            </p>
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-400/20 text-cyan-400 flex items-center justify-center font-bold">
                  TV
                </div>
                <div>
                  <div className="text-xs text-gray-400">{t.pairingCode}</div>
                  <div className="text-2xl font-mono font-black text-cyan-400 tracking-wider">{deviceId}</div>
                </div>
              </div>

              {/* Kodu Kopyalama Butonu */}
              <button
                onClick={handleCopyCode}
                title="Kodu Kopyala"
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                  copied 
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                    : 'bg-white/5 hover:bg-white/15 border-white/10 text-gray-200 hover:text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-emerald-400" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="text-cyan-400" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="col-span-6 flex flex-col items-center justify-center bg-[#0f172a]/90 border border-cyan-400/30 rounded-3xl p-8 text-center shadow-2xl shadow-cyan-500/10">
            <div className="p-3 bg-white rounded-2xl shadow-lg mb-4 flex items-center justify-center">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-44 h-44 rounded-lg object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <h3 className="text-lg font-extrabold text-white">{t.scanQr}</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs break-all">
              {t.orVisit} <strong className="text-cyan-400">{portalUrl}</strong>
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-gray-400">
                v1.0.4 • LG webOS
              </span>
              <a 
                href={`${portalUrl}/privacy`} 
                target="_blank" 
                rel="noreferrer"
                className="text-[11px] text-cyan-400/80 hover:text-cyan-300 underline font-semibold transition-all"
              >
                Gizlilik & Yardım Kılavuzu (Help)
              </a>
            </div>
          </div>
        </section>
      ) : (
        /* 3 SÜTUNLU KANAL & GRUP REHBERİ */
        <main className="relative z-10 flex-1 grid grid-cols-12 gap-5 my-4 overflow-hidden">
          
          {/* SÜTUN 1: GRUPLAR & KATEGORİLER (A-Z Sıralı) */}
          <div className="col-span-3 bg-[#0d1424]/90 border border-white/10 rounded-2xl p-4 flex flex-col overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs uppercase tracking-wider">
                <Folder size={14} /> {t.categories}
              </div>
              <span className="text-[10px] text-gray-400">
                {isLoadingList && channels.length === 0 ? '...' : `${categories.length} ${t.groups}`}
              </span>
            </div>

            <div ref={categoriesContainerRef} className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {categories.map((cat, idx) => {
                const isSelected = selectedCategory === cat;
                const isFocused = activeFocusArea === 'categories' && focusedCategoryIndex === idx;
                
                return (
                  <div
                    key={cat}
                    data-focused={isFocused ? 'true' : 'false'}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setFocusedCategoryIndex(idx);
                      setActiveFocusArea('channels');
                      setFocusedChannelIndex(0);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-xs font-bold ${
                      isFocused
                        ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/40 font-black scale-102 ring-2 ring-white'
                        : isSelected
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{cat === 'ALL' ? `⭐ ${t.allChannels}` : cat}</span>
                    <ChevronRight size={14} className={isFocused ? 'text-black' : 'text-gray-500'} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* SÜTUN 2: KANALLAR LİSTESİ */}
          <div className="col-span-4 bg-[#0d1424]/90 border border-white/10 rounded-2xl p-4 flex flex-col overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs uppercase tracking-wider truncate">
                <Layers size={14} /> {activeTab === 'favorites' ? t.favorites : (selectedCategory === 'ALL' ? t.allChannels : selectedCategory)}
              </div>
              <span className="text-[10px] text-gray-400 flex-shrink-0">
                {isLoadingList && channels.length === 0 ? (
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Loader2 size={10} className="animate-spin" /> {t.loading}
                  </span>
                ) : (
                  `${filteredChannels.length} ${t.totalChannels}`
                )}
              </span>
            </div>

            {filteredChannels.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-xs text-gray-400 text-center p-4">
                {isLoadingList ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={36} className="text-cyan-400 animate-spin" />
                    <span className="text-sm font-bold text-gray-300">{t.loading}</span>
                  </div>
                ) : activeTab === 'favorites' ? (
                  <>
                    <Star size={32} className="text-gray-600 mb-2" />
                    <span className="whitespace-pre-line">{t.noFavoritesYet}</span>
                  </>
                ) : (
                  <span>{t.noChannelsFound}</span>
                )}
              </div>
            ) : (
              <div ref={channelsContainerRef} className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {(() => {
                  const ITEM_HEIGHT = 48; // px approximate height per item
                  const WINDOW_SIZE = 30; // Visible window buffer
                  const halfWindow = Math.floor(WINDOW_SIZE / 2);
                  const startIndex = Math.max(0, focusedChannelIndex - halfWindow);
                  const endIndex = Math.min(filteredChannels.length, startIndex + WINDOW_SIZE);
                  const visibleChannels = filteredChannels.slice(startIndex, endIndex);

                  const topSpacerHeight = startIndex * ITEM_HEIGHT;
                  const bottomSpacerHeight = (filteredChannels.length - endIndex) * ITEM_HEIGHT;

                  return (
                    <>
                      {topSpacerHeight > 0 && <div style={{ height: `${topSpacerHeight}px` }} />}
                      {visibleChannels.map((ch, relativeIdx) => {
                        const actualIdx = startIndex + relativeIdx;
                        const isFocused = activeFocusArea === 'channels' && focusedChannelIndex === actualIdx;
                        const isFav = favorites.some(c => c.name === ch.name);

                        return (
                          <div
                            key={ch.id || actualIdx}
                            data-focused={isFocused ? 'true' : 'false'}
                            onClick={() => {
                              setFocusedChannelIndex(actualIdx);
                              setActiveFocusArea('channels');
                              setPlayingChannel(ch);
                            }}
                            className={`flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer transition-all duration-200 text-xs ${
                              isFocused
                                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black shadow-lg shadow-cyan-400/40 scale-102 ring-2 ring-white'
                                : 'bg-[#131c33]/70 hover:bg-[#1a2542] text-gray-200 border border-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              {ch.logo ? (
                                <img 
                                  src={ch.logo} 
                                  alt="" 
                                  className="w-6 h-6 object-contain rounded bg-black/40 p-0.5 flex-shrink-0"
                                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${
                                  isFocused ? 'bg-black text-cyan-400' : 'bg-cyan-950 text-cyan-400'
                                }`}>
                                  {actualIdx + 1}
                                </div>
                              )}
                              <span className="truncate font-bold">{ch.name}</span>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isFav && (
                                <Star size={13} fill="currentColor" className={isFocused ? 'text-black' : 'text-yellow-400'} />
                              )}
                              <Play size={14} className={isFocused ? 'text-black' : 'text-cyan-400'} fill="currentColor" />
                            </div>
                          </div>
                        );
                      })}
                      {bottomSpacerHeight > 0 && <div style={{ height: `${bottomSpacerHeight}px` }} />}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* SÜTUN 3: SEÇİLİ KANAL DETAYI & CANLI ÖNİZLEME */}
          <div className="col-span-5 bg-[#0d1424]/90 border border-white/10 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-md">
            <div>
              {/* Canlı Önizleme */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-cyan-400/80 shadow-2xl shadow-cyan-500/20 bg-black flex items-center justify-center mb-5">
                {focusedChannel?.logo ? (
                  <img 
                    src={focusedChannel.logo} 
                    alt={focusedChannel.name}
                    className="max-h-28 max-w-44 object-contain transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600';
                    }}
                  />
                ) : (
                  <Tv size={56} className="text-cyan-400 opacity-60" />
                )}

                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <button
                    onClick={() => setPlayingChannel(focusedChannel)}
                    className="w-16 h-16 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg shadow-cyan-400/50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Play size={28} fill="currentColor" className="ml-1" />
                  </button>
                </div>

                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/90 text-white font-black text-[10px] px-2.5 py-1 rounded-md tracking-wider shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  {t.liveBadge}
                </div>

                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-cyan-300 text-[10px] px-2.5 py-1 rounded-lg border border-white/10 font-bold uppercase">
                  {focusedChannel?.category || 'Genel'}
                </div>
              </div>

              {/* Başlık & Detay */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-md font-bold uppercase">
                    {focusedChannel?.category}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{activePlaylistTitle}</span>
                </div>
                <h2 className="text-2xl font-black text-white">{focusedChannel?.name}</h2>

                {/* 1. Canlı EPG (Elektronik Program Rehberi) Kartı */}
                {(() => {
                  const epg = getChannelEPG(focusedChannel?.name || '', focusedChannel?.category || '');
                  return (
                    <div className="bg-[#121b30] border border-cyan-500/20 rounded-2xl p-3.5 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                          <Radio size={14} className="animate-pulse" />
                          <span>ŞU AN: {epg.current.title}</span>
                        </div>
                        <span className="text-[11px] font-mono text-gray-400">{epg.current.start} - {epg.current.end}</span>
                      </div>
                      
                      {/* Canlı İlerleme Çubuğu */}
                      <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${epg.current.progress}%` }} 
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-white/5">
                        <span className="truncate max-w-[200px]">⏭ Sırada: {epg.next.title}</span>
                        <span className="font-mono text-gray-500">{epg.next.start}</span>
                      </div>
                    </div>
                  );
                })()}

                <p className="text-xs text-gray-400 leading-relaxed">
                  {t.hardwareAccel}
                </p>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setPlayingChannel(focusedChannel)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-400/30 transition-all cursor-pointer"
              >
                <Play size={18} fill="currentColor" /> {t.playFullscreen}
              </button>
              <button 
                onClick={() => focusedChannel && toggleFavorite(focusedChannel)}
                title={isFocusedChannelFavorite ? t.removeFromFavorites : t.addToFavorites}
                className={`px-4 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                  isFocusedChannelFavorite
                    ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40'
                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                }`}
              >
                <Star size={16} fill={isFocusedChannelFavorite ? 'currentColor' : 'none'} className={isFocusedChannelFavorite ? 'text-yellow-400' : 'text-gray-300'} />
              </button>
            </div>
          </div>

        </main>
      )}

      {/* --- 4. ALT BİLGİ & KUMANDA KILAVUZU --- */}
      <footer className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2 text-[11px] text-gray-400">
        <div className="flex items-center gap-5">
          <span>{t.navHintDpad}</span>
          <span>{t.navHintUpDown}</span>
          <span>{t.navHintOk}</span>
          <span>{t.navHintBack}</span>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" /> {t.navHintYellow}</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> {t.settings}</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
