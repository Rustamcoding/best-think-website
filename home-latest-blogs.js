(() => {
    const grid = document.querySelector('.home-latest-blog-grid');
    if (!grid) return;

    const blogUrl = new URL('blog.html', document.baseURI);

    function localUrl(value, baseUrl, directory) {
        if (!value) return null;
        try {
            const url = new URL(value, baseUrl);
            return url.origin === blogUrl.origin && url.pathname.startsWith(`/${directory}/`)
                ? url.href
                : null;
        } catch {
            return null;
        }
    }

    function articleDate(element) {
        const printed = element?.textContent.trim() || '';
        const dateParts = printed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        const iso = element?.getAttribute('datetime')?.slice(0, 10)
            || (dateParts ? `${dateParts[3]}-${dateParts[2]}-${dateParts[1]}` : '');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
        const timestamp = Date.parse(`${iso}T00:00:00Z`);
        if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== iso) return null;
        return { iso, timestamp, printed: `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}` };
    }

    function latestArticles(source, baseUrl) {
        const articles = Array.from(source.querySelectorAll('#blog-article-grid .blog-card'), (card, index) => {
            const image = card.querySelector('.blog-card-image');
            const href = localUrl(card.querySelector('.blog-image-link')?.getAttribute('href'), baseUrl, 'Bloglar');
            const imageUrl = localUrl(image?.getAttribute('src'), baseUrl, 'assets');
            const title = card.querySelector('h3')?.textContent.trim();
            const category = card.querySelector('.blog-category')?.textContent.trim();
            const date = articleDate(card.querySelector('.blog-date'));
            return href && imageUrl && title && category && date
                ? { href, imageUrl, title, category, date, alt: image.getAttribute('alt') || title, index }
                : null;
        }).filter(Boolean).sort((a, b) => b.date.timestamp - a.date.timestamp || a.index - b.index);

        const seen = new Set();
        return articles.filter(({ href }) => {
            if (seen.has(href)) return false;
            seen.add(href);
            return true;
        }).slice(0, 3);
    }

    function renderCard(article) {
        const card = document.createElement('article');
        card.className = 'blog-card blog-card-featured';
        const link = document.createElement('a');
        link.className = 'blog-image-link';
        link.href = article.href;
        const image = document.createElement('img');
        image.className = 'blog-card-image';
        image.src = article.imageUrl;
        image.alt = article.alt;
        image.loading = 'lazy';
        image.decoding = 'async';
        link.append(image);

        const content = document.createElement('div');
        content.className = 'blog-card-content';
        const meta = document.createElement('div');
        meta.className = 'blog-meta';
        const category = document.createElement('span');
        category.className = 'blog-category';
        category.textContent = article.category;
        const date = document.createElement('time');
        date.className = 'blog-date';
        date.dateTime = article.date.iso;
        date.textContent = article.date.printed;
        meta.append(category, date);
        const title = document.createElement('h3');
        title.textContent = article.title;
        content.append(meta, title);
        card.append(link, content);
        return card;
    }

    async function updateLatestArticles() {
        try {
            const response = await fetch(blogUrl.href, { cache: 'no-store' });
            if (!response.ok || new URL(response.url).origin !== blogUrl.origin) return;
            const source = new DOMParser().parseFromString(await response.text(), 'text/html');
            const articles = latestArticles(source, response.url);
            // Preserve the built-in cards if the blog is temporarily unavailable or malformed.
            if (articles.length) grid.replaceChildren(...articles.map(renderCard));
        } catch {
            // The static cards remain usable even if the request fails.
        }
    }

    updateLatestArticles();
})();
