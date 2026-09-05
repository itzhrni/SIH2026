const express = require('express');
const supabase = require('../config/supabaseClient');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password_hash: password, role }])
      .select();
    
    if (error) throw error;
    res.json({ message: 'User registered', user: data[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/test-connection', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    res.json({ success: true, message: 'DB Connected!', data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;