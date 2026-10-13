// AUTH HELPERS
// 
function toggleEye(inputId, icon) {
  const f = document.getElementById(inputId);
  f.type = f.type === 'password' ? 'text' : 'password';
  icon.textContent = f.type === 'password' ? 'Show' : 'Hide';
}
function showScreen(id) {
  document.querySelectorAll('.auth-screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t,i) => t.classList.toggle('active', (tab==='login'&&i===0)||(tab==='register'&&i===1)));
  document.getElementById('stepIndicator').style.display = tab === 'register' ? 'flex' : 'none';
  document.getElementById('authTabs').style.display = tab === 'register' ? 'none' : 'flex';
  if (tab === 'login') { showScreen('screen-login'); document.getElementById('stepIndicator').style.display='none'; document.getElementById('authTabs').style.display='flex'; }
  if (tab === 'register') { setStep(1); showScreen('screen-reg1'); document.getElementById('stepIndicator').style.display='flex'; document.getElementById('authTabs').style.display='none'; }
}
function setStep(n) {
  for(let i=1;i<=3;i++){
    const d=document.getElementById('sd'+i);
    d.className='step-dot'+(i<n?' done':i===n?' active':'');
    d.textContent=i<n?'OK':i;
    if(i<3){const l=document.getElementById('sl'+i);l.className='step-line'+(i<n?' done':'');}
  }
}
function showLogin() { document.getElementById('stepIndicator').style.display='none'; document.getElementById('authTabs').style.display='flex'; showScreen('screen-login'); }
function showForgot() { document.getElementById('authTabs').style.display='none'; document.getElementById('stepIndicator').style.display='none'; fpStep=1; resetFpUI(); showScreen('screen-forgot'); }
function goToLogin() { switchTab('login'); }

//  Registration
let regRole = 'admin';
function selRegRole(r) {
  regRole = r;
  document.getElementById('ro-admin').classList.toggle('sel', r==='admin');
  document.getElementById('ro-member').classList.toggle('sel', r==='member');
  document.getElementById('memberCodeWrap').style.display = r === 'member' ? 'block' : 'none';
  document.getElementById('adminGroupWrap').style.display = r === 'admin' ? 'block' : 'none';
}
function regStep1Next() {
  if (regRole === 'member') {
    const code = document.getElementById('reg-code').value.trim().toUpperCase();
    if (!code) { toast('Enter your group code', 'err'); return; }
    const grp = DB.groups.find(g => g.code === code);
    if (!grp) { toast('Invalid group code. Ask your admin.', 'err'); return; }
  }
  document.getElementById('adminGroupWrap').style.display = regRole === 'admin' ? 'block' : 'none';
  setStep(2); showScreen('screen-reg2');
}
function regBack() { resetRegSubjects(); setStep(1); showScreen('screen-reg1'); }

function checkStrength(p) {
  let s = 0, txt = '', col = '';
  if (p.length >= 6) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^a-zA-Z0-9]/.test(p)) s++;
  if (s <= 1) { txt = 'Weak'; col = '#ff5f7e'; }
  else if (s === 2) { txt = 'Fair'; col = '#ffc84a'; }
  else if (s === 3) { txt = 'Good'; col = '#00e5b0'; }
  else { txt = 'Strong'; col = '#7c6dfa'; }
  document.getElementById('strFill').style.cssText = `width:${(s/4)*100}%;background:${col}`;
  document.getElementById('strText').style.cssText = `color:${col};font-size:11px;margin-top:3px;`;
  document.getElementById('strText').textContent = p ? txt : '';
}

//  Registration subject helpers
let regCustomSubjects = []; // extra subjects added during signup
const EXTRA_COLORS = ['#81c3ff','#00e5b0','#ffc84a','#ff5f7e','#a855f7','#f97316','#06b6d4','#e879f9','#4ade80','#fb923c'];
function addRegSubject() {
  const nameEl = document.getElementById('reg-sub-name');
  const emojiEl = document.getElementById('reg-sub-emoji');
  const name = nameEl.value.trim();
  const emoji = emojiEl.value.trim();
  if (!name) { nameEl.focus(); return; }
  if (regCustomSubjects.find(s => s.label.toLowerCase().includes(name.toLowerCase()))) {
    nameEl.value=''; emojiEl.value=''; nameEl.focus(); return;
  }
  const key = name.toLowerCase().replace(/[^a-z0-9]/g,'_').substring(0,20) + '_' + regCustomSubjects.length;
  const color = EXTRA_COLORS[regCustomSubjects.length % EXTRA_COLORS.length];
  regCustomSubjects.push({ key, label: emoji ? `${emoji} ${name}` : name, color });
  nameEl.value=''; emojiEl.value=''; nameEl.focus();
  renderRegSubjects();
}
function removeRegSubject(idx) {
  regCustomSubjects.splice(idx, 1);
  renderRegSubjects();
}
function renderRegSubjects() {
  const el = document.getElementById('reg-subjects-list'); if (!el) return;
  el.innerHTML = regCustomSubjects.map((s,i) => `
    <div style="display:inline-flex;align-items:center;gap:5px;background:${s.color}22;border:1px solid ${s.color}55;border-radius:20px;padding:4px 10px;font-size:12px;font-weight:600;color:${s.color};">
      ${s.label}
      <span style="cursor:pointer;font-size:14px;color:${s.color};opacity:.7;margin-left:2px;" onclick="removeRegSubject(${i})"></span>
    </div>`).join('');
}
function resetRegSubjects() { regCustomSubjects = []; renderRegSubjects(); }

