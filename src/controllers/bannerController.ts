import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Banner, IBannerInput } from '../models/Banner';
import { Category } from '../models/Category';
import { Plan } from '../models/Plan';
import { sendErrorResponse, sendSuccessResponse } from '../utils/Responses';
import { uploadToR2 } from '../utils/cloudFlareR2';
import { z } from 'zod';

// Validation schema for banner
const bannerSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  linkType: z.enum(['category', 'plan']),
  linkedCategoryId: z.string().optional(),
  linkedPlanId: z.string().optional(),
});

interface BannerRequest extends Request {
  file?: Express.Multer.File;
}

// Create new banner
export const createBanner = async (req: BannerRequest, res: Response) => {
  try {
    const validatedData = bannerSchema.parse(req.body);
    const { title, linkType, linkedCategoryId, linkedPlanId } = validatedData;

    // Validate linked entity exists
    if (linkType === 'category' && linkedCategoryId) {
      const category = await Category.findById(linkedCategoryId);
      if (!category) {
        return sendErrorResponse({
          message: 'Linked category not found',
          res
        });
      }
    } else if (linkType === 'plan' && linkedPlanId) {
      const plan = await Plan.findById(linkedPlanId);
      if (!plan) {
        return sendErrorResponse({
          message: 'Linked plan not found',
          res
        });
      }
    }

    // Handle image upload
    if (!req.file) {
      return sendErrorResponse({
        message: 'Banner image is required',
        res
      });
    }

    const key = `banners/${Date.now()}-${req.file.originalname}`;
    const uploadResult = await uploadToR2(req.file, key);

    if (!uploadResult.success) {
      return sendErrorResponse({
        message: 'Failed to upload banner image',
        res
      });
    }

    const bannerData: IBannerInput = {
      title,
      imageUrl: uploadResult.url!,
      linkType,
      linkedCategoryId: linkedCategoryId ? new mongoose.Types.ObjectId(linkedCategoryId) : undefined,
      linkedPlanId: linkedPlanId ? new mongoose.Types.ObjectId(linkedPlanId) : undefined,
    };

    const banner = await Banner.create(bannerData);

    sendSuccessResponse({
      message: 'Banner created successfully',
      data: banner,
      res
    });
  } catch (error: any) {
    console.error('Create banner error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error creating banner',
      error,
      res
    });
  }
};

// Get all banners
export const getAllBanners = async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find()
      .populate('linkedCategoryId', 'name')
      .populate('linkedPlanId', 'name')
      .sort({ createdAt: -1 });

    sendSuccessResponse({
      message: 'Banners fetched successfully',
      data: banners,
      res
    });
  } catch (error: any) {
    console.error('Get banners error:', error);
    sendErrorResponse({
      message: 'Error fetching banners',
      error,
      res
    });
  }
};

// Get banner by ID
export const getBannerById = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findById(req.params.id)
      .populate('linkedCategoryId', 'name')
      .populate('linkedPlanId', 'name');

    if (!banner) {
      return sendErrorResponse({
        message: 'Banner not found',
        res
      });
    }

    sendSuccessResponse({
      message: 'Banner fetched successfully',
      data: banner,
      res
    });
  } catch (error: any) {
    console.error('Get banner error:', error);
    sendErrorResponse({
      message: 'Error fetching banner',
      error,
      res
    });
  }
};

// Update banner
export const updateBanner = async (req: BannerRequest, res: Response) => {
  try {
    const validatedData = bannerSchema.parse(req.body);
    const { title, linkType, linkedCategoryId, linkedPlanId } = validatedData;

    // Validate linked entity exists
    if (linkType === 'category' && linkedCategoryId) {
      const category = await Category.findById(linkedCategoryId);
      if (!category) {
        return sendErrorResponse({
          message: 'Linked category not found',
          res
        });
      }
    } else if (linkType === 'plan' && linkedPlanId) {
      const plan = await Plan.findById(linkedPlanId);
      if (!plan) {
        return sendErrorResponse({
          message: 'Linked plan not found',
          res
        });
      }
    }

    const updateData: any = {
      title,
      linkType,
      linkedCategoryId: linkedCategoryId ? new mongoose.Types.ObjectId(linkedCategoryId) : undefined,
      linkedPlanId: linkedPlanId ? new mongoose.Types.ObjectId(linkedPlanId) : undefined,
    };

    // Handle image update if new file is uploaded
    if (req.file) {
      const key = `banners/${Date.now()}-${req.file.originalname}`;
      const uploadResult = await uploadToR2(req.file, key);

      if (!uploadResult.success) {
        return sendErrorResponse({
          message: 'Failed to upload banner image',
          res
        });
      }

      updateData.imageUrl = uploadResult.url;
    }

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('linkedCategoryId', 'name')
     .populate('linkedPlanId', 'name');

    if (!banner) {
      return sendErrorResponse({
        message: 'Banner not found',
        res
      });
    }

    sendSuccessResponse({
      message: 'Banner updated successfully',
      data: banner,
      res
    });
  } catch (error: any) {
    console.error('Update banner error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error updating banner',
      error,
      res
    });
  }
};

// Delete banner
export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return sendErrorResponse({
        message: 'Banner not found',
        res
      });
    }

    sendSuccessResponse({
      message: 'Banner deleted successfully',
      data: {},
      res
    });
  } catch (error: any) {
    console.error('Delete banner error:', error);
    sendErrorResponse({
      message: 'Error deleting banner',
      error,
      res
    });
  }
}; 