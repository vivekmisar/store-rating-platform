export function validateName(name) {
  const length = String(name || '').trim().length;
  return length >= 20 && length <= 60;
}

export function validateAddress(address) {
  const length = String(address || '').trim().length;
  return length >= 1 && length <= 400;
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export function validatePassword(password) {
  return /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(String(password || ''));
}

export function validationMessage(field) {
  switch (field) {
    case 'name': return 'Name must be between 20 and 60 characters.';
    case 'address': return 'Address is required and must be at most 400 characters.';
    case 'email': return 'Please enter a valid email address.';
    case 'password': return 'Password must be 8-16 characters with an uppercase letter and a special character.';
    default: return 'Please check this field.';
  }
}
