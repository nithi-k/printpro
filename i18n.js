// PrintPro localization loader.
//
// How it works: every translatable element in index.html carries
// data-i18n="some.key" (dot-path into the locale JSON). On load, this file
// fetches /locales/<lang>.json and writes each matching value into the page —
// via innerHTML by default (several keys contain inline markup like <br/> or
// <strong>), or via a specific attribute when the element also carries
// data-i18n-attr="content" / "aria-label" / etc.
//
// Adding a language: drop a new /locales/<code>.json file with the same key
// shape as th.json (copy it and translate the values), add <code> to
// SUPPORTED_LANGS below, and add a matching <button data-lang="<code">> to the
// .lang-switch markup in index.html's header. Nothing else needs to change —
// this file, the CSS, and every data-i18n attribute are language-agnostic.
//
// Adding/editing copy on an existing language: edit the value in
// /locales/<code>.json directly. Match the key structure across all locale
// files or missing keys will just silently fall back to whatever text is
// already sitting in the HTML (which is the Thai default, since that's what's
// authored inline as a no-JS/no-fetch fallback).
//
// IMPORTANT — file:// fallback: fetch() can't load local files when the page
// is opened directly (double-clicked) instead of served over http(s) — the
// browser blocks it. So this loader tries fetch('locales/<lang>.json') FIRST
// (the live source of truth — always used when the site is actually hosted,
// or previewed via `python3 -m http.server`), and if that fails for any
// reason, it falls back to reading a bundled snapshot of the same data from
// <script type="application/json" id="i18n-embedded-<lang>"> tags at the
// bottom of index.html — so the language switch also works out of the box
// from a plain double-click, no server required.
//
// If you edit locales/*.json, that change is picked up immediately by fetch()
// wherever the site is actually hosted. To also refresh the embedded
// file://-fallback snapshot in index.html, run:
//   python3 scripts/embed-locales.py
// (optional — only matters for testing by double-clicking the raw HTML file).

(function () {
  var SUPPORTED_LANGS = ['th', 'en'];
  var DEFAULT_LANG = 'th';
  var STORAGE_KEY = 'printpro-lang';

  function getStoredLang() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeLang(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* localStorage unavailable (private mode, etc.) — language just won't persist */
    }
  }

  function resolveInitialLang() {
    try {
      var params = new URLSearchParams(window.location.search);
      var fromQuery = params.get('lang');
      if (fromQuery && SUPPORTED_LANGS.indexOf(fromQuery) !== -1) return fromQuery;
    } catch (e) { /* URLSearchParams unsupported — ignore */ }
    var stored = getStoredLang();
    if (stored && SUPPORTED_LANGS.indexOf(stored) !== -1) return stored;
    return DEFAULT_LANG;
  }

  // Resolves a dot-path like "print.dtgSub1" against a nested object.
  function getByPath(obj, path) {
    return path.split('.').reduce(function (acc, key) {
      return acc && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : undefined;
    }, obj);
  }

  function applyDict(dict, lang) {
    document.documentElement.setAttribute('lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var value = getByPath(dict, key);
      if (value === undefined) return; // missing key: leave the existing (Thai default) text alone
      var attr = el.getAttribute('data-i18n-attr');
      if (attr) {
        el.setAttribute(attr, value);
      } else {
        el.innerHTML = value;
      }
    });

    document.querySelectorAll('.lang-switch [data-lang]').forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function loadDictFromFetch(lang) {
    return fetch('locales/' + lang + '.json', { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('locale file not found: ' + lang);
      return res.json();
    });
  }

  // Reads the bundled fallback copy embedded in index.html
  // (<script type="application/json" id="i18n-embedded-<lang>">). Used only
  // when fetch() fails — typically because the page was opened via file://
  // instead of a real server. See scripts/embed-locales.py to regenerate
  // these embedded blocks after editing locales/*.json.
  function loadDictFromEmbedded(lang) {
    return new Promise(function (resolve, reject) {
      var el = document.getElementById('i18n-embedded-' + lang);
      if (!el) {
        reject(new Error('no embedded fallback for "' + lang + '"'));
        return;
      }
      try {
        resolve(JSON.parse(el.textContent));
      } catch (e) {
        reject(e);
      }
    });
  }

  function loadDict(lang) {
    return loadDictFromFetch(lang).catch(function () {
      return loadDictFromEmbedded(lang);
    });
  }

  function setLang(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) return;
    loadDict(lang)
      .then(function (dict) {
        applyDict(dict, lang);
        storeLang(lang);
      })
      .catch(function (err) {
        // Both fetch and the embedded fallback failed (shouldn't normally
        // happen — it means the embedded <script> block is missing or
        // malformed). The page already shows sensible default copy in the
        // HTML either way, so a failed language switch just means it stays
        // as-is rather than breaking.
        console.warn('[i18n] could not load "' + lang + '":', err.message);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setLang(resolveInitialLang());

    document.querySelectorAll('.lang-switch [data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang'));
      });
    });
  });

  // Exposed for console/debugging use, e.g. PrintProI18n.setLang('en').
  window.PrintProI18n = { setLang: setLang, SUPPORTED_LANGS: SUPPORTED_LANGS };
})();
