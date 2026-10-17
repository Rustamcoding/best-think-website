import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, rmdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { SOURCE_URL, parseRegistry, syncRegistry } from './sync-dvx-nonresidents.mjs';

const officialShape = `<!doctype html><table>
  <thead><tr><th>№</th><th>ŞİRKƏTİN ADI</th><th>ÖLKƏ</th><th>QEYDİYYAT TARİXİ</th></tr></thead>
  <tbody>
    <tr><td>1</td><td>Example &amp; Co.</td><td>İrlandiya</td><td>01.12.2024</td></tr>
    <tr><td>2</td><td>Başqa şirkət</td><td>Birləşmiş Krallıq</td><td>01.04.2025</td></tr>
  </tbody>
</table>`;

assert.deepEqual(parseRegistry(officialShape), [
    { number: 1, company: 'Example & Co.', country: 'İrlandiya', registrationDate: '01.12.2024' },
    { number: 2, company: 'Başqa şirkət', country: 'Birləşmiş Krallıq', registrationDate: '01.04.2025' }
]);
assert.throws(() => parseRegistry('<html><body>Layihə yenilənir</body></html>'), /cədvəlini tapmaq/);
assert.throws(() => parseRegistry(officialShape.replace('01.12.2024', 'tarix yoxdur')), /tarixi gözlənilən formatda deyil/);

const testDirectory = mkdtempSync(join(tmpdir(), 'bestthink-dvx-test-'));
const dataPath = pathToFileURL(join(testDirectory, 'registry.json'));
const originalData = {
    source: SOURCE_URL,
    updatedAt: '2026-10-06T12:00:00.000Z',
    entries: parseRegistry(officialShape)
};
const response = (html = officialShape, status = 200, url = SOURCE_URL) => ({
    ok: status >= 200 && status < 300, status, url, text: async () => html
});
const checkedAt = '2026-10-17T10:00:00.000Z';
const options = { dataPath, now: () => new Date(checkedAt), wait: async () => {} };

try {
    writeFileSync(dataPath, JSON.stringify(originalData));
    const unchanged = await syncRegistry({ ...options, fetchImpl: async () => response() });
    let saved = JSON.parse(readFileSync(dataPath, 'utf8'));
    assert.equal(unchanged.changed, false);
    assert.equal(unchanged.refreshed, true);
    assert.equal(saved.checkedAt, checkedAt);
    assert.equal(saved.updatedAt, originalData.updatedAt);
    assert.deepEqual(saved.entries, originalData.entries);

    // A second successful check advances the check time without inventing a content change.
    const nextCheck = '2026-10-17T11:00:00.000Z';
    await syncRegistry({ ...options, now: () => new Date(nextCheck), fetchImpl: async () => response() });
    saved = JSON.parse(readFileSync(dataPath, 'utf8'));
    assert.equal(saved.checkedAt, nextCheck);
    assert.equal(saved.updatedAt, originalData.updatedAt);

    const changed = await syncRegistry({
        ...options,
        fetchImpl: async () => response(officialShape.replace('Başqa şirkət', 'Yeni şirkət'))
    });
    saved = JSON.parse(readFileSync(dataPath, 'utf8'));
    assert.equal(changed.changed, true);
    assert.equal(saved.checkedAt, checkedAt);
    assert.equal(saved.updatedAt, checkedAt);
    assert.equal(saved.entries[1].company, 'Yeni şirkət');

    const protectedData = readFileSync(dataPath, 'utf8');
    let attempts = 0;
    const delays = [];
    await assert.rejects(syncRegistry({
        ...options,
        fetchImpl: async () => { attempts++; throw new TypeError('fetch failed'); },
        wait: async (milliseconds) => delays.push(milliseconds)
    }), /fetch failed/);
    assert.equal(attempts, 3);
    assert.deepEqual(delays, [2000, 4000]);
    assert.equal(readFileSync(dataPath, 'utf8'), protectedData);

    for (const badResponse of [
        response('<html>Cədvəl yoxdur</html>'),
        response(officialShape, 200, 'https://example.com/'),
        response(officialShape, 404)
    ]) {
        attempts = 0;
        await assert.rejects(syncRegistry({
            ...options, fetchImpl: async () => { attempts++; return badResponse; }
        }));
        assert.equal(attempts, 1);
        assert.equal(readFileSync(dataPath, 'utf8'), protectedData);
    }

    attempts = 0;
    await syncRegistry({
        ...options,
        fetchImpl: async () => {
            if (++attempts === 1) throw new TypeError('fetch failed');
            return response();
        }
    });
    assert.equal(attempts, 2);

    attempts = 0;
    await syncRegistry({
        ...options,
        fetchImpl: async () => response(officialShape, ++attempts < 3 ? 503 : 200)
    });
    assert.equal(attempts, 3);
} finally {
    rmSync(dataPath, { force: true });
    rmSync(new URL(`${dataPath.href}.tmp`), { force: true });
    rmdirSync(testDirectory);
}

// Exercise the real browser script without network access or an hour-long wait.
function element() {
    return {
        children: [], textContent: '', hidden: false, value: '',
        append(...children) { this.children.push(...children); },
        replaceChildren(...children) { this.children = children; },
        addEventListener() {}
    };
}
const elements = Object.fromEntries([
    'rows', 'search', 'count', 'updated', 'empty', 'error'
].map((id) => [`dvx-registry-${id}`, element()]));
let payload = { ...originalData, checkedAt };
let failRequest = false;
const intervals = [];
runInNewContext(readFileSync(new URL('../qeyri-rezidentler.js', import.meta.url), 'utf8'), {
    document: {
        getElementById: (id) => elements[id],
        createElement: element,
        querySelector: () => null
    },
    fetch: async (_url, options) => {
        assert.equal(options.cache, 'no-store');
        if (failRequest) throw new TypeError('fetch failed');
        return { ok: true, json: async () => payload };
    },
    setInterval: (callback, milliseconds) => intervals.push({ callback, milliseconds }),
    Intl, Date
});
await new Promise((resolve) => setImmediate(resolve));
assert.equal(intervals.length, 1);
assert.equal(intervals[0].milliseconds, 3_600_000);
assert.equal(elements['dvx-registry-updated'].textContent, 'Rəsmi mənbə ilə son uğurlu yoxlama: 17/10/2026 14:00');
assert.equal(elements['dvx-registry-rows'].children.length, 2);
payload = { ...payload, checkedAt: '2026-10-17T11:00:00.000Z' };
await intervals[0].callback();
assert.equal(elements['dvx-registry-updated'].textContent, 'Rəsmi mənbə ilə son uğurlu yoxlama: 17/10/2026 15:00');
const verifiedLabel = elements['dvx-registry-updated'].textContent;
failRequest = true;
await intervals[0].callback();
assert.equal(elements['dvx-registry-updated'].textContent, verifiedLabel);
assert.equal(elements['dvx-registry-rows'].children.length, 2);
failRequest = false;
payload = { entries: [{}] };
await intervals[0].callback();
assert.equal(elements['dvx-registry-updated'].textContent, verifiedLabel);
assert.equal(elements['dvx-registry-rows'].children.length, 2);
payload = originalData;
await intervals[0].callback();
assert.equal(elements['dvx-registry-updated'].textContent, 'Siyahının son yenilənməsi: 06/10/2026 16:00');

console.log('DVX parser, uğurlu yoxlama tarixi, saatlıq yenilənmə, təkrar cəhd və məlumatların qorunması testləri uğurla keçdi.');
