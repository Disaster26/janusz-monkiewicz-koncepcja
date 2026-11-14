(function () {
  'use strict';
  var d = document, start = [];
  var nag = d.getElementById('nag'), burger = d.getElementById('burger'), menu = d.getElementById('menu');

  /* nagłówek: przezroczysty na zdjęciu, biały po przewinięciu */
  function tlo() { nag.classList.toggle('pelny', window.scrollY > 40); }
  window.addEventListener('scroll', tlo, { passive: true });

  /* menu mobilne */
  function zamknij() { menu.classList.remove('otwarte'); nag.classList.remove('menu-otwarte'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); }
  burger.addEventListener('click', function () {
    var o = menu.classList.toggle('otwarte');
    nag.classList.toggle('menu-otwarte', o);
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    burger.setAttribute('aria-label', o ? 'Zamknij menu' : 'Otwórz menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) zamknij(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') zamknij(); });

  /* aktywna pozycja menu: dokładnie bieżąca sekcja */
  var linki = [].slice.call(menu.querySelectorAll('a'));
  var cele = linki.map(function (a) { return d.querySelector(a.getAttribute('href')); });
  var tick = false;
  function aktywna() {
    tick = false;
    var y = window.scrollY + window.innerHeight * 0.35, ix = -1;
    cele.forEach(function (s, i) { if (s && s.offsetTop <= y && s.offsetTop + s.offsetHeight > y) ix = i; });
    linki.forEach(function (a, i) { if (i === ix) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(aktywna); } }, { passive: true });

  /* pasy zdjęć: palec, mysz, strzałki (nieaktywne na końcach), klawiatura */
  var strzL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  var strzP = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  [].forEach.call(d.querySelectorAll('[data-pas]'), function (tor) {
    var glowa = tor.parentNode.querySelector('.pas-glowa');
    glowa.innerHTML = '<button type="button" class="strz" aria-label="Poprzednie zdjęcia">' + strzL + '</button><button type="button" class="strz" aria-label="Następne zdjęcia">' + strzP + '</button>';
    var b = glowa.querySelectorAll('button');
    function krok() { var k = tor.firstElementChild; return k ? k.getBoundingClientRect().width + 12 : tor.clientWidth; }
    b[0].addEventListener('click', function () { tor.scrollBy({ left: -krok(), behavior: 'smooth' }); });
    b[1].addEventListener('click', function () { tor.scrollBy({ left: krok(), behavior: 'smooth' }); });
    function stan() { b[0].disabled = tor.scrollLeft < 8; b[1].disabled = tor.scrollLeft + tor.clientWidth > tor.scrollWidth - 8; }
    tor.addEventListener('scroll', function () { requestAnimationFrame(stan); }, { passive: true });
    window.addEventListener('resize', function () { requestAnimationFrame(stan); }); start.push(stan);
    tor.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); tor.scrollBy({ left: krok(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); tor.scrollBy({ left: -krok(), behavior: 'smooth' }); }
    });
    var x0 = 0, s0 = 0, ruch = false, wcisniety = false;
    tor.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      wcisniety = true; ruch = false; x0 = e.clientX; s0 = tor.scrollLeft; e.preventDefault();
    });
    window.addEventListener('pointermove', function (e) {
      if (!wcisniety) return;
      var dx = e.clientX - x0;
      if (!ruch && Math.abs(dx) > 4) { ruch = true; tor.classList.add('ciagnie'); }
      if (ruch) tor.scrollLeft = s0 - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!wcisniety) return;
      wcisniety = false;
      if (ruch) { tor.classList.remove('ciagnie'); var w = krok(); tor.scrollTo({ left: Math.round(tor.scrollLeft / w) * w, behavior: 'smooth' }); }
    });
  });

  /* formularz pokazowy */
  var f = d.getElementById('formularz'), info = d.getElementById('info-form');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var brak = [].filter.call(f.querySelectorAll('[required]'), function (el) { return !el.value.trim(); });
    if (brak.length) { brak[0].focus(); info.textContent = 'Proszę uzupełnić imię, e-mail i opis zdjęcia. To wersja pokazowa: formularz niczego nie wysyła.'; return; }
    info.textContent = 'Dziękuję. Na gotowej stronie zapytanie trafi na monkiewicz@janusz-monkiewicz.pl (w podglądzie nic nie zostało wysłane).';
  });

  window.addEventListener('load', function () { requestAnimationFrame(function () { tlo(); aktywna(); start.forEach(function (f) { f(); }); }); });
  var rok = d.getElementById('rok'); if (rok) rok.textContent = new Date().getFullYear();
})();
