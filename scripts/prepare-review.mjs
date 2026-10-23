import { copyFile, rm } from 'node:fs/promises';
if (process.argv.includes('--clean')) {
  await rm('public/__qa.html', { force: true });
  await rm('public/__axe.js', { force: true });
} else {
  await copyFile('scripts/browser-review.html', 'public/__qa.html');
  await copyFile('node_modules/axe-core/axe.min.js', 'public/__axe.js');
  console.log('Run npm run dev, then open http://localhost:4173/__qa.html');
}
