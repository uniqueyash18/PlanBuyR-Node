import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { sendErrorResponse, sendSuccessResponse } from '../utils/Responses';
import { categorySchema } from '../validations/validationSchemas';
import { uploadToR2 } from '../utils/cloudFlareR2';

interface CategoryRequest extends Request {
    file?: Express.Multer.File;
}

// Create new category
export const createCategory = async (req: CategoryRequest, res: Response) => {
  try {
    const validatedData = categorySchema.parse(req.body);
    const { name, description } = validatedData;

    let imageUrl = null;
    if (req.file) {
      const key = `categories/${Date.now()}-${req.file.originalname}`;
      const uploadResult = await uploadToR2(req.file, key);
      
      if (uploadResult.success) {
        imageUrl = uploadResult.url;
      } else {
        throw new Error('Failed to upload image');
      }
    }

    const category = await Category.create({
      name,
      description,
      imageUrl
    });

    sendSuccessResponse({
      message: 'Category created successfully',
      data: category,
      res
    });
  } catch (error: any) {
    console.error('Create category error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error creating category',
      error,
      res
    });
  }
};

// Get all categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    sendSuccessResponse({
      message: 'Categories fetched successfully',
      data: categories,
      res
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    sendErrorResponse({
      message: 'Error fetching categories',
      error,
      res
    });
  }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return sendErrorResponse({
        message: 'Category not found',
        res
      });
    }

    sendSuccessResponse({
      message: 'Category fetched successfully',
      data: category,
      res
    });
  } catch (error: any) {
    console.error('Get category error:', error);
    sendErrorResponse({
      message: 'Error fetching category',
      error,
      res
    });
  }
};

// Update category
export const updateCategory = async (req: CategoryRequest, res: Response) => {
  try {
    const validatedData = categorySchema.parse(req.body);
    const { name, description } = validatedData;

    const updateData: any = { name, description };
    
    if (req.file) {
      const key = `categories/${Date.now()}-${req.file.originalname}`;
      const uploadResult = await uploadToR2(req.file, key);
      
      if (uploadResult.success) {
        updateData.imageUrl = uploadResult.url;
      } else {
        throw new Error('Failed to upload image');
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return sendErrorResponse({
        message: 'Category not found',
        res
      });
    }

    sendSuccessResponse({
      message: 'Category updated successfully',
      data: category,
      res
    });
  } catch (error: any) {
    console.error('Update category error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error updating category',
      error,
      res
    });
  }
};

// Delete category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return sendErrorResponse({
        message: 'Category not found',
        res
      });
    }

    sendSuccessResponse({
      message: 'Category deleted successfully',
      data: {},
      res
    });
  } catch (error: any) {
    console.error('Delete category error:', error);
    sendErrorResponse({
      message: 'Error deleting category',
      error,
      res
    });
  }
}; 