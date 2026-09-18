/* Original four-wheel electric coupe, built from authored geometry, not a photo. */
class CityCarArt {
 constructor(r){this.r=r;this.colours=['#17aeb6','#e97748','#dcc068'];this.bodies=this.colours.map(c=>this.body(c));this.wheel=this.makeWheel();}
 mesh(b){return b.mesh(this.r);}
 body(paint){const b=new N3.Builder(),dark='#15324b',glass='#22495e',silver='#d7e9ea';
  const sections=[[-2.28,.72,.43,.65],[-2.06,1.00,.39,.87],[-1.46,1.08,.40,.98],[-.48,1.07,.40,1.02],[.72,1.06,.40,1.04],[1.66,1.04,.41,.99],[2.15,.95,.43,.89],[2.27,.78,.49,.77]];
  const ring=q=>{let[z,w,lo,hi]=q;return[[-w*.78,lo,z],[w*.78,lo,z],[w,lo+.11,z],[w,hi-.11,z],[w*.8,hi,z],[-w*.8,hi,z],[-w,hi-.11,z],[-w,lo+.11,z]];};
  for(let i=0;i<sections.length-1;i++){const a=ring(sections[i]),d=ring(sections[i+1]);for(let j=0;j<8;j++)b.quad(a[j],d[j],d[(j+1)%8],a[(j+1)%8],j===0?dark:j===4?N3.shade(paint,1.12):j===2||j===6?paint:N3.shade(paint,.86));}
  for(const i of[0,sections.length-1]){const a=ring(sections[i]);for(let j=1;j<7;j++)b.tri(a[0],a[j],a[j+1],paint);}
  // Glasshouse: sloped front/rear screens, side windows, and an arched painted roof.
  const fl=[-.82,1.015,-1.05],fr=[.82,1.015,-1.05],tl=[-.66,1.66,-.42],tr=[.66,1.66,-.42],rl=[-.64,1.62,.71],rr=[.64,1.62,.71],bl=[-.83,1.035,1.43],br=[.83,1.035,1.43];
  b.quad(fl,fr,tr,tl,glass);b.quad(bl,rl,rr,br,glass);b.quad(fl,tl,rl,bl,glass);b.quad(fr,br,rr,tr,glass);b.quad(tl,tr,rr,rl,paint);
  b.quad([-.57,1.668,-.3],[.57,1.668,-.3],[.56,1.637,.54],[-.56,1.637,.54],dark);
  b.quad([-.73,1.13,-.925],[.68,1.13,-.925],[.54,1.27,-.79],[-.68,1.27,-.79],'#72bdc6');
  b.quad([-.72,1.07,1.40],[.72,1.07,1.40],[.61,1.2,1.22],[-.61,1.2,1.22],'#548592');
  for(let s of[-1,1]){
   b.line([s*.82,1.01,-1.04],[s*.66,1.67,-.42],.04,silver);b.line([s*.66,1.67,-.42],[s*.64,1.63,.71],.044,paint);b.line([s*.64,1.63,.71],[s*.84,1.03,1.43],.04,paint);
   b.line([s*.9,1.045,.20],[s*.656,1.64,.20],.048,dark);b.line([s*.99,.92,-.54],[s*1.01,.51,-.54],.014,dark);b.line([s*1.01,.52,-.54],[s*1.01,.52,1.04],.013,dark);
   b.add('box',[s*1.057,.85,.45],[.035,.07,.22],silver);b.add('box',[s*1.20,1.08,-.66],[.28,.13,.24],paint,[0,.1*s,0]);b.add('box',[s*1.203,1.095,-.532],[.22,.075,.025],silver);
   b.add('box',[s*.56,.715,-2.22],[.48,.105,.03],'#eaffeb',[0,0,-.10*s],.8);b.add('box',[s*.66,.7,2.205],[.42,.085,.035],'#ff4d59',[0,0,.1*s],.8);
   b.add('box',[s*1.06,.405,.07],[.085,.15,2.55],dark);b.add('box',[s*.72,1.05,1.96],[.085,.32,.10],dark);
   // Thin arch rims reinforce the recognisable wheel silhouette.
   for(let z of[-1.41,1.41])for(let j=0;j<10;j++){let a=j*Math.PI/10,u=(j+1)*Math.PI/10;b.line([s*1.09,.43+Math.sin(a)*.54,z+Math.cos(a)*.54],[s*1.09,.43+Math.sin(u)*.54,z+Math.cos(u)*.54],.035,dark);}
  }
  b.add('box',[0,.53,-2.235],[1.10,.20,.08],dark);for(let x=-.42;x<=.42;x+=.14)b.add('box',[x,.53,-2.282],[.034,.14,.013],'#6a8791');b.add('box',[0,.365,-1.89],[1.92,.085,.44],dark);
  b.add('box',[0,.62,2.264],[.46,.16,.025],'#dceae7');b.add('box',[0,1.19,1.99],[1.99,.09,.32],dark,[.03,0,0]);b.add('box',[0,1.241,1.99],[1.94,.026,.30],paint);
  // No manufacturer badge; small original double-chevron hood emblem.
  b.line([-.12,.919,-1.70],[0,.923,-1.84],.022,'#ffd869',.15);b.line([0,.923,-1.84],[.12,.919,-1.70],.022,'#ffd869',.15);
  return this.mesh(b);
 }
 makeWheel(){const b=new N3.Builder();const rings=[[-.17,.35],[-.125,.43],[.125,.43],[.17,.35]];for(let j=0;j<32;j++){const a=j*Math.PI/16,u=(j+1)*Math.PI/16;for(let k=0;k<3;k++){const[x,r]=rings[k],[xx,rr]=rings[k+1];b.quad([x,Math.sin(a)*r,Math.cos(a)*r],[xx,Math.sin(a)*rr,Math.cos(a)*rr],[xx,Math.sin(u)*rr,Math.cos(u)*rr],[x,Math.sin(u)*r,Math.cos(u)*r],'#182833');}}
  for(let side of[-1,1]){b.add('cylinder',[side*.163,0,0],[.32,.016,.32],'#90a5ad',[0,0,Math.PI/2]);b.add('cylinder',[side*.175,0,0],[.25,.018,.25],'#1d394a',[0,0,Math.PI/2]);for(let k=0;k<5;k++){let a=k*Math.PI*2/5;b.line([side*.191,Math.sin(a)*.06,Math.cos(a)*.06],[side*.191,Math.sin(a+.22)*.29,Math.cos(a+.22)*.29],.035,'#e1eeee');}b.add('cylinder',[side*.205,0,0],[.073,.02,.073],'#52cfd5',[0,0,Math.PI/2]);}
  return this.mesh(b);
 }
 items(s,colour=0,scale=1,alpha=1){const {M}=N3;const root=M.compose([s.x,s.y,s.z],[scale,scale,scale],[s.pitch||0,-s.yaw,s.roll||0]);const out=[{mesh:this.bodies[colour%3],matrix:root,alpha}];
  for(let side of[-1,1])for(let z of[-1.41,1.41]){const steering=z<0?-(s.steer||0)*.48:0;const centre=M.mul(root,M.compose([side*1.07,.44,z],[1,1,1],[0,steering,0]));out.push({mesh:this.wheel,matrix:M.mul(centre,M.compose([0,0,0],[1,1,1],[-(s.wheel||0),0,0])),alpha});}
  return out;
 }
}
