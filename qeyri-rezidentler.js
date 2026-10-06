(() => {
    const sourceUrl = 'https://taxes.gov.az/az/page/reqemsal-iqtisadiyyat-uzre-vergitutma';
    const rowsElement = document.getElementById('dvx-registry-rows');
    const searchElement = document.getElementById('dvx-registry-search');
    const countElement = document.getElementById('dvx-registry-count');
    const updatedElement = document.getElementById('dvx-registry-updated');
    const emptyElement = document.getElementById('dvx-registry-empty');
    const errorElement = document.getElementById('dvx-registry-error');
    if (!rowsElement || !searchElement || !countElement) return;

    const normalize = (value) => String(value || '')
        .toLocaleLowerCase('az')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ə/g, 'e')
        .replace(/ı/g, 'i');

    let entries = [];

    function render() {
        const query = normalize(searchElement.value.trim());
        const visible = entries.filter((entry) => normalize(`${entry.company} ${entry.country}`).includes(query));
        rowsElement.replaceChildren();
        emptyElement.hidden = visible.length !== 0;
        countElement.textContent = query
            ? `${visible.length} / ${entries.length} şirkət göstərilir`
            : `${entries.length} şirkət`;

        for (const entry of visible) {
            const row = document.createElement('tr');
            for (const value of [entry.number, entry.company, entry.country, entry.registrationDate]) {
                const cell = document.createElement('td');
                cell.textContent = String(value);
                row.append(cell);
            }
            rowsElement.append(row);
        }
    }

    function showError() {
        rowsElement.replaceChildren();
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        cell.className = 'dvx-table-state';
        cell.textContent = 'Siyahı hazırda yüklənə bilmir.';
        row.append(cell);
        rowsElement.append(row);
        errorElement.hidden = false;
        countElement.textContent = 'Siyahı yüklənmədi';
    }

    searchElement.addEventListener('input', render);

    fetch('data/dvx-digital-nonresidents.json', { cache: 'no-store' })
        .then((response) => {
            if (!response.ok) throw new Error(`Siyahı yüklənmədi: ${response.status}`);
            return response.json();
        })
        .then((data) => {
            if (!Array.isArray(data.entries) || data.entries.length === 0) throw new Error('Siyahının formatı düzgün deyil.');
            entries = data.entries.filter((entry) => entry && entry.company && entry.country && entry.registrationDate);
            if (!entries.length) throw new Error('Siyahıda göstəriləcək qeyd yoxdur.');
            render();

            if (updatedElement && data.updatedAt) {
                const date = new Date(data.updatedAt);
                if (!Number.isNaN(date.valueOf())) {
                    const timestamp = new Intl.DateTimeFormat('en-GB', {
                        timeZone: 'Asia/Baku',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hourCycle: 'h23'
                    }).format(date).replace(',', '');
                    updatedElement.textContent = `Siyahı rəsmi mənbədəki son dəyişikliyə əsasən yenilənib: ${timestamp}`;
                }
            }
        })
        .catch(() => showError());

    const sourceLink = document.querySelector('.dvx-registry-meta a');
    if (sourceLink) sourceLink.href = sourceUrl;
})();
