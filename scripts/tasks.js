//  Kanban
const COLS=[
  {s:'upcoming',l:'Upcoming',c:'var(--upcoming)'},
  {s:'inprogress',l:'In Progress',c:'var(--inprog)'},
  {s:'review',l:'Review',c:'var(--review)'},
  {s:'done',l:'Done',c:'var(--done)'},
];
function renderKanban(cid,tasks,addBtn=true){
  const c=document.getElementById(cid);if(!c)return;
  c.innerHTML='';
  COLS.forEach(col=>{
    const ct=tasks.filter(t=>t.status===col.s);
    const d=document.createElement('div');d.className='k-col';
    d.innerHTML=`<div class="k-head"><div class="k-title"><div class="k-dot" style="background:${col.c}"></div>${col.l}</div><div class="k-cnt">${ct.length}</div></div>
    <div class="k-body">${ct.map(renderCard).join('')}${ct.length===0?'<div style="padding:16px;text-align:center;font-size:12px;color:var(--text3);"> No tasks</div>':''}</div>
    ${addBtn?`<button class="add-task-b" onclick="openAddTaskStatus('${col.s}')">+ Add task</button>`:''}`;
    c.appendChild(d);
  });
}
function renderCard(t){
  const avs=t.assignees.slice(0,3).map(id=>{const m=gMembers().find(m=>m.id===id);return m?`<div class="mav" style="background:${m.color}">${m.name[0]}</div>`:''}).join('');
  const due=t.due?new Date(t.due):null;
  const ov=due&&due<new Date()&&t.status!=='done';
  const ds=due?due.toLocaleDateString('en-IN',{month:'short',day:'numeric'}):'';
  const sc=subColor(t.subject)||'#888';
  return `<div class="task-card tc-${t.status}" onclick="showDetail(${t.id})">
    <div class="t-title">${t.title}</div>
    ${t.desc?`<div class="t-desc">${t.desc.substring(0,65)}${t.desc.length>65?'...':''}</div>`:''}
    <div class="t-meta"><span class="t-tag" style="background:${sc}22;color:${sc}">${subLabel(t.subject)||t.subject}</span>
      <span class="t-pri pri-${t.priority[0]}">${t.priority==='high'?'High':t.priority==='medium'?'Medium':'Low'}</span></div>
    ${t.progress>0?`<div class="pbar"><div class="pfill" style="width:${t.progress}%;background:${t.status==='done'?'var(--done)':t.status==='inprogress'?'var(--inprog)':'var(--upcoming)'}"></div></div>`:''}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:7px;">
      <div class="t-avs">${avs}</div>
      ${ds?`<div class="t-due ${ov?'ov':''}">Due: ${ds}${ov?' (Overdue)':''}</div>`:''}
    </div>
  </div>`;
}
function renderDashKanban(){renderKanban('dashKanban',gTasks(),false);}
function renderFullKanban(){renderKanban('fullKanban',gTasks(),true);}
function filterTasks(m){
  ['all','mine'].forEach(x=>{const e=document.getElementById('f-'+x);if(e)e.style.borderColor='';});
  document.getElementById('f-'+m).style.borderColor='var(--accent)';
  if(m==='all')renderKanban('fullKanban',gTasks(),true);
  else renderKanban('fullKanban',gTasks().filter(t=>t.assignees.includes(CU.memberId)),true);
}
function handleSearch(){
  const q=document.getElementById('searchInput').value.toLowerCase();
  if(!q){renderFullKanban();return;}
  renderKanban('fullKanban',gTasks().filter(t=>t.title.toLowerCase().includes(q)||(t.desc||'').toLowerCase().includes(q)),false);
}

