// BodyBuddy blog — reading progress, table of contents, reveals.

document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const lapBar = $('#lapBar');
  const header = $('#siteHeader');
  const article = $('.article-body');

  /* ---------- Table of contents, built from the section headings ---------- */
  const toc = $('#toc');
  const sections = $$('.post-section');
  let links = [];
  if (toc && sections.length) {
    const title = document.createElement('p');
    title.className = 'toc-title';
    title.textContent = 'במאמר';
    const list = document.createElement('ol');
    sections.forEach((sec, i) => {
      const h2 = $('h2', sec);
      if (!h2) return;
      sec.id = sec.id || `s${i + 1}`;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${sec.id}`;
      a.textContent = h2.textContent;
      li.appendChild(a);
      list.appendChild(li);
      links.push({ a, sec });
    });
    toc.append(title, list);
  }

  /* ---------- Reveal ---------- */
  const reveals = $$('.post-section, .summary, .post-cta');
  if ('IntersectionObserver' in window) {
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); ro.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => ro.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Scroll-linked ---------- */
  let ticking = false;
  const update = () => {
    ticking = false;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);

    if (lapBar) {
      if (article) {
        // reading progress: from the top of the article to its end
        const r = article.getBoundingClientRect();
        const total = r.height - window.innerHeight * 0.5;
        lapBar.style.transform = `scaleX(${clamp((window.innerHeight * 0.3 - r.top) / Math.max(1, total))})`;
      } else {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        lapBar.style.transform = `scaleX(${clamp(window.scrollY / max)})`;
      }
    }

    if (links.length) {
      let current = links[0];
      links.forEach((l) => { if (l.sec.getBoundingClientRect().top <= window.innerHeight * 0.35) current = l; });
      links.forEach((l) => l.a.classList.toggle('is-active', l === current));
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
});
