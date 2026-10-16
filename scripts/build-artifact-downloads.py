"""Bundle each marked Design Artifact into a standalone HTML download.

Run from any directory: python3 scripts/build-artifact-downloads.py
Only Python's standard library is required. The portfolio needs no build step;
run this helper when an artifact's source HTML, CSS, or JavaScript changes.
"""

from html import escape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re


ROOT = Path(__file__).resolve().parents[1]
START = "<!-- artifact-export:start -->"
END = "<!-- artifact-export:end -->"


class ArtifactSource(HTMLParser):
    def __init__(self):
        super().__init__()
        self.styles = []
        self.scripts = []
        self.title = ""
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h1":
            self.in_title = True
        if "data-artifact-export" in attrs:
            if tag == "link" and attrs.get("rel") == "stylesheet":
                self.styles.append(attrs["href"])
            elif tag == "script":
                self.scripts.append(attrs["src"])

    def handle_endtag(self, tag):
        if tag == "h1":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data


BASE_CSS = """
* { box-sizing: border-box; margin: 0; padding: 0; }
html { color-scheme: light; }
body {
  min-height: 100vh;
  background: #f7f5f0;
  color: #1a1916;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
"""

STANDALONE_CSS = """
.artifacts-page { max-width: 1064px; padding-top: 32px; padding-bottom: 32px; }
.artifact-detail .artifacts-header { margin-bottom: 24px; }
.artifact-detail .artifacts-header h1 { font-size: clamp(28px, 4vw, 40px); margin: 0; }
"""


def read_local_asset(page, url):
    parsed = urlsplit(url)
    if parsed.scheme or parsed.netloc:
        raise ValueError(f"Export assets must be local: {url}")
    path = (page.parent / unquote(parsed.path)).resolve()
    if not path.is_relative_to(ROOT):
        raise ValueError(f"Export asset is outside the portfolio: {url}")
    return path.read_text()


def build(page):
    source = page.read_text()
    if START not in source:
        return None
    if source.count(START) != 1 or source.count(END) != 1:
        raise ValueError(f"Expected one pair of export markers in {page}")
    content = source.split(START, 1)[1].split(END, 1)[0].strip()
    parser = ArtifactSource()
    parser.feed(source)
    if not parser.styles or not parser.scripts or not parser.title:
        raise ValueError(f"Missing artifact title or marked assets in {page}")
    styles = "\n".join(read_local_asset(page, url) for url in parser.styles)
    scripts = "\n".join(read_local_asset(page, url) for url in parser.scripts)
    styles = re.sub(r"</style", r"<\\/style", styles, flags=re.I)
    scripts = re.sub(r"</script", r"<\\/script", scripts, flags=re.I)
    title = escape(parser.title)
    output = f"""<!DOCTYPE html>
<!-- Generated from the artifact page and its marked assets. -->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — Ishaan Jain</title>
  <style>
{BASE_CSS}
{styles}
{STANDALONE_CSS}
  </style>
</head>
<body>
  <main class="artifacts-page artifact-detail">
    <header class="artifacts-header"><h1>{title}</h1></header>
    {content}
  </main>
  <script>
{scripts}
  </script>
</body>
</html>
"""
    destination = page.with_name("artifact.html")
    destination.write_text(output)
    return destination


if __name__ == "__main__":
    for page in sorted((ROOT / "design-artifacts").glob("*/index.html")):
        result = build(page)
        if result:
            print(result.relative_to(ROOT))
