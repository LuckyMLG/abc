function getAdminToken() {
  return localStorage.getItem('adminToken');
}

function showUpload() {
  document.getElementById('login').classList.add('hidden');
  document.getElementById('upload').classList.remove('hidden');
}

async function adminLogin() {
  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value;
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('adminToken', data.token);
    showUpload();
  } else {
    document.getElementById('login-message').textContent = data.error || 'Login failed';
  }
}

async function uploadTeacher() {
  const token = getAdminToken();
  const name = document.getElementById('teacher-name').value.trim();
  const subject = document.getElementById('teacher-subject').value.trim();
  const school = document.getElementById('teacher-school').value.trim();
  const photo = document.getElementById('teacher-photo').value.trim();
  const description = document.getElementById('teacher-description').value.trim();
  const res = await fetch('/api/teachers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ name, subject, school, photo, description })
  });
  const data = await res.json();
  if (res.ok) {
    document.getElementById('upload-message').textContent = 'Uploaded';
    document.getElementById('teacher-name').value = '';
    document.getElementById('teacher-subject').value = '';
    document.getElementById('teacher-school').value = '';
    document.getElementById('teacher-photo').value = '';
    document.getElementById('teacher-description').value = '';
  } else {
    document.getElementById('upload-message').textContent = data.error || 'Upload failed';
  }
}

function init() {
  if (getAdminToken()) {
    showUpload();
  }
  document.getElementById('admin-login-btn').addEventListener('click', adminLogin);
  document.getElementById('upload-btn').addEventListener('click', uploadTeacher);
}

document.addEventListener('DOMContentLoaded', init);
