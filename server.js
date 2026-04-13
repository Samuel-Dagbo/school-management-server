import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './config/db.js';
import securityMiddleware from './middleware/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
securityMiddleware(app);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import studentRoutes from './routes/students.js';
import teacherRoutes from './routes/teachers.js';
import classRoutes from './routes/classes.js';
import subjectRoutes from './routes/subjects.js';
import sessionRoutes from './routes/sessions.js';
import resultRoutes from './routes/results.js';
import admissionRoutes from './routes/admissions.js';
import galleryRoutes from './routes/gallery.js';
import newsRoutes from './routes/news.js';
import publicRoutes from './routes/public.js';
import seedRoutes from './routes/seed.js';
import uploadRoutes from './routes/upload.js';
import promoteRoutes from './routes/promote.js';

app.use('/api/auth', authRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/promote', promoteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server running', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    console.log('Database connected');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;