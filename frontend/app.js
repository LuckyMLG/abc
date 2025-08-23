const escapeHtml = str => str.replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

const loadTeachers = async () => {
  const res = await fetch('/api/teachers');
  const teachers = await res.json();
  const container = document.getElementById('teachers');
  if (!container) return;
  container.innerHTML = '';
  teachers.forEach(t => {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow p-6 animate__animated animate__fadeIn';
    const ratingHtml = t.averageRating !== null
      ? `<div class="flex items-center mb-4"><div class="flex space-x-1">${renderStars(t.averageRating)}</div><span class="ml-2 text-sm text-gray-600">${t.averageRating.toFixed(2)}</span></div>`
      : '<p class="text-gray-500 mb-4">No reviews yet</p>';
    const reviewsHtml = t.reviews.map(r => `
      <div class="border-t mt-4 pt-4">
        <div class="flex space-x-1">${renderStars(r.rating)}</div>
        <p class="text-sm text-gray-700 mt-1">${escapeHtml(r.comment)}</p>
      </div>
    `).join('');
    div.innerHTML = `
      <h3 class="text-xl font-semibold mb-2">${t.name}</h3>
      ${ratingHtml}
      <div>
        <textarea id="comment-${t.id}" maxlength="300" class="w-full p-2 border rounded mb-2" placeholder="Leave a comment"></textarea>
        <div class="flex items-center space-x-2">
          <select id="rating-${t.id}" class="border rounded p-1">
            <option value="">Rating</option>
            ${[1,2,3,4,5].map(n => `<option value="${n}">${n}</option>`).join('')}
          </select>
          <button class="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition" onclick="submitReview(${t.id})">Submit</button>
        </div>
      </div>
      ${reviewsHtml}
    `;
    container.appendChild(div);
  });
};

const renderStars = rating => {
  const full = Math.round(rating);
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<i class="${i <= full ? 'fa-solid text-yellow-400' : 'fa-regular text-gray-300'} fa-star"></i>`;
  }
  return stars;
};

const addTeacher = async () => {
  const nameInput = document.getElementById('teacher-name');
  if (!nameInput) return;
  const name = nameInput.value.trim();
  if (!name) return;
  await fetch('/api/teachers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  nameInput.value = '';
};

const submitReview = async id => {
  const rating = Number(document.getElementById(`rating-${id}`).value);
  const comment = document.getElementById(`comment-${id}`).value.trim();
  if (!rating || !comment) return;
  await fetch(`/api/teachers/${id}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, comment })
  });
  document.getElementById(`rating-${id}`).value = '';
  document.getElementById(`comment-${id}`).value = '';
  loadTeachers();
};

document.addEventListener('DOMContentLoaded', loadTeachers);
