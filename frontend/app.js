// Safely escape user-entered text for HTML
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

// Render star icons for a numeric rating
function renderStars(rating) {
  const full = Math.round(rating || 0);
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<i class="${i <= full ? 'fa-solid text-yellow-400' : 'fa-regular text-gray-300'} fa-star"></i>`;
  }
  return stars;
}

// Clickable stars to rate quickly (no comment)
function renderRateControls(id) {
  let controls = '';
  for (let i = 1; i <= 5; i++) {
    controls += `<i class="fa-solid fa-star text-gray-300 hover:text-yellow-400 cursor-pointer" onclick="rateTeacher(${id}, ${i})" title="${i}"></i>`;
  }
  return controls;
}

// Fetch and render the teacher list
async function loadTeachers() {
  const res = await fetch('/api/teachers');
  const teachers = await res.json();

  const container = document.getElementById('teachers');
  if (!container) return;

  container.innerHTML = '';

  teachers.forEach(t => {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow p-6';

    const ratingHtml = t.averageRating !== null && t.averageRating !== undefined
      ? `<div class="flex items-center mb-4">
           <div class="flex space-x-1">${renderStars(t.averageRating)}</div>
           <span class="ml-2 text-sm text-gray-600">${Number(t.averageRating).toFixed(2)}</span>
         </div>`
      : '<p class="text-gray-500 mb-4">No reviews yet</p>';

    // Existing reviews (if provided by API)
    const reviewsHtml = Array.isArray(t.reviews) ? t.reviews.map(r => `
      <div class="border-t mt-4 pt-4">
        <div class="flex space-x-1">${renderStars(r.rating)}</div>
        ${r.comment ? `<p class="text-sm text-gray-700 mt-1">${escapeHtml(r.comment)}</p>` : ''}
      </div>
    `).join('') : '';

    // Build card: title, average rating, quick stars, and comment form
    div.innerHTML = `
      <h3 class="text-xl font-semibold mb-2">${t.name}</h3>
      ${ratingHtml}

      <!-- Quick star rating -->
      <div class="flex items-center space-x-2 mb-4">
        <span class="text-sm text-gray-600">Rate:</span>
        <div class="flex space-x-1">${renderRateControls(t.id)}</div>
      </div>

      <!-- Comment + rating form -->
      <div>
        <textarea id="comment-${t.id}" maxlength="300" class="w-full p-2 border rounded mb-2" placeholder="Leave a comment (optional)"></textarea>
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
}

// Add a teacher
async function addTeacher() {
  const nameEl = document.getElementById('teacher-name');
  const name = nameEl ? nameEl.value.trim() : '';
  if (!name) return;

  await fetch('/api/teachers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  if (nameEl) nameEl.value = '';
  loadTeachers();
}

// Submit a full review (rating + optional comment) to /reviews
async function submitReview(id) {
  const ratingSel = document.getElementById(`rating-${id}`);
  const commentEl = document.getElementById(`comment-${id}`);
  const rating = Number(ratingSel?.value);
  const comment = (commentEl?.value || '').trim();

  if (!rating || rating < 1 || rating > 5) return;

  await fetch(`/api/teachers/${id}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, comment })
  });

  if (ratingSel) ratingSel.value = '';
  if (commentEl) commentEl.value = '';
  loadTeachers();
}

// Quick star-only rating to /ratings
async function rateTeacher(id, rating) {
  if (!rating || rating < 1 || rating > 5) return;

  await fetch(`/api/teachers/${id}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating })
  });

  loadTeachers();
}

document.addEventListener('DOMContentLoaded', loadTeachers);
