export function capitalizeFirstLetter(str: string) {
  if (!str) return ''; // Handle empty or null strings
  return str
    .split(' ')
    .map((s) => capitalizeFirstLetterForFirstWord(s))
    .join(' ');
}

export function capitalizeFirstLetterForFirstWord(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
