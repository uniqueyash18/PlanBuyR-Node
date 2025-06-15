import { Request, Response } from 'express';
import { Post } from '../models/Post';
import { Category } from '../models/Category';
import fs from 'fs';
import path from 'path';

// Create new post
export const createPost = async (req: Request, res: Response) => {
  try {
    const { name, description, categoryId } = req.body;
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get logo URL from uploaded file
    const logoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const post = await Post.create({
      name,
      description,
      categoryId,
      logoUrl
    });

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    // If there's an error and a file was uploaded, delete it
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating post'
    });
  }
};

// Get all posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
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

// Get post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('categoryId', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching post'
    });
  }
};

// Update post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { name, description, categoryId } = req.body;

    // Check if category exists if categoryId is provided
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Get existing post
    const existingPost = await Post.findById(req.params.id);
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Handle logo update if new file is uploaded
    let logoUrl = existingPost.logoUrl;
    if (req.file) {
      // Delete old logo file if it exists
      if (existingPost.logoUrl) {
        const oldLogoPath = path.join(process.cwd(), existingPost.logoUrl);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      logoUrl = `/uploads/${req.file.filename}`;
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        description, 
        categoryId,
        logoUrl
      },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    // If there's an error and a new file was uploaded, delete it
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating post'
    });
  }
};

// Delete post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Delete logo file if it exists
    if (post.logoUrl) {
      const logoPath = path.join(process.cwd(), post.logoUrl);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    await post.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting post'
    });
  }
}; 