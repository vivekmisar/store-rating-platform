import { query } from '../config/db.js';
import { AppError } from '../utils/errors.js';
import { ROLES, parsePositiveInt, parseSort } from '../utils/validation.js';

const sortableFields = {
  name: 's.name',
  email: 's.email',
  address: 's.address',
  rating: 'average_rating',
  createdAt: 's.created_at'
};

export async function listStores(req, res) {
  const name = String(req.query.name || '').trim();
  const address = String(req.query.address || '').trim();
  const sortBy = String(req.query.sortBy || 'name');
  const order = parseSort(req.query.order);
  const sortColumn = sortableFields[sortBy] || sortableFields.name;
  const page = parsePositiveInt(req.query.page, 1, 100000);
  const limit = parsePositiveInt(req.query.limit, 10, 100);
  const offset = (page - 1) * limit;

  const conditions = [];
  const values = [];

  if (name) {
    values.push(`%${name}%`);
    conditions.push(`s.name ILIKE $${values.length}`);
  }

  if (address) {
    values.push(`%${address}%`);
    conditions.push(`s.address ILIKE $${values.length}`);
  }

  values.push(limit, offset);
  const limitPosition = values.length - 1;
  const offsetPosition = values.length;

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause = `${sortColumn} ${order}`;

  const result = await query(
    `SELECT
       s.id,
       s.name,
       s.email,
       s.address,
       COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::float AS overall_rating,
       MAX(CASE WHEN r.user_id = $${values.length + 1} THEN r.rating END) AS user_rating,
       MAX(CASE WHEN r.user_id = $${values.length + 1} THEN r.id END) AS user_rating_id,
       COUNT(r.id)::int AS rating_count
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     ${whereClause}
     GROUP BY s.id
     ORDER BY ${orderClause}
     LIMIT $${limitPosition} OFFSET $${offsetPosition}`,
    [...values, req.user.id]
  );

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM stores s ${whereClause}`,
    values.slice(0, values.length - 2)
  );

  return res.json({
    success: true,
    data: {
      items: result.rows.map(mapStore),
      pagination: {
        page,
        limit,
        total: countResult.rows[0].total,
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    }
  });
}

export async function getStoreById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'Invalid store id.');

  const result = await query(
    `SELECT
       s.id,
       s.name,
       s.email,
       s.address,
       COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::float AS overall_rating,
       MAX(CASE WHEN r.user_id = $2 THEN r.rating END) AS user_rating,
       MAX(CASE WHEN r.user_id = $2 THEN r.id END) AS user_rating_id,
       COUNT(r.id)::int AS rating_count
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.id = $1
     GROUP BY s.id`,
    [id, req.user.id]
  );

  if (!result.rows[0]) throw new AppError(404, 'Store not found.');

  return res.json({ success: true, data: mapStore(result.rows[0]) });
}

function mapStore(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    overallRating: Number(row.overall_rating),
    userRating: row.user_rating === null ? null : Number(row.user_rating),
    userRatingId: row.user_rating_id === null ? null : Number(row.user_rating_id),
    ratingCount: Number(row.rating_count)
  };
}

export function assertCanListStores(req, _res, next) {
  if (req.user?.role !== ROLES.USER) {
    return next(new AppError(403, 'Only normal users can access the public store rating list.'));
  }
  next();
}
