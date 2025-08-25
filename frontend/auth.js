async function login(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    location.href = '/';
  } else {
    document.getElementById('message').textContent = data.error || 'Login failed';
  }
}

async function signup(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const res = await fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (res.ok) {
    location.href = '/login.html';
  } else {
    document.getElementById('message').textContent = data.error || 'Signup failed';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (form?.dataset.type === 'login') {
    form.addEventListener('submit', login);
  } else if (form?.dataset.type === 'signup') {
    form.addEventListener('submit', signup);
  }
});
