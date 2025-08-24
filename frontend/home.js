async function searchBusinesses(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('search-name').value.trim();
  const category = document.getElementById('search-category').value.trim();
  const location = document.getElementById('search-location').value.trim();
  const params = new URLSearchParams();
  if (name) params.append('search', name);
  if (category) params.append('category', category);
  if (location) params.append('location', location);
  const res = await fetch('/api/businesses?' + params.toString());
  const data = await res.json();
  const container = document.getElementById('results');
  container.innerHTML = '';
  data.results.forEach(b => {
    const div = document.createElement('div');
    div.className = 'border p-4 rounded';
    const rating = b.averageRating ? b.averageRating.toFixed(1) : 'N/A';
    div.innerHTML = `
      <h3 class="text-lg font-semibold"><a href="/business.html?id=${b.id}" class="text-blue-600 hover:underline">${b.name}</a></h3>
      <p class="text-sm text-gray-600">${b.category} • ${b.location}</p>
      <p class="text-sm">Rating: ${rating} (${b.reviewCount} reviews)</p>
    `;
    container.appendChild(div);
  });
}

document.getElementById('search-form').addEventListener('submit', searchBusinesses);
document.addEventListener('DOMContentLoaded', searchBusinesses);
