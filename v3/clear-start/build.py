"""Build Clear Start review without changing or deploying the preserved v3 engine.
Run: python3 v3/clear-start/build.py. No external packages or network required.
"""
from pathlib import Path
import hashlib, importlib.util, json, sys
ROOT=Path(__file__).resolve().parents[1]
REPO=ROOT.parent
spec=importlib.util.spec_from_file_location('preserved_v3',ROOT/'build.py')
base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)

def build():
    html=base.compile_preview().decode('utf-8')
    edits=json.loads((REPO/'_data/clear_start.json').read_text(encoding='utf-8'))
    for before,after in edits:
        if html.count(before)!=1: raise ValueError('Clear Start anchor mismatch: '+before[:90])
        html=html.replace(before,after,1)
    js=(ROOT/'clear-start/start.js').read_text(encoding='utf-8')
    thumbs=json.dumps({k:(ROOT/'clear-start'/f'{k}.data').read_text(encoding='utf-8').strip() for k in ['world','race','run']},separators=(',',':'))
    js=js.replace('/*CS_THUMBNAILS*/',thumbs)
    html=html.replace('/*CLEAR_START_CSS*/',(ROOT/'clear-start/start.css').read_text(encoding='utf-8'))
    html=html.replace('/*CLEAR_START_JS*/',js)
    out=REPO/'_review';out.mkdir(exist_ok=True)
    raw=html.encode('utf-8');(out/'index.html').write_bytes(raw)
    report={'base_commit':'b1596357bbd33aae03edbc9738be22f1043238de','base_sha256':base.PREVIEW_SHA,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'anchors':len(edits),'published':False}
    (out/'BUILD.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report));return raw
if __name__=='__main__':
    try:build()
    except (ValueError,OSError,KeyError) as e:print('BUILD FAILED:',e,file=sys.stderr);raise SystemExit(1)
