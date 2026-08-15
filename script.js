const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav nav');

if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
        nav.classList.toggle('open');
    });
}
