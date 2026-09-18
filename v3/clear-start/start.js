/* Clear Start 3.0.1. Navigation and optional guided training only.
   Uses existing renderer, character, geometry, saves, fonts and reviewed audio. */
const CS_COPY={
 title:['ماذا تحب أن تلعب اليوم؟','What will you play today?'], eyebrow:['اختر مغامرتك','CHOOSE YOUR ADVENTURE'],
 welcome:['مع ريان ونور، كل مغامرة تترك أثرًا جميلًا.','With Rayyan and Noor, every adventure makes a difference.'],
 world:['مغامرة الإعمار','Restoration adventure'],worldDesc:['اعثر على المفتاح، ابنِ الجسر، وأعد الماء.','Find the key, build the bridge, and restore the water.'],
 worldStart:['ابدأ المغامرة','Start exploring'],worldResume:['تابع مغامرتك','Continue your adventure'],
 race:['سباق المركبات','Hovercraft racing'],raceDesc:['قد مركبتك، تجاوز العوائق، وحسّن محاولتك.','Steer, hop over obstacles, and beat your own best.'],
 raceStart:['ابدأ السباق','Start racing'],run:['تحدّي الركض','Sky sprint'],runDesc:['اركض واقفز وانزلق وحلّ بوابات التفكير.','Run, jump, slide, and solve the thinking gates.'],runStart:['اختر فصل الركض','Choose a chapter'],
 training:['تعلّم التحكم — اختياري','Learn the controls — optional'],trainAgain:['أعد التدريب','Replay the tutorial'],
 unlocked:['اختر بحرية · التدريب ليس شرطًا','Choose freely · no tutorial required'],back:['اختر نشاطًا','Choose an activity'],
 resume:['تابع النشاط الحالي','Resume current activity'],pauseNote:['نشاطك متوقف هنا. يمكنك متابعته دون إعادة البداية.','Your activity is paused here. Resume without restarting.'],
 settings:['الإعدادات والصوت','Settings & audio'],looks:['شخصيتي','My character'],words:['كلمات ريان','Rayyan’s kind words'],family:['للأسرة','For families'],
 realShot:['لقطة من اللعب الفعلي','ACTUAL GAMEPLAY'],footer:['معاينة للمراجعة 3.0.1 · ليست منشورة بعد','REVIEW PREVIEW 3.0.1 · NOT YET PUBLISHED'],
 firstGoal:['مهمتك الآن','YOUR NEXT STEP'],moveGoal:['تحرّك إلى الدائرة المضيئة.','Move to the glowing circle.'],
 moveHelp:['الأسهم أو WASD للحركة.','Move with the arrow keys or WASD.'],touchMove:['حرّك العصا اليسرى نحو الدائرة.','Move the left stick toward the circle.'],
 jumpGoal:['اقفز فوق الحاجز إلى الدائرة التالية.','Jump over the low hurdle to the next circle.'],
 jumpHelp:['تقدّم واضغط Space عند الحاجز.','Move forward and press Space at the hurdle.'],touchJump:['تقدّم بالعصا، واضغط زر ↑ عند الحاجز.','Move with the stick and tap ↑ at the hurdle.'],
 ready:['أحسنت! أنت مستعد للمغامرة.','Great work! You are ready to explore.'],readyHelp:['اختر المغامرة أو السباق. التدريب لا يفتح أو يغلق الأنشطة.','Choose an adventure or a race. Training never locks activities.'],
 skip:['تخطَّ التدريب','Skip tutorial'],step:['خطوة','Step'],circle:['الدائرة المضيئة','Glowing circle'],landing:['اهبط هنا بعد القفز','Land here after jumping'],
 retry:['لا بأس. اقترب واقفز عند الحاجز.','No problem. Approach and jump at the hurdle.'],
 finishedTraining:['أتقنت الحركة والقفز','MOVEMENT & JUMP PRACTISED'],options:['خيارات السباق','Race options'],
 countdown:['عدّ تنازلي قبل الانطلاق','Countdown before starting'],timed:['تحدّي وقتك الشخصي','Personal time trial'],untimed:['استكشاف دون توقيت','Untimed exploration'],
 assist:['مساعدة القيادة','Steering assist'],on:['مفعّلة','On'],off:['متوقفة','Off'],go:['انطلق!','GO!'],
 raceHint:['المركبة تتقدم تلقائيًا. وجّه يمينًا ويسارًا، واقفز فوق الحواجز.','Forward movement is automatic. Steer left and right; hop over barriers.'],
 chapters:['اختر فصل الركض','Choose your sprint chapter'],chapterHint:['ثلاث بوابات تفكير. يتوقف الركض عند السؤال لتأخذ وقتك.','Three thinking gates. The run pauses at each question so you can take your time.'],
 lock:['أكمل الفصل السابق','Finish the previous chapter'],chapterGo:['ابدأ هذا الفصل','Start this chapter'],
 switchWarning:['تغيير النشاط ينهي الجولة الحالية فقط. إنجازاتك المحفوظة تبقى.','Switching ends only the current run. Saved achievements remain.'],
 developer:['أدوات المطوّر','Developer tools'],lab:['مختبر المرفقات المحلي','Local asset lab'],choose:['اختيار','Choose'],
 savedQuest:['ابدأ من آخر مهمة محفوظة','Continue from your saved quest'],previewOnly:['واجهة جديدة. الشخصية والعالم كما تعرفهما.','A clearer start. The same character and worlds.']
};
const CS_THUMBS=/*CS_THUMBNAILS*/;
function csText(k){const a=CS_COPY[k];return a?a[settings.lang==='ar'?0:1]:k;}
function csTag(k,tag='span'){return `<${tag} data-cs-text="${k}">${csText(k)}</${tag}>`;}
function csButton(k,a,cls=''){return `<button type="button" data-cs="${a}" class="${cls}">${csText(k)}</button>`;}
function csCurrent(){return mode==='expedition'?(globalExpedition?.type==='race'?'race':'world'):mode==='run'?'run':mode==='hub'?'training':null;}
function csPlayable(){return mode!=='home'&&!failed;}
function csHide(){clearStart.open=false;$('csPicker').hidden=true;document.body.classList.remove('cs-open');clearStart.page='choose';}
function csOpen(page='choose'){
 clearStart.open=true;clearStart.page=page;clearStart.focus=document.activeElement;document.body.classList.add('cs-open');
 clearInput();globalExpedition?.clearInput();cancelDialogue('activity-picker');audio.stop();$('csPicker').hidden=false;csDraw();
 $('csTitle').focus();
}
function csResume(){
 if(!csPlayable())return;csHide();if(!modalKind&&!globalExpedition?.panel){audio.unlock().then(ok=>{if(ok&&!clearStart.open&&!modalKind)audio.start();});}
 if(modalKind)$('modal').focus();else if(globalExpedition?.panel)globalExpedition.box.focus();else $('world').focus();
}
function csDraw(){
 const root=$('csPicker');if(!root)return;const pg=clearStart.page,active=csCurrent(),worldState=globalExpedition.state;
 const head=`<header class="cs-top"><div class="cs-brand"><span>ϟ</span><b>${T('brand')}</b><small>ISLANDS OF LIGHT</small></div><nav>${csButton(settings.lang==='ar'?'English':'العربية','language','cs-lang')}${csButton('settings','settings','cs-tool')}</nav></header>`;
 let title=pg==='choose'?'title':pg==='race'?'race':pg==='runner'?'chapters':pg==='looks'?'looks':'developer';
 let html=head+`<main class="cs-main"><div class="cs-heading">${csTag('eyebrow','small')}<h1 id="csTitle" tabindex="-1">${csText(title)}</h1><p>${csText(pg==='choose'?'welcome':pg==='race'?'raceHint':pg==='runner'?'chapterHint':'previewOnly')}</p></div>`;
 if(pg==='choose'){
  html+=`<div class="cs-cards">${['world','race','run'].map((id,i)=>`<button type="button" id="${['globalLaunch','globalRace','csRun'][i]}" data-cs="${id}" class="cs-card cs-${id}"><span class="cs-photo"><img src="${CS_THUMBS[id]}" alt="${csText(id)}" draggable="false"><span class="cs-number">0${i+1}</span><span class="cs-photo-label">${csText('realShot')}</span></span><span class="cs-card-copy"><strong>${csText(id)}</strong><span>${csText(id+'Desc')}</span><b>${csText(id==='world'&&(worldState.stage>0||worldState.discoveries.length)?'worldResume':id+'Start')} <i aria-hidden="true">←</i></b></span></button>`).join('')}</div>`;
  html+=`<div class="cs-secondary-row">${csButton('training','training','cs-training')}<span>${csText('unlocked')}</span></div>`;
  html+=`<div class="cs-tools">${['looks','words','family'].map(k=>csButton(k,k)).join('')}</div>`;
 }else if(pg==='race'){
  html+=`<div class="cs-detail"><img class="cs-large-shot" src="${CS_THUMBS.race}" alt="${csText('race')}"><div class="cs-detail-body"><strong>${globalExpedition.t(['beach','moon','sea'][worldState.biome])}</strong><p>${csText(clearStart.timed?'timed':'untimed')}</p>${csButton('raceStart','race-start','cs-primary')}<details><summary>${csText('options')}</summary><div class="cs-environments">${[0,1,2].map(i=>`<button type="button" data-cs="biome-${i}" aria-pressed="${worldState.biome===i}">${globalExpedition.t(['beach','moon','sea'][i])}</button>`).join('')}</div><label><input type="checkbox" id="csAssist" ${worldState.assist?'checked':''}> ${csText('assist')}</label><label><input type="checkbox" id="csTimed" ${clearStart.timed?'checked':''}> ${csText('timed')}</label><label><input type="checkbox" id="csCountdown" ${clearStart.useCountdown?'checked':''}> ${csText('countdown')}</label></details></div></div>`;
 }else if(pg==='runner'){
  html+=`<div class="cs-chapter-list">${[0,1,2].map(i=>{const unlocked=i===0||settings.completed[i-1];return `<button type="button" data-cs="chapter-${i}" ${unlocked?'':'disabled'}><span class="cs-chapter-number">0${i+1}</span><span><strong>${T(chapterKeys[i])}</strong><small>${T(chapterKeys[i]+'D')}</small></span><b>${unlocked?csText('chapterGo'):csText('lock')}</b></button>`;}).join('')}</div><div class="cs-pace">${T('difficulty')} ${[0,1,2].map(i=>`<button data-cs="pace-${i}" aria-pressed="${settings.pace===i}">${T(['easy','normal','hard'][i])}</button>`).join('')}</div>`;
 }else if(pg==='looks'){
  html+=`<div class="cs-looks"><img src="${document.querySelector("#heroArt .approved-boy").src}" alt="${T('heroName')}"><div><h2>${T('heroName')}</h2><p>${T('outfit')}</p>${[0,1,2].map(i=>`<button data-cs="outfit-${i}" aria-pressed="${settings.outfit===i}">${T(['mint','orange','purple'][i])}</button>`).join('')}<p>${T('heroRole')}</p></div></div>`;
 }else html+=`<p>${globalExpedition.t('labPolicy')}</p>${csButton('lab','lab','cs-primary')}`;
 html+=`<div class="cs-return">${pg!=='choose'?csButton('back','choose','cs-back'):''}${csPlayable()?csButton('resume','resume','cs-primary'):''}</div>`;
 if(csPlayable())html+=`<p class="cs-session-note">${csText(active==='run'||active==='race'?'switchWarning':'pauseNote')}</p>`;
 html+=`</main><footer class="cs-footer"><span>${csText('footer')}</span><span>AR / EN · IBM PLEX</span></footer>`;
 root.innerHTML=html;root.dir=settings.lang==='ar'?'rtl':'ltr';root.setAttribute('aria-label',csText('eyebrow'));
 root.querySelector('[data-cs=language]').textContent=settings.lang==='ar'?'English':'العربية';
}
function csResetTraining(){clearStart.training.active=false;document.body.classList.remove('cs-training-active');$('csTraining').hidden=true;$('csTarget').hidden=true;}
function csStorePrefs(){try{localStorage.setItem('nabigha.clear-start.v1',JSON.stringify({version:1,countdown:clearStart.useCountdown,timed:clearStart.timed,trained:clearStart.trained}));}catch(e){/* Optional preferences never prevent play. */}}
async function csStartTraining(){
 csHide();if(globalExpedition.active){globalExpedition.save();globalExpedition.active=false;globalExpedition.ui.hidden=true;globalExpedition.overlay.hidden=true;globalExpedition.panel='';globalExpedition.clearInput();}
 delete document.body.dataset.globalMode;clearStart.countdown=0;await launchHubBase();cancelDialogue('guided-training');coachUntil=0;$('coach').hidden=true;
 clearStart.training={active:true,step:0,crossed:false,retryUntil:0};document.body.classList.add('cs-training-active');camYaw=0;camPitch=.38;
 clearInput();csSync();$('world').focus();
}
async function launchHub(){return csStartTraining();}
async function launchRun(c=selected,intro=true){
 csHide();csResetTraining();clearStart.countdown=0;globalExpedition.active=false;globalExpedition.panel='';globalExpedition.ui.hidden=true;globalExpedition.overlay.hidden=true;delete document.body.dataset.globalMode;
 return launchRunBase(c,intro);
}
async function startGlobal(type='world',opts={}){
 csHide();csResetTraining();clearStart.countdown=0;await startGlobalBase(type,opts);
 if(type==='race')clearStart.countdown=clearStart.useCountdown?3:0;
 csSync();
}
function goHome(){csResetTraining();clearStart.countdown=0;goHomeBase();csOpen();}
function simulate(dt){
 if(clearStart.open)return;
 if(clearStart.countdown>0&&mode==='expedition'&&globalExpedition?.type==='race'){
  if(!modalKind&&!globalExpedition.panel)clearStart.countdown=Math.max(0,clearStart.countdown-dt);
  return;
 }
 const t=clearStart.training,old={x:player.x,z:player.z,y:player.y};simulateBase(dt);
 if(!t.active||mode!=='hub'||modalKind)return;
 activePortal=-1;
 if(t.step===0&&Math.hypot(player.x,player.z-1)<1.25&&player.ground){t.step=1;clearInput();audio.fx('good');}
 else if(t.step===1){
  const across=old.z>-2&&player.z<=-2&&Math.abs(player.x)<1.2&&player.y>.62;
  if(across)t.crossed=true;
  if(Math.abs(player.x)<1.3&&player.z>-2.65&&player.z<-1.35&&player.y<.61){player.z=old.z;player.x=old.x;t.retryUntil=time+2.5;}
  if(t.crossed&&Math.hypot(player.x,player.z+4)<1.4&&player.ground){t.step=2;clearInput();clearStart.trained=true;csStorePrefs();audio.fx('good');}
 }
}
function scene(){
 const list=sceneBase();if(clearStart.training.active&&mode==='hub'){
  const t=clearStart.training,z=t.step===0?1:-4;
  if(t.step<2)list.push(it(meshes.help,[0,.025,z],[1.5,.04,1.5],[0,0,0],{cast:false}));
  if(t.step===1)list.push(it(meshes.hurdle,[0,0,-2],[1,.55,.7]));
 }
 return list;
}
function updateHud(){updateHudBase();if(clearStart.ready)csSync();}
function csSync(){
 const t=clearStart.training,active=t.active&&mode==='hub',show=!clearStart.open&&!modalKind;
 $('csTraining').hidden=!(active&&show);$('csCountdownOverlay').hidden=!(clearStart.countdown>0&&show&&!globalExpedition?.panel);
 $('csCountdownValue').textContent=String(Math.ceil(clearStart.countdown));
 document.querySelectorAll('[data-cs=choose]').forEach(b=>{if(!b.closest('#csPicker')){b.title=csText('back');b.setAttribute('aria-label',csText('back'));const s=b.querySelector('span');if(s)s.textContent=csText('back');}});
 if(active){
  $('csTrainStep').textContent=t.step<2?`${csText('step')} ${t.step+1} / 2`:csText('finishedTraining');
  $('csTrainGoal').textContent=csText(['moveGoal','jumpGoal','ready'][t.step]);
  $('csTrainHelp').textContent=csText(t.retryUntil>time?'retry':t.step===2?'readyHelp':t.step===0?(mobileUI?'touchMove':'moveHelp'):(mobileUI?'touchJump':'jumpHelp'));
  $('csTrainChoose').textContent=csText(t.step===2?'back':'skip');
  const z=t.step===0?1:-4,r=renderer.project([0,.25,z]),el=$('csTarget');el.hidden=!(show&&t.step<2&&r?.visible);
  if(!el.hidden){el.textContent=csText(t.step===0?'circle':'landing');el.style.left=clamp(r.x,75,innerWidth-75)+'px';el.style.top=clamp(r.y,160,innerHeight-130)+'px';}
 }else $('csTarget').hidden=true;
 if(clearStart.open&&clearStart.lang!==settings.lang){clearStart.lang=settings.lang;csDraw();}
}
function csDetachOld(){
 // Keep inherited nodes and handlers for export/backwards compatibility, but only one visible menu.
 for(const id of ['globalLaunch','globalRace']){const el=$(id);if(el)el.id='legacy-'+id;}
 document.body.classList.add('cs-ready');
}
async function csSelect(action){
 if(clearStart.busy)return;
 if(action==='choose'){csOpen();return;}if(action==='resume'){csResume();return;}
 if(action==='language'){changeLanguage();csDraw();return;}
 if(['settings','words','family'].includes(action)){showNamedModal({settings:'settings',words:'words',family:'parent'}[action]);return;}
 if(['looks','developer'].includes(action)){csOpen(action);return;}
 if(action==='lab'){csHide();globalExpedition.show('lab');return;}
 if(action==='race'){if(csCurrent()==='race'&&!globalExpedition.race?.finished){csResume();return;}csOpen('race');return;}
 if(action==='run'){if(mode==='run'&&run&&!run.finished){csResume();return;}csOpen('runner');return;}
 if(action.startsWith('biome-')){globalExpedition.state.biome=Number(action.slice(-1));globalExpedition.save();csDraw();$('csPicker details').open=true;return;}
 if(action.startsWith('outfit-')){settings.outfit=Number(action.slice(-1));buildAvatar();save();refreshHome();csDraw();return;}
 if(action.startsWith('pace-')){settings.pace=Number(action.slice(-1));save();csDraw();return;}
 clearStart.busy=true;
 try{
  if(action==='world'){if(csCurrent()==='world'){csResume();return;}await startGlobal('world');if(globalExpedition.panel==='intro')globalExpedition.resume();}
  else if(action==='training')await csStartTraining();
  else if(action==='race-start'){csStorePrefs();await startGlobal('race',{timed:clearStart.timed});}
  else if(action.startsWith('chapter-'))await launchRun(Number(action.slice(-1)),true);
 }finally{clearStart.busy=false;}
}
function csInit(){
 csDetachOld();
 try{const s=JSON.parse(localStorage.getItem('nabigha.clear-start.v1')||'null');if(s?.version===1){if(typeof s.countdown==='boolean')clearStart.useCountdown=s.countdown;if(typeof s.timed==='boolean')clearStart.timed=s.timed;clearStart.trained=s.trained===true;}}catch(e){}
 const picker=document.createElement('section');picker.id='csPicker';picker.className='cs-picker';picker.hidden=true;document.body.appendChild(picker);
 const coach=document.createElement('section');coach.id='csTraining';coach.className='cs-training-hud';coach.hidden=true;coach.innerHTML='<span id="csTrainStep"></span><strong id="csTrainGoal" role="status" aria-live="polite"></strong><small id="csTrainHelp"></small><button type="button" id="csTrainChoose" data-cs="choose"></button>';document.body.appendChild(coach);
 const marker=document.createElement('div');marker.id='csTarget';marker.className='cs-target';marker.hidden=true;document.body.appendChild(marker);
 const count=document.createElement('div');count.id='csCountdownOverlay';count.className='cs-countdown';count.hidden=true;count.innerHTML='<b id="csCountdownValue" role="status" aria-live="polite"></b>';document.body.appendChild(count);
 for(const host of [document.querySelector('.hud-right'),document.querySelector('.gx-nav')]){const b=document.createElement('button');b.type='button';b.dataset.cs='choose';b.className='cs-activity-switch';b.innerHTML='▦<span></span>';host.appendChild(b);}
 const parentButton=$('parentHome');if(parentButton)parentButton.dataset.cs='family';
 document.addEventListener('click',e=>{const b=e.target.closest('[data-cs]');if(b){e.preventDefault();csSelect(b.dataset.cs).catch(err=>{console.error(err);csOpen();});}});
 picker.addEventListener('change',e=>{if(e.target.id==='csAssist'){globalExpedition.state.assist=e.target.checked;globalExpedition.save();}if(e.target.id==='csTimed')clearStart.timed=e.target.checked;if(e.target.id==='csCountdown')clearStart.useCountdown=e.target.checked;csStorePrefs();});
 addEventListener('keydown',e=>{if(!clearStart.open||modalKind||globalExpedition?.panel)return;
  if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(csPlayable())csResume();else if(clearStart.page!=='choose')csOpen();return;}
  if(e.code==='Tab'){const f=[...picker.querySelectorAll('button:not([disabled]),input,summary')].filter(x=>x.offsetParent!==null);const first=f[0],last=f.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('csTitle'))){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
  // Block game hotkeys, but retain native Enter/Space activation on buttons.
  e.stopImmediatePropagation();if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&!e.target.closest('input'))e.preventDefault();
 },true);
 // Settings retains the local asset lab, but it is no longer a child-facing launch button.
 new MutationObserver(()=>{if(modalKind==='settings'&&!$('csDeveloper')){const b=document.createElement('button');b.id='csDeveloper';b.className='text-btn';b.textContent=csText('developer');b.onclick=()=>{closeModal(false);csOpen('developer');};$('modalContent').appendChild(b);}}).observe($('modalContent'),{childList:true});
 COPY.practice=CS_COPY.training;COPY.backPlaza=CS_COPY.training;COPY.hubTitle=['تعلّم التحكم','LEARN THE CONTROLS'];clearStart.ready=true;clearStart.lang=settings.lang;csOpen();csSync();
 window.NABIGHA_START=Object.freeze({version:'3.0.1-review.1',snapshot:()=>({open:clearStart.open,page:clearStart.page,current:csCurrent(),training:{...clearStart.training},countdown:clearStart.countdown,trained:clearStart.trained})});
 if(new URLSearchParams(location.search).has('test'))window.NABIGHA_START_TEST={select:csSelect,open:csOpen,resume:csResume,sync:csSync};
}
csInit();
