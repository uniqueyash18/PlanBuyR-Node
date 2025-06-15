import { Request, Response } from 'express';
import { Banner } from '../models/Banner';
import { Category } from '../models/Category';
import { Post } from '../models/Post';
import { Plan } from '../models/Plan';

// Get all banners
export const getBanners = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [banners, total] = await Promise.all([
      Banner.find()
        .populate('linkedCategoryId', 'name')
        .populate('linkedPlanId', 'duration price')
        .skip(skip)
        .limit(limit),
      Banner.countDocuments()
    ]);

    res.json({
      success: true,
      count: banners.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: banners
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching banners'
    });
  }
};

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      Category.find()
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      Category.countDocuments()
    ]);

    res.json({
      success: true,
      count: categories.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
};

// Get all posts
export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments()
    ]);

    res.json({
      success: true,
      count: posts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: posts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts'
    });
  }
};

// Get single post with plans
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('categoryId', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get plans for this post
    const plans = await Plan.find({ postId: post._id })
      .sort({ price: 1 });

    res.json({
      success: true,
      data: {
        ...post.toObject(),
        plans
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching post'
    });
  }
};

// Get posts by category
export const getPostsByCategory = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Check if category exists
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
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

    res.json({
      success: true,
      count: posts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: posts
    });
  } catch (error) {
    console.error('Get posts by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts'
    });
  }
};

// Get plans by post
export const getPlansByPost = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Check if post exists
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const [plans, total] = await Promise.all([
      Plan.find({ postId: req.params.postId })
        .sort({ price: 1 })
        .skip(skip)
        .limit(limit),
      Plan.countDocuments({ postId: req.params.postId })
    ]);

    res.json({
      success: true,
      count: plans.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: plans
    });
  } catch (error) {
    console.error('Get plans by post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plans'
    });
  }
};

// Get homepage data
export const getHomePageData = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
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

    res.json({
      success: true,
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
          count: latestPlans.length,
          total: totalPlans,
          totalPages: Math.ceil(totalPlans / limit),
          currentPage: page,
          data: latestPlans
        }
      }
    });
  } catch (error) {
    console.error('Get homepage data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching homepage data'
    });
  }
}; 