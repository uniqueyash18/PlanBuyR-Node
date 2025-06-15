import express, { Router, RequestHandler } from 'express';
import { adminLogin } from '../controllers/adminController';

const router: Router = express.Router();

// Admin login route
router.post('/login', adminLogin as RequestHandler);

export default router; 