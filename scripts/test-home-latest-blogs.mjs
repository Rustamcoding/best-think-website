import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../home-latest-blogs.js', import.meta.url), 'utf8');
const baseUrl = 'https://besthink.az/blog.html';
const element = (textContent = '', attributes = {}) => ({
    textContent,
    children: [],
    getAttribute: (name) => attributes[name] ?? null,
    append(...children) { this.children.push(...children); }
});

function article(id, date, overrides = {}) {
    const values = {
        href: `Bloglar/${id}.html`, src: `assets/${id}.png`, title: id,
        category: 'Vergilər', printed: date.split('-').reverse().join('.'), datetime: date,
        ...overrides
    };
    const nodes = {
        '.blog-image-link': element('', { href: values.href }),
        '.blog-card-image': element('', { src: values.src, alt: `${id} şəkli` }),
        h3: element(values.title),
        '.blog-category': element(values.category),
        '.blog-date': element(values.printed, { datetime: values.datetime })
    };
    return { querySelector: (selector) => nodes[selector] || null };
}

async function render(articles, { fail = false, status = 200, responseUrl = baseUrl, home = true } = {}) {
    const fallback = element('Static fallback');
    const grid = { children: [fallback], replaceChildren(...cards) { this.children = cards; } };
    const requests = [];
    runInNewContext(script, {
        document: {
            baseURI: 'https://besthink.az/index.html?preview=latest-news',
            querySelector: () => home ? grid : null,
            createElement: (tag) => ({ ...element(), tag })
        },
        fetch: async (url, options) => {
            requests.push({ url, options });
            if (fail) throw new TypeError('fetch failed');
            return { ok: status === 200, url: responseUrl, text: async () => 'blog source' };
        },
        DOMParser: class {
            parseFromString() {
                return { querySelectorAll: () => articles };
            }
        },
        URL, Date
    });
    await new Promise((resolve) => setImmediate(resolve));
    return { cards: grid.children, fallback, requests };
}

const titles = (result) => result.cards.map((card) => card.children[1].children[1].textContent);
const fixtures = [
    article('old', '2026-09-30'),
    article('first-tie', '2026-10-20'),
    article('second-tie', '2026-10-20'),
    article('legacy-date', '2026-10-18', { datetime: null }),
    article('earlier', '2026-10-05')
];
let result = await render(fixtures);
assert.deepEqual(titles(result), ['first-tie', 'second-tie', 'legacy-date']);
assert.equal(result.requests[0].url, baseUrl);
assert.equal(result.requests[0].options.cache, 'no-store');
assert.equal(result.cards[0].className, 'blog-card blog-card-featured');
assert.equal(result.cards[0].children[0].href, 'https://besthink.az/Bloglar/first-tie.html');
assert.equal(result.cards[0].children[0].children[0].src, 'https://besthink.az/assets/first-tie.png');
assert.equal(result.cards[2].children[1].children[0].children[1].dateTime, '2026-10-18');

// A new article wins by publication date even when appended at the end of the blog.
result = await render([...fixtures, article('newest', '2026-10-21')]);
assert.deepEqual(titles(result), ['newest', 'first-tie', 'second-tie']);

result = await render([
    article('invalid-calendar', '2026-02-31'),
    article('external', '2026-10-25', { href: 'https://example.com/Bloglar/external.html' }),
    article('malformed-url', '2026-10-26', { src: 'https://[' }),
    article('first-tie', '2026-10-20'),
    ...fixtures
]);
assert.deepEqual(titles(result), ['first-tie', 'second-tie', 'legacy-date']);

for (const options of [{ fail: true }, { status: 500 }, { responseUrl: 'https://example.com/blog.html' }]) {
    result = await render(fixtures, options);
    assert.equal(result.cards[0], result.fallback);
}
result = await render([]);
assert.equal(result.cards[0], result.fallback);
result = await render(fixtures.slice(0, 1));
assert.deepEqual(titles(result), ['old']);
result = await render(fixtures, { home: false });
assert.equal(result.requests.length, 0);

const homepage = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(homepage, /<script src="home-latest-blogs\.js\?[^\"]+" defer><\/script>/);
console.log('Homepage latest news: newest three, stable ties, legacy dates, safe links, and failure fallback tests passed.');
