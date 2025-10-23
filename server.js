const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// DB connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Mythilireddy28@',
  database: 'assetdb'
});

// Connect to DB
db.connect(err => {
  if (err) {
    console.error('DB connection failed:', err);
    return;
  }
  console.log('MySQL connected');
});

// SUBMIT request (used by employee form)
app.post('/api/submit', (req, res) => {
  const { employeeName, employeeId, jobRole, assetType, startDate, reason } = req.body;

  if (!employeeName || !employeeId || !jobRole || !assetType || !startDate || !reason) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const sql = `
    INSERT INTO assets (employeeName, employeeId, jobRole, assetType, startDate, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [employeeName, employeeId, jobRole, assetType, startDate, reason];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ message: 'Database insert failed' });
    }
    res.status(200).json({ message: 'Asset request submitted successfully!' });
  });
});

// GET all requests (for HR dashboard)
app.get('/api/requests', (req, res) => {
  const sql = 'SELECT * FROM assets ORDER BY createdAt DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Fetch error:', err);
      return res.status(500).json({ message: 'Failed to fetch requests' });
    }
    res.json(results);
  });
});

// UPDATE status (Approve or Reject)
app.put('/api/requests/:id/status', (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const sql = 'UPDATE assets SET status = ? WHERE id = ?';
  db.query(sql, [status, requestId], (err, result) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ error: 'Failed to update status' });
    }
    res.json({ message: 'Status updated successfully' });
  });
});

// DELETE all requests (clear records)
app.delete('/api/requests', (req, res) => {
  const sql = 'DELETE FROM assets';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete records' });
    }
    res.json({ message: 'All records deleted successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
