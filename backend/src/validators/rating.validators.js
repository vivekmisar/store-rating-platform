import { validateRating } from '../utils/validation.js';

export function validateRatingPayload(body) {
  return {
    storeId: Number(body.storeId),
    rating: validateRating(body.rating)
  };
}
