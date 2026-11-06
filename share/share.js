// דף שיתוף: /share?t=<token> (תוכנית אימון) או /share?e=<exerciseId> (תרגיל).
// מי שהאפליקציה מותקנת אצלו לא מגיע לכאן — אנדרואיד פותח את האפליקציה ישירות (App Links).
// כל טקסט מהשרת נכנס דרך textContent בלבד: שם התוכנית והתיאור נכתבו על ידי משתמשים.
(function () {
  'use strict';

  var API_BASE = 'https://bodybuddy-server-eta.vercel.app/share';
  var PACKAGE = 'com.ibz1330.bodybuddy';
  var PLAY_URL = 'https://play.google.com/store/apps/details?id=' + PACKAGE;
  var WEEK_DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var params = new URLSearchParams(window.location.search);
  var token = params.get('t');
  var exerciseId = params.get('e');

  function $(id) { return document.getElementById(id); }
  function show(id) { $(id).hidden = false; }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  $('year').textContent = String(new Date().getFullYear());

  function thumb(url, width) {
    if (!url) return null;
    var marker = '/upload/';
    var i = url.indexOf(marker);
    if (url.indexOf('res.cloudinary.com') === -1 || i === -1) return url;
    var at = i + marker.length;
    return url.slice(0, at) + 'f_auto,q_auto,w_' + width + '/' + url.slice(at);
  }

  function formatMinutes(total) {
    var m = Math.max(0, Math.round(Number(total) || 0));
    if (m < 60) return m + ' דק׳';
    var h = Math.floor(m / 60);
    var rest = m % 60;
    var hl = h === 1 ? 'שעה' : h === 2 ? 'שעתיים' : h + ' שעות';
    return rest ? hl + ' ו-' + rest + ' דק׳' : hl;
  }

  function unique(arr) {
    var seen = {};
    return arr.filter(function (x) { if (!x || seen[x]) return false; seen[x] = true; return true; });
  }

  function fillChips(listId, items) {
    var list = $(listId);
    (items || []).forEach(function (text) { if (text) list.appendChild(el('li', null, text)); });
    if (list.children.length) show(listId);
  }

  function setHero(title, line) {
    var h = $('heroTitle');
    h.textContent = title;
    $('heroLine').textContent = line || '';
    // the stroke under the title paints in once the real title is there
    requestAnimationFrame(function () { document.querySelector('.share-hero').classList.add('is-ready'); });
  }

  // ---- the chapter: head stroke + the week bars grow once, when it comes into view ----
  function revealChapter() {
    var chapter = $('details');
    var head = $('chapterHead');
    function run() {
      head.classList.add('is-visible');
      if (reduced) { chapter.style.setProperty('--draw', '1'); return; }
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / 1100);
        var eased = 1 - Math.pow(1 - t, 4);
        chapter.style.setProperty('--draw', String(eased));
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { run(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); run(); } });
    }, { threshold: 0.2 });
    io.observe(chapter);
  }

  function drawWeek(activeDays) {
    var svg = $('weekChart');
    var ns = 'http://www.w3.org/2000/svg';
    WEEK_DAYS.forEach(function (d, k) {
      var on = activeDays.indexOf(d) !== -1;
      var r = document.createElementNS(ns, 'rect');
      var h = on ? 300 : 70;
      // RTL: Sunday (א) is the rightmost bar
      r.setAttribute('x', String(880 - k * 140));
      r.setAttribute('y', String(400 - h));
      r.setAttribute('width', '64');
      r.setAttribute('height', String(h));
      r.setAttribute('rx', '6');
      r.setAttribute('style', '--k:' + k);
      if (on) r.setAttribute('class', 'is-on');
      svg.appendChild(r);
    });
  }

  function showError(message) {
    setHero('הקישור לא נפתח', message || 'הקישור לא תקין או שהשיתוף בוטל. אפשר לבקש ממי ששלח אותו לשתף שוב.');
    show('heroHome');
    setupCta(null);
  }

  function setupCta(kind) {
    if (kind === 'plan') {
      $('ctaTitle').textContent = 'קחו את התוכנית איתכם';
      $('ctaText').textContent = 'התוכנית מחכה לכם באפליקציה: הורידו את BodyBuddy בחינם, התחברו, ולחצו שוב על הקישור כדי להוסיף אותה לתוכניות שלכם.';
    } else if (kind === 'exercise') {
      $('ctaTitle').textContent = 'עוד מאה תרגילים מחכים';
      $('ctaText').textContent = 'עם סרטונים, הוראות ומעקב אחרי המשקלים שלכם. הורידו את BodyBuddy בחינם ובנו תוכנית משלכם.';
    }
    $('playLink').href = PLAY_URL;
    if (kind && /android/i.test(navigator.userAgent)) {
      // פותח את האפליקציה דרך ה-scheme שלה; אם היא לא מותקנת — עובר ל-Google Play
      var query = token ? 't=' + encodeURIComponent(token) : 'e=' + encodeURIComponent(exerciseId);
      $('openInApp').href = 'intent://share?' + query + '#Intent;scheme=bodybuddy;package=' + PACKAGE +
        ';S.browser_fallback_url=' + encodeURIComponent(PLAY_URL) + ';end';
      show('openInApp');
    }
  }

  function renderPlan(plan) {
    var title = plan.title || 'תוכנית אימון';
    var exercises = plan.exercises || [];
    var days = plan.days_per_week || [];
    document.title = title + ' · BodyBuddy';

    setHero(title, plan.sender_name
      ? 'תוכנית האימון של ' + plan.sender_name + ', ששותפה איתך.'
      : 'שיתפו איתך את תוכנית האימון הזו.');
    $('figTime').textContent = formatMinutes(plan.time);
    $('figDifficulty').textContent = (plan.difficulty || 0) + '/10';
    $('figCount').textContent = String(exercises.length);
    show('heroFigures');
    show('heroCta');

    $('chapterTitle').textContent = 'התוכנית';
    $('chapterSub').textContent = plan.description ||
      (days.length ? days.length + ' ימי אימון בשבוע, ' : '') + exercises.length + ' תרגילים לפי הסדר.';

    var week = $('planDays');
    WEEK_DAYS.forEach(function (d) {
      var on = days.indexOf(d) !== -1;
      var li = el('li', on ? 'on' : null, d);
      li.setAttribute('aria-label', 'יום ' + d + (on ? ', יום אימון' : ''));
      week.appendChild(li);
    });
    drawWeek(days);

    fillChips('planAreas', unique(exercises.reduce(function (acc, e) { return acc.concat(e.bodyParts_he || []); }, [])));

    var list = $('planExercises');
    exercises.forEach(function (e) {
      var li = el('li');
      var src = thumb(e.imageUrl, 160);
      if (src) {
        var img = el('img', 'thumb');
        img.src = src; img.alt = ''; img.loading = 'lazy'; img.width = 64; img.height = 64;
        li.appendChild(img);
      } else {
        li.appendChild(el('span', 'thumb thumb-empty'));
      }
      var meta = el('div', 'meta');
      // כל השורה לחיצה (ה-::after של הקישור נמתח עליה) ופותחת את דף התרגיל עם הסרטון וההוראות
      var link = el('a', 'name', e.name_he);
      link.href = '/share/?e=' + encodeURIComponent(e.exerciseId);
      meta.appendChild(link);
      if (e.bodyParts_he && e.bodyParts_he.length) meta.appendChild(el('span', 'parts', e.bodyParts_he.join(' · ')));
      li.appendChild(meta);
      li.appendChild(el('span', 'go'));
      list.appendChild(li);
    });

    var skipped = plan.skipped_custom_count || 0;
    if (skipped > 0) {
      $('planSkipped').textContent = skipped === 1
        ? 'תרגיל אישי אחד שהשולח יצר בעצמו לא נכלל בתוכנית.'
        : skipped + ' תרגילים אישיים שהשולח יצר בעצמו לא נכללו בתוכנית.';
      show('planSkipped');
    }

    show('planBody');
    show('details');
    setupCta('plan');
    revealChapter();
  }

  function renderExercise(ex) {
    var name = ex.name_he || 'תרגיל';
    document.title = name + ' · BodyBuddy';
    setHero(name, 'שיתפו איתך תרגיל מתוך BodyBuddy, עם ההוראות המלאות.');
    $('heroDetailsLink').firstChild.textContent = 'איך מבצעים ';
    show('heroCta');

    $('chapterTitle').textContent = 'איך מבצעים';
    var areas = unique((ex.bodyParts_he || []).concat(ex.targetMuscles_he || []));
    $('chapterSub').textContent = areas.length ? 'עובד על ' + areas.join(', ') + '.' : '';

    // סרטון (כמו באפליקציה: מושתק ובלולאה), עם התמונה כ-poster. אין סרטון או שהוא נכשל: התמונה בלבד
    var src = thumb(ex.imageUrl, 800);
    var media = $('exMedia');
    function showImage() {
      if (!src) { media.hidden = true; return; }
      media.textContent = '';
      var img = el('img');
      img.src = src;
      img.alt = 'איור של התרגיל ' + name;
      media.appendChild(img);
      media.hidden = false;
    }
    if (ex.videoUrl) {
      var video = el('video');
      video.src = thumb(ex.videoUrl, 720);
      if (src) video.poster = src;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.preload = 'metadata';
      video.setAttribute('aria-label', 'סרטון של התרגיל ' + name);
      if (reduced) { video.controls = true; } else { video.autoplay = true; }
      video.addEventListener('error', showImage);
      media.appendChild(video);
      media.hidden = false;
    } else {
      showImage();
    }
    // the areas are already in the chapter line; chips carry only the equipment
    fillChips('exEquip', ex.equipments_he);

    var steps = $('exInstr');
    (ex.instructions_he || []).forEach(function (s) { steps.appendChild(el('li', null, s)); });
    if (steps.children.length) show('exInstr');

    show('exBody');
    show('details');
    setupCta('exercise');
    revealChapter();
  }

  function load(url, render) {
    fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok) throw new Error(typeof body.detail === 'string' ? body.detail : '');
          return body;
        });
      })
      .then(render)
      .catch(function (err) { showError(err && err.message); });
  }

  if (token && /^[A-Za-z0-9_-]{8,32}$/.test(token)) {
    load(API_BASE + '/plans/' + encodeURIComponent(token), renderPlan);
  } else if (exerciseId && /^[A-Za-z0-9_-]{1,200}$/.test(exerciseId)) {
    load(API_BASE + '/exercises/' + encodeURIComponent(exerciseId), renderExercise);
  } else {
    showError('');
  }
})();
