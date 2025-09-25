let teachers = [];
const loginForm = document.getElementById('loginForm');
const username = document.getElementById('username');
const password = document.getElementById('password');
const loginSection = document.getElementById('loginSection');
const dashboard = document.getElementById('dashboard');
const teacherList = document.getElementById('teacherList');
const addForm = document.getElementById('addTeacherForm');
const newName = document.getElementById('newName');
const newUser = document.getElementById('newUser');
const newPass = document.getElementById('newPass');
const newRole = document.getElementById('newRole');
const logoutBtn = document.getElementById('logoutBtn');
const exportBtn = document.getElementById('exportJson');

async function loadTeachers(){
  const res = await fetch('teachers.json');
  teachers = await res.json();
}
function renderList(){
  teacherList.innerHTML = '';
  teachers.forEach((t, i)=>{
    const el = document.createElement('div');
    el.className = 'teacher-item';
    el.innerHTML = `
      <div class="meta">
        <div>
          <div style="font-weight:600">${t.name}</div>
          <div class="muted">${t.username} · ${t.role}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn outline" data-edit="${i}">Edit</button>
        <button class="btn" data-del="${i}">Delete</button>
      </div>
    `;
    teacherList.appendChild(el);
  });
  teacherList.querySelectorAll('[data-del]').forEach(b=>{
    b.addEventListener('click', e=>{
      const i = Number(e.currentTarget.dataset.del);
      teachers.splice(i,1);
      renderList();
    });
  });
  teacherList.querySelectorAll('[data-edit]').forEach(b=>{
    b.addEventListener('click', e=>{
      const i = Number(e.currentTarget.dataset.edit);
      const t = teachers[i];
      const n = prompt('Full name', t.name);
      if(n===null) return;
      const u = prompt('Username', t.username);
      if(u===null) return;
      const p = prompt('Password (visible)', t.password);
      if(p===null) return;
      const r = prompt('Role (teacher/admin)', t.role);
      teachers[i] = {name:n,username:u,password:p,role:r||t.role};
      renderList();
    });
  });
}

loginForm.addEventListener('submit', async e=>{
  e.preventDefault();
  await loadTeachers();
  const u = username.value.trim();
  const p = password.value.trim();
  const found = teachers.find(t=>t.username===u && t.password===p && (t.role==='admin' || t.role==='teacher'));
  if(!found){
    alert('Invalid credentials');
    return;
  }
  sessionStorage.setItem('pl_admin', found.username);
  loginSection.hidden = true;
  dashboard.hidden = false;
  renderList();
});

addForm.addEventListener('submit', e=>{
  e.preventDefault();
  teachers.push({name:newName.value,username:newUser.value,password:newPass.value,role:newRole.value});
  newName.value='';newUser.value='';newPass.value='';
  renderList();
});

logoutBtn.addEventListener('click', ()=>{
  sessionStorage.removeItem('pl_admin');
  dashboard.hidden = true;
  loginSection.hidden = false;
});

exportBtn.addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(teachers,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'teachers.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
