import express, { Router } from 'express';
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
} from '../controllers/postController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { uploadSingle } from '../middleware/uploadMiddleware';

const router: Router = express.Router();

// Protect all routes
router.use(protect as express.RequestHandler);
router.use(authorizeRoles('admin') as express.RequestHandler);

// Post routes
router.route('/')
  .post(uploadSingle('logo') as express.RequestHandler, createPost as express.RequestHandler)
  .get(getAllPosts as express.RequestHandler);

router.route('/:id')
  .get(getPostById as express.RequestHandler)
  .post(uploadSingle('logo') as express.RequestHandler, updatePost as express.RequestHandler)
  .delete(deletePost as express.RequestHandler);

export default router; 