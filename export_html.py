#!/usr/bin/env python3
"""
Export partner skill .md files to clean, shareable HTML.
Usage: python export_html.py
Outputs: docs/*.html (open in any browser, email, or drop in Notion/Drive)
"""

import re
import os
from pathlib import Path

CSS = """
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 15px;
        line-height: 1.7;
        color: #1a1a1a;
        background: #fff;
        max-width: 860px;
        margin: 0 auto;
        padding: 48px 32px;
    }
    h1 { font-size: 2em; font-weight: 700; margin-bottom: 8px; color: #0a0a0a; }
    h2 { font-size: 1.3em; font-weight: 600; margin: 40px 0 12px; padding-bottom: 6px;
         border-bottom: 1px solid #e5e5e5; color: #111; }
    h3 { font-size: 1.05em; font-weight: 600; margin: 24px 0 8px; color: #222; }
    p { margin: 10px 0; }
    a { color: #6c47ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code {
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 0.85em;
        background: #f4f4f5;
        padding: 2px 6px;
        border-radius: 4px;
        color: #c026d3;
    }
    pre {
        background: #18181b;
        color: #e4e4e7;
        padding: 18px 20px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 14px 0;
        font-size: 0.82em;
        line-height: 1.6;
    }
    pre code {
        background: none;
        padding: 0;
        color: #e4e4e7;
        font-size: 1em;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
        font-size: 0.9em;
    }
    th {
        background: #f9f9f9;
        text-align: left;
        padding: 8px 12px;
        border: 1px solid #e5e5e5;
        font-weight: 600;
    }
    td {
        padding: 8px 12px;
        border: 1px solid #e5e5e5;
        vertical-align: top;
    }
    tr:nth-child(even) td { background: #fafafa; }
    ul, ol { margin: 10px 0 10px 20px; }
    li { margin: 4px 0; }
    hr { border: none; border-top: 1px solid #e5e5e5; margin: 36px 0; }
    blockquote {
        border-left: 3px solid #6c47ff;
        padding: 8px 16px;
        margin: 16px 0;
        color: #555;
        background: #faf9ff;
        border-radius: 0 4px 4px 0;
    }
    .header-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 2px solid #e5e5e5;
    }
    .moonpay-badge {
        font-size: 0.75em;
        background: #6c47ff;
        color: white;
        padding: 3px 10px;
        border-radius: 20px;
        font-weight: 600;
        letter-spacing: 0.02em;
    }
    strong { font-weight: 600; }
    em { font-style: italic; }
"""

