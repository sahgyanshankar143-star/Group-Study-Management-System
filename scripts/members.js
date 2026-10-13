//  Members
function renderMembers(){
  const grid=document.getElementById('membersGrid');if(!grid)return;
  const isAdmin=CU.role==='admin';
  const members=gMembers();
  grid.innerHTML=members.map(m=>{
    const tasks=gTasks().filter(t=>t.assignees.includes(m.id));
    const done=tasks.filter(t=>t.status==='done').length;
    const rate=tasks.length?Math.round((done/tasks.length)*100):0;
    return `<div class="member-card">
      <div class="${m.online?'online-dot':'online-dot offline-dot'}"></div>
      <div class="mem-av" style="background:${m.color};border:3px solid ${m.online?'var(--accent2)':'var(--border)'}">${m.name[0]}</div>
      <div class="mem-name">${m.name}</div>
      <div class="role-badge ${m.role==='admin'?'rb-admin':'rb-member'}">${m.role==='admin'?'Admin':'Member'}</div>
      <div style="font-size:12px;color:var(--text3);">${m.email||''}</div>
      <div style="font-size:11px;color:var(--accent2);margin-top:3px;">${subLabel(m.specialty)}</div>
      <div class="mem-stats"><div><div class="msv">${tasks.length}</div><div class="msl">Assigned</div></div><div><div class="msv">${done}</div><div class="msl">Done</div></div><div><div class="msv">${rate}%</div><div class="msl">Rate</div></div></div>
      ${isAdmin&&m.id!==CU.memberId?`<div style="margin-top:10px;display:flex;gap:6px;justify-content:center;"><button class="btn btn-danger btn-sm" onclick="removeMember(${m.id})">Remove</button></div>`:''}
    </div>`;
  }).join('');
}
function openAddMemberModal(){if(CU.role!=='admin'){toast('Admin only','err');return;}document.getElementById('memErr').style.display='none';openModal('memberModal');}
function addMemberByAdmin(){
  const err=document.getElementById('memErr');err.style.display='none';
  const name=document.getElementById('m-name').value.trim();
  const username=document.getElementById('m-user').value.trim();
  const email=document.getElementById('m-email').value.trim().toLowerCase();
  const pass=document.getElementById('m-pass').value.trim();
  if(!name||!username||!email||!pass){err.textContent='All fields required.';err.style.display='block';return;}
  if(DB.accounts.find(a=>a.email===email)){err.textContent='Email already registered.';err.style.display='block';return;}
  if(DB.accounts.find(a=>a.username.toLowerCase()===username.toLowerCase())){err.textContent='Username taken.';err.style.display='block';return;}
  const mid=++nxId,aid=++nxId;
  const color=document.getElementById('m-color').value;
  const role=document.getElementById('m-role').value;
  DB.members.push({id:mid,name,role,email,specialty:document.getElementById('m-spec').value,color,online:false,groupId:CU.groupId});
  DB.accounts.push({id:aid,name,username,email,password:pass,role,memberId:mid,groupId:CU.groupId});
  saveDB();
  toast(`${name} added! Login: ${username} / ${pass}`);
  closeModal('memberModal');renderMembers();updateStats();
  ['m-name','m-user','m-email','m-pass'].forEach(id=>document.getElementById(id).value='');
}
function removeMember(id){
  if(CU.role!=='admin')return;
  if(!confirm('Remove this member?'))return;
  DB.members=DB.members.filter(m=>m.id!==id);
  DB.accounts=DB.accounts.filter(a=>a.memberId!==id);
  DB.tasks.forEach(t=>{t.assignees=t.assignees.filter(a=>a!==id);});
  saveDB();toast('Member removed');renderMembers();updateStats();
}
let selColor='linear-gradient(135deg,#7c6dfa,#00e5b0)';
function pickColor(el){
  selColor=el.dataset.color;
  document.querySelectorAll('.csw').forEach(s=>s.style.border='3px solid transparent');
  el.style.border='3px solid var(--accent2)';
  document.getElementById('m-color').value=selColor;
}

