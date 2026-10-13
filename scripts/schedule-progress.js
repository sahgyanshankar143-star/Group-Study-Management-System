//  Schedule
function renderSchedule(){
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const today=(new Date().getDay()+6)%7;
  const grid=document.getElementById('schedGrid');if(!grid)return;
  const isAdmin=CU.role==='admin';
  document.getElementById('addSessBtn').style.display=isAdmin?'flex':'none';
  grid.innerHTML=days.map((d,i)=>{
    const ss=gSess().filter(s=>s.day===i);
    return `<div class="day-col"><div class="day-hd ${today===i?'today':''}">${d}${today===i?' (Today)':''}</div>
      <div class="day-bd">${ss.map(s=>`<div class="sched-item" style="background:${subColor(s.subject)||'#888'}22;color:${subColor(s.subject)||'#888'}">${s.time} ${s.title}</div>`).join('')||'<div style="font-size:10px;color:var(--text3);text-align:center;padding:8px;">Free</div>'}</div>
    </div>`;
  }).join('');
}
function renderDeadlines(){
  const el=document.getElementById('deadlinesList');if(!el)return;
  const up=gTasks().filter(t=>t.due&&t.status!=='done').sort((a,b)=>new Date(a.due)-new Date(b.due)).slice(0,5);
  if(!up.length){el.innerHTML='<div style="text-align:center;color:var(--text3);padding:20px;">No upcoming deadlines</div>';return;}
  el.innerHTML=up.map(t=>{
    const d=new Date(t.due),diff=Math.ceil((d-new Date())/86400000);
    const uc=diff<=3?'var(--accent3)':diff<=7?'var(--upcoming)':'var(--text2)';
    return `<div style="display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px solid var(--border);">
      <div style="width:44px;text-align:center;background:var(--surface2);border-radius:8px;padding:5px;"><div style="font-size:15px;font-weight:800;color:${uc};">${d.getDate()}</div><div style="font-size:9px;color:var(--text3);">${d.toLocaleDateString('en',{month:'short'})}</div></div>
      <div style="flex:1;"><div style="font-size:13px;font-weight:600;">${t.title}</div><div style="font-size:11px;color:var(--text2);">${subLabel(t.subject)}</div></div>
      <div style="font-size:12px;color:${uc};font-weight:600;">${diff<=0?'Overdue!':diff===1?'Tomorrow':`${diff}d`}</div>
    </div>`;
  }).join('');
}
function addSession(){
  const title=document.getElementById('ss-title').value.trim();
  if(!title){toast('Enter title','err');return;}
  DB.sessions.push({id:++nxId,title,day:+document.getElementById('ss-day').value,time:document.getElementById('ss-time').value,subject:document.getElementById('ss-sub').value,groupId:CU.groupId});
  saveDB();toast('Session added!');closeModal('sessionModal');renderSchedule();
  document.getElementById('ss-title').value='';
}

//  Progress
function renderProgress(){
  const tasks=gTasks(),members=gMembers();
  const lb=document.getElementById('leaderboard');
  if(lb){
    const scores=members.map(m=>({...m,done:tasks.filter(t=>t.assignees.includes(m.id)&&t.status==='done').length,total:tasks.filter(t=>t.assignees.includes(m.id)).length})).sort((a,b)=>(b.done*10+b.total*2)-(a.done*10+a.total*2));
    lb.innerHTML=scores.map((m,i)=>`<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">
      <div style="font-size:16px;width:22px;text-align:center;">${i+1}</div>
      <div class="av" style="width:32px;height:32px;font-size:12px;background:${m.color}">${m.name[0]}</div>
      <div style="flex:1;"><div style="font-size:13px;font-weight:600;">${m.name}</div><div style="font-size:11px;color:var(--text2);">${m.done}/${m.total} done</div></div>
      <div style="font-weight:800;font-family:'Syne',sans-serif;color:var(--accent);font-size:14px;">${m.done*10+m.total*2}pts</div>
    </div>`).join('');
  }
  const sb=document.getElementById('subBreakdown');
  if(sb){
    const subs=[...new Set(tasks.map(t=>t.subject))];
    sb.innerHTML=subs.map(s=>{
      const total=tasks.filter(t=>t.subject===s).length,done=tasks.filter(t=>t.subject===s&&t.status==='done').length;
      const pct=total?Math.round((done/total)*100):0;
      return `<div class="sub-row"><div class="sub-name">${subLabel(s)}</div><div class="sub-bar"><div class="sub-fill" style="width:${pct}%;background:${subColor(s)||'#888'}"></div></div><div class="sub-pct">${pct}%</div></div>`;
    }).join('');
  }
  const ts=document.getElementById('taskSummary');
  if(ts){
    if(!tasks.length){ts.innerHTML='<div style="text-align:center;color:var(--text3);padding:20px;">No tasks yet</div>';return;}
    ts.innerHTML=`<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead><tr style="border-bottom:2px solid var(--border);">${['Task','Subject','Status','Priority','Due','Assignees'].map(h=>`<th style="padding:9px 8px;text-align:left;color:var(--text3);font-weight:600;">${h}</th>`).join('')}</tr></thead>
      <tbody>${tasks.map(t=>`<tr style="border-bottom:1px solid var(--border);">
        <td style="padding:9px 8px;font-weight:500;">${t.title}</td>
        <td style="padding:9px 8px;">${subLabel(t.subject)||t.subject}</td>
        <td style="padding:9px 8px;"><span class="badge b-${t.status}">${ST_LABELS[t.status]}</span></td>
        <td style="padding:9px 8px;" class="t-pri pri-${t.priority[0]}">${t.priority}</td>
        <td style="padding:9px 8px;color:var(--text2);">${t.due||'-'}</td>
        <td style="padding:9px 8px;">${t.assignees.map(id=>{const m=members.find(m=>m.id===id);return m?m.name.split(' ')[0]:'?'}).join(', ')}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  }
}

