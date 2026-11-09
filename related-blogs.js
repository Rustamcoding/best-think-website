(() => {
    const articleSection = document.querySelector('.article-section');
    if (!articleSection) return;

    // Səhifədə <base> teqi ola bilər, ona görə ünvanlar birbaşa location-dan götürülür.
    const blogUrl = new URL('/blog.html', window.location.origin);
    const currentPath = decodeURIComponent(window.location.pathname);
    const LIMIT = 8;
    const MIN_FOR_MARQUEE = 4;

    function localUrl(value, baseUrl, directory) {
        if (!value) return null;
        try {
            const url = new URL(value, baseUrl);
            return url.origin === blogUrl.origin && url.pathname.startsWith(`/${directory}/`) ? url : null;
        } catch {
            return null;
        }
    }

    function articleDate(element) {
        const printed = element?.textContent.trim() || '';
        const parts = printed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        const iso = element?.getAttribute('datetime')?.slice(0, 10)
            || (parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : '');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
        const timestamp = Date.parse(`${iso}T00:00:00Z`);
        if (!Number.isFinite(timestamp)) return null;
        return { iso, timestamp, printed: `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}` };
    }

    function readArticles(source, baseUrl) {
        const seen = new Set();
        return Array.from(source.querySelectorAll('#blog-article-grid .blog-card'), (card, index) => {
            const image = card.querySelector('.blog-card-image');
            const link = localUrl(card.querySelector('.blog-image-link')?.getAttribute('href'), baseUrl, 'Bloglar');
            const imageUrl = localUrl(image?.getAttribute('src'), baseUrl, 'assets');
            const title = card.querySelector('h3')?.textContent.trim();
            const category = card.querySelector('.blog-category')?.textContent.trim();
            const date = articleDate(card.querySelector('.blog-date'));
            const tags = (card.getAttribute('data-blog-categories') || '').split(/\s+/).filter(Boolean);
            if (!link || !imageUrl || !title || !category || !date) return null;
            return {
                href: link.href, path: decodeURIComponent(link.pathname), imageUrl: imageUrl.href,
                title, category, date, tags, alt: image.getAttribute('alt') || title, index
            };
        }).filter((article) => {
            if (!article || seen.has(article.path)) return false;
            seen.add(article.path);
            return true;
        });
    }

    function pickRelated(articles) {
        const current = articles.find((article) => article.path === currentPath);
        const currentTags = new Set(current?.tags || []);
        return articles
            .filter((article) => article.path !== currentPath)
            .map((article) => ({ ...article, score: article.tags.filter((tag) => currentTags.has(tag)).length }))
            .sort((a, b) => b.score - a.score || b.date.timestamp - a.date.timestamp || a.index - b.index)
            .slice(0, LIMIT);
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
        const titleLink = document.createElement('a');
        titleLink.href = article.href;
        titleLink.textContent = article.title;
        title.append(titleLink);
        content.append(meta, title);
        card.append(link, content);
        return card;
    }

    async function showRelated() {
        try {
            const response = await fetch(blogUrl.href, { cache: 'no-store' });
            if (!response.ok) return;
            const source = new DOMParser().parseFromString(await response.text(), 'text/html');
            const related = pickRelated(readArticles(source, response.url));
            if (!related.length) return;

            const section = document.createElement('section');
            section.className = 'related-blogs-section';
            section.setAttribute('aria-labelledby', 'related-blogs-heading');
            const container = document.createElement('div');
            container.className = 'container';
            const heading = document.createElement('h2');
            heading.id = 'related-blogs-heading';
            heading.textContent = 'Oxşar xəbərlər';
            const grid = document.createElement('div');
            grid.className = 'blog-placeholder related-blog-grid';
            grid.append(...related.map(renderCard));

            if (related.length >= MIN_FOR_MARQUEE) {
                // Axan lent: kartlar iki dəfə düzülür ki, dövr fasiləsiz görünsün.
                const marquee = document.createElement('div');
                marquee.className = 'related-marquee';
                grid.classList.add('related-marquee-track');
                grid.style.setProperty('--related-duration', `${related.length * 7}s`);
                related.forEach((article) => {
                    const clone = renderCard(article);
                    clone.setAttribute('aria-hidden', 'true');
                    clone.querySelectorAll('a').forEach((link) => link.setAttribute('tabindex', '-1'));
                    grid.append(clone);
                });
                marquee.addEventListener('touchstart', () => marquee.classList.toggle('is-paused'), { passive: true });
                marquee.append(grid);
                container.append(heading, marquee);
            } else {
                container.append(heading, grid);
            }
            section.append(container);
            articleSection.after(section);
        } catch {
            // Bölmə yüklənməsə, məqalə səhifəsi olduğu kimi qalır.
        }
    }

    showRelated();
})();
