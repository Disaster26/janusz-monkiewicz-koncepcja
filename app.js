(function () {
  'use strict';
  var d = document;
  var nag = d.getElementById('nag'), burger = d.getElementById('burger'), menu = d.getElementById('menu');

  /* nagłówek na zdjęciu tylko na samej górze (komputer) */

  /* menu mobilne */
  function zamknij() { menu.classList.remove('otwarte'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); }
  burger.addEventListener('click', function () {
    var o = menu.classList.toggle('otwarte');
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    burger.setAttribute('aria-label', o ? 'Zamknij menu' : 'Otwórz menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) zamknij(); });

  /* aktywna pozycja menu */
  var linki = [].slice.call(menu.querySelectorAll('a'));
  var cele = linki.map(function (a) { return d.querySelector(a.getAttribute('href')); });
  var tick = false;
  function aktywna() {
    tick = false;
    var y = window.scrollY + window.innerHeight * 0.35, k = -1;
    cele.forEach(function (s, i) { if (s && s.offsetTop <= y && s.offsetTop + s.offsetHeight > y) k = i; });
    linki.forEach(function (a, i) { if (i === k) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(aktywna); } }, { passive: true });
  window.addEventListener('load', function () { requestAnimationFrame(aktywna); });

  /* zakładki galerii */
  var zak = [].slice.call(d.querySelectorAll('.zakladki [role=tab]'));
  function wybierz(t, fokus) {
    zak.forEach(function (b) {
      var on = b === t;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
      d.getElementById(b.getAttribute('aria-controls')).hidden = !on;
    });
    if (fokus) t.focus();
  }
  zak.forEach(function (b, i) {
    b.addEventListener('click', function () { wybierz(b); });
    b.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = zak[(i + 1) % zak.length];
      if (e.key === 'ArrowLeft') n = zak[(i - 1 + zak.length) % zak.length];
      if (e.key === 'Home') n = zak[0];
      if (e.key === 'End') n = zak[zak.length - 1];
      if (n) { e.preventDefault(); wybierz(n, true); }
    });
  });

  /* lightbox: cały kadr, podpis, licznik klatek, strzałki, gest, Esc */
  var ikX = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  var ikL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 2 4 8l6 6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  var ikP = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 2l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  var lb = d.createElement('div');
  lb.className = 'lb'; lb.hidden = true;
  lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Powiększone zdjęcie');
  lb.innerHTML = '<div class="lb-gora"><span class="lb-licznik" aria-live="polite"></span><button type="button" class="lb-x" aria-label="Zamknij">' + ikX + '</button></div>' +
    '<div class="lb-scena"><span class="lb-kadr"><img alt=""></span><button type="button" class="lb-strz lb-l" aria-label="Poprzednie zdjęcie">' + ikL + '</button><button type="button" class="lb-strz lb-p" aria-label="Następne zdjęcie">' + ikP + '</button></div>' +
    '<div class="lb-dol"><div class="lb-podpis"></div><button type="button" class="lb-zapytaj">Zapytaj o to zdjęcie</button></div>';
  d.body.appendChild(lb);
  var lbImg = lb.querySelector('img'), lbLicz = lb.querySelector('.lb-licznik'), lbPod = lb.querySelector('.lb-podpis'), scena = lb.querySelector('.lb-scena');
  var lista = [], ix = 0, powrot = null;

  function pokaz(i) {
    ix = (i + lista.length) % lista.length;
    var im = lista[ix], fig = im.closest('figure'), cap = fig && fig.querySelector('figcaption');
    lbImg.src = im.dataset.full; lbImg.width = +im.dataset.w; lbImg.height = +im.dataset.h; lbImg.alt = im.alt;
    lbImg.style.transform = ''; lbImg.style.opacity = '';
    lbPod.innerHTML = cap ? cap.innerHTML : '';
    lbLicz.textContent = 'Klatka ' + (ix + 1) + ' z ' + lista.length;
    var jeden = lista.length < 2;
    lb.querySelector('.lb-l').hidden = jeden; lb.querySelector('.lb-p').hidden = jeden;
    var nast = lista[(ix + 1) % lista.length];
    if (nast && nast !== im) (window.requestIdleCallback || setTimeout)(function () { var p = new Image(); p.src = nast.dataset.full; });
  }
  function otworz(im) {
    var panel = im.closest('.panel');
    lista = panel ? [].slice.call(panel.querySelectorAll('img[data-full]')) : [im];
    powrot = im;
    lb.hidden = false; d.body.classList.add('lb-otwarty');
    pokaz(lista.indexOf(im));
    lb.querySelector('.lb-x').focus();
  }
  function zamknijLb() {
    lb.hidden = true; d.body.classList.remove('lb-otwarty'); lbImg.removeAttribute('src');
    if (powrot && powrot.focus) powrot.focus({ preventScroll: true });
  }
  [].forEach.call(d.querySelectorAll('img[data-full]'), function (im) {
    im.tabIndex = 0; im.setAttribute('role', 'button');
    im.setAttribute('aria-label', 'Powiększ zdjęcie: ' + im.alt);
    im.addEventListener('click', function () { otworz(im); });
    im.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); otworz(im); } });
  });
  lb.querySelector('.lb-x').addEventListener('click', zamknijLb);
  lb.querySelector('.lb-zapytaj').addEventListener('click', function () {
    var im = lista[ix], fig = im.closest('figure'), b = fig && fig.querySelector('figcaption b'), m = fig && fig.querySelector('figcaption .miejsce-f, figcaption span:not(.nr)');
    var pole = d.getElementById('f-zdjecie');
    pole.value = (b ? b.textContent : im.alt) + (m ? ', ' + m.textContent : '');
    powrot = null; zamknijLb();
    d.getElementById('kontakt').scrollIntoView();
    d.getElementById('f-imie').focus({ preventScroll: true });
  });
  lb.querySelector('.lb-l').addEventListener('click', function () { pokaz(ix - 1); });
  lb.querySelector('.lb-p').addEventListener('click', function () { pokaz(ix + 1); });
  scena.addEventListener('click', function (e) { if (e.target === scena) zamknijLb(); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); zamknijLb(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); pokaz(ix + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); pokaz(ix - 1); }
    else if (e.key === 'Tab') {
      var f = [].filter.call(lb.querySelectorAll('button'), function (b) { return !b.hidden && b.offsetParent !== null; });
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && d.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && d.activeElement === z) { e.preventDefault(); a.focus(); }
      else if (f.indexOf(d.activeElement) < 0) { e.preventDefault(); a.focus(); }
    }
  });
  /* gest palcem: w bok = następne/poprzednie, w dół = zamknij */
  var x0 = null, y0 = 0;
  scena.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; x0 = e.clientX; y0 = e.clientY; });
  scena.addEventListener('pointermove', function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0, dy = e.clientY - y0;
    if (Math.abs(dy) > Math.abs(dx) && dy > 0) { lbImg.style.transform = 'translateY(' + dy + 'px)'; lbImg.style.opacity = String(Math.max(0.3, 1 - dy / 400)); }
    else lbImg.style.transform = 'translateX(' + dx + 'px)';
  });
  scena.addEventListener('pointerup', function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
    if (dy > 90 && Math.abs(dy) > Math.abs(dx)) zamknijLb();
    else if (dx < -50) pokaz(ix + 1);
    else if (dx > 50) pokaz(ix - 1);
    else { lbImg.style.transform = ''; lbImg.style.opacity = ''; }
  });
  scena.addEventListener('pointercancel', function () { x0 = null; lbImg.style.transform = ''; lbImg.style.opacity = ''; });

  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.hidden) zamknij(); });

  /* formularz pokazowy */
  var f = d.getElementById('formularz'), info = d.getElementById('info-form');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var brak = [].filter.call(f.querySelectorAll('[required]'), function (el) { return !el.value.trim(); });
    if (brak.length) { brak[0].focus(); info.textContent = 'Proszę uzupełnić imię, e-mail i opis zdjęcia. To wersja pokazowa: formularz niczego nie wysyła.'; return; }
    info.textContent = 'Dziękuję. Na gotowej stronie zapytanie trafi na monkiewicz@janusz-monkiewicz.pl (w podglądzie nic nie zostało wysłane).';
  });

  /* po odświeżeniu zaczynaj od góry (chyba że link prowadzi do sekcji) */
  if ('scrollRestoration' in history && !location.hash) { history.scrollRestoration = 'manual'; window.scrollTo(0, 0); }

  /* płynne wejście treści przy przewijaniu */
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var el = d.querySelectorAll('.cytat, .om-uklad, .ar-glowa, .za-tekst, .za-zdjecia, .dorobek h2, .do-uklad, .kontakt');
    d.documentElement.classList.add('anim');
    var io = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) { if (w.isIntersecting) { w.target.classList.add('widoczne'); io.unobserve(w.target); } });
    }, { rootMargin: '0px 0px 40px 0px' });
    [].forEach.call(el, function (e) { e.classList.add('wejscie'); io.observe(e); });
  }

  var rok = d.getElementById('rok'); if (rok) rok.textContent = new Date().getFullYear();
})();
