"""Clear Start UI / logic regression.
This restricted runner cannot create WebGL or navigate local file URLs.
A NON-RENDERING adapter is injected into the test document only; no distributed
source is changed. Layout, real game logic and existing simulation are tested.
Storage is explicitly simulated. These checks do not certify GPU rendering,
real browser-origin persistence, hosted URLs, phones or Arabic speech.
Requires Python Playwright and Chromium. No network dependencies at test time.
"""
from pathlib import Path
import hashlib,json,re,subprocess,sys
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[2]
O=R/'_review/verification';O.mkdir(parents=True,exist_ok=True);(O/'screenshots').mkdir(exist_ok=True)
html=(R/'_review/index.html').read_text(encoding='utf-8')
ADAPTER="""<script>/* TEST ONLY — not included in the game */
N3.Renderer=class {constructor(canvas){this.canvas=canvas;this.quality=0;this.fog=[.5,.8,.9];this.resize();}resize(){this.width=innerWidth;this.height=innerHeight;this.canvas.width=innerWidth;this.canvas.height=innerHeight;}mesh(d){return{count:d.length/10,buffer:{}};}dispose(){}render(items,eye,target){this.eye=eye;this.vp=N3.M.mul(N3.M.perspective((this.fov||57)*Math.PI/180,this.width/this.height,.18,260),N3.M.lookAt(eye,target));}project(p){if(!this.vp)return null;const q=N3.M.transform(this.vp,p);return{x:(q[0]/q[3]*.5+.5)*this.width,y:(1-(q[1]/q[3]*.5+.5))*this.height,visible:q[3]>.1&&q[2]/q[3]<1&&Math.abs(q[0]/q[3])<1.15&&Math.abs(q[1]/q[3])<1.15}}};</script>"""
pos=html.index('</script>')+len('</script>');testhtml=html[:pos]+ADAPTER+html[pos:]
checks=[];errors=[]
def ck(name,val,detail=None):
 checks.append({'name':name,'pass':bool(val),'detail':detail});print(('PASS ' if val else 'FAIL ')+name,flush=True)
 (O/'results.json').write_text(json.dumps({'sha256':hashlib.sha256(html.encode()).hexdigest(),'checks':checks,'errors':errors,'renderer':'NON-RENDERING TEST ADAPTER','storage':'explicit simulated storage','url':'about:blank?test','physical_devices':False},ensure_ascii=False,indent=2))
