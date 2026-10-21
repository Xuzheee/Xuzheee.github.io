import { albums, games, photos } from '../data/mori';
import type { Project } from '../data/portfolio';

let toastTimer: ReturnType<typeof setTimeout>;
function announce(message: string) {
  const toast = document.querySelector<HTMLElement>('.m-toast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}
async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); announce('已复制到剪贴板'); }
  catch { announce('复制未成功，请长按或选中文字复制'); }
}
function initializeMori() {
document.addEventListener('click', event => {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-copy]') : null;
  if (target?.dataset.copy) void copyText(target.dataset.copy);
});

// Pointer gestures never navigate. The same state is available to keyboard users.
function swipe(element: HTMLElement, onSwipe: (direction: number) => void) {
  let startX = 0, startY = 0, pointer: number | null = null, moved = false;
  element.addEventListener('pointerdown', e => { if (e.button !== 0) return; startX=e.clientX; startY=e.clientY; pointer=e.pointerId; moved=false; });
  element.addEventListener('pointermove', e => { if(pointer===e.pointerId && Math.abs(e.clientX-startX)>12) moved=true; });
  const finish = (e: PointerEvent) => {
    if(pointer!==e.pointerId) return;
    pointer=null;
    const dx=e.clientX-startX, dy=e.clientY-startY;
    if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)) { onSwipe(dx<0?1:-1); moved=true; }
  };
  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', ()=>{pointer=null; moved=false;});
  element.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false;}},true);
  element.addEventListener('dragstart',e=>e.preventDefault());
}

const gameArea=document.querySelector<HTMLElement>('[data-games]');
if(gameArea){
  let current=1;
  const select=(index:number)=>{
    current=(index+games.length)%games.length;
    gameArea.querySelectorAll<HTMLElement>('[data-game]').forEach(button=>{
      const i=Number(button.dataset.game), active=i===current;
      button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));
      let position=(i-current+games.length)%games.length;if(position>1) position-=games.length;
      button.dataset.position=String(position);
    });
    gameArea.querySelector<HTMLAnchorElement>('[data-game-link]')!.href=games[current].url;
    gameArea.querySelector('[data-game-counter]')!.textContent=`0${current+1} / 03`;
  };
  gameArea.querySelectorAll<HTMLElement>('[data-game]').forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.game))));
  gameArea.querySelector('[data-game-prev]')?.addEventListener('click',()=>select(current-1));
  gameArea.querySelector('[data-game-next]')?.addEventListener('click',()=>select(current+1));
  gameArea.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();select(current+(e.key==='ArrowRight'?1:-1));}});
  swipe(gameArea.querySelector('[data-game-stage]')!,direction=>select(current+direction));
  const requested=games.findIndex(game=>game.id===new URLSearchParams(location.search).get('game'));if(requested>=0) select(requested);
}
const music=document.querySelector<HTMLElement>('[data-music]');
if(music){
  const select=(index:number)=>{
    const album=albums[index];
    music.querySelectorAll<HTMLElement>('[data-album]').forEach(button=>{const active=Number(button.dataset.album)===index;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));});
    const cover=music.querySelector<HTMLImageElement>('[data-album-cover]')!;cover.src=album.image;cover.alt=`${album.title} 专辑封面`;
    music.querySelector('[data-album-title]')!.textContent=album.title;music.querySelector('[data-album-artist]')!.textContent=album.artist;
    music.querySelector<HTMLAnchorElement>('[data-album-link]')!.href=album.url;
  };
  music.querySelectorAll<HTMLElement>('[data-album]').forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.album))));
  const requested=albums.findIndex(album=>album.id===new URLSearchParams(location.search).get('album'));if(requested>=0) select(requested);
}
const sleeves=document.querySelector<HTMLElement>('[data-sleeves]');
if(sleeves){let selected=0;const links=[...sleeves.querySelectorAll<HTMLElement>('[data-sleeve]')];const select=(i:number)=>{selected=(i+3)%3;links.forEach((link,index)=>link.classList.toggle('is-selected',index===selected));};swipe(sleeves,d=>select(selected+d));links.forEach((link,i)=>{link.addEventListener('pointerenter',()=>select(i));link.addEventListener('focus',()=>select(i));});}

