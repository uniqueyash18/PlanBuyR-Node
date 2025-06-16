import { Request, Response } from 'express';
import { Banner } from '../models/Banner';
import { Category } from '../models/Category';
import { Post } from '../models/Post';
import { Plan } from '../models/Plan';
import { paginationSchema } from '../validations/validationSchemas';
import { sendErrorResponse, sendSuccessResponse } from '../utils/Responses';

// Get all banners
export const getBanners = async (req: Request, res: Response) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);

    const skip = (page - 1) * limit;

    const [banners, total] = await Promise.all([
      Banner.find()
        .populate('linkedCategoryId', 'name')
        .populate('linkedPlanId', 'duration price')
        .skip(skip)
        .limit(limit),
      Banner.countDocuments()
    ]);

    sendSuccessResponse({
      message: 'Banners fetched successfully',
      data: {
        banners,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit
        }
      },
      res
    });
  } catch (error: any) {
    console.error('Get banners error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error fetching banners',
      error,
      res
    });
  }
};

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      Category.find()
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      Category.countDocuments()
    ]);

    sendSuccessResponse({
      message: 'Categories fetched successfully',
      data: {
        categories,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit
        }
      },
      res
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error fetching categories',
      error,
      res
    });
  }
};

// Get all posts
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments()
    ]);

    sendSuccessResponse({
      message: 'Posts fetched successfully',
      data: {
        posts,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit
        }
      },
      res
    });
  } catch (error: any) {
    console.error('Get posts error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error fetching posts',
      error,
      res
    });
  }
};

// Get single post with plans
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('categoryId', 'name');

    if (!post) {
      return sendErrorResponse({
        message: 'Post not found',
        res
      });
    }

    // Get plans for this post
    const plans = await Plan.find({ postId: post._id })
      .sort({ price: 1 });

    sendSuccessResponse({
      message: 'Post fetched successfully',
      data: {
        ...post.toObject(),
        plans
      },
      res
    });
  } catch (error: any) {
    console.error('Get post error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error fetching post',
      error,
      res
    });
  }
};

// Get posts by category
export const getPostsByCategory = async (req: Request, res: Response) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);

    const skip = (page - 1) * limit;

    // Check if category exists
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return sendErrorResponse({
        message: 'Category not found',
        res
      });
    }

    const [posts, total] = await Promise.all([
      Post.find({ categoryId: req.params.categoryId })
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ categoryId: req.params.categoryId })
    ]);

    sendSuccessResponse({
      message: 'Posts fetched successfully',
      data: {
        posts,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit
        }
      },
      res
    });
  } catch (error: any) {
    console.error('Get posts by category error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error fetching posts',
      error,
      res
    });
  }
};

// Get plans by post
export const getPlansByPost = async (req: Request, res: Response) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);

    const skip = (page - 1) * limit;

    // Check if post exists
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return sendErrorResponse({
        message: 'Post not found',
        res
      });
    }

    const [plans, total] = await Promise.all([
      Plan.find({ postId: req.params.postId }).populate('postId')
        .sort({ price: 1 })
        .skip(skip)
        .limit(limit),
      Plan.countDocuments({ postId: req.params.postId })
    ]);

    sendSuccessResponse({
      message: 'Plans fetched successfully',
      data: {
        plans,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit
        }
      },
      res
    });
  } catch (error: any) {
    console.error('Get plans by post error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error fetching plans',
      error,
      res
    });
  }
};

// Get homepage data
export const getHomePageData = async (req: Request, res: Response) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);

    const skip = (page - 1) * limit;

    // Fetch banners, categories, and latest plans in parallel
    const [banners, categories, latestPlans, totalPlans] = await Promise.all([
      Banner.find()
        .populate('linkedCategoryId', 'name')
        .populate('linkedPlanId', 'duration price'),
      Category.find()
        .sort({ name: 1 }),
      Plan.find()
        .populate({
          path: 'postId',
          select: 'name logoUrl categoryId',
          populate: {
            path: 'categoryId',
            select: 'name'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Plan.countDocuments()
    ]);

    sendSuccessResponse({
      message: 'Homepage data fetched successfully',
      data: {
        banners: {
          count: banners.length,
          data: banners
        },
        categories: {
          count: categories.length,
          data: categories
        },
        latestPlans: {
          data: latestPlans,
          pagination: {
            total: totalPlans,
            totalPages: Math.ceil(totalPlans / limit),
            currentPage: page,
            limit
          }
        }
      },
      res
    });
  } catch (error: any) {
    console.error('Get homepage data error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error fetching homepage data',
      error,
      res
    });
  }
}; 