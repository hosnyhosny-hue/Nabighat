"""Build the city review from tracked Clear Start sources; no downloads/deployments."""
from pathlib import Path
import importlib.util,hashlib,json,re,sys
R=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('clear_start_builder',R/'v3/clear-start/build.py')
parent=importlib.util.module_from_spec(spec);spec.loader.exec_module(parent)
MODULES=['core.js','car.js','scene.js','driver.js','integrate.js']
def build():
    raw=parent.build()
    html=raw.decode('utf-8')
    # Correct the route's right vector at the source, not by swapping labels.
    before='right=v.norm([dir[2],0,-dir[0]])'
    if html.count(before)!=1:raise ValueError('Expected one route-frame anchor')
    html=html.replace(before,'right=v.norm([-dir[2],0,dir[0]])',1)
    css=(R/'v3/city-drive/city.css').read_text(encoding='utf-8')
    code=''.join((R/'v3/city-drive'/p).read_text(encoding='utf-8') for p in MODULES)
    if html.count('csInit();')!=1:raise ValueError('Clear Start integration anchor changed')
    html=html.replace('csInit();','csInit();'+code,1)
    old_css=(R/'v3/clear-start/start.css').read_text(encoding='utf-8')
    if html.count(old_css)!=1:raise ValueError('Clear Start stylesheet anchor changed')
    html=html.replace(old_css,old_css+css,1)
    out=R/'_city_review';out.mkdir(exist_ok=True);data=html.encode('utf-8');(out/'index.html').write_bytes(data)
    report={'version':'3.0.2-city-review.1','parent_commit':'280c0a4aef80d380231bdb57e3509c5fc54aede7','bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'published':False}
    (out/'BUILD.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report));return data
if __name__=='__main__':
    try:build()
    except (ValueError,OSError,KeyError) as e:print('BUILD FAILED',e,file=sys.stderr);sys.exit(1)
