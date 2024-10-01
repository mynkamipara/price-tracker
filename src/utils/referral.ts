export function generateReferralCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';

  function getRandomCharacter(characters: string): string {
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
  }

  // Generate two random capital letters
  const firstTwo = getRandomCharacter(letters) + getRandomCharacter(letters);

  // Generate a random digit
  const third = getRandomCharacter(digits);

  // Generate two more random capital letters
  const nextTwo = getRandomCharacter(letters) + getRandomCharacter(letters);

  // Generate another random digit
  const sixth = getRandomCharacter(digits);

  // Combine all parts to form the referral code
  return firstTwo + third + nextTwo + sixth;
}
