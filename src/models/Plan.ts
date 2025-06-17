import mongoose, { Document, Schema } from 'mongoose';
import { IPost } from './Post';

// Interface for Plan document
export interface IPlan extends Document {
  postId: IPost['_id'];
  duration: string;
  price: number;
  features?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Plan input (when creating a new plan)
export interface IPlanInput {
  postId: mongoose.Types.ObjectId;
  duration: string;
  price: number;
  features?: string[];
}

// Plan Schema
const planSchema = new Schema<IPlan>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post reference is required'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: function(v: number) {
          // Ensure price has at most 2 decimal places
          return /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: 'Price must have at most 2 decimal places'
      }
    },
    features: [{
      type: String,
      trim: true,
      maxlength: [200, 'Feature description cannot exceed 200 characters']
    }]
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create indexes for better query performance
planSchema.index({ postId: 1 });
planSchema.index({ price: 1 });

// Create and export the Plan model
export const Plan = mongoose.model<IPlan>('Plan', planSchema); 