// Adapted from the supplied Desk Computer SVG artifact.
(() => {
const host = document.querySelector('.desk-computer');
if (!host) return;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const A=.95,B=.3,C=.62,D=-.46,OX=200,OY=440,NS='http://www.w3.org/2000/svg',$=id=>host.querySelector('#'+id);
// Widen the monitor along its own horizontal axis, preserving the perspective.
const MONITOR_WIDTH = 1.16;
const monitorU = u => 200 + (u - 200) * MONITOR_WIDTH;
let projectionWidth = 1;
const P=(u,v,z)=>{
  const projectedU = 200 + (u - 200) * projectionWidth;
  return [OX+A*projectedU+C*v,OY+B*projectedU+D*v-z];
};
const pt=a=>a.map(p=>P(...p).map(n=>+n.toFixed(1)).join(',')).join(' ');
const pg=(a,c)=>`<polygon class="${c}" points="${pt(a)}"/>`;
const ln=(a,b)=>{const[p,q]=[P(...a),P(...b)];return `<line class="st" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/>`};
const box=(u0,u1,v0,v1,z0,z1,c=['ff','fs','ft'])=>pg([[u0,v0,z0],[u1,v0,z0],[u1,v0,z1],[u0,v0,z1]],c[0])+pg([[u1,v0,z0],[u1,v1,z0],[u1,v1,z1],[u1,v0,z1]],c[1])+pg([[u0,v0,z1],[u1,v0,z1],[u1,v1,z1],[u0,v1,z1]],c[2]);
const rr=(u0,u1,v0,v1,r,S)=>{const o=[],arc=(cu,cv,a)=>{for(let k=0;k<=S;k++){const t=(a+90*k/S)*Math.PI/180;o.push([cu+r*Math.cos(t),cv+r*Math.sin(t)])}};arc(u1-r,v0+r,-90);arc(u1-r,v1-r,0);arc(u0+r,v1-r,90);arc(u0+r,v0+r,180);return o};
const rbox=(u0,u1,v0,v1,z0,z1,r,S)=>{const o=rr(u0,u1,v0,v1,r,S),n=o.length,W=[],E=[];
for(let i=0;i<n;i++){const a=o[i],b=o[(i+1)%n],du=b[0]-a[0],dv=b[1]-a[1],l=Math.hypot(du,dv);if(l<1e-6)continue;const nu=dv/l,nv=-du/l,d=nu-nv;if(d<-.3)continue;
const f=Math.max(0,Math.min(1,.5-.5*nv-.5*nu)),c=`color-mix(in srgb,var(--ff) ${Math.round(f*100)}%,var(--fs))`;
W.push([d,`<polygon style='fill:${c};stroke:${c};stroke-width:.7' points='${pt([[...a,z0],[...b,z0],[...b,z1],[...a,z1]])}'/>`]);E.push(ln([...a,z0],[...b,z0]))}
const xs=o.map(p=>P(p[0],p[1],0)[0]),sil=[xs.indexOf(Math.min(...xs)),xs.indexOf(Math.max(...xs))],jn=[0,S,S+1,3*(S+1)+S],V=[...sil,...jn].map(i=>ln([...o[i],z0],[...o[i],z1]));
return W.sort((x,y)=>x[0]-y[0]).map(x=>x[1]).join('')+E.join('')+`<g opacity='.45'>${V.slice(2).join('')}</g>`+V.slice(0,2).join('')+pg(o.map(p=>[...p,z1]),'ft')+pg(rr(u0+5,u1-5,v0+5,v1-5,Math.max(2,r-5),S).map(p=>[...p,z1]),'st')};
// Draw the greeting as a small, two-color pixel sprite in the screen plane.
function pixelSprite(rows, x, y, size = 4) {
  const palette = { '#': 'var(--sink)', o: 'var(--phos)' };
  return rows.map((row, rowIndex) => [...row].map((pixel, columnIndex) => {
    if (!palette[pixel]) return '';
    return `<rect x="${x + columnIndex * size}" y="${y + rowIndex * size}" width="${size}" height="${size}" fill="${palette[pixel]}"/>`;
  }).join('')).join('');
}
const catPixels = [
  '..##............##..',
  '..#o#..........#o#..',
  '..#oo#........#oo#..',
  '..#ooo########ooo#..',
  '..#oooooooooooooo#..',
  '.#oooooooooooooooo#.',
  '.#oooooooooooooooo#.',
  '.#oooooooooooooooo#.',
  '.#oooooooooooooooo#.',
  '##ooooooo##ooooooo##',
  '.#ooooo#oooo#ooooo#.',
  '..##oooo####oooo##..',
  '....############....',
  '......#oooooo#......',
  '.....#oooooooo#.....',
  '....#oooooooooo#....',
  '....#ooo#oo#ooo#....',
  '....#ooo#oo#ooo#....',
  '....#ooo#oo#ooo#....',
  '....#ooo#oo#ooo#....',
  '....#####oo#####....',
  '.....####..####.....'
];
const pawPixels = [
  '.###.',
  '#####',
  '#o#o#',
  '#ooo#',
  '.#o#.',
  '.#o#.',
  '.#o#.',
  '##o#.',
  '.##..'
];

const KC=['kf','ks','kt'],BV0=50,BZ=300;
let h=`<defs><radialGradient id="g"><stop offset="0" style="stop-color:var(--glowc)" stop-opacity=".24"/><stop offset="1" style="stop-color:var(--glowc)" stop-opacity="0"/></radialGradient>
<radialGradient id="vig"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient>
<pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".07"/></pattern>
<clipPath id="c"><rect x="128" y="46" width="144" height="150" rx="12"/></clipPath></defs>`;
h+=rbox(0,440,-190,250,0,10,26,4);
h+=`<ellipse id="glow" cx="347" cy="522" rx="240" ry="85" fill="url(#g)"/>`;
// body
projectionWidth = MONITOR_WIDTH;
let m=rbox(100,300,BV0,220,10,BZ,14,6);
m+=pg([[140,172,BZ],[260,172,BZ],[260,190,BZ],[140,190,BZ]],'st');
for(let v=92;v<=132;v+=9)m+=ln([150,v,BZ],[250,v,BZ]);
for(let v=120;v<=180;v+=7)m+=ln([300,v,215],[300,v,265]);
for(let v=190;v<=204;v+=4)m+=ln([300,v,105],[300,v,135]);
m+=box(300,306,184,202,30,70,KC);
let vents='';for(let i=0;i<7;i++)vents+=`<line class="st" x1="${122+i*4.5}" y1="236" x2="${122+i*4.5}" y2="262"/>`;
m+=`<g transform="matrix(${A*MONITOR_WIDTH} ${B*MONITOR_WIDTH} 0 1 ${OX+A*monitorU(0)+C*BV0} ${OY+B*monitorU(0)+D*BV0-BZ})">
<rect class="ff" x="120" y="30" width="160" height="184" rx="14" style="stroke:var(--st2)"/>
<rect x="128" y="46" width="144" height="150" rx="12" style="fill:var(--glass);stroke:var(--st)"/>
<g clip-path="url(#c)"><g id="scr"><rect x="128" y="46" width="144" height="150" fill="var(--phos)"/><rect x="128" y="46" width="144" height="150" fill="url(#scan)"/>
<g id="boot"><rect x="184" y="84" width="32" height="38" rx="5" fill="none" stroke="var(--sink)" stroke-width="2.2"/><rect x="190" y="90" width="20" height="16" rx="3" fill="none" stroke="var(--sink)" stroke-width="1.5"/><rect x="194" y="93" width="2" height="5" fill="var(--sink)"/><rect x="204" y="93" width="2" height="5" fill="var(--sink)"/><path d="M194 100 Q200 105 206 100" fill="none" stroke="var(--sink)" stroke-width="1.4"/><line x1="192" y1="114" x2="208" y2="114" stroke="var(--sink)" stroke-width="1.5"/><text class="tx" x="200" y="146" text-anchor="middle">WELCOME</text></g>
<g id="ui" aria-hidden="true">
  <rect x="128" y="46" width="144" height="150" fill="var(--phos)"/>
  <text class="tx" x="140" y="62" style="font-size:7px;letter-spacing:1px">HELLO.EXE</text>
  <line x1="140" y1="69" x2="260" y2="69" stroke="var(--sink)" stroke-opacity=".2"/>
  <g class="cat-pixels" shape-rendering="crispEdges">
    <g class="cat-reveal">
      <rect x="156" y="182" width="68" height="4" fill="var(--sink)" opacity=".12"/>
      <g class="cat-tail">
        ${pixelSprite(['.####..', '##..##.', '#....#.', '#......', '##.....', '.######', '...####'], 136, 146)}
      </g>
      ${pixelSprite(catPixels, 148, 90)}
      <g class="cat-eyes">
        <rect x="168" y="114" width="8" height="8" fill="var(--sink)"/>
        <rect x="200" y="114" width="8" height="8" fill="var(--sink)"/>
        <rect x="168" y="114" width="4" height="4" fill="var(--phos)"/>
        <rect x="200" y="114" width="4" height="4" fill="var(--phos)"/>
      </g>
      <g class="cat-eyes-closed" fill="var(--sink)">
        <rect x="168" y="118" width="8" height="4"/>
        <rect x="200" y="118" width="8" height="4"/>
      </g>
      <rect x="208" y="154" width="16" height="8" fill="var(--sink)"/>
      <g class="cat-wave">${pixelSprite(pawPixels, 216, 130)}</g>
    </g>
    <g class="cat-speech">
      <path d="M228 74 H256 V78 H260 V98 H256 V102 H236 V106 H228 V102 H224 V78 H228 Z" fill="var(--sink)"/>
      <path d="M228 78 H256 V98 H236 V102 H232 V98 H228 Z" fill="var(--phos)"/>
      ${pixelSprite(['#.#.###.#', '#.#..#..#', '###..#..#', '#.#..#...', '#.#.###.#'], 232, 82, 2)}
    </g>
  </g>
  <rect x="128" y="46" width="144" height="150" fill="url(#scan)" opacity=".65"/>
</g><g id="txt">${[...Array(10)].map((_,i)=>`<text class="tx" id="l${i}" x="136" y="${62+i*13}"></text>`).join('')}</g>
<rect x="128" y="46" width="144" height="150" fill="url(#vig)"/></g></g>
<g id="ln"><rect x="132" y="119" width="136" height="4" fill="#fff" opacity=".18"/><rect x="134" y="120.2" width="132" height="1.8" fill="#fff"/></g>
<polygon points="134,52 196,52 134,116" style="fill:#fff;opacity:.04;stroke:none"/>
${vents}<rect x="196" y="246" width="64" height="8" rx="4" fill="none" stroke="var(--st)"/><circle id="led" cx="272" cy="262" r="2.4"/><circle cx="118" cy="270" r="1.5" fill="var(--st)"/></g>`;
h+=`<g id="mac" role="button" tabindex="0" aria-label="Turn computer off" aria-pressed="true">${m}</g>`;
projectionWidth = 1;
// keyboard
h+=rbox(70,385,-140,-30,10,20,7,3);
const rows=[['1234567890',80,['Backspace',340,370]],['QWERTYUIOP',84],['ASDFGHJKL',90,['Enter',326,372]],['ZXCVBNM,.',98]];
let ks='';
rows.forEach((r,i)=>{const v1=-36-i*20,v0=v1-17;[...r[0]].forEach((c,j)=>{const u=r[1]+j*26;ks+=`<g class="key" data-k="${c}">${box(u,u+22,v0,v1,20,27,KC)}</g>`});
if(r[2])ks+=`<g class="key" data-k="${r[2][0]}">${box(r[2][1],r[2][2],v0,v1,20,27,KC)}</g>`});
ks+=`<g class="key" data-k=" ">${box(130,300,-133,-116,20,27,KC)}</g>`;
h+=`<g id="kb">${ks}</g>`;
// cable
h+=box(385,394,-73,-51,11,23,KC)+box(monitorU(300),monitorU(311),66,84,20,36,KC);
const bz=(t,a)=>{const m=1-t;return [0,1,2].map(i=>m*m*m*a[0][i]+3*m*m*t*a[1][i]+3*m*t*t*a[2][i]+t*t*t*a[3][i])};
const cp=[[394,-62,17],[440,-30,9],[352+monitorU(300)-300,62,9],[monitorU(311),75,28]];
const N=520,TURNS=30,R=4.4,cl=[],co=[];
for(let i=0;i<=N;i++){const t=i/N,c=P(...bz(t,cp)),c1=P(...bz(Math.max(0,t-.004),cp)),c2=P(...bz(Math.min(1,t+.004),cp));
let tx=c2[0]-c1[0],ty=c2[1]-c1[1];const l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;
const a=R*Math.min(1,t*14,(1-t)*14),ph=t*TURNS*6.2832,sn=Math.sin(ph)*a,cs=Math.cos(ph)*a*1.25;
cl.push(c.map(n=>n.toFixed(1)).join(','));
co.push([c[0]-ty*sn+tx*cs,c[1]+tx*sn+ty*cs].map(n=>n.toFixed(1)).join(','))}
const cd='M'+co.join(' L'),cc='M'+cl.join(' L');
h+=`<path d="${cc}" transform="translate(0 4)" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="6" stroke-linecap="round" style="filter:blur(2px)"/><path d="${cd}" fill="none" stroke="var(--ks)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="${cd}" fill="none" stroke="var(--st)" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>`;
$('s').innerHTML=h;


const screen = $('s');
const powerButton = $('mac');
const keyEls = {};
screen.querySelectorAll('.key').forEach(key => { keyEls[key.dataset.k] = key; });
let state = 'off';
let lines = [];
let timers = [];
let demoRunning = false;
let visible = true;

function after(callback, delay) {
  timers.push(window.setTimeout(callback, delay));
}

function clearTimers() {
  timers.forEach(window.clearTimeout);
  timers = [];
  Object.values(keyEls).forEach(key => key.classList.remove('down'));
}

function render() {
  const content = lines.slice(-10);
  for (let i = 0; i < 10; i++) $('l' + i).textContent = content[i] || '';
  if (content.length) {
    const cursor = document.createElementNS(NS, 'tspan');
    cursor.setAttribute('class', 'cur');
    cursor.textContent = '█';
    $('l' + (content.length - 1)).appendChild(cursor);
  }
}

function type(character) {
  if (state !== 'on') return;
  if (!lines.length) lines = ['> '];
  const last = lines.length - 1;
  if (character === 'Backspace') {
    if (lines[last].length > 2) lines[last] = lines[last].slice(0, -1);
  } else if (character === 'Enter') {
    lines.push('> ');
  } else if (lines[last].length >= 20) {
    lines.push('  ' + character.toUpperCase());
  } else {
    lines[last] += character.toUpperCase();
  }
  if (lines.length > 40) lines.shift();
  render();
}

function hit(character) {
  const key = keyEls[character.length === 1 ? character.toUpperCase() : character];
  if (key) {
    key.classList.add('down');
    after(() => key.classList.remove('down'), 100);
  }
  type(character);
}

function stopDemo() {
  if (!demoRunning) return;
  clearTimers();
  demoRunning = false;
  screen.classList.remove('ui');
  lines = ['> '];
  render();
}

function demo() {
  if (state !== 'on' || !visible || document.hidden || reduceMotion) return;
  clearTimers();
  demoRunning = true;
  let delay = 0;
  ['DRAW CAT', 'ADD WAVE', 'SAY HI', 'RUN'].forEach(command => {
    [...command].forEach(character => {
      after(() => hit(character), delay);
      delay += 90;
    });
    after(() => hit('Enter'), delay);
    delay += 260;
  });
  after(() => { lines[lines.length - 1] = 'RENDERING...'; render(); }, delay);
  delay += 700;
  after(() => screen.classList.add('ui'), delay);
  delay += 10000;
  after(() => {
    screen.classList.remove('ui');
    lines = ['> '];
    render();
    demo();
  }, delay);
}

function powerOn() {
  clearTimers();
  state = 'booting';
  powerButton.setAttribute('aria-label', 'Turn computer off');
  powerButton.setAttribute('aria-pressed', 'true');
  screen.classList.add('open');
  function ready() {
    screen.classList.remove('boot');
    screen.classList.add('on');
    state = 'on';
    lines = ['SYSTEM READY.', '', '> '];
    render();
    if (reduceMotion) screen.classList.add('ui');
    else after(demo, 700);
  }
  if (reduceMotion) ready();
  else {
    after(() => screen.classList.add('boot'), 650);
    after(ready, 2200);
  }
}

function powerOff() {
  clearTimers();
  state = 'off';
  demoRunning = false;
  screen.classList.remove('open', 'boot', 'on', 'ui');
  powerButton.setAttribute('aria-label', 'Turn computer on');
  powerButton.setAttribute('aria-pressed', 'false');
}

function togglePower() { state === 'off' ? powerOn() : powerOff(); }

// SVG focus can appear after a pointer click; show outlines only for Tab navigation.
host.addEventListener('pointerdown', () => host.classList.remove('keyboard-focus'), true);
document.addEventListener('keydown', event => {
  if (event.key === 'Tab') host.classList.add('keyboard-focus');
});

powerButton.addEventListener('click', togglePower);
powerButton.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  event.stopPropagation();
  togglePower();
});

// Capture typing only while this illustration has focus.
host.addEventListener('keydown', event => {
  if (event.metaKey || event.ctrlKey || event.altKey || state !== 'on') return;
  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
  if (!keyEls[key]) return;
  event.preventDefault();
  stopDemo();
  screen.classList.remove('ui');
  hit(event.key);
});
$('kb').addEventListener('pointerdown', event => {
  const key = event.target.closest('.key');
  if (!key || state !== 'on') return;
  screen.focus({ preventScroll: true });
  stopDemo();
  screen.classList.remove('ui');
  hit(key.dataset.k);
});

// Pause the looping demo while the hero is off-screen or the tab is hidden.
function updatePlayback() {
  const paused = !visible || document.hidden;
  host.classList.toggle('is-paused', paused);
  if (state !== 'on' || !demoRunning) return;
  clearTimers();
  if (!paused) {
    screen.classList.remove('ui');
    lines = ['> '];
    render();
    demo();
  }
}
new IntersectionObserver(entries => {
  visible = entries[0].isIntersecting;
  updatePlayback();
}).observe(host);
document.addEventListener('visibilitychange', updatePlayback);
powerOn();
})();
