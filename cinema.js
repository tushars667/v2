/* THE CINEMATIC CUT / V2
 * Every section-boundary is a reversible timeline. There is no snapping,
 * freezing, wheel interception, or expensive external animation package.
 * The visitor is the director: slow swipes reveal the entire transition.
 */
(() => {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const clamp = (n,a=0,b=1) => Math.min(b,Math.max(a,n));
  const smooth = n => { n=clamp(n);return n*n*(3-2*n); };
  const $ = s => document.querySelector(s);
  const chapters = [...document.querySelectorAll('.chapter')];
  const main = $('#siteMain');
  const frames = [
    {to:'#story',       theme:'parchment', eyebrow:'THE SACRED INVOCATION', title:'The <em>Blessings</em>', subtitle:'Every great love story begins with a blessing.', number:'PROLOGUE',  glyph:'❁'},
    {to:'#date',        theme:'cosmos',    eyebrow:'AN APPOINTMENT WITH FOREVER', title:'Written in <em>Stars</em>',subtitle:'Two souls. One extraordinary destiny.', number:'ACT I', glyph:'✧'},
    {to:'#celebrations',theme:'floral',    eyebrow:'THE GRAND CELEBRATION', title:'The <em>Chronicles</em>',subtitle:'Five unforgettable moments await you.',number:'THE JOURNEY',glyph:'✺'},
    {to:'#sufi',        theme:'sufi',      eyebrow:'10 DECEMBER · 7:00 PM', title:'A Night of <em>Stars</em>',subtitle:'Close your eyes. Feel the music.',number:'CHAPTER 01 / 05',glyph:'✶',image:'assets/sufi.svg'},
    {to:'#haldi',       theme:'haldi',     eyebrow:'11 DECEMBER · 10:30 AM',title:'Into the <em>Sunshine</em>',subtitle:'From starlight to a thousand marigolds.',number:'CHAPTER 02 / 05',glyph:'✺',image:'assets/haldi.svg'},
    {to:'#baraat',      theme:'baraat',    eyebrow:'11 DECEMBER · 5:00 PM',title:'Here Comes <em>Royalty</em>',subtitle:'Let the drums awaken the kingdom.',number:'CHAPTER 03 / 05',glyph:'♛',image:'assets/baraat.svg'},
    {to:'#reception',   theme:'reception', eyebrow:'11 DECEMBER · 7:30 PM',title:'Under a <em>Thousand Lights</em>',subtitle:'An evening dressed in love.',number:'CHAPTER 04 / 05',glyph:'✧',image:'assets/reception.svg'},
    {to:'#wedding',     theme:'wedding',   eyebrow:'THE SACRED VOWS',title:'Seven Steps. <em>Forever.</em>',subtitle:'The moment two paths become one.',number:'CHAPTER 05 / 05',glyph:'∞',image:'assets/wedding.svg'},
    {to:'.blessing-section',theme:'blessings',eyebrow:'WITH LOVE AND GRATITUDE',title:'Blessed by <em>You</em>',subtitle:'The most beautiful part of our story is you.',number:'EPILOGUE',glyph:'❀'},
    {to:'#venue',       theme:'destination',eyebrow:'YOUR INVITATION TO PALANPUR',title:'The <em>Destination</em>',subtitle:'Every road leads to a celebration.',number:'THE LOCATION',glyph:'⌘'},
    {to:'#rsvp',        theme:'forever',   eyebrow:'THERE IS A PLACE FOR YOU',title:'Be Part of <em>Forever</em>',subtitle:'Your presence is the greatest blessing.',number:'THE INVITATION',glyph:'♥'}
  ].map(s=>({...s,el:$(s.to)})).filter(s=>s.el);

  // The stage is reused, rather than adding an overlay for every page.
  const portal = document.createElement('div');
  portal.id='cinemaPortal';portal.className='cinema-portal';portal.setAttribute('aria-hidden','true');
  portal.innerHTML=`<div class="portal-base"></div>
    <img class="portal-art" alt="" decoding="async" />
    <div class="portal-grain"></div>
    <div class="portal-wing portal-wing--left"></div><div class="portal-wing portal-wing--right"></div>
    <div class="portal-wheel"></div><img class="portal-mandala" src="assets/portal-mandala.svg" alt=""/><div class="portal-flower">✦</div>
    <div class="portal-sparks"><span>✧</span><span>✦</span><span>❃</span><span>✧</span><span>✶</span><span>✧</span></div>
    <div class="portal-slit"></div>
    <div class="portal-copy"><span class="portal-index"></span><h2 class="portal-name"></h2><p class="portal-caption"></p><span class="portal-sub"></span></div>`;
  document.body.appendChild(portal);
  const portalArt=portal.querySelector('.portal-art');
  const index=portal.querySelector('.portal-index');
  const name=portal.querySelector('.portal-name');
  const caption=portal.querySelector('.portal-caption');
  const sub=portal.querySelector('.portal-sub');
  const flower=portal.querySelector('.portal-flower');
  const sparkElements=[...portal.querySelectorAll('.portal-sparks span')];
  let currentFrame=-1, activeTheme='gold', enteredChapter=-1;

  // A quiet cinematic chapter counter appears only while viewing celebrations.
  const indicator=document.createElement('div');
  indicator.className='scene-indicator';indicator.setAttribute('aria-hidden','true');
  indicator.innerHTML='<span class="si-number">01</span><span class="si-rule"></span><span class="si-label">SUFI NIGHT</span><span class="si-chevron">✦</span>';
  document.body.appendChild(indicator);
  const sceneNames=['SUFI NIGHT','HALDI CARNIVAL','THE BARAAT','THE RECEPTION','THE WEDDING'];

  // Gold picture frames, parallax camera rings and large editorial watermarks.
  chapters.forEach((chapter,i)=>{
    const image=chapter.querySelector('.chapter-image');
    const label=document.createElement('span');label.className='cinema-title-watermark';label.textContent=['Sufi','Haldi','Baraat','Reception','Wedding'][i];
    const halo=document.createElement('span');halo.className='cinema-halo';
    const frame=document.createElement('span');frame.className='cinema-frame';
    image.append(halo,frame,label);
    image.addEventListener('pointerdown',e=>{
      if(e.target.closest('button')) return;
      const r=image.getBoundingClientRect();
      fx.burst(e.clientX,e.clientY,36,['#fff0bd','#ffd185','#ffffff']);
      const wave=document.createElement('span');wave.className='magic-flash';wave.style.left=`${e.clientX-r.left}px`;wave.style.top=`${e.clientY-r.top}px`;
      image.appendChild(wave);wave.addEventListener('animationend',()=>wave.remove(),{once:true});
    });
  });

  // Split editorial text into masked words. The original accessible heading stays labelled.
  document.querySelectorAll('.editorial-title,.chapter-title').forEach(heading=>{
    heading.setAttribute('aria-label',heading.textContent.replace(/\s+/g,' ').trim());
    let count=0;
    const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) if(walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
    for(const node of nodes){
      const frag=document.createDocumentFragment();
      for(const token of node.nodeValue.match(/\s+|\S+/g)||[]){
        if(/^\s+$/.test(token)){frag.appendChild(document.createTextNode(token));continue;}
        const clip=document.createElement('span');clip.className='kinetic-clip';clip.setAttribute('aria-hidden','true');
        const word=document.createElement('span');word.className='kinetic-word';word.style.setProperty('--word-index',Math.min(count++,8));word.textContent=token;
        clip.append(word);frag.append(clip);
      }
      node.replaceWith(frag);
    }
  });

  // Lightweight environment-specific particles. One canvas, no WebGL bundle.
  const canvas=$('#cinemaParticles');
  const ctx=canvas?.getContext('2d',{alpha:true});
  const modes={
    gold:['#f8d9a0','#c99f5f','#fff3c9'],
    parchment:['#e1b770','#fff1bd','#b98e65'],cosmos:['#f5dcae','#b1bcff','#d6e4ff'],floral:['#ffe1af','#eab67d','#c4de9c'],
    sufi:['#ffffff','#98baff','#ffe4ba'],haldi:['#ffeb83','#ffbd3b','#fff7bb'],baraat:['#ffd493','#f3b35f','#fff5bf'],
    reception:['#ffe0d9','#f4b3dc','#fff6d8'],wedding:['#ffc280','#f47b4a','#ffebaf'],
    blessings:['#f4d99e','#e5b665','#fff4cf'],destination:['#d6cf8a','#fbefb0','#d2e2bd'],forever:['#ffd3a5','#fff0d2','#e6ba93']
  };
  const fx=(()=>{
    if(!ctx) return {burst:()=>{},setTheme:()=>{}};
    let W=0,H=0,D=1,last=0,prev=0,parts=[],confetti=[],theme='gold';
    function choose(list){return list[Math.floor(Math.random()*list.length)];}
    function particle(initial=false){
      const up=theme==='wedding';
      return {x:Math.random()*W,y:initial?Math.random()*H:(up?H+20:-20),vx:(Math.random()-.5)*.36,vy:(up?-(.5+Math.random()*.9):.16+Math.random()*.38),size:.8+Math.random()*2.8,phase:Math.random()*Math.PI*2,alpha:.23+Math.random()*.48,kind:theme==='haldi'?'flower':theme==='baraat'?'confetti':theme==='wedding'?'ember':theme==='sufi'||theme==='cosmos'?'star':'dust'};
    }
    function resize(){W=innerWidth;H=innerHeight;D=Math.min(devicePixelRatio||1,1.45);canvas.width=Math.round(W*D);canvas.height=Math.round(H*D);ctx.setTransform(D,0,0,D,0,0);parts=Array.from({length:W<700?23:40},()=>particle(true));}
    function star(x,y,r,color,a){ctx.globalAlpha=a;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y-r*2.9);ctx.lineTo(x+r*.38,y-r*.38);ctx.lineTo(x+r*2.9,y);ctx.lineTo(x+r*.38,y+r*.38);ctx.lineTo(x,y+r*2.9);ctx.lineTo(x-r*.38,y+r*.38);ctx.lineTo(x-r*2.9,y);ctx.lineTo(x-r*.38,y-r*.38);ctx.closePath();ctx.fill();}
    function render(t){
      requestAnimationFrame(render);
      if(document.hidden||!document.body.classList.contains('entered')||t-last<29) return;
      const dt=Math.min(2.6,(t-prev||34)/34);last=t;prev=t;ctx.clearRect(0,0,W,H);
      const palette=modes[theme]||modes.gold;
      for(const p of parts){
        p.x+=(p.vx+Math.sin(p.phase+t*.00035)*.25)*dt;p.y+=p.vy*dt;
        if(p.x>W+20)p.x=-10;if(p.x< -20)p.x=W+10;
        if((p.vy>0&&p.y>H+20)||(p.vy<0&&p.y< -20))Object.assign(p,particle());
        const alpha=p.alpha*(.65+.35*Math.sin(p.phase+t*.002));
        ctx.save();ctx.translate(p.x,p.y);ctx.rotate((t*.00024+p.phase) * (p.kind==='confetti'?1: .3));
        ctx.globalAlpha=alpha;ctx.fillStyle=palette[Math.floor(p.size)%palette.length];
        if(p.kind==='star'){ctx.restore();star(p.x,p.y,p.size,choose(palette),alpha);continue;}
        if(p.kind==='flower'){
          for(let i=0;i<5;i++){ctx.rotate(Math.PI*2/5);ctx.beginPath();ctx.ellipse(p.size*.65,0,p.size*.9,p.size*.38,0,0,Math.PI*2);ctx.fill();}
        } else if(p.kind==='ember'){ctx.shadowColor='#ed8e4c';ctx.shadowBlur=12;ctx.beginPath();ctx.ellipse(0,0,p.size*.7,p.size*1.45,0,0,Math.PI*2);ctx.fill();}
        else if(p.kind==='confetti'){ctx.fillRect(-p.size*.65,-p.size*1.55,p.size*1.3,p.size*3.1)}
        else {ctx.beginPath();ctx.arc(0,0,p.size*.5,0,Math.PI*2);ctx.fill();}
        ctx.restore();
      }
      for(let i=confetti.length-1;i>=0;i--){
        const p=confetti[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.gravity||.03)*dt;p.vx*=.998;p.life-=.016*dt;
        if(p.life<=0){confetti.splice(i,1);continue;}
        if(p.type==='star')star(p.x,p.y,p.size,p.color,p.life*.92);
        else {ctx.globalAlpha=p.life*.85;ctx.fillStyle=p.color;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.life*4);ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*1.9);ctx.restore();}
      }
      ctx.globalAlpha=1;
    }
    function burst(x,y,n=65,colors){
      if(!W)return;
      colors=colors||modes[theme]||modes.gold;
      const limit=W<700?55:85;
      for(let i=0;i<Math.min(n,limit);i++){
        const a=Math.PI*2*(i/Math.min(n,limit))+Math.random()*.28;
        const speed=1+Math.random()*(theme==='baraat'?9:6);
        confetti.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-2.8,size:1+Math.random()*4,color:choose(colors),life:.58+Math.random()*.43,gravity:theme==='wedding'?-.012:.055,type:i%3===0?'star':'confetti'});
      }
      if(confetti.length>200)confetti.splice(0,confetti.length-200);
    }
    function setTheme(next){if(theme===next)return;theme=next;parts=Array.from({length:W<700?23:40},()=>particle(true));}
    window.addEventListener('resize',resize,{passive:true});resize();requestAnimationFrame(render);
    return {burst,setTheme};
  })();

  // Experience feedback: a flourish when a chapter first takes the stage.
  function setFrame(i){
    if(i===currentFrame) return;
    currentFrame=i;
    const f=frames[i];if(!f)return;
    portal.dataset.theme=f.theme;index.textContent=f.eyebrow;name.innerHTML=f.title;caption.textContent=f.subtitle;sub.textContent=f.number;
    flower.textContent=f.glyph;portalArt.style.display=f.image?'block':'none';
    if(f.image)portalArt.setAttribute('src',f.image);else portalArt.removeAttribute('src');
    sparkElements.forEach((el,j)=>{el.textContent= j%3===0?f.glyph:j%3===1?'✧':'✦';});
  }
  let ticking=false;
  function scrollTick(){
    ticking=false;
    if(!document.body.classList.contains('entered')) {portal.style.opacity='0';return;}
    const H=innerHeight, viewportCenter=H*.48;
    let best=-1, bestStrength=0, bestP=0;
    for(let i=0;i<frames.length;i++){
      const top=frames[i].el.getBoundingClientRect().top;
      // 0 at 90% viewport (incoming), 0.5 at 24% viewport, 1 at -42% viewport.
      const p=clamp((.90-top/H)/1.32);
      if(p<=0||p>=1)continue;
      const strength=Math.sin(p*Math.PI);
      if(strength>bestStrength){best=i;bestStrength=strength;bestP=p;}
    }
    if(best>=0 && bestStrength>.035){
      setFrame(best);
      const impact=smooth(bestStrength), wing=(1-impact)*104, op=smooth(Math.min(1,bestStrength*1.46));
      portal.style.opacity=op.toFixed(3);
      portal.style.setProperty('--impact',impact.toFixed(4));
      portal.style.setProperty('--flower-opacity',(impact * (frames[best].theme==='haldi'?.56:frames[best].theme==='forever'?.34:.20)).toFixed(4));
      portal.style.setProperty('--mandala-opacity',(impact*(frames[best].theme==='cosmos'?.5:.78)).toFixed(4));
      portal.style.setProperty('--wing',`${wing.toFixed(2)}%`);
      portal.style.setProperty('--ring-rotation',`${(bestP*300-140).toFixed(1)}deg`);
      portal.style.setProperty('--ring-scale',(0.53+impact*.78).toFixed(3));
      portal.style.setProperty('--art-scale',(1.25-bestP*.21).toFixed(3));
      portal.style.setProperty('--art-opacity',(impact*.32).toFixed(3));
      portal.style.setProperty('--copy-opacity',smooth((bestStrength-.54)/.32).toFixed(3));
      portal.style.setProperty('--copy-offset',`${((.5-bestP)*58).toFixed(1)}px`);
      portal.style.setProperty('--spark-y',`${(bestP-.5)*-50}px`);
    } else portal.style.opacity='0';

    // Physical movement in each page: forward swipe moves the camera through each illustration.
    for(let i=0;i<chapters.length;i++){
      const ch=chapters[i],r=ch.getBoundingClientRect();
      if(r.bottom< -100||r.top>H+100)continue;
      const p=clamp((H-r.top)/(H+r.height));
      const im=ch.querySelector('.chapter-image');
      const appear=smooth(clamp((H-r.top)/(H*.85)));
      im.style.setProperty('--scene-offset',`${((p-.5)*-67).toFixed(1)}px`);
      im.style.setProperty('--scene-scale',(1.12+(.5-Math.abs(p-.5))*.11).toFixed(4));
      im.style.setProperty('--scene-tilt',`${((p-.5)*-1.4).toFixed(3)}deg`);
      im.style.setProperty('--halo-rotate',`${(p*70-35).toFixed(1)}deg`);
      im.style.setProperty('--halo-scale',(1.03+appear*.13).toFixed(3));
      im.style.setProperty('--scene-frame-scale',(1.13-appear*.13).toFixed(3));
      im.style.setProperty('--scene-frame-opacity',(.2+appear*.57).toFixed(3));
      im.style.setProperty('--scene-shine',(.2+appear*.5).toFixed(3));
      im.style.setProperty('--scene-shift',`${(-85+p*160).toFixed(1)}%`);
      im.style.setProperty('--label-offset',`${((p-.5)*-27).toFixed(1)}px`);
      if(appear>.87&&i!==enteredChapter&&r.top<H*.26&&r.bottom>H*.1){
        enteredChapter=i;fx.setTheme(['sufi','haldi','baraat','reception','wedding'][i]);
        fx.burst(innerWidth*.5,H*.58,i===1||i===2?75:46);
      }
    }
    let midChapter=-1;
    for(let i=0;i<chapters.length;i++){
      const r=chapters[i].getBoundingClientRect();
      if(r.top<viewportCenter&&r.bottom>viewportCenter){midChapter=i;break;}
    }
    if(midChapter>=0){
      indicator.classList.add('show');indicator.querySelector('.si-number').textContent=String(midChapter+1).padStart(2,'0');
      indicator.querySelector('.si-label').textContent=sceneNames[midChapter];
      const t=['sufi','haldi','baraat','reception','wedding'][midChapter];
      fx.setTheme(t);
    } else {indicator.classList.remove('show');
      const cand=frames.find(f=>f.el.getBoundingClientRect().top>=0&&f.el.getBoundingClientRect().top<H*.75);
      fx.setTheme(best>=0?frames[best].theme:(cand?.theme||'gold'));
    }
    // Editorial parallax across the other pages.
    const story=$('#story'),date=$('#date'),intro=$('#celebrations'),venue=$('#venue'),rsvp=$('#rsvp');
    const passage=el=>{const r=el.getBoundingClientRect();return clamp((H-r.top)/(H+r.height));};
    if(story){const p=passage(story);story.style.setProperty('--paper-zoom',(1.05-p*.08).toFixed(3));story.style.setProperty('--motif-y',`${((p-.45)*-44).toFixed(1)}px`);story.style.setProperty('--motif-scale',(1.13-p*.15).toFixed(3));}
    if(date){const p=passage(date);date.style.setProperty('--date-tilt',`${((p-.5)*-16).toFixed(1)}deg`);date.style.setProperty('--date-scale',(1.06-p*.09).toFixed(3));date.style.setProperty('--date-ring',`${(p*90).toFixed(1)}deg`);}
    if(intro)intro.style.setProperty('--intro-lift',`${((passage(intro)-.5)*-38).toFixed(1)}px`);
    if(venue){const p=passage(venue);venue.style.setProperty('--venue-rotate',`${((p-.5)*-10).toFixed(1)}deg`);venue.style.setProperty('--venue-lift',`${((p-.5)*-28).toFixed(1)}px`);}
    if(rsvp){const p=passage(rsvp);rsvp.style.setProperty('--rsvp-rotation',`${(p*120).toFixed(1)}deg`);rsvp.style.setProperty('--rsvp-scale',(1+p*.1).toFixed(3));}
  }
  function requestTick(){if(ticking)return;ticking=true;requestAnimationFrame(scrollTick);}
  addEventListener('scroll',requestTick,{passive:true});
  addEventListener('resize',requestTick,{passive:true});
  // As soon as the letter has opened, trigger the first frame / enable overlays.
  const openedObserver=new MutationObserver(()=>{if(document.body.classList.contains('entered'))requestTick();});
  openedObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  document.querySelectorAll('.magic-button').forEach((btn,i)=>btn.addEventListener('click',()=>fx.burst(innerWidth*.5,innerHeight*.57,75)));
  requestTick();
})();
