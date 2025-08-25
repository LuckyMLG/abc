async function searchTeachers(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('search-name').value.trim();
  const subject = document.getElementById('search-subject').value.trim();
  const school = document.getElementById('search-school').value.trim();
  const params = new URLSearchParams();
  if (name) params.append('search', name);
  if (subject) params.append('subject', subject);
  if (school) params.append('school', school);
  const res = await fetch('/api/teachers?' + params.toString());
  const data = await res.json();
  const container = document.getElementById('results');
  container.innerHTML = '';
  data.results.forEach(t => {
    const div = document.createElement('div');
    div.className = 'border border-green-700 p-4 rounded';
    const rating = t.averageRating ? t.averageRating.toFixed(1) : 'N/A';
    div.innerHTML = `
      <h3 class="text-lg font-semibold"><a href="/teacher.html?id=${t.id}" class="text-green-400 hover:text-green-200">${t.name}</a></h3>
      <p class="text-sm">${t.subject} • ${t.school}</p>
      <p class="text-sm">Rating: ${rating} (${t.reviewCount} reviews)</p>
    `;
    container.appendChild(div);
  });
}

document.getElementById('search-form').addEventListener('submit', searchTeachers);
document.addEventListener('DOMContentLoaded', searchTeachers);
