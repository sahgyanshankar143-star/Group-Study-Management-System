// CHATBOT  Gemini
// 
const GEMINI_KEY='AIzaSyDNVqmZTYK7CJLJ8KiwJtIi5DOlC0UAfUE';
const GEMINI_URL=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
let chatHistory=[];

function toggleChat(){
  const cb=document.getElementById('chatbox');
  cb.classList.toggle('open');
}
function sendQuick(t){document.getElementById('chatInput').value=t;sendMsg();}
async function sendMsg(){
  const inp=document.getElementById('chatInput');
  const text=inp.value.trim();if(!text)return;
  inp.value='';
  addUserMsg(text);showTyping();
  const tasks=gTasks();
  const ctx=`Group: ${CG?.name||'Study Group'}. Tasks: ${tasks.length} total, ${tasks.filter(t=>t.status==='done').length} done, ${tasks.filter(t=>t.status==='inprogress').length} in progress. Members: ${gMembers().map(m=>m.name).join(', ')}.`;
  try{
    const body={
      contents:[...chatHistory.slice(-8),{role:'user',parts:[{text:`[Context: ${ctx}]\n\nStudent: ${text}`}]}],
      systemInstruction:{parts:[{text:'You are StudyBot, a helpful AI assistant for CS engineering students preparing for exams. Be concise (under 200 words unless asked for detail), friendly, and occasionally use emojis. Help with: study tips, concept explanations, quiz questions, study plans, motivation, time management, coding help.'}]},
      generationConfig:{maxOutputTokens:512,temperature:0.8}
    };
    const res=await fetch(GEMINI_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!res.ok){const e=await res.json();throw new Error(e.error?.message||'HTTP '+res.status);}
    const data=await res.json();
    hideTyping();
    const reply=data.candidates?.[0]?.content?.parts?.[0]?.text;
    if(!reply)throw new Error('Empty response');
    chatHistory.push({role:'user',parts:[{text}]});
    chatHistory.push({role:'model',parts:[{text:reply}]});
    addBotMsg(reply);
  }catch(e){
    hideTyping();
    console.error('Gemini error:',e);
    const fallbackReply = getLocalStudyReply(text, ctx);
    chatHistory.push({role:'user',parts:[{text}]});
    chatHistory.push({role:'model',parts:[{text:fallbackReply}]});
    addBotMsg(fallbackReply);
  }
}

function getLocalStudyReply(text, ctx){
  const q = text.toLowerCase();
  const taskCount = gTasks().length;
  const inProgress = gTasks().filter(t=>t.status==='inprogress').length;
  const done = gTasks().filter(t=>t.status==='done').length;

  if(q.includes('study plan') || q.includes('plan')){
    return `Here is a simple study plan for your group:\n\n1. Spend 10 minutes reviewing goals.\n2. Focus for 40 minutes on the hardest topic.\n3. Take a 5-10 minute break.\n4. Solve practice questions for 30 minutes.\n5. End with a 10 minute recap.\n\nCurrent group snapshot: ${taskCount} tasks total, ${inProgress} in progress, ${done} completed.`;
  }

  if(q.includes('quiz') || q.includes('question') || q.includes('ask me')){
    return `Quick quiz time:\n\n1. What is the difference between a stack and a queue?\n2. What does Big O notation describe?\n3. Why is active recall better than passive reading?\n\nSend me your answers and I will check them.`;
  }

  if(q.includes('big o') || q.includes('algorithm') || q.includes('data structure')){
    return `Big O tells you how an algorithm grows as input size grows.\n\nExamples:\n- O(1): constant time\n- O(log n): binary search\n- O(n): single loop\n- O(n log n): efficient sorting\n- O(n^2): nested loops\n\nIf you want, ask me for a simple example with arrays, linked lists, stacks, or queues.`;
  }

  if(q.includes('focus') || q.includes('motivat') || q.includes('tired') || q.includes('procrast')){
    return `Try this reset:\n\n- Pick one task only\n- Set a 25 minute timer\n- Put your phone away\n- Write 3 bullet goals before starting\n- Stop after one session and review progress\n\nSmall wins build momentum fast.`;
  }

  if(q.includes('task') || q.includes('progress') || q.includes('group')){
    return `Group summary:\n\n${ctx}\n\nTip: finish one in-progress task before starting a new one. That usually improves momentum and keeps the dashboard cleaner.`;
  }

  return `I can still help even without the external AI connection.\n\nTry asking for:\n- a study plan\n- a quiz\n- Big O explanation\n- focus tips\n- task progress summary\n\nIf you want full AI answers, send me your working API key and I can wire it in.`;
}
function addUserMsg(text){
  const msgs=document.getElementById('chatMsgs');
  const d=document.createElement('div');d.className='cmsg user';
  const m=DB.members.find(m=>m.id===CU?.memberId);
  d.innerHTML=`<div><div class="mbubble">${text}</div><div class="mtime" style="text-align:right;">${new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}</div></div>
  <div class="mav2" style="background:${m?.color||'var(--accent)'}">${(CU?.name||'U')[0]}</div>`;
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}
function addBotMsg(text){
  const msgs=document.getElementById('chatMsgs');
  const d=document.createElement('div');d.className='cmsg bot';
  d.innerHTML=`<div class="chat-av" style="width:26px;height:26px;font-size:12px;">AI</div>
  <div><div class="mbubble">${text.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>')}</div><div class="mtime">${new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}</div></div>`;
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}
function showTyping(){
  const msgs=document.getElementById('chatMsgs');
  const d=document.createElement('div');d.className='cmsg bot';d.id='typingEl';
  d.innerHTML=`<div class="chat-av" style="width:26px;height:26px;font-size:12px;">AI</div><div><div class="mbubble" style="padding:10px 13px;"><div class="typing"><div class="td"></div><div class="td"></div><div class="td"></div></div></div></div>`;
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}
function hideTyping(){const e=document.getElementById('typingEl');if(e)e.remove();}

// 
