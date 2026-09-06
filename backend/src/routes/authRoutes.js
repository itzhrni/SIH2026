const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'sih_jwt_secret_key_2026';

const ROLE_MAP = {
  student: 'STUDENT',
  STUDENT: 'STUDENT',
  company: 'INDUSTRY',
  industry: 'INDUSTRY',
  INDUSTRY: 'INDUSTRY',
  faculty: 'ACADEMICIAN',
  academician: 'ACADEMICIAN',
  ACADEMICIAN: 'ACADEMICIAN',
  admin: 'INSTITUTIONAL_ADMIN',
  institutional_admin: 'INSTITUTIONAL_ADMIN',
  INSTITUTIONAL_ADMIN: 'INSTITUTIONAL_ADMIN'
};

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
    const { email, password, role, name, full_name, institution, department, expertise } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    const normalizedRole = ROLE_MAP[role];
    if (!normalizedRole) {
      return res.status(400).json({ error: `Invalid role. Must be one of: STUDENT, INDUSTRY, ACADEMICIAN, INSTITUTIONAL_ADMIN` });
    }

    const userName = name || full_name || email.split('@')[0];

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const now = new Date().toISOString();

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        email: email.toLowerCase().trim(),
        name: userName,
        passwordHash,
        role: normalizedRole,
        institution: institution || null,
        department: department || null,
        expertise: expertise || null,
        createdAt: now,
        updatedAt: now
      }])
      .select('id, email, role, name, createdAt')
      .single();

    if (insertError) throw insertError;

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

    const userHash = user.passwordHash || user.password_hash;
    if (!userHash) {
      return res.status(401).json({ error: 'Invalid account configuration' });
    }

    const isMatch = await bcrypt.compare(password, userHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete user.passwordHash;
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
      .select('id, email, role, name, createdAt')
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
      .select('id, email, name, role')
      .limit(5);

    if (error) throw error;
    res.json({ success: true, message: 'Supabase connected successfully!', count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;