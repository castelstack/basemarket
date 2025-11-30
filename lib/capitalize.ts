/**
 * Capitalizes the first letter of a string and converts the rest to lowercase
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export function capitalize(str: string | undefined | null): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalizes a full name (first and last name)
 * @param firstName - The first name
 * @param lastName - The last name
 * @returns The capitalized full name
 */
export function capitalizeFullName(firstName: string | undefined | null, lastName: string | undefined | null): string {
  const capitalizedFirst = capitalize(firstName);
  const capitalizedLast = capitalize(lastName);
  return `${capitalizedFirst} ${capitalizedLast}`.trim();
}