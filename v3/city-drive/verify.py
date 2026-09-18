"""Browser UI/input tests with an explicitly non-rendering adapter in this environment.
Game HTML is unchanged. about:blank test document, simulated storage, fixed steps.
This is NOT native WebGL, physical-phone or hosted-persistence certification.
"""
from pathlib import Path
import json,hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[2];O=R/'_city_review/verification';O.mkdir(parents=True,exist_ok=True)
html=(R/'_city_review/index.html').read_text(encoding='utf-8')
ADAPTER='''<script>N3.Renderer=class {constructor(canvas){this.canvas=canvas;this.quality=0;this.fog=[.5,.8,.9];this.resize();}resize(){this.width=innerWidth;this.height=innerHeight;this.canvas.width=innerWidth;this.canvas.height=innerHeight;}mesh(d){return{count:d.length/10,buffer:{}};}dispose(){}render(items,eye,target){this.eye=eye;this.vp=N3.M.mul(N3.M.perspective((this.fov||57)*Math.PI/180,this.width/this.height,.18,260),N3.M.lookAt(eye,target));}project(p){if(!this.vp)return null;const q=N3.M.transform(this.vp,p);return{x:(q[0]/q[3]*.5+.5)*this.width,y:(1-(q[1]/q[3]*.5+.5))*this.height,visible:q[3]>.1&&q[2]/q[3]<1&&Math.abs(q[0]/q[3])<1.15&&Math.abs(q[1]/q[3])<1.15}}};</script>'''
pos=html.index('</script>')+9;testhtml=html[:pos]+ADAPTER+html[pos:]
checks=[];errors=[]
def ck(name,value,detail=None):
 checks.append({'name':name,'pass':bool(value),'detail':detail});print(('PASS ' if value else 'FAIL ')+name,flush=True)
