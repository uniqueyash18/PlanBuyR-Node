import { Request, Response } from 'express';
import { Plan } from '../models/Plan';
import { Post } from '../models/Post';
import { planSchema } from '../validations/validationSchemas';
import { sendErrorResponse, sendSuccessResponse } from '../utils/Responses';

// Create new plan
export const createPlan = async (req: Request, res: Response) => {
  try {
    const validatedData = planSchema.parse(req.body);
    const { postId, duration, price, features } = validatedData;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return sendErrorResponse({
        message: 'Post not found',
        res
      });
    }

    const plan = await Plan.create({
      postId,
      duration,
      price,
      features
    });

    sendSuccessResponse({
      message: 'Plan created successfully',
      data: plan,
      res
    });
  } catch (error: any) {
    console.error('Create plan error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error creating plan',
      error,
      res
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

    sendSuccessResponse({
      message: 'Plans fetched successfully',
      data: plans,
      res
    });
  } catch (error: any) {
    console.error('Get plans error:', error);
    sendErrorResponse({
      message: 'Error fetching plans',
      error,
      res
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
      return sendErrorResponse({
        message: 'No plans found for this post',
        res
      });
    }

    sendSuccessResponse({
      message: 'Plans fetched successfully',
      data: plans,
      res
    });
  } catch (error: any) {
    console.error('Get plans by post error:', error);
    sendErrorResponse({
      message: 'Error fetching plans',
      error,
      res
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
      return sendErrorResponse({
        message: 'Plan not found',
        res
      });
    }

    sendSuccessResponse({
      message: 'Plan fetched successfully',
      data: plan,
      res
    });
  } catch (error: any) {
    console.error('Get plan error:', error);
    sendErrorResponse({
      message: 'Error fetching plan',
      error,
      res
    });
  }
};

// Update plan
export const updatePlan = async (req: Request, res: Response) => {
  try {
    const validatedData = planSchema.parse(req.body);
    const { postId, duration, price, features } = validatedData;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return sendErrorResponse({
        message: 'Post not found',
        res
      });
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
      return sendErrorResponse({
        message: 'Plan not found',
        res
      });
    }

    sendSuccessResponse({
      message: 'Plan updated successfully',
      data: plan,
      res
    });
  } catch (error: any) {
    console.error('Update plan error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error updating plan',
      error,
      res
    });
  }
};

// Delete plan
export const deletePlan = async (req: Request, res: Response) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return sendErrorResponse({
        message: 'Plan not found',
        res
      });
    }

    sendSuccessResponse({
      message: 'Plan deleted successfully',
      data: {},
      res
    });
  } catch (error: any) {
    console.error('Delete plan error:', error);
    sendErrorResponse({
      message: 'Error deleting plan',
      error,
      res
    });
  }
}; 