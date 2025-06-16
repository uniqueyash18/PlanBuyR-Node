import { Request, Response } from 'express';
import { Post } from '../models/Post';
import { Category } from '../models/Category';
import { postSchema } from '../validations/validationSchemas';
import { sendErrorResponse, sendSuccessResponse } from '../utils/Responses';
import { uploadToR2 } from '../utils/cloudFlareR2';

interface PostRequest extends Request {
    file?: Express.Multer.File;
}

// Create new post
export const createPost = async (req: PostRequest, res: Response) => {
  try {
    const validatedData = postSchema.parse(req.body);
    const { name, description, categoryId } = validatedData;
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return sendErrorResponse({
        message: 'Category not found',
        res
      });
    }

    let logoUrl = undefined;
    if (req.file) {
      const key = `posts/${Date.now()}-${req.file.originalname}`;
      const uploadResult = await uploadToR2(req.file, key);
      
      if (uploadResult.success) {
        logoUrl = uploadResult.url;
      } else {
        throw new Error('Failed to upload logo');
      }
    }

    const post = await Post.create({
      name,
      description,
      categoryId,
      logoUrl
    });

    sendSuccessResponse({
      message: 'Post created successfully',
      data: post,
      res
    });
  } catch (error: any) {
    console.error('Create post error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error creating post',
      error,
      res
    });
  }
};

// Get all posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    sendSuccessResponse({
      message: 'Posts fetched successfully',
      data: posts,
      res
    });
  } catch (error: any) {
    console.error('Get posts error:', error);
    sendErrorResponse({
      message: 'Error fetching posts',
      error,
      res
    });
  }
};

// Get post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('categoryId', 'name');

    if (!post) {
      return sendErrorResponse({
        message: 'Post not found',
        res
      });
    }

    sendSuccessResponse({
      message: 'Post fetched successfully',
      data: post,
      res
    });
  } catch (error: any) {
    console.error('Get post error:', error);
    sendErrorResponse({
      message: 'Error fetching post',
      error,
      res
    });
  }
};

// Update post
export const updatePost = async (req: PostRequest, res: Response) => {
  try {
    const validatedData = postSchema.parse(req.body);
    const { name, description, categoryId } = validatedData;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return sendErrorResponse({
        message: 'Category not found',
        res
      });
    }

    // Get existing post
    const existingPost = await Post.findById(req.params.id);
    if (!existingPost) {
      return sendErrorResponse({
        message: 'Post not found',
        res
      });
    }

    const updateData: any = { 
      name, 
      description, 
      categoryId
    };

    // Handle logo update if new file is uploaded
    if (req.file) {
      const key = `posts/${Date.now()}-${req.file.originalname}`;
      const uploadResult = await uploadToR2(req.file, key);
      
      if (uploadResult.success) {
        updateData.logoUrl = uploadResult.url;
      } else {
        throw new Error('Failed to upload logo');
      }
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');

    sendSuccessResponse({
      message: 'Post updated successfully',
      data: post,
      res
    });
  } catch (error: any) {
    console.error('Update post error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error updating post',
      error,
      res
    });
  }
};

// Delete post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return sendErrorResponse({
        message: 'Post not found',
        res
      });
    }

    await post.deleteOne();

    sendSuccessResponse({
      message: 'Post deleted successfully',
      data: {},
      res
    });
  } catch (error: any) {
    console.error('Delete post error:', error);
    sendErrorResponse({
      message: 'Error deleting post',
      error,
      res
    });
  }
}; 