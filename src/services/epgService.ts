/**
 * EPG (Electronic Program Guide) Service
 * Simulates and maps live program guide for channels
 */

export interface EPGProgram {
  title: string;
  start: string; // "20:00"
  end: string;   // "21:30"
  progress: number; // 0 - 100
  description?: string;
}

// Kanal kategorilerine göre dinamik program akışı simülatörü
export function getChannelEPG(channelName: string, category: string): { current: EPGProgram; next: EPGProgram } {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  // Her 60-90 dakikada bir program değişimi hesabı
  const slotIndex = Math.floor(currentMinutes / 60) % 24;
  const minuteInSlot = currentMinutes % 60;
  const progressPercent = Math.min(100, Math.max(5, Math.floor((minuteInSlot / 60) * 100)));

  const startHour = String(now.getHours()).padStart(2, '0');
  const nextHour = String((now.getHours() + 1) % 24).padStart(2, '0');
  const afterHour = String((now.getHours() + 2) % 24).padStart(2, '0');

  const catLower = (category || '').toLowerCase();
  const nameLower = (channelName || '').toLowerCase();

  let curTitle = 'Ana Haber Bülteni';
  let nextTitle = 'Günün Özeti & Canlı Tartışma';

  if (catLower.includes('spor') || nameLower.includes('spor')) {
    const sports = ['Süper Lig Maç Önü', 'Avrupa Kupaları Özel', 'Stüdyoda Futbol', 'Spor Bülteni', 'Haftanın Golleri'];
    curTitle = sports[slotIndex % sports.length];
    nextTitle = sports[(slotIndex + 1) % sports.length];
  } else if (catLower.includes('haber') || nameLower.includes('haber')) {
    const news = ['Gün Ortası Haberleri', 'Dünya Gündemi', 'Ekonomi Bülteni', 'Manşet Programı', 'Gece Raporu'];
    curTitle = news[slotIndex % news.length];
    nextTitle = news[(slotIndex + 1) % news.length];
  } else if (catLower.includes('belgesel') || nameLower.includes('geo') || nameLower.includes('nasa')) {
    const docs = ['Vahşi Yaşamın İzinde', 'Evrenin Gizemleri', 'Okyanus Derinlikleri', 'Mega Yapılar', 'Tarihin Dönüm Noktaları'];
    curTitle = docs[slotIndex % docs.length];
    nextTitle = docs[(slotIndex + 1) % docs.length];
  } else if (catLower.includes('film') || catLower.includes('sinema') || catLower.includes('movie')) {
    const movies = ['Aksiyon Kuşağı: Gece Kartalı', 'Sinema Gecesi: Bilim Kurgu', 'Yerli Komedi Kuşağı', 'Dram Özel Gösterim'];
    curTitle = movies[slotIndex % movies.length];
    nextTitle = movies[(slotIndex + 1) % movies.length];
  } else if (catLower.includes('dizi') || catLower.includes('series')) {
    const series = ['Popüler Dizi: Yeni Sezon', 'Akşam Dizi Kuşağı', 'Sevilen Dizi Tekrarı', 'Günün Bölümü'];
    curTitle = series[slotIndex % series.length];
    nextTitle = series[(slotIndex + 1) % series.length];
  } else {
    const general = ['Ana Haber Bülteni', 'Akşam Kuşağı Dizisi', 'Günün Panorama Raporu', 'Hava Durumu & Magazin', 'Gece Sineması'];
    curTitle = general[slotIndex % general.length];
    nextTitle = general[(slotIndex + 1) % general.length];
  }

  return {
    current: {
      title: curTitle,
      start: `${startHour}:00`,
      end: `${nextHour}:00`,
      progress: progressPercent,
      description: `${channelName} canlı yayın akışında şu an yayınlanıyor.`
    },
    next: {
      title: nextTitle,
      start: `${nextHour}:00`,
      end: `${afterHour}:00`,
      progress: 0,
      description: 'Sıradaki program'
    }
  };
}