def V(p,s):return p.evaluate('()=>('+s+')')
def step(p,t=.1):return p.evaluate('(t)=>NABIGHA_CITY_TEST.step(t)',t)
def snap(p):return V(p,'NABIGHA_CITY.snapshot()')
def pick(p,a):return p.evaluate('(a)=>NABIGHA_START_TEST.select(a)',a)
def openmenu(p):return p.evaluate('()=>NABIGHA_START_TEST.open()')
def fits(p,selector):return p.evaluate('s=>{let r=document.querySelector(s).getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1}',selector)
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/lib/chromium/chromium',headless=True,args=['--no-sandbox']);contexts=[]
 def page(width=1366,height=900,touch=False,seed=None,deny=False):
  c=b.new_context(viewport={'width':width,'height':height},has_touch=touch,is_mobile=touch);contexts.append(c);c.route('https://raw.githubusercontent.com/**',lambda r:r.abort());p=c.new_page();p.on('pageerror',lambda e:errors.append(str(e)));p.set_default_timeout(4000);p.goto('about:blank?test');p.evaluate('seed=>{window.requestAnimationFrame=()=>0;window.__store=seed;Object.defineProperty(window,"localStorage",{value:{getItem:k=>__store[k]??null,setItem:(k,v)=>__store[k]=String(v),removeItem:k=>delete __store[k]}})}',seed or {})
  if deny:p.evaluate('()=>{localStorage.getItem=()=>{throw Error("UNAVAILABLE")};localStorage.setItem=()=>{throw Error("UNAVAILABLE")}}')
  p.set_content(testhtml,wait_until='domcontentloaded');p.wait_for_timeout(100);return p
 try:
  p=page();ck('Three activity choices retained',p.locator('.cs-card:visible').count()==3)
  ck('City activity replaces hovercraft wording',p.locator('#globalRace strong').inner_text()=='قيادة مدينة النور')
  p.screenshot(path=str(O/'home.png'))
  p.locator('#globalRace').click();ck('City preview is a render of the new in-game car geometry',p.locator('.cs-large-shot').get_attribute('alt').startswith('أفق GT'))
  ck('Old colour-swap environment choices are hidden',not p.locator('.cs-environments').is_visible())
  p.screenshot(path=str(O/'car-preview.png'))
  p.locator('[data-cs=race-start]').click();step(p,3.2);s=snap(p);ck('City starts with physical stationary car',s['active'] and s['state']['speed']==0)
  ck('Connected city has 53 buildings and ten roads',s['stats']['buildings']==53 and s['stats']['roads']==10,s['stats'])
  ck('Ten independently moving traffic cars exist',len(s['traffic'])==10)
  # Genuine keyboard events feed the production input handlers, then fixed physics steps.
  p.locator('#world').focus();p.keyboard.down('ArrowUp');step(p,1);p.keyboard.up('ArrowUp');ck('ArrowUp accelerates without auto rail movement',snap(p)['state']['speed']>7)
  for lang in ['ar','en']:
   if lang=='en':p.locator('#cityLanguage').click()
   for key,sign in [('ArrowRight',1),('ArrowLeft',-1)]:
    p.evaluate('()=>{NABIGHA_CITY_TEST.pose({x:0,z:80,y:0,yaw:0,speed:8,steer:0,ground:true,finished:false});NABIGHA_CITY_TEST.clear()}');step(p,0)
    p.locator('#world').focus();p.keyboard.down(key);step(p,.3);p.keyboard.up(key)
    ck(f'{lang}: {key} changes actual forward world displacement correctly',snap(p)['state']['x']*sign>0)
   # Corrected local-route basis is positive screen-right; this fixes the inherited reversed circuit too.
   ck(f'{lang}: corrected legacy route right vector',V(p,'NabighaGlobal.sample(NabighaGlobal.routeInfo([[0,0,0],[0,0,-20]]),5).right[0]')>0)
  q=snap(p)['state'];p.locator('#cityPause').click();step(p,2);ck('Pause freezes car and timer',snap(p)['state']['elapsed']==q['elapsed'])
  p.locator('[data-gx=resume]').click();openmenu(p);before=snap(p)['state'];step(p,2);ck('Activity chooser freezes city simulation',snap(p)['state']['elapsed']==before['elapsed']);pick(p,'resume');step(p,.1)
  p.evaluate('()=>{NABIGHA_CITY_TEST.pose({x:-80,z:80,y:0,speed:0});NABIGHA_CITY_TEST.interact()}');ck('Optional delivery requires location and records only completion',0 in snap(p)['saved']['deliveries'])
  old=snap(p)['saved'];ok=p.evaluate('()=>NABIGHA_CITY_TEST.importSave(new File(["{}"],"invalid.json"))');ck('Corrupt city save rejected atomically',not ok and snap(p)['saved']==old)
  seed=V(p,'__store');p2=page(seed=seed);ck('City deliveries survive simulated reload separately from old saves',0 in snap(p2)['saved']['deliveries'])
  openmenu(p);pick(p,'world');step(p,.1);ck('Expedition remains reachable with original Rayyan',V(p,'NABIGHA_GLOBAL.snapshot().type')=='world' and V(p,'NABIGHA_GLOBAL.snapshot().active'))
  ck('City HUD fully removed on foot',not p.locator('#cityHud').is_visible())
  p.evaluate('()=>{NABIGHA_GLOBAL_TEST.teleport(-12,0,-5);NABIGHA_GLOBAL_TEST.interact()}');ck('Original key pickup remains functional',V(p,'NABIGHA_GLOBAL.snapshot().state.stage')==1)
  openmenu(p);pick(p,'training');step(p,.1);ck('Optional training still starts',V(p,'NABIGHA_START.snapshot().training.active'))
  p.evaluate('()=>{NABIGHA_V2_TEST.keys(["ArrowUp"]);NABIGHA_V2_TEST.step(.75);NABIGHA_V2_TEST.keys([])}');ck('Training movement milestone still completes',V(p,'NABIGHA_START.snapshot().training.step')==1)
  openmenu(p);pick(p,'chapter-0');p.evaluate('()=>NABIGHA_V2_TEST.closeModal()');step(p,.1);ck('Legacy sprint reachable',V(p,'NABIGHA_V2.snapshot().mode')=='run')
  for i in range(3):
   p.evaluate('(i)=>{let g=NABIGHA_V2.snapshot().run.gates[i];NABIGHA_V2_TEST.setDistance(g.d-8);NABIGHA_V2_TEST.step(.1);NABIGHA_V2_TEST.setLane(g.answer-1);NABIGHA_V2_TEST.step(.4);NABIGHA_V2_TEST.interact()}',i)
  ck('Legacy three thinking gates still solve',all(x['done'] for x in V(p,'NABIGHA_V2.snapshot().run.gates')))
  openmenu(p);pick(p,'settings');ck('IBM reading controls preserved',p.locator('#typeSettings').is_visible());p.evaluate('()=>NABIGHA_V2_TEST.closeModal(false)')
  for width,height,lang in [(393,852,'ar'),(360,720,'ar'),(852,393,'en')]:
   m=page(width,height,True)
   if lang=='en':pick(m,'language')
   pick(m,'race');pick(m,'race-start');step(m,3.2)
   ck(f'{width}x{height}: physical arrows stay left-to-right',V(m,'document.querySelector("#cityLeft").getBoundingClientRect().x<document.querySelector("#cityRight").getBoundingClientRect().x'))
   ck(f'{width}x{height}: touch pedals and navigation fit',all(fits(m,x) for x in ['#cityGas','#cityBrake','#cityLeft','#cityRight','.city-top','.city-mission']))
   r=m.locator('#cityGas').bounding_box();cdp=m.context.new_cdp_session(m);cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':r['x']+25,'y':r['y']+25}]});step(m,.5);cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});ck(f'{width}x{height}: real touch gas event accelerates',snap(m)['state']['speed']>3)
   before=snap(m)['state']['yaw'];r=m.locator('#cityRight').bounding_box();cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':r['x']+25,'y':r['y']+25}]});step(m,.25);cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});ck(f'{width}x{height}: real touch right turns right',snap(m)['state']['yaw']>before)
   m.screenshot(path=str(O/f'layout-{width}-{height}.png'))
  n=page(deny=True);pick(n,'race');pick(n,'race-start');step(n,3.2);ck('Storage-unavailable fallback still allows driving',snap(n)['active'] and not snap(n)['storageOK'])
  ck('No uncaught JavaScript exceptions',not errors,errors)
 finally:
  for c in contexts:c.close()
  b.close()
report={'sha256':hashlib.sha256(html.encode()).hexdigest(),'checks':checks,'errors':errors,'renderer':'NON-RENDERING adapter in test document only','storage':'simulated','physical_devices':False,'hosted_url_test':False}
(O/'RESULTS.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('PASS',sum(x['pass'] for x in checks),'/',len(checks))
raise SystemExit(1 if errors or any(not x['pass'] for x in checks) else 0)
