import mongoose, { Document, Schema } from 'mongoose';
import { ICategory } from './Category';
import { IPlan } from './Plan';

// Interface for Banner document
export interface IBanner extends Document {
  title: string;
  imageUrl: string;
  linkType: 'category' | 'plan';
  linkedCategoryId?: ICategory['_id'];
  linkedPlanId?: IPlan['_id'];
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Banner input (when creating a new banner)
export interface IBannerInput {
  title: string;
  imageUrl: string;
  linkType: 'category' | 'plan';
  linkedCategoryId?: mongoose.Types.ObjectId;
  linkedPlanId?: mongoose.Types.ObjectId;
}

// Banner Schema
const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Image URL must be a valid URL starting with http:// or https://'
      }
    },
    linkType: {
      type: String,
      required: [true, 'Link type is required'],
      enum: {
        values: ['category', 'plan'],
        message: 'Link type must be either "category" or "plan"'
      }
    },
    linkedCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      validate: {
        validator: function(this: IBanner, v: mongoose.Types.ObjectId) {
          return this.linkType !== 'category' || (this.linkType === 'category' && v != null);
        },
        message: 'Category ID is required when link type is "category"'
      }
    },
    linkedPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      validate: {
        validator: function(this: IBanner, v: mongoose.Types.ObjectId) {
          return this.linkType !== 'plan' || (this.linkType === 'plan' && v != null);
        },
        message: 'Plan ID is required when link type is "plan"'
      }
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Pre-save middleware to ensure only one link type is set
bannerSchema.pre('save', function(next) {
  if (this.linkType === 'category' && this.linkedPlanId) {
    this.linkedPlanId = undefined;
  }
  if (this.linkType === 'plan' && this.linkedCategoryId) {
    this.linkedCategoryId = undefined;
  }
  next();
});

// Create indexes for better query performance
bannerSchema.index({ linkType: 1 });
bannerSchema.index({ linkedCategoryId: 1 });
bannerSchema.index({ linkedPlanId: 1 });

// Create and export the Banner model
export const Banner = mongoose.model<IBanner>('Banner', bannerSchema); 