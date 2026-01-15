/**
 * Calculate expiration date from a duration string
 * Supports formats: s (seconds), m (minutes), h (hours), d (days)
 * Examples: "7d", "30d", "1h", "3600s"
 * 
 * @param expiresIn - Duration string (e.g., "7d", "30d", "1h")
 * @returns Date object or null if expiresIn is null/undefined/empty
 */
export function calculateExpirationDate(
  expiresIn: string | null | undefined,
): Date | null {
  if (!expiresIn || expiresIn.trim() === '') {
    return null;
  }

  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    // Invalid format, return null (no expiration)
    return null;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  let milliseconds = 0;

  switch (unit) {
    case 's': // seconds
      milliseconds = value * 1000;
      break;
    case 'm': // minutes
      milliseconds = value * 60 * 1000;
      break;
    case 'h': // hours
      milliseconds = value * 60 * 60 * 1000;
      break;
    case 'd': // days
      milliseconds = value * 24 * 60 * 60 * 1000;
      break;
    default:
      return null;
  }

  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + milliseconds);
  return expirationDate;
}

