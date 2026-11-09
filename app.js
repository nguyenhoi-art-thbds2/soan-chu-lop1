const $=id=>document.getElementById(id);
const PW=612,PH=792,K=2;
const GR={mau:{sy:98,x0:80,x1:574},ke:{sy:60,x0:48,x1:566},vuong:{sy:50,x0:48,x1:566},trang:{sy:50,x0:48,x1:566},anh:{sy:50,x0:48,x1:566}};
const FP={'HP001-4hang':{size:36,sp:'font'},'HP001-4hang-1oly':{size:36,sp:'font'},'HP001-4hang-2oly':{size:36,sp:'font'},'HP001-5hang':{size:36,sp:'font'},'HP001-5hang-1oly':{size:36,sp:'font'},'UTM-Avo':{size:28,sp:'ink'}};
const DEF={text:'Soạn mẫu chữ cho lớp 1 cùng thầy Hợi',font:'HP001-4hang',size:36,lh:72,dy:0,ls:0,mode:'solid',grid:'mau',sp:'font'};
let upN=0;
let S=Object.assign({},DEF,{st:[]}),O={},SEL=[],G=[],bg=null,drag=null,fsrc='cv';
const cv=$('cv'),cx=cv.getContext('2d'),mc=document.createElement('canvas').getContext('2d');
const HF=[[0,0],[.5,0],[1,0],[1,.5],[1,1],[.5,1],[0,1],[0,.5]];
const CUR=['nwse-resize','ns-resize','nesw-resize','ew-resize','nwse-resize','ns-resize','nesw-resize','ew-resize'];
const LS={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}};
const fontOf=st=>(st&2?'italic ':'')+(st&1?'700 ':'400 ')+S.size+'px "'+S.font+'", sans-serif';
const fontStr=()=>fontOf(0);
function msg(t){$('msg').textContent=t}

