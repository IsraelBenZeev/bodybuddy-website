// BodyBuddy legal documents page (Privacy Policy / Terms of Service).
// Loads both documents from Supabase, renders HE/EN, and lets the user switch
// between them with a tab control. The tab that opens by default is determined
// by the page's own path — /privecypolicy/ defaults to the privacy policy,
// /termsofservice/ defaults to the terms of service — so linking to either route
// (e.g. from the homepage footer) lands the visitor on the right document.

const SUPABASE_URL = 'https://arxscyvqikyjupszspym.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gwAXrNwZUuYRGm6_t-_0Tw_EMwi45IF';

const EMAIL_RE = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
const SECTION_REF_RE = /(?:Section|סעיף)\s+(\d+)/g;

const DOC_TYPES = ['privacy_policy', 'terms_of_service'];
const DOC_ROUTES = {
  privacy_policy: '/privecypolicy/',
  terms_of_service: '/termsofservice/',
};

const DOC_STRINGS = {
  privacy_policy: {
    he: {
      tabLabel: 'מדיניות פרטיות',
      docTitle: 'BodyBuddy – מדיניות פרטיות',
      headerLabel: 'מדיניות פרטיות',
      splashSubtitle: 'מדיניות פרטיות',
      heroSubtitle: 'המלווה שלך לכושר — פרטיות שאפשר לסמוך עליה.',
      loading: 'טוען את מדיניות הפרטיות…',
    },
    en: {
      tabLabel: 'Privacy Policy',
      docTitle: 'BodyBuddy – Privacy Policy',
      headerLabel: 'Privacy Policy',
      splashSubtitle: 'Privacy Policy',
      heroSubtitle: 'Your fitness companion — privacy you can trust.',
      loading: 'Loading the privacy policy…',
    },
  },
  terms_of_service: {
    he: {
      tabLabel: 'תנאי שימוש',
      docTitle: 'BodyBuddy – תנאי שימוש',
      headerLabel: 'תנאי שימוש',
      splashSubtitle: 'תנאי שימוש',
      heroSubtitle: 'התנאים המלאים לשימוש באפליקציית BodyBuddy.',
      loading: 'טוען את תנאי השימוש…',
    },
    en: {
      tabLabel: 'Terms of Service',
      docTitle: 'BodyBuddy – Terms of Service',
      headerLabel: 'Terms of Service',
      splashSubtitle: 'Terms of Service',
      heroSubtitle: 'The full terms for using the BodyBuddy application.',
      loading: 'Loading the terms of service…',
    },
  },
};

const SHARED_STRINGS = {
  he: {
    errorText: 'לא ניתן לטעון כרגע את המסמך. נסה שוב מאוחר יותר.',
    retry: 'נסה שוב',
    footer: '© 2026 BodyBuddy · ישראל בן זאב · כל הזכויות שמורות',
    versionLabel: (v, d) => (d ? `גרסה ${v} · עודכן ב-${d}` : `גרסה ${v}`),
    dateLocale: 'he-IL',
    whatsNewTitle: 'מה השתנה בגרסה זו',
  },
  en: {
    errorText: "We couldn't load the document right now. Please try again later.",
    retry: 'Try again',
    footer: '© 2026 BodyBuddy · Israel Ben Zeev · All rights reserved',
    versionLabel: (v, d) => (d ? `Version ${v} · Updated ${d}` : `Version ${v}`),
    dateLocale: 'en-US',
    whatsNewTitle: "What's new in this version",
  },
};

let currentLang = 'he';
let activeDocType = location.pathname.includes('termsofservice')
  ? 'terms_of_service'
  : 'privacy_policy';
const documentsCache = {};

const el = (id) => document.getElementById(id);

function applyChrome() {
  const s = SHARED_STRINGS[currentLang];
  const d = DOC_STRINGS[activeDocType][currentLang];

  document.documentElement.setAttribute('lang', currentLang);
  document.documentElement.setAttribute('dir', currentLang === 'he' ? 'rtl' : 'ltr');
  document.title = d.docTitle;
  el('header-label').textContent = d.headerLabel;
  el('splash-subtitle').textContent = d.splashSubtitle;
  el('hero-subtitle').textContent = d.heroSubtitle;
  el('loading-text').textContent = d.loading;
  el('loading-icon').setAttribute('aria-label', d.loading);
  el('error-text').textContent = s.errorText;
  el('retry-btn').textContent = s.retry;
  el('footer-text').textContent = s.footer;

  el('lang-btn-he').classList.toggle('active', currentLang === 'he');
  el('lang-btn-en').classList.toggle('active', currentLang === 'en');

  DOC_TYPES.forEach((type) => {
    const btn = el(`doc-btn-${type}`);
    if (!btn) return;
    btn.textContent = DOC_STRINGS[type][currentLang].tabLabel;
    btn.classList.toggle('active', type === activeDocType);
    btn.setAttribute('aria-selected', String(type === activeDocType));
  });
}

function renderDateBadge() {
  const badge = el('date-badge');
  const doc = documentsCache[activeDocType];
  if (!doc) {
    badge.textContent = '';
    return;
  }
  const s = SHARED_STRINGS[currentLang];
  let dateStr = '';
  if (doc.created_at) {
    try {
      dateStr = new Intl.DateTimeFormat(s.dateLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(doc.created_at));
    } catch (e) {
      dateStr = '';
    }
  }
  badge.textContent = s.versionLabel(doc.version, dateStr);
}

