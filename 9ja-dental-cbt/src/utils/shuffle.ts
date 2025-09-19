/**
 * Seeded Fisher-Yates shuffle implementation
 * Provides reproducible randomization for quiz questions
 */

// Simple Linear Congruential Generator for seeded random numbers
class SeededRandom {
  private seed: number;

  constructor(seed: string | number) {
    if (typeof seed === "string") {
      this.seed = this.hashCode(seed);
    } else {
      this.seed = seed;
    }
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Linear Congruential Generator
  next(): number {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);

    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }
}

/**
 * Seeded Fisher-Yates shuffle
 * @param array - Array to shuffle
 * @param seed - Seed for reproducible randomization
 * @returns Shuffled array
 */
export function seededShuffle<T>(array: T[], seed: string): T[] {
  const shuffled = [...array];
  const rng = new SeededRandom(seed);

  // Fisher-Yates shuffle with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Generate a time-based seed for quiz randomization
 * @param userId - Optional user ID for personalization
 * @returns Seed string
 */
export function generateQuizSeed(userId?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const userPart = userId ? `-${userId}` : "";
  return `${timestamp}-${random}${userPart}`;
}

/**
 * Validate seed format
 * @param seed - Seed to validate
 * @returns Boolean indicating if seed is valid
 */
export function isValidSeed(seed: string): boolean {
  return typeof seed === "string" && seed.length > 0;
}
