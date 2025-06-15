import express, { Router } from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Public routes
router.post('/register', registerUser as express.RequestHandler);
router.post('/login', loginUser as express.RequestHandler);

// Protected routes
router.get('/me', protect as express.RequestHandler, getMe as express.RequestHandler);

export default router; 