const lightbox=document.querySelector<HTMLDialogElement>('.m-lightbox');
if(lightbox){
  let current=0;let opener:HTMLElement|null=null;
  const select=(index:number)=>{current=(index+photos.length)%photos.length;const photo=photos[current];const img=lightbox.querySelector<HTMLImageElement>('[data-photo-full]')!;img.src=photo.src;img.alt=photo.alt;lightbox.querySelector('[data-photo-caption]')!.textContent=photo.title;lightbox.querySelector('[data-photo-counter]')!.textContent=`${current+1} / ${photos.length}`;};
  document.querySelectorAll<HTMLElement>('[data-photo]').forEach(button=>button.addEventListener('click',()=>{opener=button;select(Number(button.dataset.photo));lightbox.showModal();document.body.classList.add('has-dialog');}));
  lightbox.querySelector('[data-photo-close]')?.addEventListener('click',()=>lightbox.close());
  lightbox.querySelector('[data-photo-prev]')?.addEventListener('click',()=>select(current-1));
  lightbox.querySelector('[data-photo-next]')?.addEventListener('click',()=>select(current+1));
  lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();select(current+(e.key==='ArrowRight'?1:-1));}});
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close();});
  lightbox.addEventListener('close',()=>{document.body.classList.remove('has-dialog');opener?.focus();});
  swipe(lightbox.querySelector('[data-photo-full]')!,d=>select(current+d));
}

const archive=document.querySelector<HTMLElement>('[data-archive]');
if(archive){
  const preview=archive.querySelector<HTMLImageElement>('.m-archive-preview')!;
  archive.querySelectorAll<HTMLElement>('.m-archive-entry').forEach(entry=>{
    const show=()=>{preview.src=entry.dataset.preview!;preview.alt=`${entry.querySelector('h4')?.textContent} 项目预览`;preview.style.top=`${Math.max(250,entry.offsetTop-30)}px`;};
    entry.addEventListener('pointerenter',show);entry.addEventListener('focusin',show);
  });
  archive.querySelectorAll<HTMLElement>('[data-archive-view]').forEach(button=>button.addEventListener('click',()=>{archive.classList.toggle('is-browse',button.dataset.archiveView==='browse');archive.querySelectorAll<HTMLElement>('[data-archive-view]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));}));
  const dialog=document.querySelector<HTMLDialogElement>('.m-project-dialog')!;
  const data=JSON.parse(document.querySelector('#m-project-data')!.textContent!) as Project[];
  document.querySelectorAll<HTMLElement>('[data-project-open]').forEach(button=>button.addEventListener('click',()=>{
    const project=data.find(p=>p.id===button.dataset.projectOpen);if(!project)return;
    const content=dialog.querySelector('[data-project-content]')!;content.replaceChildren();
    const title=document.createElement('h2');title.id='project-dialog-title';title.textContent=project.title;content.append(title);
    for(const text of [project.role,project.description,project.result]){const p=document.createElement('p');p.textContent=text;content.append(p);}
    if(project.miniProgram){const token=document.createElement('button');token.className='m-button';token.textContent='复制小程序口令';token.addEventListener('click',()=>copyText(project.miniProgram!.token));content.append(token);const note=document.createElement('p');note.textContent=project.miniProgram.token;note.className='m-token';content.append(note);for(const shot of project.miniProgram.screenshots){const img=document.createElement('img');img.src=shot.src;img.alt=shot.caption;content.append(img);}}
    dialog.showModal();document.body.classList.add('has-dialog');
  }));
  dialog.querySelector('[data-project-close]')?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>document.body.classList.remove('has-dialog'));
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
}
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeMori, {once:true});
else initializeMori();
