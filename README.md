# Teacher Rating Site

A simple website similar to Trustpilot where students can rate teachers and leave comments.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open your browser and visit [http://localhost:3000](http://localhost:3000).

### Admin Panel

Visit [http://localhost:3000/admin](http://localhost:3000/admin) to add new teachers. Teacher creation is limited to 20 entries to keep things manageable.

### Features

- Students can rate teachers from 1–5 stars and leave a comment.
- Each teacher card lists all reviews and the running average rating.

The server stores data in memory so ratings and comments will reset when the server restarts.
