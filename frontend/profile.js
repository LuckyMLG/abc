function getToken() { return localStorage.getItem('token'); }

async function loadReviews() {
  if (!getToken()) { location.href = '/login.html'; return; }
  const res = await fetch('/api/my-reviews', {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  const data = await res.json();
  const container = document.getElementById('my-reviews');
  container.innerHTML = '';
  data.forEach(r => {
    const div = document.createElement('div');
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    div.className = 'border border-green-700 p-4 rounded';
    div.innerHTML = `<h3 class="font-semibold">${r.teacherName}</h3><p class="text-sm">${stars}</p><p class="text-green-200">${r.text}</p><p class="text-xs text-green-700">${new Date(r.timestamp).toLocaleString()}</p>`;
    container.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', loadReviews);
