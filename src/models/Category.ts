import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

// Interface for Category document
export interface ICategory extends Document {
  name: string;
  description?: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Category input (when creating a new category)
export interface ICategoryInput {
  name: string;
  description?: string;
}

// Category Schema
const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters long'],
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Pre-save hook to generate slug from name
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,      // Convert to lower case
      strict: true,     // Strip special characters except replacement
      trim: true        // Trim leading and trailing replacement chars
    });
  }
  next();
});

// Create and export the Category model
export const Category = mongoose.model<ICategory>('Category', categorySchema); 