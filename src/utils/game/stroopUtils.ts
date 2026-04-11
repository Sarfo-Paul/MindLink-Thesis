import type { IStroopGameConfig } from "../../types/game/stroopTypes";

export function initializeGameState(config: IStroopGameConfig, level: number) {
    return {
        level,
        duration: config.duration,
        questions: config.questions,
        currentIndex: 0,
    };
}

/**
 * Computes an MMSE-like cognitive score from Stroop game performance.
 *
 * Stroop measures executive function / cognitive control (inhibition).
 * Scoring weights:
 *   55% accuracy  — primary signal for cognitive control
 *   30% speed     — normalized response time (fast = high score)
 *   15% error penalty — proportion of errors relative to attempts
 *
 * @returns Score on a 0–30 scale (mirrors MMSE range)
 */
export function getStroopMMSEScore(metrics: {
    accuracy: number;
    averageResponseTime: number;
    errors: number;
    attempts: number;
}): number {
    const { accuracy, averageResponseTime, errors, attempts } = metrics;

    // Normalize accuracy: already 0–100, convert to 0–1
    const normalizedAccuracy = Math.min(accuracy, 100) / 100;

    // Normalize speed: clamp response time between 0.3s (fast) and 4s (slow), invert so fast = 1
    const MIN_RT = 0.3;
    const MAX_RT = 4.0;
    const clampedRT = Math.min(Math.max(averageResponseTime, MIN_RT), MAX_RT);
    const normalizedSpeed = 1 - (clampedRT - MIN_RT) / (MAX_RT - MIN_RT);

    // Error penalty: proportion of errors out of total attempts (0–1)
    const errorPenalty = attempts > 0 ? Math.min(errors / attempts, 1) : 0;

    const rawScore = 0.55 * normalizedAccuracy + 0.30 * normalizedSpeed - 0.15 * errorPenalty;

    return Math.round(Math.min(Math.max(rawScore * 30, 0), 30));
}

export const classifyStroopMMSE = (mmseScore: number): "Normal" | "Okay" | "At Risk" => {
    if (mmseScore >= 24) return "Normal";
    if (mmseScore >= 18) return "Okay";
    return "At Risk";
};