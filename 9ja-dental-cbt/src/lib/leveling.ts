export function calculateLevelFromXp(xp: number): number {
  if (!Number.isFinite(xp)) {
    return 1;
  }

  const safeXp = Math.max(0, Math.floor(xp));
  const level = Math.floor(Math.sqrt(safeXp / 25)) + 1;
  return Math.max(1, level);
}

export function calculateXpForLevel(level: number): number {
  if (!Number.isFinite(level)) {
    return 0;
  }

  const safeLevel = Math.max(1, Math.floor(level));
  return Math.pow(safeLevel - 1, 2) * 25;
}
