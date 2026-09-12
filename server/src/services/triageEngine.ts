export interface CheckinInput {
  mood: number;    // 1-5
  sleep: number;   // 1-5
  stress: number;  // 1-5
  energy: number;  // 1-5
  social: number;  // 1 or 5 (e.g. Yes/No mapped to 1 or 5)
}

/**
 * Calculates a total score out of 100 based on standard weighted inputs.
 * Weightings: mood 25%, stress 20%, sleep 20%, energy 20%, social 15%.
 * Assuming inputs are given on a scale of 1-5.
 */
export function calculateDailyScore(input: CheckinInput): number {
  // Convert 1-5 scale to 1-100 scale (1 = 20, 5 = 100)
  const norm = (v: number) => (v / 5) * 100;

  const m = norm(input.mood);
  // Stress is inversely scored (high stress = low score), assuming 1=Low Stress, 5=High Stress
  // Wait, if user inputs 5 (Very High Stress), we want the score to drop.
  // Inverse it:
  const str = 100 - norm(input.stress) + 20; // 5 -> 20 (low score), 1 -> 100 (high score)
  
  const slp = norm(input.sleep);
  const eng = norm(input.energy);
  const soc = norm(input.social);

  const weightedScore = 
    (m * 0.25) + 
    (str * 0.20) + 
    (slp * 0.20) + 
    (eng * 0.20) + 
    (soc * 0.15);

  return Math.round(weightedScore);
}

/**
 * Computes the baseline across trailing checkins.
 */
export function calculateBaseline(historyScores: number[]): number {
  if (historyScores.length === 0) return 0;
  const sum = historyScores.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / historyScores.length);
}

export interface CognitiveGameInput {
  accuracy: number;
  duration: number;
}

export interface BehavioralInput {
  /** Number of calendar days since the user's previous check-in (0 = same day) */
  daysSinceLastCheckin: number;
  /** How many of the last 7 calendar days had NO check-in */
  missedDaysInLastWeek: number;
}

/**
 * Performs linear regression over an array of scores and returns the trend.
 * x = index (0, 1, 2, ...), y = score.
 * Returns slope (points per check-in) and direction label.
 */
export function detectTrend(scores: number[]): {
  direction: 'declining' | 'stable' | 'improving';
  slope: number;
} {
  const n = scores.length;
  if (n < 3) return { direction: 'stable', slope: 0 };

  const meanX = (n - 1) / 2;
  const meanY = scores.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - meanX) * (scores[i] - meanY);
    denominator += (i - meanX) ** 2;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;

  const direction =
    slope < -3 ? 'declining' :
    slope > 3  ? 'improving' :
    'stable';

  return { direction, slope };
}

export interface RiskResult {
  level: 'GREEN' | 'YELLOW' | 'RED';
  explanation: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Classifies risk (GREEN, YELLOW, RED) based on current score, history patterns,
 * cognitive game signals, behavioral engagement signals, and trend direction.
 *
 * Confidence tiers based on how many prior check-ins exist:
 *   < 3  → LOW  : Skip baseline deviation checks (not enough data)
 *   3–4  → MEDIUM: Only very large baseline deviations trigger RED
 *   ≥ 5  → HIGH : Full checks applied
 */
export function classifyRisk(
  currentScore: number,
  historyScores: number[],
  baseline: number,
  recentGames: CognitiveGameInput[] = [],
  behavioralInput?: BehavioralInput
): RiskResult {
  const dataPoints = historyScores.length;
  const confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' =
    dataPoints < 3 ? 'LOW' :
    dataPoints < 5 ? 'MEDIUM' :
    'HIGH';

  const explanationParts: string[] = [];

  // --- Cognitive Decline Detection ---
  let cognitivePenalty = false;
  if (recentGames.length >= 2) {
    const latest = recentGames[0];
    const previous = recentGames[1];
    if (
      (previous.accuracy - latest.accuracy > 20 && latest.accuracy < 60) ||
      (latest.duration > previous.duration * 1.5)
    ) {
      cognitivePenalty = true;
      explanationParts.push('noticeable cognitive fatigue (slower response/lower accuracy)');
    }
  }

  // --- Behavioral Engagement Signals ---
  let behavioralFlag = false;
  let behavioralCritical = false;
  if (behavioralInput) {
    const { daysSinceLastCheckin, missedDaysInLastWeek } = behavioralInput;
    if (daysSinceLastCheckin >= 5 && currentScore < 60) {
      behavioralCritical = true;
      explanationParts.push(`extended period without check-in (${daysSinceLastCheckin} days)`);
    } else if (daysSinceLastCheckin >= 3 || missedDaysInLastWeek >= 4) {
      behavioralFlag = true;
      explanationParts.push('reduced engagement detected');
    }
  }

  // --- Trend Detection (requires ≥ 3 data points) ---
  let trendContributesToRed = false;
  let trendContributesToYellow = false;
  if (dataPoints >= 3) {
    const { direction, slope } = detectTrend(historyScores);
    if (direction === 'declining') {
      if (slope < -8) {
        trendContributesToRed = true;
        explanationParts.push(`steep consistent decline over ${dataPoints} days`);
      } else if (slope < -3 && currentScore < 65) {
        trendContributesToYellow = true;
        explanationParts.push(`consistent declining trend over ${dataPoints} days`);
      }
    }
  }

  // --- Low-day count (last 3 data points) ---
  let lowDaysCount = 0;
  for (const score of historyScores.slice(0, 3)) {
    if (score < 40) lowDaysCount++;
  }

  // --- Baseline deviation (calibration-aware) ---
  const hasBaseline = baseline > 0;
  const baselineDrop = hasBaseline ? baseline - currentScore : 0;

  const baselineRedTrigger =
    confidenceLevel === 'HIGH' ? baselineDrop > 30 :
    confidenceLevel === 'MEDIUM' ? baselineDrop > 40 :
    false; // LOW: ignore baseline

  const baselineYellowTrigger =
    confidenceLevel === 'HIGH' ? baselineDrop > 15 :
    false; // MEDIUM/LOW: skip yellow baseline check

  // --- RED Classification ---
  const isRed =
    (currentScore < 40 && lowDaysCount >= 2) ||
    baselineRedTrigger ||
    (currentScore < 45 && cognitivePenalty) ||
    (behavioralCritical && currentScore < 50) ||
    (trendContributesToRed && currentScore < 55);

  if (isRed) {
    const base = 'Score critically low or stepped significantly from baseline';
    const detail = explanationParts.length > 0 ? ` — ${explanationParts.join(', ')}.` : '.';
    return { level: 'RED', explanation: base + detail, confidenceLevel };
  }

  // --- YELLOW Classification ---
  const isYellow =
    (currentScore >= 40 && currentScore < 60) ||
    baselineYellowTrigger ||
    cognitivePenalty ||
    behavioralFlag ||
    trendContributesToYellow;

  if (isYellow) {
    const base = 'Noticeable decline. Approaching risk threshold';
    const detail = explanationParts.length > 0 ? ` — ${explanationParts.join(', ')}.` : '.';
    return { level: 'YELLOW', explanation: base + detail, confidenceLevel };
  }

  return { level: 'GREEN', explanation: 'Stable.', confidenceLevel };
}

