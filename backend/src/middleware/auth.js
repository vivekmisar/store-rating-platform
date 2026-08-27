import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

export async function authenticate(req, _res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication required.');
    }

    const token = authorization.slice('Bearer '.length).trim();
    const payload = jwt.verify(token, env.jwtSecret);

    const result = await query(
      `SELECT id, name, email, address, role, created_at, updated_at
       FROM users
       WHERE id = $1 AND is_active = TRUE`,
      [payload.userId]
    );

    if (!result.rows[0]) {
      throw new AppError(401, 'User account is not active or no longer exists.');
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if (error?.name === 'TokenExpiredError') {
      return next(new AppError(401, 'Authentication token has expired.'));
    }
    if (error?.name === 'JsonWebTokenError') {
      return next(new AppError(401, 'Invalid authentication token.'));
    }
    next(error);
  }
}
