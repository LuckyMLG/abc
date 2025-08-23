const loadTeachers = async () => {
  const res = await fetch('/api/teachers');
  const teachers = await res.json();
  const container = document.getElementById('teachers');
  container.innerHTML = '';
  teachers.forEach(t => {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow p-6';
    const ratingHtml = t.averageRating !== null
      ? `<div class="flex items-center mb-4"><div class="flex space-x-1">${renderStars(t.averageRating)}</div><span class="ml-2 text-sm text-gray-600">${t.averageRating.toFixed(2)}</span></div>`
      : '<p class="text-gray-500 mb-4">No ratings yet</p>';
    div.innerHTML = `
      <h3 class="text-xl font-semibold mb-2">${t.name}</h3>
      ${ratingHtml}
      <div class="flex space-x-1">${renderRateControls(t.id)}</div>
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

const renderRateControls = id => {
  let controls = '';
  for (let i = 1; i <= 5; i++) {
    controls += `<i class="fa-solid fa-star text-gray-300 hover:text-yellow-400 cursor-pointer" onclick="rateTeacher(${id}, ${i})"></i>`;
  }
  return controls;
};

const addTeacher = async () => {
  const name = document.getElementById('teacher-name').value;
  if (!name) return;
  await fetch('/api/teachers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  document.getElementById('teacher-name').value = '';
  loadTeachers();
};

const rateTeacher = async (id, rating) => {
  if (!rating) return;
  await fetch(`/api/teachers/${id}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating })
  });
  loadTeachers();
};

document.addEventListener('DOMContentLoaded', loadTeachers);