function layout(){
  const g=GR[S.grid];G=[];
  const t=Array.from(S.text);
  if(S.st.length!==t.length)S.st=t.map((c,i)=>S.st[i]|0);
  const ink=S.sp!=='font';
  const I=t.map((c,i)=>{
    const st=S.st[i]|0;mc.font=fontOf(st);
    if(c==='\n')return{a:0,dx:0,st};
    if(c===' ')return{a:Math.max(1,(ink?S.size*.32:mc.measureText(' ').width)+S.ls),dx:0,st};
    const m=mc.measureText(c);
    if(!ink){let w=m.width;const nx=t[i+1];
      if(nx&&nx!==' '&&nx!=='\n'&&(S.st[i+1]|0)===st)w=mc.measureText(c+nx).width-mc.measureText(nx).width;
      return{a:Math.max(1,w+S.ls),dx:0,st}}
    const l=-m.actualBoundingBoxLeft,w=Math.max(m.actualBoundingBoxRight-l,0),cell=Math.max(w,S.size*.16);
    return{a:Math.max(1,cell+S.size*.12+S.ls),dx:(cell-w)/2-l,st};
  });
  let x=g.x0,row=0,k=0;
  while(k<t.length){
    if(t[k]==='\n'){G.push({ch:'\n',nl:1,row,bx:x,st:0,dx:0,a:0});row++;x=g.x0;k++;continue}
    if(t[k]===' '){G.push(Object.assign({ch:' ',bx:x,row},I[k]));x+=I[k].a;k++;continue}
    let e=k,w=0;
    while(e<t.length&&t[e]!==' '&&t[e]!=='\n'){w+=I[e].a;e++}
    if(x+w>g.x1&&x>g.x0){row++;x=g.x0}
    for(let j=k;j<e;j++){G.push(Object.assign({ch:t[j],bx:x,row},I[j]));x+=I[j].a}
    k=e;
  }
  G.forEach(q=>{q.by=g.sy+S.lh*(q.row+1)+S.dy});
}
const ok=i=>G[i]&&!G[i].nl&&G[i].ch!==' ';
function box(i){
  const q=G[i],o=O[i]||{},sx=o.sx||1,sy=o.sy||1;mc.font=fontOf(q.st);
  const m=mc.measureText(q.ch),l=-m.actualBoundingBoxLeft,r=m.actualBoundingBoxRight,t=-m.actualBoundingBoxAscent,b=m.actualBoundingBoxDescent;
  const gx=q.bx+q.dx+(o.ox||0),gy=q.by+(o.oy||0);
  return{gx,gy,sx,sy,l,r,t,b,x1:gx+l*sx,x2:gx+r*sx,y1:gy+t*sy,y2:gy+b*sy};
}
function drawGrid(c){
  const t=S.grid;
  const ln=(x1,y1,x2,y2,w,col,dash)=>{c.beginPath();c.setLineDash(dash||[]);c.lineWidth=w;c.strokeStyle=col;c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()};
  if(t==='mau'){
    const x0=72,y0=26,cs=7.2,cols=71,rows=100,xe=x0+cols*cs,ye=y0+rows*cs;
    for(let i=0;i<=cols;i++){const x=x0+i*cs,th=i%5===0;ln(x,y0,x,ye,th?1:.4,th?'#000':'#666',th?0:[1,1.5])}
    for(let j=0;j<=rows;j++){const y=y0+j*cs,th=j%5===0;ln(x0,y,xe,y,th?1:.4,th?'#000':'#666',th?0:[1,1.5])}
    ln(xe,y0,xe,ye,1.2,'#000');ln(x0,y0+72,xe,y0+72,1.8,'#000');
  }else if(t==='ke'){
    for(let y=60;y<=756;y+=36){ln(36,y,576,y,.9,'#444');if(y<756)ln(36,y+18,576,y+18,.4,'#888',[2,2])}
  }else if(t==='vuong'){
    for(let x=36;x<=576.1;x+=7.2)ln(x,36,x,756,.4,'#777',[1,1.5]);
    for(let y=36;y<=756.1;y+=7.2)ln(36,y,576,y,.4,'#777',[1,1.5]);
  }else if(t==='anh'&&bg){c.drawImage(bg,0,0,PW,PH)}
  c.setLineDash([]);
}
function draw(c,k,ui){
  c.setTransform(k,0,0,k,0,0);c.fillStyle='#fff';c.fillRect(0,0,PW,PH);
  drawGrid(c);c.font=fontStr();c.textBaseline='alphabetic';
  G.forEach((q,i)=>{
    if(q.nl)return;const o=O[i]||{},sx=o.sx||1,sy=o.sy||1,vis=ok(i);
    if(!vis&&!(q.st&4))return;
    c.save();c.translate(q.bx+(o.ox||0),q.by+(o.oy||0));c.scale(sx,sy);
    const col=S.mode==='dim'?'#b8b8b8':S.mode==='outline'?'#777':'#111';
    if(vis){
      c.font=fontOf(q.st);c.translate(q.dx,0);
      if(S.mode==='outline'){c.strokeStyle=col;c.lineWidth=1.2/Math.max(sx,sy);c.setLineDash([3,2]);c.strokeText(q.ch,0,0)}
      else{c.fillStyle=col;c.fillText(q.ch,0,0)}
      c.translate(-q.dx,0);
    }
    if(q.st&4){const uy=Math.max(2,S.size*.09);c.beginPath();c.setLineDash([]);c.lineWidth=Math.max(1,S.size*.045);c.strokeStyle=col;c.moveTo(0,uy);c.lineTo(q.a,uy);c.stroke()}
    c.restore();
  });
  if(ui)drawSel(c);
}

function refresh(){
  layout();SEL=SEL.filter(ok);draw(cx,K,true);
  const mx=Math.max(0,...G.filter((q,i)=>ok(i)).map(q=>q.by));
  $('warn').textContent=mx>PH-24?'Nội dung vượt quá trang, hãy giảm cỡ chữ hoặc bớt chữ.':'';
  $('selinfo').textContent=SEL.length?'Đang chọn '+SEL.length+' chữ. Kéo để di chuyển, dùng 8 nút nhỏ quanh phần chọn để đổi kích thước.':'Bấm vào một chữ, hoặc kéo chuột quét qua nhiều chữ để chọn.';
  persist();
}
let pt;function persist(){clearTimeout(pt);pt=setTimeout(()=>LS.set('ctm2_cur',snap()),400)}
const snap=()=>({v:1,S:Object.assign({},S,{grid:S.grid==='anh'?'mau':S.grid}),O});

