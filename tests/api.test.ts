// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { handleRequest, cleanExpiredData, type Env } from '../worker/index';
import { inviteSchema } from '../shared/invite';

const valid = {
  name: 'Jamie Parker',
  email: 'JAMIE@example.com',
  plan: 'pro',
  billing: 'yearly',
  consent: true,
  website: '',
};
function makeEnv(hits = 1) {
  const statements: { sql: string; args: unknown[] }[] = [];
  const run = vi.fn().mockResolvedValue({ success: true });
  const prepare = vi.fn((sql: string) => {
    const entry = { sql, args: [] as unknown[] };
    statements.push(entry);
    const statement = {
      bind: (...args: unknown[]) => {
        entry.args = args;
        return statement;
      },
      run,
      first: vi
        .fn()
        .mockResolvedValue(
          sql.includes('RETURNING')
            ? { hits, window_start: Math.floor(Date.now() / 1000) }
            : { healthy: 1 },
        ),
    };
    return statement;
  });
  const batch = vi.fn().mockResolvedValue([]);
  const env = {
    DB: { prepare, batch },
    ASSETS: { fetch: vi.fn().mockResolvedValue(new Response('asset')) },
  } as unknown as Env;
  return { env, prepare, run, statements, batch };
}
function request(body: unknown = valid, headers: Record<string, string> = {}) {
  return new Request('https://photosnap.example/api/invites', {
    method: 'POST',
    headers: {
      Origin: 'https://photosnap.example',
      'Content-Type': 'application/json',
      'CF-Connecting-IP': '192.0.2.1',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe('invitation API security and persistence contract', () => {
  it('normalizes email and rejects unknown fields, missing consent, invalid plans and honeypots', () => {
    expect(inviteSchema.parse(valid).email).toBe('jamie@example.com');
    for (const value of [
      { ...valid, admin: true },
      { ...valid, consent: false },
      { ...valid, plan: 'enterprise' },
      { ...valid, website: 'bot' },
      { ...valid, name: 'x' },
      { ...valid, email: 'invalid' },
    ])
      expect(inviteSchema.safeParse(value).success).toBe(false);
  });
  it('writes a valid request with parameterized SQL, records consent and does not store raw IP', async () => {
    const { env, statements } = makeEnv();
    const result = await handleRequest(request(), env);
    expect(result.status).toBe(201);
    const insert = statements.find((statement) => statement.sql.includes('INSERT INTO invites'))!;
    expect(insert.sql).toContain('ON CONFLICT(email) DO NOTHING');
    expect(insert.args).toContain('jamie@example.com');
    expect(insert.args).toContain('Jamie Parker');
    expect(statements[0].args[0]).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(statements)).not.toContain('192.0.2.1');
    expect(result.headers.get('Cache-Control')).toBe('no-store');
    expect(result.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
  });
  it('blocks cross-origin requests before database access', async () => {
    const { env, prepare } = makeEnv();
    expect(
      (await handleRequest(request(valid, { Origin: 'https://attacker.example' }), env)).status,
    ).toBe(403);
    expect(prepare).not.toHaveBeenCalled();
  });
  it('rejects unexpected content types and oversized bodies', async () => {
    const { env, prepare } = makeEnv();
    expect(
      (await handleRequest(request(valid, { 'Content-Type': 'text/plain' }), env)).status,
    ).toBe(415);
    expect((await handleRequest(request({ ...valid, name: 'x'.repeat(3000) }), env)).status).toBe(
      413,
    );
    expect(prepare).not.toHaveBeenCalled();
  });
  it('returns validation errors without inserting any data', async () => {
    const { env, prepare } = makeEnv();
    expect((await handleRequest(request({ ...valid, consent: false }), env)).status).toBe(422);
    expect(prepare).not.toHaveBeenCalled();
  });
  it('limits a sixth request with Retry-After and does not insert it', async () => {
    const { env, statements } = makeEnv(6);
    const response = await handleRequest(request(), env);
    expect(response.status).toBe(429);
    expect(Number(response.headers.get('Retry-After'))).toBeGreaterThan(0);
    expect(statements).toHaveLength(1);
  });
  it('returns a safe retryable response if D1 is unavailable', async () => {
    const { env, prepare } = makeEnv();
    prepare.mockImplementation(() => {
      throw new Error('private SQL failure');
    });
    const response = await handleRequest(request(), env);
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('private SQL failure');
  });
  it('checks database connectivity for health and rejects API fallback and wrong methods', async () => {
    const { env } = makeEnv();
    expect(
      (await handleRequest(new Request('https://photosnap.example/api/health'), env)).status,
    ).toBe(200);
    expect(
      (await handleRequest(new Request('https://photosnap.example/api/invites'), env)).status,
    ).toBe(405);
    expect(
      (await handleRequest(new Request('https://photosnap.example/api/missing'), env)).status,
    ).toBe(404);
  });
  it('removes expired invitations and rate-limit records in one batch', async () => {
    const { env, batch, statements } = makeEnv();
    await cleanExpiredData(env);
    expect(batch).toHaveBeenCalledOnce();
    expect(statements[0].sql).toBe('DELETE FROM invites WHERE created_at < ?');
    expect(statements[1].sql).toBe('DELETE FROM rate_limits WHERE window_start < ?');
    expect((statements[1].args[0] as number) - (statements[0].args[0] as number)).toBe(89 * 86400);
  });
});
