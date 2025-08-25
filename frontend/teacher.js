function getToken() {
  return localStorage.getItem('token');
}

async function loadTeacher() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) return;

  const res = await fetch(`/api/teachers/${id}`);
  const teacher = await res.json();

  document.getElementById('teacher-name').textContent = teacher.name;
  document.getElementById('teacher-meta').textContent = `${teacher.subject} • ${teacher.school}`;
  document.getElementById('teacher-rating').textContent = teacher.averageRating ? `${teacher.averageRating.toFixed(1)} (${teacher.reviewCount} reviews)` : 'No reviews yet';

  const container = document.getElementById('reviews');
  container.innerHTML = '';
  teacher.reviews.forEach(r => {
    const div = document.createElement('div');
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    div.innerHTML = `<p class="text-sm">${stars} by ${r.reviewer}</p><p class="text-green-200">${r.text}</p><p class="text-xs text-green-700">${new Date(r.timestamp).toLocaleString()}</p>`;
    container.appendChild(div);
  });

  document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const rating = Number(document.getElementById('review-rating').value);
    const text = document.getElementById('review-text').value;
    if (!getToken()) {
      document.getElementById('login-warning').classList.remove('hidden');
      return;
    }
    await fetch(`/api/teachers/${id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ rating, text })
    });
    document.getElementById('review-rating').value = '';
    document.getElementById('review-text').value = '';
    loadTeacher();
  });
}

document.addEventListener('DOMContentLoaded', loadTeacher);
