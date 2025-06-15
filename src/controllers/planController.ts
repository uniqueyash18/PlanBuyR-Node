import { Request, Response } from 'express';
import { Plan } from '../models/Plan';
import { Post } from '../models/Post';

// Create new plan
export const createPlan = async (req: Request, res: Response) => {
  try {
    const { postId, duration, price, features } = req.body;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const plan = await Plan.create({
      postId,
      duration,
      price,
      features
    });

    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating plan'
    });
  }
};

// Get all plans
export const getAllPlans = async (req: Request, res: Response) => {
  try {
    const plans = await Plan.find()
      .populate({
        path: 'postId',
        select: 'name description logoUrl',
        populate: {
          path: 'categoryId',
          select: 'name'
        }
      })
      .sort({ price: 1 });

    res.json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plans'
    });
  }
};

// Get plans by post ID
export const getPlansByPost = async (req: Request, res: Response) => {
  try {
    const plans = await Plan.find({ postId: req.params.postId })
      .populate({
        path: 'postId',
        select: 'name description logoUrl',
        populate: {
          path: 'categoryId',
          select: 'name'
        }
      })
      .sort({ price: 1 });

    if (plans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No plans found for this post'
      });
    }

    res.json({
      success: true,
      count: plans.length,
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

// Get plan by ID
export const getPlanById = async (req: Request, res: Response) => {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate({
        path: 'postId',
        select: 'name description logoUrl',
        populate: {
          path: 'categoryId',
          select: 'name'
        }
      });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plan'
    });
  }
};

// Update plan
export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { postId, duration, price, features } = req.body;

    // Check if post exists if postId is provided
    if (postId) {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
    }

    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      { postId, duration, price, features },
      { new: true, runValidators: true }
    ).populate({
      path: 'postId',
      select: 'name description logoUrl',
      populate: {
        path: 'categoryId',
        select: 'name'
      }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating plan'
    });
  }
};

// Delete plan
export const deletePlan = async (req: Request, res: Response) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting plan'
    });
  }
}; 