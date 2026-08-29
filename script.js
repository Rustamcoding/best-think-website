/* =========================================================
   BEST THINK — ÜMUMİ SAYT SİSTEMİ
   ========================================================= */


/* =========================================================
   1. MƏRKƏZİ HEADER-İ BÜTÜN SƏHİFƏLƏRƏ YÜKLƏ
   ========================================================= */

async function loadHeader() {

    const headerContainer = document.getElementById('site-header');

    if (!headerContainer) {
        console.log('site-header tapılmadı.');
        return;
    }

    try {

        const isBlogArticle = window.location.pathname.includes('/Bloglar/');

const headerPath = isBlogArticle
    ? '../header.html?v=2'
    : './header.html?v=2';

const response = await fetch(headerPath);

        if (!response.ok) {
            throw new Error(
                `header.html yüklənmədi: ${response.status}`
            );
        }

        const headerHTML = await response.text();

        headerContainer.innerHTML = headerHTML;


        /* =========================================
           AKTİV MENYU
           ========================================= */

        const currentPage =
            window.location.pathname
                .split('/')
                .pop()
                .toLowerCase();

        const navLinks =
            document.querySelectorAll('.nav nav a');

        navLinks.forEach(link => {

            const href = link.getAttribute('href');

            if (!href) {
                return;
            }

            const linkPage =
                href.split('/')
                    .pop()
                    .split('#')[0]
                    .toLowerCase();

            link.classList.remove('active');

            if (
                linkPage === currentPage ||
                (
                    currentPage === '' &&
                    linkPage === 'index.html'
                )
            ) {
                link.classList.add('active');
            }

        });


        /* =========================================
           MOBİL MENYU
           ========================================= */

        const menuBtn =
            document.querySelector('.menu-btn');

        const nav =
            document.querySelector('.nav nav');

        if (menuBtn && nav) {

            menuBtn.addEventListener('click', () => {

                nav.classList.toggle('open');

            });

        }


        console.log('Header uğurla yükləndi.');

    }

    catch (error) {

        console.error(
            'Header xətası:',
            error
        );

    }

}


/* =========================================
   HEADER-İ YÜKLƏ
   ========================================= */

loadHeader();

/* =========================================================
   2. MƏZƏNNƏ FƏRQİ KALKULYATORU
   ========================================================= */

const currency =
    document.getElementById('currency');

const paymentDate =
    document.getElementById('payment-date');

const importDate =
    document.getElementById('import-date');

const amount =
    document.getElementById('amount');


const paymentRate =
    document.getElementById('payment-rate');

const importRate =
    document.getElementById('import-rate');


const currencyLabel =
    document.getElementById('currency-label');


const paymentCalculation =
    document.getElementById(
        'payment-calculation'
    );


const importCalculation =
    document.getElementById(
        'import-calculation'
    );


const calculationDifference =
    document.getElementById(
        'calculation-difference'
    );


const resultBox =
    document.getElementById(
        'calculator-result'
    );

const resultIcon =
    document.getElementById(
        'result-icon'
    );

const resultTitle =
    document.getElementById(
        'result-title'
    );

const resultValue =
    document.getElementById(
        'result-value'
    );


/* =========================================================
   3. BEST THINK API
   ========================================================= */

const API_BASE =
    'https://besthink-api.rustemqacayli.workers.dev';


let paymentRateValue = null;

let importRateValue = null;


/* =========================================================
   4. API-DƏN MƏZƏNNƏNİ AL
   ========================================================= */

async function getRate(
    date,
    selectedCurrency
) {

    if (
        !date ||
        !selectedCurrency
    ) {

        return null;

    }


    const url =
        `${API_BASE}/rates?date=${encodeURIComponent(date)}&currency=${encodeURIComponent(selectedCurrency)}`;


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            `API xətası: ${response.status}`
        );

    }


    const data =
        await response.json();


    if (!data.success) {

        throw new Error(
            'Məzənnə məlumatı əldə olunmadı.'
        );

    }


    return data;

}


