const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

const MAX_TEACHERS = 20;
const teachers = [];
let nextId = 1;

// List teachers with reviews and average rating
app.get('/api/teachers', (req, res) => {
  const summary = teachers.map(t => ({
    id: t.id,
    name: t.name,
    reviews: t.reviews,
    averageRating: t.reviews.length
      ? t.reviews.reduce((a, b) => a + b.rating, 0) / t.reviews.length
      : null
  }));
  res.json(summary);
});

// Create a new teacher (admin only)
app.post('/api/teachers', (req, res) => {
  if (teachers.length >= MAX_TEACHERS) {
    return res.status(400).json({ error: 'Teacher limit reached' });
  }
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const teacher = { id: nextId++, name, reviews: [] };
  teachers.push(teacher);
  res.status(201).json(teacher);
});

// Get teacher details
app.get('/api/teachers/:id', (req, res) => {
  const teacher = teachers.find(t => t.id === Number(req.params.id));
  if (!teacher) {
    return res.status(404).json({ error: 'Teacher not found' });
  }
  const averageRating = teacher.reviews.length
    ? teacher.reviews.reduce((a, b) => a + b.rating, 0) / teacher.reviews.length
    : null;
  res.json({ ...teacher, averageRating });
});

// Submit a review
app.post('/api/teachers/:id/reviews', (req, res) => {
  const teacher = teachers.find(t => t.id === Number(req.params.id));
  if (!teacher) {
    return res.status(404).json({ error: 'Teacher not found' });
  }
  const { rating, comment } = req.body;
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
  }
  if (!comment) {
    return res.status(400).json({ error: 'Comment is required' });
  }
  teacher.reviews.push({ rating, comment });
  res.status(201).json(teacher);
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
