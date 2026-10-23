import { spawn } from 'node:child_process';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const wrangler = fileURLToPath(
  new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url),
);
const state = await mkdtemp(join(tmpdir(), 'photosnap-integration-'));
const origin = 'http://127.0.0.1:8791';
let server;
let serverLog = '';
let passed = 0;
const checks = [];
const run = (args) =>
  new Promise((resolve, reject) => {
    const processHandle = spawn(process.execPath, [wrangler, ...args], {
      env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    let errorOutput = '';
    processHandle.stdout.on('data', (data) => {
      output += data;
    });
    processHandle.stderr.on('data', (data) => {
      errorOutput += data;
    });
    processHandle.once('error', reject);
    processHandle.once('exit', (code) =>
      code === 0 ? resolve(output) : reject(new Error(output + errorOutput)),
    );
  });
const check = (condition, name) => {
  assert.ok(condition, name);
  passed++;
  checks.push(name);
  console.log(`PASS ${name}`);
};
async function post(body, headers = {}) {
  return fetch(`${origin}/api/invites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, ...headers },
    body: JSON.stringify(body),
  });
}
try {
  await run([
    'd1',
    'migrations',
    'apply',
    'photosnap-production',
    '--local',
    '--persist-to',
    state,
  ]);
  server = spawn(
    process.execPath,
    [
      wrangler,
      'dev',
      '--port',
      '8791',
      '--ip',
      '127.0.0.1',
      '--inspector-port',
      '0',
      '--persist-to',
      state,
      '--test-scheduled',
    ],
    { env: { ...process.env, WRANGLER_SEND_METRICS: 'false' }, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  server.stdout.on('data', (data) => {
    serverLog += data;
  });
  server.stderr.on('data', (data) => {
    serverLog += data;
  });
  let healthy = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      healthy = (await fetch(`${origin}/api/health`)).ok;
    } catch {
      /* Server is still starting. */
    }
    if (healthy) break;
    if (server.exitCode !== null) throw new Error(serverLog);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  check(healthy, 'Worker and real local D1 start successfully');
  const valid = {
    name: "Jamie'); DROP TABLE invites; --",
    email: 'QA-INTEGRATION@example.invalid',
    plan: 'pro',
    billing: 'yearly',
    consent: true,
    website: '',
  };
  check(
    (await post(valid, { Origin: 'https://attacker.invalid' })).status === 403,
    'Cross-origin submission rejected',
  );
  check(
    (await post(valid, { 'Content-Type': 'text/plain' })).status === 415,
    'Wrong content type rejected',
  );
  check((await post({ ...valid, consent: false })).status === 422, 'Missing consent rejected');
  check((await post({ ...valid, email: 'bad' })).status === 422, 'Invalid email rejected');
  check((await post({ ...valid, admin: true })).status === 422, 'Unexpected fields rejected');
  check((await post({ ...valid, website: 'bot' })).status === 422, 'Honeypot rejected');
  check(
    (await post({ ...valid, name: 'x'.repeat(3000) })).status === 413,
    'Oversized body rejected',
  );
  const malformed = await fetch(`${origin}/api/invites`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: '{bad',
  });
  check(malformed.status === 400, 'Malformed JSON rejected');
  const saved = await post(valid);
  check(saved.status === 201, 'Valid invitation stored');
  check(saved.headers.get('Cache-Control') === 'no-store', 'Personal-data response is not cached');
  check(
    saved.headers.get('Content-Security-Policy').includes("frame-ancestors 'none'"),
    'Security headers applied',
  );
  check(
    (await post({ ...valid, email: valid.email.toLowerCase() })).status === 201,
    'Duplicate email receives same safe response',
  );
  await post(valid);
  await post(valid);
  await post(valid);
  const limited = await post(valid);
  check(
    limited.status === 429 && Number(limited.headers.get('Retry-After')) > 0,
    'Sixth valid request rate-limited',
  );
  check((await fetch(`${origin}/api/invites`)).status === 405, 'Wrong API method rejected');
  check(
    (await fetch(`${origin}/api/unknown`)).status === 404,
    'Unknown API never falls back to HTML',
  );
  const home = await fetch(origin);
  const homeHtml = await home.text();
  check(
    home.ok &&
      /<div id="root">[\s\S]*<h1/.test(homeHtml) &&
      homeHtml.includes('Photosnap is a platform'),
    'Production HTML is served without executing React',
  );
  const missing = await fetch(`${origin}/not-a-real-route`, { headers: { Accept: 'text/html' } });
  check(
    missing.status === 404 && (await missing.text()).includes('Outside the frame'),
    'Unknown route serves the real 404 page',
  );
  const rows = await run([
    'd1',
    'execute',
    'photosnap-production',
    '--local',
    '--persist-to',
    state,
    '--command',
    'SELECT count(*) AS total, min(email) AS email, min(name) AS name FROM invites',
    '--json',
  ]);
  const dbResult = JSON.parse(rows.slice(rows.indexOf('[')))[0].results[0];
  check(
    dbResult.total === 1 && dbResult.email === valid.email.toLowerCase(),
    'Actual SQLite enforces normalized email uniqueness',
  );
  check(dbResult.name === valid.name, 'SQL injection payload remains inert text');
  await run([
    'd1',
    'execute',
    'photosnap-production',
    '--local',
    '--persist-to',
    state,
    '--command',
    'UPDATE invites SET created_at = unixepoch() - 91*86400; UPDATE rate_limits SET window_start = unixepoch() - 2*86400;',
  ]);
  const scheduled = await fetch(`${origin}/cdn-cgi/handler/scheduled`);
  check(scheduled.ok, 'Retention scheduled handler executes');
  const retained = await run([
    'd1',
    'execute',
    'photosnap-production',
    '--local',
    '--persist-to',
    state,
    '--command',
    'SELECT (SELECT count(*) FROM invites) AS invites, (SELECT count(*) FROM rate_limits) AS rates',
    '--json',
  ]);
  const cleanup = JSON.parse(retained.slice(retained.indexOf('[')))[0].results[0];
  check(
    cleanup.invites === 0 && cleanup.rates === 0,
    'Expired personal data and rate records are removed',
  );
  console.log(`\n${passed} integration checks passed using workerd and local D1.`);
  // Read the schema to also fail if the migration was accidentally omitted from the checkout.
  assert.ok((await readFile('migrations/0001_invites.sql', 'utf8')).includes('COLLATE NOCASE'));
} catch (error) {
  console.error(error);
  console.error(serverLog.slice(-4000));
  process.exitCode = 1;
} finally {
  if (server && server.exitCode === null)
    await new Promise((resolve) => {
      server.once('exit', resolve);
      server.kill('SIGTERM');
    });
  await rm(state, { recursive: true, force: true });
}
