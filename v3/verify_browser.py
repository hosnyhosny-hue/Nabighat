"""Browser regression for the branch-built preview, with no production deployment.

Requires Python Playwright and Chromium. Build first: python3 v3/build.py.
Normal local server: python3 v3/verify_browser.py --url http://localhost:8080
Restricted environment: --isolated loads EXACT HTML in about:blank?test and
explicitly simulates storage. It does not pretend to test HTTP, real persistence,
GitHub Pages, a physical phone, voice quality or device performance.
No game source or WebGL is mocked; deterministic checks use the shipped test API.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import struct
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url')
parser.add_argument('--isolated', action='store_true')
parser.add_argument('--browser', default='/usr/lib/chromium/chromium')
parser.add_argument('--output', type=Path, default=ROOT / '_preview/verification')
args = parser.parse_args()
if not args.url and not args.isolated:
    parser.error('Choose --url or explicitly acknowledge --isolated testing.')
html = (ROOT / '_preview/index.html').read_text(encoding='utf-8')
args.output.mkdir(parents=True, exist_ok=True)
shots = args.output / 'screenshots'
shots.mkdir(exist_ok=True)
checks, errors = [], []


def check(name, value, detail=None):
    entry = {'name': name, 'passed': bool(value)}
    if detail is not None:
        entry['detail'] = detail
    checks.append(entry)
    print(('PASS ' if value else 'FAIL ') + name, flush=True)
    write_report()


def write_report():
    report = {'sha256': hashlib.sha256(html.encode()).hexdigest(),
              'isolated_document': args.isolated, 'storage_simulated_in_deterministic_tests': args.isolated,
              'source_modified_for_tests': False, 'webgl_mocked': False,
              'checks': checks, 'uncaught_errors': errors,
              'limitations': ['Not a hosted branch or Pages test in isolated mode',
                              'Not a physical phone test', 'No Arabic speech quality approval',
                              'Optional IBM font network requests blocked in this harness',
                              'Most mission scenarios use explicit deterministic simulation steps']}
    (args.output / 'results.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')


def snap(page):
    return page.evaluate('NABIGHA_GLOBAL.snapshot()')


def step(page, seconds=.2):
    page.evaluate('s=>NABIGHA_GLOBAL_TEST.step(s)', seconds)


def teleport(page, x, z, y=0):
    page.evaluate('p=>{NABIGHA_GLOBAL_TEST.teleport(...p);NABIGHA_GLOBAL_TEST.step(.03)}', [x, y, z])


def interact(page):
    page.evaluate('NABIGHA_GLOBAL_TEST.interact()')
    step(page, .03)


def fresh(**changes):
    return dict(dict(version=1, stage=0, bridge=[], rot=[0, 2, 0, 2], noor=False,
                     discoveries=[], assist=True, biome=0, bests={}), **changes)


def import_state(page, state):
    page.evaluate('async s=>{await NABIGHA_GLOBAL_TEST.importSave(new File([JSON.stringify(s)],"save.json"));NABIGHA_GLOBAL_TEST.resume()}', state)
    step(page, .03)


def visible_fit(page, selectors):
    return page.evaluate('''selectors=>selectors.every(s=>{const e=document.querySelector(s),r=e?.getBoundingClientRect();return r&&r.width>0&&r.height>0&&r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1})''', selectors)


with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=args.browser, headless=True,
        args=['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader-webgl', '--ignore-gpu-blocklist'])
    contexts = []

    def open_game(width=1366, height=900, touch=False, seed=None, deterministic=True, simulate_storage=True):
        context = browser.new_context(viewport={'width': width, 'height': height}, has_touch=touch, is_mobile=touch)
        contexts.append(context)
        context.route('https://raw.githubusercontent.com/**', lambda route: route.abort())
        page = context.new_page()
        page.set_default_timeout(10000)
        page.on('pageerror', lambda e: errors.append(str(e)))
        init = ''
        if args.isolated and simulate_storage:
            init += 'window.__testStorage=' + json.dumps(seed or {}) + ';'
            init += "Object.defineProperty(window,'localStorage',{value:{getItem:k=>window.__testStorage[k]??null,setItem:(k,v)=>window.__testStorage[k]=String(v),removeItem:k=>delete window.__testStorage[k],clear:()=>window.__testStorage={}}});"
        if deterministic:
            init += 'window.requestAnimationFrame=()=>0;'
        if args.isolated:
            page.goto('about:blank?test' if deterministic else 'about:blank')
            if init:
                page.evaluate(init)
            page.set_content(html, wait_until='domcontentloaded')
        else:
            if init:
                page.add_init_script(init)
            page.goto(args.url.rstrip('/') + ('/?test' if deterministic else '/'), wait_until='domcontentloaded')
        page.wait_for_function('!!window.NABIGHA_GLOBAL && !!window.NABIGHA_V2')
        if deterministic:
            page.evaluate('NABIGHA_V2_TEST.renderNow()')
        return page

    try:
        # Production bytes: real animation loop, no test API, no mock storage.
        release = open_game(deterministic=False, simulate_storage=False)
        check('Unmodified release initializes real WebGL', release.evaluate('!!document.querySelector("#world").getContext("webgl")'))
        check('Production document does not expose test helpers', release.evaluate('!window.NABIGHA_GLOBAL_TEST&&!window.NABIGHA_V2_TEST'))
        frames = release.evaluate('NABIGHA_V2.snapshot().frames')
        release.wait_for_timeout(600)
        check('Real animation frames advance', release.evaluate('NABIGHA_V2.snapshot().frames') > frames)
        release.locator('#globalLaunch').click()
        release.locator('[data-gx=resume]').click()
        z = snap(release)['p']['z']
        release.keyboard.down('KeyW'); release.wait_for_timeout(700); release.keyboard.up('KeyW')
        check('Production keyboard moves the world character', snap(release)['p']['z'] < z-.2)
        release.locator('#gxPause').click(); old = snap(release)['p']
        release.wait_for_timeout(400)
        check('Production pause freezes movement', snap(release)['p'] == old)
        release.locator('[data-gx=home]').click()
        release.locator('#globalRace').click(); release.locator('[data-gx=race-start]').click()
        old = snap(release)['race']['d']; release.wait_for_timeout(600)
        check('Production circuit advances with real frames', snap(release)['race']['d'] > old)
        release.locator('#gxPause').click(); release.locator('[data-gx=home]').click()
        check('Production return to original menu works', release.locator('#play').is_visible())
        if args.isolated:
            check('Opaque-origin storage failure does not prevent play', not snap(release)['storageOK'])
        release.close()

        page = open_game()
        check('Both complete game APIs and original chapters are present', page.evaluate('!!NABIGHA_GLOBAL_TEST && !!NABIGHA_V2_TEST && document.querySelectorAll("[data-chapter]").length===3'))
        page.screenshot(path=str(shots/'home-ar.png'))
        page.locator('#globalLaunch').click(); page.locator('[data-gx=resume]').click(); step(page)
        check('Expedition entry button is wired', snap(page)['active'] and snap(page)['type']=='world')
        teleport(page, -12, -5); interact(page)
        check('Key is collected in the world', snap(page)['state']['stage']==1)
        teleport(page, 4, -4); interact(page)
        check('Returning the key unlocks the builder', snap(page)['state']['stage']==2)
        teleport(page, 14, 0); interact(page)
        check('Builder opens only in context', snap(page)['builder'])
        page.locator('[data-beam-gx="3"]').click(); page.locator('#gxInteract').click(); step(page)
        check('UI places a physical 3m piece', snap(page)['bridgeLength']==3)
        page.locator('#gxUndo').click(); step(page)
        check('UI undo removes the uncompleted piece', snap(page)['bridgeLength']==0)
        page.evaluate('NABIGHA_GLOBAL_TEST.beam(3);NABIGHA_GLOBAL_TEST.place();NABIGHA_GLOBAL_TEST.place();NABIGHA_GLOBAL_TEST.beam(4);NABIGHA_GLOBAL_TEST.place()')
        check('Oversized piece is rejected without consumption', snap(page)['bridgeLength']==6)
        page.evaluate('NABIGHA_GLOBAL_TEST.beam(2);NABIGHA_GLOBAL_TEST.place()'); step(page)
        check('3+3+2 completes the 8m bridge', snap(page)['bridgeLength']==8 and snap(page)['state']['stage']==3)
        teleport(page,17,0,.3); page.evaluate("NABIGHA_GLOBAL_TEST.keys(['KeyD'])"); step(page,1.7);page.evaluate('NABIGHA_GLOBAL_TEST.keys([])')
        check('Built bridge is physically walkable to the next island', snap(page)['p']['x']>24 and snap(page)['p']['y']>=0)
        check('Water needs Noor as well as connected pipes', not snap(page)['wet'])
        teleport(page,26,4);interact(page)
        check('Noor takes the pump role', snap(page)['state']['noor'] and 0 in snap(page)['wet'])
        for i,(x,z) in enumerate([(29,0),(29,-3),(32,-3),(32,0)]):
            teleport(page,x,z)
            for _ in range(([3,1,2,0][i]-snap(page)['state']['rot'][i])%4): interact(page)
        check('Connected water graph restores the oasis', snap(page)['state']['stage']==4 and snap(page)['waterSolved'])
        step(page,3); check('Oasis visual growth completes', snap(page)['bloom']>.99)
        teleport(page,35,5);page.screenshot(path=str(shots/'oasis-restored.png'))
        page.locator('#gxBook').click()
        check('Journal is connected to three world milestones', page.locator('.gx-journal-row').count()==3)
        page.locator('[data-gx=resume]').click();teleport(page,200,200,-7);step(page)
        check('Safe return preserves completed work',snap(page)['state']['stage']==4 and snap(page)['p']['x']==25)
        before=snap(page)['state']; bad=fresh(stage=4)
        accepted=page.evaluate('s=>NABIGHA_GLOBAL_TEST.importSave(new File([JSON.stringify(s)],"bad.json"))',bad)
        check('Invalid save is rejected atomically', not accepted and snap(page)['state']==before)
        if args.isolated:
            seed=page.evaluate('window.__testStorage');saved=snap(page)['state'];page.close();page=open_game(seed=seed)
            check('Save serialization round-trip in explicitly simulated storage',snap(page)['state']==saved)
        import_state(page,fresh(stage=2));teleport(page,14,0);interact(page)
        page.evaluate('NABIGHA_GLOBAL_TEST.beam(4);NABIGHA_GLOBAL_TEST.place();NABIGHA_GLOBAL_TEST.place()')
        check('Alternative 4+4 solution works',snap(page)['state']['bridge']==[4,4] and snap(page)['state']['stage']==3)
        page.evaluate("NABIGHA_GLOBAL_TEST.start('race',{timed:true})");step(page,.2)
        page.evaluate("NABIGHA_GLOBAL_TEST.keys(['KeyD'])");step(page,.3);page.evaluate('NABIGHA_GLOBAL_TEST.keys([])')
        check('Steering controls the hovercraft',snap(page)['race']['lateral']>.6)
        page.evaluate('NABIGHA_GLOBAL_TEST.jump()');step(page,.12)
        check('Hovercraft hop has physical height',snap(page)['race']['y']>.3)
        page.evaluate('NABIGHA_GLOBAL_TEST.boost()');step(page,.35)
        check('Boost increases speed',snap(page)['race']['speed']>15)
        page.locator('#gxPause').click();elapsed=snap(page)['race']['elapsed'];step(page,5)
        check('Pause excludes time from the lap',snap(page)['race']['elapsed']==elapsed)
        page.locator('[data-gx=resume]').click();step(page,1);page.screenshot(path=str(shots/'circuit.png'))
        step(page,35);s=snap(page)
        check('Circuit finishes all 12 checkpoints',s['race']['finished'] and s['race']['checkpoint']==12)
        check('A real sampled personal replay is recorded',s['race']['frames']>30 and bool(s['state']['bests']))
        check('Recorded replay validates as a save',page.evaluate('s=>{try{NabighaGlobal.validate(s);return true}catch(e){return false}}',s['state']))
        page.locator('[data-gx=replay]').click();step(page,.2)
        check('Next lap uses the recorded ghost',snap(page)['race']['ghost'])
        key=snap(page)['race']['key'];page.locator('#gxPause').click();page.locator('[data-gx=race-select]').click();page.locator('[data-gx=biome-1]').click();page.locator('[data-gx=assist]').click();page.locator('[data-gx=race-start]').click();step(page)
        check('Biome and assist have separate replay records',snap(page)['race']['key']!=key and not snap(page)['race']['ghost'])
        page.locator('#gxPause').click();page.locator('[data-gx=race-select]').click();page.locator('[data-gx=race-free]').click();before=snap(page)['state']['bests'];step(page,35)
        check('Untimed exploration does not overwrite race records',not snap(page)['race']['timed'] and snap(page)['state']['bests']==before)
        page.locator('[data-gx=home]').click();page.locator('#globalLab').click()
        # Synthetic, original fixtures, never the user's unlicensed archive.
        route=page.evaluate('Array.from({length:64},(_,i)=>{let a=i/63*Math.PI*2;return [[Math.sin(a)*45,0,Math.cos(a)*40],[0,1,0]]})')
        page.locator('#gxRouteFile').set_input_files({'name':'synthetic-route.json','mimeType':'application/json','buffer':json.dumps(route).encode()})
        page.wait_for_function('NABIGHA_GLOBAL.snapshot().localRoute!==null')
        check('Local lab accepts the nested route schema',snap(page)['localRoute']['points']>=12)
        page.locator('#gxRouteFile').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'[[0,0,0]]'})
        page.wait_for_function('document.querySelector("#gxRouteReport").textContent.includes("تعذر")')
        check('Bad route leaves the valid route intact',snap(page)['localRoute'] is not None)
        payload=json.dumps({'asset':{'version':'2.0'},'meshes':[{'primitives':[]}],'nodes':[]}).encode();payload+=b' '*((-len(payload))%4)
        glb=struct.pack('<IIIII',0x46546c67,2,20+len(payload),len(payload),0x4e4f534a)+payload
        page.locator('#gxGLBFile').set_input_files({'name':'synthetic.glb','mimeType':'model/gltf-binary','buffer':glb})
        page.wait_for_function('document.querySelector("#gxGLBReport").textContent.includes("synthetic.glb")')
        check('GLB inspection reports metadata without rendering/importing assets', 'Draco: NO' in page.locator('#gxGLBReport').inner_text())
        page.locator('[data-gx=race-local]').click();step(page,.5)
        check('Lab route is connected to local playable trial',snap(page)['race']['local'])
        page.locator('#gxPause').click();page.locator('[data-gx=home]').click()
        check('Legacy play button survives global modes',page.locator('#play').is_visible())
        for chapter in range(3):
            page.evaluate('c=>NABIGHA_V2_TEST.launchRun(c,false)',chapter)
            for gate,d in enumerate([167,387,627]):
                page.evaluate('d=>{NABIGHA_V2_TEST.setDistance(d);NABIGHA_V2_TEST.step(.2)}',d)
                answer=page.evaluate('i=>NABIGHA_V2.snapshot().run.gates[i].answer',gate)
                page.evaluate('n=>{NABIGHA_V2_TEST.setLane(n-1);NABIGHA_V2_TEST.step(.5);NABIGHA_V2_TEST.interact();NABIGHA_V2_TEST.step(.1)}',answer)
                check(f'Legacy chapter {chapter+1}, gate {gate+1} remains playable',page.evaluate('i=>NABIGHA_V2.snapshot().run.gates[i].done',gate))
            page.evaluate('NABIGHA_V2_TEST.setDistance(780);NABIGHA_V2_TEST.step(.3)')
        page.close()
        for width,height,lang in [(393,852,'ar'),(360,720,'ar'),(852,393,'en')]:
            mobile=open_game(width,height,True)
            if lang=='en':mobile.locator('#language').click()
            mobile.locator('#globalLaunch').click();mobile.locator('[data-gx=resume]').click();step(mobile)
            check(f'{width}x{height} {lang}: visible and reachable world controls',visible_fit(mobile,['#gxPause','#gxJump','#gxJoy','#gxHelp']))
            check(f'{width}x{height}: compact mission leaves lower scene clear',mobile.locator('#gxMission').bounding_box()['height']<80)
            mobile.locator('#gxJump').dispatch_event('pointerdown',{'pointerId':1,'clientX':300,'clientY':600});step(mobile,.12)
            check(f'{width}x{height}: touch jump is bound',snap(mobile)['p']['y']>.2)
            mobile.locator('#gxHelp').click();check(f'{width}x{height}: help modal pauses the game',snap(mobile)['panel']=='guide')
            mobile.locator('[data-gx=resume]').click();step(mobile,.5)
            mobile.screenshot(path=str(shots/f'world-{width}-{height}-{lang}.png'))
            mobile.locator('#gxLang').click();step(mobile)
            check(f'{width}x{height}: language changes during play',mobile.evaluate('document.documentElement.lang')!=lang)
            mobile.close()
        check('No uncaught JavaScript exceptions during test suite',not errors,errors)
    finally:
        write_report()
        for context in contexts:
            context.close()
        browser.close()

print(f'{sum(x["passed"] for x in checks)}/{len(checks)} checks passed')
raise SystemExit(0 if checks and all(x['passed'] for x in checks) and not errors else 1)
