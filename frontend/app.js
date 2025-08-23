async function loadTeachers() {
  const res = await fetch('/api/teachers');
  const teachers = await res.json();
  const container = document.getElementById('teachers');
  container.innerHTML = '';
  teachers.forEach(t => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>${t.name}</h3>
      <p>Average rating: ${t.averageRating !== null ? t.averageRating.toFixed(2) : 'No ratings yet'}</p>
      <input placeholder="Rate 1-5" id="rate-${t.id}" />
      <button onclick="rateTeacher(${t.id})">Rate</button>
    `;
    container.appendChild(div);
  });
}

async function addTeacher() {
  const name = document.getElementById('teacher-name').value;
  if (!name) return;
  await fetch('/api/teachers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  document.getElementById('teacher-name').value = '';
  loadTeachers();
}

async function rateTeacher(id) {
  const input = document.getElementById(`rate-${id}`);
  const rating = Number(input.value);
  if (!rating) return;
  await fetch(`/api/teachers/${id}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating })
  });
  input.value = '';
  loadTeachers();
}

loadTeachers();
