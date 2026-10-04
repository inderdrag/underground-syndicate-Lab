import fs from 'fs';
import path from 'path';

console.log('Copying single-file HTML standalone game to root repository directory...');

const distDir = path.resolve('dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found! Run vite build first.');
  process.exit(1);
}

const targetFiles = [
  'Play-Game-Offline.html',
  'Underground-Syndicate-Launcher.html',
  'Underground-Syndicate-Game.html',
];

targetFiles.forEach((file) => {
  const destPath = path.resolve(file);
  fs.copyFileSync(indexPath, destPath);
  const sizeMb = (fs.statSync(destPath).size / 1024 / 1024).toFixed(2);
  console.log(` ✅ Generated standalone game file: ${file} (${sizeMb} MB)`);
});

console.log('\n🎉 All single-file game files are fully updated and ready to play offline!');