/* =========================================================
   5. ÖDƏNİŞ MƏZƏNNƏSİNİ YÜKLƏ
   ========================================================= */

async function loadPaymentRate() {

    paymentRateValue = null;


    if (!paymentDate.value) {

        paymentRate.textContent =
            '—';

        calculateResult();

        return;

    }


    paymentRate.innerHTML =
        '<span class="rate-loading">Yüklənir...</span>';


    try {

        const data =
            await getRate(
                paymentDate.value,
                currency.value
            );


        paymentRateValue =
            Number(data.ratePerUnit);


        paymentRate.textContent =
            paymentRateValue.toFixed(4);


        calculateResult();

    }

    catch (error) {

        console.error(
            'Ödəniş məzənnəsi xətası:',
            error
        );


        paymentRateValue = null;


        paymentRate.innerHTML =
            '<span class="rate-error">Alınmadı</span>';


        calculateResult();

    }

}


/* =========================================================
   6. İDXAL MƏZƏNNƏSİNİ YÜKLƏ
   ========================================================= */

async function loadImportRate() {

    importRateValue = null;


    if (!importDate.value) {

        importRate.textContent =
            '—';

        calculateResult();

        return;

    }


    importRate.innerHTML =
        '<span class="rate-loading">Yüklənir...</span>';


    try {

        const data =
            await getRate(
                importDate.value,
                currency.value
            );


        importRateValue =
            Number(data.ratePerUnit);


        importRate.textContent =
            importRateValue.toFixed(4);


        calculateResult();

    }

    catch (error) {

        console.error(
            'İdxal məzənnəsi xətası:',
            error
        );


        importRateValue = null;


        importRate.innerHTML =
            '<span class="rate-error">Alınmadı</span>';


        calculateResult();

    }

}


/* =========================================================
   7. NƏTİCƏNİ HESABLA
   ========================================================= */

