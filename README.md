
If you prefer a patch you can apply:

```diff
*** a/README.md
--- b/README.md
@@
-# Teacher Rating Site
-
-<<<<<<< codex/create-student-teacher-rating-website-t99msy
-A simple website similar to Trustpilot where students can rate teachers and leave comments.
-=======
-A simple website similar to Trustpilot where students can rate teachers.
->>>>>>> main
+# Teacher Rating Site
+
+A simple website similar to Trustpilot where students can rate teachers and leave comments.
@@
 3. Open your browser and visit [http://localhost:3000](http://localhost:3000).
 
-<<<<<<< codex/create-student-teacher-rating-website-t99msy
-### Admin Panel
-
-Visit [http://localhost:3000/admin](http://localhost:3000/admin) to add new teachers. Teacher creation is limited to 20 entries to keep things manageable.
-
-### Features
-
-- Students can rate teachers from 1–5 stars and leave a comment.
-- Each teacher card lists all reviews and the running average rating.
-
-The server stores data in memory so ratings and comments will reset when the server restarts.
-=======
-The server stores data in memory so ratings will reset when the server restarts.
->>>>>>> main
+### Admin Panel
+
+Visit [http://localhost:3000/admin](http://localhost:3000/admin) to add new teachers. Teacher creation is limited to 20 entries to keep things manageable.
+
+### Features
+
+- Students can rate teachers from 1–5 stars and leave a comment.
+- Each teacher card lists all reviews and the running average rating.
+
+The server stores data in memory, so ratings and comments will reset when the server restarts.
