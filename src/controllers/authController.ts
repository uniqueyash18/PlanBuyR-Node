import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { loginSchema, registerSchema } from '../validations/authValidation';
import { sendErrorResponse, sendSuccessResponse } from '../utils/Responses';

// Register new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);

    const { username, email, password } = body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user' // Default role
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;

    sendSuccessResponse({
      message: 'User registered successfully',
      data: userWithoutPassword,
      others: {
        token
      },
      res
    });
  } catch (error:any) {
    console.error('Registration error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error registering user',
      error: error,
      res
    });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);
    const { email, password } = body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return sendErrorResponse({
        message: 'Invalid credentials',
        res
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendErrorResponse({
        message: 'Invalid credentials',
        res
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;

    sendSuccessResponse({
      message: 'Login successful',
      data: userWithoutPassword,
      others: {
        token
      },
      res
    });
  } catch (error:any) {
    console.error('Login error:', error);
    sendErrorResponse({
      message: error?.errors?.[0]?.message || 'Error logging in',
      error: error,
      res
    });
  }
};

// Get current user
export const getMe = async (req: Request, res: Response) => {
  try {
    // User is already attached to req by protect middleware
    const user = await User.findById(req.user?.id).select('-password');

    if (!user) {
      return sendErrorResponse({
        message: 'User not found',
        res
      });
    }

    sendSuccessResponse({
      message: 'User fetched successfully',
      data: user,
      res
    });
  } catch (error) {
    console.error('Get me error:', error);
    sendErrorResponse({
      message: 'Error fetching user data',
      error: error,
      res
    });
  }
}; 