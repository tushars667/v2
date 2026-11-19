/* A bespoke invitation, implemented without a heavyweight animation framework.
   Motion is predominantly CSS transform/opacity, with one throttled canvas layer.
*/
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const entry = $('#entry');
  const audio = $('#bgAudio');
  const soundToggle = $('#soundToggle');
  const soundLabel = $('#soundLabel');
  const toast = $('#toast');
  let opened = false, audioEnabled = false, changing = false, toastTimer;

  function message(str) {
    toast.textContent = str;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }
  async function turnSound(on) {
    audioEnabled = !!on;
    soundToggle.classList.toggle('is-playing', audioEnabled);
    soundToggle.setAttribute('aria-pressed', String(audioEnabled));
    soundToggle.setAttribute('aria-label', audioEnabled ? 'Turn music off' : 'Turn music on');
    soundLabel.textContent = audioEnabled ? 'SOUND ON' : 'SOUND OFF';
    if (audioEnabled) {
      try {
        audio.volume = 0;
        await audio.play();
        const start = performance.now();
        function fade(t) {
          if (!audioEnabled) return;
          audio.volume = Math.max(0, Math.min(.46, (t - start) / 2700 * .46));
          if (audio.volume < .46) requestAnimationFrame(fade);
        }
        requestAnimationFrame(fade);
      } catch (err) {
        audioEnabled = false;
        soundToggle.classList.remove('is-playing');
        soundToggle.setAttribute('aria-pressed', 'false');
        soundLabel.textContent = 'SOUND OFF';
        message('Tap Sound to enable music on your device.');
      }
    } else {
      audio.pause();
    }
  }
  soundToggle.addEventListener('click', () => turnSound(!audioEnabled));

  function openInvitation() {
    if (opened || changing) return;
    changing = true;
    entry.classList.add('opening');
    document.body.classList.remove('locked');
    // The visitor has tapped: browser audio playback is allowed from this gesture.
    turnSound(true);
    setTimeout(() => {
      document.body.classList.add('entered');
      entry.classList.add('finished');
      opened = true;
      changing = false;
      document.querySelector('#siteMain')?.removeAttribute('inert');
      if (!reduced) petals.burst();
      window.dispatchEvent(new Event('scroll'));
    }, reduced ? 100 : 1300);
  }
  $('#openBtn').addEventListener('click', openInvitation);
  $('#openTextBtn').addEventListener('click', openInvitation);
  $('#siteMain').setAttribute('inert', '');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
  }, {rootMargin:'0px 0px -6% 0px',threshold:.08});
  $$('.reveal').forEach(el => observer.observe(el));
  const artObserver = new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle('is-active',e.isIntersecting)),{threshold:.2});
  $$('.chapter-image').forEach(el => artObserver.observe(el));

  let scheduled = false;
  function onScroll() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      const available = document.documentElement.scrollHeight - window.innerHeight;
      $('#progressBar').style.width = `${available > 0 ? Math.max(0,Math.min(100,sy / available * 100)) : 0}%`;
      $('#siteHeader').classList.toggle('is-scrolled', sy > 35);
      if (!reduced && sy < window.innerHeight * 1.25) {
        const y = Math.min(65, sy * .1);
        $('.hero-architecture').style.setProperty('--arch-y', `${y}px`);
      }
      scheduled = false;
    });
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  onScroll();

  // Floating gold leaf petals: device-aware, throttled, and non-interactive.
  const petals = (() => {
    const canvas = $('#petalCanvas');
    const ctx = canvas.getContext('2d', {alpha:true});
    if (!ctx || reduced) return {burst:()=>{}};
    let W=0,H=0,items=[],sparks=[],prev=0,last=0,dpr=1;
    function resize() {
      dpr = Math.min(window.devicePixelRatio||1,1.75);
      W=window.innerWidth;H=window.innerHeight;
      canvas.width = Math.floor(W*dpr);canvas.height = Math.floor(H*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      if(!items.length)items=Array.from({length:W<600?24:43},(_,i)=>newPetal(i,true));
    }
    function newPetal(i,randomY=false) {
      return {x:Math.random()*W,y:randomY?Math.random()*H:-30-Math.random()*H,v:.22+Math.random()*.42,s:2+Math.random()*4,phase:Math.random()*6.28,rot:Math.random()*6.28,r:.004+Math.random()*.008,alpha:.25+Math.random()*.45,burst:false};
    }
    function draw(t) {
      requestAnimationFrame(draw);
      if(!opened||document.hidden||t-last<30)return;
      const dt=Math.min(2.5,(t-prev||32)/32);last=t;prev=t;
      ctx.clearRect(0,0,W,H);
      for(const p of items){
        p.y+=p.v*dt*(p.burst?5:1);p.x+=Math.sin(p.phase+p.y*.008)*.2*dt;p.rot+=p.r*dt;
        if(p.y>H+28){Object.assign(p,newPetal(0));p.x=Math.random()*W;}
        ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);
        ctx.fillStyle=`rgba(${p.burst?'249,203,153':'217,176,114'},${p.alpha})`;
        ctx.beginPath();ctx.moveTo(0,-p.s*1.8);ctx.quadraticCurveTo(p.s*1.5,-p.s*.5,0,p.s*1.8);ctx.quadraticCurveTo(-p.s*1.5,p.s*.5,0,-p.s*1.8);ctx.fill();ctx.restore();
        if(p.burst && p.y>H*.7)p.burst=false;
      }
      sparks = sparks.filter(s => s.life>0);
      for(const s of sparks) {
        s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=.028*dt;s.life-=.025*dt;
        ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.life*3);
        ctx.globalAlpha=Math.max(0,s.life)*.9;ctx.fillStyle=s.color;
        ctx.beginPath();ctx.moveTo(0,-s.r*2);ctx.lineTo(s.r*.6,-s.r*.45);ctx.lineTo(s.r*2,0);ctx.lineTo(s.r*.6,s.r*.45);ctx.lineTo(0,s.r*2);ctx.lineTo(-s.r*.6,s.r*.45);ctx.lineTo(-s.r*2,0);ctx.lineTo(-s.r*.6,-s.r*.45);ctx.closePath();ctx.fill();ctx.restore();
      }
    }
    window.addEventListener('resize',resize,{passive:true});resize();requestAnimationFrame(draw);
    return {
      burst(){items.forEach(p=>{p.y=H*.3+Math.random()*H*.2;p.x=W*.5+(Math.random()-.5)*W*.65;p.v=2+Math.random()*2;p.burst=true;});},
      burstAt(x,y){for(let i=0;i<30;i++){const a=Math.random()*Math.PI*2,velocity=1.3+Math.random()*3;sparks.push({x,y,vx:Math.cos(a)*velocity,vy:Math.sin(a)*velocity-1,r:1+Math.random()*2.5,life:.6+Math.random()*.45,color:Math.random()>.35?'#ffe0a6':'#eab17b'});}}
    };
  })();

  // Touch-first micro-interaction: light each scene with a small burst of stars.
  $$('.chapter-image').forEach((scene) => {
    const trigger=document.createElement('button');
    trigger.type='button';trigger.className='magic-button';trigger.textContent='✧  TOUCH FOR MAGIC';
    trigger.setAttribute('aria-label','Make this wedding scene sparkle');scene.appendChild(trigger);
    trigger.addEventListener('click', () => {
      const r=scene.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height*.58;
      const light=document.createElement('span');light.className='magic-flash';light.style.left=`${cx-r.left}px`;light.style.top=`${cy-r.top}px`;scene.appendChild(light);
      light.addEventListener('animationend',()=>light.remove(),{once:true});
      petals.burstAt(cx,cy);
      if('vibrate' in navigator) navigator.vibrate(22);
    });
  });

  // IST wedding countdown; do not accidentally depend on the viewer's timezone.
  const target = new Date('2026-12-10T19:00:00+05:30').getTime(); // first celebration, Sufi Night
  function updateCountdown() {
    let remaining=Math.max(0,target-Date.now());
    const units=[86400000,3600000,60000,1000], ids=['days','hours','minutes','seconds'];
    units.forEach((u,i)=>{const val=Math.floor(remaining/u);remaining-=val*u; $(`#${ids[i]}`).textContent=String(val).padStart(2,'0');});
  }
  updateCountdown();setInterval(updateCountdown,1000);

  const venueAddress='Shivdhara Resort, Chitrasani, Deesa Highway, Palanpur, Gujarat, India';
  // The original invitation says "11 December · Midnight". In a calendar,
  // midnight after Friday 11th is Saturday 12th at 00:00; confirm with host.
  const events={
    sufi:{title:'Sufi Night — Aditya & Shreya',start:'20261210T190000',end:'20261210T220000'},
    haldi:{title:'Haldi Carnival — Aditya & Shreya',start:'20261211T103000',end:'20261211T123000'},
    baraat:{title:'Baraat — Aditya & Shreya',start:'20261211T170000',end:'20261211T193000'},
    reception:{title:'Reception & Dinner — Aditya & Shreya',start:'20261211T193000',end:'20261211T223000'},
    wedding:{title:'Wedding Ceremony — Aditya & Shreya',start:'20261212T000000',end:'20261212T020000'}
  };
  function icalEscape(x){return x.replace(/\\/g,'\\\\').replace(/,/g,'\\,').replace(/;/g,'\\;').replace(/\n/g,'\\n');}
  function istToUtcStamp(local) {
    const iso=`${local.slice(0,4)}-${local.slice(4,6)}-${local.slice(6,8)}T${local.slice(9,11)}:${local.slice(11,13)}:${local.slice(13,15)}+05:30`;
    return new Date(iso).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  }
  function addCalendar(ids) {
    let lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Aditya and Shreya//Wedding Invitation//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Aditya & Shreya — Wedding Celebrations'];
    for (const id of ids) {
      const e=events[id];if(!e)continue;
      lines.push('BEGIN:VEVENT',`UID:${id}-aditya-shreya-2026@wedding.local`,`DTSTAMP:20261119T120000Z`,`DTSTART:${istToUtcStamp(e.start)}`,`SUMMARY:${icalEscape(e.title)}`,`LOCATION:${icalEscape(venueAddress)}`,'DESCRIPTION:With love from the Agrawal and Kothari families.','END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    const blob=new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'});
    const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download=ids.length>1?'Aditya-Shreya-Wedding-2026.ics':`Aditya-Shreya-${ids[0]}.ics`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1500);
    message('Calendar file downloaded. Open it to add the event.');
  }
  $$('.chapter-calendar').forEach(btn=>btn.addEventListener('click',()=>addCalendar([btn.dataset.event])));
  const all=()=>addCalendar(Object.keys(events));
  $('#addCalendarMain').addEventListener('click',all);$('#calendarAll').addEventListener('click',all);
  $('#copyVenue').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(venueAddress);message('Venue address copied.');}catch{message(venueAddress);}});
  $('#shareInvite').addEventListener('click',async()=>{
    const data={title:'Aditya & Shreya — Wedding Invitation',text:'You are invited! Join us on 10–11 December 2026 at Shivdhara Resort, Palanpur.',url:window.location.href};
    try {if(navigator.share) await navigator.share(data);else{await navigator.clipboard.writeText(`${data.text}\n${data.url}`);message('Invitation link copied.');}}catch(e){if(e.name!=='AbortError')message('Use your browser Share button to share this page.');}
  });
})();
