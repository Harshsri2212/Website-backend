// backend/server.js

console.log("🟢 This is the CORRECT server file being run");

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});




// ✅ Internship Listing Route
app.get('/api/internships', (req, res) => {
  console.log("🟢 /api/internships called");
  const sql = 'SELECT * FROM internships ORDER BY posted_on DESC';
  pool.query(sql, (err, result) => {
    if (err) {
      console.error("❌ MySQL error:", err);
      return res.status(500).send('Database query failed');
    }
    res.json(result);
  });
});



app.post('/api/internships', (req, res) => {
  console.log("🟢 POST /api/internships route hit");
  const { title, company, location, description } = req.body;
  const sql = `INSERT INTO internships (title, company, location, description, posted_on)
               VALUES (?, ?, ?, ?, CURDATE())`;
  pool.query(sql, [title, company, location, description], (err, result) => {
    if (err) {
      console.error("❌ SQL Error:", err);
      return res.status(500).send(err);
    }
    res.json({ message: '✅ Internship added successfully' });
  });
});

app.post('/api/apply', (req, res) => {
  const { student_name, student_email, internship_id, message } = req.body;

  const applied_on = new Date().toISOString().slice(0, 10);

  const sql = `
    INSERT INTO applied_internships 
    (student_name, student_email, internship_id, applied_on, message)
    VALUES (?, ?, ?, ?, ?)
  `;

  pool.query(sql, [student_name, student_email, internship_id, applied_on, message], (err, result) => {
    if (err) {
      console.error("❌ SQL Error in /api/apply:", err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(200).json({ message: '✅ Application submitted successfully' });
  });
});


// app.post('/api/apply', (req, res) => {
//   const { student_name, student_email, internship_id } = req.body;

//   if (!student_name || !student_email || !internship_id) {
//     return res.status(400).json({ message: 'Missing required fields' });
//   }

//   const applied_on = new Date().toISOString().slice(0, 10);

//   const sql = `
//     INSERT INTO applied_internships (student_name, student_email, internship_id, applied_on)
//     VALUES (?, ?, ?, ?)
//   `;

//   db.query(sql, [student_name, student_email, internship_id, applied_on], (err, result) => {
//     if (err) {
//       console.error("❌ Application SQL Error:", err);
//       return res.status(500).json({ message: 'Database error' });
//     }
//     res.status(200).json({ message: '✅ Application submitted successfully' });
//   });
// });




// ✅ Student Registration
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword =  bcrypt.hashSync(password, 10);

    const sql = `INSERT INTO students (name, email, password) VALUES (?, ?, ?)`;
    pool.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email already registered' });
        }
        return res.status(500).send(err);
      }
      res.json({ message: '✅ Registered successfully!' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

app.post('/api/student-login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM students WHERE email = ?';

  pool.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(400).json({ message: 'Student not found' });

    const user = results[0];
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    res.json({ message: 'Login successful', user: { id: user.id, email: user.email } });
  });
});

app.post('/api/admin-login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@portal.com' && password === 'admin123') {
    res.json({ message: 'Admin login successful' });
  } else {
    res.status(401).json({ message: 'Invalid admin credentials' });
  }
});


app.get('/api/applied', (req, res) => {
  const studentEmail = req.query.email;
  if (!studentEmail) {
    return res.status(400).json({ error: "Missing student email" });
  }

  const sql = `
    SELECT 
      a.id AS application_id,
      a.student_name,
      a.student_email,
      a.applied_on,
      a.message,
      i.title,
      i.company,
      i.location
    FROM applied_internships a
    JOIN internships i ON a.internship_id = i.id
    WHERE a.student_email = ?
    ORDER BY a.applied_on DESC
  `;

  pool.query(sql, [studentEmail], (err, results) => {
    if (err) {
      console.error("❌ Error fetching applied internships:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(results);
  });
});

// ✅ New route to get all students
app.get('/api/students', (req, res) => {
  const sql = 'SELECT * FROM students';
  pool.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Failed to fetch students:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
});

app.delete('/api/applications/:id', (req, res) => {
  const id = req.params.id;

  const sql = 'DELETE FROM applied_internships WHERE id = ?';
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Failed to delete application:", err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.json({ message: '✅ Application deleted successfully' });
  });
});

// ✅ Admin: Fetch ALL applications (for admin dashboard)
app.get('/api/admin/applications', (req, res) => {
  const sql = `
    SELECT 
      a.id AS application_id,
      a.student_name,
      a.student_email,
      a.applied_on,
      a.message,
      i.title,
      i.company,
      i.location
    FROM applied_internships a
    JOIN internships i ON a.internship_id = i.id
    ORDER BY a.applied_on DESC
  `;

  pool.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching applications for admin:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(results);
  });
});


// ✅ Start server (this must be LAST)
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
