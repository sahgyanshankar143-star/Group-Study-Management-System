//  Resources
function renderRes(){
  const el=document.getElementById('resList');if(!el)return;
  const isAdmin=CU.role==='admin';
  const res=gRes();const icons={pdf:'PDF',video:'VIDEO',link:'LINK',notes:'NOTES'};
  const byS={};res.forEach(r=>{if(!byS[r.subject])byS[r.subject]=[];byS[r.subject].push(r);});
  el.innerHTML=Object.keys(byS).map(s=>`<div style="margin-bottom:20px;">
    <div class="sec-title" style="margin-bottom:10px;"><span>${subLabel(s)}</span></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:11px;">
      ${byS[s].map(r=>`<div class="panel" style="padding:14px;cursor:pointer;" onclick="if('${r.url}'!='#')window.open('${r.url}','_blank')">
        <div style="font-size:26px;margin-bottom:7px;">${icons[r.type]||''}</div>
        <div style="font-size:13px;font-weight:600;margin-bottom:3px;">${r.name}</div>
        <div style="font-size:11px;color:var(--text3);">By ${r.addedBy}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:9px;">
          <span style="font-size:10px;background:var(--surface3);padding:2px 7px;border-radius:20px;color:var(--text2);">${r.type.toUpperCase()}</span>
          ${isAdmin?`<button class="btn btn-danger btn-sm" onclick="event.stopPropagation();delRes(${r.id})">Delete</button>`:''}
        </div>
      </div>`).join('')}
    </div>
  </div>`).join('')||'<div style="text-align:center;color:var(--text3);padding:30px;font-size:13px;">No resources yet</div>';
}
function addRes(){
  const name=document.getElementById('r-name').value.trim();
  if(!name){toast('Enter name','err');return;}
  DB.resources.push({id:++nxId,name,type:document.getElementById('r-type').value,subject:document.getElementById('r-sub').value,url:document.getElementById('r-url').value||'#',addedBy:CU.name?.split(' ')[0]||'You',groupId:CU.groupId});
  saveDB();toast('Added!');closeModal('resModal');renderRes();
  document.getElementById('r-name').value='';document.getElementById('r-url').value='';
}
function delRes(id){DB.resources=DB.resources.filter(r=>r.id!==id);saveDB();renderRes();toast('Deleted');}

//  Activity
function addActivity(text){
  const el=document.getElementById('actList');if(!el)return;
  const d=document.createElement('div');d.className='act-item';
  d.innerHTML=`<div class="act-dot" style="background:var(--accent)"></div><div><div class="act-txt">${text}</div><div class="act-time">Just now</div></div>`;
  el.insertBefore(d,el.firstChild);
  while(el.children.length>8)el.removeChild(el.lastChild);
}

// 
