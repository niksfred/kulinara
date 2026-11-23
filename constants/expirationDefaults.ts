const DEFAULT_EXPIRATION_DAYS = 7;

// TODO: Move this to API when we have one
const EXPIRATION_DEFAULTS: Record<string, number> = {
  milk: 7,
  eggs: 21,
  apples: 14,
  bread: 5,
  chicken: 2,
};

export function getDefaultExpirationDays(name: string): number {
  const key = name.trim().toLowerCase();
  return EXPIRATION_DEFAULTS[key] ?? DEFAULT_EXPIRATION_DAYS;
}

export { DEFAULT_EXPIRATION_DAYS };
