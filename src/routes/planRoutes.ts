import express, { Router } from 'express';
import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  getPlansByPost
} from '../controllers/planController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Protect all routes
router.use(protect as express.RequestHandler);
router.use(authorizeRoles('admin') as express.RequestHandler);

// Plan routes
router.route('/')
  .post(createPlan as express.RequestHandler)
  .get(getAllPlans as express.RequestHandler);

router.route('/post/:postId')
  .get(getPlansByPost as express.RequestHandler);

router.route('/:id')
  .get(getPlanById as express.RequestHandler)
  .post(updatePlan as express.RequestHandler)
  .delete(deletePlan as express.RequestHandler);

export default router; 