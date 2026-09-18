/* Install city driving in the existing activity shell; on-foot systems stay intact. */
const cityDrive=new CityDriver(globalExpedition);
{
 const g=globalExpedition;
 const old={start:g.start.bind(g),update:g.update.bind(g),camera:g.camera.bind(g),scene:g.scene.bind(g),sync:g.sync.bind(g),drawPanel:g.drawPanel.bind(g),show:g.show.bind(g),jump:g.jump.bind(g),boost:g.boost.bind(g),interact:g.interact.bind(g),clear:g.clearInput.bind(g)};
 g.start=async(type='world',opts={})=>{if(type==='race'&&!opts.local)return cityDrive.start(opts);cityDrive.hud.hidden=true;document.body.dataset.cityDriving='false';return old.start(type,opts);};
 g.update=dt=>cityDrive.active()?cityDrive.update(dt):old.update(dt);
 g.camera=dt=>cityDrive.active()?cityDrive.camera(dt):old.camera(dt);
 g.scene=()=>cityDrive.active()?cityDrive.scene():old.scene();
 g.sync=()=>{if(cityDrive.active())cityDrive.sync();else{old.sync();cityDrive.sync();}};
 g.drawPanel=()=>cityDrive.active()&&['pause','guide','journal','city-map','race-result'].includes(g.panel)?cityDrive.panel():old.drawPanel();
 g.show=kind=>{if(kind==='race-select'){csOpen('race');return;}if(cityDrive.active()&&kind==='journal')kind='city-map';return old.show(kind);};
 g.jump=()=>{if(cityDrive.active()){cityDrive.pulseBrake=.25;return;}return old.jump();};
 g.boost=()=>{if(cityDrive.active()){if(g.canPlay()&&cityDrive.state.cooldown<=0){cityDrive.state.boost=1.2;cityDrive.state.cooldown=6;audio.fx('boost');}return;}return old.boost();};
 g.interact=()=>cityDrive.active()?cityDrive.interact():old.interact();
 g.clearInput=()=>{old.clear();cityDrive.clear();};
 const oldSync=csSync;csSync=function(){oldSync();cityDrive.sync();};
 const oldDraw=csDraw;csDraw=function(){oldDraw();const label=$('csPicker')?.querySelector('.cs-race .cs-photo-label');if(label)label.textContent=csText('cityModelLabel');if(clearStart.page==='race'){
  const panel=$('csPicker'),s=panel.querySelector('.cs-detail-body>strong');if(s)s.textContent=csText('cityDetail');
  const env=panel.querySelector('.cs-environments');if(env)env.hidden=true;
  let img=panel.querySelector('.cs-large-shot');if(img)img.alt=csText('cityCar');
 }};
 CS_COPY.cityModelLabel=['نموذج السيارة داخل اللعبة','IN-GAME CAR MODEL'];CS_COPY.race=['قيادة مدينة النور','Noor City driving'];CS_COPY.raceDesc=['سيارة بأربع عجلات. شوارع ومنحدرات وحركة مرور.','Four real wheels. Streets, ramps and moving traffic.'];CS_COPY.raceStart=['ابدأ القيادة','Start driving'];CS_COPY.raceHint=['↑ تسارع، ↓ فرامل ثم رجوع، ← → توجيه. الشوارع متصلة ويمكنك اختيار طريقك.','↑ accelerate, ↓ brake/reverse, ← → steer. Connected streets: choose your own route.'];CS_COPY.assist=['توجيه هادئ للمبتدئ','Gentle steering'];CS_COPY.timed=['جولة المدينة الزمنية — ٧ وجهات','Timed city tour — 7 destinations'];CS_COPY.untimed=['استكشاف حر — دون توقيت','Free drive — untimed'];CS_COPY.cityDetail=['مدينة واحدة متصلة · ٢٥ تقاطعًا · جسر علوي','ONE CONNECTED CITY · 25 JUNCTIONS · OVERPASS'];CS_COPY.cityCar=['أفق GT — نموذج السيارة المستخدم داخل القيادة','Horizon GT — the same car model used in driving'];CS_COPY.footer=['معاينة القيادة 3.0.2 · للمراجعة على الفرع','CITY DRIVING 3.0.2 · BRANCH REVIEW'];
 // Render the exact in-game car geometry into its menu thumbnail. No stock image.
 function carThumb(){const canvas=document.createElement('canvas');canvas.width=700;canvas.height=350;const c=canvas.getContext('2d'),r={mesh:data=>({data:[...data],count:data.length/10})},art=new CityCarArt(r),items=art.items({x:0,y:0,z:0,yaw:0,wheel:.3,steer:0},0),{M,v}=N3,eye=[5.2,3.1,-6.4],vp=M.mul(M.perspective(39*Math.PI/180,2,.1,50),M.lookAt(eye,[0,.7,0]));
  const gradient=c.createLinearGradient(0,0,0,350);gradient.addColorStop(0,'#244968');gradient.addColorStop(1,'#0c243b');c.fillStyle=gradient;c.fillRect(0,0,700,350);c.fillStyle='#7ce0d130';c.beginPath();c.ellipse(350,278,210,37,0,0,Math.PI*2);c.fill();const tris=[];
  for(const it of items){const d=it.mesh.data;for(let k=0;k<d.length;k+=30){let pts=[],depth=0;for(let j=0;j<3;j++){let a=M.transform(it.matrix,d.slice(k+j*10,k+j*10+3)),p=M.transform(vp,a.slice(0,3));pts.push([(p[0]/p[3]*.5+.5)*700,(1-(p[1]/p[3]*.5+.5))*350]);depth+=p[3];}let normal=v.norm(M.transform(it.matrix,d.slice(k+3,k+6),0).slice(0,3)),light=v.norm([-.45,1,.5]),shade=.65+.38*Math.max(0,v.dot(normal,light)),colour=d.slice(k+6,k+9).map(n=>Math.min(255,Math.round(n*255*shade)));tris.push({pts,depth,colour});}}
  tris.sort((a,b)=>b.depth-a.depth);for(const t of tris){c.beginPath();t.pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=`rgb(${t.colour.join(',')})`;c.fill();}return canvas.toDataURL('image/webp',.9);
 }
 CS_THUMBS.race=carThumb();if(clearStart.open)csDraw();
 window.NABIGHA_CITY=Object.freeze({version:'3.0.2-city-review.1',snapshot:()=>cityDrive.snapshot()});
 if(new URLSearchParams(location.search).has('test'))window.NABIGHA_CITY_TEST={start:opts=>startGlobal('race',opts),keys:arr=>g.keys=new Set(arr),step:seconds=>{for(let i=0;i<Math.ceil(seconds*60);i++)simulate(1/60);updateCamera(1);renderer.render(scene(),eye,target);updateHud();},pose:s=>Object.assign(cityDrive.state,s),interact:()=>cityDrive.interact(),importSave:f=>cityDrive.importSave(f),save:()=>cityDrive.save(),core:CityCore,project:p=>renderer.project(p),view:()=>({eye:[...eye],target:[...target]}),clear:()=>g.clearInput()};
}
