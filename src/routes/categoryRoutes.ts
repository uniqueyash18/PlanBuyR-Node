import express, { Router } from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { uploadSingle } from '../middleware/uploadMiddleware';

const router: Router = express.Router();

// Protect all routes
router.use(protect as express.RequestHandler);
router.use(authorizeRoles('admin') as express.RequestHandler);

// Category routes
router.route('/')
  .post(uploadSingle('image'), createCategory as express.RequestHandler)
  .get(getAllCategories as express.RequestHandler);

router.route('/:id')
  .get(getCategoryById as express.RequestHandler)
  .post(uploadSingle('image'), updateCategory as express.RequestHandler)
  .delete(deleteCategory as express.RequestHandler);

export default router; 