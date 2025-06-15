import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoose from 'mongoose';
import authRoutes from './src/routes/authRoutes';
import { uploadMultiple, uploadSingle } from './src/middleware/uploadMiddleware';
import categoryRoutes from './src/routes/categoryRoutes';
import postRoutes from './src/routes/postRoutes';
import planRoutes from './src/routes/planRoutes';
import publicRoutes from './src/routes/publicRoutes';
import adminRoutes from './src/routes/adminRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app: Express = express();
const port = process.env.PORT || 5000;

// Database connection function
const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);
    console.log('⚡️[database]: MongoDB connected successfully');
  } catch (error) {
    console.error('❌[database]: MongoDB connection error:', error);
    process.exit(1);
  }
};

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Basic error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the API' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

app.post('/upload', uploadSingle('image'), (req, res) => {
  // Access uploaded file via req.file
  res.json({ 
    success: true, 
    file: req.file 
  });
});

app.post('/upload-multiple', uploadMultiple('images', 3), (req, res) => {
  // Access uploaded files via req.files
  res.json({ 
    success: true, 
    files: req.files 
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 