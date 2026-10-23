import { inviteSchema } from '../shared/invite';

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

function json(value: unknown, status = 200, extra: Record<string, string> = {}) {
  return Response.json(value, {
    status,
    headers: { ...securityHeaders, 'Cache-Control': 'no-store', ...extra },
  });
}

async function readBody(request: Request, maxBytes: number) {
  if (Number(request.headers.get('Content-Length')) > maxBytes)
    throw new RangeError('Body too large');
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RangeError('Body too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

async function acceptInvite(request: Request, env: Env, url: URL) {
  if (request.headers.get('Origin') !== url.origin)
    return json({ message: 'This request must come from this website.' }, 403);
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json'))
    return json({ message: 'Please send a JSON request.' }, 415);
  let input: unknown;
  try {
    input = JSON.parse(await readBody(request, 2048));
  } catch (error) {
    return json(
      {
        message:
          error instanceof RangeError
            ? 'Your request is too large.'
            : 'Your request could not be read.',
      },
      error instanceof RangeError ? 413 : 400,
    );
  }
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success)
    return json(
      {
        message: 'Please check your name, email address and consent.',
        fields: parsed.error.flatten().fieldErrors,
      },
      422,
    );

  const now = Math.floor(Date.now() / 1000);
  const ip = request.headers.get('CF-Connecting-IP') ?? 'local-development';
  const dailyKey = `${new Date().toISOString().slice(0, 10)}:${ip}`;
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(dailyKey));
  const key = Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
  const counter = await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, hits) VALUES (?, ?, 1)
    ON CONFLICT(key) DO UPDATE SET
      hits = CASE WHEN window_start < ? THEN 1 ELSE hits + 1 END,
      window_start = CASE WHEN window_start < ? THEN excluded.window_start ELSE window_start END
    RETURNING hits, window_start`,
  )
    .bind(key, now, now - 900, now - 900)
    .first<{ hits: number; window_start: number }>();
  if (!counter || counter.hits > 5)
    return json({ message: 'Too many requests. Please try again in a few minutes.' }, 429, {
      'Retry-After': String(Math.max(1, (counter?.window_start ?? now) + 900 - now)),
    });
  const { name, email, plan, billing } = parsed.data;
  await env.DB.prepare(
    'INSERT INTO invites (id, name, email, plan, billing, consent_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(email) DO NOTHING',
  )
    .bind(crypto.randomUUID(), name, email, plan, billing, now, now)
    .run();
  // A uniform response avoids revealing whether another visitor's email is on the list.
  return json({ message: 'Your invitation request has been saved.' }, 201);
}

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  try {
    if (url.pathname === '/api/health') {
      if (request.method !== 'GET')
        return json({ message: 'Method not allowed.' }, 405, { Allow: 'GET' });
      await env.DB.prepare('SELECT 1 AS healthy').first();
      return json({ status: 'ok' });
    }
    if (url.pathname === '/api/invites') {
      if (request.method !== 'POST')
        return json({ message: 'Method not allowed.' }, 405, { Allow: 'POST' });
      return await acceptInvite(request, env, url);
    }
    if (url.pathname.startsWith('/api/')) return json({ message: 'Endpoint not found.' }, 404);
    if (!['GET', 'HEAD'].includes(request.method))
      return json({ message: 'Method not allowed.' }, 405, { Allow: 'GET, HEAD' });
    const result = await env.ASSETS.fetch(request);
    if (result.status === 404 && request.headers.get('Accept')?.includes('text/html')) {
      const fallback = await env.ASSETS.fetch(new Request(new URL('/404', url), request));
      return new Response(fallback.body, {
        status: 404,
        headers: { ...Object.fromEntries(fallback.headers), ...securityHeaders },
      });
    }
    const response = new Response(result.body, result);
    for (const [name, value] of Object.entries(securityHeaders)) response.headers.set(name, value);
    return response;
  } catch {
    // Never log contact details or database errors into public responses.
    return json({ message: 'We couldn’t complete your request. Please try again shortly.' }, 503);
  }
}

export async function cleanExpiredData(env: Env) {
  const now = Math.floor(Date.now() / 1000);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM invites WHERE created_at < ?').bind(now - 90 * 86400),
    env.DB.prepare('DELETE FROM rate_limits WHERE window_start < ?').bind(now - 86400),
  ]);
}

export default {
  fetch: handleRequest,
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(cleanExpiredData(env));
  },
} satisfies ExportedHandler<Env>;
