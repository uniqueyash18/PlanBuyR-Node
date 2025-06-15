import express, { Router, RequestHandler } from 'express';
import {
  getBanners,
  getCategories,
  getPosts,
  getPostById,
  getPostsByCategory,
  getPlansByPost,
  getHomePageData
} from '../controllers/publicController';

const router: Router = express.Router();

// Homepage route
router.get('/home', getHomePageData as RequestHandler);

// Banner routes
router.get('/banners', getBanners as RequestHandler);

// Category routes
router.get('/categories', getCategories as RequestHandler);
router.get('/categories/:categoryId/posts', getPostsByCategory as RequestHandler);

// Post routes
router.get('/posts', getPosts as RequestHandler);
router.get('/posts/:postId', getPostById as RequestHandler);
router.get('/posts/:postId/plans', getPlansByPost as RequestHandler);

export default router; 