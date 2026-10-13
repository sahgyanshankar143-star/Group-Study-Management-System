// UI HELPERS
// 
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function toggleSB(){const sb=document.getElementById('sidebar'),ov=document.getElementById('sbOverlay');sb.classList.toggle('open');ov.classList.toggle('show',sb.classList.contains('open'));}
function closeSB(){document.getElementById('sidebar').classList.remove('open');document.getElementById('sbOverlay').classList.remove('show');}
function toast(msg,type='ok'){
  const c=document.getElementById('toastWrap');
  const e=document.createElement('div');e.className=`toast ${type==='err'?'err':''}`;
  e.textContent = `${type==='err' ? 'Error: ' : 'Done: '}${msg}`;
  c.appendChild(e);setTimeout(()=>e.remove(),3200);
}
window.addEventListener('click',e=>{if(e.target.classList.contains('modal-overlay'))e.target.classList.remove('open');});

// Init swatches
document.querySelector('.csw')?.style.setProperty('border','3px solid var(--accent2)');
