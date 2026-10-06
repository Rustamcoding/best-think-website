import { appendFileSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const SOURCE_URL = 'https://taxes.gov.az/az/page/reqemsal-iqtisadiyyat-uzre-vergitutma';
const DATA_PATH = new URL('../data/dvx-digital-nonresidents.json', import.meta.url);

function decodeEntities(value) {
    const named = { amp: '&', nbsp: ' ', quot: '"', apos: "'", lt: '<', gt: '>' };
    return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
        if (entity[0] === '#') {
            const hex = entity[1]?.toLowerCase() === 'x';
            const codePoint = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
            return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
        }
        return named[entity.toLowerCase()] ?? match;
    });
}

function plainText(html) {
    return decodeEntities(String(html)
        .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
        .replace(/<br\s*\/?\s*>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' '))
        .replace(/\s+/g, ' ')
        .trim();
}

function extractCells(rowHtml) {
    return [...rowHtml.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]\s*>/gi)]
        .map((match) => plainText(match[1]));
}

function isRegistryHeader(cells) {
    const header = cells.join(' ').toLocaleLowerCase('az');
    return header.includes('şirkətin adı') && header.includes('ölkə') && header.includes('qeydiyyat tarixi');
}

export function parseRegistry(html) {
    if (typeof html !== 'string' || !html.trim()) throw new Error('DVX səhifəsi boş cavab qaytardı.');
    const tables = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table\s*>/gi)];
    let parsed;

    for (const table of tables) {
        const rows = [...table[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi)]
            .map((match) => extractCells(match[1]));
        const headerIndex = rows.findIndex(isRegistryHeader);
        if (headerIndex < 0) continue;

        parsed = rows.slice(headerIndex + 1)
            .filter((cells) => cells.length >= 4)
            .map((cells) => ({
                number: Number(cells[0].replace(/[^\d]/g, '')),
                company: cells[1],
                country: cells[2],
                registrationDate: cells[3]
            }))
            .filter((entry) => entry.number && entry.company && entry.country && entry.registrationDate);
        if (parsed.length) break;
    }

    if (!parsed || parsed.length < 1 || parsed.length > 500) {
        throw new Error('Rəsmi siyahı cədvəlini tapmaq və ya oxumaq mümkün olmadı. Mövcud məlumat qorunub saxlanılır.');
    }

    const companies = new Set();
    for (const [index, entry] of parsed.entries()) {
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(entry.registrationDate)) {
            throw new Error(`Qeydiyyat tarixi gözlənilən formatda deyil (sətir ${index + 1}). Mövcud məlumat qorunub saxlanılır.`);
        }
        const key = entry.company.toLocaleLowerCase('az');
        if (companies.has(key)) throw new Error('Siyahıda təkrarlanan şirkət qeydi aşkarlandı. Mövcud məlumat qorunub saxlanılır.');
        companies.add(key);
    }

    return parsed;
}

function appendOutput(name, value) {
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

export async function syncRegistry() {
    const response = await fetch(SOURCE_URL, {
        headers: { 'user-agent': 'BestThink-DVX-Registry-Sync/1.0 (+https://besthink.az)' },
        signal: AbortSignal.timeout(25_000)
    });
    if (!response.ok) throw new Error(`DVX səhifəsindən cavab alınmadı: HTTP ${response.status}.`);
    const finalUrl = new URL(response.url);
    const allowedHost = finalUrl.hostname === 'taxes.gov.az' || finalUrl.hostname.endsWith('.taxes.gov.az');
    if (finalUrl.protocol !== 'https:' || !allowedHost) throw new Error('Sorğu rəsmi DVX domenindən kənara yönləndirildi.');

    const records = parseRegistry(await response.text());
    const oldData = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
    const oldComparable = JSON.stringify(oldData.entries.map(({ number, company, country, registrationDate }) => ({ number, company, country, registrationDate })));
    const newComparable = JSON.stringify(records);
    const changed = oldComparable !== newComparable;

    if (!changed) {
        console.log(`Rəsmi siyahı yoxlanıldı; dəyişiklik yoxdur (${records.length} qeyd).`);
        appendOutput('changed', 'false');
        return { changed, count: records.length };
    }

    const nextData = {
        source: SOURCE_URL,
        updatedAt: new Date().toISOString(),
        entries: records
    };
    const tempUrl = new URL('../data/.dvx-digital-nonresidents.tmp', import.meta.url);
    writeFileSync(tempUrl, `${JSON.stringify(nextData, null, 2)}\n`, 'utf8');
    renameSync(tempUrl, DATA_PATH);
    console.log(`DVX siyahısındakı dəyişikliklər yadda saxlanıldı (${records.length} qeyd).`);
    appendOutput('changed', 'true');
    return { changed, count: records.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    syncRegistry().catch((error) => {
        console.error(`DVX siyahısının yenilənməsi alınmadı: ${error.message}`);
        process.exitCode = 1;
    });
}
