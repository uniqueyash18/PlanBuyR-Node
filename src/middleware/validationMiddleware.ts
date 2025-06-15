import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response , next: NextFunction) => {
    try {
      await schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error.inner) {
        const errors = error.inner.reduce((acc: any, err: any) => {
          acc[err.path] = err.message;
          return acc;
        }, {});
        
        return res.status(400).json({
          success: false,
          errors
        });
      }
      
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
}; 