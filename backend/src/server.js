require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'SIH2026 Unified Backend API',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    endpoints: {
      auth: '/api/auth',
      health: '/health'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// Export for Vercel Serverless Function deployment
module.exports = app;

// Start server locally if executed directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 SIH 2026 Backend running on http://localhost:${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
    console.log(`🔗 Auth Endpoint: http://localhost:${PORT}/api/auth`);
    console.log(`====================================================`);
  });
}