const UI=()=>PW/(cv.getBoundingClientRect().width||PW);
function gbox(pad){
  const bs=SEL.filter(ok).map(box);if(!bs.length)return null;const d=pad||0;
  return{x1:Math.min(...bs.map(b=>b.x1))-d,y1:Math.min(...bs.map(b=>b.y1))-d,x2:Math.max(...bs.map(b=>b.x2))+d,y2:Math.max(...bs.map(b=>b.y2))+d};
}
const hpts=b=>HF.map(f=>({x:b.x1+(b.x2-b.x1)*f[0],y:b.y1+(b.y2-b.y1)*f[1]}));
function drawSel(c){
  const u=UI();c.lineWidth=u;c.strokeStyle='#2b7de9';
  if(drag&&drag.t==='q'){
    const a=drag.p0,b=drag.p1,x=Math.min(a.x,b.x),y=Math.min(a.y,b.y),w=Math.abs(a.x-b.x),h=Math.abs(a.y-b.y);
    c.fillStyle='rgba(43,125,233,.12)';c.setLineDash([3*u,2*u]);c.fillRect(x,y,w,h);c.strokeRect(x,y,w,h);c.setLineDash([]);
  }
  const ids=SEL.filter(ok);if(!ids.length)return;
  if(ids.length>1){c.globalAlpha=.5;ids.forEach(i=>{const b=box(i);c.strokeRect(b.x1,b.y1,b.x2-b.x1,b.y2-b.y1)});c.globalAlpha=1}
  const g=gbox(3*u);c.setLineDash([4*u,3*u]);c.strokeRect(g.x1,g.y1,g.x2-g.x1,g.y2-g.y1);c.setLineDash([]);
  const h=2.5*u;hpts(g).forEach(p=>{c.fillStyle='#fff';c.fillRect(p.x-h,p.y-h,2*h,2*h);c.strokeRect(p.x-h,p.y-h,2*h,2*h)});
}
function pos(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*PW,y:(e.clientY-r.top)/r.height*PH,k:r.width/PW}}
function hitHandle(p){
  const g=gbox(3*UI());if(!g)return-1;const hs=hpts(g);
  for(let j=0;j<8;j++)if(Math.hypot(hs[j].x-p.x,hs[j].y-p.y)*p.k<8)return j;return-1;
}
const snapSel=()=>Object.fromEntries(SEL.map(i=>[i,Object.assign({ox:0,oy:0,sx:1,sy:1},O[i])]));
cv.addEventListener('pointerdown',e=>{
  if(panOn||spaceDown){cv.setPointerCapture(e.pointerId);drag={t:'p',x:e.clientX,y:e.clientY,l:view.scrollLeft,tp:view.scrollTop};cv.style.cursor='grabbing';return}
  const p=pos(e);cv.setPointerCapture(e.pointerId);
  const h=hitHandle(p);
  if(h>=0){
    const gb=gbox(),f=HF[h];
    drag={t:'r',h,p0:p,A:{x:gb.x1+(gb.x2-gb.x1)*(1-f[0]),y:gb.y1+(gb.y2-gb.y1)*(1-f[1])},o0:snapSel()};
  }else{
    let hit=-1;
    for(let i=G.length-1;i>=0;i--){if(!ok(i))continue;const b=box(i);
      if(p.x>=b.x1-3&&p.x<=b.x2+3&&p.y>=b.y1-3&&p.y<=b.y2+3){hit=i;break}}
    if(hit>=0){
      if(e.shiftKey)SEL=SEL.includes(hit)?SEL.filter(i=>i!==hit):[...SEL,hit];
      else if(!SEL.includes(hit))SEL=[hit];
      if(SEL.includes(hit))drag={t:'m',p0:p,o0:snapSel()};
    }else{drag={t:'q',p0:p,p1:p,base:e.shiftKey?SEL.slice():[]};if(!e.shiftKey)SEL=[]}
  }
  refresh();
});
cv.addEventListener('pointermove',e=>{
  if(drag&&drag.t==='p'){view.scrollLeft=drag.l-(e.clientX-drag.x);view.scrollTop=drag.tp-(e.clientY-drag.y);return}
  const p=pos(e);
  if(!drag){const h=hitHandle(p);cv.style.cursor=(panOn||spaceDown)?'grab':h>=0?CUR[h]:'default';return}
  if(drag.t==='m'){
    const dx=p.x-drag.p0.x,dy=p.y-drag.p0.y;
    for(const i in drag.o0){const o=drag.o0[i];O[i]=Object.assign({},o,{ox:o.ox+dx,oy:o.oy+dy})}
  }else if(drag.t==='r'){
    const f=HF[drag.h],A=drag.A,p0=drag.p0,ex=f[0]!==.5,ey=f[1]!==.5;
    let fx=Math.max(.05,Math.abs(p.x-A.x)/Math.max(.5,Math.abs(p0.x-A.x))),fy=Math.max(.05,Math.abs(p.y-A.y)/Math.max(.5,Math.abs(p0.y-A.y)));
    if(ex&&ey)fx=fy=Math.max(fx,fy);else if(!ex)fx=1;else fy=1;
    for(const i in drag.o0){
      const o=drag.o0[i],q=G[i];
      O[i]={ox:A.x+(q.bx+o.ox-A.x)*fx-q.bx,oy:A.y+(q.by+o.oy-A.y)*fy-q.by,sx:o.sx*fx,sy:o.sy*fy};
    }
  }else{
    drag.p1=p;const x1=Math.min(drag.p0.x,p.x),x2=Math.max(drag.p0.x,p.x),y1=Math.min(drag.p0.y,p.y),y2=Math.max(drag.p0.y,p.y),hit=[];
    G.forEach((q,i)=>{if(!ok(i))return;const b=box(i);if(b.x2>=x1&&b.x1<=x2&&b.y2>=y1&&b.y1<=y2)hit.push(i)});
    SEL=[...new Set([...drag.base,...hit])];
  }
  refresh();
});
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,()=>{if(SEL.length)fsrc='cv';if(drag&&drag.t==='p')cv.style.cursor=(panOn||spaceDown)?'grab':'default';drag=null;refresh()}));

