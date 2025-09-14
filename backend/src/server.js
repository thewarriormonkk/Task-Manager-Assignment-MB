const express = require('express');
const dotenv = require('dotenv');

// Load .env file - will be overridden by production environment variables
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');


// Connect to database
connectDB();

// Route files
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Initialize app
const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS
const corsOrigin = process.env.CLIENT_URL;
if (!corsOrigin) {
  console.error('CLIENT_URL environment variable is required');
  process.exit(1);
}
console.log('CORS Origin:', corsOrigin);

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  optionsSuccessStatus: 200
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'No Origin'}`);
  next();
});

// Mount routers
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});


// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});


// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT;
if (!PORT) {
  console.error('PORT environment variable is required');
  process.exit(1);
}

const server = app.listen(
  PORT,
  () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/health`);
    console.log(`API Base URL: ${process.env.API_BASE_URL || `http://localhost:${PORT}/api`}`);
  }
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
