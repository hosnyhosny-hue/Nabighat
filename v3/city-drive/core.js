/* Original connected-city driving model. +steer is screen-right in forward travel.
   Simulation uses metres/seconds; DOM direction never changes steering. */
const CityCore = (() => {
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)), lerp=(a,b,t)=>a+(b-a)*t;
 const axes=[-160,-80,0,80,160], LIMIT=202, HALF=8.5;
 const forward=y=>[Math.sin(y),-Math.cos(y)], right=y=>[Math.cos(y),Math.sin(y)];
 const baseHeight=(x,z)=>clamp((-z-85)/80,0,1)*9;
 function bridgeHeight(x){const a=Math.abs(x);return a>=176?0:a<=108?13:(176-a)/68*13;}
 function rampHeight(x,z){if(Math.abs(z-160)>5.5||x<92||x>113)return 0;return (x-92)/21*3.4;}
 function roadAt(x,z){return Math.abs(x)<=190&&axes.some(a=>Math.abs(z-a)<=HALF)||Math.abs(z)<=190&&axes.some(a=>Math.abs(x-a)<=HALF);}
 function surface(x,z,prevY=0){let h=baseHeight(x,z)+rampHeight(x,z);const b=bridgeHeight(x);
  if(Math.abs(z)<HALF&&b>0&&b<=prevY+.9)h=Math.max(h,b);return h;
 }
 const goals=[{x:-160,z:80,name:['بوابة الكورنيش','PROMENADE GATE']},{x:-160,z:-80,name:['حي المعرفة','KNOWLEDGE QUARTER']},{x:0,z:-160,name:['حدائق المرتفعات','HILLSIDE GARDENS']},{x:160,z:-80,name:['ساحة المكتبة','LIBRARY SQUARE']},{x:160,z:160,name:['شارع النخيل','PALM AVENUE']},{x:0,z:160,name:['حديقة التجارب','DISCOVERY PARK']},{x:0,z:0,y:13,name:['جسر الآفاق العلوي','HORIZON OVERPASS']}];
 const deliveryStops=[{x:-80,z:80,name:['كتب المكتبة','LIBRARY BOOKS']},{x:80,z:-160,name:['أدوات الحديقة','GARDEN TOOLS']},{x:160,z:80,name:['أمانة الورشة','WORKSHOP PARCEL']}];
 const trafficLoops=[[[ -155,155],[-155,-75],[75,-75],[75,155]],[[ -75,-155],[155,-155],[155,75],[-75,75]],[[ -155,-155],[-85,-155],[-85,155],[-155,155]],[[5,155],[155,155],[155,-85],[5,-85]]];
 function makeTraffic(){return Array.from({length:10},(_,i)=>({id:i,loop:i%4,leg:i%4,u:(i%3)/3,speed:5.5+i%4,x:0,z:0,y:0,yaw:0,wheel:0,waiting:false}));}
 function trafficStep(vehicles,dt,player,time){for(const c of vehicles){let pts=trafficLoops[c.loop],a=pts[c.leg],b=pts[(c.leg+1)%4],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);c.x=lerp(a[0],b[0],c.u);c.z=lerp(a[1],b[1],c.u);c.y=baseHeight(c.x,c.z);c.yaw=Math.atan2(dx,-dz);
  const f=forward(c.yaw),toward=(player.x-c.x)*f[0]+(player.z-c.z)*f[1],side=Math.abs((player.x-c.x)*f[1]-(player.z-c.z)*f[0]);
  let wait=Math.abs(player.y-c.y)<2&&toward>0&&toward<13&&side<3;
  for(const o of vehicles)if(o!==c){const d=(o.x-c.x)*f[0]+(o.z-c.z)*f[1],l=Math.abs((o.x-c.x)*f[1]-(o.z-c.z)*f[0]);if(d>0&&d<7&&l<2)wait=true;}
  if((1-c.u)*len<12&&Math.floor(time/4)%2===c.loop%2)wait=true;
  c.waiting=wait;if(!wait){c.u+=c.speed*dt/len;c.wheel+=c.speed*dt/.43;}if(c.u>=1){c.u=0;c.leg=(c.leg+1)%4;}
 }}
 function fresh(timed=true,assist=true){return{x:-156,z:146,y:0,yaw:0,speed:0,steer:0,wheel:0,vy:0,ground:true,pitch:0,roll:0,d:0,elapsed:0,checkpoint:0,finished:false,timed,assist,frames:[],lastRecord:0,boost:0,cooldown:0,bumper:0,hits:0,collected:0,lateral:0,biome:0,local:false,delivered:[],checkpointSafe:{x:-156,z:146,y:0,yaw:0},airSeconds:0};}
 function overlaps(x,z,r,box){return x>box.x-box.w/2-r&&x<box.x+box.w/2+r&&z>box.z-box.d/2-r&&z<box.z+box.d/2+r;}
 function tick(s,input,dt,boxes=[],cars=[]){dt=clamp(dt,0,.035);if(s.finished)return [];
  const events=[],old={x:s.x,z:s.z,y:s.y};s.elapsed+=dt;s.cooldown=Math.max(0,s.cooldown-dt);s.boost=Math.max(0,s.boost-dt);s.bumper=Math.max(0,s.bumper-dt);
  const axis=clamp(input.steer||0,-1,1),gas=clamp(input.gas||0,0,1),brake=clamp(input.brake||0,0,1);s.steer=lerp(s.steer,axis,1-Math.exp(-dt*10));
  const onroad=roadAt(s.x,s.z),maxSpeed=onroad?(s.boost>0?28:21):7;
  if(gas)s.speed+=10*gas*dt;
  if(brake){if(s.speed> .8)s.speed=Math.max(0,s.speed-22*brake*dt);else s.speed=Math.max(-5,s.speed-5*brake*dt);}
  if(!gas&&!brake)s.speed*=Math.exp(-dt*.7);
  if(input.handbrake)s.speed*=Math.exp(-dt*4.5);
  s.speed=clamp(s.speed,-5,maxSpeed);if(Math.abs(s.speed)<.05)s.speed=0;
  const steerAngle=s.steer*(s.assist?.52:.65)/(1+Math.abs(s.speed)*.032);
  // A right input increases yaw; the forward direction turns toward camera-right.
  s.yaw+=s.speed/2.7*Math.tan(steerAngle)*dt;s.yaw=Math.atan2(Math.sin(s.yaw),Math.cos(s.yaw));
  const f=forward(s.yaw);s.x+=f[0]*s.speed*dt;s.z+=f[1]*s.speed*dt;
  if(old.y>4&&Math.abs(old.z)<HALF&&Math.abs(old.x)<150&&Math.abs(s.z)>7.25){s.z=clamp(s.z,-7.25,7.25);s.speed*=.92;}
  let hit=Math.abs(s.x)>LIMIT||Math.abs(s.z)>LIMIT;
  for(const q of boxes)if(s.y<q.y+q.h){for(const k of[-1.25,1.25])if(overlaps(s.x+f[0]*k,s.z+f[1]*k,1.08,q)){hit=true;break;}}
  for(const c of cars)if(Math.abs(s.y-c.y)<1.8&&Math.hypot(s.x-c.x,s.z-c.z)<3.25)hit=true;
  if(hit){s.x=old.x;s.z=old.z;if(!s.bumper){s.hits++;s.bumper=1.3;events.push('care');}s.speed=-s.speed*.08;}
  const floor=surface(s.x,s.z,old.y),delta=floor-old.y;
  if(s.ground){if(delta>=-.24){s.y=floor;s.vy=delta/Math.max(dt,.001);}else{s.ground=false;s.vy=Math.max(0,s.vy);}}
  if(!s.ground){s.vy-=22*dt;s.y+=s.vy*dt;s.airSeconds+=dt;if(s.y<=floor){s.y=floor;s.vy=0;s.ground=true;events.push('land');}}
  const front=surface(s.x+f[0]*1.35,s.z+f[1]*1.35,s.y),back=surface(s.x-f[0]*1.35,s.z-f[1]*1.35,s.y);
  s.pitch=lerp(s.pitch,Math.atan2(front-back,2.7),1-Math.exp(-dt*9));s.roll=lerp(s.roll,-s.steer*s.speed*.005,1-Math.exp(-dt*8));
  s.wheel+=s.speed*dt/.43;s.d+=Math.hypot(s.x-old.x,s.z-old.z);
  const g=goals[s.checkpoint];if(g&&Math.hypot(s.x-g.x,s.z-g.z)<11&&Math.abs(s.y-(g.y??baseHeight(g.x,g.z)))<2){s.checkpoint++;s.checkpointSafe={x:s.x,z:s.z,y:s.y,yaw:s.yaw};events.push('checkpoint');if(s.checkpoint===goals.length&&s.timed){s.finished=true;events.push('finish');}}
  if(s.elapsed-s.lastRecord>=.16&&s.frames.length<8000){s.frames.push([+s.elapsed.toFixed(3),+s.x.toFixed(3),+s.y.toFixed(3),+s.z.toFixed(3),+s.yaw.toFixed(4)]);s.lastRecord=s.elapsed;}
  return events;
 }
 function recover(s){Object.assign(s,s.checkpointSafe,{speed:0,vy:0,ground:true,steer:0,boost:0});}
 function validateSave(raw){if(!raw||raw.version!==1||typeof raw.bests!=='object'||Array.isArray(raw.bests))throw Error('INVALID_CITY_SAVE');const clean={version:1,bests:{},deliveries:[],colour:0};
  for(const [k,b]of Object.entries(raw.bests)){if(!/^noor-city-v1-[01]$/.test(k)||Object.keys(clean.bests).length>=2||!Number.isFinite(b.time)||b.time<=0||b.time>7200||!Array.isArray(b.frames)||b.frames.length>8000)throw Error('INVALID_CITY_RECORD');let last=-1;for(const f of b.frames){if(!Array.isArray(f)||f.length!==5||f.some(n=>!Number.isFinite(n))||f[0]<last||f[0]>7200||Math.abs(f[1])>210||Math.abs(f[2])>100||Math.abs(f[3])>210||Math.abs(f[4])>Math.PI+.01)throw Error('INVALID_CITY_FRAME');last=f[0];}clean.bests[k]={time:b.time,frames:b.frames.map(f=>[...f])};}
  if(!Array.isArray(raw.deliveries)||raw.deliveries.length>3||raw.deliveries.some(i=>!Number.isInteger(i)||i<0||i>2))throw Error('INVALID_DELIVERIES');clean.deliveries=[...new Set(raw.deliveries)];clean.colour=[0,1,2].includes(raw.colour)?raw.colour:0;return clean;
 }
 function shortestPath(start,target){const closest=n=>axes.reduce((a,b)=>Math.abs(b-n)<Math.abs(a-n)?b:a),sx=closest(start.x),sz=closest(start.z),tx=closest(target.x),tz=closest(target.z);let out=[[start.x,start.z],[sx,sz]],x=sx,z=sz;while(x!==tx){x+=Math.sign(tx-x)*80;out.push([x,z]);}while(z!==tz){z+=Math.sign(tz-z)*80;out.push([x,z]);}out.push([target.x,target.z]);return out;}
 return{axes,LIMIT,HALF,goals,deliveryStops,trafficLoops,forward,right,baseHeight,bridgeHeight,rampHeight,roadAt,surface,fresh,tick,makeTraffic,trafficStep,recover,validateSave,shortestPath,clamp,lerp};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=CityCore;
