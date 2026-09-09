#!/usr/bin/env python3
"""
Regenerates the embedded file://-fallback locale snapshot inside index.html
from locales/*.json.

Why this exists: the site's language switch normally reads locales/th.json
and locales/en.json via fetch(), which requires the page to be served over
http(s) (any static host, or `python3 -m http.server` for local preview).
Opening index.html directly (double-clicking it) uses the file:// protocol,
where browsers block fetch() from reading local files — so as a fallback,
i18n.js also keeps a bundled copy of both locale files inline in index.html
(inside <script type="application/json" id="i18n-embedded-th/en"> tags) and
falls back to reading that when fetch() fails.

Run this after editing locales/th.json or locales/en.json to keep that
bundled copy in sync:

    python3 scripts/embed-locales.py

This is optional — it only affects the file:// / double-click preview path.
Anywhere the site is actually hosted (GitHub Pages, Netlify, Vercel, etc.),
fetch() succeeds and always reads locales/*.json directly, live, with no
regeneration step needed.
"""

import json
import re
import sys
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parent.parent
INDEX_HTML = SITE_DIR / "index.html"
LOCALES_DIR = SITE_DIR / "locales"
LANGS = ["th", "en"]

START_MARKER = "<!-- I18N_EMBED_START -->"
END_MARKER = "<!-- I18N_EMBED_END -->"


def main():
    html = INDEX_HTML.read_text(encoding="utf-8")

    if START_MARKER not in html or END_MARKER not in html:
        print("ERROR: could not find I18N_EMBED_START/END markers in index.html", file=sys.stderr)
        sys.exit(1)

    blocks = [START_MARKER]
    for lang in LANGS:
        locale_path = LOCALES_DIR / f"{lang}.json"
        data = json.loads(locale_path.read_text(encoding="utf-8"))
        # Compact separators, but keep it valid JSON. </script> can't appear
        # literally inside a <script> block, so escape the forward slash in
        # any "</" sequence a translated string might contain.
        compact = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
        compact = compact.replace("</", "<\\/")
        blocks.append(f'<script type="application/json" id="i18n-embedded-{lang}">{compact}</script>')
    blocks.append(END_MARKER)

    replacement = "\n".join(blocks)
    pattern = re.compile(re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER), re.DOTALL)
    new_html, count = pattern.subn(replacement, html)

    if count != 1:
        print(f"ERROR: expected exactly 1 embed block, found {count}", file=sys.stderr)
        sys.exit(1)

    INDEX_HTML.write_text(new_html, encoding="utf-8")
    print(f"Embedded {', '.join(LANGS)} into index.html ({len(new_html)} bytes)")


if __name__ == "__main__":
    main()
