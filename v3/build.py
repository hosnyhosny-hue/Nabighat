"""Build the complete v3 preview from tracked, integrity-locked sources.
No downloads, generated runtime loaders, eval, or deployment. Python 3.9+.
Run: python3 v3/build.py --export-source
Then: python3 -m http.server 8080 --directory _preview
"""
from pathlib import Path
import argparse
import base64
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
BASE_SHA = '9c4f548e7dbe948d150d8f6caed5159056d225151e9ae9cb203ada589b36f36b'
PARENT_SHA = '548eb0097ca4239269f86246598f9dabbd2ab8be90a6130ce71347b5de2993e6'
PREVIEW_SHA = '1d2aa8dae91948da9f20c1a76733c9f9eb1221c8f063e2bb6813cd054bd1a1ba'

def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def require_hash(data: bytes, expected: str, label: str) -> None:
    if digest(data) != expected:
        raise ValueError(f'{label}: integrity mismatch; do not guess new offsets.')

def splice(text: str, edits: list, cursor: int = 0, prefix: str = '') -> str:
    parts = [prefix]
    for start, end, replacement in edits:
        if not (type(start) is int and type(end) is int and
                cursor <= start <= end <= len(text) and isinstance(replacement, str)):
            raise ValueError('Invalid integration source range')
        parts.extend([text[cursor:start], replacement])
        cursor = end
    parts.append(text[cursor:])
    return ''.join(parts)

def compile_preview() -> bytes:
    raw = (ROOT / '_includes/sky-sprint-2.2.2.html').read_bytes()
    require_hash(raw, BASE_SHA, 'Preserved full legacy source')
    base = raw.decode('utf-8')
    css = (ROOT / '_includes/mobile-hud.css').read_text(encoding='utf-8')
    edits = json.loads((ROOT / '_data/mobile_update.json').read_text(encoding='utf-8'))
    if len(edits) != 72:
        raise ValueError('Legacy integration count changed')
    parent = splice(base, edits, 61376, base[:61376] + css)
    require_hash(parent.encode('utf-8'), PARENT_SHA, 'Mobile 2.2.3')
    edits = json.loads((ROOT / '_data/global_update.json').read_text(encoding='utf-8'))
    if len(edits) != 14:
        raise ValueError('Global integration count changed')
    output = splice(parent, edits)
    for token, paths in [
        ('/*GLOBALSTYLE*/', ['v3/src/expedition.css']),
        ('/*GLOBAL*/', [f'v3/src/expedition-{i:02}.js' for i in range(1, 5)])
    ]:
        if output.count(token) != 1:
            raise ValueError(f'Expected one source insertion point: {token}')
        output = output.replace(token, ''.join((ROOT / p).read_text(encoding='utf-8') for p in paths))
    result = output.encode('utf-8')
    require_hash(result, PREVIEW_SHA, 'Integrated v3 preview')
    return result

def export_source(html: str, destination: Path) -> None:
    """Materialize conventional editable modules and the three existing hero images."""
    mapping = json.loads((ROOT / 'v3/source-map.json').read_text(encoding='utf-8'))
    template = html
    for entry in sorted(mapping, key=lambda x: x['end'] - x['start'], reverse=True):
        name = entry['path']
        if name.startswith('/') or '..' in Path(name).parts:
            raise ValueError('Unsafe source-map path')
        content = html[entry['start']:entry['end']]
        data = base64.b64decode(content.split(',', 1)[1], validate=True) if entry.get('base64') else content.encode('utf-8')
        require_hash(data, entry['sha256'], name)
        target = destination / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        template = template.replace(content, '/*SOURCE:' + name + '*/')
    (destination / 'src/index.html').write_text(template, encoding='utf-8')
    (destination / 'index.html').write_text(html, encoding='utf-8')
    (destination / 'source-map.json').write_text(json.dumps(mapping, indent=2) + '\n', encoding='utf-8')
    builder = """from pathlib import Path
import base64, hashlib, json
R=Path(__file__).resolve().parent
html=(R/'src/index.html').read_text(encoding='utf-8')
for entry in json.loads((R/'source-map.json').read_text()):
    raw=(R/entry['path']).read_bytes()
    value='data:image/webp;base64,'+base64.b64encode(raw).decode() if entry.get('base64') else raw.decode('utf-8')
    html=html.replace('/*SOURCE:'+entry['path']+'*/', value)
(R/'index.html').write_text(html,encoding='utf-8')
print(hashlib.sha256(html.encode('utf-8')).hexdigest())
"""
    (destination / 'build.py').write_text(builder, encoding='utf-8')
    (destination / 'README.md').write_text(
        '# Complete editable v3 preview\n\nRun `python3 build.py`, then serve this folder locally.\n'
        'Only the inherited original hero images are included; no font binaries or archive racing assets.\n'
        'Arabic speech still requires reviewed recordings. This is not a store release.\n', encoding='utf-8')

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / '_preview')
    parser.add_argument('--export-source', action='store_true')
    args = parser.parse_args()
    try:
        data = compile_preview()
        args.output.mkdir(parents=True, exist_ok=True)
        (args.output / 'index.html').write_bytes(data)
        if args.export_source:
            export_source(data.decode('utf-8'), args.output / 'source')
        print(f'PASS {len(data)} bytes; SHA256 {digest(data)}')
        print(args.output / 'index.html')
        return 0
    except (ValueError, OSError, KeyError) as error:
        print(f'Build failed: {error}', file=sys.stderr)
        return 1

if __name__ == '__main__':
    raise SystemExit(main())
