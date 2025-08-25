async function searchTeachers(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('search-name').value.trim();
  const params = new URLSearchParams();
  if (name) params.append('search', name);
  const res = await fetch('/api/teachers?' + params.toString());
  const data = await res.json();
  const container = document.getElementById('results');
  container.innerHTML = '';
  data.results.forEach(t => {
    const div = document.createElement('div');
    div.className = 'border border-green-700 p-4 rounded flex items-center space-x-4';
    const rating = t.averageRating ? t.averageRating.toFixed(1) : 'N/A';
    const photo = t.photo
      ? `<img src="${t.photo}" class="h-16 w-16 rounded-full object-cover" alt="${t.name}" />`
      : `<div class="h-16 w-16 rounded-full bg-green-800"></div>`;
    div.innerHTML = `
      ${photo}
      <div>
        <h3 class="text-lg font-semibold"><a href="/teacher.html?id=${t.id}" class="text-green-400 hover:text-green-200">${t.name}</a></h3>
        <p class="text-sm">${t.subject} • ${t.school}</p>
        <p class="text-sm">Rating: ${rating} (${t.reviewCount} reviews)</p>
      </div>
    `;
    container.appendChild(div);
  });
}

document.getElementById('search-form').addEventListener('submit', searchTeachers);
document.addEventListener('DOMContentLoaded', searchTeachers);
