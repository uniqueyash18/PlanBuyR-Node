import express from 'express';
import { createBanner, deleteBanner, getAllBanners, getBannerById, updateBanner } from '../controllers/bannerController';
import { uploadSingle } from '../middleware/uploadMiddleware';

const router = express.Router();

// Create banner (with image upload)
router.post('/', uploadSingle('image'), createBanner);

// Get all banners
router.get('/', getAllBanners);

// Get banner by ID
router.get('/:id', getBannerById);

// Update banner (with optional image upload)
router.post('/:id', uploadSingle('image'), updateBanner);

// Delete banner
router.delete('/:id', deleteBanner);

export default router; 