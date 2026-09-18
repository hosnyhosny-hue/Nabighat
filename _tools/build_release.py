"""Compile and integrity-check the standalone 2.2.3 HTML. No dependencies.
Run from the repository root: python3 _tools/build_release.py
The normal GitHub Pages Jekyll template performs the same slices at build time;
there is no client-side loader, runtime patching, or new network dependency.
"""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
BASE_SHA256 = '9c4f548e7dbe948d150d8f6caed5159056d225151e9ae9cb203ada589b36f36b'
OUTPUT_SHA256 = '548eb0097ca4239269f86246598f9dabbd2ab8be90a6130ce71347b5de2993e6'

def compile_release():
    raw = (ROOT / '_includes/sky-sprint-2.2.2.html').read_bytes()
    if hashlib.sha256(raw).hexdigest() != BASE_SHA256:
        raise ValueError('Preserved base changed; rebuild the release delta instead of guessing offsets.')
    base = raw.decode('utf-8')
    css = (ROOT / '_includes/mobile-hud.css').read_text(encoding='utf-8')
    edits = json.loads((ROOT / '_data/mobile_update.json').read_text(encoding='utf-8'))
    if len(edits) != 72:
        raise ValueError('Unexpected release delta.')
    cursor = 61376
    parts = [base[:cursor], css]
    for start, end, replacement in edits:
        if not (isinstance(start, int) and isinstance(end, int) and isinstance(replacement, str) and cursor <= start <= end <= len(base)):
            raise ValueError('Invalid release delta range.')
        parts.extend([base[cursor:start], replacement])
        cursor = end
    parts.append(base[cursor:])
    output = ''.join(parts).encode('utf-8')
    if hashlib.sha256(output).hexdigest() != OUTPUT_SHA256:
        raise ValueError('Output differs from the tested 2.2.3 build.')
    return output

if __name__ == '__main__':
    output = compile_release()
    destination = ROOT / '_release/index.html'
    destination.parent.mkdir(exist_ok=True)
    destination.write_bytes(output)
    print(f'PASS: {len(output)} bytes; SHA256 {OUTPUT_SHA256}')
    print(destination)
