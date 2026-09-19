const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest } = require('next/server');

// Execute the actual route with mocked network calls; no real mail or credentials.
const compiled = ts.transpileModule(fs.readFileSync('src/app/api/contact/route.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const moduleExports = {};
vm.runInThisContext('(function(require,exports){' + compiled + '\n})')(require, moduleExports);
const { POST } = moduleExports;
const originalFetch = global.fetch;
const keys = ['RESEND_API_KEY', 'RESEND_FROM', 'MAIL_TO', 'RECAPTCHA_SECRET_KEY'];
let previous;
let calls;
beforeEach(() => {
  previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  Object.assign(process.env, { RESEND_API_KEY: 'test-only', RESEND_FROM: 'site@example.org', MAIL_TO: 'owner@example.org', RECAPTCHA_SECRET_KEY: 'test-secret' });
  calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    return Response.json(url.includes('recaptcha') ? { success: true } : { id: 'test-email-id' });
  };
});
afterEach(() => {
  global.fetch = originalFetch;
  for (const key of keys) {
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
  }
});
const valid = { name: 'Jan Testowy', email: 'jan@example.org', message: 'Przykładowa wiadomość', token: 'test-token' };
const request = body => new NextRequest('http://localhost/api/contact', {
  method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
});

test('sends plain text to configured recipient with visitor Reply-To after CAPTCHA', async () => {
  const response = await POST(request({ ...valid, to: 'attacker@example.org' }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, 'https://www.google.com/recaptcha/api/siteverify');
  assert.equal(calls[0].options.body.get('secret'), 'test-secret');
  const sent = JSON.parse(calls[1].options.body);
  assert.equal(calls[1].url, 'https://api.resend.com/emails');
  assert.deepEqual(sent.to, ['owner@example.org']);
  assert.equal(sent.from, 'site@example.org');
  assert.equal(sent.reply_to, valid.email);
  assert.ok(sent.text.includes(valid.message));
  assert.equal(sent.html, undefined);
});

for (const [label, input] of [
  ['malformed JSON', '{'], ['null', 'null'], ['array', []],
  ['missing field', { ...valid, name: '' }], ['missing token', { ...valid, token: '' }],
  ['bad email', { ...valid, email: 'bad' }], ['header injection', { ...valid, name: 'Name\r\nBcc: other@example.org' }],
  ['oversized message', { ...valid, message: 'x'.repeat(5001) }],
]) {
  test('rejects ' + label + ' before network calls', async () => {
    assert.equal((await POST(request(input))).status, 400);
    assert.equal(calls.length, 0);
  });
}

test('limits actual request bytes without Content-Length', async () => {
  assert.equal((await POST(request({ ...valid, message: 'x'.repeat(40001) }))).status, 413);
  assert.equal(calls.length, 0);
});
test('missing provider config fails closed', async () => {
  delete process.env.RESEND_API_KEY;
  assert.equal((await POST(request(valid))).status, 503);
  assert.equal(calls.length, 0);
});
test('invalid CAPTCHA never sends mail', async () => {
  global.fetch = async url => { calls.push(url); return Response.json({ success: false }); };
  assert.equal((await POST(request(valid))).status, 400);
  assert.equal(calls.length, 1);
});
test('CAPTCHA outage returns controlled error', async () => {
  global.fetch = async () => { throw new Error('private upstream failure'); };
  const response = await POST(request(valid));
  assert.equal(response.status, 502);
  assert.ok(!(await response.text()).includes('private'));
});
for (const kind of ['reject', 'timeout', 'invalid-json', 'missing-id']) {
  test('Resend ' + kind + ' never reports success or leaks details', async () => {
    global.fetch = async url => {
      if (url.includes('recaptcha')) return Response.json({ success: true });
      if (kind === 'timeout') throw new Error('private upstream failure');
      if (kind === 'invalid-json') return new Response('<html>failure</html>');
      return Response.json({ message: 'private upstream failure' }, { status: kind === 'reject' ? 403 : 200 });
    };
    const response = await POST(request(valid));
    assert.equal(response.status, 502);
    assert.ok(!(await response.text()).includes('private'));
  });
}
