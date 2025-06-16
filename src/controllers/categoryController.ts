import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { categorySchema } from '../validations/validationSchemas';
import { sendErrorResponse, sendSuccessResponse } from '../utils/Responses';
import { uploadSingle } from '../middleware/uploadMiddleware';

// Create new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const validatedData = categorySchema.parse(req.body);
    const { name, description } = validatedData;

    // Get the uploaded file path if it exists
    const imageUrl = req.file ? `uploads/${req.file.filename}` : null;

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
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const validatedData = categorySchema.parse(req.body);
    const { name, description } = validatedData;

    // Get the uploaded file path if it exists
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateData: any = { name, description };
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
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