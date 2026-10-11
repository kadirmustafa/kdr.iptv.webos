const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Multi-playlist storage:
const playlistsStore = {};

// Varsayılan GitHub TR Playlist'i
const DEFAULT_GITHUB_PLAYLIST = {
  id: 'gh_tr',
  name: 'Varsayılan TR Yayınları (GitHub)',
  channels: [
    { id: 'gh_1', name: 'TRT 1 HD', category: 'TR ☪️ ULUSAL', logo: 'https://i.ibb.co/rnG6H83/trt1.png', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    { id: 'gh_2', name: 'TRT Spor HD', category: 'TR ☪️ SPOR', logo: 'https://i.imgur.com/ZhkZzLf.png', streamUrl: 'https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/aspor/aspor.m3u8' },
    { id: 'gh_3', name: '24 TV HD', category: 'TR ☪️ HABER', logo: 'https://i.imgur.com/8FO41es.png', streamUrl: 'https://turkmedya-live.ercdn.net/tv24/tv24.m3u8' },
    { id: 'gh_4', name: 'National Geographic HD', category: 'TR ☪️ BELGESEL', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    { id: 'gh_5', name: 'A Haber HD', category: 'TR ☪️ HABER', logo: '', streamUrl: 'https://turkmedya-live.ercdn.net/tv24/tv24.m3u8' }
  ],
  active: true,
  createdAt: 1000
};

function ensureDevicePlaylists(code) {
  if (!playlistsStore[code] || playlistsStore[code].length === 0) {
    playlistsStore[code] = [{ ...DEFAULT_GITHUB_PLAYLIST }];
  }
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // Health check
  if (parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // POST /api/save-playlist { code: "LG-KDR7", name: "...", channels: [...] }
  if (parsedUrl.pathname === '/api/save-playlist' && req.method === 'POST') {
    const chunks = [];
    req.on('data', chunk => { chunks.push(chunk); });
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf8');
        const payload = JSON.parse(body);
        const code = (payload.code || 'LG-KDR7').toUpperCase().trim();
        const playlistName = (payload.name || `IPTV Liste #${Date.now().toString().slice(-4)}`).replace(/[\uFFFD\uFEFF]/g, '').trim();

        ensureDevicePlaylists(code);

        // Yeni eklenen listeyi aktif yap, öncekileri pasife al
        playlistsStore[code].forEach(p => { p.active = false; });

        // Karakter bozulmalarını (U+FFFD ve fazlalık boşluklar) temizle
        const sanitizedChannels = (payload.channels || []).map(ch => ({
          ...ch,
          name: ch.name ? ch.name.replace(/[\uFFFD\uFEFF]/g, '').replace(/\s+/g, ' ').trim() : '',
          category: ch.category ? ch.category.replace(/[\uFFFD\uFEFF]/g, '').replace(/\s+/g, ' ').trim() : 'Genel'
        }));

        const newPlaylist = {
          id: 'pl_' + Date.now(),
          name: playlistName,
          channels: sanitizedChannels,
          active: true,
          updatedAt: Date.now()
        };

        playlistsStore[code].push(newPlaylist);

        console.log(`[Storage] Saved playlist '${playlistName}' with ${newPlaylist.channels.length} channels for code: ${code}. Total playlists: ${playlistsStore[code].length}`);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ 
          ok: true, 
          playlistId: newPlaylist.id, 
          totalPlaylists: playlistsStore[code].length, 
          channelsCount: newPlaylist.channels.length 
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // GET /api/get-playlists?code=LG-KDR7 (Birden fazla listeyi döner)
  if (parsedUrl.pathname === '/api/get-playlists' && req.method === 'GET') {
    const code = (parsedUrl.query.code || 'LG-KDR7').toUpperCase().trim();
    ensureDevicePlaylists(code);
    const lists = playlistsStore[code] || [];
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, playlists: lists }));
    return;
  }

  // POST /api/switch-playlist { code: "LG-KDR7", playlistId: "pl_123" }
  if (parsedUrl.pathname === '/api/switch-playlist' && req.method === 'POST') {
    req.setEncoding('utf8');
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const code = (payload.code || 'LG-KDR7').toUpperCase().trim();
        const plId = payload.playlistId;

        ensureDevicePlaylists(code);
        if (playlistsStore[code]) {
          playlistsStore[code].forEach(p => {
            p.active = (p.id === plId);
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // GET /api/get-playlist?code=LG-KDR7 (Aktif listeyi ve tüm liste özetini döner)
  if (parsedUrl.pathname === '/api/get-playlist' && req.method === 'GET') {
    const code = (parsedUrl.query.code || 'LG-KDR7').toUpperCase().trim();
    ensureDevicePlaylists(code);
    const lists = playlistsStore[code] || [];
    const activePl = lists.find(p => p.active) || lists[0];

    if (activePl) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        ok: true,
        ...activePl,
        allPlaylists: lists.map(p => ({
          id: p.id,
          name: p.name,
          count: p.channels.length,
          active: p.active
        }))
      }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Playlist not found for code ' + code }));
    }
    return;
  }

  // /api/fetch?url=...
  if (parsedUrl.pathname === '/api/fetch') {
    const targetUrl = parsedUrl.query.url;
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing url parameter' }));
      return;
    }

    try {
      const parsedTarget = new URL(targetUrl);
      const client = parsedTarget.protocol === 'https:' ? https : http;

      const proxyReq = client.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 30000
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, {
          'Content-Type': proxyRes.headers['content-type'] || 'text/plain; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to fetch target URL: ' + err.message }));
      });

      proxyReq.on('timeout', () => {
        proxyReq.destroy();
        res.writeHead(504, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Gateway timeout' }));
      });

    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid URL: ' + e.message }));
    }
    return;
  }

  // Serve privacy.html & Help
  if (parsedUrl.pathname === '/privacy' || parsedUrl.pathname === '/privacy.html' || parsedUrl.pathname === '/help') {
    const filePath = path.join(__dirname, 'privacy.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading privacy.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // Serve index.html
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`IPTV Multi-Playlist Proxy service listening on port ${PORT}`);
});