def V(p,s):return p.evaluate('()=>('+s+')')
def do(p,s):return p.evaluate('()=>{'+s+'}')
def step(p,s=.1):p.evaluate('(s)=>NABIGHA_V2_TEST.step(s)',s)
def gs(p):return V(p,'NABIGHA_GLOBAL.snapshot()')
def cs(p):return V(p,'NABIGHA_START.snapshot()')
def legacy(p):return V(p,'NABIGHA_V2.snapshot()')
def act(p,a):return p.evaluate('(a)=>NABIGHA_START_TEST.select(a)',a)
def home(p):return do(p,'NABIGHA_START_TEST.open()')
def tp(p,x,z,y=0):p.evaluate('p=>{NABIGHA_GLOBAL_TEST.teleport(...p);NABIGHA_GLOBAL_TEST.step(.03)}',[x,y,z])
def inter(p):do(p,'NABIGHA_GLOBAL_TEST.interact();NABIGHA_GLOBAL_TEST.step(.03)')
def fits(p,sel):return p.evaluate('sel=>{let r=document.querySelector(sel).getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1}',sel)
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,args=['--no-sandbox'])
 contexts=[]
 def page(width=1366,height=900,touch=False,seed=None,fail_storage=False):
  c=b.new_context(viewport={'width':width,'height':height},has_touch=touch,is_mobile=touch);contexts.append(c);c.route('https://raw.githubusercontent.com/**',lambda r:r.abort())
  p=c.new_page();p.set_default_timeout(4000);p.on('pageerror',lambda e:errors.append(str(e)));p.goto('about:blank?test')
  p.evaluate('seed=>{window.requestAnimationFrame=()=>0;window.__store=seed;Object.defineProperty(window,"localStorage",{value:{getItem:k=>__store[k]??null,setItem:(k,v)=>__store[k]=String(v),removeItem:k=>delete __store[k]}})}',seed or {})
  if fail_storage:p.evaluate('()=>{localStorage.getItem=()=>{throw Error("STORAGE_UNAVAILABLE")};localStorage.setItem=()=>{throw Error("STORAGE_UNAVAILABLE")}}')
  p.set_content(testhtml,wait_until='domcontentloaded');p.wait_for_timeout(70);do(p,'NABIGHA_V2_TEST.renderNow();NABIGHA_START_TEST.sync()');return p
 try:
  p=page();ck('Fresh player sees exactly three visible activity cards',p.locator('.cs-card:visible').count()==3)
  ck('Training is optional and not an unlock prerequisite',all(p.locator(s).is_enabled() for s in ['#globalLaunch','#globalRace','#csRun']))
  ck('Legacy stacked menu is hidden',not p.locator('#play').is_visible() and not p.locator('#legacy-globalLaunch').is_visible())
  ck('Developer lab is not on the child start screen',p.locator('#csPicker [data-cs=lab]').count()==0)
  ck('All desktop cards fit the viewport',all(fits(p,s) for s in ['#globalLaunch','#globalRace','#csRun']))
  p.screenshot(path=str(O/'screenshots/home-desktop-ar.png'))
  p.locator('#globalLaunch').click();step(p)
  ck('One direct click starts world without a training gate',gs(p)['active'] and gs(p)['type']=='world' and gs(p)['panel']=='')
  ck('First world objective is the missing key', 'المفتاح' in p.locator('#gxObjective').inner_text())
  old=gs(p)['p'];home(p);do(p,'NABIGHA_GLOBAL_TEST.keys(["KeyW"]);NABIGHA_GLOBAL_TEST.step(1)')
  ck('Activity picker pauses world motion',gs(p)['p']==old)
  act(p,'resume');do(p,'NABIGHA_GLOBAL_TEST.keys([])');ck('Resume retains world position',gs(p)['p']==old and not cs(p)['open'])
  tp(p,-12,-5);inter(p);ck('Key interaction still advances trust quest',gs(p)['state']['stage']==1)
  home(p);act(p,'training');step(p)
  ck('Tutorial entry does not erase world progress',gs(p)['state']['stage']==1)
  ck('Tutorial opens at movement objective only',cs(p)['training']['step']==0 and 'الدائرة' in p.locator('#csTrainGoal').inner_text())
  ck('Old plaza mission boards and portals do not show',not p.locator('#hubInfo').is_visible() and not p.locator('.mission-pill').is_visible())
  do(p,'NABIGHA_V2_TEST.keys(["KeyW"]);NABIGHA_V2_TEST.step(.7);NABIGHA_V2_TEST.keys([])');ck('Walking to the circle advances tutorial',cs(p)['training']['step']==1)
  before=legacy(p)['settings'];do(p,'NABIGHA_V2_TEST.keys(["KeyW"]);NABIGHA_V2_TEST.step(1.2);NABIGHA_V2_TEST.keys([])');ck('Walking into hurdle does not falsely complete jumping',cs(p)['training']['step']==1 and legacy(p)['player']['z']>-1.5)
  do(p,'NABIGHA_V2_TEST.jump();NABIGHA_V2_TEST.keys(["KeyW"]);NABIGHA_V2_TEST.step(.50);NABIGHA_V2_TEST.keys([]);NABIGHA_V2_TEST.step(.6)')
  ck('Actual simulated jump and landing completes tutorial',cs(p)['training']['step']==2,{'state':cs(p),'player':legacy(p)['player']})
  ck('Tutorial gives no faith or score unlocks',legacy(p)['settings']['completed']==before['completed'] and legacy(p)['settings']['best']==before['best'])
  ck('Tutorial completion preference is saved independently','nabigha.clear-start.v1' in V(p,'__store'))
  p.locator('#csTrainChoose').click();ck('Explicit exit returns to activity choice',cs(p)['open'])
  act(p,'world');step(p);ck('Return to world resumes its saved quest',gs(p)['state']['stage']==1)
  tp(p,4,-4);inter(p);ck('Returning key enables bridge workshop',gs(p)['state']['stage']==2)
  tp(p,14,0);inter(p);do(p,'NABIGHA_GLOBAL_TEST.beam(3);NABIGHA_GLOBAL_TEST.place();NABIGHA_GLOBAL_TEST.place();NABIGHA_GLOBAL_TEST.beam(4);NABIGHA_GLOBAL_TEST.place()')
  ck('Oversized bridge beam still rejected',gs(p)['bridgeLength']==6)
  do(p,'NABIGHA_GLOBAL_TEST.beam(2);NABIGHA_GLOBAL_TEST.place()');ck('Bridge can still be completed 3+3+2',gs(p)['state']['stage']==3 and gs(p)['bridgeLength']==8)
  state_before=gs(p)['state'];home(p);act(p,'race');ck('Race card shows vehicle and explicit start button',p.locator('.cs-large-shot').is_visible() and p.locator('[data-cs=race-start]').is_visible())
  p.locator('[data-cs=race-start]').click();ck('Race starts with three-second countdown',cs(p)['countdown']==3 and gs(p)['race']['d']==0)
  step(p,1);ck('Race timing waits for countdown',gs(p)['race']['elapsed']==0 and 1.9<cs(p)['countdown']<2.1)
  home(p);n=cs(p)['countdown'];step(p,2);ck('Picker pauses countdown too',cs(p)['countdown']==n)
  act(p,'resume');step(p,2.2);ck('Race begins after countdown',gs(p)['race']['d']>0 and cs(p)['countdown']==0)
  ck('Switching to race preserves completed world quests',gs(p)['state']==state_before)
  do(p,'NABIGHA_GLOBAL_TEST.keys(["ArrowRight"]);NABIGHA_GLOBAL_TEST.step(.3);NABIGHA_GLOBAL_TEST.keys([])');ck('Vehicle steering still works',gs(p)['race']['lateral']>0)
  do(p,'NABIGHA_GLOBAL_TEST.jump();NABIGHA_GLOBAL_TEST.step(.1)');ck('Vehicle hop still works',gs(p)['race']['y']>0)
  home(p);d=gs(p)['race']['d'];act(p,'race');ck('Choosing current race resumes without resetting',not cs(p)['open'] and gs(p)['race']['d']==d)
  do(p,'NABIGHA_GLOBAL_TEST.raceAt(NABIGHA_GLOBAL.snapshot().route.length-.1);NABIGHA_GLOBAL_TEST.step(.2)');ck('Race result and personal record are preserved',gs(p)['race']['finished'] and bool(gs(p)['state']['bests']))
  home(p);act(p,'run');ck('Runner chapter selection shown instead of confusing plaza',cs(p)['page']=='runner' and p.locator('[data-cs=chapter-0]').is_enabled())
  ck('Legacy chapter unlock requirements retained',not p.locator('[data-cs=chapter-1]').is_enabled())
  act(p,'chapter-0');ck('Runner introduction stays short',legacy(p)['modal']=='intro' and len(p.locator('#modalContent').inner_text())<350)
  do(p,'NABIGHA_V2_TEST.closeModal()')
  for chapter in range(3):
   if chapter:do(p,f'NABIGHA_V2_TEST.launchRun({chapter},false)')
   for i in range(3):
    g=legacy(p)['run']['gates'][i];do(p,f'NABIGHA_V2_TEST.setDistance({g["d"]-8});NABIGHA_V2_TEST.step(.1);NABIGHA_V2_TEST.setLane({g["answer"]-1});NABIGHA_V2_TEST.step(.4);NABIGHA_V2_TEST.interact()')
    ck(f'Legacy gate {chapter+1}.{i+1} still solved',legacy(p)['run']['gates'][i]['done'])
   do(p,'NABIGHA_V2_TEST.setDistance(780);NABIGHA_V2_TEST.step(.1)');ck(f'Chapter {chapter+1} completion saved',legacy(p)['settings']['completed'][chapter])
  home(p);act(p,'settings');ck('IBM typography controls remain in settings',p.locator('#typeSettings').is_visible())
  p.locator('[data-type-size=larger]').click();ck('Larger text preference available',V(p,'NABIGHA_TYPOGRAPHY.snapshot().readingSize')=='larger')
  do(p,'NABIGHA_V2_TEST.closeModal(false)');ck('Closing settings returns to choice without movement',cs(p)['open'])
  act(p,'looks');ck('Approved character art preserved in appearance view',p.locator('.cs-looks img').is_visible())
  act(p,'outfit-2');ck('Character colour selection still changes model setting',legacy(p)['settings']['outfit']==2)
  home(p);act(p,'language');p.wait_for_timeout(50);ck('English labels include all three activities',p.locator('#csRun strong').inner_text()=='Sky sprint' and p.locator('#globalRace strong').inner_text()=='Hovercraft racing')
  p.screenshot(path=str(O/'screenshots/home-desktop-en.png'))
  store=V(p,'__store');p2=page(seed=store);ck('Reload reconstructs old chapter saves',all(legacy(p2)['settings']['completed']))
  ck('Reload reconstructs world, race and training preferences',gs(p2)['state']['stage']==3 and bool(gs(p2)['state']['bests']) and cs(p2)['trained'])
  ck('Language and character colour retained',legacy(p2)['lang']=='en' and legacy(p2)['settings']['outfit']==2)
  bad=gs(p2)['state'];ret=p2.evaluate('()=>NABIGHA_GLOBAL_TEST.importSave(new File(["{}"],"bad.json"))');ck('Invalid save rejected atomically',ret is False and gs(p2)['state']==bad)
  for width,height,lang in [(393,852,'ar'),(360,720,'ar'),(852,393,'en')]:
   m=page(width,height,True)
   if lang=='en':act(m,'language');m.wait_for_timeout(40)
   ck(f'{width}x{height} {lang}: no horizontal overflow',V(m,'document.querySelector("#csPicker").scrollWidth<=innerWidth+1'))
   ck(f'{width}x{height}: primary three activities all exist',m.locator('.cs-card').count()==3)
   m.screenshot(path=str(O/f'screenshots/home-{width}-{height}-{lang}.png'))
   # Cards can scroll vertically; every card remains actionable, including at large text sizes.
   m.locator('#globalRace').click();m.locator('[data-cs=race-start]').click();step(m,3.2)
   ck(f'{width}x{height}: race touch controls fit',fits(m,'#gxLeft') and fits(m,'#gxRight') and fits(m,'#gxJump'))
   y=gs(m)['race']['y'];m.locator('#gxJump').tap();do(m,'NABIGHA_GLOBAL_TEST.step(.1)');ck(f'{width}x{height}: touch hop triggers movement',gs(m)['race']['y']>y)
   home(m);act(m,'training');step(m)
   ck(f'{width}x{height}: tutorial guidance fits screen',fits(m,'#csTraining'))
   ck(f'{width}x{height}: tutorial instructions concise',len(m.locator('#csTrainGoal').inner_text())<90)
   ck(f'{width}x{height}: joystick and jump controls fit',fits(m,'#joystick') and fits(m,'#jump'))
   r=m.locator('#joystick').bounding_box();x,y=r['x']+r['width']/2,r['y']+r['height']/2
   cdp=m.context.new_cdp_session(m);cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]});cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y-35}]});step(m,.8);cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});ck(f'{width}x{height}: touch stick advances tutorial',cs(m)['training']['step']==1)
   home(m);act(m,'world');step(m)
   ck(f'{width}x{height}: world objective and choose button fit',fits(m,'#gxMission') and fits(m,'.gx-nav [data-cs=choose]'))
   # UI-only screenshot, background intentionally absent: adapter is not real rendering.
  broken=page(fail_storage=True);act(broken,'world');step(broken);ck('Unavailable storage does not block world entry',gs(broken)['active'] and not gs(broken)['storageOK'])
  home(broken);act(broken,'training');step(broken);ck('Unavailable storage does not block training',cs(broken)['training']['active'])
  ck('No uncaught JavaScript errors during UI/logic suite',not errors,errors)
 finally:
  for c in contexts:c.close()
  b.close()
print('RESULT',sum(x['pass'] for x in checks),'/',len(checks))
sys.exit(1 if errors or any(not x['pass'] for x in checks) else 0)
