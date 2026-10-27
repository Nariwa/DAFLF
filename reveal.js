/* Reveal content only after it reaches the reading area; surfaces stay opaque. */
(()=>{'use strict';
const preference=matchMedia('(prefers-reduced-motion: reduce)'),prepared=new WeakSet(),pending=new Map(),running=new Map();
function finish(el){el.style.removeProperty('opacity');el.dataset.revealed='true';pending.delete(el)}
function show(el,instant=false){const observer=pending.get(el);if(!observer)return;observer.unobserve(el);pending.delete(el);
if(instant||preference.matches||!el.animate){finish(el);return}
const mobile=el.closest('.mobile')!==null,kind=el.dataset.revealKind;
const animation=el.animate([{opacity:0,translate:kind==='message'?'0 18px':'0 10px'},{opacity:1,translate:'0 0'}],{duration:mobile?1250:900,delay:kind==='message'?Number(el.dataset.message)*260:kind==='heading'?0:100,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});running.set(el,animation);
animation.onfinish=()=>{finish(el);animation.cancel();running.delete(el)};animation.oncancel=()=>{finish(el);running.delete(el)};
}
function prepare(){const svg=[...document.querySelectorAll('.layout')].find(el=>getComputedStyle(el).display!=='none');if(!svg||prepared.has(svg)||preference.matches)return;prepared.add(svg);if(!('IntersectionObserver'in window))return;
const mobile=svg.classList.contains('mobile');const observer=new IntersectionObserver(entries=>entries.filter(e=>e.isIntersecting).forEach(e=>show(e.target)),{threshold:0,rootMargin:`0px 0px -${Math.round(innerHeight*(mobile?.23:.12))}px 0px`});
const targets=[...svg.querySelectorAll('text')].filter(t=>!t.closest('.interactive,[data-feature]')).map(el=>({el,kind:Number(el.getAttribute('font-size'))>=(mobile?28:42)?'heading':'copy'}));
svg.querySelectorAll('[data-message]').forEach(el=>targets.push({el,kind:'message'}));
for(const {el,kind}of targets){const r=el.getBoundingClientRect();if(!r.width||!r.height)continue;el.dataset.revealKind=kind;if(r.bottom<0){finish(el);continue}el.style.opacity='0';pending.set(el,observer);observer.observe(el)}
}
function revealAll(){for(const el of [...pending.keys()])show(el,true);for(const a of [...running.values()])a.cancel()}
// Keyboard navigation and browser find must never land on invisible content.
document.addEventListener('focusin',e=>{for(const el of pending.keys())if(el===e.target||el.contains(e.target)||e.target.contains(el))show(el,true)});
preference.addEventListener('change',()=>preference.matches?revealAll():prepare());addEventListener('beforeprint',revealAll);addEventListener('pagehide',revealAll);
let timer;addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(prepare,200)});
document.fonts.ready.then(()=>requestAnimationFrame(()=>requestAnimationFrame(prepare)));
})();
