/**
 * Generates a two-letter code from a company name
 * - 1-2 words: Takes first two letters of the first word
 * - 3+ words: Takes first letter of first two words
 * Allows both letters and numbers
 * Always returns uppercase
 */
export function generateClientCode(companyName: string): string {
  if (!companyName || companyName.trim().length === 0) {
    return '';
  }

  // Keep letters and numbers, remove other special characters
  const cleanName = companyName.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);

  if (words.length === 0) {
    return '';
  }

  if (words.length <= 2) {
    // 1-2 words: take first two characters of the first word
    const word = words[0];
    return word.length >= 2 
      ? word.substring(0, 2).toUpperCase()
      : word.toUpperCase();
  } else {
    // 3+ words: take first character of first two words
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
}