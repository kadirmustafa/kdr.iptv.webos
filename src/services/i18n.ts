export type SupportedLanguage = 'en' | 'tr' | 'de' | 'fr' | 'it' | 'es' | 'ru' | 'ar';

export interface Translations {
  favorites: string;
  liveTv: string;
  movies: string;
  series: string;
  settings: string;
  search: string;
  searchPlaceholder: string;
  categories: string;
  allChannels: string;
  allCategories: string;
  totalChannels: string;
  groups: string;
  playFullscreen: string;
  liveBadge: string;
  addToFavorites: string;
  removeFromFavorites: string;
  installedPlaylists: string;
  selectPlaylist: string;
  active: string;
  select: string;
  pairPhone: string;
  pairPhoneDesc: string;
  pairingCode: string;
  scanQr: string;
  orVisit: string;
  navHintDpad: string;
  navHintUpDown: string;
  navHintOk: string;
  navHintBack: string;
  navHintYellow: string;
  noChannelsFound: string;
  noFavoritesYet: string;
  newPlaylistLoaded: string;
  online: string;
  hardwareAccel: string;
  language: string;
  loading: string;
  sampleTitle: string;
  samplePrompt: string;
  sampleDesc: string;
  yes: string;
  no: string;
  sampleSettingsTitle: string;
  sampleSettingsDesc: string;
  sampleAdd: string;
  sampleRemove: string;
  sampleStatusOn: string;
  sampleStatusOff: string;
  sampleUnavailable: string;
  sampleHint: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    favorites: 'FAVORITES',
    liveTv: 'LIVE TV',
    movies: 'MOVIES',
    series: 'SERIES',
    settings: 'SETTINGS',
    search: 'SEARCH',
    searchPlaceholder: 'Search Channel or Category...',
    categories: 'CATEGORIES (A-Z)',
    allChannels: 'ALL CHANNELS',
    allCategories: 'ALL CATEGORIES',
    totalChannels: 'Channels',
    groups: 'Groups',
    playFullscreen: 'PLAY FULLSCREEN [OK]',
    liveBadge: 'LIVE STREAM',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    installedPlaylists: 'Installed IPTV Playlists',
    selectPlaylist: 'Select Playlist',
    active: 'Active',
    select: 'Select',
    pairPhone: 'Pair Phone / Web Portal',
    pairPhoneDesc: 'Easily upload your M3U or Xtream playlists from your phone without typing long URLs on the TV remote.',
    pairingCode: 'Device Pairing Code:',
    scanQr: 'Scan QR Code with your phone',
    orVisit: 'Or visit portal at',
    navHintDpad: '◀ ▶ Keys: Switch Columns',
    navHintUpDown: '▲ ▼ Keys: Scroll List',
    navHintOk: 'OK (Enter): Play',
    navHintBack: 'Back / ESC: Return / Exit',
    navHintYellow: 'Yellow: Toggle Favorite',
    noChannelsFound: 'No channels found in this category.',
    noFavoritesYet: 'No favorite channels added yet.\nPress Yellow button or Star icon to add channels to favorites.',
    newPlaylistLoaded: 'New playlist loaded:',
    online: 'Online',
    hardwareAccel: 'LG webOS GPU hardware acceleration enabled.',
    language: 'Language',
    loading: 'Loading...',
    sampleTitle: "Sample channels",
    samplePrompt: "Load sample public channel list for {country}?",
    sampleDesc: "The public list is downloaded from the open-source iptv-org project (github.com/iptv-org/iptv). KDR IPTV does not host, own or control these streams; some may be offline. You can remove it any time in Settings.",
    yes: "Yes",
    no: "No",
    sampleSettingsTitle: "Sample public channel list",
    sampleSettingsDesc: "Optional public list from iptv-org for {country}. Your own playlist added by phone always comes first.",
    sampleAdd: "Add sample list",
    sampleRemove: "Remove sample list",
    sampleStatusOn: "Enabled",
    sampleStatusOff: "Disabled",
    sampleUnavailable: "Sample list for your country is not available right now. Showing demo streams.",
    sampleHint: "OK: change   •   BACK: back to channels"
  },
  tr: {
    favorites: 'FAVORİLER',
    liveTv: 'CANLI TV',
    movies: 'FİLMLER',
    series: 'DİZİLER',
    settings: 'AYARLAR',
    search: 'ARAMA',
    searchPlaceholder: 'Kanal veya Kategori Ara...',
    categories: 'KATEGORİLER (A-Z)',
    allChannels: 'TÜM KANALLAR',
    allCategories: 'TÜM KATEGORİLER',
    totalChannels: 'Kanal',
    groups: 'Grup',
    playFullscreen: 'TAM EKRAN İZLE [OK]',
    liveBadge: 'CANLI AKIŞ',
    addToFavorites: 'Favorilere Ekle',
    removeFromFavorites: 'Favorilerden Çıkar',
    installedPlaylists: 'Yüklü IPTV Listeleriniz',
    selectPlaylist: 'Liste Seç',
    active: 'Aktif',
    select: 'Seç',
    pairPhone: 'Telefondan Liste Yükleme',
    pairPhoneDesc: 'Kişisel M3U listenizi veya Xtream bilgilerinizi kumandayla yazmak zorunda kalmadan, QR kodu okutarak saniyeler içinde ekleyin.',
    pairingCode: 'Bu Cihazın Eşleştirme Kodu:',
    scanQr: 'QR Kodu Telefonunuzla Taratın',
    orVisit: 'Veya tarayıcınızdan şu adrese gidin:',
    navHintDpad: '◀ ▶ Tuşları: Sütun Değiştir',
    navHintUpDown: '▲ ▼ Tuşları: Dikey Gezin',
    navHintOk: 'OK (Enter): Oynat',
    navHintBack: 'Geri / ESC: Sol Sütuna Dön / Çık',
    navHintYellow: 'Sarı Tuş: Favori Aç/Kapat',
    noChannelsFound: 'Bu kategoride kanal bulunamadı.',
    noFavoritesYet: 'Henüz favori kanal eklemediniz.\nKanalları seçip Sarı butona veya Yıldıza basarak favorilere ekleyebilirsiniz.',
    newPlaylistLoaded: 'Yeni liste yüklendi:',
    online: 'Çevrimiçi',
    hardwareAccel: 'LG webOS donanım hızlandırma ile doğrudan oynatılır.',
    language: 'Dil / Language',
    loading: 'Yükleniyor...',
    sampleTitle: "Örnek kanallar",
    samplePrompt: "{country} için örnek herkese açık kanal listesi yüklensin mi?",
    sampleDesc: "Liste, açık kaynaklı iptv-org projesinden (github.com/iptv-org/iptv) indirilir. KDR IPTV bu yayınları barındırmaz, sahibi değildir ve kontrol etmez; bazıları çalışmayabilir. İstediğiniz zaman Ayarlar'dan kaldırabilirsiniz.",
    yes: "Evet",
    no: "Hayır",
    sampleSettingsTitle: "Örnek herkese açık kanal listesi",
    sampleSettingsDesc: "{country} için iptv-org'dan isteğe bağlı açık liste. Telefondan eklediğiniz kendi listeniz her zaman önce gelir.",
    sampleAdd: "Örnek listeyi ekle",
    sampleRemove: "Örnek listeyi kaldır",
    sampleStatusOn: "Açık",
    sampleStatusOff: "Kapalı",
    sampleUnavailable: "Ülkeniz için örnek liste şu an alınamadı. Demo yayınlar gösteriliyor.",
    sampleHint: "OK: değiştir   •   GERİ: kanallara dön"
  },
  de: {
    favorites: 'FAVORITEN',
    liveTv: 'LIVE TV',
    movies: 'FILME',
    series: 'SERIEN',
    settings: 'EINSTELLUNGEN',
    search: 'SUCHE',
    searchPlaceholder: 'Kanal oder Kategorie suchen...',
    categories: 'KATEGORIEN (A-Z)',
    allChannels: 'ALLE KANÄLE',
    allCategories: 'ALLE KATEGORIEN',
    totalChannels: 'Kanäle',
    groups: 'Gruppen',
    playFullscreen: 'VOLLBILD ABSPIELEN [OK]',
    liveBadge: 'LIVE STREAM',
    addToFavorites: 'Zu Favoriten hinzufügen',
    removeFromFavorites: 'Aus Favoriten entfernen',
    installedPlaylists: 'Installierte IPTV-Wiedergabelisten',
    selectPlaylist: 'Wiedergabeliste auswählen',
    active: 'Aktiv',
    select: 'Wählen',
    pairPhone: 'Telefon koppeln / Web-Portal',
    pairPhoneDesc: 'Laden Sie M3U-Playlists bequem vom Telefon hoch, ohne lange URLs auf der TV-Fernbedienung einzugeben.',
    pairingCode: 'Geräte-Kopplungscode:',
    scanQr: 'QR-Code mit dem Telefon scannen',
    orVisit: 'Oder besuchen Sie das Portal unter',
    navHintDpad: '◀ ▶ Tasten: Spalten wechseln',
    navHintUpDown: '▲ ▼ Tasten: Vertikal scrollen',
    navHintOk: 'OK (Enter): Abspielen',
    navHintBack: 'Zurück / ESC: Verlassen',
    navHintYellow: 'Gelbe Taste: Favorit umschalten',
    noChannelsFound: 'Keine Kanäle in dieser Kategorie gefunden.',
    noFavoritesYet: 'Noch keine Favoriten hinzugefügt.',
    newPlaylistLoaded: 'Neue Wiedergabeliste geladen:',
    online: 'Online',
    hardwareAccel: 'LG webOS Hardware-Beschleunigung aktiv.',
    language: 'Sprache',
    loading: 'Wird geladen...',
    sampleTitle: "Beispielsender",
    samplePrompt: "Öffentliche Beispiel-Senderliste für {country} laden?",
    sampleDesc: "Die öffentliche Liste wird vom Open-Source-Projekt iptv-org (github.com/iptv-org/iptv) geladen. KDR IPTV hostet, besitzt oder kontrolliert diese Streams nicht; einige sind evtl. offline. Sie können sie jederzeit in den Einstellungen entfernen.",
    yes: "Ja",
    no: "Nein",
    sampleSettingsTitle: "Öffentliche Beispiel-Senderliste",
    sampleSettingsDesc: "Optionale öffentliche Liste von iptv-org für {country}. Ihre eigene, per Telefon hinzugefügte Liste hat immer Vorrang.",
    sampleAdd: "Beispielliste hinzufügen",
    sampleRemove: "Beispielliste entfernen",
    sampleStatusOn: "Aktiviert",
    sampleStatusOff: "Deaktiviert",
    sampleUnavailable: "Die Beispielliste für Ihr Land ist derzeit nicht verfügbar. Demo-Streams werden angezeigt.",
    sampleHint: "OK: ändern   •   ZURÜCK: zu den Sendern"
  },
  fr: {
    favorites: 'FAVORIS',
    liveTv: 'TV EN DIRECT',
    movies: 'FILMS',
    series: 'SÉRIES',
    settings: 'PARAMÈTRES',
    search: 'RECHERCHE',
    searchPlaceholder: 'Rechercher une chaîne ou catégorie...',
    categories: 'CATÉGORIES (A-Z)',
    allChannels: 'TOUTES LES CHAÎNES',
    allCategories: 'TOUTES LES CATÉGORIES',
    totalChannels: 'Chaînes',
    groups: 'Groupes',
    playFullscreen: 'LIRE EN PLEIN ÉCRAN [OK]',
    liveBadge: 'DIRECT',
    addToFavorites: 'Ajouter aux favoris',
    removeFromFavorites: 'Retirer des favoris',
    installedPlaylists: 'Listes IPTV installées',
    selectPlaylist: 'Choisir la liste',
    active: 'Actif',
    select: 'Choisir',
    pairPhone: 'Associer le téléphone',
    pairPhoneDesc: 'Téléchargez facilement vos listes M3U depuis votre téléphone sans saisir de longues URL.',
    pairingCode: 'Code d\'association:',
    scanQr: 'Scannez le code QR avec votre téléphone',
    orVisit: 'Ou visitez le portail à',
    navHintDpad: '◀ ▶ Touches: Changer de colonne',
    navHintUpDown: '▲ ▼ Touches: Défilement vertical',
    navHintOk: 'OK: Lire',
    navHintBack: 'Retour / ESC: Quitter',
    navHintYellow: 'Bouton Jaune: Favori',
    noChannelsFound: 'Aucune chaîne trouvée dans cette catégorie.',
    noFavoritesYet: 'Aucun favori pour le moment.',
    newPlaylistLoaded: 'Nouvelle liste chargée:',
    online: 'En ligne',
    hardwareAccel: 'Accélération matérielle LG webOS activée.',
    language: 'Langue',
    loading: 'Chargement...',
    sampleTitle: "Chaînes d'exemple",
    samplePrompt: "Charger la liste publique de chaînes d'exemple pour {country} ?",
    sampleDesc: "La liste publique est téléchargée depuis le projet open source iptv-org (github.com/iptv-org/iptv). KDR IPTV n'héberge, ne possède ni ne contrôle ces flux ; certains peuvent être hors ligne. Vous pouvez la supprimer à tout moment dans Paramètres.",
    yes: "Oui",
    no: "Non",
    sampleSettingsTitle: "Liste publique de chaînes d'exemple",
    sampleSettingsDesc: "Liste publique facultative d'iptv-org pour {country}. Votre propre liste ajoutée par téléphone passe toujours en premier.",
    sampleAdd: "Ajouter la liste d'exemple",
    sampleRemove: "Supprimer la liste d'exemple",
    sampleStatusOn: "Activée",
    sampleStatusOff: "Désactivée",
    sampleUnavailable: "La liste d'exemple pour votre pays n'est pas disponible pour le moment. Flux de démonstration affichés.",
    sampleHint: "OK : modifier   •   RETOUR : vers les chaînes"
  },
  it: {
    favorites: 'PREFERITI',
    liveTv: 'TV IN DIRETTA',
    movies: 'FILM',
    series: 'SERIE',
    settings: 'IMPOSTAZIONI',
    search: 'CERCA',
    searchPlaceholder: 'Cerca canale o categoria...',
    categories: 'CATEGORIE (A-Z)',
    allChannels: 'TUTTI I CANALI',
    allCategories: 'TUTTE LE CATEGORIE',
    totalChannels: 'Canali',
    groups: 'Gruppi',
    playFullscreen: 'RIPRODUCI A SCHERMO INTERO [OK]',
    liveBadge: 'DIRETTA',
    addToFavorites: 'Aggiungi ai preferiti',
    removeFromFavorites: 'Rimuovi dai preferiti',
    installedPlaylists: 'Playlist IPTV installate',
    selectPlaylist: 'Seleziona playlist',
    active: 'Attivo',
    select: 'Seleziona',
    pairPhone: 'Associa telefono',
    pairPhoneDesc: 'Carica facilmente le playlist M3U dal tuo telefono senza digitare lunghi URL sul telecomando.',
    pairingCode: 'Codice dispositivo:',
    scanQr: 'Scansiona il codice QR',
    orVisit: 'Oppure visita il portale su',
    navHintDpad: '◀ ▶ Tasti: Cambia colonna',
    navHintUpDown: '▲ ▼ Tasti: Scorri elenco',
    navHintOk: 'OK: Riproduci',
    navHintBack: 'Indietro / ESC: Esci',
    navHintYellow: 'Tasto Giallo: Preferito',
    noChannelsFound: 'Nessun canale trovato in questa categoria.',
    noFavoritesYet: 'Nessun canale preferito aggiunto.',
    newPlaylistLoaded: 'Nuova playlist caricata:',
    online: 'Online',
    hardwareAccel: 'Accelerazione hardware LG webOS attiva.',
    language: 'Lingua',
    loading: 'Caricamento...',
    sampleTitle: "Canali di esempio",
    samplePrompt: "Caricare l'elenco pubblico di canali di esempio per {country}?",
    sampleDesc: "L'elenco pubblico viene scaricato dal progetto open source iptv-org (github.com/iptv-org/iptv). KDR IPTV non ospita, possiede né controlla questi flussi; alcuni potrebbero essere offline. Puoi rimuoverlo in qualsiasi momento dalle Impostazioni.",
    yes: "Sì",
    no: "No",
    sampleSettingsTitle: "Elenco pubblico di canali di esempio",
    sampleSettingsDesc: "Elenco pubblico facoltativo di iptv-org per {country}. La tua playlist aggiunta dal telefono ha sempre la precedenza.",
    sampleAdd: "Aggiungi elenco di esempio",
    sampleRemove: "Rimuovi elenco di esempio",
    sampleStatusOn: "Attivo",
    sampleStatusOff: "Disattivo",
    sampleUnavailable: "L'elenco di esempio per il tuo paese non è disponibile ora. Vengono mostrati flussi demo.",
    sampleHint: "OK: cambia   •   INDIETRO: ai canali"
  },
  es: {
    favorites: 'FAVORITOS',
    liveTv: 'TV EN VIVO',
    movies: 'PELÍCULAS',
    series: 'SERIES',
    settings: 'AJUSTES',
    search: 'BUSCAR',
    searchPlaceholder: 'Buscar canal o categoría...',
    categories: 'CATEGORÍAS (A-Z)',
    allChannels: 'TODOS LOS CANALES',
    allCategories: 'TODAS LAS CATEGORÍAS',
    totalChannels: 'Canales',
    groups: 'Grupos',
    playFullscreen: 'PANTALLA COMPLETA [OK]',
    liveBadge: 'EN VIVO',
    addToFavorites: 'Añadir a favoritos',
    removeFromFavorites: 'Quitar de favoritos',
    installedPlaylists: 'Listas IPTV instaladas',
    selectPlaylist: 'Seleccionar lista',
    active: 'Activo',
    select: 'Elegir',
    pairPhone: 'Vincular teléfono',
    pairPhoneDesc: 'Carga fácilmente tus listas M3U desde tu teléfono sin escribir largas direcciones en la tele.',
    pairingCode: 'Código de emparejamiento:',
    scanQr: 'Escanea el código QR',
    orVisit: 'O visita el portal en',
    navHintDpad: '◀ ▶ Teclas: Cambiar columnas',
    navHintUpDown: '▲ ▼ Teclas: Desplazarse',
    navHintOk: 'OK: Reproducir',
    navHintBack: 'Atrás / ESC: Salir',
    navHintYellow: 'Botón Amarillo: Favorito',
    noChannelsFound: 'No se encontraron canales en esta categoría.',
    noFavoritesYet: 'No hay favoritos agregados aún.',
    newPlaylistLoaded: 'Nueva lista cargada:',
    online: 'En línea',
    hardwareAccel: 'Aceleración por hardware LG webOS activada.',
    language: 'Idioma',
    loading: 'Cargando...',
    sampleTitle: "Canales de ejemplo",
    samplePrompt: "¿Cargar la lista pública de canales de ejemplo para {country}?",
    sampleDesc: "La lista pública se descarga del proyecto de código abierto iptv-org (github.com/iptv-org/iptv). KDR IPTV no aloja, posee ni controla estas emisiones; algunas pueden no funcionar. Puedes quitarla en cualquier momento en Ajustes.",
    yes: "Sí",
    no: "No",
    sampleSettingsTitle: "Lista pública de canales de ejemplo",
    sampleSettingsDesc: "Lista pública opcional de iptv-org para {country}. Tu propia lista añadida desde el teléfono siempre tiene prioridad.",
    sampleAdd: "Añadir lista de ejemplo",
    sampleRemove: "Quitar lista de ejemplo",
    sampleStatusOn: "Activada",
    sampleStatusOff: "Desactivada",
    sampleUnavailable: "La lista de ejemplo para tu país no está disponible ahora. Se muestran emisiones de demostración.",
    sampleHint: "OK: cambiar   •   ATRÁS: a los canales"
  },
  ru: {
    favorites: 'ИЗБРАННОЕ',
    liveTv: 'ПРЯМОЙ ЭФИР',
    movies: 'ФИЛЬМЫ',
    series: 'СЕРИАЛЫ',
    settings: 'НАСТРОЙКИ',
    search: 'ПОИСК',
    searchPlaceholder: 'Поиск канала или категории...',
    categories: 'КАТЕГОРИИ (A-Z)',
    allChannels: 'ВСЕ КАНАЛЫ',
    allCategories: 'ВСЕ КАТЕГОРИИ',
    totalChannels: 'Каналов',
    groups: 'Групп',
    playFullscreen: 'СМОТРЕТЬ [OK]',
    liveBadge: 'ПРЯМОЙ ЭФИР',
    addToFavorites: 'В избранное',
    removeFromFavorites: 'Удалить из избранного',
    installedPlaylists: 'Установленные плейлисты',
    selectPlaylist: 'Выбрать плейлист',
    active: 'Активен',
    select: 'Выбрать',
    pairPhone: 'Связать телефон',
    pairPhoneDesc: 'Загружайте плейлисты M3U с телефона без ввода длинных ссылок с пульта ТВ.',
    pairingCode: 'Код подключения:',
    scanQr: 'Отсканируйте QR-код',
    orVisit: 'Или перейдите на',
    navHintDpad: '◀ ▶ Стрелки: Колонки',
    navHintUpDown: '▲ ▼ Стрелки: Список',
    navHintOk: 'OK: Воспроизведение',
    navHintBack: 'Назад / ESC: Выход',
    navHintYellow: 'Желтая кнопка: Избранное',
    noChannelsFound: 'В этой категории каналы не найдены.',
    noFavoritesYet: 'Избранные каналы еще не добавлены.',
    newPlaylistLoaded: 'Загружен новый плейлист:',
    online: 'В сети',
    hardwareAccel: 'Аппаратное ускорение LG webOS активно.',
    language: 'Язык',
    loading: 'Загрузка...',
    sampleTitle: "Примеры каналов",
    samplePrompt: "Загрузить публичный список примеров каналов для {country}?",
    sampleDesc: "Публичный список загружается из проекта с открытым исходным кодом iptv-org (github.com/iptv-org/iptv). KDR IPTV не размещает, не владеет и не контролирует эти трансляции; некоторые могут не работать. Его можно удалить в любое время в Настройках.",
    yes: "Да",
    no: "Нет",
    sampleSettingsTitle: "Публичный список примеров каналов",
    sampleSettingsDesc: "Необязательный публичный список iptv-org для {country}. Ваш собственный список, добавленный с телефона, всегда имеет приоритет.",
    sampleAdd: "Добавить список примеров",
    sampleRemove: "Удалить список примеров",
    sampleStatusOn: "Включено",
    sampleStatusOff: "Выключено",
    sampleUnavailable: "Список примеров для вашей страны сейчас недоступен. Показаны демо-трансляции.",
    sampleHint: "OK: изменить   •   НАЗАД: к каналам"
  },
  ar: {
    favorites: 'المفضلة',
    liveTv: 'بث مباشر',
    movies: 'أفلام',
    series: 'مسلسلات',
    settings: 'الإعدادات',
    search: 'بحث',
    searchPlaceholder: 'بحث عن قناة أو تصنيف...',
    categories: 'التصنيفات (أ - ي)',
    allChannels: 'جميع القنوات',
    allCategories: 'جميع التصنيفات',
    totalChannels: 'قناة',
    groups: 'مجموعات',
    playFullscreen: 'تشغيل في شاشة كاملة [OK]',
    liveBadge: 'مباشر',
    addToFavorites: 'إضافة إلى المفضلة',
    removeFromFavorites: 'إزالة من المفضلة',
    installedPlaylists: 'قوائم IPTV المثبتة',
    selectPlaylist: 'اختر قائمة',
    active: 'نشط',
    select: 'اختيار',
    pairPhone: 'ربط الهاتف / بوابة الويب',
    pairPhoneDesc: 'قم برفع قوائم M3U بسهولة من هاتفك دون كتابة روابط طويلة عبر جهاز التحكم.',
    pairingCode: 'رمز اقتران الجهاز:',
    scanQr: 'امسح رمز QR بالهاتف',
    orVisit: 'أو قم بزيارة البوابة عبر',
    navHintDpad: '◀ ▶ الأزرار: التبديل بين الأعمدة',
    navHintUpDown: '▲ ▼ الأزرار: التمرير',
    navHintOk: 'OK: تشغيل',
    navHintBack: 'رجوع / ESC: خروج',
    navHintYellow: 'الزر الأصفر: تبديل المفضلة',
    noChannelsFound: 'لم يتم العثور على قنوات في هذا التصنيف.',
    noFavoritesYet: 'لم تتم إضافة أي قنوات مفضلة بعد.',
    newPlaylistLoaded: 'تم تحميل قائمة جديدة:',
    online: 'متصل',
    hardwareAccel: 'تسريع الأجهزة مدعوم على LG webOS.',
    language: 'اللغة',
    loading: 'جاري التحميل...',
    sampleTitle: "قنوات تجريبية",
    samplePrompt: "هل تريد تحميل قائمة القنوات العامة التجريبية لـ {country}؟",
    sampleDesc: "يتم تنزيل القائمة العامة من مشروع iptv-org مفتوح المصدر (github.com/iptv-org/iptv). لا يستضيف KDR IPTV هذه البثوث ولا يملكها ولا يتحكم بها؛ وقد لا يعمل بعضها. يمكنك إزالتها في أي وقت من الإعدادات.",
    yes: "نعم",
    no: "لا",
    sampleSettingsTitle: "قائمة القنوات العامة التجريبية",
    sampleSettingsDesc: "قائمة عامة اختيارية من iptv-org لـ {country}. قائمتك الخاصة المضافة من الهاتف لها الأولوية دائمًا.",
    sampleAdd: "إضافة القائمة التجريبية",
    sampleRemove: "إزالة القائمة التجريبية",
    sampleStatusOn: "مفعّلة",
    sampleStatusOff: "معطّلة",
    sampleUnavailable: "القائمة التجريبية لبلدك غير متاحة حاليًا. يتم عرض بثوث تجريبية.",
    sampleHint: "OK: تغيير   •   رجوع: إلى القنوات"
  }
};

/**
 * TV dilini (webOS / Tarayıcı) tespit eder.
 * Desteklenen diller: en, tr, de, fr, it, es, ru, ar
 * Varsayılan: TV dili destekleniyorsa o dil, desteklenmiyorsa 'en' (İngilizce).
 */
export function detectSystemLanguage(): SupportedLanguage {
  // Önce kullanıcının kendi seçip kaydettiği dil var mı bak
  const savedLang = localStorage.getItem('kdr_tv_lang') as SupportedLanguage;
  if (savedLang && TRANSLATIONS[savedLang]) {
    return savedLang;
  }

  // TV / Tarayıcı sistem dili kontrolü
  const navLang = (navigator.language || (navigator as { userLanguage?: string }).userLanguage || '').toLowerCase();
  
  if (navLang.startsWith('tr')) return 'tr';
  if (navLang.startsWith('de')) return 'de';
  if (navLang.startsWith('fr')) return 'fr';
  if (navLang.startsWith('it')) return 'it';
  if (navLang.startsWith('es')) return 'es';
  if (navLang.startsWith('ru')) return 'ru';
  if (navLang.startsWith('ar')) return 'ar';

  // Varsayılan İngilizce
  return 'en';
}
