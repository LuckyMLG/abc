const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// ---- In-memory data stores ---- //
const teachers = [];
let nextTeacherId = 1;

// Sample teachers for demo purposes
teachers.push(
  { id: nextTeacherId++, name: 'Jane Doe', subject: 'Mathematics', school: 'Springfield High', website: '', logo: '', reviews: [] },
  { id: nextTeacherId++, name: 'John Smith', subject: 'History', school: 'Shelbyville High', website: '', logo: '', reviews: [] }
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
    logo: b.logo || null
  }));

  res.json({ results: formatted, total: results.length });
});

app.get('/api/teachers/:id', (req, res) => {
  const teacher = teachers.find(b => b.id === Number(req.params.id));
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
  const reviews = teacher.reviews.map(r => {
    const user = users.find(u => u.id === r.userId);
    const reviewer = user ? user.email.split('@')[0] : 'Anonymous';
    return { rating: r.rating, text: r.text, timestamp: r.timestamp, reviewer };
  });
  res.json({
    id: teacher.id,
    name: teacher.name,
    subject: teacher.subject,
    school: teacher.school,
    website: teacher.website,
    logo: teacher.logo,
    reviews,
    averageRating: averageFromReviews(teacher.reviews),
    reviewCount: teacher.reviews.length
  });
});

app.post('/api/teachers', (req, res) => {
  const { name, subject = '', school = '', website = '', logo = '' } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const teacher = {
    id: nextTeacherId++,
    name: name.trim(),
    subject: subject.trim(),
    school: school.trim(),
    website: website.trim(),
    logo: logo.trim(),
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

