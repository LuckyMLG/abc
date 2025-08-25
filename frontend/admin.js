function getToken() {
  return localStorage.getItem('token');
}

async function uploadTeacher() {
  const token = getToken();
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

document.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  if (!token) {
    location.href = '/login.html';
    return;
  }
  document.getElementById('upload-btn').addEventListener('click', uploadTeacher);
});
