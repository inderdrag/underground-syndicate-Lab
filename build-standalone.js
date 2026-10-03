import fs from 'fs';
import path from 'path';

console.log('Copying single-file HTML launcher to root repository directory...');

const distDir = path.resolve('dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found! Run npm run build first.');
  process.exit(1);
}

const launcherPath = path.resolve('Underground-Syndicate-Launcher.html');
const offlinePath = path.resolve('Play-Game-Offline.html');

fs.copyFileSync(indexPath, launcherPath);
fs.copyFileSync(indexPath, offlinePath);

console.log(`\n🎉 Single-file HTML Launchers updated successfully:`);
console.log(` - ${launcherPath} (${(fs.statSync(launcherPath).size / 1024 / 1024).toFixed(2)} MB)`);
console.log(` - ${offlinePath} (${(fs.statSync(offlinePath).size / 1024 / 1024).toFixed(2)} MB)`);
