const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// ---- In-memory data stores ---- //
const businesses = [];
let nextBusinessId = 1;

// Sample businesses for demo purposes
businesses.push(
  { id: nextBusinessId++, name: 'Coffee Spot', category: 'Cafe', location: 'New York', website: '', logo: '', reviews: [] },
  { id: nextBusinessId++, name: 'Tech Guru', category: 'Electronics', location: 'San Francisco', website: '', logo: '', reviews: [] }
);

const users = [];
let nextUserId = 1;

// token -> userId
const sessions = new Map();

// ---- Helpers ---- //
function averageFromReviews(reviews) {
  if (!reviews || reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  return sum / reviews.length;
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const [scheme, token] = auth.split(' ');
  if (scheme === 'Bearer' && token && sessions.has(token)) {
    req.userId = sessions.get(token);
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

// ---- Auth Routes ---- //
app.post('/api/signup', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already in use' });
  }
  const user = { id: nextUserId++, email, password };
  users.push(user);
  res.status(201).json({ message: 'Signup successful' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = crypto.randomBytes(16).toString('hex');
  sessions.set(token, user.id);
  res.json({ token });
});

app.get('/api/my-reviews', requireAuth, (req, res) => {
  const mine = [];
  businesses.forEach(b => {
    b.reviews
      .filter(r => r.userId === req.userId)
      .forEach(r => {
        mine.push({
          businessId: b.id,
          businessName: b.name,
          rating: r.rating,
          text: r.text,
          timestamp: r.timestamp
        });
      });
  });
  res.json(mine);
});

// ---- Business Routes ---- //
app.get('/api/businesses', (req, res) => {
  const { search = '', category = '', location = '', page = 1, limit = 10 } = req.query;

  let results = businesses.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) &&
    (!category || b.category.toLowerCase().includes(category.toLowerCase())) &&
    (!location || b.location.toLowerCase().includes(location.toLowerCase()))
  );

  const start = (Number(page) - 1) * Number(limit);
  const paged = results.slice(start, start + Number(limit));

  const formatted = paged.map(b => ({
    id: b.id,
    name: b.name,
    category: b.category,
    location: b.location,
    averageRating: averageFromReviews(b.reviews),
    reviewCount: b.reviews.length,
    logo: b.logo || null
  }));

  res.json({ results: formatted, total: results.length });
});

app.get('/api/businesses/:id', (req, res) => {
  const business = businesses.find(b => b.id === Number(req.params.id));
  if (!business) return res.status(404).json({ error: 'Business not found' });
  const reviews = business.reviews.map(r => {
    const user = users.find(u => u.id === r.userId);
    const reviewer = user ? user.email.split('@')[0] : 'Anonymous';
    return { rating: r.rating, text: r.text, timestamp: r.timestamp, reviewer };
  });
  res.json({
    id: business.id,
    name: business.name,
    category: business.category,
    location: business.location,
    website: business.website,
    logo: business.logo,
    reviews,
    averageRating: averageFromReviews(business.reviews),
    reviewCount: business.reviews.length
  });
});

app.post('/api/businesses', (req, res) => {
  const { name, category = '', location = '', website = '', logo = '' } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const business = {
    id: nextBusinessId++,
    name: name.trim(),
    category: category.trim(),
    location: location.trim(),
    website: website.trim(),
    logo: logo.trim(),
    reviews: []
  };
  businesses.push(business);
  res.status(201).json(business);
});

app.post('/api/businesses/:id/reviews', requireAuth, (req, res) => {
  const business = businesses.find(b => b.id === Number(req.params.id));
  if (!business) return res.status(404).json({ error: 'Business not found' });

  const { rating, text = '' } = req.body || {};
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be 1-5' });
  }

  const review = {
    userId: req.userId,
    rating,
    text: String(text).trim(),
    timestamp: new Date().toISOString()
  };
  business.reviews.push(review);
  res.status(201).json({
    ...business,
    averageRating: averageFromReviews(business.reviews),
    reviewCount: business.reviews.length
  });
});

// ---- Static frontend ---- //
app.use(express.static(path.join(__dirname, 'frontend')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

