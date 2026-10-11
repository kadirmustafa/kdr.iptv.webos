import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST_DIR = path.resolve('dist');
const OUTPUT_DIR = path.resolve('store-assets', 'webos');
const PORT = 8999;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function createStaticServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || !reqPath) reqPath = '/index.html';
    
    let filePath = path.join(DIST_DIR, reqPath);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } catch (err) {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
}

function saveImage(filename, buffer) {
  const targetPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(targetPath, buffer);
  console.log('   Saved:', targetPath, `(${Math.round(buffer.length / 1024)} KB)`);
}

async function main() {
  console.log('🌐 Starting local static server on port ' + PORT + '...');
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));

  console.log('🚀 Launching Chrome at 1920x1080...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--window-size=1920,1080',
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // 1. Dashboard Screenshot
  console.log('🌐 Opening Application...');
  await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2500));

  console.log('📸 1. Capturing Dashboard...');
  const dashJpg = await page.screenshot({ type: 'jpeg', quality: 95 });
  const dashPng = await page.screenshot({ type: 'png' });
  saveImage('screenshot_1_dashboard_1920x1080.jpg', dashJpg);
  saveImage('screenshot_1_dashboard_1920x1080.png', dashPng);

  // 2. Playlist Modal Screenshot
  console.log('📸 2. Opening Playlist / Cloud Pairing Modal...');
  const openedModal = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && (b.textContent.includes('Liste') || b.textContent.includes('Playlist')));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  if (openedModal) {
    await new Promise(r => setTimeout(r, 1200));
    console.log('   Capturing Playlist Manager Modal...');
    const playJpg = await page.screenshot({ type: 'jpeg', quality: 95 });
    const playPng = await page.screenshot({ type: 'png' });
    saveImage('screenshot_3_playlist_manager_1920x1080.jpg', playJpg);
    saveImage('screenshot_3_playlist_manager_1920x1080.png', playPng);

    // Close modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.fixed button');
      if (closeBtn) closeBtn.click();
    });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 800));
  }

  // 3. TV Player Screenshot
  console.log('📸 3. Opening Fullscreen TV Player...');
  await page.evaluate(() => {
    // Find channel list container and click first item
    const channelItems = document.querySelectorAll('.col-span-4 [data-channel-card], .col-span-4 .cursor-pointer');
    if (channelItems.length > 0) {
      channelItems[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return;
    }
    // Fallback: any cursor-pointer in channel list
    const items = Array.from(document.querySelectorAll('div.cursor-pointer'));
    for (const it of items) {
      if (it.textContent && (it.textContent.includes('TRT') || it.textContent.includes('Kanal') || it.textContent.includes('Haber'))) {
        it.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return;
      }
    }
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 3000));

  // Trigger OSD visibility
  await page.mouse.move(960, 540);
  await new Promise(r => setTimeout(r, 600));

  console.log('   Capturing TV Player Screen...');
  const playerJpg = await page.screenshot({ type: 'jpeg', quality: 95 });
  const playerPng = await page.screenshot({ type: 'png' });
  saveImage('screenshot_2_player_1920x1080.jpg', playerJpg);
  saveImage('screenshot_2_player_1920x1080.png', playerPng);

  await browser.close();
  server.close();
  console.log('✨ All 1920x1080 screenshots saved and updated successfully!');
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