function doRegister() {
  const err = document.getElementById('regErr');
  err.style.display='none';
  const name = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  const spec = document.getElementById('reg-spec').value;
  if (!name||!username||!email||!pass) { err.textContent='All required fields must be filled.'; err.style.display='block'; return; }
  if (pass.length < 6) { err.textContent='Password must be at least 6 characters.'; err.style.display='block'; return; }
  if (pass !== pass2) { err.textContent='Passwords do not match.'; err.style.display='block'; return; }
  if (DB.accounts.find(a => a.email === email)) { err.textContent='Email already registered.'; err.style.display='block'; return; }
  if (DB.accounts.find(a => a.username.toLowerCase() === username.toLowerCase())) { err.textContent='Username already taken.'; err.style.display='block'; return; }
  const colors = ['linear-gradient(135deg,#7c6dfa,#00e5b0)','linear-gradient(135deg,#ff5f7e,#ffc84a)','linear-gradient(135deg,#00e5b0,#81c3ff)','linear-gradient(135deg,#a855f7,#7c6dfa)'];
  const color = colors[DB.accounts.length % colors.length];
  const mid = nid(), aid = nid();
  let groupId = null;
  let groupCode = '';

  if (regRole === 'admin') {
    const groupName = document.getElementById('reg-group').value.trim() || `${name}'s Study Group`;
    groupCode = genCode();
    const gid = nid();
    groupId = gid;
    DB.groups.push({ id: gid, name: groupName, code: groupCode, adminId: aid });
    // Save custom subjects merged with defaults
    if (regCustomSubjects.length > 0) {
      const merged = JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)).concat(regCustomSubjects);
      localStorage.setItem('subjects_' + gid, JSON.stringify(merged));
    }
    resetRegSubjects();
  } else {
    const code = document.getElementById('reg-code').value.trim().toUpperCase();
    const grp = DB.groups.find(g => g.code === code);
    groupId = grp?.id || null;
  }

  DB.members.push({ id: mid, name, role: regRole, email, specialty: spec, color, online: true, groupId });
  DB.accounts.push({ id: aid, name, username, email, password: pass, role: regRole, memberId: mid, groupId });
  saveDB();

  document.getElementById('reg3Msg').textContent = regRole === 'admin'
    ? `Welcome, ${name}! Your group has been created.`
    : `Welcome, ${name}! You've joined the group.`;
  if (regRole === 'admin') {
    document.getElementById('groupCodeBox').style.display = 'block';
    document.getElementById('groupCodeDisplay').textContent = groupCode;
  } else {
    document.getElementById('groupCodeBox').style.display = 'none';
  }
  setStep(3); showScreen('screen-reg3');
}

function genCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

//  Login
function doLogin() {
  const email = document.getElementById('li-email').value.trim().toLowerCase();
  const pass = document.getElementById('li-pass').value;
  const err = document.getElementById('loginErr');
  err.style.display='none';
  const acc = DB.accounts.find(a => (a.email === email || a.username.toLowerCase() === email) && a.password === pass);
  if (!acc) { err.textContent = 'Invalid email/username or password.'; err.style.display='block'; return; }
  CU = acc;
  CG = DB.groups.find(g => g.id === acc.groupId);
  launchApp();
}