function nudge(dx,dy){SEL.forEach(i=>{const o=O[i]||{};O[i]=Object.assign({},o,{ox:(o.ox||0)+dx,oy:(o.oy||0)+dy})});refresh()}
function grow(f){
  const g=gbox();if(!g)return;const cx0=(g.x1+g.x2)/2,cy0=(g.y1+g.y2)/2;
  SEL.filter(ok).forEach(i=>{
    const q=G[i],o=Object.assign({ox:0,oy:0,sx:1,sy:1},O[i]);
    O[i]={ox:cx0+(q.bx+o.ox-cx0)*f-q.bx,oy:cy0+(q.by+o.oy-cy0)*f-q.by,sx:Math.max(.05,o.sx*f),sy:Math.max(.05,o.sy*f)};
  });refresh();
}
$('bl').onclick=()=>nudge(-1,0);$('br').onclick=()=>nudge(1,0);$('bu').onclick=()=>nudge(0,-1);$('bd').onclick=()=>nudge(0,1);
$('bm').onclick=()=>grow(.95);$('bp').onclick=()=>grow(1.05);
$('b0').onclick=()=>{SEL.forEach(i=>delete O[i]);refresh()};
$('bsa').onclick=()=>{SEL=G.map((q,i)=>i).filter(ok);refresh()};
$('ball').onclick=()=>{if(confirm('Đặt lại vị trí và kích thước của tất cả các chữ?')){O={};refresh()}};
document.addEventListener('keyup',e=>{if(e.code==='Space'){spaceDown=false;cv.style.cursor=panOn?'grab':'default'}});
document.addEventListener('keydown',e=>{
  const t=e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT'||t==='BUTTON')return;
  if(e.code==='Space'){e.preventDefault();spaceDown=true;cv.style.cursor='grab';return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='a'){e.preventDefault();SEL=G.map((q,i)=>i).filter(ok);refresh();return}
  if(!SEL.length)return;
  const s=e.shiftKey?5:1,m={ArrowLeft:[-s,0],ArrowRight:[s,0],ArrowUp:[0,-s],ArrowDown:[0,s]}[e.key];
  if(m){e.preventDefault();nudge(m[0],m[1])}
  else if(e.key==='Delete'||e.key==='Backspace'){SEL.forEach(i=>delete O[i]);refresh()}
  else if(e.key==='Escape'){SEL=[];refresh()}
});

async function loadFont(){try{await Promise.all([0,1,2,3].map(s=>document.fonts.load(fontOf(s),'Aàạăâêôơư Đđỳỹ')))}catch(e){}refresh()}
function syncUI(){
  $('text').value=S.text;$('sp').value=S.sp;$('font').value=S.font;$('mode').value=S.mode;$('grid').value=S.grid;
  ['size','lh','ls','dy'].forEach(k=>{$(k).value=S[k];$('v_'+k).textContent=S[k]})
}
function editText(o,n){
  const a=Array.from(o),b=Array.from(n);let p=0;
  while(p<a.length&&p<b.length&&a[p]===b[p])p++;
  let s=0;while(s<a.length-p&&s<b.length-p&&a[a.length-1-s]===b[b.length-1-s])s++;
  const st=a.map((c,i)=>S.st[i]|0);
  S.st=[...st.slice(0,p),...new Array(b.length-p-s).fill(0),...st.slice(a.length-s)];
  const N={};for(const k in O){const i=+k;if(i<p)N[i]=O[k];else if(i>=a.length-s)N[i-a.length+b.length]=O[k]}
  O=N;
}
$('text').addEventListener('input',e=>{const nt=e.target.value.normalize('NFC');editText(S.text,nt);S.text=nt;SEL=[];refresh()});
$('sp').addEventListener('change',e=>{S.sp=e.target.value;refresh()});

