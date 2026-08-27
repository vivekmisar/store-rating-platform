import { query } from '../config/db.js';
import { AppError } from '../utils/errors.js';

export async function getOwnerDashboard(req, res) {
  const storeResult = await query(
    `SELECT id, name, email, address
     FROM stores
     WHERE owner_id = $1`,
    [req.user.id]
  );

  const store = storeResult.rows[0];
  if (!store) {
    throw new AppError(404, 'No store is currently assigned to this store owner.');
  }

  const [summaryResult, ratingUsersResult] = await Promise.all([
    query(
      `SELECT
         COALESCE(ROUND(AVG(rating)::numeric, 2), 0)::float AS average_rating,
         COUNT(*)::int AS rating_count
       FROM ratings
       WHERE store_id = $1`,
      [store.id]
    ),
    query(
      `SELECT
         u.id AS user_id,
         u.name,
         u.email,
         r.rating,
         r.created_at,
         r.updated_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [store.id]
    )
  ]);

  return res.json({
    success: true,
    data: {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: Number(summaryResult.rows[0].average_rating),
        ratingCount: summaryResult.rows[0].rating_count
      },
      ratings: ratingUsersResult.rows.map((row) => ({
        userId: row.user_id,
        name: row.name,
        email: row.email,
        rating: row.rating,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    }
  });
}
