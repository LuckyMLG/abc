const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

const teachers = [];
let nextId = 1;

// List teachers with average rating
app.get('/api/teachers', (req, res) => {
  const summary = teachers.map(t => ({
    id: t.id,
    name: t.name,
    averageRating: t.ratings.length ? t.ratings.reduce((a, b) => a + b, 0) / t.ratings.length : null
  }));
  res.json(summary);
});

// Create a new teacher
app.post('/api/teachers', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const teacher = { id: nextId++, name, ratings: [] };
  teachers.push(teacher);
  res.status(201).json(teacher);
});

// Get teacher details
app.get('/api/teachers/:id', (req, res) => {
  const teacher = teachers.find(t => t.id === Number(req.params.id));
  if (!teacher) {
    return res.status(404).json({ error: 'Teacher not found' });
  }
  const averageRating = teacher.ratings.length ? teacher.ratings.reduce((a, b) => a + b, 0) / teacher.ratings.length : null;
  res.json({ ...teacher, averageRating });
});

// Submit a rating
app.post('/api/teachers/:id/ratings', (req, res) => {
  const teacher = teachers.find(t => t.id === Number(req.params.id));
  if (!teacher) {
    return res.status(404).json({ error: 'Teacher not found' });
  }
  const { rating } = req.body;
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
  }
  teacher.ratings.push(rating);
  res.status(201).json(teacher);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
