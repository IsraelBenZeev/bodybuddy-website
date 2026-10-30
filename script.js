// BodyBuddy — sticky phone chapters, drifting screen wall, scroll-linked details.

// A refresh always opens at the top of the page.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const desktop = window.matchMedia('(min-width: 901px)');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Hero wall: duplicate each track so the drift loops seamlessly ---------- */
  $$('.col-track').forEach((track) => {
    Array.from(track.children).forEach((img) => {
      const c = img.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      track.appendChild(c);
    });
  });

  /* ---------- About: words light up as you read ---------- */
  const about = $('#aboutText');
  const words = [];
  if (about) {
    const walk = (node, accent) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok.trim()) { frag.appendChild(document.createTextNode(tok)); return; }
            const s = document.createElement('span');
            s.className = 'w' + (accent ? ' accent-text' : '');
            s.textContent = tok;
            words.push(s);
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          walk(n, accent || n.classList.contains('accent-text'));
        }
      });
    };
    walk(about, false);
  }

  /* ---------- Chapters: build the phone's screen stack from the steps ---------- */
  const chapters = $$('.chapter').map((chapter) => {
    const steps = $$('.step', chapter);
    const screen = $('.phone-screen', chapter);
    const stack = steps.map((step, i) => {
      const src = $('.step-shot', step);
      const img = document.createElement('img');
      img.className = 'scr' + (i === 0 ? ' is-active' : '');
      img.src = src.currentSrc || src.src;
      img.alt = '';
      img.decoding = 'async';
      screen.appendChild(img);
      return img;
    });
    return { chapter, steps, stack, current: 0, stepsEl: $('.steps', chapter), phone: $('.phone', chapter), head: $('.chapter-head', chapter) };
  });

  const show = (c, idx) => {
    if (idx === c.current) return;
    const prev = c.stack[c.current];
    c.stack.forEach((s) => s.classList.remove('was-active'));
    prev.classList.remove('is-active');
    prev.classList.add('was-active');
    c.stack[idx].classList.add('is-active');
    c.steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    c.current = idx;
    setTimeout(() => { if (c.current === idx) prev.classList.remove('was-active'); }, 950);
  };

  /* ---------- Reveal ---------- */
  const reveals = [...$$('.reveal'), ...$$('.chapter-head')];
  if ('IntersectionObserver' in window) {
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); ro.unobserve(e.target); }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => ro.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Scroll-linked ---------- */
  const barbell = $('#barbell');
  const barFill = $('#barbellFill');
  const plates = $$('.bb-plate');
  const download = $('#download');
  const header = $('#siteHeader');
  let ticking = false;

  const update = () => {
    ticking = false;
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);

    // barbell: the shaft fills with the page, a plate pair loads as each chapter starts, the last one at the download
    if (barbell) {
      barFill.style.setProperty('--p', clamp(window.scrollY / max).toFixed(3));
      const marks = [...chapters.map((c) => c.chapter.getBoundingClientRect().top < window.innerHeight * 0.5),
        download.getBoundingClientRect().top < window.innerHeight * 0.75 || window.scrollY >= max - 2];
      plates.forEach((p, i) => p.classList.toggle('on', marks[i]));
      const full = marks.every(Boolean);
      if (full && !barbell.classList.contains('is-lifted') && !reduced) barbell.classList.add('is-lifted');
      if (!full) barbell.classList.remove('is-lifted');
    }

    chapters.forEach((c) => {
      const r = c.stepsEl.getBoundingClientRect();
      const f = clamp((window.innerHeight * 0.5 - r.top) / r.height);
      c.stepsEl.style.setProperty('--fill', f.toFixed(3));
      c.chapter.style.setProperty('--draw', reduced ? '1' : f.toFixed(3));
      // which step is being read: the one under the probe line (middle of the screen on desktop, just under the pinned phone on mobile)
      const col = c.phone.parentElement.getBoundingClientRect();
      const probe = desktop.matches ? window.innerHeight * 0.5 : col.bottom + 90;
      let idx = -1;
      c.steps.forEach((st, i) => { const sr = st.getBoundingClientRect(); if (sr.top <= probe && sr.bottom > probe) idx = i; });
      if (idx >= 0) show(c, idx);
      // the phone slowly turns as you move through the chapter
      if (!reduced) c.phone.style.setProperty('--ry', `${((desktop.matches ? -10 : -6) + f * (desktop.matches ? 20 : 12)).toFixed(1)}deg`);
    });

    if (words.length) {
      if (reduced) { words.forEach((w) => w.classList.add('on')); return; }
      const r = about.getBoundingClientRect();
      const start = window.innerHeight * 0.85;
      const end = window.innerHeight * 0.3;
      const prog = clamp((start - r.top) / (start - end + r.height * 0.6));
      const n = Math.round(prog * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    }
  };

  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* ---------- Hero: logo follows the pointer a little ---------- */
  const hero = $('#hero');
  const logo = $('#heroLogo');
  if (hero && logo && !reduced && fine) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      logo.style.setProperty('--lx', `${(x * 22).toFixed(1)}px`);
      logo.style.setProperty('--ly', `${(y * 14).toFixed(1)}px`);
    });
    hero.addEventListener('pointerleave', () => {
      logo.style.removeProperty('--lx');
      logo.style.removeProperty('--ly');
    });
  }

  /* ---------- Magnetic primary button ---------- */
  if (!reduced && fine) {
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${(x * 0.18).toFixed(1)}px, ${(y * 0.28).toFixed(1)}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }
});
