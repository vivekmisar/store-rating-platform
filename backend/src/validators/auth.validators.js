import {
  validateAddress,
  validateEmail,
  validateName,
  validatePassword
} from '../utils/validation.js';

export function validateRegisterPayload(body) {
  return {
    name: validateName(body.name),
    email: validateEmail(body.email),
    address: validateAddress(body.address),
    password: validatePassword(body.password)
  };
}

export function validateLoginPayload(body) {
  return {
    email: validateEmail(body.email),
    password: String(body.password || '')
  };
}

export function validateChangePasswordPayload(body) {
  return {
    currentPassword: String(body.currentPassword || ''),
    newPassword: validatePassword(body.newPassword)
  };
}