//  Forgot Password
let fpStep = 1, fpEmail = '', fpOtp = '', fpOtpReal = '';
function resetFpUI() {
  fpStep = 1; fpEmail = ''; fpOtp = '';
  document.getElementById('fpEmailWrap').style.display='block';
  document.getElementById('fpOtpWrap').style.display='none';
  document.getElementById('fpNewPassWrap').style.display='none';
  document.getElementById('fpBtn').textContent='Send Reset Code';
  document.getElementById('fpErr').style.display='none';
  document.getElementById('fpOk').style.display='none';
}
function fpNext() {
  const err=document.getElementById('fpErr'), ok=document.getElementById('fpOk');
  err.style.display='none'; ok.style.display='none';
  if (fpStep === 1) {
    const email = document.getElementById('fp-email').value.trim().toLowerCase();
    if (!email) { err.textContent='Enter your email.'; err.style.display='block'; return; }
    const acc = DB.accounts.find(a => a.email === email);
    if (!acc) { err.textContent='No account found with that email.'; err.style.display='block'; return; }
    fpEmail = email;
    fpOtpReal = String(Math.floor(100000 + Math.random() * 900000));
    document.getElementById('fpOtpHint').textContent = `Reset code sent. Demo code: ${fpOtpReal}`;
    document.getElementById('fpEmailWrap').style.display='none';
    document.getElementById('fpOtpWrap').style.display='block';
    document.getElementById('fpBtn').textContent='Verify Code';
    fpStep = 2;
  } else if (fpStep === 2) {
    const inputs = document.querySelectorAll('.otp-input');
    const entered = Array.from(inputs).map(i=>i.value).join('');
    if (entered.length < 6) { err.textContent='Enter all 6 digits.'; err.style.display='block'; return; }
    if (entered !== fpOtpReal) { err.textContent='Incorrect code. Try again.'; err.style.display='block'; return; }
    document.getElementById('fpOtpWrap').style.display='none';
    document.getElementById('fpNewPassWrap').style.display='block';
    document.getElementById('fpBtn').textContent='Reset Password';
    fpStep = 3;
  } else if (fpStep === 3) {
    const p = document.getElementById('fp-newpass').value;
    const p2 = document.getElementById('fp-newpass2').value;
    if (p.length < 6) { err.textContent='Password too short.'; err.style.display='block'; return; }
    if (p !== p2) { err.textContent='Passwords do not match.'; err.style.display='block'; return; }
    const acc = DB.accounts.find(a => a.email === fpEmail);
    acc.password = p; saveDB();
    ok.textContent = 'Password reset! You can now sign in.'; ok.style.display='block';
    document.getElementById('fpNewPassWrap').style.display='none';
    document.getElementById('fpBtn').textContent='Back to Sign In';
    fpStep = 4;
  } else {
    showLogin();
  }
}
function otpNav(el, idx) {
  el.value = el.value.replace(/[^0-9]/g,'');
  const inputs = document.querySelectorAll('.otp-input');
  if (el.value && idx < 5) inputs[idx+1].focus();
}

// 
// LAUNCH APP
// 
function launchApp() {
  document.getElementById('authScreen').style.display='none';
  const shell = document.getElementById('appShell');
  shell.style.display='flex';
  const m = DB.members.find(m => m.id === CU.memberId);
  document.getElementById('sbName').textContent = CU.name?.split(' ')[0] || CU.username;
  document.getElementById('sbRole').textContent = CU.role==='admin'?'Admin':'Member';
  const sbAv = document.getElementById('sbAv');
  sbAv.style.background = m?.color || 'var(--accent)';
  sbAv.textContent = (CU.name||'U')[0].toUpperCase();
  document.getElementById('groupNameSB').textContent = CG?.name || 'Study Group';
  document.getElementById('chatFab').style.display='flex';
  applyRoles();
  initApp();
  // Greet
  addActivity(`${CU.name?.split(' ')[0]||CU.username} signed in`);
  setTimeout(()=>{ addBotMsg(`Hey ${CU.name?.split(' ')[0]||CU.username}! I'm StudyBot. Ask me anything about concepts, quiz questions, study plans, or tips.`); },400);
}

function applyRoles() {
  const isAdmin = CU.role === 'admin';
  ['addMemberBtn','addAnnBtn','addSessBtn'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display=isAdmin?'flex':'none';});
  document.getElementById('groupCodeShow').style.display = isAdmin?'flex':'none';
  if (isAdmin) {
    document.getElementById('gcDisplay').textContent = CG?.code||'';
  }
  document.getElementById('topBtn').style.display='flex';
}

function doLogout() {
  CU=null; CG=null;
  document.getElementById('appShell').style.display='none';
  document.getElementById('chatFab').style.display='none';
  document.getElementById('chatbox').classList.remove('open');
  document.getElementById('chatMsgs').innerHTML='';
  document.getElementById('authScreen').style.display='flex';
  document.getElementById('authTabs').style.display='flex';
  document.getElementById('stepIndicator').style.display='none';
  showScreen('screen-login');
  document.getElementById('li-email').value='';
  document.getElementById('li-pass').value='';
}

// 


document.querySelectorAll('.input-eye').forEach((el) => {
  if (!el.textContent.trim()) el.textContent = 'Show';
});
