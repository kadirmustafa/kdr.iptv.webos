import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const appinfoPath = path.join(rootDir, 'appinfo.json');
const publicAppinfoPath = path.join(rootDir, 'public', 'appinfo.json');
const packageJsonPath = path.join(rootDir, 'package.json');

// 1. Mevcut sürümü oku
const appinfo = JSON.parse(fs.readFileSync(appinfoPath, 'utf8'));
const currentVersion = appinfo.version || '1.0.0';

// 2. Patch sürümünü 1 artır (örn: 1.0.0 -> 1.0.1)
const parts = currentVersion.split('.').map(n => parseInt(n, 10) || 0);
while (parts.length < 3) parts.push(0);
parts[2] += 1;
const newVersion = parts.join('.');

console.log(`\n🚀 [webOS Release] Sürüm güncelleniyor: v${currentVersion} -> v${newVersion}`);

// 3. appinfo.json dosyalarını güncelle
appinfo.version = newVersion;
fs.writeFileSync(appinfoPath, JSON.stringify(appinfo, null, 2) + '\n');
fs.writeFileSync(publicAppinfoPath, JSON.stringify(appinfo, null, 2) + '\n');

// 4. package.json sürümünü güncelle
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
pkg.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');

// 5. App.tsx arayüz sürüm ibaresini güncelle
const appTsxPath = path.join(rootDir, 'src', 'App.tsx');
if (fs.existsSync(appTsxPath)) {
  let appTsx = fs.readFileSync(appTsxPath, 'utf8');
  appTsx = appTsx.replace(/v\d+\.\d+\.\d+\s*•\s*LG webOS/g, `v${newVersion} • LG webOS`);
  fs.writeFileSync(appTsxPath, appTsx);
}

// 6. Projeyi derle
console.log('📦 Proje derleniyor (vite build)...');
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

// 7. IPK paketini oluştur
console.log(`📦 webOS IPK paketi oluşturuluyor (com.kdr.iptv_${newVersion}_all.ipk)...`);
execSync('ares-package dist', { cwd: rootDir, stdio: 'inherit' });

console.log(`\n🎉 BAŞARILI! Yeni IPK oluşturuldu: com.kdr.iptv_${newVersion}_all.ipk\n`);
