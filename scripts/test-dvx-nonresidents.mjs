import assert from 'node:assert/strict';
import { parseRegistry } from './sync-dvx-nonresidents.mjs';

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

console.log('DVX cədvəl parser testləri uğurla keçdi.');
