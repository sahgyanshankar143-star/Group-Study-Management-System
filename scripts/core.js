// APP INIT
// 
//  Dynamic subject system
const DEFAULT_SUBJECTS=[
  {key:'cs',label:'CS',color:'#81c3ff'},
  {key:'math',label:'Math',color:'#7c6dfa'},
  {key:'science',label:'Science',color:'#00e5b0'},
  {key:'english',label:'English',color:'#ffc84a'},
  {key:'history',label:'History',color:'#ff5f7e'},
  {key:'other',label:'Other',color:'#a855f7'},
];
function gSubjects(){
  if(!CU)return DEFAULT_SUBJECTS;
  const stored=localStorage.getItem('subjects_'+CU.groupId);
  return stored?JSON.parse(stored):JSON.parse(JSON.stringify(DEFAULT_SUBJECTS));
}
function saveSubjects(arr){localStorage.setItem('subjects_'+CU.groupId,JSON.stringify(arr));}
function subColor(key){return(gSubjects().find(s=>s.key===key)||{color:'#888'}).color;}
function subLabel(key){return(gSubjects().find(s=>s.key===key)||{label:key}).label;}
function populateSubjectSelects(restoreVal){
  const subs=gSubjects();
  const opts=subs.map(s=>`<option value="${s.key}">${s.label}</option>`).join('');
  const optsAll=`<option value="all">All Subjects</option>`+opts;
  ['t-subject','ss-sub','r-sub'].forEach(id=>{const e=document.getElementById(id);if(e){e.innerHTML=opts;if(restoreVal)e.value=restoreVal;}});
  ['reg-spec','m-spec'].forEach(id=>{const e=document.getElementById(id);if(e)e.innerHTML=optsAll;});
}
//  Subject modal logic
function openSubjectsModal(){
  renderSubjectsList();
  openModal('subjectsModal');
}
function renderSubjectsList(){
  const subs=gSubjects();
  const el=document.getElementById('subjectsList');
  if(!el)return;
  el.innerHTML=subs.map((s,i)=>`
    <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);">
      <div style="width:22px;height:22px;border-radius:50%;background:${s.color};flex-shrink:0;"></div>
      <div style="flex:1;font-size:13px;font-weight:500;">${s.label}</div>
      <div style="font-size:11px;color:var(--text3);font-family:monospace;">${s.key}</div>
      <button class="btn btn-danger btn-sm" onclick="deleteSubject(${i})" style="padding:4px 9px;">Delete</button>
    </div>`).join('');
}
function deleteSubject(idx){
  const subs=gSubjects();
  if(subs.length<=1){toast('Need at least one subject','err');return;}
  subs.splice(idx,1);
  saveSubjects(subs);
  renderSubjectsList();
  populateSubjectSelects();
  toast('Subject removed');
}
function addCustomSubject(){
  const name=document.getElementById('cs-name').value.trim();
  const emoji=document.getElementById('cs-emoji').value.trim()||'';
  const color=document.getElementById('cs-color').value||'#7c6dfa';
  if(!name){toast('Enter subject name','err');return;}
  const key=name.toLowerCase().replace(/[^a-z0-9]/g,'_').substring(0,20)+'_'+Date.now().toString(36);
  const label = emoji ? `${emoji} ${name}` : name;
  const subs=gSubjects();
  if(subs.find(s=>s.label.toLowerCase().includes(name.toLowerCase()))){toast('Subject already exists','err');return;}
  subs.push({key,label,color});
  saveSubjects(subs);
  renderSubjectsList();
  populateSubjectSelects();
  document.getElementById('cs-name').value='';
  document.getElementById('cs-emoji').value='';
  toast(`"${label}" added!`);
}
const ST_LABELS={done:'Done',inprogress:'In Progress',review:'Review',upcoming:'Upcoming'};
let nxId=500;

function gTasks(){return DB.tasks.filter(t=>t.groupId===CU.groupId);}
function gMembers(){return DB.members.filter(m=>m.groupId===CU.groupId);}
function gAnn(){return DB.announcements.filter(a=>a.groupId===CU.groupId);}
function gRes(){return DB.resources.filter(r=>r.groupId===CU.groupId);}
function gSess(){return DB.sessions.filter(s=>s.groupId===CU.groupId);}

function initApp(){updateStats();renderDashKanban();renderSubProg();updateAnnBadge();populateSubjectSelects();}

//  Stats
function updateStats(){
  const tasks=gTasks();
  const done=tasks.filter(t=>t.status==='done').length;
  const ip=tasks.filter(t=>t.status==='inprogress').length;
  const up=tasks.filter(t=>t.status==='upcoming').length;
  const rev=tasks.filter(t=>t.status==='review').length;
  const total=tasks.length, pct=total?Math.round((done/total)*100):0;
  const mem=gMembers().length;
  [['sd-done','pd-done',done],['sd-ip','pd-ip',ip],['sd-up','pd-up',up],['sd-mem',null,mem]].forEach(([a,b,v])=>{
    const e=document.getElementById(a);if(e)e.textContent=v;
    if(b){const e2=document.getElementById(b);if(e2)e2.textContent=v;}
  });
  const re=document.getElementById('pd-rev');if(re)re.textContent=rev;
  const op=document.getElementById('overallPct');if(op)op.textContent=pct+'%';
  const bb=document.getElementById('bigBar');if(bb)bb.style.width=pct+'%';
  const tb=document.getElementById('taskBadge');if(tb)tb.textContent=ip+up;
}
function updateAnnBadge(){const b=document.getElementById('annBadge');if(b)b.textContent=gAnn().length;}

//  Navigation
function showPage(n){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+n).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(ni=>ni.classList.remove('active'));
  const order=['dashboard','tasks','members','schedule','progress','announcements','resources'];
  const idx=order.indexOf(n);
  document.querySelectorAll('.nav-item')[idx]?.classList.add('active');
  const titles={dashboard:'Dashboard',tasks:'Task Board',members:'Team Members',schedule:'Weekly Schedule',progress:'Progress Analytics',announcements:'Announcements',resources:'Resources'};
  document.getElementById('pageTitle').textContent=titles[n]||n;
  const tb=document.getElementById('topBtn');
  tb.style.display=['dashboard','tasks'].includes(n)?'flex':'none';
  if(['dashboard','tasks'].includes(n)){tb.onclick=openAddTaskModal;tb.innerHTML='+ Add Task';}
  closeSB();
  renderPage(n);
}
function renderPage(n){
  updateStats();
  if(n==='dashboard'){renderDashKanban();renderSubProg();}
  if(n==='tasks')renderFullKanban();
  if(n==='members')renderMembers();
  if(n==='schedule'){renderSchedule();renderDeadlines();}
  if(n==='progress')renderProgress();
  if(n==='announcements')renderAnn();
  if(n==='resources')renderRes();
}
function getCurPage(){return ['dashboard','tasks','members','schedule','progress','announcements','resources'].find(p=>document.getElementById('page-'+p)?.classList.contains('active'))||'dashboard';}

