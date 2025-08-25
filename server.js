const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// ---- In-memory data stores ---- //
const teachers = [];
let nextTeacherId = 1;


const users = [];
let nextUserId = 1;

// token -> userId
const sessions = new Map();

// admin auth
const adminSessions = new Set();
const ADMIN = { username: 'admin', password: 'strawberry' };

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

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const [scheme, token] = auth.split(' ');
  if (scheme === 'Bearer' && token && adminSessions.has(token)) {
    return next();
  }
  return res.status(401).json({ error: 'Admin auth required' });
}

// ---- Auth Routes ---- //
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (users.some(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already in use' });
  }
  const user = { id: nextUserId++, username, password };
  users.push(user);
  res.status(201).json({ message: 'Signup successful' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = crypto.randomBytes(16).toString('hex');
  sessions.set(token, user.id);
  res.json({ token });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN.username && password === ADMIN.password) {
    const token = crypto.randomBytes(16).toString('hex');
    adminSessions.add(token);
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/my-reviews', requireAuth, (req, res) => {
  const mine = [];
  teachers.forEach(b => {
    b.reviews
      .filter(r => r.userId === req.userId)
      .forEach(r => {
        mine.push({
          teacherId: b.id,
          teacherName: b.name,
          rating: r.rating,
          text: r.text,
          timestamp: r.timestamp
        });
      });
  });
  res.json(mine);
});

// ---- Teacher Routes ---- //
app.get('/api/teachers', (req, res) => {
  const { search = '', subject = '', school = '', page = 1, limit = 10 } = req.query;

  let results = teachers.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) &&
    (!subject || b.subject.toLowerCase().includes(subject.toLowerCase())) &&
    (!school || b.school.toLowerCase().includes(school.toLowerCase()))
  );

  const start = (Number(page) - 1) * Number(limit);
  const paged = results.slice(start, start + Number(limit));

  const formatted = paged.map(b => ({
    id: b.id,
    name: b.name,
    subject: b.subject,
    school: b.school,
    averageRating: averageFromReviews(b.reviews),
    reviewCount: b.reviews.length,
    photo: b.photo || null
  }));

  res.json({ results: formatted, total: results.length });
});

app.get('/api/teachers/:id', (req, res) => {
  const teacher = teachers.find(b => b.id === Number(req.params.id));
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
  const reviews = teacher.reviews.map(r => {
    const user = users.find(u => u.id === r.userId);
    const reviewer = user ? user.username : 'Anonymous';
    return { rating: r.rating, text: r.text, timestamp: r.timestamp, reviewer };
  });
  res.json({
    id: teacher.id,
    name: teacher.name,
    subject: teacher.subject,
    school: teacher.school,
    description: teacher.description,
    photo: teacher.photo,
    reviews,
    averageRating: averageFromReviews(teacher.reviews),
    reviewCount: teacher.reviews.length
  });
});

app.post('/api/teachers', requireAdmin, (req, res) => {
  const { name, subject = '', school = '', description = '', photo = '' } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const teacher = {
    id: nextTeacherId++,
    name: name.trim(),
    subject: subject.trim(),
    school: school.trim(),
    description: description.trim(),
    photo: photo.trim(),
    reviews: []
  };
  teachers.push(teacher);
  res.status(201).json(teacher);
});

app.post('/api/teachers/:id/reviews', requireAuth, (req, res) => {
  const teacher = teachers.find(b => b.id === Number(req.params.id));
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

  const { rating, text = '' } = req.body || {};
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be 1-5' });
  }

  // Enforce a one hour cooldown between reviews per user/teacher
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const recentReview = teacher.reviews.find(r =>
    r.userId === req.userId && new Date(r.timestamp).getTime() > oneHourAgo
  );
  if (recentReview) {
    return res
      .status(429)
      .json({ error: 'You can only submit one review per hour for this teacher' });
  }

  const review = {
    userId: req.userId,
    rating,
    text: String(text).trim(),
    timestamp: new Date().toISOString()
  };
  teacher.reviews.push(review);
  res.status(201).json({
    ...teacher,
    averageRating: averageFromReviews(teacher.reviews),
    reviewCount: teacher.reviews.length
  });
});

// ---- Static frontend ---- //
app.use(express.static(path.join(__dirname, 'frontend')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

