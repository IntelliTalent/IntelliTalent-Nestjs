export function getDateAfter(expireIn: string): Date {
  const date = new Date();

  // Convert the expireIn string to milliseconds
  const milliseconds = convertExpireInToMilliseconds(expireIn);
  // Calculate the expiration date by adding milliseconds to the current date
  const expirationDate = new Date(date.getTime() + milliseconds);

  return expirationDate;
}

export function convertExpireInToMilliseconds(expireIn: string): number {
  // Extract the numeric part from the string (e.g., '15' from '15d')
  const numericPart = parseInt(expireIn); // Extracts the numeric part of the string

  // Get the unit part from the string (e.g., 'd' for days)
  const unitPart = expireIn.charAt(expireIn.length - 1); // Extracts the last character of the string

  // Calculate the milliseconds based on the unit
  let milliseconds;
  switch (unitPart) {
    case 'd':
      milliseconds = numericPart * 24 * 60 * 60 * 1000; // Convert days to milliseconds
      break;
    case 'h':
      milliseconds = numericPart * 60 * 60 * 1000; // Convert hours to milliseconds
      break;
    case 'm':
      milliseconds = numericPart * 60 * 1000; // Convert minutes to milliseconds
      break;
    case 's':
      milliseconds = numericPart * 1000; // Convert seconds to milliseconds
      break;
    default:
      throw new Error('Invalid time unit provided');
  }

  return milliseconds;
}
