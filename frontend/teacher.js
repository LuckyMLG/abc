function getToken() {
  return localStorage.getItem('token');
}

function cooldownKey(id) {
  return `lastReview_${id}`;
}

function updateCooldownUI(id) {
  const last = Number(localStorage.getItem(cooldownKey(id)));
  const now = Date.now();
  const errEl = document.getElementById('review-error');
  const btn = document.querySelector('#review-form button[type="submit"]');
  if (last && now - last < 60 * 60 * 1000) {
    const minutes = Math.ceil((60 * 60 * 1000 - (now - last)) / 60000);
    btn.disabled = true;
    errEl.textContent = `You can add another review in ${minutes} minutes.`;
    errEl.classList.remove('hidden');
  } else {
    btn.disabled = false;
    errEl.classList.add('hidden');
  }
}

async function loadTeacher() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) return;

  const res = await fetch(`/api/teachers/${id}`);
  const teacher = await res.json();

  document.getElementById('teacher-name').textContent = teacher.name;
  document.getElementById('teacher-meta').textContent = `${teacher.subject} • ${teacher.school}`;
  document.getElementById('teacher-description').textContent = teacher.description || '';
  const photoEl = document.getElementById('teacher-photo');
  if (teacher.photo) {
    photoEl.src = teacher.photo;
    photoEl.classList.remove('hidden');
  } else {
    photoEl.classList.add('hidden');
  }
  document.getElementById('teacher-rating').textContent = teacher.averageRating ? `${teacher.averageRating.toFixed(1)} (${teacher.reviewCount} reviews)` : 'No reviews yet';

  const container = document.getElementById('reviews');
  container.innerHTML = '';
  teacher.reviews.forEach(r => {
    const div = document.createElement('div');
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    div.innerHTML = `<p class="text-sm">${stars} by ${r.reviewer}</p><p class="text-green-200">${r.text}</p><p class="text-xs text-green-700">${new Date(r.timestamp).toLocaleString()}</p>`;
    container.appendChild(div);
  });

  updateCooldownUI(id);

  document.getElementById('review-form').onsubmit = async (e) => {
    e.preventDefault();
    const rating = Number(document.getElementById('review-rating').value);
    const text = document.getElementById('review-text').value;
    if (!getToken()) {
      document.getElementById('login-warning').classList.remove('hidden');
      return;
    }
    const res = await fetch(`/api/teachers/${id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ rating, text })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data.error || 'Failed to submit review';
      const errEl = document.getElementById('review-error');
      errEl.textContent = msg;
      errEl.classList.remove('hidden');
      localStorage.setItem(cooldownKey(id), Date.now().toString());
      updateCooldownUI(id);
      return;
    }
    document.getElementById('review-error').classList.add('hidden');
    document.getElementById('review-rating').value = '';
    document.getElementById('review-text').value = '';
    localStorage.setItem(cooldownKey(id), Date.now().toString());
    updateCooldownUI(id);
    loadTeacher();
  };
}

document.addEventListener('DOMContentLoaded', loadTeacher);
