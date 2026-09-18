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
    ? '../header.html?v=3'
    : './header.html?v=3';

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
        const response = await fetch('/footer.html?v=1');

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

const calculatorPageIntro =
    document.querySelector('.calculator-page .section-head');

function updateCalculatorPageIntro() {
    if (!calculatorPageIntro) {
        return;
    }

    const isCalculatorOpen = Array.from(calculatorCards)
        .some((card) => card.classList.contains('is-open'));

    calculatorPageIntro.classList.toggle(
        'is-hidden',
        isCalculatorOpen
    );
}

calculatorCards.forEach((card) => {
    const expandButton = card.querySelector('.calculator-expand');
    const calculatorTitleArea =
        card.querySelector('.calculator-title > div:nth-child(2)');

    if (!expandButton) {
        return;
    }

    const toggleCalculatorCard = () => {
        const shouldOpen = !card.classList.contains('is-open');
        const calculatorTitle =
            card.querySelector('.calculator-main-title');

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

        if (shouldOpen) {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    expandButton.addEventListener('click', toggleCalculatorCard);

    if (calculatorTitleArea) {
        calculatorTitleArea.addEventListener('click', toggleCalculatorCard);
    }
});

updateCalculatorPageIntro();

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
