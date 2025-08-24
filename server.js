const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// Simple password protection for admin actions
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'classroom123';

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const [scheme, encoded] = auth.split(' ');
  if (scheme !== 'Basic' || !encoded) {
    res.set('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).send('Authentication required.');
  }

  const [, password] = Buffer.from(encoded, 'base64').toString().split(':');
  if (password !== ADMIN_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).send('Authentication required.');
  }

  next();
}

// Config & in-memory store
const MAX_TEACHERS = 20;
const teachers = [];
let nextId = 1;

// Helper to compute average from reviews
function averageFromReviews(reviews) {
  if (!reviews || reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  return sum / reviews.length;
}

// List teachers (summary)
app.get('/api/teachers', (req, res) => {
  const summary = teachers.map(t => ({
    id: t.id,
    name: t.name,
    reviews: t.reviews, // included so frontend can render comments
    averageRating: averageFromReviews(t.reviews)
  }));
  res.json(summary);
});

// Create a new teacher (admin flow enforces a simple cap)
app.post('/api/teachers', requireAdmin, (req, res) => {
  if (teachers.length >= MAX_TEACHERS) {
    return res.status(400).json({ error: 'Teacher limit reached' });
  }

  const { name } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const teacher = { id: nextId++, name: name.trim(), reviews: [] };
  teachers.push(teacher);
  res.status(201).json(teacher);
});

// Get teacher details (with computed average)
app.get('/api/teachers/:id', (req, res) => {
  const teacher = teachers.find(t => t.id === Number(req.params.id));
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

  const averageRating = averageFromReviews(teacher.reviews);
  res.json({ ...teacher, averageRating });
});

// Submit a full review (rating + optional comment)
app.post('/api/teachers/:id/reviews', (req, res) => {
  const teacher = teachers.find(t => t.id === Number(req.params.id));
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

  const { rating, comment } = req.body || {};
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
  }

  teacher.reviews.push({
    rating,
    comment: typeof comment === 'string' ? comment.trim() : ''
  });

  res.status(201).json({ ...teacher, averageRating: averageFromReviews(teacher.reviews) });
});

// Quick star-only rating (no comment)
app.post('/api/teachers/:id/ratings', (req, res) => {
  const teacher = teachers.find(t => t.id === Number(req.params.id));
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

  const { rating } = req.body || {};
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
  }

  teacher.reviews.push({ rating, comment: '' });
  res.status(201).json({ ...teacher, averageRating: averageFromReviews(teacher.reviews) });
});

// Admin page (protected)
app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin.html'));
});
app.get('/admin.html', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin.html'));
});

// Serve frontend assets
app.use(express.static(path.join(__dirname, 'frontend')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
