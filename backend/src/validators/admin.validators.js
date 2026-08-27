import {
  validateAddress,
  validateEmail,
  validateName,
  validatePassword,
  validateRole
} from '../utils/validation.js';

export function validateAdminUserPayload(body) {
  return {
    name: validateName(body.name),
    email: validateEmail(body.email),
    address: validateAddress(body.address),
    password: validatePassword(body.password),
    role: validateRole(body.role)
  };
}

export function validateAdminStorePayload(body) {
  return {
    name: validateName(body.name),
    email: validateEmail(body.email),
    address: validateAddress(body.address),
    ownerId: body.ownerId === '' || body.ownerId === null || body.ownerId === undefined
      ? null
      : Number(body.ownerId)
  };
}
