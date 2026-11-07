# Best Think veb-saytı — Claude üçün iş qaydaları

Mənbə: ChatGPT-dən təhvil sənədi (7 noyabr 2026). Kodla uyğun gəlməyən yer olsa, kod əsasdır və fərq istifadəçiyə bildirilir.

## Sayt nədir
- Best Think Konsaltinq — Azərbaycanda vergi, mühasibat, kadr və konsaltinq xidmətləri. Sayt Azərbaycan dilindədir.
- Məqsəd: xidmətləri aydın təqdim etmək, qiymət təklifi və pulsuz konsultasiya müraciətləri toplamaq. Bloq, kalkulyatorlar və faydalı məlumatlar köməkçi bölmələrdir.
- Canlı sayt: https://besthink.az/ — hostinq GitHub Pages, branch `main`.

## İstifadəçi ilə iş
- İstifadəçi proqramçı deyil. Cavab Azərbaycan dilində, qısa, sadə, texniki terminsiz olsun.
- **`main`-ə push = sayt dərhal canlıya çıxır.** Əvvəl dəyişikliyi göstər (ekran şəkli ilə), istifadəçi açıq şəkildə “reala göndər” deməyincə `main`-ə push etmə.
- Canlıya göndərdikdən sonra GitHub Actions-ın nəticəsini yoxla və bildir.
- Təsdiqlənmiş dizaynı qoru. Kiçik, yoxlanıla bilən dəyişikliklər et.

## Texniki quruluş
- Statik HTML/CSS/JavaScript. Ortaq `header.html` və `footer.html` dinamik yüklənir.
- `script.js` — ortaq funksiyalar, formalar, kalkulyatorlar, bloq filtrləri. Dəyişiklik bir neçə səhifəyə təsir edir.
- `style.css` — əsas dizayn; `hero-growth.css` və `footer-growth.css` — təsdiqlənmiş fonlar. Footer fonunda pəncərələrin qatlarını pozma.
- Workflow `.github/workflows/pages-and-dvx-sync.yml`: push, əl ilə başlatma, saatlıq DVX yoxlaması və deploy. DVX parser və son xəbərlər yoxlamalarını özü işlədir (`scripts/test-*.mjs`).
- Formalar Google Apps Script-ə bağlıdır. Apps Script kodu bu repoda deyil.
- `README.txt` köhnədir, cari təlimat kimi istifadə etmə.

## Dizayn
- Ağ / açıq mavi fon, tünd göy mətn, mavi və ölçülü yaşıl vurğular.
- Rənglər: navy `#0c1d36`, blue `#2466d3`, pale `#f5f8fc`, text `#13233e`. Şrift: Inter (ehtiyat Segoe UI, Tahoma, Arial).
- Mənbə keçidləri mavi və aydın seçilən olsun. Görünən mətn qısa ola bilər (“Marja.az”), keçid dəqiq məqaləyə aparmalıdır.

## Yeni bloq məqaləsi
- Lazım olanlar: əsas başlıq, kart üçün qısa başlıq, kateqoriya, istifadəçinin verdiyi tarix, mətn, əsas şəkil, lazım olsa mətndaxili şəkil, mənbələr.
- **Göndərilən mətni dəyişmə** — söz, rəqəm, məna. Hüquqi uyğunsuzluq şübhəsi varsa, ayrıca bildir.
- Tarixi özbaşına bugünkü tarixlə əvəz etmə.
- Kartı `blog.html`-ə əlavə et; ana səhifə son üç məqaləni `home-latest-blogs.js` ilə tarixə görə götürür.
- Yeni məqaləni `sitemap.xml`-ə əlavə et (sayt axtarışı da ondan istifadə edir).
- Bloq kateqoriyaları çoxseçimlidir; ikinci klik seçimi ləğv edir; “Hamısı” düyməsi yoxdur.

## Qəbul edilmiş qərarlar (istifadəçinin seçimi — dəyişmə)
- Təklif forması: ətraflı rejim + alternativ “Mənimlə əlaqə saxlanılsın” (ad, mövzu, telefon, e-poçt).
- “Sorğunuzun xülasəsi” vergi öhdəliklərindən sonra, mobil nömrədən əvvəl; məlumat daxil olduqca yenilənir.
- Vergi mükəlləfiyyətində ilk seçim “Bilmirəm”; başqa seçimlə qarşılıqlı ləğv olunur.
- Təklif pəncərəsinin kənarına klik pəncərəni bağlamır, onun daxilini başa sürüşdürür.
- Müraciət uğurlu olanda görünən təsdiq mesajı mütləqdir.
- Xidmətlərdə hər xidmətin öz FAQ-ı (başlanğıcda bağlı); ümumi FAQ bloku çıxarılıb. Sonda “Qiymət təklifi al” və “Pulsuz konsultasiya” banneri.
- Ana səhifədə yalnız altı sahə: İstehsal; Ticarət; Xidmət; Kənd təsərrüfatı; Turizm və ictimai iaşə; Texnologiya xidmətləri.
- Əməkdaşlığın dörd mərhələsi adi kartlarla (kitab variantı ləğv edilib), faydalardan əvvəl.
- Haqqımızda: təsisçi və təhsil məlumatı yoxdur; “Müəssisənin siyasəti” qalır.
- Konsultasiya şərtləri kiçik “Şərtlərlə tanış olun” keçidi ilə açılır, başlanğıcda bağlı.
- Banner hündürlüyü ilə illüstrasiya ölçüsü ayrı-ayrı dəyişdirilir.

## Açıq məsələlər (həll edilməyib)
1. Kirayə və oyuncaq məqalələrində `noindex` var — səbəbi bilinmir, istifadəçidən soruş.
2. `Bloglar/kalkulyator.html` köhnədir, saxlanma səbəbi bilinmir.
3. Dörd əməkdaşlıq GIF-inin sinxronluğu təsdiqlənməyib.
4. Apps Script-in canlı versiyası, poçt qutusu, domen müddəti yoxlanmayıb.
5. Loqo seçimi təsdiqlənməyib.
6. Xarici saytlardan götürülən ideyalar (paketlər, rəylər, rezervasiya və s.) yalnız təklifdir, təsdiq yoxdur.
