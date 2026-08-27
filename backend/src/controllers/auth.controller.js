import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { validateChangePasswordPayload, validateLoginPayload, validateRegisterPayload } from '../validators/auth.validators.js';

function createToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}

export async function register(req, res) {
  const { name, email, address, password } = validateRegisterPayload(req.body);
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, 'USER')
     RETURNING id, name, email, address, role, created_at, updated_at`,
    [name, email, passwordHash, address]
  );

  const user = result.rows[0];
  const token = createToken(user);

  return res.status(201).json({
    success: true,
    message: 'Registration successful.',
    data: { token, user: publicUser(user) }
  });
}

export async function login(req, res) {
  const { email, password } = validateLoginPayload(req.body);

  const result = await query(
    `SELECT id, name, email, password_hash, address, role, created_at, updated_at
     FROM users
     WHERE email = $1 AND is_active = TRUE`,
    [email]
  );

  const user = result.rows[0];
  if (!user) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const token = createToken(user);
  return res.json({
    success: true,
    message: 'Login successful.',
    data: { token, user: publicUser(user) }
  });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = validateChangePasswordPayload(req.body);

  const result = await query(
    'SELECT password_hash FROM users WHERE id = $1 AND is_active = TRUE',
    [req.user.id]
  );

  const user = result.rows[0];
  if (!user) throw new AppError(404, 'User account not found.');

  const matches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!matches) {
    throw new AppError(400, 'Current password is incorrect.');
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await query(
    `UPDATE users
     SET password_hash = $1, updated_at = NOW()
     WHERE id = $2`,
    [passwordHash, req.user.id]
  );

  return res.json({ success: true, message: 'Password updated successfully.' });
}

export async function logout(_req, res) {
  // JWT is stateless. The client invalidates its local token on logout.
  // Server-side token revocation would require a token/session store.
  return res.json({
    success: true,
    message: 'Logout successful. Remove the token from the client.'
  });
}
