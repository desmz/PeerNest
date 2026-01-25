export function capitalizeFirstLetter(str: string) {
  if (!str) return ''; // Handle empty or null strings
  return str
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}
