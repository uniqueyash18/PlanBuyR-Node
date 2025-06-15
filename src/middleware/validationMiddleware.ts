import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'yup';

export const validate = (schema: ObjectSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
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