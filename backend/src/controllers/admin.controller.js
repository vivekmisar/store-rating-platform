import bcrypt from 'bcryptjs';
import { pool, query } from '../config/db.js';
import { AppError } from '../utils/errors.js';
import { parsePositiveInt, parseSort, ROLES } from '../utils/validation.js';
import { validateAdminStorePayload, validateAdminUserPayload } from '../validators/admin.validators.js';

const userSortableFields = {
  name: 'u.name',
  email: 'u.email',
  address: 'u.address',
  role: 'u.role',
  createdAt: 'u.created_at'
};

const storeSortableFields = {
  name: 's.name',
  email: 's.email',
  address: 's.address',
  rating: 'average_rating',
  createdAt: 's.created_at'
};

export async function getDashboard(_req, res) {
  const [usersResult, storesResult, ratingsResult] = await Promise.all([
    query(`SELECT COUNT(*)::int AS total FROM users`),
    query(`SELECT COUNT(*)::int AS total FROM stores`),
    query(`SELECT COUNT(*)::int AS total FROM ratings`)
  ]);

  return res.json({
    success: true,
    data: {
      totalUsers: usersResult.rows[0].total,
      totalStores: storesResult.rows[0].total,
      totalRatings: ratingsResult.rows[0].total
    }
  });
}

export async function listUsers(req, res) {
  const name = String(req.query.name || '').trim();
  const email = String(req.query.email || '').trim();
  const address = String(req.query.address || '').trim();
  const role = String(req.query.role || '').trim().toUpperCase();
  const sortBy = String(req.query.sortBy || 'name');
  const order = parseSort(req.query.order);
  const sortColumn = userSortableFields[sortBy] || userSortableFields.name;
  const page = parsePositiveInt(req.query.page, 1, 100000);
  const limit = parsePositiveInt(req.query.limit, 10, 100);
  const offset = (page - 1) * limit;

  const conditions = [];
  const filterValues = [];

  if (name) {
    filterValues.push(`%${name}%`);
    conditions.push(`u.name ILIKE $${filterValues.length}`);
  }
  if (email) {
    filterValues.push(`%${email}%`);
    conditions.push(`u.email ILIKE $${filterValues.length}`);
  }
  if (address) {
    filterValues.push(`%${address}%`);
    conditions.push(`u.address ILIKE $${filterValues.length}`);
  }
  if (role) {
    if (!Object.values(ROLES).includes(role)) throw new AppError(400, 'Invalid role filter.');
    filterValues.push(role);
    conditions.push(`u.role = $${filterValues.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const dataValues = [...filterValues, limit, offset];
  const result = await query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.address,
       u.role,
       u.created_at,
       s.id AS store_id,
       s.name AS store_name,
       COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::float AS store_rating
     FROM users u
     LEFT JOIN stores s ON s.owner_id = u.id
     LEFT JOIN ratings r ON r.store_id = s.id
     ${whereClause}
     GROUP BY u.id, s.id
     ORDER BY ${sortColumn} ${order}
     LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
    dataValues
  );

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM users u ${whereClause}`,
    filterValues
  );

  return res.json({
    success: true,
    data: {
      items: result.rows.map(mapAdminUser),
      pagination: {
        page,
        limit,
        total: countResult.rows[0].total,
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    }
  });
}

export async function getUserById(req, res) {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId < 1) throw new AppError(400, 'Invalid user id.');

  const result = await query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.address,
       u.role,
       u.created_at,
       s.id AS store_id,
       s.name AS store_name,
       s.email AS store_email,
       s.address AS store_address,
       COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::float AS store_rating
     FROM users u
     LEFT JOIN stores s ON s.owner_id = u.id
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE u.id = $1
     GROUP BY u.id, s.id`,
    [userId]
  );

  if (!result.rows[0]) throw new AppError(404, 'User not found.');

  return res.json({ success: true, data: mapAdminUser(result.rows[0], true) });
}

export async function createUser(req, res) {
  const { name, email, address, password, role } = validateAdminUserPayload(req.body);
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, role, created_at, updated_at`,
    [name, email, passwordHash, address, role]
  );

  return res.status(201).json({
    success: true,
    message: 'User created successfully.',
    data: mapAdminUser(result.rows[0])
  });
}

