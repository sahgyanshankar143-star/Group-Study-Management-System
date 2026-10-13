// 
// DATA STORE  localStorage-backed
// 
function loadDB() {
  const d = localStorage.getItem('studysync_db');
  if (d) return JSON.parse(d);
  return {
    accounts: [],   // {id, name, username, email, password, role, memberId, groupId, specialty, color}
    groups: [],     // {id, name, code, adminId}
    members: [],    // {id, name, role, email, specialty, color, online, groupId}
    tasks: [],      // {id, title, desc, status, priority, subject, due, assignees, progress, groupId}
    sessions: [],   // {id, title, day, time, subject, groupId}
    announcements:[],// {id, title, msg, type, author, date, groupId}
    resources: [],  // {id, name, type, subject, url, addedBy, groupId}
    nextId: 1,
  };
}
function saveDB() { localStorage.setItem('studysync_db', JSON.stringify(DB)); }
function nid() { return ++DB.nextId; }

let DB = loadDB();
let CU = null; // current user account
let CG = null; // current group

// 
