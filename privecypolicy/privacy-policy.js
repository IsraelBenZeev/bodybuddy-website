// BodyBuddy privacy policy page — loads content from Supabase and renders HE/EN

const SUPABASE_URL = 'https://arxscyvqikyjupszspym.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gwAXrNwZUuYRGm6_t-_0Tw_EMwi45IF';

const EMAIL_RE = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
const SECTION_REF_RE = /(?:Section|סעיף)\s+(\d+)/g;

const STRINGS = {
  he: {
    docTitle: 'BodyBuddy – מדיניות פרטיות',
    headerLabel: 'מדיניות פרטיות',
    splashSubtitle: 'מדיניות פרטיות',
    heroSubtitle: 'המלווה שלך לכושר — פרטיות שאפשר לסמוך עליה.',
    loading: 'טוען את מדיניות הפרטיות…',
    errorText: 'לא ניתן לטעון כרגע את מדיניות הפרטיות. נסה שוב מאוחר יותר.',
    retry: 'נסה שוב',
    footer: '© 2026 BodyBuddy · ישראל בן זאב · כל הזכויות שמורות',
    versionLabel: (v, d) => (d ? `גרסה ${v} · עודכן ב-${d}` : `גרסה ${v}`),
    dateLocale: 'he-IL',
    whatsNewTitle: 'מה השתנה בגרסה זו',
  },
  en: {
    docTitle: 'BodyBuddy – Privacy Policy',
    headerLabel: 'Privacy Policy',
    splashSubtitle: 'Privacy Policy',
    heroSubtitle: 'Your fitness companion — privacy you can trust.',
    loading: 'Loading the privacy policy…',
    errorText: "We couldn't load the privacy policy right now. Please try again later.",
    retry: 'Try again',
    footer: '© 2026 BodyBuddy · Israel Ben Zeev · All rights reserved',
    versionLabel: (v, d) => (d ? `Version ${v} · Updated ${d}` : `Version ${v}`),
    dateLocale: 'en-US',
    whatsNewTitle: "What's new in this version",
  },
};

let currentLang = 'he';
let policyData = null;

const el = (id) => document.getElementById(id);

function applyChrome(lang) {
  const s = STRINGS[lang];
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
  document.title = s.docTitle;
  el('header-label').textContent = s.headerLabel;
  el('splash-subtitle').textContent = s.splashSubtitle;
  el('hero-subtitle').textContent = s.heroSubtitle;
  el('loading-text').textContent = s.loading;
  el('loading-icon').setAttribute('aria-label', s.loading);
  el('error-text').textContent = s.errorText;
  el('retry-btn').textContent = s.retry;
  el('footer-text').textContent = s.footer;

  el('lang-btn-he').classList.toggle('active', lang === 'he');
  el('lang-btn-en').classList.toggle('active', lang === 'en');
}

function renderDateBadge(lang) {
  const badge = el('date-badge');
  if (!policyData) {
    badge.textContent = '';
    return;
  }
  const s = STRINGS[lang];
  let dateStr = '';
  if (policyData.created_at) {
    try {
      dateStr = new Intl.DateTimeFormat(s.dateLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(policyData.created_at));
    } catch (e) {
      dateStr = '';
    }
  }
  badge.textContent = s.versionLabel(policyData.version, dateStr);
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

function renderChangesSummary(lang) {
  const root = el('changes-root');
  const list = el('changes-list');
  list.innerHTML = '';

  const changes = policyData && (lang === 'he' ? policyData.changes_summary_he : policyData.changes_summary_en);
  if (!changes || !changes.length) {
    root.hidden = true;
    return;
  }

  el('changes-title').textContent = STRINGS[lang].whatsNewTitle;
  changes.forEach((change) => {
    const li = document.createElement('li');
    appendSectionLinkedText(li, change);
    list.appendChild(li);
  });
  root.hidden = false;
}

function renderSections(lang) {
  const root = el('sections-root');
  root.innerHTML = '';
  if (!policyData) return;

  const sections = lang === 'he' ? policyData.content_he : policyData.content_en;
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

function renderAll(lang) {
  applyChrome(lang);
  renderDateBadge(lang);
  renderChangesSummary(lang);
  renderSections(lang);
}

function setLanguage(lang) {
  currentLang = lang;
  renderAll(lang);
}

async function fetchPrivacyPolicy() {
  const url = `${SUPABASE_URL}/rest/v1/legal_documents?select=version,content_he,content_en,created_at,changes_summary_he,changes_summary_en&document_type=eq.privacy_policy&order=created_at.desc&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const rows = await res.json();
  if (!rows || !rows.length) throw new Error('No privacy policy found');
  return rows[0];
}

async function loadAndRender() {
  el('loading-wrap').hidden = false;
  el('error-wrap').hidden = true;
  el('sections-root').hidden = true;

  try {
    policyData = await fetchPrivacyPolicy();
    el('loading-wrap').hidden = true;
    el('sections-root').hidden = false;
    renderAll(currentLang);
  } catch (err) {
    el('loading-wrap').hidden = true;
    el('error-wrap').hidden = false;
    applyChrome(currentLang);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  applyChrome(currentLang);

  el('lang-btn-he').addEventListener('click', () => setLanguage('he'));
  el('lang-btn-en').addEventListener('click', () => setLanguage('en'));
  el('retry-btn').addEventListener('click', loadAndRender);

  loadAndRender();

  setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
  }, 1400);
});