export async function listStores(req, res) {
  const name = String(req.query.name || '').trim();
  const email = String(req.query.email || '').trim();
  const address = String(req.query.address || '').trim();
  const sortBy = String(req.query.sortBy || 'name');
  const order = parseSort(req.query.order);
  const sortColumn = storeSortableFields[sortBy] || storeSortableFields.name;
  const page = parsePositiveInt(req.query.page, 1, 100000);
  const limit = parsePositiveInt(req.query.limit, 10, 100);
  const offset = (page - 1) * limit;

  const conditions = [];
  const filterValues = [];

  if (name) {
    filterValues.push(`%${name}%`);
    conditions.push(`s.name ILIKE $${filterValues.length}`);
  }
  if (email) {
    filterValues.push(`%${email}%`);
    conditions.push(`s.email ILIKE $${filterValues.length}`);
  }
  if (address) {
    filterValues.push(`%${address}%`);
    conditions.push(`s.address ILIKE $${filterValues.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const dataValues = [...filterValues, limit, offset];

  const result = await query(
    `SELECT
       s.id,
       s.name,
       s.email,
       s.address,
       s.owner_id,
       owner.name AS owner_name,
       COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::float AS average_rating,
       COUNT(r.id)::int AS rating_count
     FROM stores s
     LEFT JOIN users owner ON owner.id = s.owner_id
     LEFT JOIN ratings r ON r.store_id = s.id
     ${whereClause}
     GROUP BY s.id, owner.id
     ORDER BY ${sortColumn} ${order}
     LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
    dataValues
  );

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM stores s ${whereClause}`,
    filterValues
  );

  return res.json({
    success: true,
    data: {
      items: result.rows.map(mapAdminStore),
      pagination: {
        page,
        limit,
        total: countResult.rows[0].total,
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    }
  });
}

export async function createStore(req, res) {
  const { name, email, address, ownerId } = validateAdminStorePayload(req.body);

  if (ownerId !== null) {
    if (!Number.isInteger(ownerId) || ownerId < 1) {
      throw new AppError(400, 'ownerId must be a positive integer or omitted.');
    }

    const ownerResult = await query(
      `SELECT id, role FROM users WHERE id = $1 AND is_active = TRUE`,
      [ownerId]
    );

    const owner = ownerResult.rows[0];
    if (!owner) throw new AppError(404, 'Store owner not found.');
    if (owner.role !== ROLES.STORE_OWNER) {
      throw new AppError(400, 'Selected owner must have the STORE_OWNER role.');
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (ownerId !== null) {
      const existing = await client.query('SELECT id FROM stores WHERE owner_id = $1', [ownerId]);
      if (existing.rows[0]) {
        throw new AppError(409, 'This store owner already owns a store.');
      }
    }

    const result = await client.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id, created_at, updated_at`,
      [name, email, address, ownerId]
    );

    await client.query('COMMIT');
    return res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: mapAdminStore(result.rows[0])
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function mapAdminUser(row, detailed = false) {
  const user = {
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    role: row.role,
    createdAt: row.created_at
  };

  if (row.role === ROLES.STORE_OWNER) {
    user.store = row.store_id
      ? {
          id: row.store_id,
          name: row.store_name,
          email: row.store_email,
          address: row.store_address,
          averageRating: Number(row.store_rating || 0)
        }
      : null;
  }

  if (!detailed && !user.store) delete user.store;
  return user;
}

function mapAdminStore(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    ownerId: row.owner_id ?? null,
    ownerName: row.owner_name ?? null,
    averageRating: Number(row.average_rating || 0),
    ratingCount: Number(row.rating_count || 0)
  };
}
