

export const RegularExpression = {
  Email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/gi,
} as const;

export const CheckData = {
  Exists: 'already_exists',
  NotFound: 'not_found',
} as const;
