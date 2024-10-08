export function calculateHealth(stats, latestPractice) {
  const now = new Date();
  const decayRate = 0.01; // Health decreases by 1% per day

  // Start with previous health or 100 if no previous data
  let health = stats?.health ?? 100;

  // Apply time decay since last practice
  if (stats?.lastPracticed) {
    const lastPracticedDate = new Date(stats.lastPracticed);
    const daysSinceLastPractice =
      (now - lastPracticedDate) / (1000 * 60 * 60 * 24);
    health -= daysSinceLastPractice * decayRate * 100;
  }

  // Clamp health between 0 and 100
  health = Math.max(0, Math.min(health, 100));

  // Increase health based on latest practice performance
  const performanceBoost = parseFloat(latestPractice.score); // Convert score to number
  health += performanceBoost * 0.1; // Boost health by 10% of the score

  // Clamp health again
  health = Math.max(0, Math.min(health, 100));

  return health.toFixed(2);
}
