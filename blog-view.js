/* Bloq: şəkilli kartlar / yığcam siyahı arasında keçid. Seçim yadda saxlanılır. */
(function () {
    const grid = document.getElementById('blog-article-grid');
    const buttons = [...document.querySelectorAll('[data-blog-view]')];
    if (!grid || !buttons.length) return;
    const KEY = 'bt-blog-view';
    const apply = (view) => {
        grid.classList.toggle('is-list', view === 'list');
        buttons.forEach((btn) => {
            const on = btn.dataset.blogView === view;
            btn.classList.toggle('is-active', on);
            btn.setAttribute('aria-pressed', String(on));
        });
    };
    let saved = 'grid';
    try { saved = localStorage.getItem(KEY) === 'list' ? 'list' : 'grid'; } catch (e) {}
    apply(saved);
    buttons.forEach((btn) => btn.addEventListener('click', () => {
        apply(btn.dataset.blogView);
        try { localStorage.setItem(KEY, btn.dataset.blogView); } catch (e) {}
    }));
})();
