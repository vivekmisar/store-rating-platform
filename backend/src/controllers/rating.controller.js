import { query } from '../config/db.js';
import { AppError } from '../utils/errors.js';
import { validateRatingPayload } from '../validators/rating.validators.js';

export async function createRating(req, res) {
  const { storeId, rating } = validateRatingPayload(req.body);
  if (!Number.isInteger(storeId) || storeId < 1) {
    throw new AppError(400, 'storeId must be a positive integer.');
  }

  const store = await query('SELECT id FROM stores WHERE id = $1', [storeId]);
  if (!store.rows[0]) throw new AppError(404, 'Store not found.');

  const result = await query(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, store_id, rating, created_at, updated_at`,
    [req.user.id, storeId, rating]
  );

  return res.status(201).json({ success: true, message: 'Rating submitted.', data: mapRating(result.rows[0]) });
}

export async function updateRating(req, res) {
  const ratingId = Number(req.params.id);
  if (!Number.isInteger(ratingId) || ratingId < 1) {
    throw new AppError(400, 'Invalid rating id.');
  }

  const { rating } = validateRatingPayload(req.body);

  const result = await query(
    `UPDATE ratings
     SET rating = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3
     RETURNING id, user_id, store_id, rating, created_at, updated_at`,
    [rating, ratingId, req.user.id]
  );

  if (!result.rows[0]) {
    throw new AppError(404, 'Rating not found or does not belong to the authenticated user.');
  }

  return res.json({ success: true, message: 'Rating updated.', data: mapRating(result.rows[0]) });
}

function mapRating(row) {
  return {
    id: row.id,
    userId: row.user_id,
    storeId: row.store_id,
    rating: row.rating,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
