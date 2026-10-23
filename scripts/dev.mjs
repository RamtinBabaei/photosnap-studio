import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
const wrangler = fileURLToPath(
  new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url),
);
const vite = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
const children = [];
const launch = (entry, args) => {
  const child = spawn(process.execPath, [entry, ...args], {
    stdio: 'inherit',
    env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
  });
  children.push(child);
  return child;
};
const migrate = launch(wrangler, ['d1', 'migrations', 'apply', 'photosnap-production', '--local']);
const code = await new Promise((resolve) => migrate.once('exit', resolve));
if (code !== 0) process.exit(1);
launch(wrangler, ['dev', '--port', '8787', '--ip', '127.0.0.1', '--inspector-port', '0']);
launch(vite, ['--host', '0.0.0.0', '--port', '4173', ...process.argv.slice(2)]);
const stop = () => {
  for (const child of children) child.kill('SIGTERM');
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
for (const child of children.slice(1))
  child.once('exit', (status) => {
    stop();
    process.exitCode = status ?? 1;
  });
