const express = require('express');
const pool = require('../config/database');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
      [email, password, role]
    );
    
    res.json({ message: 'User registered', user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;