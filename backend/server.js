require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/db');
const initDB = require('./config/initDB');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database tables
initDB().catch(err => {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/subscribers', require('./routes/subscribers'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/media', require('./routes/media'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/interactions', require('./routes/interactions'));

// Static files
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // All other routes serve React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
} else {
  // Development health check
  app.get('/', (req, res) => {
    res.json({
      message: 'Small Letters API is running',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        auth: '/api/auth',
        posts: '/api/posts',
        subscribers: '/api/subscribers',
        upload: '/api/upload',
        media: '/api/media',
        comments: '/api/comments',
        interactions: '/api/interactions'
      }
    });
  });
}

// Health check endpoint (always available)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════╗
║       Small Letters Server Started         ║
╚════════════════════════════════════════════╝

Environment: ${process.env.NODE_ENV || 'development'}
Port:        ${PORT}
Database:    ${process.env.DATABASE_URL ? '✓ Connected' : '✗ Not configured'}
Email:       ${process.env.EMAIL_SERVICE || '✗ Not configured'}

Local:       http://localhost:${PORT}
Network:     http://192.168.1.5:${PORT}

API Ready:   http://localhost:${PORT}/api
Health:      http://localhost:${PORT}/health
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});