const cpIdx=(str,u)=>Array.from(str.slice(0,u).normalize('NFC')).length;
['select','keyup','mouseup','touchend'].forEach(n=>$('text').addEventListener(n,()=>{const t=$('text');if(t.selectionStart!==t.selectionEnd)fsrc='ta'}));
function fmtTargets(){
  const ta=$('text');let T=[];
  if(fsrc==='ta'&&ta.selectionStart!==ta.selectionEnd){
    const a=cpIdx(ta.value,ta.selectionStart),b=cpIdx(ta.value,ta.selectionEnd);
    for(let i=a;i<b;i++)T.push(i);
  }else if(SEL.length){
    T=SEL.slice();
    G.forEach((q,i)=>{if(q.ch===' '&&T.includes(i-1)&&T.includes(i+1))T.push(i)});
  }
  return T.filter(i=>G[i]&&!G[i].nl);
}
function applyFmt(f){
  const bit={b:1,i:2,u:4}[f],T=fmtTargets();
  if(!T.length){msg('Hãy bôi đen chữ trong ô nội dung, hoặc chọn chữ trên trang, rồi bấm lại.');return}
  const on=T.every(i=>G[i].ch===' '||((S.st[i]|0)&bit));
  T.forEach(i=>{S.st[i]=on?((S.st[i]|0)&~bit):((S.st[i]|0)|bit)});
  msg('');refresh();
}
function clearFmt(){
  const T=fmtTargets();
  if(!T.length){msg('Hãy bôi đen chữ trong ô nội dung, hoặc chọn chữ trên trang, rồi bấm lại.');return}
  T.forEach(i=>{S.st[i]=0});msg('');refresh();
}
document.querySelectorAll('[data-f]').forEach(b=>{
  b.addEventListener('mousedown',e=>e.preventDefault());
  b.addEventListener('click',()=>b.dataset.f==='x'?clearFmt():applyFmt(b.dataset.f));
});
document.addEventListener('keydown',e=>{
  if(!(e.ctrlKey||e.metaKey)||e.shiftKey||e.altKey)return;
  const k=e.key.toLowerCase(),t=e.target.tagName;
  if(!'biu'.includes(k)||k.length!==1||(t!=='TEXTAREA'&&e.target!==document.body))return;
  e.preventDefault();if(t==='TEXTAREA')fsrc='ta';applyFmt(k);
});
['size','lh','ls','dy'].forEach(k=>$(k).addEventListener('input',e=>{S[k]=+e.target.value;$('v_'+k).textContent=S[k];refresh()}));
$('size').addEventListener('change',loadFont);
$('font').addEventListener('change',e=>{S.font=e.target.value;const P=FP[S.font];if(P){S.size=P.size;S.sp=P.sp;syncUI()}loadFont()});
$('mode').addEventListener('change',e=>{S.mode=e.target.value;refresh()});
$('grid').addEventListener('change',e=>{S.grid=e.target.value;refresh()});
$('fontf').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  try{const n='Phông tải lên '+(++upN),ff=new FontFace(n,await f.arrayBuffer());
    await ff.load();document.fonts.add(ff);const op=new Option(f.name,n);$('font').add(op);$('font').value=n;S.font=n;loadFont();msg('Đã nạp phông '+f.name)}
  catch(err){msg('Không đọc được file phông chữ này.')}
});
function useBg(b,t,tpl){
  bg=b;S.grid='anh';if(tpl)GR.anh=Object.assign({},GR.mau);
  $('grid').querySelector('[value=anh]').hidden=false;$('grid').value='anh';refresh();msg(t);
}
async function docxBg(file){
  const z=await JSZip.loadAsync(await file.arrayBuffer()),df=z.file('word/document.xml');if(!df)return null;
  const doc=new DOMParser().parseFromString(await df.async('string'),'application/xml');
  const N={w:'http://schemas.openxmlformats.org/wordprocessingml/2006/main',wp:'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',a:'http://schemas.openxmlformats.org/drawingml/2006/main'},E=12700;
  const kids=(n,t)=>[...n.children].filter(k=>k.localName===t);
  const tw=(el,at,d)=>{const v=el&&el.getAttributeNS(N.w,at);return v?+v/20:d};
  const pg=doc.getElementsByTagNameNS(N.w,'pgSz')[0],mg=doc.getElementsByTagNameNS(N.w,'pgMar')[0];
  const pw=tw(pg,'w',612),ph=tw(pg,'h',792),ml=tw(mg,'left',72),mt=tw(mg,'top',72);
  const items=[...doc.getElementsByTagNameNS(N.wp,'anchor'),...doc.getElementsByTagNameNS(N.wp,'inline')]
    .filter(d=>d.getElementsByTagNameNS('*','wsp').length).map(d=>{
      const ps=t=>{const p=kids(d,t)[0],o=p&&p.getElementsByTagNameNS(N.wp,'posOffset')[0];return{r:p?p.getAttribute('relativeFrom'):'paragraph',o:o?+o.textContent/E:0}};
      const ex=kids(d,'extent')[0],h=ps('positionH'),v=ps('positionV');
      return{d,h,v,hg:ex?+ex.getAttribute('cy')/E:0,x:(/page|leftMargin/.test(h.r)?0:ml)+h.o,y:(v.r==='page'?0:mt)+v.o};
    });
  let bot=-1e9;
  items.filter(i=>/paragraph|line/.test(i.v.r)).sort((a,b)=>a.v.o-b.v.o).forEach(i=>{i.y=Math.max(i.y,bot);bot=i.y+i.hg});
  const L=[];let out;
  const dashOf=ln=>{
    const cd=kids(ln,'custDash')[0],ds=cd&&kids(cd,'ds')[0];
    if(ds){const d=+ds.getAttribute('d'),g=+ds.getAttribute('sp');return g/d<.3?0:[d/100000,g/100000]}
    const pd=kids(ln,'prstDash')[0],v=pd&&pd.getAttribute('val');
    return v&&v!=='solid'?[3,3]:0;
  };
  const shape=(c,t)=>{
    const sp=kids(c,'spPr')[0];if(!sp)return;
    const xf=kids(sp,'xfrm')[0],pr=kids(sp,'prstGeom')[0],ln=kids(sp,'ln')[0];if(!xf||!pr||!ln||kids(ln,'noFill')[0])return;
    const o=kids(xf,'off')[0],e=kids(xf,'ext')[0];if(!o||!e)return;
    const x=+o.getAttribute('x'),y=+o.getAttribute('y'),w=+e.getAttribute('cx'),h=+e.getAttribute('cy');
    let xa=x,xb=x+w,ya=y,yb=y+h;
    if(xf.getAttribute('flipH')==='1')[xa,xb]=[xb,xa];
    if(xf.getAttribute('flipV')==='1')[ya,yb]=[yb,ya];
    const cl=ln.getElementsByTagNameNS(N.a,'srgbClr')[0],rect=pr.getAttribute('prst')==='rect';
    out.push({rect,x1:t.tx+xa*t.sx,y1:t.ty+ya*t.sy,x2:t.tx+xb*t.sx,y2:t.ty+yb*t.sy,w:+(ln.getAttribute('w')||9525),c:cl?'#'+cl.getAttribute('val'):'#000',dash:dashOf(ln)});
  };
  const walk=(n,t)=>{
    for(const c of n.children){
      const ln=c.localName;
      if(ln==='wgp'||ln==='grpSp'){
        const gp=kids(c,'grpSpPr')[0],xf=gp&&kids(gp,'xfrm')[0];let t2=t;
        if(xf){
          const at=(p,a,b)=>{const e=kids(xf,p)[0];return e?[+e.getAttribute(a),+e.getAttribute(b)]:[0,0]};
          const off=at('off','x','y'),ext=at('ext','cx','cy'),co=at('chOff','x','y'),ce=at('chExt','cx','cy');
          const kx=ce[0]?ext[0]/ce[0]:1,ky=ce[1]?ext[1]/ce[1]:1;
          t2={sx:t.sx*kx,sy:t.sy*ky,tx:t.tx+(off[0]-co[0]*kx)*t.sx,ty:t.ty+(off[1]-co[1]*ky)*t.sy};
        }
        walk(c,t2);
      }else if(ln==='wsp')shape(c,t);
      else walk(c,t);
    }
  };
  items.forEach(i=>{out=[];walk(i.d,{sx:1,sy:1,tx:0,ty:0});out.forEach(s=>L.push(Object.assign(s,{ox:i.x,oy:i.y})))});
  if(L.length>20){
    const k=4,s=Math.min(PW/pw,PH/ph),c=document.createElement('canvas');c.width=PW*k;c.height=PH*k;
    const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.scale(k*s,k*s);x.lineCap='round';
    L.forEach(l=>{
      x.beginPath();x.lineWidth=Math.max(l.w/E*.7,.25);x.strokeStyle=l.c;x.setLineDash(l.dash?l.dash.map(m=>m*Math.max(l.w/E,.3)):[]);
      const ax=l.ox+l.x1/E,ay=l.oy+l.y1/E,bx=l.ox+l.x2/E,by=l.oy+l.y2/E;
      if(l.rect)x.rect(Math.min(ax,bx),Math.min(ay,by),Math.abs(bx-ax),Math.abs(by-ay));else{x.moveTo(ax,ay);x.lineTo(bx,by)}
      x.stroke();
    });
    return{c,tpl:true};
  }
  const ims=Object.keys(z.files).filter(n=>/^word\/media\/.*\.(png|jpe?g|gif|webp|bmp)$/i.test(n));
  if(!ims.length)return null;
  let best=null,bs=0;
  for(const n of ims){const b=await z.file(n).async('blob');if(b.size>bs){bs=b.size;best=b}}
  const im=await new Promise((res,rej)=>{const m=new Image();m.onload=()=>res(m);m.onerror=rej;m.src=URL.createObjectURL(best)});
  return{c:im,tpl:false};
}
$('bgf').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    if(/\.doc$/i.test(f.name)){msg('File .doc cũ chưa đọc được. Hãy mở bằng Word, chọn Lưu thành (Save As) .docx rồi tải lại.');return}
    if(/\.docx$/i.test(f.name)){
      if(!window.JSZip){msg('Chưa nạp được thư viện đọc DOCX, hãy kiểm tra mạng.');return}
      const r=await docxBg(f);
      if(!r){msg('Không tìm thấy hình vẽ hoặc ảnh giấy kẻ trong file DOCX này. Hãy thử lưu giấy kẻ thành ảnh PNG rồi tải lên.');return}
      useBg(r.c,'Đã dùng file DOCX làm giấy kẻ. Nếu dòng chữ lệch, hãy chỉnh “Nâng/hạ cả dòng”.',r.tpl);return;
    }
    const im=new Image(),u=URL.createObjectURL(f);
    im.onload=()=>useBg(im,'Đã đặt ảnh làm giấy kẻ.');
    im.onerror=()=>msg('Không đọc được ảnh.');im.src=u;
  }catch(err){msg('Không đọc được file này.')}
});

