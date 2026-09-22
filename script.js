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
    ? '../header.html?v=4'
    : './header.html?v=4';

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
   VAHİD FOOTER-İ BÜTÜN SƏHİFƏLƏRƏ YÜKLƏ
   ========================================================= */

async function loadFooter() {

    const footer = document.querySelector('footer.footer');

    if (!footer) {
        return;
    }

    try {
        const response = await fetch('/footer.html?v=20260919-tools-menu');

        if (!response.ok) {
            throw new Error(`footer.html yüklənmədi: ${response.status}`);
        }

        footer.outerHTML = await response.text();
    }

    catch (error) {
        console.error('Footer xətası:', error);
    }
}

loadFooter();

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

/* =========================================================
   14. ƏMƏK HAQQI KALKULYATORU
   2026-cı il üzrə ilkin gross → net hesablaması.
   ========================================================= */

const salaryGross =
    document.getElementById('salary-gross');

const salarySector =
    document.getElementById('salary-sector');

const salaryHeroExemption =
    document.getElementById('legacy-salary-hero-exemption');

const salaryGrossResult =
    document.getElementById('salary-gross-result');

const salaryBasicExemptionResult =
    document.getElementById('salary-basic-exemption-result');

const salaryHeroExemptionResult =
    document.getElementById('salary-hero-exemption-result');

const salaryTaxableResult =
    document.getElementById('salary-taxable-result');

const salaryTaxResult =
    document.getElementById('salary-tax-result');

const salarySocialResult =
    document.getElementById('salary-social-result');

const salaryMedicalResult =
    document.getElementById('salary-medical-result');

const salaryUnemploymentResult =
    document.getElementById('salary-unemployment-result');

const salaryTotalResult =
    document.getElementById('salary-total-result');

const salaryNetResult =
    document.getElementById('salary-net-result');


function formatAZN(value) {

    return new Intl.NumberFormat(
        'az-AZ',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(Math.max(0, value)) + ' AZN';

}

function formatImportCustomsAZN(value) {
    return formatAZN(value).replace(/ AZN$/, ' ₼');
}

function formatImportCustomsAmount(value) {
    return formatAZN(value).replace(/ AZN$/, '');
}


function calculateSalary() {

    if (
        !salaryGross ||
        !salarySector ||
        !salaryHeroExemption
    ) {

        return;

    }


    const gross =
        Math.max(0, parseFloat(salaryGross.value) || 0);

    const sector =
        salarySector.value;

    const heroExemption =
        salaryHeroExemption.checked ? 400 : 0;

    /* Əsas iş yerində 2500 AZN-dək gəlirin 200 AZN hissəsi azaddır. */
    const basicExemption =
        gross > 0 && gross <= 2500 ? Math.min(gross, 200) : 0;

    const taxableIncome =
        Math.max(
            0,
            gross - basicExemption - heroExemption
        );

    let incomeTax = 0;

    if (sector === 'private') {

        if (taxableIncome <= 2500) {
            incomeTax = taxableIncome * 0.03;
        }

        else if (taxableIncome <= 8000) {
            incomeTax = 75 + (taxableIncome - 2500) * 0.10;
        }

        else {
            incomeTax = 625 + (taxableIncome - 8000) * 0.14;
        }

    }

    else {

        if (taxableIncome <= 2500) {
            incomeTax = taxableIncome * 0.14;
        }

        else {
            incomeTax = 350 + (taxableIncome - 2500) * 0.25;
        }

    }


    let socialInsurance = 0;

    if (sector === 'private') {

        if (gross <= 200) {
            socialInsurance = gross * 0.03;
        }

        else if (gross <= 8000) {
            socialInsurance = 6 + (gross - 200) * 0.10;
        }

        else {
            socialInsurance = 786 + (gross - 8000) * 0.10;
        }

    }

    else {
        socialInsurance = gross * 0.03;
    }


    let medicalInsurance = 0;

    if (sector === 'private') {

        if (gross <= 2500) {
            medicalInsurance = gross * 0.02;
        }

        else {
            medicalInsurance = 50 + (gross - 2500) * 0.005;
        }

    }

    else {

        if (gross <= 8000) {
            medicalInsurance = gross * 0.02;
        }

        else {
            medicalInsurance = 160 + (gross - 8000) * 0.005;
        }

    }


    const unemploymentInsurance =
        gross * 0.005;

    const totalDeductions =
        incomeTax +
        socialInsurance +
        medicalInsurance +
        unemploymentInsurance;

    const netSalary =
        Math.max(0, gross - totalDeductions);


    if (salaryGrossResult) {
        salaryGrossResult.textContent = formatAZN(gross);
    }

    if (salaryBasicExemptionResult) {
        salaryBasicExemptionResult.textContent = formatAZN(basicExemption);
    }

    if (salaryHeroExemptionResult) {
        salaryHeroExemptionResult.textContent = formatAZN(heroExemption);
    }

    if (salaryTaxableResult) {
        salaryTaxableResult.textContent = formatAZN(taxableIncome);
    }

    if (salaryTaxResult) {
        salaryTaxResult.textContent = formatAZN(incomeTax);
    }

    if (salarySocialResult) {
        salarySocialResult.textContent = formatAZN(socialInsurance);
    }

    if (salaryMedicalResult) {
        salaryMedicalResult.textContent = formatAZN(medicalInsurance);
    }

    if (salaryUnemploymentResult) {
        salaryUnemploymentResult.textContent = formatAZN(unemploymentInsurance);
    }

    if (salaryTotalResult) {
        salaryTotalResult.textContent = formatAZN(totalDeductions);
    }

    if (salaryNetResult) {
        salaryNetResult.textContent = formatAZN(netSalary);
    }

}


if (salaryGross) {
    salaryGross.addEventListener('input', calculateSalary);
}

if (salarySector) {
    salarySector.addEventListener('change', calculateSalary);
}

if (salaryHeroExemption) {
    salaryHeroExemption.addEventListener('change', calculateSalary);
}

calculateSalary();

/* =========================================================
   15. ƏMƏK HAQQI KALKULYATORU — İLKİN MƏRHƏLƏ
   Yalnız gəlir vergisi və istifadəçinin qeyd etdiyi
   əlavə əmək haqqı tutulması hesablanır.
   ========================================================= */

const salaryTaxGross =
    document.getElementById('salary-gross');

const salaryCalculationMode =
    document.getElementById('salary-calculation-mode');

const salaryTaxSector =
    document.getElementById('salary-sector');

const salaryMainWorkplace =
    document.getElementById('salary-main-workplace');

const salaryWorkplaceStatus =
    document.getElementById('salary-workplace-status');

const salaryTaxExemptionOptions =
    document.querySelectorAll('input[name="salary-tax-exemption"]');

salaryTaxExemptionOptions.forEach((option) => {
    option.type = 'checkbox';
});

const salaryExemptionOptionLabels =
    document.querySelectorAll('.salary-exemption-option');

const salaryTaxExemptionsDetails =
    document.getElementById('salary-tax-exemptions');

const salarySelectedExemptionsBreakdown =
    document.getElementById('salary-selected-exemptions-breakdown');

const salaryExemptionBreakdown =
    document.querySelector('.salary-exemption-breakdown');

const salaryExemptionSearchInput =
    document.getElementById('salary-exemption-search-input');

const salaryExemptionSelectAll =
    document.getElementById('salary-exemption-select-all');

const salaryExemptionClose =
    document.getElementById('salary-exemption-close');

const salaryDeductionType =
    document.getElementById('salary-deduction-type');

const salaryOtherDeduction =
    document.getElementById('salary-other-deduction');

const salaryOtherDeductionSuffix =
    document.getElementById('salary-other-deduction-suffix');

function updateSalaryWorkplaceStatus() {
    if (!salaryMainWorkplace || !salaryWorkplaceStatus) {
        return;
    }

    const isMainWorkplace = salaryMainWorkplace.checked;
    salaryWorkplaceStatus.textContent = isMainWorkplace
        ? 'Əsas iş yeri'
        : 'Əlavə iş yeri';

    const workplaceOption =
        salaryMainWorkplace.closest('.salary-main-workplace-option');

    if (workplaceOption) {
        workplaceOption.classList.toggle(
            'is-additional-workplace',
            !isMainWorkplace
        );
    }

    const exemptionsDisabled = !isMainWorkplace;

    salaryTaxExemptionOptions.forEach((option) => {
        option.disabled = exemptionsDisabled;
    });

    if (salaryExemptionSelectAll) {
        salaryExemptionSelectAll.disabled = exemptionsDisabled;
    }

    if (salaryTaxExemptionsDetails) {
        salaryTaxExemptionsDetails.classList.toggle(
            'is-disabled',
            exemptionsDisabled
        );

        if (exemptionsDisabled) {
            salaryTaxExemptionsDetails.open = false;
        }
    }

    if (salaryExemptionBreakdown) {
        salaryExemptionBreakdown.classList.toggle(
            'is-not-applicable',
            exemptionsDisabled
        );
    }
}

function normalizeSalarySearchText(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[ə]/g, 'e')
        .replace(/[ı]/g, 'i')
        .replace(/[ş]/g, 's')
        .replace(/[ç]/g, 'c')
        .replace(/[ğ]/g, 'g')
        .replace(/[ö]/g, 'o')
        .replace(/[ü]/g, 'u');
}

function getSelectedSalaryTaxExemptions() {
    const selected = Array.from(salaryTaxExemptionOptions)
        .filter((option) => option.checked)
        .map((option) => ({
            code: option.dataset.code || '',
            value: Math.max(0, parseFloat(option.value) || 0),
            text: option.closest('.salary-exemption-option')?.textContent
                .replace(/\s+/g, ' ')
                .trim() || ''
        }));

    const largestOnlyGroup = selected.filter((item) =>
        item.code === 'VM 102.1-1' ||
        item.code.startsWith('VM 102.2.') ||
        item.code === 'VM 102.3' ||
        item.code.startsWith('VM 102.4.')
    );

    const otherGroup = selected.filter((item) => !largestOnlyGroup.includes(item));
    const largestOnly = largestOnlyGroup.length
        ? [largestOnlyGroup.reduce((largest, item) =>
            item.value > largest.value ? item : largest
        )]
        : [];

    const applicable = [...largestOnly, ...otherGroup];

    return {
        selected,
        applicable,
        total: applicable.reduce((sum, item) => sum + item.value, 0)
    };
}

function updateSelectedSalaryExemptionsBreakdown(items) {
    if (!salarySelectedExemptionsBreakdown) {
        return;
    }

    salarySelectedExemptionsBreakdown.innerHTML = items.length
        ? items.map((item) => `
            <div class="salary-tax-breakdown-row">
                <span>${item.code}</span>
                <strong>${formatSalaryAZN(item.value)}</strong>
            </div>
        `).join('')
        : '<div class="salary-tax-breakdown-row"><span>Güzəşt seçilməyib</span><strong>—</strong></div>';
}

function filterSalaryExemptionOptions() {
    const query = normalizeSalarySearchText(
        salaryExemptionSearchInput?.value
    ).trim();
    let visibleOptions = 0;

    salaryExemptionOptionLabels.forEach((optionLabel) => {
        const optionText = normalizeSalarySearchText(
            optionLabel.textContent
        );
        const queryParts = query.split(/\s+/).filter(Boolean);
        const matches = !query || queryParts.every((part) => optionText.includes(part));

        optionLabel.hidden = !matches;

        if (matches) {
            visibleOptions += 1;
        }
    });

    updateSalaryExemptionSelectAllState();
}

function updateSalaryExemptionSelectAllState() {
    if (!salaryExemptionSelectAll) {
        return;
    }

    const options = Array.from(salaryTaxExemptionOptions);
    const selectedCount = options.filter((option) => option.checked).length;

    salaryExemptionSelectAll.checked =
        options.length > 0 && selectedCount === options.length;
    salaryExemptionSelectAll.indeterminate =
        selectedCount > 0 && selectedCount < options.length;
}

const salaryTaxGrossResult =
    document.getElementById('salary-gross-result');

const salaryStageBasicExemptionResult =
    document.getElementById('salary-basic-exemption-result');

const salaryBasicExemptionRow =
    document.getElementById('salary-basic-exemption-row');

const salaryHeroTaxExemptionResult =
    document.getElementById('salary-hero-tax-exemption-result');

const salaryExemptionSelection =
    document.getElementById('salary-exemption-selection');

const salaryStageTaxableResult =
    document.getElementById('salary-taxable-result');

const salaryStageTaxResult =
    document.getElementById('salary-tax-result');

const salaryOtherDeductionResult =
    document.getElementById('salary-other-deduction-result');

const salarySocialInsuranceResult =
    document.getElementById('salary-social-result');

const salaryUnemploymentInsuranceResult =
    document.getElementById('salary-unemployment-result');

const salaryMedicalInsuranceResult =
    document.getElementById('salary-medical-result');

const salaryTotalTaxResult =
    document.getElementById('salary-total-result');

const salaryNetTaxResult =
    document.getElementById('salary-net-result');

const salaryResultTitle =
    document.getElementById('salary-result-title');

const salaryTaxBreakdownBaseRow =
    document.getElementById('salary-tax-breakdown-base-row');

const salaryTaxBreakdownExtraRow =
    document.getElementById('salary-tax-breakdown-extra-row');

const salaryTaxBreakdownUpperRow =
    document.getElementById('salary-tax-breakdown-upper-row');

const salaryTaxBreakdownBaseAmount =
    document.getElementById('salary-tax-breakdown-base-amount');

const salaryTaxBreakdownBaseRate =
    document.getElementById('salary-tax-breakdown-base-rate');

const salaryTaxBreakdownBaseResult =
    document.getElementById('salary-tax-breakdown-base-result');

const salaryTaxBreakdownExtraAmount =
    document.getElementById('salary-tax-breakdown-extra-amount');

const salaryTaxBreakdownExtraRate =
    document.getElementById('salary-tax-breakdown-extra-rate');

const salaryTaxBreakdownExtraResult =
    document.getElementById('salary-tax-breakdown-extra-result');

const salaryTaxBreakdownUpperAmount =
    document.getElementById('salary-tax-breakdown-upper-amount');

const salaryTaxBreakdownUpperRate =
    document.getElementById('salary-tax-breakdown-upper-rate');

const salaryTaxBreakdownUpperResult =
    document.getElementById('salary-tax-breakdown-upper-result');

const salaryTaxBreakdownTotal =
    document.getElementById('salary-tax-breakdown-total');

const salarySocialBreakdownLabel =
    document.getElementById('salary-social-breakdown-label');

const salarySocialBreakdownResult =
    document.getElementById('salary-social-breakdown-result');

const salaryUnemploymentBreakdownLabel =
    document.getElementById('salary-unemployment-breakdown-label');

const salaryUnemploymentBreakdownResult =
    document.getElementById('salary-unemployment-breakdown-result');

const salaryMedicalBreakdownLabel =
    document.getElementById('salary-medical-breakdown-label');

const salaryMedicalBreakdownResult =
    document.getElementById('salary-medical-breakdown-result');


