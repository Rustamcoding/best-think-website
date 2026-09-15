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
        gross > 0 && gross <= 2500 ? 200 : 0;

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

const salaryTaxExemptionOptions =
    document.querySelectorAll('input[name="salary-tax-exemption"]');

const salaryDeductionType =
    document.getElementById('salary-deduction-type');

const salaryOtherDeduction =
    document.getElementById('salary-other-deduction');

const salaryOtherDeductionSuffix =
    document.getElementById('salary-other-deduction-suffix');

const salaryTaxGrossResult =
    document.getElementById('salary-gross-result');

const salaryStageBasicExemptionResult =
    document.getElementById('salary-basic-exemption-result');

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

const salaryTotalTaxResult =
    document.getElementById('salary-total-result');

const salaryNetTaxResult =
    document.getElementById('salary-net-result');

const salaryResultTitle =
    document.getElementById('salary-result-title');


function formatSalaryAZN(value) {

    return new Intl.NumberFormat(
        'az-AZ',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(Math.max(0, value)) + ' AZN';

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
            ? 200
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

    const totalDeductions =
        Math.min(
            gross,
            incomeTax + limitedOtherDeduction
        );

    return {
        gross,
        basicExemption,
        taxableIncome,
        incomeTax,
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

    const selectedTaxExemption =
        document.querySelector('input[name="salary-tax-exemption"]:checked');

    const taxExemption = selectedTaxExemption
        ? Math.max(0, parseFloat(selectedTaxExemption.value) || 0)
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

    if (salaryHeroTaxExemptionResult) {
        salaryHeroTaxExemptionResult.textContent = formatSalaryAZN(taxExemption);
    }

    if (salaryExemptionSelection) {
        salaryExemptionSelection.textContent = selectedTaxExemption
            ? `${selectedTaxExemption.dataset.code} (${formatSalaryAZN(taxExemption)})`
            : 'Seçilməyib';
    }

    if (salaryStageTaxableResult) {
        salaryStageTaxableResult.textContent = formatSalaryAZN(taxableIncome);
    }

    if (salaryStageTaxResult) {
        salaryStageTaxResult.textContent = formatSalaryAZN(incomeTax);
    }

    if (salaryOtherDeductionResult) {
        salaryOtherDeductionResult.textContent = formatSalaryAZN(limitedOtherDeduction);
    }

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
    salaryMainWorkplace.addEventListener('change', calculateSalaryTaxOnly);
}

salaryTaxExemptionOptions.forEach((option) => {
    option.addEventListener('change', calculateSalaryTaxOnly);
});

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
calculateSalaryTaxOnly();
