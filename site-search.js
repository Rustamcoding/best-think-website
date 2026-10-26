(() => {
    const input = document.getElementById('site-search-query');
    const form = document.getElementById('site-search-results-form');
    const status = document.getElementById('site-search-status');
    const results = document.getElementById('site-search-results');

    if (!input || !form || !status || !results) return;

    const CACHE_KEY = 'bestthink-site-search-index-v2';
    const CACHE_TTL = 30 * 60 * 1000;
    const query = new URLSearchParams(window.location.search).get('q') || '';
    input.value = query;

    const normalize = value => String(value || '')
        .toLocaleLowerCase('az')
        .replace(/[ə]/g, 'e')
        .replace(/[ı]/g, 'i')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

    const tokenize = value => normalize(value)
        .split(' ')
        .filter(token => token.length > 1 && !['ve', 'ile', 'ucun', 'kimi'].includes(token));

    const cleanText = value => String(value || '').replace(/\s+/g, ' ').trim();

    const categoryFor = pathname => {
        const path = pathname.toLocaleLowerCase('az');
        if (path.includes('/bloglar/') || path.endsWith('/blog.html')) return 'Bloq';
        if (path.endsWith('/xidmetlerimiz.html')) return 'Xidmətlər';
        if (path.endsWith('/xidmet-ehatemiz.html')) return 'Fəaliyyət sahələri';
        if (path.endsWith('/faydali-melumatlar.html') || path.endsWith('/qeyri-rezidentler.html')) return 'Faydalı məlumatlar';
        if (path.endsWith('/proqramlar.html') || path.endsWith('/kalkulyator.html')) return 'Alətlər';
        if (path.endsWith('/haqqimizda.html') || path.endsWith('/meqsedimiz.html')) return 'Haqqımızda';
        if (path.endsWith('/elaqe.html')) return 'Əlaqə';
        return 'Ana səhifə';
    };

    const pathFromSitemap = loc => {
        try {
            const url = new URL(loc, window.location.origin);
            if (url.hostname !== 'besthink.az' && url.origin !== window.location.origin) return null;
            return url.pathname === '/' ? '/index.html' : url.pathname;
        } catch {
            return null;
        }
    };

    const makeEntry = (page, title, text, href, label = '') => ({
        title: cleanText(title) || page.title,
        text: cleanText(text),
        href,
        category: page.category,
        label: cleanText(label || page.category)
    });

    async function buildIndex() {
        try {
            const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
            if (cached && Date.now() - cached.savedAt < CACHE_TTL && Array.isArray(cached.entries)) {
                return cached.entries;
            }
        } catch { /* Keçərsiz brauzer keşini yenidən yaradırıq. */ }

        const sitemapResponse = await fetch('/sitemap.xml', { cache: 'no-cache' });
        if (!sitemapResponse.ok) throw new Error('Sayt xəritəsi yüklənmədi.');
        const sitemapText = await sitemapResponse.text();
        const sitemap = new DOMParser().parseFromString(sitemapText, 'application/xml');
        const paths = [...sitemap.getElementsByTagNameNS('*', 'loc')]
            .map(node => pathFromSitemap(node.textContent))
            .filter((path, index, all) => path && path.endsWith('.html') && path !== '/axtaris.html' && all.indexOf(path) === index);

        const pages = await Promise.all(paths.map(async path => {
            try {
                const response = await fetch(path, { cache: 'no-cache' });
                if (!response.ok) return null;
                const html = await response.text();
                const documentPage = new DOMParser().parseFromString(html, 'text/html');
                const main = documentPage.querySelector('main') || documentPage.body;
                main.querySelectorAll('script, style, nav, footer, header, svg, form, [hidden], [aria-hidden="true"], .visually-hidden').forEach(node => node.remove());

                const title = cleanText(main.querySelector('h1')?.textContent || documentPage.title);
                const paragraphs = [...main.querySelectorAll('h1, h2, h3, h4, p, li, summary, th, td')]
                    .map(node => cleanText(node.textContent))
                    .filter(text => text.length > 2);
                const text = cleanText(main.textContent);
                const page = { title, path, category: categoryFor(path) };
                const entries = [makeEntry(page, title, [title, ...paragraphs, text].join(' '), path)];

                main.querySelectorAll('details > summary').forEach(summary => {
                    const parent = summary.parentElement;
                    const question = cleanText(summary.textContent);
                    if (!parent || parent.querySelector('details') || question.length < 5 || question.length > 220) return;
                    if (/^(ətraflı məlumat|daha ətraflı|ətraflı oxu)$/i.test(question)) return;
                    const section = summary.closest('details[id]');
                    const href = section?.id ? `${path}#${encodeURIComponent(section.id)}` : path;
                    entries.push(makeEntry(page, question, parent.textContent, href, 'Sual-cavab'));
                });

                main.querySelectorAll('section[id], article[id]').forEach(section => {
                    const sectionTitle = cleanText(section.querySelector('h2, h3, h4')?.textContent);
                    const sectionText = cleanText(section.textContent);
                    if (!sectionTitle || sectionText.length < 35 || sectionText.length > 12000) return;
                    entries.push(makeEntry(page, sectionTitle, sectionText, `${path}#${encodeURIComponent(section.id)}`));
                });

                return entries;
            } catch {
                return null;
            }
        }));

        const entries = pages.flat().filter(entry => entry && entry.title && entry.text);
        if (!entries.length) throw new Error('Axtarış indeksi yaradıla bilmədi.');
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), entries }));
        } catch { /* Axtarış keş olmadan da işləyir. */ }
        return entries;
    }

    function rank(entry, tokens, phrase) {
        const title = normalize(entry.title);
        const text = normalize(entry.text);
        const searchable = `${title} ${text}`;
        if (!tokens.every(token => searchable.includes(token))) return 0;

        let score = 0;
        if (title === phrase) score += 100;
        else if (title.includes(phrase)) score += 55;
        tokens.forEach(token => {
            if (title.includes(token)) score += 18;
            else if (text.includes(token)) score += 3;
        });
        if (text.includes(phrase)) score += 10;
        if (entry.label === 'Sual-cavab') score += 4;
        return score;
    }

    function excerptFor(entry, tokens) {
        const blocks = entry.text.split(/(?<=[.!?])\s+/).filter(Boolean);
        const matched = blocks.find(block => tokens.every(token => normalize(block).includes(token)))
            || blocks.find(block => tokens.some(token => normalize(block).includes(token)))
            || blocks[0]
            || entry.text;
        return matched.length > 230 ? `${matched.slice(0, 227).trim()}…` : matched;
    }

    function renderResults(items, total, searchTerm) {
        results.replaceChildren();
        if (!items.length) {
            status.textContent = `“${searchTerm}” üzrə nəticə tapılmadı.`;
            const empty = document.createElement('div');
            empty.className = 'site-search-empty';
            const title = document.createElement('strong');
            title.textContent = 'Başqa sözlə axtarmağı sınayın';
            const description = document.createElement('span');
            description.textContent = 'Məsələn, “ƏDV”, “mühasibatlıq”, “əmək haqqı” və ya “konsultasiya” yaza bilərsiniz.';
            empty.append(title, description);
            results.append(empty);
            return;
        }

        status.textContent = `“${searchTerm}” üzrə ${total} uyğun nəticə tapıldı.`;
        const grouped = new Map();
        items.forEach(item => {
            if (!grouped.has(item.category)) grouped.set(item.category, []);
            grouped.get(item.category).push(item);
        });

        grouped.forEach((groupItems, category) => {
            const section = document.createElement('section');
            section.className = 'site-search-group';
            const heading = document.createElement('h2');
            heading.append(document.createTextNode(category));
            const count = document.createElement('span');
            count.textContent = String(groupItems.length);
            heading.append(count);
            const list = document.createElement('div');
            list.className = 'site-search-group-list';

            groupItems.forEach(item => {
                const card = document.createElement('article');
                card.className = 'site-search-result';
                const label = document.createElement('p');
                label.className = 'site-search-result-label';
                label.textContent = item.label;
                const title = document.createElement('h3');
                const link = document.createElement('a');
                link.href = item.href;
                link.textContent = item.title;
                title.append(link);
                const excerpt = document.createElement('p');
                excerpt.textContent = excerptFor(item, tokenize(searchTerm));
                card.append(label, title, excerpt);
                list.append(card);
            });

            section.append(heading, list);
            results.append(section);
        });
    }

    if (!query.trim()) {
        input.focus({ preventScroll: true });
        return;
    }

    const tokens = tokenize(query);
    const phrase = normalize(query);
    if (!tokens.length) {
        status.textContent = 'Zəhmət olmasa, axtarış üçün daha dəqiq söz yazın.';
        return;
    }

    status.className = 'site-search-status site-search-loading';
    status.textContent = 'Sayt üzrə axtarılır…';
    buildIndex()
        .then(entries => {
            const ranked = entries
                .map(entry => ({ ...entry, score: rank(entry, tokens, phrase) }))
                .filter(entry => entry.score > 0)
                .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'az'));
            status.className = 'site-search-status';
            const deduped = [];
            const seen = new Set();
            ranked.forEach(entry => {
                const key = `${entry.href}|${normalize(entry.title)}`;
                if (seen.has(key)) return;
                seen.add(key);
                deduped.push(entry);
            });
            renderResults(deduped.slice(0, 18), deduped.length, query.trim());
        })
        .catch(() => {
            status.className = 'site-search-status';
            status.textContent = 'Axtarışı hazırda yükləmək mümkün olmadı. Bir az sonra yenidən cəhd edin.';
        });
})();