//  Subject Progress
function renderSubProg(){
  const c=document.getElementById('subjectProg');if(!c)return;
  const tasks=gTasks();
  const subs=[...new Set(tasks.map(t=>t.subject))];
  if(!subs.length){c.innerHTML='<div style="font-size:12px;color:var(--text3);">Add tasks to see subject progress</div>';return;}
  c.innerHTML=subs.map(s=>{
    const total=tasks.filter(t=>t.subject===s).length,done=tasks.filter(t=>t.subject===s&&t.status==='done').length;
    const pct=total?Math.round((done/total)*100):0;
    return `<div class="sub-row"><div class="sub-name" style="font-size:11px;">${subLabel(s)}</div><div class="sub-bar"><div class="sub-fill" style="width:${pct}%;background:${subColor(s)||'#888'}"></div></div><div class="sub-pct">${pct}%</div></div>`;
  }).join('');
}

//  Announcements
function renderAnn(){
  const el=document.getElementById('annList');if(!el)return;
  const isAdmin=CU.role==='admin';
  document.getElementById('addAnnBtn').style.display=isAdmin?'flex':'none';
  const ann=gAnn();
  const icons={info:'INFO',urgent:'URGENT',success:'OK'};
  const bcolors={info:'var(--accent)',urgent:'var(--accent3)',success:'var(--accent2)'};
  el.innerHTML=ann.map(a=>`<div class="announce-card" style="border-color:${bcolors[a.type]||'var(--border)'}44;margin-bottom:13px;">
    <div style="font-size:24px;">${icons[a.type]||''}</div>
    <div style="flex:1;"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;"><div style="font-size:14px;font-weight:700;">${a.title}</div><div style="font-size:11px;color:var(--text3);">${a.date}</div></div>
    <div style="font-size:13px;color:var(--text2);">${a.msg}</div>
    <div style="font-size:11px;color:var(--text3);margin-top:5px;">By ${a.author}</div></div>
    ${isAdmin?`<button class="btn btn-danger btn-sm" onclick="delAnn(${a.id})" style="flex-shrink:0;align-self:flex-start;">Delete</button>`:''}
  </div>`).join('')||'<div style="text-align:center;color:var(--text3);padding:30px;font-size:13px;">No announcements yet</div>';
}
function postAnn(){
  const title=document.getElementById('ann-title').value.trim(),msg=document.getElementById('ann-msg').value.trim();
  if(!title||!msg){toast('Fill all fields','err');return;}
  DB.announcements.unshift({id:++nxId,title,msg,type:document.getElementById('ann-type').value,author:CU.name,date:new Date().toISOString().split('T')[0],groupId:CU.groupId});
  saveDB();toast('Posted!');closeModal('annModal');renderAnn();updateAnnBadge();
  document.getElementById('ann-title').value='';document.getElementById('ann-msg').value='';
}
function delAnn(id){DB.announcements=DB.announcements.filter(a=>a.id!==id);saveDB();renderAnn();updateAnnBadge();toast('Deleted');}