// Turns plain text containing email addresses into text + <a mailto> nodes.
function appendLinkifiedText(parent, text) {
  let lastIndex = 0;
  let match;
  EMAIL_RE.lastIndex = 0;
  while ((match = EMAIL_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parent.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }
    const anchor = document.createElement('a');
    anchor.href = `mailto:${match[0]}`;
    anchor.textContent = match[0];
    parent.appendChild(anchor);
    lastIndex = EMAIL_RE.lastIndex;
  }
  if (lastIndex < text.length) {
    parent.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

// Turns "Section 8" / "סעיף 8" references into anchor links that jump to that section's card.
function appendSectionLinkedText(parent, text) {
  let lastIndex = 0;
  let match;
  SECTION_REF_RE.lastIndex = 0;
  while ((match = SECTION_REF_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parent.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }
    const anchor = document.createElement('a');
    anchor.href = `#section-${match[1]}`;
    anchor.textContent = match[0];
    parent.appendChild(anchor);
    lastIndex = SECTION_REF_RE.lastIndex;
  }
  if (lastIndex < text.length) {
    parent.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

function renderChangesSummary() {
  const root = el('changes-root');
  const list = el('changes-list');
  list.innerHTML = '';

  const doc = documentsCache[activeDocType];
  const changes = doc && (currentLang === 'he' ? doc.changes_summary_he : doc.changes_summary_en);
  if (!changes || !changes.length) {
    root.hidden = true;
    return;
  }

  el('changes-title').textContent = SHARED_STRINGS[currentLang].whatsNewTitle;
  changes.forEach((change) => {
    const li = document.createElement('li');
    appendSectionLinkedText(li, change);
    list.appendChild(li);
  });
  root.hidden = false;
}

function renderSections() {
  const root = el('sections-root');
  root.innerHTML = '';
  const doc = documentsCache[activeDocType];
  if (!doc) return;

  const sections = currentLang === 'he' ? doc.content_he : doc.content_en;
  (sections || []).forEach((section, index) => {
    const card = document.createElement('section');
    card.className = 'card';
    card.id = `section-${index + 1}`;

    const h2 = document.createElement('h2');
    const number = document.createElement('span');
    number.className = 'section-number';
    number.textContent = String(index + 1);
    h2.appendChild(number);
    h2.appendChild(document.createTextNode(section.title));
    card.appendChild(h2);

    (section.body || []).forEach((paragraph) => {
      const p = document.createElement('p');
      appendLinkifiedText(p, paragraph);
      card.appendChild(p);
    });

    if (section.items && section.items.length) {
      const ul = document.createElement('ul');
      section.items.forEach((item) => {
        const li = document.createElement('li');
        appendLinkifiedText(li, item);
        ul.appendChild(li);
      });
      card.appendChild(ul);
    }

    root.appendChild(card);
  });
}

function renderAll() {
  applyChrome();
  renderDateBadge();
  renderChangesSummary();
  renderSections();
}

function setLanguage(lang) {
  currentLang = lang;
  renderAll();
}

async function fetchLegalDocument(documentType) {
  const url = `${SUPABASE_URL}/rest/v1/legal_documents?select=version,content_he,content_en,created_at,changes_summary_he,changes_summary_en&document_type=eq.${documentType}&order=created_at.desc&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const rows = await res.json();
  if (!rows || !rows.length) throw new Error(`No ${documentType} document found`);
  return rows[0];
}

async function ensureDocumentLoaded(documentType) {
  if (documentsCache[documentType]) return documentsCache[documentType];
  const data = await fetchLegalDocument(documentType);
  documentsCache[documentType] = data;
  return data;
}

async function loadAndRender(documentType) {
  el('loading-wrap').hidden = false;
  el('error-wrap').hidden = true;
  el('sections-root').hidden = true;
  el('changes-root').hidden = true;
  applyChrome();

  try {
    await ensureDocumentLoaded(documentType);
    if (documentType !== activeDocType) return; // user switched tabs before this resolved
    el('loading-wrap').hidden = true;
    el('sections-root').hidden = false;
    renderAll();
  } catch (err) {
    if (documentType !== activeDocType) return;
    el('loading-wrap').hidden = true;
    el('error-wrap').hidden = false;
    applyChrome();
  }
}

function setDocType(type) {
  if (type === activeDocType) return;
  activeDocType = type;
  history.replaceState(null, '', DOC_ROUTES[type]);
  if (documentsCache[type]) {
    el('sections-root').hidden = false;
    renderAll();
  } else {
    loadAndRender(type);
  }
}

function initBackToTop() {
  const btn = el('back-to-top');
  if (!btn) return;
  const toggleVisibility = () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', toggleVisibility, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  toggleVisibility();
}

document.addEventListener('DOMContentLoaded', () => {
  applyChrome();

  DOC_TYPES.forEach((type) => {
    const btn = el(`doc-btn-${type}`);
    if (btn) btn.addEventListener('click', () => setDocType(type));
  });

  el('lang-btn-he').addEventListener('click', () => setLanguage('he'));
  el('lang-btn-en').addEventListener('click', () => setLanguage('en'));
  el('retry-btn').addEventListener('click', () => loadAndRender(activeDocType));
  initBackToTop();

  loadAndRender(activeDocType);

  setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
  }, 1400);
});