function calculateResult() {

    if (
        !currency ||
        !amount ||
        !paymentDate ||
        !importDate
    ) {

        return;

    }


    const operationAmount =
        parseFloat(amount.value) || 0;


    const selectedCurrency =
        currency.value;


    if (currencyLabel) {

        currencyLabel.textContent =
            selectedCurrency;

    }


    /*
       Hər iki məzənnə və məbləğ
       hazır deyilsə nəticə göstərilmir.
    */

    if (
        paymentRateValue === null ||
        importRateValue === null ||
        operationAmount <= 0
    ) {

        if (paymentCalculation) {

            paymentCalculation.textContent =
                '—';

        }


        if (importCalculation) {

            importCalculation.textContent =
                '—';

        }


        if (calculationDifference) {

            calculationDifference.textContent =
                '—';

        }


        if (resultTitle) {

            resultTitle.textContent =
                'Nəticə';

        }


        if (resultValue) {

            resultValue.textContent =
                '—';

        }


        if (resultBox) {

            resultBox.classList.remove(
                'negative'
            );

        }


        if (resultIcon) {

            resultIcon.textContent =
                '↗';

        }


        return;

    }


    /* -----------------------------------------
       ÖDƏNİŞ ZAMANI
       ----------------------------------------- */

    const paymentAmount =
        operationAmount *
        paymentRateValue;


    /* -----------------------------------------
       MALIN İDXALI ZAMANI
       ----------------------------------------- */

    const importAmount =
        operationAmount *
        importRateValue;


    /* -----------------------------------------
       MƏZƏNNƏ FƏRQİ
       ----------------------------------------- */

    const difference =
        importAmount -
        paymentAmount;


    /* -----------------------------------------
       HESABLAMA SƏTRLƏRİ
       ----------------------------------------- */

    if (paymentCalculation) {

        paymentCalculation.textContent =
            `${operationAmount.toFixed(2)} ${selectedCurrency} × ${paymentRateValue.toFixed(4)} = ${paymentAmount.toFixed(2)} AZN`;

    }


    if (importCalculation) {

        importCalculation.textContent =
            `${operationAmount.toFixed(2)} ${selectedCurrency} × ${importRateValue.toFixed(4)} = ${importAmount.toFixed(2)} AZN`;

    }


    /* =====================================================
       MÜSBƏT MƏZƏNNƏ FƏRQİ
       ===================================================== */

    if (difference > 0) {

        if (calculationDifference) {

            calculationDifference.textContent =
                `+${difference.toFixed(2)} AZN`;

            calculationDifference.style.color =
                '#11823e';

        }


        if (resultBox) {

            resultBox.classList.remove(
                'negative'
            );

        }


        if (resultIcon) {

            resultIcon.textContent =
                '↗';

        }


        if (resultTitle) {

            resultTitle.textContent =
                'Xarici valyutaların manata nisbətən müsbət məzənnə fərqi';

        }


        if (resultValue) {

            resultValue.textContent =
                `+${difference.toFixed(2)} AZN`;

        }

    }


    /* =====================================================
       MƏNFI MƏZƏNNƏ FƏRQİ
       ===================================================== */

    else if (difference < 0) {

        if (calculationDifference) {

            calculationDifference.textContent =
                `${difference.toFixed(2)} AZN`;

            calculationDifference.style.color =
                '#c92121';

        }


        if (resultBox) {

            resultBox.classList.add(
                'negative'
            );

        }


        if (resultIcon) {

            resultIcon.textContent =
                '↘';

        }


        if (resultTitle) {

            resultTitle.textContent =
                'Xarici valyutaların manata nisbətən mənfi məzənnə fərqi';

        }


        if (resultValue) {

            resultValue.textContent =
                `${difference.toFixed(2)} AZN`;

        }

    }


    /* =====================================================
       MƏZƏNNƏ FƏRQİ YOXDUR
       ===================================================== */

    else {

        if (calculationDifference) {

            calculationDifference.textContent =
                '0.00 AZN';

            calculationDifference.style.color =
                '#13233e';

        }


        if (resultBox) {

            resultBox.classList.remove(
                'negative'
            );

        }


        if (resultIcon) {

            resultIcon.textContent =
                '→';

        }


        if (resultTitle) {

            resultTitle.textContent =
                'Xarici valyutaların manata nisbətən məzənnə fərqi yoxdur';

        }


        if (resultValue) {

            resultValue.textContent =
                '0.00 AZN';

        }

    }

}


/* =========================================================
   8. VALYUTA DƏYİŞDİKDƏ
   ========================================================= */

if (currency) {

    currency.addEventListener(
        'change',
        async () => {

            currencyLabel.textContent =
                currency.value;


            paymentRateValue = null;

            importRateValue = null;


            paymentRate.textContent =
                '—';

            importRate.textContent =
                '—';


            calculateResult();


            if (paymentDate.value) {

                await loadPaymentRate();

            }


            if (importDate.value) {

                await loadImportRate();

            }

        }
    );

}


/* =========================================================
   9. ÖDƏNİŞ TARİXİ
   ========================================================= */

if (paymentDate) {

    paymentDate.addEventListener(
        'change',
        loadPaymentRate
    );

}


/* =========================================================
   10. İDXAL TARİXİ
   ========================================================= */

if (importDate) {

    importDate.addEventListener(
        'change',
        loadImportRate
    );

}


/* =========================================================
   11. MƏBLƏĞ
   ========================================================= */

if (amount) {

    amount.addEventListener(
        'input',
        calculateResult
    );

}


/* =========================================================
   12. SƏHİFƏ AÇILANDA HEADER-İ YÜKLƏ
   ========================================================= */
/* =========================================================
   13. SƏHİFƏ AÇILANDA MƏZƏNNƏLƏRİ YÜKLƏ
   ========================================================= */

if (currency) {
    currencyLabel.textContent = currency.value;
}

if (paymentDate && paymentDate.value) {
    loadPaymentRate();
}

if (importDate && importDate.value) {
    loadImportRate();
}