def md_to_html(md: str) -> str:
    """Convert markdown to HTML (handles common patterns)."""
    lines = md.split('\n')
    html_lines = []
    in_code = False
    in_table = False
    code_lang = ''

    i = 0
    while i < len(lines):
        line = lines[i]

        # Code blocks
        if line.startswith('```'):
            if not in_code:
                code_lang = line[3:].strip()
                in_code = True
                html_lines.append(f'<pre><code class="language-{code_lang}">')
            else:
                in_code = False
                html_lines.append('</code></pre>')
            i += 1
            continue

        if in_code:
            html_lines.append(line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))
            i += 1
            continue

        # Tables
        if '|' in line and line.strip().startswith('|'):
            if not in_table:
                in_table = True
                html_lines.append('<table>')
                # Header row
                cells = [c.strip() for c in line.strip().strip('|').split('|')]
                html_lines.append('<thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in cells) + '</tr></thead>')
                # Skip separator row
                if i + 1 < len(lines) and re.match(r'[\|\s\-:]+', lines[i+1]):
                    i += 2
                    html_lines.append('<tbody>')
                    continue
            else:
                cells = [c.strip() for c in line.strip().strip('|').split('|')]
                html_lines.append('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in cells) + '</tr>')
            i += 1
            continue
        else:
            if in_table:
                in_table = False
                html_lines.append('</tbody></table>')

        # HR
        if re.match(r'^---+$', line.strip()):
            html_lines.append('<hr>')
            i += 1
            continue

        # Headings
        if line.startswith('# '):
            html_lines.append(f'<h1>{inline(line[2:])}</h1>')
        elif line.startswith('## '):
            html_lines.append(f'<h2>{inline(line[3:])}</h2>')
        elif line.startswith('### '):
            html_lines.append(f'<h3>{inline(line[4:])}</h3>')
        elif line.startswith('#### '):
            html_lines.append(f'<h4>{inline(line[5:])}</h4>')
        # Blockquote
        elif line.startswith('> '):
            html_lines.append(f'<blockquote>{inline(line[2:])}</blockquote>')
        # Unordered list
        elif re.match(r'^[-*] ', line):
            html_lines.append(f'<ul><li>{inline(line[2:])}</li></ul>')
        # Ordered list
        elif re.match(r'^\d+\. ', line):
            text = re.sub(r'^\d+\. ', '', line)
            html_lines.append(f'<ol><li>{inline(text)}</li></ol>')
        # Empty line
        elif line.strip() == '':
            html_lines.append('')
        # Paragraph
        else:
            html_lines.append(f'<p>{inline(line)}</p>')

        i += 1

    if in_table:
        html_lines.append('</tbody></table>')

    # Merge consecutive list items
    result = '\n'.join(html_lines)
    result = re.sub(r'</ul>\n<ul>', '\n', result)
    result = re.sub(r'</ol>\n<ol>', '\n', result)

    return result


def inline(text: str) -> str:
    """Process inline markdown: bold, italic, code, links."""
    # Escape HTML first
    text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    # Inline code
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    # Bold
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    # Italic
    text = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', text)
    # Links
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
    return text


def build_html(title: str, body_html: str, partner_name: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>{CSS}</style>
</head>
<body>
    <div class="header-bar">
        <span class="moonpay-badge">MoonPay x {partner_name}</span>
    </div>
    {body_html}
</body>
</html>"""


def main():
    base = Path(__file__).parent
    partners_dir = base / "partners"
    docs_dir = base / "docs"
    docs_dir.mkdir(exist_ok=True)

    files = list(partners_dir.glob("*-moonpay-skill.md"))
    # Also convert outreach template
    files.append(base / "docs" / "partner-outreach.md")

    for md_file in files:
        if not md_file.exists():
            continue

        md_text = md_file.read_text()
        first_line = md_text.split('\n')[0].replace('# ', '')
        partner_name = md_file.stem.replace('-moonpay-skill', '').replace('-', ' ').title()
        if 'outreach' in md_file.stem:
            partner_name = "Partner Outreach Template"

        body = md_to_html(md_text)
        html = build_html(first_line, body, partner_name)

        out_name = md_file.stem + ".html"
        out_path = docs_dir / out_name
        out_path.write_text(html)
        print(f"  ✓ {out_path.name}")

    # Build index
    index_links = ""
    for md_file in sorted(partners_dir.glob("*-moonpay-skill.md")):
        name = md_file.stem.replace('-moonpay-skill', '').replace('-', ' ').title()
        html_name = md_file.stem + ".html"
        index_links += f'<li><a href="{html_name}">{name} x MoonPay Skill</a></li>\n'

    index_links += '<li><a href="partner-outreach.html">Partner Outreach Template</a></li>\n'

    index_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MoonPay Partner Skills</title>
    <style>{CSS}</style>
</head>
<body>
    <div class="header-bar">
        <span class="moonpay-badge">MoonPay</span>
    </div>
    <h1>Partner Skills</h1>
    <p>Agent skill files for MoonPay-integrated partners. Share these with partner teams to embed MoonPay wallet infrastructure into their products.</p>
    <h2>Partners</h2>
    <ul>
{index_links}    </ul>
    <hr>
    <p><em>Generated by MoonPay BD. Each file is self-contained — open in any browser or email directly.</em></p>
</body>
</html>"""

    (docs_dir / "index.html").write_text(index_html)
    print(f"  ✓ index.html")
    print(f"\nDone. Open: {docs_dir}/index.html")


if __name__ == "__main__":
    main()
