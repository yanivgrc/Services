import { startMatrix, decrypt, asciiPortrait } from './matrix.js';

const UI = {
  en: { qr: 'QR code', contact: 'Contact', linkedin: 'LinkedIn', certs: 'Credentials',
        site: 'Website', copy: 'Copy',
        share: 'Share', copylink: 'Copy link', scan: 'Scan to open the card', close: 'Close',
        copied: 'Copied', linkCopied: 'Link copied', creds: '// credentials', verify: 'Verify ↗', inprog: 'in progress', fail: 'Copy failed — long-press to select',
        lang: 'עב', langLabel: 'עברית' },
  he: { qr: 'קוד QR', contact: 'צור קשר', linkedin: 'LinkedIn', certs: 'הסמכות',
        site: 'אתר', copy: 'העתקה',
        share: 'שיתוף', copylink: 'העתקת קישור', scan: 'סרקו לפתיחת הכרטיס', close: 'סגירה',
        copied: 'הועתק', linkCopied: 'הקישור הועתק', creds: 'הסמכות', verify: 'אימות ↗', inprog: 'בתהליך', fail: 'ההעתקה נכשלה — לחיצה ארוכה לבחירה',
        lang: 'EN', langLabel: 'English' },
};

const $ = (id) => document.getElementById(id);
const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Privacy: this public page never carries phone, email or coupon — those live only in the private contact QR.
// Only http(s) for links; relative same-origin paths allowed for images. Blocks javascript:, data:, etc.
function safeUrl(v, { allowRelative = false } = {}) {
  const s = str(v, 2048);
  if (!s) return '';
  try {
    const u = new URL(s, location.href);
    if (u.protocol === 'https:' || (u.protocol === 'http:' && u.hostname === 'localhost')) {
      if (!allowRelative && !/^https?:\/\//i.test(s)) return '';
      if (allowRelative && u.origin !== location.origin) return ''; // images: same origin only (matches CSP img-src)
      return u.href;
    }
  } catch { /* invalid */ }
  return '';
}

let data = {}, lang = 'en';

function pickLang(d) {
  let saved = '';
  try { saved = localStorage.getItem('card-lang') || ''; } catch { /* storage blocked */ }
  if (saved === 'he' || saved === 'en') return saved;
  if (d.defaultLang === 'he' || d.defaultLang === 'en') return d.defaultLang;
  return (navigator.language || '').toLowerCase().startsWith('he') ? 'he' : 'en';
}

// Resolved, sanitised view of card.json for the current language.
function view() {
  const o = Object.assign({}, data, lang === 'he' && data.he && typeof data.he === 'object' ? data.he : {});
  return {
    name: str(o.name, 80), title: str(o.title, 80), company: str(o.company, 80), description: str(o.description, 280),
    profileImage: safeUrl(o.profileImage, { allowRelative: true }), companyLogo: safeUrl(o.companyLogo, { allowRelative: true }),
    contactUrl: safeUrl(o.contactUrl), linkedinUrl: safeUrl(o.linkedinUrl), certificationsUrl: safeUrl(o.certificationsUrl), websiteUrl: safeUrl(o.websiteUrl),
    customLinkLabel: str(o.customLinkLabel, 60), customLinkUrl: safeUrl(o.customLinkUrl),
    cardUrl: safeUrl(o.cardUrl) || location.href.split(/[?#]/)[0],
    credentials: (Array.isArray(data.credentials) ? data.credentials : []).slice(0, 20).map((c) => {
      const l = lang === 'he' && c && c.he && typeof c.he === 'object' ? { ...c, ...c.he } : (c || {});
      return { mark: str(l.mark, 12), name: str(l.name, 90), meta: str(l.meta, 120), verifyUrl: safeUrl(l.verifyUrl), inProgress: l.inProgress === true };
    }).filter((c) => c.mark && c.name),
  };
}

const ICONS = {
  email: '<path d="M3 6.5h18v11H3z"/><path d="M3 7l9 6 9-6"/>',
  linkedin: '<path d="M4 9h3.5v11H4zM5.75 4.2a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8zM10 9h3.3v1.6c.6-1 1.8-1.9 3.6-1.9 3.4 0 4.1 2.2 4.1 5.2V20h-3.5v-5.4c0-1.4-.1-3-1.9-3s-2.2 1.4-2.2 2.9V20H10z"/>',
  certs: '<circle cx="12" cy="9" r="5"/><path d="M9 13.5L8 21l4-2 4 2-1-7.5"/>',
  site: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  custom: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
};

function linkBtn(href, label, icon, cls = '') {
  const a = document.createElement('a');
  a.className = `btn ${cls}`.trim();
  a.href = href;
  if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
  // icon markup is a static constant above, never content from card.json
  a.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[icon]}</svg>`;
  const s = document.createElement('span');
  s.textContent = label;
  a.append(s);
  return a;
}

function render() {
  const v = view(), t = UI[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  document.title = `${v.name || 'Card'} · GRC·LABS`;

  document.querySelectorAll('[data-ui]').forEach((el) => { el.textContent = t[el.dataset.ui] || ''; });
  const lb = $('langbtn'); lb.textContent = t.lang; lb.setAttribute('aria-label', t.langLabel); lb.lang = lang === 'he' ? 'en' : 'he';

  $('name').textContent = v.name;
  $('title').textContent = v.title; $('title').hidden = !v.title;
  $('company').textContent = v.company;
  $('desc').textContent = v.description; $('desc').hidden = !v.description;

  const ph = $('photo');
  if (v.profileImage) { ph.src = v.profileImage; ph.alt = v.name; ph.hidden = false; } else ph.hidden = true;
  ph.closest('.portrait').hidden = !v.profileImage;
  const lg = $('logo');
  if (v.companyLogo) { lg.src = v.companyLogo; lg.hidden = false; } else lg.hidden = true;

  const cb = $('contactBtn');
  if (v.contactUrl) { cb.href = v.contactUrl; cb.hidden = false; } else cb.hidden = true;

  const links = $('links');
  links.replaceChildren();
  if (v.linkedinUrl) links.append(linkBtn(v.linkedinUrl, t.linkedin, 'linkedin'));
  if (v.certificationsUrl) links.append(linkBtn(v.certificationsUrl, t.certs, 'certs'));
  if (v.websiteUrl) links.append(linkBtn(v.websiteUrl, t.site, 'site'));
  if (v.customLinkUrl && v.customLinkLabel) links.append(linkBtn(v.customLinkUrl, v.customLinkLabel, 'custom', 'wide featured'));
  if (links.children.length % 2 === 1 && !links.lastElementChild.classList.contains('wide')) links.lastElementChild.classList.add('wide');
  links.hidden = !links.children.length;

  const list = $('credList');
  list.replaceChildren();
  // each " · " segment is bidi-isolated so mixed Hebrew/Latin metadata keeps its order in RTL
  const segs = (cls, text) => {
    const el = Object.assign(document.createElement('span'), { className: cls });
    text.split(' · ').forEach((part, i) => {
      if (i) el.append(' · ');
      el.append(Object.assign(document.createElement('bdi'), { textContent: part }));
    });
    return el;
  };
  for (const c of v.credentials) {
    const li = document.createElement('li');
    li.className = c.inProgress ? 'cr inprog' : 'cr';
    const mk = Object.assign(document.createElement('span'), { className: 'mk', textContent: c.mark });
    const body = Object.assign(document.createElement('span'), { className: 'bd' });
    body.append(segs('nm', c.name));
    if (c.meta) body.append(segs('mt', c.meta));
    if (c.inProgress) body.append(Object.assign(document.createElement('span'), { className: 'tg', textContent: t.inprog }));
    if (c.verifyUrl) {
      const a = Object.assign(document.createElement('a'), { className: 'vf', href: c.verifyUrl, target: '_blank', rel: 'noopener noreferrer nofollow', textContent: t.verify });
      a.setAttribute('aria-label', `${t.verify} ${c.mark}`);
      body.append(a);
    }
    li.append(mk, body);
    list.append(li);
  }
  $('creds').hidden = !v.credentials.length;

  $('waBtn').href = `https://wa.me/?text=${encodeURIComponent(`${v.name} · ${v.company}\n${v.cardUrl}`)}`;
  $('urlText').textContent = v.cardUrl.replace(/^https?:\/\//, '');
  $('card').setAttribute('aria-busy', 'false');
  decrypt($('name')); decrypt($('title'), 800);
}

let toastT;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg; el.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 1800);
}

async function copy(text, okMsg) {
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const ta = Object.assign(document.createElement('textarea'), { value: text, readOnly: true });
      ta.style.cssText = 'position:fixed;opacity:0'; document.body.append(ta); ta.select();
      const ok = document.execCommand('copy'); ta.remove(); if (!ok) throw new Error('copy');
    }
    toast(okMsg);
  } catch { toast(UI[lang].fail); }
}

async function share() {
  const v = view();
  const payload = { title: `${v.name} · ${v.company}`, text: `${v.name} · ${v.company}`, url: v.cardUrl };
  if (navigator.share) {
    try { await navigator.share(payload); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  copy(v.cardUrl, UI[lang].linkCopied);
}

function bind() {
  $('langbtn').addEventListener('click', () => {
    lang = lang === 'he' ? 'en' : 'he';
    try { localStorage.setItem('card-lang', lang); } catch { /* ignore */ }
    render();
  });
  $('shareBtn').addEventListener('click', share);
  $('copyLink').addEventListener('click', () => copy(view().cardUrl, UI[lang].linkCopied));
  const dlg = $('qrDlg');
  $('qrBtn').addEventListener('click', () => (dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', '')));
  $('qrClose').addEventListener('click', () => (dlg.close ? dlg.close() : dlg.removeAttribute('open')));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
}

async function init() {
  startMatrix($('rain'), $('shell'));
  bind();
  try {
    const r = await fetch('card.json', { cache: 'no-cache' });
    data = await r.json();
  } catch { data = {}; }
  lang = pickLang(data);
  render();
  if (!$('photo').hidden) asciiPortrait($('photo'));
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js', { scope: './' }).catch(() => {});
  }
}

init();