const fname=()=>($('pname').value.trim()||'chu-mau').replace(/[\\/:*?"<>|]+/g,'-');
function saveFile(name,data){
  try{
    const type=/\.pdf$/i.test(name)?'application/pdf':/\.docx$/i.test(name)?'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'application/json';
    const u=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');
    a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(u),4000);msg('Đã tải file '+name);
  }catch(e){msg('Không tải được file.')}
}
function render(k){const c=document.createElement('canvas');c.width=PW*k;c.height=PH*k;draw(c.getContext('2d'),k,false);return c}
$('pdf').onclick=async()=>{
  if(!window.jspdf){msg('Chưa nạp được thư viện PDF, hãy kiểm tra mạng.');return}
  const c=render(3),p=new window.jspdf.jsPDF({unit:'pt',format:'letter'});
  p.addImage(c.toDataURL('image/png'),'PNG',0,0,PW,PH);
  saveFile(fname()+'.pdf',p.output('arraybuffer'));
};
$('docx').onclick=async()=>{
  if(!window.JSZip){msg('Chưa nạp được thư viện DOCX, hãy kiểm tra mạng.');return}
  const png=await new Promise(r=>render(3).toBlob(r,'image/png')).then(b=>b.arrayBuffer());
  const X='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',R='http://schemas.openxmlformats.org/officeDocument/2006/relationships',P='http://schemas.openxmlformats.org/package/2006/relationships';
  const cx_='7727273',cy_='10000000',z=new JSZip();
  z.file('[Content_Types].xml',X+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  z.file('_rels/.rels',X+'<Relationships xmlns="'+P+'"><Relationship Id="rId1" Type="'+R+'/officeDocument" Target="word/document.xml"/></Relationships>');
  z.file('word/_rels/document.xml.rels',X+'<Relationships xmlns="'+P+'"><Relationship Id="rId1" Type="'+R+'/image" Target="media/image1.png"/></Relationships>');
  z.file('word/media/image1.png',png);
  z.file('word/document.xml',X+'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="'+R+'" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body><w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="'+cx_+'" cy="'+cy_+'"/><wp:docPr id="1" name="Trang"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="trang.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+cx_+'" cy="'+cy_+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p><w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="0" w:right="0" w:bottom="0" w:left="0" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr></w:body></w:document>');
  saveFile(fname()+'.docx',await z.generateAsync({type:'arraybuffer',compression:'DEFLATE'}));
};

function plist(){
  const P=LS.get('ctm_proj')||{},s=$('plist');s.innerHTML='';
  Object.keys(P).forEach(n=>s.add(new Option(n,n)));
  if(!s.options.length)s.add(new Option('(chưa có bài nào)',''));
}
function applyData(d){
  if(!d||!d.S)return false;
  S=Object.assign({},DEF,d.S,{st:Array.isArray(d.S.st)?d.S.st.slice():[]});if(S.grid==='anh')S.grid='mau';O=d.O||{};SEL=[];
  if(![...$('font').options].some(o=>o.value===S.font))S.font=DEF.font;
  syncUI();loadFont();return true;
}
$('psave').onclick=()=>{
  const n=$('pname').value.trim();if(!n){msg('Hãy nhập tên bài trước khi lưu.');return}
  const P=LS.get('ctm_proj')||{};P[n]=snap();
  if(LS.set('ctm_proj',P)){plist();$('plist').value=n;msg('Đã lưu bài “'+n+'”.')}else msg('Không lưu được trong trình duyệt này, hãy dùng nút Xuất file .json.');
};
$('pload').onclick=()=>{
  const n=$('plist').value,P=LS.get('ctm_proj')||{};
  if(n&&P[n]){applyData(P[n]);$('pname').value=n;msg('Đã mở bài “'+n+'”.')}
};
$('pdel').onclick=()=>{
  const n=$('plist').value,P=LS.get('ctm_proj')||{};
  if(n&&P[n]&&confirm('Xóa bài “'+n+'”?')){delete P[n];LS.set('ctm_proj',P);plist()}
};
$('pexp').onclick=()=>saveFile(fname()+'.json',JSON.stringify(Object.assign({name:$('pname').value.trim()},snap())));
$('pimp').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  try{const d=JSON.parse(await f.text());if(applyData(d)){if(d.name)$('pname').value=d.name;msg('Đã mở file '+f.name)}else msg('File không đúng định dạng.')}
  catch(err){msg('File không đọc được.')}
});

