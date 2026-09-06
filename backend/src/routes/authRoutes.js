const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'sih_jwt_secret_key_2026';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

router.post('/register', async (req, res) => {
  try {
    const { email, password, role, full_name, first_name, last_name, company_name, contact_person_name } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    const validRoles = ['student', 'company', 'faculty', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        email: email.toLowerCase().trim(),
        password_hash,
        role,
        full_name
      }])
      .select('id, email, role, full_name, created_at')
      .single();

    if (insertError) throw insertError;

    if (role === 'student') {
      await supabase.from('students').insert([{
        user_id: newUser.id,
        first_name,
        last_name
      }]);
    } else if (role === 'faculty') {
      await supabase.from('faculty').insert([{
        user_id: newUser.id,
        first_name,
        last_name
      }]);
    } else if (role === 'company') {
      await supabase.from('companies').insert([{
        user_id: newUser.id,
        company_name: company_name || 'My Company',
        contact_person_name: contact_person_name || full_name
      }]);
    }

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Internal server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete user.password_hash;
    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Internal server error during login' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, full_name, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/test-connection', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) throw error;
    res.json({ success: true, message: 'Supabase connected successfully!', data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;