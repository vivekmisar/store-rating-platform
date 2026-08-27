import { AppError } from '../utils/errors.js';

export function notFoundHandler(req, _res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);

  if (error?.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A record with the same unique value already exists.'
    });
  }

  if (error?.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'A related record does not exist.'
    });
  }

  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const response = {
    success: false,
    message: error instanceof AppError ? error.message : 'Internal server error.'
  };

  if (error instanceof AppError && error.details !== undefined) {
    response.details = error.details;
  }

  return res.status(statusCode).json(response);
}
