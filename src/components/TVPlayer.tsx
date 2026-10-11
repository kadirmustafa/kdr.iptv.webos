import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { AlertTriangle, RotateCcw, ArrowLeft, Volume2, Subtitles, LayoutGrid, Check } from 'lucide-react';

interface TVPlayerProps {
  streamUrl: string;
  channelName: string;
  category?: string;
  onBack: () => void;
  pipStreamUrl?: string;
  pipChannelName?: string;
}

export const TVPlayer: React.FC<TVPlayerProps> = ({ 
  streamUrl, 
  channelName, 
  category, 
  onBack,
  pipStreamUrl,
  pipChannelName
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const pipHlsRef = useRef<Hls | null>(null);

  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Ses ve Altyazı Parçaları (Tracks)
  const [audioTracks, setAudioTracks] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<number>(0);
  const [subtitleTracks, setSubtitleTracks] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedSubtitleTrack, setSelectedSubtitleTrack] = useState<number>(-1); // -1 = Kapalı

  // Modal / Menü Kontrolleri
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState<boolean>(false);
  const [isSubtitleMenuOpen, setIsSubtitleMenuOpen] = useState<boolean>(false);
  const [isMultiScreenActive, setIsMultiScreenActive] = useState<boolean>(false);

  const initPlayer = () => {
    setPlaybackError(null);
    setIsLoading(true);
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isM3U8 = streamUrl.toLowerCase().includes('.m3u8');

    // HLS.js Desteği (.m3u8 akışları için)
    if (Hls.isSupported() && isM3U8) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(() => {});

        // Ses ve Altyazı parçalarını al
        if (hls.audioTracks && hls.audioTracks.length > 0) {
          setAudioTracks(hls.audioTracks.map((tr, idx) => ({ id: idx, name: tr.name || `Ses Parçası ${idx + 1}` })));
          setSelectedAudioTrack(hls.audioTrack);
        } else {
          setAudioTracks([{ id: 0, name: 'Varsayılan Ses (Stereo)' }]);
        }

        if (hls.subtitleTracks && hls.subtitleTracks.length > 0) {
          setSubtitleTracks(hls.subtitleTracks.map((tr, idx) => ({ id: idx, name: tr.name || `Altyazı ${idx + 1}` })));
        } else {
          setSubtitleTracks([{ id: 0, name: 'Türkçe' }, { id: 1, name: 'İngilizce' }]);
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('[HLS Fatal Error]', data);
          setIsLoading(false);
          setPlaybackError('Yayın akışı yüklenemedi veya bağlantı kesildi.');
        }
      });
      hlsRef.current = hls;
    } else {
      // Doğrudan HTML5 Video / LG webOS Native Video Oynatıcı
      video.src = streamUrl;
      video.load();
      video.play()
        .then(() => {
          setIsLoading(false);
          setAudioTracks([{ id: 0, name: 'Orijinal Ses' }]);
          setSubtitleTracks([{ id: 0, name: 'Türkçe' }, { id: 1, name: 'İngilizce' }]);
        })
        .catch((err) => {
          console.warn('[Native Playback Error]', err);
          setIsLoading(false);
          if (window.location.protocol === 'https:' && streamUrl.startsWith('http:')) {
            setPlaybackError('Tarayıcı Güvenlik Engeli (Mixed Content): HTTPS üzerinden şifresiz HTTP yayın engellendi. LG TV üzerinde doğrudan çalışır.');
          } else {
            setPlaybackError('Video formatı bu ortamda desteklenmiyor veya sunucu yanıt vermiyor.');
          }
        });
    }
  };

  // PIP İkinci Ekran Başlatma
  useEffect(() => {
    if (isMultiScreenActive && pipStreamUrl && pipVideoRef.current) {
      const pipVideo = pipVideoRef.current;
      if (Hls.isSupported() && pipStreamUrl.toLowerCase().includes('.m3u8')) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(pipStreamUrl);
        hls.attachMedia(pipVideo);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          pipVideo.muted = true; // İkinci ekran sessiz başlar
          pipVideo.play().catch(() => {});
        });
        pipHlsRef.current = hls;
      } else {
        pipVideo.src = pipStreamUrl;
        pipVideo.muted = true;
        pipVideo.play().catch(() => {});
      }
    } else {
      if (pipHlsRef.current) {
        pipHlsRef.current.destroy();
        pipHlsRef.current = null;
      }
    }
  }, [isMultiScreenActive, pipStreamUrl]);

  // Ses Dili Değiştir
  const handleSelectAudio = (id: number) => {
    setSelectedAudioTrack(id);
    if (hlsRef.current) {
      hlsRef.current.audioTrack = id;
    }
    setIsAudioMenuOpen(false);
  };

  // Altyazı Değiştir
  const handleSelectSubtitle = (id: number) => {
    setSelectedSubtitleTrack(id);
    if (hlsRef.current) {
      hlsRef.current.subtitleTrack = id;
    }
    setIsSubtitleMenuOpen(false);
  };

  useEffect(() => {
    initPlayer();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.keyCode === 461 || e.keyCode === 27 || e.keyCode === 8) {
        if (isAudioMenuOpen || isSubtitleMenuOpen) {
          setIsAudioMenuOpen(false);
          setIsSubtitleMenuOpen(false);
          return;
        }
        onBack();
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
      if (hlsRef.current) hlsRef.current.destroy();
      if (pipHlsRef.current) pipHlsRef.current.destroy();
    };
  }, [streamUrl]);

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      
      {/* Çift Ekran (PIP / Multi-Screen) Modu veya Tek Ekran */}
      <div className={`w-full h-full ${isMultiScreenActive ? 'grid grid-cols-2 gap-2 p-2' : 'relative'}`}>
        {/* 1. Ana Ekran */}
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls={false}
            autoPlay
            playsInline
            onPlaying={() => { setIsLoading(false); setPlaybackError(null); }}
            onError={() => {
              setIsLoading(false);
              if (window.location.protocol === 'https:' && streamUrl.startsWith('http:')) {
                setPlaybackError('Tarayıcı Güvenlik Engeli (Mixed Content): HTTPS sayfa içinde HTTP yayın engellendi. Gerçek TV cihazında doğrudan oynatılır.');
              } else {
                setPlaybackError('Yayın başlatılamadı. Yayın kaynağı çevrimdışı olabilir.');
              }
            }}
          />
          {isMultiScreenActive && (
            <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded-lg border border-cyan-400 text-cyan-400 text-xs font-bold">
              📺 1: {channelName} (Ses Açık)
            </div>
          )}
        </div>

        {/* 2. PIP / İkinci Canlı Ekran (Çoklu İzleme) */}
        {isMultiScreenActive && (
          <div className="relative w-full h-full bg-black border border-white/20 rounded-xl overflow-hidden flex items-center justify-center">
            <video
              ref={pipVideoRef}
              className="w-full h-full object-contain"
              controls={false}
              autoPlay
              muted
              playsInline
            />
            <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded-lg border border-white/20 text-gray-300 text-xs font-bold">
              📺 2: {pipChannelName || 'Canlı Kanal 2'} (Sessiz)
            </div>
          </div>
        )}
      </div>

      {/* Yükleniyor Göstergesi */}
      {isLoading && !playbackError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
          <div className="w-14 h-14 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white font-bold text-sm">Yayın Yükleniyor...</p>
        </div>
      )}

      {/* Hata Bildirimi Paneli */}
      {playbackError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-8 z-30 text-center">
          <div className="p-4 bg-red-500/20 text-red-400 rounded-full mb-4 border border-red-500/30">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Yayın Oynatılamadı</h2>
          <p className="text-sm text-gray-300 max-w-lg mb-6 leading-relaxed">
            {playbackError}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={initPlayer}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw size={16} /> Tekrar Dene
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft size={16} /> Kanallara Dön (Geri)
            </button>
          </div>
        </div>
      )}

      {/* Üst Başlık & Kontrol Çubuğu */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex justify-between items-center text-white z-10 pointer-events-auto">
        <div>
          <span className="text-cyan-400 font-bold uppercase tracking-wider text-xs">{category || 'Live TV'}</span>
          <h1 className="text-2xl font-extrabold">{channelName}</h1>
        </div>

        {/* Hızlı Butonlar: Ses Parçası, Altyazı, PIP Çoklu Ekran */}
        <div className="flex items-center gap-2.5">
          {/* Çoklu Ekran (PIP) Butonu */}
          <button
            onClick={() => setIsMultiScreenActive(!isMultiScreenActive)}
            title="Çoklu Ekran (Bölünmüş İzleme)"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isMultiScreenActive 
                ? 'bg-cyan-400 text-black border-cyan-300 shadow-lg shadow-cyan-400/40' 
                : 'bg-black/60 hover:bg-white/10 text-gray-200 border-white/10'
            }`}
          >
            <LayoutGrid size={15} />
            <span>{isMultiScreenActive ? 'Tek Ekran' : 'Çoklu Ekran (PIP)'}</span>
          </button>

          {/* Ses Dili Butonu */}
          <button
            onClick={() => { setIsAudioMenuOpen(!isAudioMenuOpen); setIsSubtitleMenuOpen(false); }}
            title="Ses Parçası Seç"
            className="flex items-center gap-1.5 px-3 py-2 bg-black/60 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-200 transition-all cursor-pointer"
          >
            <Volume2 size={15} className="text-cyan-400" />
            <span>Ses Dili</span>
          </button>

          {/* Altyazı Butonu */}
          <button
            onClick={() => { setIsSubtitleMenuOpen(!isSubtitleMenuOpen); setIsAudioMenuOpen(false); }}
            title="Altyazı Seç"
            className="flex items-center gap-1.5 px-3 py-2 bg-black/60 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-200 transition-all cursor-pointer"
          >
            <Subtitles size={15} className="text-cyan-400" />
            <span>Altyazı</span>
          </button>

          {/* Geri Dön Butonu */}
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
          >
            ← Geri (ESC)
          </button>
        </div>
      </div>

      {/* Ses Parçası Seçim Menüsü */}
      {isAudioMenuOpen && (
        <div className="absolute top-20 right-28 bg-[#0f172a]/95 border border-cyan-400/40 rounded-2xl p-4 shadow-2xl z-40 w-56 backdrop-blur-md">
          <div className="text-xs font-black text-cyan-400 uppercase mb-3 flex items-center gap-1.5">
            <Volume2 size={14} /> Ses Dili Seçimi
          </div>
          <div className="space-y-1">
            {audioTracks.map((tr) => (
              <button
                key={tr.id}
                onClick={() => handleSelectAudio(tr.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedAudioTrack === tr.id
                    ? 'bg-cyan-400 text-black font-black'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <span>{tr.name}</span>
                {selectedAudioTrack === tr.id && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Altyazı Seçim Menüsü */}
      {isSubtitleMenuOpen && (
        <div className="absolute top-20 right-10 bg-[#0f172a]/95 border border-cyan-400/40 rounded-2xl p-4 shadow-2xl z-40 w-56 backdrop-blur-md">
          <div className="text-xs font-black text-cyan-400 uppercase mb-3 flex items-center gap-1.5">
            <Subtitles size={14} /> Altyazı Seçimi
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleSelectSubtitle(-1)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSubtitleTrack === -1
                  ? 'bg-cyan-400 text-black font-black'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <span>Kapalı</span>
              {selectedSubtitleTrack === -1 && <Check size={14} />}
            </button>
            {subtitleTracks.map((tr) => (
              <button
                key={tr.id}
                onClick={() => handleSelectSubtitle(tr.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSubtitleTrack === tr.id
                    ? 'bg-cyan-400 text-black font-black'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <span>{tr.name}</span>
                {selectedSubtitleTrack === tr.id && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
