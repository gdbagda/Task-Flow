require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const boardRoutes = require('./src/routes/boardRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const aiRoutes = require('./src/routes/aiRoutes');

const {
  errorHandler,
  notFound,
} = require('./src/middleware/errorMiddleware');

// Connect Database
connectDB();

const app = express();

// ======================
// Middleware
// ======================

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ======================
// Health Check
// ======================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ======================
// API Routes
// ======================

app.use('/api/auth', authRoutes);

app.use('/api/boards', boardRoutes);

// IMPORTANT: Nested Task Routes
app.use('/api/boards/:boardId/tasks', taskRoutes);

app.use('/api/ai', aiRoutes);

// ======================
// Error Handlers
// ======================

app.use(notFound);

app.use(errorHandler);

// ======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 TaskFlow server running on port ${PORT} [${process.env.NODE_ENV}]`
  );
});

module.exports = app;