function formatSalaryAZN(value) {

    return new Intl.NumberFormat(
        'az-AZ',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(Math.max(0, value)) + ' AZN';

}

function updateSalaryTaxBreakdown(sector, taxableIncome, incomeTax) {
    const hide = (row, value) => {
        if (row) {
            row.hidden = value;
        }
    };

    hide(salaryTaxBreakdownBaseRow, false);
    hide(salaryTaxBreakdownExtraRow, true);
    hide(salaryTaxBreakdownUpperRow, true);

    if (sector === 'private') {
        if (taxableIncome <= 2500) {
            salaryTaxBreakdownBaseAmount.textContent = formatSalaryAZN(taxableIncome);
            salaryTaxBreakdownBaseRate.textContent = '3%';
            salaryTaxBreakdownBaseResult.textContent = formatSalaryAZN(incomeTax);
        } else {
            salaryTaxBreakdownBaseAmount.textContent = formatSalaryAZN(2500);
            salaryTaxBreakdownBaseRate.textContent = '3%';
            salaryTaxBreakdownBaseResult.textContent = formatSalaryAZN(75);

            const middleAmount = Math.min(taxableIncome, 8000) - 2500;
            salaryTaxBreakdownExtraAmount.textContent = formatSalaryAZN(middleAmount);
            salaryTaxBreakdownExtraRate.textContent = '10%';
            salaryTaxBreakdownExtraResult.textContent = formatSalaryAZN(middleAmount * 0.10);
            hide(salaryTaxBreakdownExtraRow, false);

            if (taxableIncome > 8000) {
                const upperAmount = taxableIncome - 8000;
                salaryTaxBreakdownUpperAmount.textContent = formatSalaryAZN(upperAmount);
                salaryTaxBreakdownUpperRate.textContent = '14%';
                salaryTaxBreakdownUpperResult.textContent = formatSalaryAZN(upperAmount * 0.14);
                hide(salaryTaxBreakdownUpperRow, false);
            }
        }
    } else if (taxableIncome <= 2500) {
        salaryTaxBreakdownBaseAmount.textContent = formatSalaryAZN(taxableIncome);
        salaryTaxBreakdownBaseRate.textContent = '14%';
        salaryTaxBreakdownBaseResult.textContent = formatSalaryAZN(incomeTax);
    } else {
        salaryTaxBreakdownBaseAmount.textContent = formatSalaryAZN(2500);
        salaryTaxBreakdownBaseRate.textContent = '14%';
        salaryTaxBreakdownBaseResult.textContent = formatSalaryAZN(350);

        salaryTaxBreakdownExtraAmount.textContent = formatSalaryAZN(taxableIncome - 2500);
        salaryTaxBreakdownExtraRate.textContent = '25%';
        salaryTaxBreakdownExtraResult.textContent = formatSalaryAZN((taxableIncome - 2500) * 0.25);
        hide(salaryTaxBreakdownExtraRow, false);
    }

    if (salaryTaxBreakdownTotal) {
        salaryTaxBreakdownTotal.textContent = formatSalaryAZN(incomeTax);
    }
}


function updateSalaryInsuranceBreakdowns(
    sector,
    gross,
    socialInsurance,
    unemploymentInsurance,
    medicalInsurance
) {
    if (salarySocialBreakdownLabel) {
        if (sector === 'private') {
            if (gross <= 200) {
                salarySocialBreakdownLabel.textContent =
                    `${formatSalaryAZN(gross)} × 3%`;
            } else if (gross <= 8000) {
                salarySocialBreakdownLabel.textContent =
                    `${formatSalaryAZN(200)} × 3% + ${formatSalaryAZN(gross - 200)} × 10%`;
            } else {
                salarySocialBreakdownLabel.textContent =
                    `786,00 AZN + ${formatSalaryAZN(gross - 8000)} × 10%`;
            }
        } else {
            salarySocialBreakdownLabel.textContent =
                `${formatSalaryAZN(gross)} × 3%`;
        }
    }

    if (salarySocialBreakdownResult) {
        salarySocialBreakdownResult.textContent =
            formatSalaryAZN(socialInsurance);
    }

    if (salaryUnemploymentBreakdownLabel) {
        salaryUnemploymentBreakdownLabel.textContent =
            `${formatSalaryAZN(gross)} × 0,5%`;
    }

    if (salaryUnemploymentBreakdownResult) {
        salaryUnemploymentBreakdownResult.textContent =
            formatSalaryAZN(unemploymentInsurance);
    }

    if (salaryMedicalBreakdownLabel) {
        const medicalLimit = sector === 'private' ? 2500 : 8000;

        salaryMedicalBreakdownLabel.textContent = gross <= medicalLimit
            ? `${formatSalaryAZN(gross)} × 2%`
            : `${formatSalaryAZN(medicalLimit)} × 2% + ${formatSalaryAZN(gross - medicalLimit)} × 0,5%`;
    }

    if (salaryMedicalBreakdownResult) {
        salaryMedicalBreakdownResult.textContent =
            formatSalaryAZN(medicalInsurance);
    }
}


function updateSalaryDeductionSuffix() {

    if (!salaryDeductionType || !salaryOtherDeductionSuffix) {
        return;
    }

    salaryOtherDeductionSuffix.textContent =
        salaryDeductionType.value === 'percent' ? '%' : 'AZN';

}


function getSalaryCalculation(
    gross,
    sector,
    mainWorkplace,
    taxExemption,
    deductionType,
    enteredDeduction
) {

    const basicExemption =
        mainWorkplace && gross > 0 && gross <= 2500
            ? Math.min(gross, 200)
            : 0;

    const taxableIncome =
        Math.max(
            0,
            gross - basicExemption - taxExemption
        );

    let incomeTax = 0;

    if (sector === 'private') {

        if (taxableIncome <= 2500) {
            incomeTax = taxableIncome * 0.03;
        }

        else if (taxableIncome <= 8000) {
            incomeTax = 75 + (taxableIncome - 2500) * 0.10;
        }

        else {
            incomeTax = 625 + (taxableIncome - 8000) * 0.14;
        }

    }

    else if (taxableIncome <= 2500) {
        incomeTax = taxableIncome * 0.14;
    }

    else {
        incomeTax = 350 + (taxableIncome - 2500) * 0.25;
    }

    const otherDeduction =
        deductionType === 'percent'
            ? gross * enteredDeduction / 100
            : enteredDeduction;

    const limitedOtherDeduction =
        Math.min(gross, otherDeduction);

    const socialInsurance = sector === 'private'
        ? Math.min(gross, 200) * 0.03 + Math.max(0, gross - 200) * 0.10
        : gross * 0.03;

    const unemploymentInsurance = gross * 0.005;

    const medicalInsurance = sector === 'private'
        ? Math.min(gross, 2500) * 0.02 + Math.max(0, gross - 2500) * 0.005
        : Math.min(gross, 8000) * 0.02 + Math.max(0, gross - 8000) * 0.005;

    const totalDeductions =
        Math.min(
            gross,
            incomeTax +
            socialInsurance +
            unemploymentInsurance +
            medicalInsurance +
            limitedOtherDeduction
        );

    return {
        gross,
        basicExemption,
        taxableIncome,
        incomeTax,
        socialInsurance,
        unemploymentInsurance,
        medicalInsurance,
        limitedOtherDeduction,
        totalDeductions,
        netSalary: Math.max(0, gross - totalDeductions)
    };

}


function findGrossFromNet(targetNet, calculationOptions) {

    if (targetNet <= 0) {
        return 0;
    }

    const calculateNet = (gross) =>
        getSalaryCalculation(
            gross,
            calculationOptions.sector,
            calculationOptions.mainWorkplace,
            calculationOptions.taxExemption,
            calculationOptions.deductionType,
            calculationOptions.enteredDeduction
        ).netSalary;

    const findInRange = (minimumGross, maximumGross) => {

        if (calculateNet(maximumGross) < targetNet) {
            return null;
        }

        let low = minimumGross;
        let high = maximumGross;

        for (let step = 0; step < 80; step += 1) {

            const middle = (low + high) / 2;

            if (calculateNet(middle) >= targetNet) {
                high = middle;
            }

            else {
                low = middle;
            }

        }

        return high;

    };

    const possibleGrossValues = [];
    const grossBelowExemptionLimit = findInRange(0, 2500);

    if (grossBelowExemptionLimit !== null) {
        possibleGrossValues.push(grossBelowExemptionLimit);
    }

    let maximumGross = Math.max(5000, targetNet * 2 + 1000);

    while (calculateNet(maximumGross) < targetNet && maximumGross < 1000000000) {
        maximumGross *= 2;
    }

    const grossAboveExemptionLimit =
        findInRange(2500.000001, maximumGross);

    if (grossAboveExemptionLimit !== null) {
        possibleGrossValues.push(grossAboveExemptionLimit);
    }

    return possibleGrossValues.length
        ? Math.min(...possibleGrossValues)
        : null;

}


function calculateSalaryTaxOnly() {

    if (
        !salaryTaxGross ||
        !salaryCalculationMode ||
        !salaryTaxSector ||
        !salaryMainWorkplace ||
        !salaryTaxExemptionOptions.length ||
        !salaryDeductionType ||
        !salaryOtherDeduction
    ) {

        return;

    }


    const enteredIncome =
        Math.max(0, parseFloat(salaryTaxGross.value) || 0);

    const sector =
        salaryTaxSector.value;

    const selectedSalaryExemptions =
        getSelectedSalaryTaxExemptions();

    const taxExemption = salaryMainWorkplace.checked
        ? selectedSalaryExemptions.total
        : 0;

    const enteredDeduction =
        Math.max(0, parseFloat(salaryOtherDeduction.value) || 0);

    const calculationOptions = {
        sector,
        mainWorkplace: salaryMainWorkplace.checked,
        taxExemption,
        deductionType: salaryDeductionType.value,
        enteredDeduction
    };

    const gross = salaryCalculationMode.value === 'net'
        ? findGrossFromNet(enteredIncome, calculationOptions)
        : enteredIncome;

    if (gross === null) {

        [
            salaryTaxGrossResult,
            salaryStageBasicExemptionResult,
            salaryHeroTaxExemptionResult,
            salaryStageTaxableResult,
            salaryStageTaxResult,
            salarySocialInsuranceResult,
            salaryUnemploymentInsuranceResult,
            salaryMedicalInsuranceResult,
            salaryOtherDeductionResult,
            salaryTotalTaxResult,
            salaryNetTaxResult
        ].forEach((element) => {
            if (element) {
                element.textContent = '—';
            }
        });

        if (salaryResultTitle) {
            salaryResultTitle.textContent = 'Bu net məbləğ hesablana bilmir';
        }

        return;

    }

    const {
        basicExemption,
        taxableIncome,
        incomeTax,
        socialInsurance,
        unemploymentInsurance,
        medicalInsurance,
        limitedOtherDeduction,
        totalDeductions,
        netSalary
    } = getSalaryCalculation(
        gross,
        calculationOptions.sector,
        calculationOptions.mainWorkplace,
        calculationOptions.taxExemption,
        calculationOptions.deductionType,
        calculationOptions.enteredDeduction
    );


    if (salaryTaxGrossResult) {
        salaryTaxGrossResult.textContent = formatSalaryAZN(gross);
    }

    if (salaryStageBasicExemptionResult) {
        salaryStageBasicExemptionResult.textContent = formatSalaryAZN(basicExemption);
    }

    if (salaryBasicExemptionRow) {
        salaryBasicExemptionRow.classList.toggle(
            'is-not-applicable',
            gross > 2500 || !calculationOptions.mainWorkplace
        );
    }

    if (salaryHeroTaxExemptionResult) {
        salaryHeroTaxExemptionResult.textContent = formatSalaryAZN(taxExemption);
    }

    updateSelectedSalaryExemptionsBreakdown(
        salaryMainWorkplace.checked
            ? selectedSalaryExemptions.applicable
            : []
    );

    if (salaryExemptionSelection) {
        salaryExemptionSelection.textContent = taxExemption
            ? `${selectedSalaryExemptions.applicable.length} seçim (${formatSalaryAZN(taxExemption)})`
            : 'Seçilməyib';
    }

    if (salaryStageTaxableResult) {
        salaryStageTaxableResult.textContent = formatSalaryAZN(taxableIncome);
    }

    if (salaryStageTaxResult) {
        salaryStageTaxResult.textContent = formatSalaryAZN(incomeTax);
    }

    updateSalaryTaxBreakdown(
        calculationOptions.sector,
        taxableIncome,
        incomeTax
    );

    if (salaryOtherDeductionResult) {
        salaryOtherDeductionResult.textContent = formatSalaryAZN(limitedOtherDeduction);
    }

    if (salarySocialInsuranceResult) {
        salarySocialInsuranceResult.textContent = formatSalaryAZN(socialInsurance);
    }

    if (salaryUnemploymentInsuranceResult) {
        salaryUnemploymentInsuranceResult.textContent = formatSalaryAZN(unemploymentInsurance);
    }

    if (salaryMedicalInsuranceResult) {
        salaryMedicalInsuranceResult.textContent = formatSalaryAZN(medicalInsurance);
    }

    updateSalaryInsuranceBreakdowns(
        calculationOptions.sector,
        gross,
        socialInsurance,
        unemploymentInsurance,
        medicalInsurance
    );

    if (salaryTotalTaxResult) {
        salaryTotalTaxResult.textContent = formatSalaryAZN(totalDeductions);
    }

    if (salaryNetTaxResult) {
        salaryNetTaxResult.textContent = formatSalaryAZN(
            salaryCalculationMode.value === 'net'
                ? gross
                : netSalary
        );
    }

    if (salaryResultTitle) {
        salaryResultTitle.textContent =
            salaryCalculationMode.value === 'net'
                ? 'Hesablanmış gross əmək haqqı'
                : 'İşçinin alacağı net əmək haqqı';
    }

}


if (salaryTaxGross) {
    salaryTaxGross.addEventListener('input', calculateSalaryTaxOnly);
}

if (salaryCalculationMode) {
    salaryCalculationMode.addEventListener('change', calculateSalaryTaxOnly);
}

if (salaryTaxSector) {
    salaryTaxSector.addEventListener('change', calculateSalaryTaxOnly);
}

if (salaryMainWorkplace) {
    salaryMainWorkplace.addEventListener('change', () => {
        updateSalaryWorkplaceStatus();
        calculateSalaryTaxOnly();
    });
}

salaryTaxExemptionOptions.forEach((option) => {
    option.addEventListener('change', () => {
        updateSalaryExemptionSelectAllState();
        calculateSalaryTaxOnly();
    });
});

if (salaryExemptionSelectAll) {
    salaryExemptionSelectAll.addEventListener('change', () => {
        salaryTaxExemptionOptions.forEach((option) => {
            option.checked = salaryExemptionSelectAll.checked;
        });

        updateSalaryExemptionSelectAllState();
        calculateSalaryTaxOnly();
    });
}

if (salaryExemptionClose && salaryTaxExemptionsDetails) {
    salaryExemptionClose.addEventListener('click', () => {
        salaryTaxExemptionsDetails.open = false;
    });
}

if (salaryDeductionType) {
    salaryDeductionType.addEventListener('change', () => {
        updateSalaryDeductionSuffix();
        calculateSalaryTaxOnly();
    });
}

if (salaryOtherDeduction) {
    salaryOtherDeduction.addEventListener('input', calculateSalaryTaxOnly);
}

updateSalaryDeductionSuffix();
updateSalaryWorkplaceStatus();
filterSalaryExemptionOptions();
calculateSalaryTaxOnly();

const salaryBreakdownSummaries =
    document.querySelectorAll('.salary-tax-breakdown-inline summary');

salaryBreakdownSummaries.forEach((summary) => {
    const breakdown = summary.closest('details');

    if (!breakdown) {
        return;
    }

    summary.addEventListener('click', (event) => {
        event.preventDefault();

        const currentScrollTop = window.scrollY;
        breakdown.open = !breakdown.open;

        requestAnimationFrame(() => {
            const previousScrollBehavior =
                document.documentElement.style.scrollBehavior;

            document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo(0, currentScrollTop);
            document.documentElement.style.scrollBehavior =
                previousScrollBehavior;
        });
    });
});

const calculatorCards =
    document.querySelectorAll('.calculator-grid .calculator-card');
const calculatorGrid = document.querySelector('.calculator-grid');

const calculatorPageIntro =
    document.querySelector('.calculator-page .section-head');

function renderCalculatorQuickNav(activeCard) {
    if (!calculatorGrid) {
        return;
    }

    calculatorGrid.querySelector('.calculator-quick-nav')?.remove();

    if (!activeCard) {
        return;
    }

    const quickNav = document.createElement('nav');
    quickNav.className = 'calculator-quick-nav';
    quickNav.setAttribute('aria-label', 'Digər kalkulyatorlar');

    const quickNavLabel = document.createElement('span');
    quickNavLabel.className = 'calculator-quick-nav-label';
    quickNavLabel.textContent = 'Digər kalkulyatorlar';

    const quickNavList = document.createElement('div');
    quickNavList.className = 'calculator-quick-nav-list';

    calculatorCards.forEach((otherCard) => {
        if (otherCard === activeCard) {
            return;
        }

        const otherTitle = otherCard.querySelector('.calculator-main-title');
        const otherIcon = otherCard.querySelector('.calculator-icon');
        const otherExpandButton = otherCard.querySelector('.calculator-expand');

        if (!otherTitle || !otherIcon || !otherExpandButton) {
            return;
        }

        const otherName = otherTitle.textContent.trim().replace(/\s+/g, ' ');
        const quickNavButton = document.createElement('button');
        quickNavButton.className = 'calculator-quick-nav-item';
        quickNavButton.type = 'button';
        quickNavButton.setAttribute('aria-label', `${otherName} kalkulyatorunu aç`);

        const quickNavIcon = document.createElement('span');
        quickNavIcon.className = 'calculator-quick-nav-icon';
        quickNavIcon.setAttribute('aria-hidden', 'true');
        quickNavIcon.textContent = otherIcon.textContent.trim();

        const quickNavName = document.createElement('span');
        quickNavName.textContent = otherName;

        quickNavButton.append(quickNavIcon, quickNavName);
        quickNavButton.addEventListener('click', () => {
            otherExpandButton.click();
        });
        quickNavList.appendChild(quickNavButton);
    });

    quickNav.append(quickNavLabel, quickNavList);
    calculatorGrid.prepend(quickNav);
}

function updateCalculatorPageIntro() {
    if (!calculatorPageIntro) {
        return;
    }

    const isCalculatorOpen = Array.from(calculatorCards)
        .some((card) => card.classList.contains('is-open'));

    calculatorGrid?.classList.toggle('has-open-card', isCalculatorOpen);
    renderCalculatorQuickNav(
        Array.from(calculatorCards).find((card) =>
            card.classList.contains('is-open')
        )
    );

    calculatorPageIntro.classList.toggle(
        'is-hidden',
        isCalculatorOpen
    );
}

calculatorCards.forEach((card) => {
    const expandButton = card.querySelector('.calculator-expand');
    const calculatorTitleArea =
        card.querySelector('.calculator-title > div:nth-child(2)');
    const calculatorIcon = card.querySelector('.calculator-icon');
    const calculatorAction = card.querySelector('.calculator-card-action');

    if (!expandButton) {
        return;
    }

    const toggleCalculatorCard = () => {
        if (card.classList.contains('is-open')) {
            return;
        }

        const shouldOpen = true;
        const calculatorTitle =
            card.querySelector('.calculator-main-title');

        if (shouldOpen) {
            calculatorCards.forEach((otherCard) => {
                if (otherCard === card || !otherCard.classList.contains('is-open')) {
                    return;
                }

                otherCard.classList.remove('is-open');

                const otherExpandButton =
                    otherCard.querySelector('.calculator-expand');
                otherExpandButton?.setAttribute('aria-expanded', 'false');

                const otherTitle =
                    otherCard.querySelector('.calculator-main-title');
                const otherAction =
                    otherCard.querySelector('.calculator-card-action');
                const otherActionLabel =
                    otherAction?.querySelector('.calculator-card-action-label');
                const otherActionArrow =
                    otherAction?.querySelector('span[aria-hidden="true"]');

                if (otherExpandButton && otherTitle) {
                    otherExpandButton.setAttribute(
                        'aria-label',
                        `${otherTitle.textContent.trim()} kalkulyatorunu aç`
                    );
                }

                if (otherActionLabel) {
                    otherActionLabel.textContent = 'Dərhal sına ';
                }
                if (otherActionArrow) {
                    otherActionArrow.textContent = '→';
                }
                if (otherAction && otherTitle) {
                    otherAction.setAttribute(
                        'aria-label',
                        `${otherTitle.textContent.trim()} sına`
                    );
                }
            });
        }

        card.classList.toggle('is-open', shouldOpen);
        expandButton.setAttribute(
            'aria-expanded',
            String(shouldOpen)
        );

        updateCalculatorPageIntro();

        if (calculatorTitle) {
            const calculatorName = calculatorTitle.textContent.trim();

            expandButton.setAttribute(
                'aria-label',
                shouldOpen
                    ? `${calculatorName} kalkulyatorunu yığ`
                    : `${calculatorName} kalkulyatorunu aç`
            );
        }

        if (calculatorAction) {
            const actionLabel = calculatorAction.querySelector(
                '.calculator-card-action-label'
            );
            const actionArrow = calculatorAction.querySelector(
                'span[aria-hidden="true"]'
            );

            if (actionLabel) {
                actionLabel.textContent = 'Dərhal sına ';
            }
            if (actionArrow) {
                actionArrow.textContent = '→';
            }
            calculatorAction.setAttribute(
                'aria-label',
                `${calculatorTitle?.textContent.trim() || 'Kalkulyatoru'} sına`
            );
        }

        if (shouldOpen) {
            calculatorGrid?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    expandButton.addEventListener('click', toggleCalculatorCard);

    if (calculatorTitleArea) {
        calculatorTitleArea.addEventListener('click', toggleCalculatorCard);
    }

    if (calculatorIcon) {
        calculatorIcon.addEventListener('click', toggleCalculatorCard);
    }

    if (calculatorAction) {
        calculatorAction.addEventListener('click', toggleCalculatorCard);
    }
});

updateCalculatorPageIntro();

const calculatorInfoDetails = document.querySelectorAll(
    '.calculator-page .salary-sector-info'
);

calculatorInfoDetails.forEach((detail) => {
    detail.addEventListener('toggle', () => {
        if (!detail.open) {
            return;
        }

        calculatorInfoDetails.forEach((otherDetail) => {
            if (otherDetail !== detail) {
                otherDetail.open = false;
            }
        });
    });
});

if (salaryExemptionSearchInput) {
    ['input', 'search', 'keyup'].forEach((eventName) => {
        salaryExemptionSearchInput.addEventListener(
            eventName,
            filterSalaryExemptionOptions
        );
    });
}

/* =========================================================
   XİDMƏTLƏRİMİZ - ACCORDION DAVRANIŞI
   Eyni anda yalnız bir xidmətin məlumatı açıq qalsın.
   ========================================================= */

const accordionDetails =
    document.querySelectorAll(
        '.service-grid details, .industry-grid details'
    );

if (accordionDetails.length) {
    document.addEventListener('click', (event) => {
        const summary = event.target.closest?.('summary');
        const detail = summary?.closest('details');

    if (!summary || !detail || !Array.from(accordionDetails).includes(detail)) {
            return;
        }

        event.preventDefault();

        const shouldOpen = !detail.open;

        accordionDetails.forEach((otherDetail) => {
            if (otherDetail !== detail) {
                otherDetail.open = false;
            }
        });

        detail.open = shouldOpen;
    });

    const accordionSections = Array.from(
        new Set(
            [
                ...Array.from(
                    document.querySelectorAll(
                        '.service-grid, .industry-grid'
                    )
                ).map((grid) => grid.closest('section')),
                document.querySelector('.outcomes-section')
            ].filter(Boolean)
        )
    );

    let activeAccordionSection = null;

    const closeOpenAccordionDetails = () => {
        accordionDetails.forEach((detail) => {
            detail.open = false;
        });
    };

    const syncAccordionSection = () => {
        if (window.scrollY <= 80) {
            closeOpenAccordionDetails();
            activeAccordionSection = null;
            return;
        }

        const triggerLine = window.innerHeight * 0.45;
        let nextSection = null;

        accordionSections.forEach((section) => {
            const rect = section.getBoundingClientRect();

            if (rect.top <= triggerLine && rect.bottom > triggerLine) {
                nextSection = section;
            }
        });

        if (
            nextSection &&
            activeAccordionSection &&
            nextSection !== activeAccordionSection
        ) {
            closeOpenAccordionDetails();
        }

        if (nextSection) {
            activeAccordionSection = nextSection;
        }
    };

    window.addEventListener('scroll', syncAccordionSection, {
        passive: true
    });

    window.addEventListener('resize', syncAccordionSection);

    syncAccordionSection();
}

/* =========================================================
   YIĞIM HƏYAT SIĞORTASI KALKULYATORU
   Excel-dəki 2026–2028 qaydalarının veb tətbiqi.
   ========================================================= */

const lifeSavingsMode =
    document.getElementById('life-savings-mode');
const lifeSavingsYear =
    document.getElementById('life-savings-year');
const lifeSavingsSector =
    document.getElementById('life-savings-sector');
const lifeSavingsWorkplace =
    document.getElementById('life-savings-workplace');
const lifeSavingsUnion =
    document.getElementById('life-savings-union');
const lifeSavingsOtherDeductionType =
    document.getElementById('life-savings-other-deduction-type');
const lifeSavingsOtherDeduction =
    document.getElementById('life-savings-other-deduction');
const lifeSavingsOtherDeductionSuffix =
    document.getElementById('life-savings-other-deduction-suffix');
const lifeSavingsGrossSalary =
    document.getElementById('life-savings-gross-salary');
const lifeSavingsGrossSalaryField =
    lifeSavingsGrossSalary?.closest('.life-savings-field');
const lifeSavingsAmount =
    document.getElementById('life-savings-amount');
const lifeSavingsInsuranceAmount =
    document.getElementById('life-savings-insurance-amount');
const lifeSavingsInsuranceField =
    lifeSavingsInsuranceAmount?.closest('.life-savings-insurance-field');
const lifeSavingsAmountLabel =
    document.getElementById('life-savings-amount-label');
const lifeSavingsInsuranceAmountLabel =
    document.getElementById('life-savings-insurance-amount-label');
const lifeSavingsPrimaryLabel =
    document.getElementById('life-savings-primary-label');
const lifeSavingsPrimaryResult =
    document.getElementById('life-savings-primary-result');
const lifeSavingsInsuranceLabel =
    document.getElementById('life-savings-insurance-label');
const lifeSavingsInsuranceResult =
    document.getElementById('life-savings-insurance-result');
const lifeSavingsEmployerLabel =
    document.getElementById('life-savings-employer-label');
const lifeSavingsEmployerResult =
    document.getElementById('life-savings-employer-result');
const lifeSavingsSupergrossLabel =
    document.getElementById('life-savings-supergross-label');
const lifeSavingsSupergrossResult =
    document.getElementById('life-savings-supergross-result');
const lifeSavingsIncomeTaxResult =
    document.getElementById('life-savings-income-tax-result');
const lifeSavingsSocialResult =
    document.getElementById('life-savings-social-result');
const lifeSavingsUnemploymentResult =
    document.getElementById('life-savings-unemployment-result');
const lifeSavingsMedicalResult =
    document.getElementById('life-savings-medical-result');
const lifeSavingsInsuranceUnemploymentResult =
    document.getElementById('life-savings-insurance-unemployment-result');
const lifeSavingsInsuranceMedicalResult =
    document.getElementById('life-savings-insurance-medical-result');
const lifeSavingsUnionResult =
    document.getElementById('life-savings-union-result');
const lifeSavingsOtherDeductionResult =
    document.getElementById('life-savings-other-deduction-result');
const lifeSavingsInsuranceDeductionsResult =
    document.getElementById('life-savings-insurance-deductions-result');
const lifeSavingsDeductionsResult =
    document.getElementById('life-savings-deductions-result');
const lifeSavingsResultTitle =
    document.getElementById('life-savings-result-title');
const lifeSavingsNetResult =
    document.getElementById('life-savings-net-result');
const lifeSavingsNote =
    document.querySelector('.life-savings-note');

let lifeSavingsNetInsuranceManuallyChanged = false;

const lifeSavingsRound = (value) =>
    Math.round((Number(value) + 1e-9) * 100) / 100;

function lifeSavingsYearTaxRate(year) {
    return {
        2026: 0.03,
        2027: 0.05,
        2028: 0.07
    }[year] ?? 0.03;
}

function lifeSavingsSalaryTax(
    grossSalary,
    sector,
    year,
    totalMonthlyIncome = grossSalary,
    workplace = 'main'
) {
    const gross = Math.max(0, grossSalary);
    const monthlyIncome = Math.max(0, totalMonthlyIncome);
    const basicExemption =
        workplace === 'main' && monthlyIncome > 0 && monthlyIncome <= 2500
            ? Math.min(gross, 200)
            : 0;
    const taxableIncome = Math.max(0, gross - basicExemption);

    if (sector === 'private') {
        const lowerBandRate = lifeSavingsYearTaxRate(year);

        if (taxableIncome <= 2500) {
            return taxableIncome * lowerBandRate;
        }

        if (taxableIncome <= 8000) {
            return 2500 * lowerBandRate + (taxableIncome - 2500) * 0.10;
        }

        return 2500 * lowerBandRate + 5500 * 0.10 + (taxableIncome - 8000) * 0.14;
    }

    if (taxableIncome <= 2500) {
        return taxableIncome * 0.14;
    }

    return 2500 * 0.14 + (taxableIncome - 2500) * 0.25;
}

function lifeSavingsEmployeeSocial(grossSalary, sector) {
    const gross = Math.max(0, grossSalary);

    return sector === 'private'
        ? Math.min(gross, 200) * 0.03 + Math.max(0, gross - 200) * 0.10
        : gross * 0.03;
}

function lifeSavingsUnemployment(grossSalary) {
    return Math.max(0, grossSalary) * 0.005;
}

function lifeSavingsMedical(grossSalary, sector) {
    const gross = Math.max(0, grossSalary);
    const limit = sector === 'private' ? 2500 : 8000;

    return Math.min(gross, limit) * 0.02 + Math.max(0, gross - limit) * 0.005;
}

function lifeSavingsSalaryBreakdown(
    grossSalary,
    sector,
    year,
    unionRate,
    workplace = 'main'
) {
    const gross = Math.max(0, grossSalary);
    const incomeTax = lifeSavingsSalaryTax(
        gross,
        sector,
        year,
        gross,
        workplace
    );
    const social = lifeSavingsEmployeeSocial(gross, sector);
    const unemployment = lifeSavingsUnemployment(gross);
    const medical = lifeSavingsMedical(gross, sector);
    const union = gross * unionRate;
    const total = incomeTax + social + unemployment + medical + union;

    return {
        gross,
        incomeTax,
        social,
        unemployment,
        medical,
        union,
        total,
        net: Math.max(0, gross - total)
    };
}

function lifeSavingsBudgetAfterInsurance(
    grossSalary,
    grossInsurance,
    sector,
    year,
    unionRate,
    workplace = 'main',
    otherDeductionAmount = 0
) {
    const gross = Math.max(0, grossSalary);
    const insurance = Math.min(Math.max(0, grossInsurance), gross);
    const salaryPart = Math.max(0, gross - insurance);
    const otherDeduction = Math.min(
        gross,
        Math.max(0, Number(otherDeductionAmount) || 0)
    );
    // Vergi və DSMF sığortadan sonra qalan əməkhaqqı hissəsinə,
    // işsizlik və tibbi sığorta isə bütün gross əməkhaqqına tətbiq olunur.
    // 200 AZN əsas iş yeri güzəşti ümumi aylıq gəlir üzrə yoxlanılır.
    // Məsələn, 3 000 AZN gross və 500 AZN sığortada ümumi gəlir 2 500-dən
    // çox olduğu üçün 200 AZN güzəşt tətbiq edilmir: 2 500 × 3% = 75 AZN.
    const incomeTax = lifeSavingsSalaryTax(
        salaryPart,
        sector,
        year,
        gross,
        workplace
    );
    const social = lifeSavingsEmployeeSocial(salaryPart, sector);
    const salaryUnemployment = lifeSavingsUnemployment(gross);
    const salaryMedical = lifeSavingsMedical(gross, sector);
    const insuranceUnemployment = 0;
    const insuranceMedical = 0;
    // Həmkarlar ittifaqı tutulması ümumi gross əməkhaqqından hesablanır.
    const union = gross * unionRate;
    const total =
        incomeTax +
        social +
        salaryUnemployment +
        salaryMedical +
        insuranceUnemployment +
        insuranceMedical +
        union +
        otherDeduction;

    return {
        incomeTax,
        social,
        salaryUnemployment,
        salaryMedical,
        insuranceUnemployment,
        insuranceMedical,
        union,
        otherDeduction,
        total,
        netCash: Math.max(
            0,
            gross -
                insurance -
                incomeTax -
                social -
                salaryUnemployment -
                salaryMedical -
                union -
                otherDeduction
        )
    };
}

function lifeSavingsSalaryGrossFromNet(
    targetNet,
    sector,
    year,
    unionRate
) {
    const target = Math.max(0, targetNet);

    if (target === 0) {
        return 0;
    }

    let low = 0;
    let high = Math.max(1000, target * 2 + 1000);

    while (
        lifeSavingsSalaryBreakdown(high, sector, year, unionRate).net < target &&
        high < 1000000000
    ) {
        high *= 2;
    }

    for (let step = 0; step < 90; step += 1) {
        const middle = (low + high) / 2;
        const net = lifeSavingsSalaryBreakdown(
            middle,
            sector,
            year,
            unionRate
        ).net;

        if (net >= target) {
            high = middle;
        } else {
            low = middle;
        }
    }

    return high;
}

function lifeSavingsBands(sector, year) {
    const lowerBandRate = lifeSavingsYearTaxRate(year);

    return sector === 'private'
        ? [
            { low: 0, high: 200, tax: 0, social: 0.03, employer: 0.22 },
            { low: 200, high: 2500, tax: lowerBandRate, social: 0.10, employer: 0.15 },
            { low: 2500, high: 8000, tax: 0.10, social: 0.10, employer: 0.15 },
            { low: 8000, high: Infinity, tax: 0.14, social: 0.10, employer: 0.11 }
        ]
        : [
            { low: 0, high: 200, tax: 0, social: 0.03, employer: 0.22 },
            { low: 200, high: 2500, tax: 0.14, social: 0.03, employer: 0.22 },
            { low: 2500, high: 8000, tax: 0.25, social: 0.03, employer: 0.22 },
            { low: 8000, high: Infinity, tax: 0.25, social: 0.03, employer: 0.22 }
        ];
}

function lifeSavingsSegmentTotal(start, end, bands, getValue) {
    if (end <= start) {
        return 0;
    }

    return bands.reduce((total, band) => {
        const overlap = Math.max(
            0,
            Math.min(end, band.high) - Math.max(start, band.low)
        );

        return total + overlap * getValue(band);
    }, 0);
}

function lifeSavingsNetInsurance(
    grossSalary,
    grossInsurance,
    sector,
    year
) {
    const salary = Math.max(0, grossSalary);
    const insurance = Math.min(Math.max(0, grossInsurance), salary);
    const start = salary - insurance;
    const bands = lifeSavingsBands(sector, year);

    // İşsizlik və tibbi sığorta net sığorta haqqına daxil deyil;
    // onlar ayrıca nəticə kimi göstərilir.
    return lifeSavingsSegmentTotal(
        start,
        salary,
        bands,
        (band) => 1 - band.tax - band.social
    );
}

function lifeSavingsGrossInsuranceFromNet(
    grossSalary,
    netInsurance,
    sector,
    year
) {
    const target = Math.max(0, netInsurance);
    let low = 0;
    let high = Math.max(0, grossSalary);

    for (let step = 0; step < 90; step += 1) {
        const middle = (low + high) / 2;
        const net = lifeSavingsNetInsurance(
            grossSalary,
            middle,
            sector,
            year
        );

        if (net >= target) {
            high = middle;
        } else {
            low = middle;
        }
    }

    return high;
}

function lifeSavingsSupergrossFromGross(
    grossSalary,
    grossInsurance,
    sector,
    year
) {
    const salary = Math.max(0, grossSalary);
    const insurance = Math.min(Math.max(0, grossInsurance), salary);

    if (sector === 'state') {
        return insurance * 1.22;
    }

    const start = salary - insurance;
    const bands = lifeSavingsBands(sector, year);

    return lifeSavingsSegmentTotal(
        start,
        salary,
        bands,
        (band) => 1 + band.employer
    );
}

function lifeSavingsGrossFromSupergross(
    grossSalary,
    supergrossInsurance,
    sector,
    year
) {
    const target = Math.max(0, supergrossInsurance);
    let low = 0;
    let high = Math.max(0, grossSalary);

    for (let step = 0; step < 90; step += 1) {
        const middle = (low + high) / 2;
        const supergross = lifeSavingsSupergrossFromGross(
            grossSalary,
            middle,
            sector,
            year
        );

        if (supergross >= target) {
            high = middle;
        } else {
            low = middle;
        }
    }

    return high;
}

function lifeSavingsMaximumGrossInsurance(grossSalary, sector) {
    // Mövcud Excel qaydasındakı maksimum qoşulma nisbəti hər iki sektor üçün
    // eyni tətbiq olunur; sektor fərqi isə tutulma dərəcələrində hesablanır.
    return lifeSavingsRound(Math.max(0, grossSalary) * 0.4643);
}

function setLifeSavingsResult(element, value) {
    if (element) {
        element.textContent = value === null
            ? '—'
            : formatSalaryAZN(lifeSavingsRound(value));
    }
}

function resetLifeSavingsDeductionDetails() {
    [
        lifeSavingsIncomeTaxResult,
        lifeSavingsSocialResult,
        lifeSavingsUnemploymentResult,
        lifeSavingsMedicalResult,
        lifeSavingsUnionResult,
        lifeSavingsInsuranceDeductionsResult
    ].forEach((element) => setLifeSavingsResult(element, null));
}

function getSelectedNetInsurance(
    grossSalary,
    sector,
    year,
    forceMaximum = false
) {
    const maximumGross = lifeSavingsMaximumGrossInsurance(
        grossSalary,
        sector
    );
    const maximumNet = lifeSavingsRound(
        lifeSavingsNetInsurance(grossSalary, maximumGross, sector, year)
    );

    if (!lifeSavingsInsuranceAmount) {
        return { maximumGross, maximumNet, selectedNet: 0 };
    }

    lifeSavingsInsuranceAmount.max = maximumNet.toFixed(2);

    const enteredNet = Math.max(
        0,
        Number(lifeSavingsInsuranceAmount.value) || 0
    );

    if (
        forceMaximum ||
        !lifeSavingsNetInsuranceManuallyChanged ||
        enteredNet > maximumNet
    ) {
        lifeSavingsInsuranceAmount.value = maximumNet.toFixed(2);
    }

    return {
        maximumGross,
        maximumNet,
        selectedNet: Math.min(
            maximumNet,
            Math.max(0, Number(lifeSavingsInsuranceAmount.value) || 0)
        )
    };
}

function updateLegacyLifeSavingsAmountLabel() {
    if (!lifeSavingsMode || !lifeSavingsAmountLabel) {
        return;
    }

    const labels = {
        'gross-salary-to-net': 'Gross əməkhaqqı',
        'net-salary-to-gross': 'Net əməkhaqqı',
        'gross-insurance-to-supergross': 'Gross sığorta haqqı',
        'supergross-to-gross-insurance': 'Supergross sığorta haqqı'
    };

    lifeSavingsAmountLabel.textContent =
        labels[lifeSavingsMode.value] || 'Hesablanan məbləğ';

    const isSalaryInsuranceMode =
        lifeSavingsMode.value === 'gross-salary-to-net';

    if (isSalaryInsuranceMode) {
        lifeSavingsAmountLabel.textContent = 'Aylıq gross əməkhaqqı';

        if (lifeSavingsSector) {
            lifeSavingsSector.value = 'private';
            lifeSavingsSector.disabled = true;
        }

        if (lifeSavingsInsuranceAmountLabel) {
            lifeSavingsInsuranceAmountLabel.textContent =
                'Net sığorta haqqı (kartdan ayrılan məbləğ)';
        }
    } else {
        if (lifeSavingsSector) {
            lifeSavingsSector.disabled = false;
        }

        if (lifeSavingsInsuranceAmountLabel) {
            lifeSavingsInsuranceAmountLabel.textContent =
                'Gross sığorta haqqı';
        }
    }

    if (lifeSavingsGrossSalaryField) {
        lifeSavingsGrossSalaryField.hidden =
            isSalaryInsuranceMode ||
            lifeSavingsMode.value === 'net-salary-to-gross';
    }

    if (lifeSavingsInsuranceField) {
        lifeSavingsInsuranceField.hidden =
            !isSalaryInsuranceMode &&
            lifeSavingsMode.value !== 'net-salary-to-gross';
    }
}

function calculateLegacyLifeSavings() {
    if (
        !lifeSavingsMode ||
        !lifeSavingsYear ||
        !lifeSavingsSector ||
        !lifeSavingsUnion ||
        !lifeSavingsGrossSalary ||
        !lifeSavingsAmount
    ) {
        return;
    }

    const mode = lifeSavingsMode.value;
    const year = Number(lifeSavingsYear.value);
    const sector = lifeSavingsSector.value;
    const unionRate = Number(lifeSavingsUnion.value) || 0;
    const enteredAmount = Math.max(0, Number(lifeSavingsAmount.value) || 0);
    const enteredGrossSalary = Math.max(
        0,
        Number(lifeSavingsGrossSalary.value) || 0
    );
    const enteredGrossInsurance = Math.max(
        0,
        Number(lifeSavingsInsuranceAmount?.value) || 0
    );

    if (mode === 'gross-salary-to-net') {
        const grossSalary = enteredAmount;
        const sector = 'private';
        const salaryResult = lifeSavingsSalaryBreakdown(
            grossSalary,
            sector,
            year,
            unionRate
        );
        const {
            maximumGross,
            maximumNet,
            selectedNet
        } = getSelectedNetInsurance(
            grossSalary,
            sector,
            year
        );
        const selectedGross = lifeSavingsGrossInsuranceFromNet(
            grossSalary,
            selectedNet,
            sector,
            year
        );
        const selectedSupergross = lifeSavingsSupergrossFromGross(
            grossSalary,
            selectedGross,
            sector,
            year
        );
        const insuranceDeductions = Math.max(
            0,
            selectedGross - selectedNet
        );
        const netSalaryAfterInsurance = Math.max(
            0,
            salaryResult.net - selectedNet
        );

        if (lifeSavingsPrimaryLabel) {
            lifeSavingsPrimaryLabel.textContent =
                'Maksimum net sığorta haqqı';
        }
        if (lifeSavingsInsuranceLabel) {
            lifeSavingsInsuranceLabel.textContent =
                'Maksimum gross sığorta haqqı';
        }
        if (lifeSavingsEmployerLabel) {
            lifeSavingsEmployerLabel.textContent =
                'Seçilmiş gross sığorta haqqı';
        }
        if (lifeSavingsSupergrossLabel) {
            lifeSavingsSupergrossLabel.textContent =
                'Seçilmiş sığorta üçün supergross məbləğ';
        }

        setLifeSavingsResult(lifeSavingsPrimaryResult, maximumNet);
        setLifeSavingsResult(lifeSavingsInsuranceResult, maximumGross);
        setLifeSavingsResult(lifeSavingsEmployerResult, selectedGross);
        setLifeSavingsResult(
            lifeSavingsSupergrossResult,
            selectedSupergross
        );
        setLifeSavingsResult(
            lifeSavingsIncomeTaxResult,
            salaryResult.incomeTax
        );
        setLifeSavingsResult(lifeSavingsSocialResult, salaryResult.social);
        setLifeSavingsResult(
            lifeSavingsUnemploymentResult,
            salaryResult.unemployment
        );
        setLifeSavingsResult(lifeSavingsMedicalResult, salaryResult.medical);
        setLifeSavingsResult(lifeSavingsUnionResult, salaryResult.union);
        setLifeSavingsResult(
            lifeSavingsInsuranceDeductionsResult,
            insuranceDeductions
        );
        setLifeSavingsResult(
            lifeSavingsDeductionsResult,
            salaryResult.total
        );

        if (lifeSavingsResultTitle) {
            lifeSavingsResultTitle.textContent =
                'Sığortadan sonra karta keçəcək net əməkhaqqı';
        }
        setLifeSavingsResult(lifeSavingsNetResult, netSalaryAfterInsurance);

        return;
    }

    let grossSalary = enteredGrossSalary;
    let salaryResult = null;
    let grossInsurance = 0;
    let insuranceResult = null;
    let supergrossResult = null;
    let primaryLabel = '';
    let primaryResult = 0;
    let insuranceLabel = '';
    let employerLabel = '';
    let deductionsResult = null;
    let resultTitle = '';
    let resultValue = 0;

    if (mode === 'gross-salary-to-net') {
        grossSalary = enteredAmount;
        salaryResult = lifeSavingsSalaryBreakdown(
            grossSalary,
            sector,
            year,
            unionRate
        );
        grossInsurance = enteredGrossInsurance;
        insuranceResult = lifeSavingsNetInsurance(
            grossSalary,
            grossInsurance,
            sector,
            year
        );
        supergrossResult = lifeSavingsSupergrossFromGross(
            grossSalary,
            grossInsurance,
            sector,
            year
        );
        primaryLabel = 'Net əməkhaqqı';
        primaryResult = salaryResult.net;
        insuranceLabel = 'Net sığorta haqqı';
        employerLabel = 'Supergross sığorta haqqı';
        deductionsResult = salaryResult.total;
        resultTitle = 'İşçinin alacağı net əməkhaqqı';
        resultValue = salaryResult.net;
    } else if (mode === 'net-salary-to-gross') {
        salaryResult = lifeSavingsSalaryGrossFromNet(
            enteredAmount,
            sector,
            year,
            unionRate
        );
        grossSalary = salaryResult;
        const salaryBreakdown = lifeSavingsSalaryBreakdown(
            grossSalary,
            sector,
            year,
            unionRate
        );
        grossInsurance = enteredGrossInsurance;
        insuranceResult = lifeSavingsNetInsurance(
            grossSalary,
            grossInsurance,
            sector,
            year
        );
        supergrossResult = lifeSavingsSupergrossFromGross(
            grossSalary,
            grossInsurance,
            sector,
            year
        );
        primaryLabel = 'Gross əməkhaqqı';
        primaryResult = grossSalary;
        insuranceLabel = 'Net sığorta haqqı';
        employerLabel = 'Supergross sığorta haqqı';
        deductionsResult = salaryBreakdown.total;
        resultTitle = 'Hesablanan gross əməkhaqqı';
        resultValue = grossSalary;
    } else if (mode === 'gross-insurance-to-supergross') {
        grossInsurance = enteredAmount;
        supergrossResult = lifeSavingsSupergrossFromGross(
            grossSalary,
            grossInsurance,
            sector,
            year
        );
        insuranceResult = lifeSavingsNetInsurance(
            grossSalary,
            grossInsurance,
            sector,
            year
        );
        primaryLabel = 'Gross sığorta haqqı';
        primaryResult = grossInsurance;
        insuranceLabel = 'Net sığorta haqqı';
        employerLabel = 'Supergross sığorta haqqı';
        resultTitle = 'Hesablanan supergross sığorta haqqı';
        resultValue = supergrossResult;
    } else {
        supergrossResult = enteredAmount;
        grossInsurance = lifeSavingsGrossFromSupergross(
            grossSalary,
            supergrossResult,
            sector,
            year
        );
        insuranceResult = lifeSavingsNetInsurance(
            grossSalary,
            grossInsurance,
            sector,
            year
        );
        primaryLabel = 'Gross sığorta haqqı';
        primaryResult = grossInsurance;
        insuranceLabel = 'Net sığorta haqqı';
        employerLabel = 'Daxil edilən supergross sığorta haqqı';
        resultTitle = 'Hesablanan gross sığorta haqqı';
        resultValue = grossInsurance;
    }

    if (lifeSavingsPrimaryLabel) {
        lifeSavingsPrimaryLabel.textContent = primaryLabel;
    }
    if (lifeSavingsPrimaryResult) {
        lifeSavingsPrimaryResult.textContent = formatSalaryAZN(primaryResult);
    }
    if (lifeSavingsInsuranceLabel) {
        lifeSavingsInsuranceLabel.textContent = insuranceLabel;
    }
    if (lifeSavingsInsuranceResult) {
        lifeSavingsInsuranceResult.textContent = formatSalaryAZN(insuranceResult);
    }
    if (lifeSavingsEmployerLabel) {
        lifeSavingsEmployerLabel.textContent = employerLabel;
    }
    if (lifeSavingsEmployerResult) {
        lifeSavingsEmployerResult.textContent = formatSalaryAZN(supergrossResult);
    }
    if (lifeSavingsSupergrossLabel) {
        lifeSavingsSupergrossLabel.textContent =
            'Supergross sığorta haqqı';
    }
    setLifeSavingsResult(lifeSavingsSupergrossResult, supergrossResult);
    resetLifeSavingsDeductionDetails();
    if (lifeSavingsDeductionsResult) {
        lifeSavingsDeductionsResult.textContent = deductionsResult === null
            ? '—'
            : formatSalaryAZN(deductionsResult);
    }
    if (lifeSavingsResultTitle) {
        lifeSavingsResultTitle.textContent = resultTitle;
    }
    if (lifeSavingsNetResult) {
        lifeSavingsNetResult.textContent = formatSalaryAZN(resultValue);
    }
}

[
    lifeSavingsMode,
    lifeSavingsYear,
    lifeSavingsSector,
    lifeSavingsUnion,
    lifeSavingsGrossSalary,
    lifeSavingsAmount,
    lifeSavingsInsuranceAmount
].forEach((element) => {
    element?.addEventListener('input', (event) => {
        if (!lifeSavingsMode) {
            return;
        }

        if (
            event.target === lifeSavingsInsuranceAmount &&
            lifeSavingsMode?.value === 'gross-salary-to-net'
        ) {
            lifeSavingsNetInsuranceManuallyChanged = true;
        }

        updateLifeSavingsAmountLabel();
        calculateLifeSavings();
    });
    element?.addEventListener('change', (event) => {
        if (!lifeSavingsMode) {
            return;
        }

        if (event.target === lifeSavingsMode) {
            lifeSavingsNetInsuranceManuallyChanged = false;
        }

        if (
            event.target === lifeSavingsInsuranceAmount &&
            lifeSavingsMode?.value === 'gross-salary-to-net'
        ) {
            lifeSavingsNetInsuranceManuallyChanged = true;
        }

        updateLifeSavingsAmountLabel();
        calculateLifeSavings();
    });
});

/*
   Bu hissənin sadələşdirilmiş interfeysi aşağıdakı yeni funksiya və
   dinləyicilərlə işə salınır.
*/

const lifeSavingsGrossInsuranceAmount =
    document.getElementById('life-savings-gross-insurance-amount');
const lifeSavingsSupergrossInsuranceAmount =
    document.getElementById('life-savings-supergross-insurance-amount');
const lifeSavingsNetInsuranceLabel =
    document.getElementById('life-savings-net-insurance-label');
const lifeSavingsGrossInsuranceLabel =
    document.getElementById('life-savings-gross-insurance-label');
const lifeSavingsSupergrossInsuranceLabel =
    document.getElementById('life-savings-supergross-insurance-label');
const lifeSavingsLimitMessage =
    document.getElementById('life-savings-limit-message');

let lifeSavingsEditedInsuranceField = null;

function lifeSavingsInputValue(element) {
    return Math.max(0, Number(element?.value) || 0);
}

function updateLifeSavingsOtherDeductionSuffix() {
    if (lifeSavingsOtherDeductionSuffix) {
        lifeSavingsOtherDeductionSuffix.textContent =
            lifeSavingsOtherDeductionType?.value === 'percent'
                ? '%'
                : 'AZN';
    }
}

function lifeSavingsOtherDeductionValue(grossSalary) {
    const gross = Math.max(0, grossSalary);
    const entered = lifeSavingsInputValue(lifeSavingsOtherDeduction);
    const amount = lifeSavingsOtherDeductionType?.value === 'percent'
        ? gross * entered / 100
        : entered;

    return Math.min(gross, Math.max(0, amount));
}

function updateLifeSavingsInsuranceRequiredState() {
    const fields = [
        lifeSavingsInsuranceAmount,
        lifeSavingsGrossInsuranceAmount,
        lifeSavingsSupergrossInsuranceAmount
    ];
    const salaryEntered = lifeSavingsInputValue(lifeSavingsAmount) > 0;
    const insuranceEntered = fields.some((field) =>
        String(field?.value || '').trim() !== ''
    );

    lifeSavingsAmount?.classList.toggle(
        'life-savings-input-required',
        !salaryEntered
    );

    fields.forEach((field) => {
        field?.classList.toggle(
            'life-savings-input-required',
            salaryEntered && !insuranceEntered
        );
    });
}

function updateLifeSavingsNote() {
    if (!lifeSavingsNote) {
        return;
    }

    const salaryEntered = lifeSavingsInputValue(lifeSavingsAmount) > 0;
    const hasEnteredInsuranceAmount = [
        lifeSavingsInsuranceAmount,
        lifeSavingsGrossInsuranceAmount,
        lifeSavingsSupergrossInsuranceAmount
    ].some((field) => String(field?.value || '').trim() !== '');

    lifeSavingsNote.classList.toggle(
        'is-hidden',
        !salaryEntered || hasEnteredInsuranceAmount
    );
}

function lifeSavingsWriteInput(element, value, preserveActive = false) {
    if (element && !(preserveActive && document.activeElement === element)) {
        element.value = lifeSavingsRound(value).toFixed(2);
    }
}

function lifeSavingsSetMaximumPlaceholder(element, maximum) {
    if (element) {
        element.placeholder = `Maks. ${formatSalaryAZN(maximum)}`;
    }
}

function lifeSavingsSetLimitMessage(isExceeded, source = null) {
    const fields = {
        net: lifeSavingsInsuranceAmount,
        gross: lifeSavingsGrossInsuranceAmount,
        supergross: lifeSavingsSupergrossInsuranceAmount
    };

    Object.values(fields).forEach((field) => {
        field?.classList.remove('life-savings-input-error');
        field?.removeAttribute('aria-invalid');
    });

    const invalidField = fields[source];
    if (isExceeded && invalidField) {
        invalidField.classList.add('life-savings-input-error');
        invalidField.setAttribute('aria-invalid', 'true');
    }

    if (lifeSavingsLimitMessage) {
        lifeSavingsLimitMessage.textContent = isExceeded
            ? 'Maksimal həddən çox məbləğ daxil edilə bilməz.'
            : '';
    }
}

function updateLifeSavingsAmountLabel() {
    if (lifeSavingsSector) {
        lifeSavingsSector.disabled = false;
    }
}

function calculateLifeSavings(options = {}) {
    if (
        !lifeSavingsYear ||
        !lifeSavingsUnion ||
        !lifeSavingsAmount ||
        !lifeSavingsInsuranceAmount ||
        !lifeSavingsGrossInsuranceAmount ||
        !lifeSavingsSupergrossInsuranceAmount
    ) {
        return;
    }

    const preserveActive = options.preserveActive === true;
    const grossSalary = lifeSavingsInputValue(lifeSavingsAmount);
    const sector = lifeSavingsSector?.value || 'private';
    const workplace = lifeSavingsWorkplace?.value || 'main';
    const year = Number(lifeSavingsYear.value);
    const unionRate = Number(lifeSavingsUnion.value) || 0;
    const otherDeduction = lifeSavingsOtherDeductionValue(grossSalary);
    const salaryResult = lifeSavingsSalaryBreakdown(
        grossSalary,
        sector,
        year,
        unionRate,
        workplace
    );
    const maximumGross = lifeSavingsMaximumGrossInsurance(
        grossSalary,
        sector
    );
    const maximumNet = lifeSavingsRound(
        lifeSavingsNetInsurance(grossSalary, maximumGross, sector, year)
    );
    const maximumSupergross = lifeSavingsRound(
        lifeSavingsSupergrossFromGross(
            grossSalary,
            maximumGross,
            sector,
            year
        )
    );
    const activeId = document.activeElement?.id;
    const source = options.source || (activeId === 'life-savings-insurance-amount'
        ? 'net'
        : activeId === 'life-savings-gross-insurance-amount'
            ? 'gross'
            : activeId === 'life-savings-supergross-insurance-amount'
                ? 'supergross'
                : lifeSavingsEditedInsuranceField);

    let selectedNet = maximumNet;
    let selectedGross = maximumGross;
    let selectedSupergross = maximumSupergross;
    let isExceeded = false;

    if (source === 'net') {
        selectedNet = lifeSavingsInputValue(lifeSavingsInsuranceAmount);
        isExceeded = selectedNet > maximumNet;
        selectedNet = Math.min(selectedNet, maximumNet);
        selectedGross = lifeSavingsGrossInsuranceFromNet(
            grossSalary,
            selectedNet,
            sector,
            year
        );
        selectedSupergross = lifeSavingsSupergrossFromGross(
            grossSalary,
            selectedGross,
            sector,
            year
        );
    } else if (source === 'gross') {
        selectedGross = lifeSavingsInputValue(
            lifeSavingsGrossInsuranceAmount
        );
        isExceeded = selectedGross > maximumGross;
        selectedGross = Math.min(selectedGross, maximumGross);
        selectedNet = lifeSavingsNetInsurance(
            grossSalary,
            selectedGross,
            sector,
            year
        );
        selectedSupergross = lifeSavingsSupergrossFromGross(
            grossSalary,
            selectedGross,
            sector,
            year
        );
    } else if (source === 'supergross') {
        selectedSupergross = lifeSavingsInputValue(
            lifeSavingsSupergrossInsuranceAmount
        );
        isExceeded = selectedSupergross > maximumSupergross;
        selectedSupergross = Math.min(
            selectedSupergross,
            maximumSupergross
        );
        selectedGross = lifeSavingsGrossFromSupergross(
            grossSalary,
            selectedSupergross,
            sector,
            year
        );
        selectedNet = lifeSavingsNetInsurance(
            grossSalary,
            selectedGross,
            sector,
            year
        );
    }

    const budgetResult = lifeSavingsBudgetAfterInsurance(
        grossSalary,
        selectedGross,
        sector,
        year,
        unionRate,
        workplace,
        otherDeduction
    );

    lifeSavingsInsuranceAmount.max = maximumNet.toFixed(2);
    lifeSavingsGrossInsuranceAmount.max = maximumGross.toFixed(2);
    lifeSavingsSupergrossInsuranceAmount.max =
        maximumSupergross.toFixed(2);

    lifeSavingsSetMaximumPlaceholder(lifeSavingsInsuranceAmount, maximumNet);
    lifeSavingsSetMaximumPlaceholder(
        lifeSavingsGrossInsuranceAmount,
        maximumGross
    );
    lifeSavingsSetMaximumPlaceholder(
        lifeSavingsSupergrossInsuranceAmount,
        maximumSupergross
    );

    // İlkin görünüşdə maksimum rəqəmləri xanaya yazmırıq. Onlar yalnız
    // solğun placeholder kimi göstərilir; istifadəçi hansı istiqaməti
    // seçirsə, digər iki xana həmin seçimin nəticəsi ilə yenilənir.
    if (source) {
        lifeSavingsWriteInput(
            lifeSavingsInsuranceAmount,
            selectedNet,
            preserveActive
        );
        lifeSavingsWriteInput(
            lifeSavingsGrossInsuranceAmount,
            selectedGross,
            preserveActive
        );
        lifeSavingsWriteInput(
            lifeSavingsSupergrossInsuranceAmount,
            selectedSupergross,
            preserveActive
        );
    }
    // Xana fokusda ikən artıq məbləğ qırmızı görünür. Xana tərk ediləndə
    // dəyər maksimuma qaytarılır və xəbərdarlıq avtomatik silinir.
    lifeSavingsSetLimitMessage(
        isExceeded && preserveActive,
        source
    );
    updateLifeSavingsInsuranceRequiredState();

    setLifeSavingsResult(
        lifeSavingsIncomeTaxResult,
        budgetResult.incomeTax
    );
    setLifeSavingsResult(lifeSavingsSocialResult, budgetResult.social);
    setLifeSavingsResult(
        lifeSavingsUnemploymentResult,
        budgetResult.salaryUnemployment
    );
    setLifeSavingsResult(lifeSavingsMedicalResult, budgetResult.salaryMedical);
    setLifeSavingsResult(
        lifeSavingsInsuranceUnemploymentResult,
        budgetResult.insuranceUnemployment
    );
    setLifeSavingsResult(
        lifeSavingsInsuranceMedicalResult,
        budgetResult.insuranceMedical
    );
    setLifeSavingsResult(lifeSavingsUnionResult, budgetResult.union);
    setLifeSavingsResult(
        lifeSavingsOtherDeductionResult,
        budgetResult.otherDeduction
    );
    setLifeSavingsResult(
        lifeSavingsDeductionsResult,
        budgetResult.total
    );

    if (lifeSavingsResultTitle) {
        lifeSavingsResultTitle.textContent =
            'Sığortadan sonra karta köçürüləcək net əməkhaqqı';
    }
    setLifeSavingsResult(
        lifeSavingsNetResult,
        budgetResult.netCash
    );
    updateLifeSavingsNote();
}

function resetLifeSavingsInsuranceInputs() {
    [
        lifeSavingsInsuranceAmount,
        lifeSavingsGrossInsuranceAmount,
        lifeSavingsSupergrossInsuranceAmount
    ].forEach((field) => {
        if (!field) {
            return;
        }

        field.value = '';
        delete field.dataset.lifeSavingsPreviousValue;
    });

    lifeSavingsEditedInsuranceField = null;
    lifeSavingsSetLimitMessage(false);
    updateLifeSavingsNote();
}

[
    [lifeSavingsAmount, null],
    [lifeSavingsWorkplace, 'preserve'],
    [lifeSavingsYear, 'preserve'],
    [lifeSavingsUnion, 'preserve'],
    [lifeSavingsOtherDeductionType, 'preserve'],
    [lifeSavingsOtherDeduction, 'preserve'],
    [lifeSavingsInsuranceAmount, 'net'],
    [lifeSavingsGrossInsuranceAmount, 'gross'],
    [lifeSavingsSupergrossInsuranceAmount, 'supergross']
].forEach(([element, source]) => {
    ['input', 'change', 'blur'].forEach((eventName) => {
        element?.addEventListener(eventName, () => {
            if (
                element === lifeSavingsAmount ||
                element === lifeSavingsWorkplace
            ) {
                resetLifeSavingsInsuranceInputs();
            }

            if (
                eventName === 'blur' &&
                element.value === '' &&
                element.dataset.lifeSavingsPreviousValue
            ) {
                element.value = element.dataset.lifeSavingsPreviousValue;
            }

            if (source !== 'preserve') {
                lifeSavingsEditedInsuranceField = source;
            }
            if (element === lifeSavingsOtherDeductionType) {
                updateLifeSavingsOtherDeductionSuffix();
            }
            calculateLifeSavings({
                preserveActive: eventName === 'input',
                source: source === 'preserve' ? null : source
            });

            if (element === lifeSavingsWorkplace) {
                resetLifeSavingsInsuranceInputs();
            }
        });
    });
});

[
    lifeSavingsInsuranceAmount,
    lifeSavingsGrossInsuranceAmount,
    lifeSavingsSupergrossInsuranceAmount
].forEach((element) => {
    element?.addEventListener('focus', () => {
        if (element.value) {
            element.dataset.lifeSavingsPreviousValue = element.value;
            element.value = '';
        }
    });

    // Bəzi brauzerlərdə və mobil klaviaturalarda seçilmiş mətnin üzərinə
    // yazmaq əvəzinə yeni rəqəm mövcud dəyərin sonuna əlavə oluna bilər.
    // İlk rəqəm daxil ediləndə əvvəlki hesablanmış dəyəri təmizləyirik.
});

lifeSavingsAmount?.addEventListener('focus', () => {
    if (
        lifeSavingsAmount.value !== '' &&
        Number(lifeSavingsAmount.value) === 0
    ) {
        lifeSavingsAmount.dataset.lifeSavingsPreviousValue =
            lifeSavingsAmount.value;
        lifeSavingsAmount.value = '';
    }
});

lifeSavingsAmount?.addEventListener('blur', () => {
    if (lifeSavingsAmount.value === '') {
        lifeSavingsAmount.value =
            lifeSavingsAmount.dataset.lifeSavingsPreviousValue || '0.00';
    }
    calculateLifeSavings();
});

updateLifeSavingsAmountLabel();
updateLifeSavingsOtherDeductionSuffix();
calculateLifeSavings();

/* =========================================
   İDXAL MALLARININ HESABLANMASI
   ========================================= */

const importCustomsCurrency =
    document.getElementById('import-customs-currency');
const importCustomsDate =
    document.getElementById('import-customs-date');
const importCustomsExcelFile =
    document.getElementById('import-customs-excel-file');
const importCustomsExcelExport =
    document.querySelector('[data-export-import-excel]');
const importCustomsExcelStatus =
    document.getElementById('import-customs-excel-status');
const importCustomsRate =
    document.getElementById('import-customs-rate');
const importCustomsProducts =
    document.getElementById('import-customs-products');
const importCustomsTransport =
    document.getElementById('import-customs-transport');
const importCustomsTransportCurrency =
    document.getElementById('import-customs-transport-currency');
const importCustomsTransportRate =
    document.getElementById('import-customs-transport-rate');
const importCustomsTransportAZN =
    document.getElementById('import-customs-transport-azn');
const importCustomsTransportAZNValue =
    document.querySelector('[data-import-transport-azn-value]');
const importCustomsAllocationMethod =
    document.getElementById('import-customs-allocation-method');
const importCustomsOther =
    document.getElementById('import-customs-other');
const importCustomsOtherCurrency =
    document.getElementById('import-customs-other-currency');
const importCustomsOtherRate =
    document.getElementById('import-customs-other-rate');
const importCustomsOtherAZN =
    document.getElementById('import-customs-other-azn');
const importCustomsOtherAZNValue =
    document.querySelector('[data-import-other-azn-value]');
const importCustomsOtherAllocationMethod =
    document.getElementById('import-customs-other-allocation-method');
const importCustomsOrderAZNResult =
    document.getElementById('import-customs-order-azn-result');
const importCustomsTransportAZNResult =
    document.getElementById('import-customs-transport-azn-result');
const importCustomsOtherAZNResult =
    document.getElementById('import-customs-other-azn-result');
const importCustomsCollectionResult =
    document.getElementById('import-customs-collection-result');
const importCustomsDutyAmountResult =
    document.getElementById('import-customs-duty-amount-result');
const importCustomsValueResult =
    document.getElementById('import-customs-value-result');
const importCustomsDutyResult =
    document.getElementById('import-customs-duty-result');
const importCustomsVATResult =
    document.getElementById('import-customs-vat-result');

function importCustomsNumber(element) {
    return Math.max(0, Number(element?.value) || 0);
}

function calculateImportCustomsCollection(invoiceAZNTotal) {
    if (invoiceAZNTotal <= 0) {
        return null;
    }

    if (invoiceAZNTotal <= 1000) {
        return 15;
    }
    if (invoiceAZNTotal <= 10000) {
        return 60;
    }
    if (invoiceAZNTotal <= 50000) {
        return 120;
    }
    if (invoiceAZNTotal <= 100000) {
        return 200;
    }
    if (invoiceAZNTotal <= 500000) {
        return 300;
    }
    if (invoiceAZNTotal <= 1000000) {
        return 600;
    }
    return 1000;
}

function formatImportCustomsNumber(value) {
    return new Intl.NumberFormat('az-AZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Math.max(0, value));
}

function clearImportCustomsResults() {
    [
        importCustomsValueResult,
        importCustomsDutyAmountResult,
        importCustomsDutyResult,
        importCustomsVATResult
    ].forEach((element) => {
        if (element) {
            element.textContent = '—';
        }
    });
}

function updateImportCustomsCurrencyLabels() {
    const currency = importCustomsCurrency?.value || 'USD';

    document.querySelectorAll(
        '#import-customs-calculator-panel [data-import-currency]'
    ).forEach((label) => {
        label.textContent = currency;
    });
}

function updateImportCustomsWeightFields() {
    const useWeight = importCustomsAllocationMethod?.value === 'weight';

    importCustomsProductRows().forEach((row) => {
        const field = row.querySelector('.import-customs-weight-field');
        const input = row.querySelector('[data-import-weight]');
        const invoice = row.querySelector('[data-import-invoice]');
        const invoiceValue = importCustomsNumber(invoice);
        if (field && input) {
            field.hidden = false;
            field.classList.toggle('is-disabled', !useWeight);
            field.classList.toggle(
                'is-required',
                useWeight && invoiceValue > 0 && importCustomsNumber(input) <= 0
            );
            input.disabled = !useWeight;
        }
    });
}

function importCustomsProductRows() {
    return Array.from(
        importCustomsProducts?.querySelectorAll('[data-product-row]') || []
    );
}

function updateImportCustomsProductValues(exchangeRate) {
    importCustomsProductRows().forEach((row) => {
        const invoice = importCustomsNumber(
            row.querySelector('[data-import-invoice]')
        );
        const output = row.querySelector('[data-import-invoice-azn]');
        const outputValue = row.querySelector('[data-import-invoice-azn-value]');
        const displayValue = invoice > 0 && exchangeRate > 0
            ? formatImportCustomsAZN(invoice * exchangeRate)
            : '—';

        if (outputValue) {
            outputValue.textContent = displayValue;
        } else if (output) {
            output.textContent = displayValue;
        }
    });
}

function updateImportCustomsProductActionButtons() {
    const rows = importCustomsProductRows();

    rows.forEach((row, index) => {
        const actions = row.querySelector('.import-customs-product-actions');
        if (!actions) {
            return;
        }

        actions.innerHTML = '';

        if (index > 0) {
            const removeButton = document.createElement('button');
            removeButton.className = 'import-customs-remove-product';
            removeButton.type = 'button';
            removeButton.dataset.removeProduct = '';
            removeButton.setAttribute('aria-label', `${index + 1}-ci malı sil`);
            removeButton.textContent = '−';
            actions.append(removeButton);
        }

        if (index === rows.length - 1) {
            const addButton = document.createElement('button');
            addButton.className = 'import-customs-add-product';
            addButton.type = 'button';
            addButton.dataset.addProduct = '';
            addButton.setAttribute('aria-label', `${index + 2}-ci mal əlavə et`);
            addButton.textContent = '+';
            actions.append(addButton);
        }
    });
}

function removeImportCustomsProductRow(row) {
    const rows = importCustomsProductRows();
    if (!row || rows.length <= 1) {
        return;
    }

    row.remove();
    updateImportCustomsProductActionButtons();
    calculateImportCustoms();
}

function addImportCustomsProductRow() {
    if (!importCustomsProducts) {
        return;
    }

    const rows = importCustomsProductRows();
    const index = rows.length + 1;
    const previousAddButton = importCustomsProducts.querySelector(
        '[data-add-product]'
    );

    previousAddButton?.remove();

    const row = document.createElement('div');
    row.className = 'import-customs-product-row';
    row.dataset.productRow = '';
    row.innerHTML = `
        <div class="form-group">
            <label for="import-customs-invoice-${index}">Malın invoys dəyəri</label>
            <div class="import-customs-money-input">
                <input id="import-customs-invoice-${index}" class="import-customs-invoice" data-import-invoice type="number" min="0" step="0.01" placeholder="0.00" inputmode="decimal">
                <span class="import-customs-product-currency" data-import-currency aria-hidden="true">USD</span>
            </div>
        </div>
        <div class="form-group">
            <label for="import-customs-invoice-azn-${index}">Manatla dəyər</label>
            <div class="import-customs-output import-customs-product-value" id="import-customs-invoice-azn-${index}" data-import-invoice-azn>
                <span data-import-invoice-azn-value>—</span>
                <span class="import-customs-product-icon" aria-label="manat">₼</span>
            </div>
        </div>
        <div class="form-group">
            <label for="import-customs-duty-rate-${index}">Gömrük rüsumu</label>
            <div class="import-customs-rate-input">
                <input id="import-customs-duty-rate-${index}" class="import-customs-duty-rate" data-import-duty-rate type="number" min="0" step="0.01" placeholder="0.00" inputmode="decimal">
                <span>%</span>
            </div>
        </div>
        <div class="form-group import-customs-weight-field">
            <label for="import-customs-weight-${index}">Malın çəkisi (kq)</label>
            <input id="import-customs-weight-${index}" class="import-customs-weight" data-import-weight type="number" min="0" step="0.01" placeholder="0.00" inputmode="decimal">
        </div>
        <div class="import-customs-product-actions"></div>
    `;

    importCustomsProducts.append(row);
    updateImportCustomsProductActionButtons();
    updateImportCustomsWeightFields();
    updateImportCustomsCurrencyLabels();
    calculateImportCustoms();
}

function importCustomsOfficialRateUrl(dateValue) {
    const [year, month, day] = String(dateValue).split('-');
    return `https://cbar.az/currencies/${day}.${month}.${year}.xml`;
}

async function getImportCustomsOfficialRate(dateValue, currencyCode) {
    const requestedDate = new Date(`${dateValue}T12:00:00Z`);

    if (Number.isNaN(requestedDate.getTime())) {
        throw new Error('Məzənnə tarixi düzgün deyil');
    }

    // AMB qeyri-iş günlərində son dərc olunmuş məzənnəni tətbiq edir.
    // Buna görə seçilmiş tarixdən geriyə doğru bir neçə gün yoxlanılır.
    for (let offset = 0; offset <= 7; offset += 1) {
        const lookupDate = new Date(requestedDate);
        lookupDate.setUTCDate(lookupDate.getUTCDate() - offset);
        const lookupDateValue = lookupDate.toISOString().slice(0, 10);

        try {
            const response = await fetch(
                importCustomsOfficialRateUrl(lookupDateValue),
                { cache: 'no-store' }
            );

            if (!response.ok) {
                continue;
            }

            const xml = await response.text();
            const documentXml = new DOMParser().parseFromString(
                xml,
                'application/xml'
            );
            const selectedCurrency = Array.from(
                documentXml.querySelectorAll('Valute')
            ).find((item) =>
                String(item.getAttribute('Code') || '').toUpperCase() === currencyCode
            );
            const nominal = Number(
                selectedCurrency?.querySelector('Nominal')?.textContent?.trim() || 1
            );
            const value = Number(
                selectedCurrency?.querySelector('Value')?.textContent
                    ?.trim()
                    ?.replace(',', '.')
            );

            if (selectedCurrency && Number.isFinite(value) && value > 0) {
                return value / nominal;
            }
        } catch (error) {
            console.warn('AMB məzənnə sorğusu uğursuz oldu:', error);
        }
    }

    throw new Error('AMB üzrə valyuta məzənnəsi tapılmadı');
}

function importCustomsMirrorRateUrl(dateValue) {
    return `https://cdn.jsdelivr.net/gh/AllRates-Today/central-bank-exchange-rates@main/data/cbar/daily/${dateValue}.json`;
}

async function getImportCustomsMirrorRate(dateValue, currencyCode) {
    const requestedDate = new Date(`${dateValue}T12:00:00Z`);

    if (Number.isNaN(requestedDate.getTime())) {
        throw new Error('Məzənnə tarixi düzgün deyil');
    }

    const dateCandidates = Array.from({ length: 8 }, (_, offset) => {
        const lookupDate = new Date(requestedDate);
        lookupDate.setUTCDate(lookupDate.getUTCDate() - offset);
        return {
            offset,
            date: lookupDate.toISOString().slice(0, 10)
        };
    });

    const results = await Promise.all(
        dateCandidates.map(async ({ offset, date }) => {
            try {
                const response = await fetch(
                    importCustomsMirrorRateUrl(date),
                    { cache: 'no-store' }
                );

                if (!response.ok) {
                    return null;
                }

                const data = await response.json();
                const selectedRate = (data.rates || []).find((item) =>
                    String(item.base || '').toUpperCase() === currencyCode &&
                    String(item.quote || '').toUpperCase() === 'AZN' &&
                    String(item.type || '').toLowerCase() === 'reference'
                );
                const rate = Number(selectedRate?.value);

                return Number.isFinite(rate) && rate > 0
                    ? { offset, rate }
                    : null;
            } catch (error) {
                return null;
            }
        })
    );

    const nearestRate = results
        .filter(Boolean)
        .sort((first, second) => first.offset - second.offset)[0];

    if (nearestRate) {
        return nearestRate.rate;
    }

    throw new Error('AMB ehtiyat məzənnə mənbəyində valyuta tapılmadı');
}

const importCustomsRateCachePrefix = 'best-think-cbar-rate:';

function getImportCustomsCachedRate(dateValue, currencyCode) {
    try {
        const cached = sessionStorage.getItem(
            `${importCustomsRateCachePrefix}${dateValue}:${currencyCode}`
        );
        const rate = Number(cached);
        return Number.isFinite(rate) && rate > 0 ? rate : null;
    } catch (error) {
        return null;
    }
}

function setImportCustomsCachedRate(dateValue, currencyCode, rate) {
    try {
        sessionStorage.setItem(
            `${importCustomsRateCachePrefix}${dateValue}:${currencyCode}`,
            String(rate)
        );
    } catch (error) {
        // Keş əlçatan olmadıqda hesablama normal şəkildə davam edir.
    }
}

async function getImportCustomsConnectedRate(dateValue, currencyCode) {
    const cachedRate = getImportCustomsCachedRate(dateValue, currencyCode);
    if (cachedRate !== null) {
        return cachedRate;
    }

    let rate;

    try {
        rate = await getImportCustomsMirrorRate(dateValue, currencyCode);
    } catch (mirrorError) {
        try {
            rate = await getImportCustomsOfficialRate(dateValue, currencyCode);
        } catch (officialError) {
            const data = await getRate(dateValue, currencyCode);
            rate = Number(data.ratePerUnit);
        }
    }

    if (!Number.isFinite(rate) || rate <= 0) {
        throw new Error('Məzənnə məlumatı əldə olunmadı');
    }

    setImportCustomsCachedRate(dateValue, currencyCode, rate);
    return rate;
}

async function loadImportCustomsRate() {
    if (!importCustomsDate || !importCustomsCurrency || !importCustomsRate) {
        return;
    }

    if (!importCustomsDate.value) {
        importCustomsRate.value = '';
        importCustomsRate.readOnly = true;
        calculateImportCustoms();
        return;
    }

    importCustomsRate.value = '';
    importCustomsRate.readOnly = true;

    try {
        const rate = await getImportCustomsConnectedRate(
            importCustomsDate.value,
            importCustomsCurrency.value
        );
        importCustomsRate.value = rate.toFixed(4);
    } catch (error) {
        console.error('İdxal kalkulyatoru məzənnə xətası:', error);
        importCustomsRate.readOnly = false;
    }

    calculateImportCustoms();
}

async function loadImportCustomsTransportRate() {
    if (
        !importCustomsDate ||
        !importCustomsTransportCurrency ||
        !importCustomsTransportRate
    ) {
        return;
    }

    if (importCustomsTransportCurrency.value === 'AZN') {
        importCustomsTransportRate.value = '1.0000';
        importCustomsTransportRate.readOnly = true;
        calculateImportCustoms();
        return;
    }

    if (!importCustomsDate.value) {
        importCustomsTransportRate.value = '';
        importCustomsTransportRate.readOnly = true;
        calculateImportCustoms();
        return;
    }

    importCustomsTransportRate.value = '';
    importCustomsTransportRate.readOnly = true;

    try {
        const rate = await getImportCustomsConnectedRate(
            importCustomsDate.value,
            importCustomsTransportCurrency.value
        );
        importCustomsTransportRate.value = rate.toFixed(4);
    } catch (error) {
        console.error('Nəqliyyat məzənnəsi xətası:', error);
        importCustomsTransportRate.readOnly = false;
    }

    calculateImportCustoms();
}

async function loadImportCustomsOtherRate() {
    if (!importCustomsDate || !importCustomsOtherCurrency || !importCustomsOtherRate) {
        return;
    }

    if (importCustomsOtherCurrency.value === 'AZN') {
        importCustomsOtherRate.value = '1.0000';
        importCustomsOtherRate.readOnly = true;
        calculateImportCustoms();
        return;
    }

    if (!importCustomsDate.value) {
        importCustomsOtherRate.value = '';
        importCustomsOtherRate.readOnly = true;
        calculateImportCustoms();
        return;
    }

    importCustomsOtherRate.value = '';
    importCustomsOtherRate.readOnly = true;

    try {
        const rate = await getImportCustomsConnectedRate(
            importCustomsDate.value,
            importCustomsOtherCurrency.value
        );
        importCustomsOtherRate.value = rate.toFixed(4);
    } catch (error) {
        console.error('Digər xərclər üçün məzənnə xətası:', error);
        importCustomsOtherRate.readOnly = false;
    }

    calculateImportCustoms();
}

function calculateImportCustoms() {
    if (
        !importCustomsCurrency ||
        !importCustomsRate ||
        !importCustomsProducts ||
        !importCustomsTransport ||
        !importCustomsOther ||
        !importCustomsTransportRate ||
        !importCustomsAllocationMethod ||
        !importCustomsOtherRate
    ) {
        return;
    }

    const products = importCustomsProductRows().map((row) => ({
        invoice: importCustomsNumber(row.querySelector('[data-import-invoice]')),
        dutyRate: importCustomsNumber(row.querySelector('[data-import-duty-rate]')),
        weight: importCustomsNumber(row.querySelector('[data-import-weight]'))
    }));
    const invoiceTotal = products.reduce(
        (total, product) => total + product.invoice,
        0
    );
    const transport = importCustomsNumber(importCustomsTransport);
    const other = importCustomsNumber(importCustomsOther);
    const exchangeRate = importCustomsNumber(importCustomsRate);
    const transportExchangeRate = importCustomsNumber(importCustomsTransportRate);
    const otherExchangeRate = importCustomsNumber(importCustomsOtherRate);
    const invoiceOtherTotal = invoiceTotal + other;
    const transportAZN = transport * transportExchangeRate;
    const invoiceAZNTotal = invoiceTotal * exchangeRate;
    const otherAZN = other * otherExchangeRate;
    const foreignTotal = invoiceOtherTotal + transport;
    const customsCollection = calculateImportCustomsCollection(invoiceAZNTotal);
    const transportAllocationMethod = importCustomsAllocationMethod.value;
    const otherAllocationMethod = importCustomsOtherAllocationMethod.value;
    const totalProductWeight = products.reduce(
        (total, product) => total + product.weight,
        0
    );

    updateImportCustomsProductValues(exchangeRate);

    if (importCustomsTransportAZN) {
        const displayValue = transport > 0 && transportExchangeRate > 0
            ? formatImportCustomsAZN(transportAZN)
            : '—';
        if (importCustomsTransportAZNValue) {
            importCustomsTransportAZNValue.textContent = displayValue;
        } else {
            importCustomsTransportAZN.textContent = displayValue;
        }
    }

    if (importCustomsOtherAZN) {
        const displayValue = other > 0 && otherExchangeRate > 0
            ? formatImportCustomsAZN(otherAZN)
            : '—';
        if (importCustomsOtherAZNValue) {
            importCustomsOtherAZNValue.textContent = displayValue;
        } else {
            importCustomsOtherAZN.textContent = displayValue;
        }
    }

    if (importCustomsOrderAZNResult) {
        importCustomsOrderAZNResult.textContent = invoiceTotal > 0 && exchangeRate > 0
            ? formatImportCustomsAmount(invoiceAZNTotal)
            : '—';
    }

    if (importCustomsTransportAZNResult) {
        importCustomsTransportAZNResult.textContent = transport > 0 && transportExchangeRate > 0
            ? formatImportCustomsAmount(transportAZN)
            : '—';
    }

    if (importCustomsOtherAZNResult) {
        importCustomsOtherAZNResult.textContent = other > 0 && otherExchangeRate > 0
            ? formatImportCustomsAmount(otherAZN)
            : '—';
    }

    if (importCustomsCollectionResult) {
        importCustomsCollectionResult.textContent = customsCollection === null
            ? '—'
            : formatImportCustomsAmount(customsCollection);
    }

    if (
        foreignTotal === 0 ||
        (invoiceTotal > 0 && exchangeRate === 0) ||
        (other > 0 && otherExchangeRate === 0) ||
        (transport > 0 && transportExchangeRate === 0)
    ) {
        clearImportCustomsResults();
        return;
    }

    if (
        transportAllocationMethod === 'weight' &&
        products.some((product) => product.invoice > 0 && product.weight <= 0)
    ) {
        clearImportCustomsResults();
        return;
    }

    const customsValue = invoiceAZNTotal + otherAZN + transportAZN;
    const duty = products.reduce((total, product) => {
        const invoiceAZN = product.invoice * exchangeRate;
        const transportAllocationBase = transportAllocationMethod === 'weight'
            ? (totalProductWeight > 0 ? product.weight / totalProductWeight : 0)
            : (invoiceAZNTotal > 0 ? invoiceAZN / invoiceAZNTotal : 0);
        const otherAllocationBase = otherAllocationMethod === 'weight'
            ? (totalProductWeight > 0 ? product.weight / totalProductWeight : 0)
            : (invoiceAZNTotal > 0 ? invoiceAZN / invoiceAZNTotal : 0);
        const allocatedTransport = transportAZN * transportAllocationBase;
        const allocatedOther = otherAZN * otherAllocationBase;
        return total + (
            (invoiceAZN + allocatedTransport + allocatedOther) * product.dutyRate / 100
        );
    }, 0);
    const vat = (customsValue + duty) * 0.18;
    const totalCustomsCharges = duty + (customsCollection || 0) + vat;

    importCustomsValueResult.textContent = formatImportCustomsAmount(customsValue);
    importCustomsDutyAmountResult.textContent = formatImportCustomsAmount(duty);
    importCustomsDutyResult.textContent = formatImportCustomsAmount(totalCustomsCharges);
    importCustomsVATResult.textContent = formatImportCustomsAmount(vat);
}

function importCustomsSetExcelStatus(message, isError = false) {
    if (!importCustomsExcelStatus) {
        return;
    }

    importCustomsExcelStatus.textContent = message;
    importCustomsExcelStatus.style.color = isError ? '#b4233c' : '';
}

function importCustomsExcelNumber(value) {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    const normalized = String(value ?? '')
        .trim()
        .replace(/\\s/g, '')
        .replace(',', '.');
    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
}

function importCustomsExcelDate(value) {
    if (!value) {
        return '';
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().slice(0, 10);
    }

    if (typeof value === 'number' && window.XLSX?.SSF) {
        const parsed = window.XLSX.SSF.parse_date_code(value);
        if (parsed?.y && parsed?.m && parsed?.d) {
            return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
        }
    }

    const text = String(value).trim();
    const dmy = text.match(/^(\\d{1,2})[./-](\\d{1,2})[./-](\\d{4})$/);
    if (dmy) {
        return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
    }

    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
}

function importCustomsExcelValue(rows, label) {
    for (const row of rows) {
        const labelIndex = row.findIndex(
            (cell) => String(cell ?? '').trim() === label
        );
        if (labelIndex >= 0) {
            return row[labelIndex + 1] ?? '';
        }
    }
    return '';
}

function importCustomsSelectValue(select, value, fallback = '') {
    if (!select) {
        return;
    }

    const text = String(value ?? '').trim();
    const option = Array.from(select.options).find(
        (candidate) => candidate.value === text || candidate.textContent.trim() === text
    );
    select.value = option ? option.value : fallback;
}

async function importCustomsImportExcelFile(file) {
    if (!file) {
        return;
    }

    if (!window.XLSX) {
        throw new Error('Excel oxuma modulu yüklənmədi. Səhifəni yeniləyib yenidən yoxlayın.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(arrayBuffer, {
        type: 'array',
        cellDates: true
    });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = window.XLSX.utils.sheet_to_json(firstSheet, {
        header: 1,
        defval: '',
        raw: true
    });

    const dateValue = importCustomsExcelDate(
        importCustomsExcelValue(rows, 'İdxal tarixi')
    );
    const currencyValue = importCustomsExcelValue(rows, 'Valyuta');
    const transportCurrencyValue = importCustomsExcelValue(rows, 'Nəqliyyat valyutası');
    const otherCurrencyValue = importCustomsExcelValue(rows, 'Digər xərclərin valyutası');
    const transportMethodValue = importCustomsExcelValue(rows, 'Nəqliyyat bölgü üsulu');
    const otherMethodValue = importCustomsExcelValue(rows, 'Digər xərclərin bölgü üsulu');

    if (dateValue) {
        importCustomsDate.value = dateValue;
    }
    importCustomsSelectValue(importCustomsCurrency, currencyValue, 'USD');
    importCustomsTransport.value = importCustomsExcelNumber(
        importCustomsExcelValue(rows, 'Nəqliyyat xərcləri')
    );
    importCustomsSelectValue(importCustomsTransportCurrency, transportCurrencyValue, 'AZN');
    importCustomsSelectValue(importCustomsAllocationMethod, transportMethodValue, 'weight');
    importCustomsOther.value = importCustomsExcelNumber(
        importCustomsExcelValue(rows, 'Digər xərclər')
    );
    importCustomsSelectValue(importCustomsOtherCurrency, otherCurrencyValue, 'AZN');
    importCustomsSelectValue(importCustomsOtherAllocationMethod, otherMethodValue, 'value');

    const headerIndex = rows.findIndex((row) =>
        String(row?.[0] ?? '').trim() === 'Məhsul №'
    );
    const products = headerIndex < 0
        ? []
        : rows.slice(headerIndex + 1)
            .filter((row) => String(row?.[0] ?? '').trim() !== '')
            .map((row) => ({
                invoice: importCustomsExcelNumber(row[1]),
                dutyRate: importCustomsExcelNumber(row[2]),
                weight: importCustomsExcelNumber(row[3])
            }))
            .filter((product) => product.invoice > 0 || product.dutyRate > 0 || product.weight > 0);

    while (importCustomsProductRows().length < products.length) {
        addImportCustomsProductRow();
    }

    importCustomsProductRows().forEach((row, index) => {
        const product = products[index];
        row.querySelector('[data-import-invoice]').value = product ? product.invoice : '';
        row.querySelector('[data-import-duty-rate]').value = product ? product.dutyRate : '';
        row.querySelector('[data-import-weight]').value = product ? product.weight : '';
    });

    updateImportCustomsCurrencyLabels();
    updateImportCustomsWeightFields();
    await Promise.all([
        loadImportCustomsRate(),
        loadImportCustomsTransportRate(),
        loadImportCustomsOtherRate()
    ]);
    calculateImportCustoms();
    importCustomsSetExcelStatus(
        `${file.name} yükləndi. ${products.length} məhsul sətri kalkulyatora əlavə edildi.`
    );
}

function importCustomsExportExcelFile() {
    if (!window.XLSX) {
        importCustomsSetExcelStatus(
            'Excel modulu yüklənmədi. Səhifəni yeniləyib yenidən yoxlayın.',
            true
        );
        return;
    }

    const number = (value) => Math.max(0, Number(value) || 0);
    const money = (value) => Number(number(value).toFixed(2));
    const currency = importCustomsCurrency?.value || 'USD';
    const transportCurrency = importCustomsTransportCurrency?.value || 'AZN';
    const otherCurrency = importCustomsOtherCurrency?.value || 'AZN';
    const exchangeRate = number(importCustomsRate?.value);
    const transportExchangeRate = number(importCustomsTransportRate?.value);
    const otherExchangeRate = number(importCustomsOtherRate?.value);
    const transport = number(importCustomsTransport?.value);
    const other = number(importCustomsOther?.value);
    const transportMethod = importCustomsAllocationMethod?.value === 'weight'
        ? 'Malın çəkisinə mütənasib'
        : 'Malın dəyərinə mütənasib';
    const otherMethod = importCustomsOtherAllocationMethod?.value === 'weight'
        ? 'Malın çəkisinə mütənasib'
        : 'Malın dəyərinə mütənasib';

    // Empty UI rows are not exported. The workbook therefore contains exactly
    // as many product rows as the user entered, while keeping one editable row
    // when the calculator is still empty.
    const products = importCustomsProductRows().map((row) => ({
        invoice: number(row.querySelector('[data-import-invoice]')?.value),
        dutyRate: number(row.querySelector('[data-import-duty-rate]')?.value),
        weight: number(row.querySelector('[data-import-weight]')?.value)
    })).filter((product) => (
        product.invoice > 0 || product.dutyRate > 0 || product.weight > 0
    ));
    if (products.length === 0) {
        products.push({ invoice: 0, dutyRate: 0, weight: 0 });
    }

    const firstProductRow = 8;
    const lastProductRow = firstProductRow + products.length - 1;
    const invoiceTotal = products.reduce((sum, product) => sum + product.invoice, 0);
    const invoiceAZNTotal = invoiceTotal * exchangeRate;
    const transportAZN = transport * transportExchangeRate;
    const otherAZN = other * otherExchangeRate;
    const totalWeight = products.reduce((sum, product) => sum + product.weight, 0);
    const collection = calculateImportCustomsCollection(invoiceAZNTotal) || 0;
    const hasValueAllocation = (method) => method === 'Malın dəyərinə mütənasib';
    const productValues = products.map((product) => product.invoice * exchangeRate);
    const dutyValues = products.map((product, index) => {
        const valueShare = invoiceAZNTotal > 0
            ? productValues[index] / invoiceAZNTotal
            : 0;
        const weightShare = totalWeight > 0
            ? product.weight / totalWeight
            : 0;
        const transportShare = hasValueAllocation(transportMethod)
            ? valueShare
            : weightShare;
        const otherShare = hasValueAllocation(otherMethod)
            ? valueShare
            : weightShare;
        const statisticalValue = productValues[index]
            + transportAZN * transportShare
            + otherAZN * otherShare;
        return statisticalValue * product.dutyRate / 100;
    });

    const rows = [
        [],
        ['İdxalın tarixi', importCustomsDate?.value ? new Date(`${importCustomsDate.value}T12:00:00`) : ''],
        ['İnvoys dəyəri', invoiceTotal, 'Valyuta', currency, 'Məzənnə', exchangeRate, 'Manatla dəyəri', invoiceAZNTotal],
        ['Nəqliyyat xərcləri', transport, 'Valyuta', transportCurrency, 'Məzənnə', transportExchangeRate, 'Manatla dəyəri', transportAZN, 'Nəqliyyat bölgü üsulu', '', transportMethod],
        ['Digər xərclər', other, 'Valyuta', otherCurrency, 'Məzənnə', otherExchangeRate, 'Manatla dəyəri', otherAZN, 'Digər xərclərin bölgü üsulu', '', otherMethod],
        [],
        [
            'Məhsul №',
            'Malın invoys dəyəri',
            'Malın manatla dəyəri',
            'Malın çəkisi (kq)',
            'Nomenklatura kodu',
            'Gömrük yığımları',
            'Daşınmanın bölgüsü (AZN)',
            'Digər xərclərin bölgüsü (AZN)',
            'Statistik dəyər',
            'Gömrük rüsumun dərəcəsi (%)',
            'Hesablanan Gömrük rüsumu',
            'Malın maya dəyəri',
            'ƏDV',
            'Qeydlər'
        ]
    ];

    products.forEach((product, index) => {
        const rowNumber = firstProductRow + index;
        const productValue = productValues[index];
        const valueShare = invoiceAZNTotal > 0 ? productValue / invoiceAZNTotal : 0;
        const weightShare = totalWeight > 0 ? product.weight / totalWeight : 0;
        const transportShare = hasValueAllocation(transportMethod) ? valueShare : weightShare;
        const otherShare = hasValueAllocation(otherMethod) ? valueShare : weightShare;
        const allocatedTransport = transportAZN * transportShare;
        const allocatedOther = otherAZN * otherShare;
        const statisticalValue = productValue + allocatedTransport + allocatedOther;
        const duty = dutyValues[index];
        rows.push([
            index + 1,
            product.invoice,
            productValue,
            product.weight,
            '',
            invoiceTotal > 0 ? collection * product.invoice / invoiceTotal : 0,
            allocatedTransport,
            allocatedOther,
            statisticalValue,
            product.dutyRate / 100,
            duty,
            productValue + (invoiceTotal > 0 ? collection * product.invoice / invoiceTotal : 0) + allocatedTransport + allocatedOther + duty,
            (statisticalValue + duty) * 0.18,
            ''
        ]);
    });

    const worksheet = window.XLSX.utils.aoa_to_sheet(rows);
    const setFormula = (address, formula, value, format = '0.00') => {
        worksheet[address] = {
            t: 'n',
            f: String(formula).replace(/^=/, ''),
            v: Number(value) || 0,
            z: format
        };
    };
    const productRange = `B${firstProductRow}:B${lastProductRow}`;
    const weightRange = `D${firstProductRow}:D${lastProductRow}`;

    setFormula('B3', `SUM(${productRange})`, invoiceTotal, '0.00');
    setFormula('H3', '=B3*F3', invoiceAZNTotal, '0.00');
    setFormula('H4', '=B4*F4', transportAZN, '0.00');
    setFormula('H5', '=B5*F5', otherAZN, '0.00');

    products.forEach((product, index) => {
        const rowNumber = firstProductRow + index;
        const valueShareFormula = `IFERROR(C${rowNumber}/$H$3,0)`;
        const weightShareFormula = `IFERROR(D${rowNumber}/SUM(${weightRange}),0)`;
        const transportShareFormula = hasValueAllocation(transportMethod)
            ? valueShareFormula
            : weightShareFormula;
        const otherShareFormula = hasValueAllocation(otherMethod)
            ? valueShareFormula
            : weightShareFormula;
        const allocatedTransport = transportAZN * (hasValueAllocation(transportMethod)
            ? (invoiceAZNTotal > 0 ? productValues[index] / invoiceAZNTotal : 0)
            : (totalWeight > 0 ? product.weight / totalWeight : 0));
        const allocatedOther = otherAZN * (hasValueAllocation(otherMethod)
            ? (invoiceAZNTotal > 0 ? productValues[index] / invoiceAZNTotal : 0)
            : (totalWeight > 0 ? product.weight / totalWeight : 0));

        setFormula(`C${rowNumber}`, `B${rowNumber}*$F$3`, productValues[index], '0.00');
        const collectionFormula = `IFERROR(IF($H$3<=1000,15,IF($H$3<=10000,60,IF($H$3<=50000,120,IF($H$3<=100000,200,IF($H$3<=500000,300,IF($H$3<=1000000,600,1000))))))*B${rowNumber}/$B$3,0)`;
        const allocatedCollection = invoiceTotal > 0
            ? collection * product.invoice / invoiceTotal
            : 0;
        setFormula(`F${rowNumber}`, collectionFormula, allocatedCollection, '0.00');
        setFormula(`G${rowNumber}`, `=$H$4*${transportShareFormula}`, allocatedTransport, '0.00');
        setFormula(`H${rowNumber}`, `=$H$5*${otherShareFormula}`, allocatedOther, '0.00');
        setFormula(`I${rowNumber}`, `=C${rowNumber}+G${rowNumber}+H${rowNumber}`, productValues[index] + allocatedTransport + allocatedOther, '0.00');
        setFormula(`K${rowNumber}`, `=I${rowNumber}*J${rowNumber}`, dutyValues[index], '0.00');
        setFormula(`L${rowNumber}`, `=C${rowNumber}+F${rowNumber}+G${rowNumber}+H${rowNumber}+K${rowNumber}`, productValues[index] + allocatedCollection + allocatedTransport + allocatedOther + dutyValues[index], '0.00');
        setFormula(`M${rowNumber}`, `=(I${rowNumber}+K${rowNumber})*0.18`, (productValues[index] + allocatedTransport + allocatedOther + dutyValues[index]) * 0.18, '0.00');
    });

    const totalRowNumber = lastProductRow + 1;
    for (let columnIndex = 0; columnIndex < 14; columnIndex += 1) {
        const address = window.XLSX.utils.encode_cell({
            r: totalRowNumber - 1,
            c: columnIndex
        });
        if (!worksheet[address]) {
            worksheet[address] = { t: 's', v: '' };
        }
    }
    worksheet[`A${totalRowNumber}`] = { t: 's', v: 'Cəmi' };
    worksheet['!ref'] = `A1:N${totalRowNumber}`;
    const totalStatisticalValue = products.reduce((sum, product, index) => {
        const valueShare = invoiceAZNTotal > 0 ? productValues[index] / invoiceAZNTotal : 0;
        const weightShare = totalWeight > 0 ? product.weight / totalWeight : 0;
        const transportShare = hasValueAllocation(transportMethod) ? valueShare : weightShare;
        const otherShare = hasValueAllocation(otherMethod) ? valueShare : weightShare;
        return sum + productValues[index] + transportAZN * transportShare + otherAZN * otherShare;
    }, 0);
    const totalDuty = dutyValues.reduce((sum, value) => sum + value, 0);
    const totalCost = invoiceAZNTotal + collection + transportAZN + otherAZN + totalDuty;
    const totalVAT = (totalStatisticalValue + totalDuty) * 0.18;
    const totalFormulaColumns = {
        B: invoiceTotal,
        C: invoiceAZNTotal,
        F: collection,
        G: transportAZN,
        H: otherAZN,
        I: totalStatisticalValue,
        K: totalDuty,
        L: totalCost,
        M: totalVAT
    };
    Object.entries(totalFormulaColumns).forEach(([column, value]) => {
        setFormula(
            `${column}${totalRowNumber}`,
            `SUM(${column}${firstProductRow}:${column}${lastProductRow})`,
            value,
            '0.00'
        );
    });

    worksheet['!merges'] = [
        { s: { r: 3, c: 8 }, e: { r: 3, c: 9 } },
        { s: { r: 3, c: 10 }, e: { r: 3, c: 11 } },
        { s: { r: 4, c: 8 }, e: { r: 4, c: 9 } },
        { s: { r: 4, c: 10 }, e: { r: 4, c: 11 } }
    ];
    worksheet['!cols'] = [
        { wch: 17.4 }, { wch: 13 }, { wch: 12.3 }, { wch: 13 },
        { wch: 11.9 }, { wch: 14.5 }, { wch: 15.5 }, { wch: 12.5 },
        { wch: 14.6 }, { wch: 13.7 }, { wch: 11.6 }, { wch: 12.5 },
        { wch: 8.8 }, { wch: 18.3 }
    ];
    worksheet['!rows'] = [
        {}, { hpt: 18 }, { hpt: 18 }, { hpt: 18 }, { hpt: 18 },
        { hpt: 33 }, { hpt: 45 }, ...products.map(() => ({ hpt: 18 })), { hpt: 20 }
    ];
    worksheet['!autofilter'] = { ref: `A7:N${lastProductRow}` };

    const mergeCellStyle = (cell, nextStyle) => {
        if (!cell) {
            return;
        }
        cell.s = {
            ...(cell.s || {}),
            ...nextStyle,
            alignment: {
                ...(cell.s?.alignment || {}),
                ...(nextStyle.alignment || {})
            }
        };
    };
    const headerStyle = {
        fill: {
            patternType: 'solid',
            fgColor: { rgb: 'D9EAD3' }
        },
        font: {
            bold: true,
            color: { rgb: '1B4332' }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        }
    };
    for (let rowIndex = 0; rowIndex < totalRowNumber; rowIndex += 1) {
        for (let columnIndex = 0; columnIndex < 14; columnIndex += 1) {
            const address = window.XLSX.utils.encode_cell({
                r: rowIndex,
                c: columnIndex
            });
            mergeCellStyle(worksheet[address], {
                alignment: { vertical: 'center' }
            });
        }
    }
    for (let rowIndex = 7; rowIndex < totalRowNumber; rowIndex += 1) {
        for (let columnIndex = 0; columnIndex < 14; columnIndex += 1) {
            const address = window.XLSX.utils.encode_cell({
                r: rowIndex,
                c: columnIndex
            });
            mergeCellStyle(worksheet[address], {
                alignment: {
                    horizontal: 'center',
                    vertical: 'center'
                }
            });
        }
    }
    for (let columnIndex = 0; columnIndex < 14; columnIndex += 1) {
        const address = window.XLSX.utils.encode_cell({ r: 6, c: columnIndex });
        mergeCellStyle(worksheet[address], headerStyle);
    }
    for (let columnIndex = 0; columnIndex < 14; columnIndex += 1) {
        const address = window.XLSX.utils.encode_cell({
            r: totalRowNumber - 1,
            c: columnIndex
        });
        mergeCellStyle(worksheet[address], {
            font: { bold: true },
            alignment: { horizontal: 'center', vertical: 'center' }
        });
    }
    for (let rowIndex = 7; rowIndex < totalRowNumber - 1; rowIndex += 1) {
        const address = `J${rowIndex + 1}`;
        if (worksheet[address]) {
            worksheet[address].z = '0%';
        }
    }

    const exportBook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(exportBook, worksheet, 'İdxal məlumatları');
    worksheet.B2.z = 'dd/mm/yyyy';
    ['F3', 'F4', 'F5'].forEach((address) => {
        if (worksheet[address]) {
            worksheet[address].z = '0.0000';
        }
    });
    exportBook.Workbook = exportBook.Workbook || {};
    exportBook.Workbook.CalcPr = {
        fullCalcOnLoad: true,
        forceFullCalc: true,
        calcMode: 'auto'
    };
    window.XLSX.writeFile(exportBook, 'İdxal_kalkulyatoru_exsport.xlsx');
    importCustomsSetExcelStatus(
        `Kalkulyator məlumatları Excel faylına eksport edildi (${products.length} məhsul sətri).`
    );
}

[
    importCustomsCurrency,
    importCustomsDate,
    importCustomsRate,
    importCustomsTransport,
    importCustomsTransportCurrency,
    importCustomsTransportRate,
    importCustomsAllocationMethod,
    importCustomsOther,
    importCustomsOtherCurrency,
    importCustomsOtherRate,
    importCustomsOtherAllocationMethod
].forEach((element) => {
    ['input', 'change'].forEach((eventName) => {
        element?.addEventListener(eventName, () => {
            if (element === importCustomsCurrency) {
                updateImportCustomsCurrencyLabels();
            }
            if (element === importCustomsCurrency || element === importCustomsDate) {
                loadImportCustomsRate();
                if (element === importCustomsDate) {
                    loadImportCustomsTransportRate();
                    loadImportCustomsOtherRate();
                }
                return;
            }
            if (element === importCustomsTransportCurrency) {
                loadImportCustomsTransportRate();
                return;
            }
            if (element === importCustomsOtherCurrency) {
                loadImportCustomsOtherRate();
                return;
            }
            if (element === importCustomsAllocationMethod) {
                updateImportCustomsWeightFields();
            }
            calculateImportCustoms();
        });
    });
});

importCustomsProducts?.addEventListener('input', (event) => {
    if (event.target.matches('[data-import-invoice], [data-import-duty-rate], [data-import-weight]')) {
        if (event.target.matches('[data-import-invoice], [data-import-weight]')) {
            updateImportCustomsWeightFields();
        }
        calculateImportCustoms();
    }
});

importCustomsProducts?.addEventListener('change', (event) => {
    if (event.target.matches('[data-import-invoice], [data-import-duty-rate], [data-import-weight]')) {
        if (event.target.matches('[data-import-invoice], [data-import-weight]')) {
            updateImportCustomsWeightFields();
        }
        calculateImportCustoms();
    }
});

importCustomsProducts?.addEventListener('click', (event) => {
    if (event.target.closest('[data-add-product]')) {
        addImportCustomsProductRow();
        return;
    }

    const removeButton = event.target.closest('[data-remove-product]');
    if (removeButton) {
        removeImportCustomsProductRow(
            removeButton.closest('[data-product-row]')
        );
    }
});

updateImportCustomsCurrencyLabels();
updateImportCustomsProductActionButtons();
updateImportCustomsWeightFields();
loadImportCustomsTransportRate();
loadImportCustomsOtherRate();
calculateImportCustoms();

importCustomsExcelFile?.addEventListener('change', async () => {
    const selectedFile = importCustomsExcelFile.files?.[0];
    if (!selectedFile) {
        return;
    }

    try {
        await importCustomsImportExcelFile(selectedFile);
    } catch (error) {
        console.error('Excel import xətası:', error);
        importCustomsSetExcelStatus(
            error?.message || 'Excel faylı oxunarkən xəta baş verdi.',
            true
        );
    } finally {
        importCustomsExcelFile.value = '';
    }
});

importCustomsExcelExport?.addEventListener('click', importCustomsExportExcelFile);

document.addEventListener('click', (event) => {
    if (event.target.closest('details')) {
        return;
    }

    document.querySelectorAll('details[open]').forEach((details) => {
        details.removeAttribute('open');
    });
});

/* =========================================================
   İLK GİRİŞ KALKULYATOR BANNERİ
   ========================================================= */

(() => {
    const storageKey = 'bestThinkCalculatorPromoSeen';

    const hasSeenPromo = () => {
        try {
            return window.localStorage.getItem(storageKey) === '1';
        } catch (error) {
            return false;
        }
    };

    const rememberPromo = () => {
        try {
            window.localStorage.setItem(storageKey, '1');
        } catch (error) {
            // Məhdud brauzer rejimində bannerin özü yenə işləməlidir.
        }
    };

    const showCalculatorPromo = () => {
        if (hasSeenPromo() || document.querySelector('.site-calculator-promo')) {
            return;
        }

        const banner = document.createElement('aside');
        banner.className = 'site-calculator-promo';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Kalkulyatorlar haqqında məlumat');
        banner.innerHTML = `
            <span class="site-calculator-promo-icon" aria-hidden="true">₼</span>
            <div class="site-calculator-promo-content">
                <h2>Kalkulyatorlardan istifadə edin</h2>
                <p>Əmək haqqı, məzənnə və yığım sığortasını daha rahat və sürətli hesablayın.</p>
            </div>
            <div class="site-calculator-promo-actions">
                <a class="site-calculator-promo-link" href="/kalkulyator.html">Kalkulyatorlara keç</a>
                <button class="site-calculator-promo-close" type="button" aria-label="Banneri bağla">×</button>
            </div>
        `;

        banner.querySelector('.site-calculator-promo-close')?.addEventListener('click', () => {
            banner.remove();
        });

        document.body.appendChild(banner);
        rememberPromo();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showCalculatorPromo, { once: true });
    } else {
        showCalculatorPromo();
    }
})();

/* =========================================================
   KALKULYATOR XƏTA BİLDİRİŞİ
   ========================================================= */

(() => {
    const calculatorReportCards = document.querySelectorAll('.calculator-grid .calculator-card');
    const modal = document.querySelector('#calculator-error-report-modal');
    const dialog = modal?.querySelector('.calculator-error-report-dialog');
    const closeButton = modal?.querySelector('.calculator-error-report-close');
    const form = document.querySelector('#calculator-error-report-form');
    const status = document.querySelector('#calculator-error-report-status');
    const calculatorSelect = document.querySelector('#calculator-error-report-calculator');
    const screenshotInput = document.querySelector('#calculator-error-report-screenshot');
    const phoneInput = form?.querySelector('[name="reporterPhone"]');
    const acceptedScreenshotTypes = new Set(['image/jpeg', 'image/png', 'image/gif']);
    const acceptedScreenshotName = /\.(?:jpe?g|png|gif)$/i;
    const maxScreenshotSize = 1024 * 1024;

    if (!calculatorReportCards.length || !modal || !dialog || !closeButton || !form || !calculatorSelect || !screenshotInput || !phoneInput) {
        return;
    }

    calculatorReportCards.forEach((card) => {
        const title = card.querySelector('.calculator-main-title');
        if (!title || card.querySelector('.calculator-error-report-card')) {
            return;
        }

        const reportArea = document.createElement('div');
        reportArea.className = 'calculator-error-report-card';

        const reportButton = document.createElement('button');
        reportButton.className = 'calculator-error-report-trigger';
        reportButton.type = 'button';
        reportButton.setAttribute('aria-haspopup', 'dialog');
        reportButton.innerHTML = `
            <span class="calculator-error-report-trigger-icon" aria-hidden="true">!</span>
            <span>Xəta bildir</span>
        `;
        reportButton.addEventListener('click', () => {
            openReportModal(title.textContent.trim().replace(/\s+/g, ' '));
        });

        reportArea.appendChild(reportButton);
        card.appendChild(reportArea);
    });

    calculatorReportCards.forEach((card) => {
        const title = card.querySelector('.calculator-main-title');
        const normalizedTitle = title?.textContent.trim().replace(/\s+/g, ' ');
        if (!normalizedTitle) {
            return;
        }

        const option = document.createElement('option');
        option.value = normalizedTitle;
        option.textContent = normalizedTitle;
        calculatorSelect.appendChild(option);
    });

    const requiredFieldMessages = {
        reporterName: 'Zəhmət olmasa, ad və soyadınızı daxil edin.',
        calculator: 'Zəhmət olmasa, kalkulyatoru seçin.',
        reporterEmail: 'Zəhmət olmasa, e-poçt ünvanınızı daxil edin.',
        reporterPhone: 'Zəhmət olmasa, əlaqə nömrənizi daxil edin.',
        problem: 'Zəhmət olmasa, xəta haqqında məlumatı yazın.'
    };

    form.addEventListener('invalid', (event) => {
        const field = event.target;
        let message = '';

        if (field.validity.valueMissing) {
            message = requiredFieldMessages[field.name] || 'Bu sahəni doldurun.';
        } else if (field.name === 'reporterEmail' && field.validity.typeMismatch) {
            message = 'Düzgün e-poçt ünvanı daxil edin.';
        } else if (field.name === 'reporterPhone' && field.validity.patternMismatch) {
            message = 'Nömrəni 050 123 45 67 formatında daxil edin.';
        }

        field.setCustomValidity(message);
    }, true);

    form.addEventListener('input', (event) => {
        event.target.setCustomValidity?.('');
    }, true);

    form.addEventListener('change', (event) => {
        event.target.setCustomValidity?.('');
    }, true);

    function getScreenshotValidationMessage(file) {
        if (!acceptedScreenshotName.test(file.name) || (file.type && !acceptedScreenshotTypes.has(file.type))) {
            return 'Yalnız JPG/JPEG, PNG və GIF formatlı şəkillər əlavə edin.';
        }
        if (file.size > maxScreenshotSize) {
            return 'Şəklin ölçüsü 1 MB-dan çox olmamalıdır.';
        }
        return '';
    }

    screenshotInput.addEventListener('change', () => {
        const file = screenshotInput.files?.[0];
        if (!file) {
            return;
        }

        const message = getScreenshotValidationMessage(file);
        if (message) {
            screenshotInput.value = '';
            if (status) {
                status.textContent = message;
            }
            return;
        }

        if (status) {
            status.textContent = '';
        }
    });

    const closeModal = () => {
        modal.hidden = true;
        closeButton.classList.remove('is-highlighted');
        document.body.classList.remove('calculator-report-open');
    };

    function openReportModal(calculatorName) {
        const calculatorField = form.querySelector('[name="calculator"]');
        const userAgentField = form.querySelector('[name="userAgent"]');

        if (calculatorField) {
            calculatorField.value = calculatorName || '';
        }
        if (userAgentField) {
            userAgentField.value = navigator.userAgent;
        }
        if (status) {
            status.textContent = '';
        }
        closeButton.classList.remove('is-highlighted');

        modal.hidden = false;
        document.body.classList.add('calculator-report-open');
        form.querySelector('[name="reporterName"]')?.focus();
    }

    closeButton.addEventListener('click', closeModal);

    phoneInput.addEventListener('input', () => {
        const digits = phoneInput.value.replace(/\D/g, '').slice(0, 10);
        const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)]
            .filter(Boolean);
        phoneInput.value = parts.join(' ');
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeButton.classList.add('is-highlighted');
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.hidden) {
            closeModal();
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const file = screenshotInput.files?.[0];
        const screenshotValidationMessage = file ? getScreenshotValidationMessage(file) : '';
        if (screenshotValidationMessage) {
            if (status) {
                status.textContent = screenshotValidationMessage;
            }
            return;
        }

        if (status) {
            status.textContent = 'Göndərilir...';
        }

        try {
            if (file) {
                const screenshot = await prepareScreenshot(file);
                form.querySelector('[name="fileData"]').value = screenshot.dataUrl;
                form.querySelector('[name="fileName"]').value = screenshot.fileName;
                form.querySelector('[name="fileType"]').value = screenshot.fileType;
            } else {
                form.querySelector('[name="fileData"]').value = '';
                form.querySelector('[name="fileName"]').value = '';
                form.querySelector('[name="fileType"]').value = '';
            }

            HTMLFormElement.prototype.submit.call(form);

            window.setTimeout(() => {
                if (status) {
                    status.textContent = 'Xəta bildirişiniz göndərildi. Təşəkkür edirik.';
                }
                form.reset();
                window.setTimeout(closeModal, 1400);
            }, 800);
        } catch (error) {
            console.error('Xəta bildirişi hazırlanarkən problem:', error);
            if (status) {
                status.textContent = 'Şəkil hazırlanmadı. Başqa şəkil seçib yenidən yoxlayın.';
            }
        }
    });

    function prepareScreenshot(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const image = new Image();
                image.onload = () => {
                    const maxSide = 1600;
                    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.max(1, Math.round(image.width * scale));
                    canvas.height = Math.max(1, Math.round(image.height * scale));
                    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);

                    resolve({
                        dataUrl: canvas.toDataURL('image/jpeg', .78),
                        fileName: 'best-think-xeta-screenshoti.jpg',
                        fileType: 'image/jpeg'
                    });
                };
                image.onerror = reject;
                image.src = reader.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
})();
