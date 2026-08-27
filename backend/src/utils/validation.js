import { AppError } from './errors.js';

export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  USER: 'USER',
  STORE_OWNER: 'STORE_OWNER'
});

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function validateName(name) {
  const value = String(name || '').trim();
  if (value.length < 20 || value.length > 60) {
    throw new AppError(400, 'Name must be between 20 and 60 characters.');
  }
  return value;
}

export function validateAddress(address) {
  const value = String(address || '').trim();
  if (value.length > 400) {
    throw new AppError(400, 'Address must be at most 400 characters.');
  }
  if (!value) {
    throw new AppError(400, 'Address is required.');
  }
  return value;
}

export function validateEmail(email) {
  const value = normalizeEmail(email);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(value)) {
    throw new AppError(400, 'Please provide a valid email address.');
  }
  return value;
}

export function validatePassword(password) {
  const value = String(password || '');
  const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
  if (!passwordPattern.test(value)) {
    throw new AppError(
      400,
      'Password must be 8-16 characters and contain at least one uppercase letter and one special character.'
    );
  }
  return value;
}

export function validateRating(rating) {
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new AppError(400, 'Rating must be an integer between 1 and 5.');
  }
  return numericRating;
}

export function validateRole(role) {
  const normalizedRole = String(role || '').trim().toUpperCase();
  if (!Object.values(ROLES).includes(normalizedRole)) {
    throw new AppError(400, 'Role must be ADMIN, USER, or STORE_OWNER.');
  }
  return normalizedRole;
}

export function parsePositiveInt(value, fallback, max = 100) {
  if (value === undefined || value === '') return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw new AppError(400, 'Pagination values must be positive integers.');
  }
  return Math.min(number, max);
}

export function parseSort(order) {
  const normalized = String(order || 'asc').toLowerCase();
  if (!['asc', 'desc'].includes(normalized)) {
    throw new AppError(400, 'Sort order must be asc or desc.');
  }
  return normalized.toUpperCase();
}
