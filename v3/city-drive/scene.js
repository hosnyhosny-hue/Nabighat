/* Original city blocks: a navigable street grid, not a circular track decoration. */
class CityWorldArt {
 constructor(r){this.r=r;this.chunks=[];this.boxes=[];this.buildings=0;this.car=new CityCarArt(r);this.make();}
 add(b,x=0,z=0,radius=70){this.chunks.push({mesh:b.mesh(this.r),x,z,radius});}
 quadGround(b,x0,z0,x1,z1,offset,col){const h=(x,z)=>CityCore.baseHeight(x,z)+offset;b.quad([x0,h(x0,z0),z0],[x0,h(x0,z1),z1],[x1,h(x1,z1),z1],[x1,h(x1,z0),z0],col);}
 make(){const B=N3.Builder,C=CityCore;let b=new B();b.add('box',[0,-5,0],[900,3,900],'#448eaa');this.add(b,0,0,800);
  for(let i=0;i<10;i++)for(let j=0;j<10;j++){let x=-200+i*40,z=-200+j*40,b=new B();this.quadGround(b,x,z,x+40,z+40,-.13,'#c8ccb3');this.add(b,x+20,z+20,30);}
  for(const axis of C.axes){for(const vertical of[false,true]){let b=new B();for(let q=-190;q<190;q+=4){const point=(u,l,h=0)=>vertical?[axis+l,C.baseHeight(axis+l,u)+.035+h,u]:[u,C.baseHeight(u,axis+l)+.035+h,axis+l];
    b.quad(point(q,-8.5),point(q+4,-8.5),point(q+4,8.5),point(q,8.5),'#34485b');
    const crossing=C.axes.some(v=>Math.abs(v-q)<10);if(!crossing&&q%12===-2||!crossing&&q%12===2){b.quad(point(q,-.08,.012),point(q+3,-.08,.012),point(q+3,.08,.012),point(q,.08,.012),'#f4d276');}
    if(!crossing)for(const side of[-1,1]){b.quad(point(q,side*8,.013),point(q+4,side*8,.013),point(q+4,side*8.14,.013),point(q,side*8.14,.013),'#e6ece6');}
   }this.add(b,vertical?axis:0,vertical?0:axis,230);}}
  // Raised viaduct: real ramp geometry and separately driveable underpasses.
  b=new B();for(let x=-176;x<176;x+=4){let a=C.bridgeHeight(x),d=C.bridgeHeight(x+4);if(a+d<.01)continue;
   b.quad([x,a+.035,-8.5],[x+4,d+.035,-8.5],[x+4,d+.035,8.5],[x,a+.035,8.5],'#455669');
   for(let s of[-1,1]){b.quad([x,a-.65,s*8.5],[x+4,d-.65,s*8.5],[x+4,d+.10,s*8.5],[x,a+.10,s*8.5],'#e3d9bd');b.line([x,a+.85,s*8.25],[x+4,d+.85,s*8.25],.085,'#80dace');b.add('cylinder',[x,a+.47,s*8.25],[.07,1,.07],'#dedfce');}
   if(x%12===0)b.quad([x,a+.05,-.09],[x+3,C.bridgeHeight(x+3)+.05,-.09],[x+3,C.bridgeHeight(x+3)+.05,.09],[x,a+.05,.09],'#ffdfa1');
   if(x%32===0&&a>8)for(let z of[-6.2,6.2])b.add('box',[x,a/2-.6,z],[1.1,a-.2,1.1],'#c7c8b7');
  }this.add(b,0,0,190);
  // Optional low launch ramp along the waterfront; the jump follows suspension physics.
  b=new B();for(let x=92;x<113;x++){let y=C.rampHeight(x,160),n=C.rampHeight(x+1,160);b.quad([x,y+.055,154.5],[x+1,n+.055,154.5],[x+1,n+.055,165.5],[x,y+.055,165.5],'#e4b74e');for(let s of[-1,1])b.quad([x,0,160+s*5.5],[x+1,0,160+s*5.5],[x+1,n,160+s*5.5],[x,y,160+s*5.5],'#a3a89e');if(x%4===0)b.quad([x,y+.07,156],[x+.5,y+.15,156],[x+.5,y+.15,164],[x,y+.07,164],'#fff3d1');}this.add(b,103,160,20);
  // Sixteen blocks, with parks, an arcade library and varied high/low-rise buildings.
  for(let ix=0;ix<4;ix++)for(let iz=0;iz<4;iz++){const cx=-120+ix*80,cz=-120+iz*80,b=new B(),park=(ix===1&&iz===0)||(ix===2&&iz===2);this.quadGround(b,cx-30,cz-30,cx+30,cz+30,.055,park?'#71b89e':'#e8dec6');
   for(let side of[-1,1]){b.add('box',[cx+side*32,C.baseHeight(cx+side*32,cz)+.12,cz],[3,.22,66],'#ebebd7');b.add('box',[cx,C.baseHeight(cx,cz+side*32)+.12,cz+side*32],[63,.22,3],'#ebebd7');}
   if(park){for(let j=0;j<8;j++){let a=j*Math.PI/4;this.palm(b,cx+Math.cos(a)*22,cz+Math.sin(a)*22);}const y=C.baseHeight(cx,cz);b.add('cylinder',[cx,y+.3,cz],[8,.6,8],'#eee3c0');b.add('cylinder',[cx,y+.68,cz],[7.4,.09,7.4],'#48b8ba');b.add('cylinder',[cx,y+1.6,cz],[.6,2,.6],'#d9e5cd');b.add('sphere',[cx,y+3,cz],[1.2,1.2,1.2],'#80d8ce');}
   else if(ix===3&&iz===1){this.library(b,cx,cz);}
   else{for(let a of[-1,1])for(let d of[-1,1]){let x=cx+a*16,z=cz+d*16,n=(ix*19+iz*7+(a+1)*3+d+1);this.building(b,x,z,13+n%4,11+n%5,10+(n%6)*5,n);}}
   this.add(b,cx,cz,52);
  }
  // Street furniture with no pedestrians on the roadway.
  for(const a of C.axes){let b=new B();for(let q=-180;q<=180;q+=20){if(C.axes.some(v=>Math.abs(q-v)<12))continue;for(let s of[-1,1]){this.lamp(b,a+s*11,q);if(q%40===0)this.palm(b,q,a+s*13);}}
   this.add(b,a,0,220);
  }
  b=new B();for(const z of C.axes)for(const x of C.axes){if(z===0&&Math.abs(x)<150)continue;const y=C.baseHeight(x,z);for(let j=-2;j<=2;j++)b.add('box',[x+j*1.1,y+.065,z+10],[.6,.025,2.2],'#efeee1');}this.add(b,0,0,250);
  b=new B();b.add('ring',[0,.1,0],[7.4,1.1,7.4],'#ffd974',[0,0,0],.65);this.goal=b.mesh(this.r);
  b=new B();b.add('cylinder',[0,0,0],[1.23,.015,2.3],'#081d2c');this.contactShadow=b.mesh(this.r);
  b=new B();b.add('ring',[0,0,0],[.8,1,.8],'#fbce65',[Math.PI/2,0,0],.3);this.coin=b.mesh(this.r);
 }
 lamp(b,x,z){let y=CityCore.baseHeight(x,z);b.add('cylinder',[x,y+2.6,z],[.10,5.2,.10],'#28465a');b.add('box',[x,y+5.2,z],[1.2,.20,.45],'#edf5d9');}
 palm(b,x,z){let y=CityCore.baseHeight(x,z);b.add('cylinder',[x,y+2.3,z],[.25,4.6,.25],'#b7875d');for(let j=0;j<6;j++){let a=j*Math.PI/3;b.add('sphere',[x+Math.cos(a)*1.3,y+4.8,z+Math.sin(a)*1.3],[2.0,.25,.6],j%2?'#489c83':'#5ab295',[0,-a,.08]);}}
 building(b,x,z,w,d,h,n){let y=CityCore.baseHeight(x,z),col=['#dbcab2','#477b91','#70899a','#e1d9bc','#529794','#c9af96'][n%6];this.buildings++;this.boxes.push({x,z,w:w+1,d:d+1,h:h+2,y});b.add('box',[x,y+h/2,z],[w,h,d],col);b.add('box',[x,y+.45,z],[w+1.2,.9,d+1.2],'#d4d3bd');b.add('box',[x,y+h+.15,z],[w+1,.3,d+1],'#e8e4cf');
  for(let k=0;k<2;k++){let xx=x+(k?.28:-.28)*w;b.add('box',[xx,y+h/2,z+d/2+.02],[w*.30,h*.85,.06],'#23465c');}
  for(let v=2;v<h-1;v+=2.8)for(let side of[-1,1]){b.add('box',[x,y+v,z+side*(d/2+.055)],[w*.84,.75,.055],n%2?'#8dccc7':'#b7dcd4',[0,0,0],.12);b.add('box',[x+side*(w/2+.055),y+v,z],[.055,.75,d*.82],'#7eb5b9');}
  if(n%3===0){b.add('box',[x,y+h+1.25,z],[w*.66,2,d*.66],col);b.add('box',[x,y+h+2.4,z],[w*.72,.3,d*.72],'#ecd49b');}
 }
 library(b,x,z){let y=CityCore.baseHeight(x,z);this.buildings++;this.boxes.push({x,z,w:43,d:34,h:14,y});b.add('box',[x,y+5,z],[42,10,33],'#e6d1ac');b.add('box',[x,y+10.2,z],[43,.45,34],'#275d70');b.add('sphere',[x,y+10.7,z],[8,4.2,8],'#54a6a7');
  for(let off=-16;off<=16;off+=8){b.add('box',[x+off,y+2.5,z+16.55],[4,5,.10],'#274a5b');const pts=[];for(let k=0;k<=10;k++){let a=k*Math.PI/10;pts.push([x+off+Math.cos(a)*2.3,y+4.2+Math.sin(a)*2.3,z+16.7]);}for(let k=0;k<10;k++)b.line(pts[k],pts[k+1],.17,'#f4e7c6');}
 }
 scene(state,cars,ghost,goal){const out=[],{M}=N3;for(const c of this.chunks)if(Math.hypot(c.x-state.x,c.z-state.z)<c.radius+155)out.push({mesh:c.mesh,matrix:M.id(),cast:Math.hypot(c.x-state.x,c.z-state.z)<65&&c.radius<100});
  for(const c of cars)if(Math.hypot(c.x-state.x,c.z-state.z)<120)out.push(...this.car.items(c,c.id%3,.93));out.push(...this.car.items(state,state.colour||0));
  if(ghost)out.push(...this.car.items(ghost,1,1,.23));if(goal)out.push({mesh:this.goal,matrix:M.compose([goal.x,(goal.y??CityCore.baseHeight(goal.x,goal.z))+.08,goal.z]),cast:false});const floor=CityCore.surface(state.x,state.z,state.y);out.push({mesh:this.contactShadow,matrix:M.compose([state.x,floor+.07,state.z],[1,1,1],[0,-state.yaw,0]),alpha:Math.max(.05,.22-(state.y-floor)*.045),cast:false});return out;
 }
}
