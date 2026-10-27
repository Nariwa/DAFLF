/* Semantic motion: flowing copies, crossing out equality, arriving messages. */
(()=>{'use strict';
const NS='http://www.w3.org/2000/svg',done=new WeakSet(),reduced=matchMedia('(prefers-reduced-motion: reduce)'),loops=[];
function node(tag,attrs){const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e}
const watcher=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{target.dataset.motionVisible=String(isIntersecting);sync()}));
function sync(){for(const {el,animation}of loops){if(reduced.matches){animation.cancel();continue}if(el.dataset.motionVisible==='true'&&!document.hidden)animation.play();else animation.pause()}}
function loop(el,frames,options){const animation=el.animate(frames,{...options,iterations:Infinity});animation.pause();loops.push({el,animation});watcher.observe(el)}
function prepare(){const svg=[...document.querySelectorAll('.layout')].find(s=>getComputedStyle(s).display!=='none');if(!svg||done.has(svg))return;done.add(svg);const mobile=svg.classList.contains('mobile'),prefix=mobile?'mobile-':'desktop-';
// Rebuild the exported dash fragments as continuous paths so dashoffset can flow.
const dash=document.getElementById(prefix+'Vector_'+(mobile?130:70));if(dash){dash.setAttribute('d',mobile?'M130.186 10073.9H149.93 M149.93 10073.9V9989.27H186.599 M149.93 10073.9H186.599 M149.93 10073.9V10158.5H186.599':'M765 8418H789.5 M789.5 8418V8313H835 M789.5 8418H835 M789.5 8418V8523H835');dash.setAttribute('fill','none');dash.setAttribute('stroke-dasharray',mobile?'3 4':'4 5');dash.dataset.feature='flow';loop(dash,[{strokeDashoffset:'0'},{strokeDashoffset:mobile?'-14':'-18'}],{duration:1600,easing:'linear'})}
// Keep the mathematical glyph accessible; draw its slash as a separate vector.
const sign=[...svg.querySelectorAll('text')].find(t=>t.textContent.trim()==='≠');if(sign){const b=sign.getBBox(),size=Number(sign.getAttribute('font-size'));const sp=sign.querySelector('tspan');sp.textContent='=';sign.setAttribute('aria-label','не равно');sign.dataset.feature='equality';const slash=node('path',{d:`M${b.x+b.width*.29} ${b.y+b.height*.91}L${b.x+b.width*.72} ${b.y+b.height*.12}`,stroke:sign.getAttribute('fill'),'stroke-width':size*.075,'stroke-linecap':'butt',fill:'none',pathLength:1,'stroke-dasharray':1,'aria-hidden':'true','data-feature':'slash'});sign.after(slash);loop(slash,[{strokeDashoffset:1,offset:0},{strokeDashoffset:1,offset:.15},{strokeDashoffset:0,offset:.42},{strokeDashoffset:0,offset:.86},{strokeDashoffset:1,offset:1}],{duration:4200,easing:'cubic-bezier(.4,0,.2,1)'})}
// Bubble, text and tail arrive together, preserving their original coordinates.
for(const [i,id]of (mobile?[113,118]:[50,55]).entries()){const bg=document.getElementById(prefix+'Vector_'+id);if(!bg)continue;const b=bg.getBBox();const parts=[...svg.querySelectorAll('path,text')].filter(el=>{if(el.closest('defs'))return false;const r=el.getBBox();return r.width&&r.height&&r.x>=b.x-1&&r.y>=b.y-1&&r.x+r.width<=b.x+b.width+1&&r.y+r.height<=b.y+b.height+12});const group=node('g',{'data-message':i,'data-feature':'message'});svg.append(group);parts.forEach(el=>group.append(el))}
}
document.fonts.ready.then(prepare);addEventListener('resize',()=>setTimeout(prepare,110));document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
})();
