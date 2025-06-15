import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { loginSchema } from '../validations/authValidation';
import { sendErrorResponse } from '../utils/Responses';
import { sendSuccessResponse } from '../utils/Responses';

// Admin login
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Validate input
    if (!email || !password) {
      return sendErrorResponse({
        message: 'Please provide email and password',
        res
      });
    }

    // Find admin user
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      return sendErrorResponse({
        message: 'Invalid credentials',
        res
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return sendErrorResponse({
        message: 'Invalid credentials',
        res
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    sendSuccessResponse({
      message: 'Admin login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.username,
          email: admin.email,
          role: admin.role
        }
      },
      res
    });
  } catch (error:any) {
    console.error('Admin login error:', error);
    sendErrorResponse({
      message: error?.errors[0]?.message || 'Error during login',
      error: error,
      res
    });
  }
}; 