//  Task Detail
function showDetail(tid){
  const t=gTasks().find(t=>t.id===tid);if(!t)return;
  const sc=subColor(t.subject)||'#888';
  const ds=t.due?new Date(t.due).toLocaleDateString('en-IN',{weekday:'short',year:'numeric',month:'short',day:'numeric'}):'Not set';
  const isAdmin=CU.role==='admin';
  document.getElementById('detailBody').innerHTML=`
    <h3 style="font-size:17px;margin-bottom:10px;">${t.title}</h3>
    <p style="font-size:13px;color:var(--text2);margin-bottom:14px;">${t.desc||'No description'}</p>
    <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px;">
      <span class="badge b-${t.status}">${ST_LABELS[t.status]}</span>
      <span style="background:${sc}22;color:${sc};padding:3px 9px;border-radius:20px;font-size:10px;font-weight:600;">${subLabel(t.subject)}</span>
      <span class="t-pri pri-${t.priority[0]}" style="font-size:12px;">${t.priority==='high'?'High':t.priority==='medium'?'Medium':'Low'}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
      <div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:4px;">Due</div><div style="font-size:13px;">${ds}</div></div>
      <div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:4px;">Progress</div><div style="font-size:13px;">${t.progress}%</div><div class="pbar" style="margin-top:5px;height:5px;"><div class="pfill" style="width:${t.progress}%;background:var(--accent)"></div></div></div>
    </div>
    <div style="margin-bottom:14px;"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:7px;">Assigned To</div>
      <div style="display:flex;gap:7px;flex-wrap:wrap;">${t.assignees.map(id=>{const m=gMembers().find(m=>m.id===id);return m?`<div style="display:flex;align-items:center;gap:5px;background:var(--surface2);padding:5px 11px;border-radius:20px;font-size:12px;"><div class="mav" style="background:${m.color};width:20px;height:20px;font-size:9px;">${m.name[0]}</div>${m.name}</div>`:''}).join('')}</div>
    </div>
    <div style="margin-bottom:13px;"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:7px;">Update Status</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">${['upcoming','inprogress','review','done'].map(s=>`<button class="btn btn-ghost btn-sm" onclick="chgStatus(${t.id},'${s}')" style="${t.status===s?'background:var(--accent);color:#fff;border-color:var(--accent);':''}">${ST_LABELS[s]}</button>`).join('')}</div>
    </div>
    <div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:5px;">Update Progress</div>
      <div style="display:flex;align-items:center;gap:10px;"><input type="range" min="0" max="100" value="${t.progress}" style="flex:1;accent-color:var(--accent);" oninput="document.getElementById('dpv').textContent=this.value+'%';updProg(${t.id},+this.value)"><span id="dpv" style="font-size:12px;font-weight:600;color:var(--accent);width:38px;">${t.progress}%</span></div>
    </div>`;
  document.getElementById('detailFoot').innerHTML=`
    ${isAdmin?`<button class="btn btn-danger btn-sm" onclick="delTask(${t.id})">Delete</button>`:''}
    <button class="btn btn-ghost" onclick="closeModal('detailModal')">Close</button>
    <button class="btn btn-primary" onclick="openEditTask(${t.id})">Edit</button>`;
  openModal('detailModal');
}
function chgStatus(tid,s){
  const t=gTasks().find(t=>t.id===tid);if(!t)return;
  t.status=s;if(s==='done')t.progress=100;
  addActivity(`"${t.title.substring(0,30)}" -> ${ST_LABELS[s]}`);
  saveDB();toast('Status updated!');showDetail(tid);renderPage(getCurPage());
}
function updProg(tid,v){const t=gTasks().find(t=>t.id===tid);if(!t)return;t.progress=v;if(v===100&&t.status!=='done')t.status='done';saveDB();}
function delTask(tid){
  if(!confirm('Delete this task?'))return;
  DB.tasks=DB.tasks.filter(t=>t.id!==tid);saveDB();
  closeModal('detailModal');toast('Deleted');renderPage(getCurPage());
}
function openEditTask(tid){
  closeModal('detailModal');
  const t=gTasks().find(t=>t.id===tid);if(!t)return;
  document.getElementById('taskModalTitle').textContent='Edit Task';
  document.getElementById('editTaskId').value=tid;
  document.getElementById('t-title').value=t.title;
  document.getElementById('t-desc').value=t.desc||'';
  document.getElementById('t-status').value=t.status;
  document.getElementById('t-priority').value=t.priority;
  document.getElementById('t-subject').value=t.subject;
  document.getElementById('t-due').value=t.due||'';
  document.getElementById('t-prog').value=t.progress;
  document.getElementById('t-progval').textContent=t.progress+'%';
  populateSubjectSelects(t.subject);
  populateAssign(t.assignees);
  openModal('taskModal');
}

//  Task Modal
function openAddTaskModal(){
  document.getElementById('taskModalTitle').textContent='Add Task';
  document.getElementById('editTaskId').value='';
  document.getElementById('t-title').value='';
  document.getElementById('t-desc').value='';
  document.getElementById('t-status').value='upcoming';
  document.getElementById('t-priority').value='medium';
  document.getElementById('t-due').value='';
  document.getElementById('t-prog').value=0;
  document.getElementById('t-progval').textContent='0%';
  populateSubjectSelects();
  populateAssign([]);
  openModal('taskModal');
}
function openAddTaskStatus(s){openAddTaskModal();document.getElementById('t-status').value=s;}
function populateAssign(sel=[]){
  const el=document.getElementById('t-assign');
  el.innerHTML=gMembers().map(m=>`<option value="${m.id}"${sel.includes(m.id)?' selected':''}>${m.name}${m.role==='admin'?' (Admin)':''}</option>`).join('');
}
function saveTask(){
  const title=document.getElementById('t-title').value.trim();
  if(!title){toast('Enter a title','err');return;}
  const eid=document.getElementById('editTaskId').value;
  const assignees=Array.from(document.getElementById('t-assign').selectedOptions).map(o=>+o.value);
  const data={title,desc:document.getElementById('t-desc').value,status:document.getElementById('t-status').value,priority:document.getElementById('t-priority').value,subject:document.getElementById('t-subject').value,due:document.getElementById('t-due').value,assignees:assignees.length?assignees:[CU.memberId],progress:+document.getElementById('t-prog').value,groupId:CU.groupId};
  if(eid){Object.assign(gTasks().find(t=>t.id===+eid),data);toast('Task updated!');}
  else{data.id=++nxId;DB.tasks.push(data);addActivity(`New task: "${title.substring(0,35)}"`);toast('Task added!');}
  saveDB();closeModal('taskModal');renderPage(getCurPage());
}

