import mongoose, { Document, Schema } from 'mongoose';
import { ICategory } from './Category';

// Interface for Post document
export interface IPost extends Document {
  name: string;
  description: string;
  categoryId: ICategory['_id'];
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Post input (when creating a new post)
export interface IPostInput {
  name: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  logoUrl?: string;
}

// Post Schema
const postSchema = new Schema<IPost>(
  {
    name: {
      type: String,
      required: [true, 'Post name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Post name must be at least 2 characters long'],
      maxlength: [100, 'Post name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    logoUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Logo URL must be a valid URL starting with http:// or https://'
      }
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create indexes for better query performance
postSchema.index({ name: 1 });
postSchema.index({ categoryId: 1 });

// Create and export the Post model
export const Post = mongoose.model<IPost>('Post', postSchema); 