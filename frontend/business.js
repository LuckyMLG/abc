function getToken() {
  return localStorage.getItem('token');
}

async function loadBusiness() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) return;

  const res = await fetch(`/api/businesses/${id}`);
  const biz = await res.json();

  document.getElementById('biz-name').textContent = biz.name;
  document.getElementById('biz-meta').textContent = `${biz.category} • ${biz.location}`;
  document.getElementById('biz-rating').textContent = biz.averageRating ? `${biz.averageRating.toFixed(1)} (${biz.reviewCount} reviews)` : 'No reviews yet';

  const container = document.getElementById('reviews');
  container.innerHTML = '';
  biz.reviews.forEach(r => {
    const div = document.createElement('div');
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    div.innerHTML = `<p class="text-sm">${stars} by ${r.reviewer}</p><p class="text-gray-700">${r.text}</p><p class="text-xs text-gray-400">${new Date(r.timestamp).toLocaleString()}</p>`;
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
    await fetch(`/api/businesses/${id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ rating, text })
    });
    document.getElementById('review-rating').value = '';
    document.getElementById('review-text').value = '';
    loadBusiness();
  });
}

document.addEventListener('DOMContentLoaded', loadBusiness);
