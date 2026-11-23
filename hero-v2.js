/* Ana səhifə — ilk ekrandakı telefon maketində canlı yazışma. */
(function () {
    const box = document.getElementById('hero-v2-chat');
    if (!box) return;

    const conversation = [
        ['client', 'Salam! Yeni şirkət açıram. Kömək edə bilərsinizmi?'],
        ['team', 'Salam! Əlbəttə. Qeydiyyatdan ilk hesabatlara qədər bütün prosesi biz aparırıq.'],
        ['client', 'Best Think digər şirkətlərdən nə ilə fərqlənir?'],
        ['team', 'Biz təcrübəmiz, vicdanlı yanaşmamız və dəqiq işimizlə fərqlənirik.'],
        ['client', 'Konsaltinq şirkətimi dəyişmək istəyirəm. Sənədləri təhlükəsiz təhvil ala bilərsinizmi?'],
        ['team', 'Bəli. İşi təhvil alarkən bütün sənədləri hesabatlarla üzləşdirir və məxfiliyi qoruyuruq.'],
        ['client', 'Aylıq xidmət haqqı nəyə görə müəyyən olunur?'],
        ['team', 'Xidmət haqqı işin həcminə, işçilərin sayına və təsərrüfat obyektlərinin sayına görə müəyyən olunur.'],
        ['client', 'Hesabatları hansı müddətlərdə təqdim edirsiniz?'],
        ['team', 'Hər biznesə fərdi yanaşırıq: razılaşdırılmış qrafiklə günlük, həftəlik və ya aylıq hesabatlar təqdim edirik.']
    ];
    const STEP = 2600;
    const narrow = window.matchMedia('(max-width: 800px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    const message = (who, text) => {
        const el = document.createElement('div');
        el.className = 'hero-v2-msg ' + (who === 'client' ? 'is-client' : 'is-team');
        el.textContent = text;
        return el;
    };
    const trim = () => {
        if (!narrow.matches) return;
        while (box.children.length > 2) box.firstChild.remove();
    };

    if (reduced.matches) {
        box.append(message(...conversation[0]), message(...conversation[1]));
        return;
    }

    let i = 0;
    const step = () => {
        if (i >= conversation.length) {
            setTimeout(() => { box.replaceChildren(); i = 0; step(); }, 4000);
            return;
        }
        const [who, text] = conversation[i];
        const add = () => {
            box.append(message(who, text));
            trim();
            i += 1;
            setTimeout(step, STEP);
        };
        if (who === 'team') {
            trim();
            const typing = document.createElement('div');
            typing.className = 'hero-v2-msg is-team is-typing';
            typing.innerHTML = '<i></i><i></i><i></i>';
            box.append(typing);
            setTimeout(() => { typing.remove(); add(); }, STEP);
        } else {
            add();
        }
    };
    setTimeout(step, 600);
})();