plist();
const cur=LS.get('ctm2_cur');
if(!applyData(cur)){syncUI();loadFont()}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refresh);

let Z=1,panOn=false,spaceDown=false;
const view=$('view');
const fitW=()=>Math.max(200,Math.min(view.clientWidth-24,(view.clientHeight-24)*PW/PH));
function setZoom(z,px,py){
  z=Math.min(4,Math.max(.5,z));
  const r=cv.getBoundingClientRect(),vr=view.getBoundingClientRect();
  if(px==null){px=vr.left+vr.width/2;py=vr.top+vr.height/2}
  const fx=(px-r.left)/r.width,fy=(py-r.top)/r.height;
  Z=z;cv.style.width=Math.round(fitW()*Z)+'px';
  const n=cv.getBoundingClientRect();
  view.scrollLeft+=n.left+fx*n.width-px;view.scrollTop+=n.top+fy*n.height-py;
  $('zr').value=Math.round(Z*100);$('zv').textContent=Math.round(Z*100)+'%';
  draw(cx,K,true);
}
$('zm').onclick=()=>setZoom(Z/1.25);$('zp').onclick=()=>setZoom(Z*1.25);
$('zf').onclick=()=>{setZoom(1);view.scrollLeft=0;view.scrollTop=0};
$('zr').addEventListener('input',e=>setZoom(+e.target.value/100));
view.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();setZoom(Z*(e.deltaY<0?1.1:1/1.1),e.clientX,e.clientY)}},{passive:false});
$('pan').onclick=()=>{panOn=!panOn;$('pan').classList.toggle('on',panOn);cv.style.cursor=panOn?'grab':'default'};
window.addEventListener('resize',()=>setZoom(Z));
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x===b));
  document.querySelectorAll('.card').forEach(c=>c.classList.toggle('on',c.id===b.dataset.t));
});
requestAnimationFrame(()=>setZoom(1));
