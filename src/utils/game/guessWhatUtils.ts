import type { GuessWhatInitConfig } from "../../types/game/guessWhatTypes";
import type { Card } from "../../types/game/guessWhatTypes";
import API from "../../config/axiosConfig";
import type { IGuessWhatMetric } from "../../types/props";

// Helper functions
export function initializeGameState(config: GuessWhatInitConfig, level: number) {
    const numImages = level + config!.basePairs!;
    const imagesToMemorize = shuffleArray([...Array(config.imageSet.length).keys()]).slice(0, numImages);
    
    const memorizationTime = Math.max(config.minMemorizationTime, config.defaultMemorizationTime - level * 1000);
    
    return {
        level,
        cards: generateCards(imagesToMemorize, config.imageSet),
        currentImagesToFind: selectImagesToFind(imagesToMemorize, config.imageSet, level <= 3 ? 1 : level <= 6 ? 2 : 3),
        isMemorizationPhase: true,
        memorizationTime,
        timeLeft: Math.floor(memorizationTime / 1000),
        pauseStartTime: 0,
        levelStartTime: 0,
        levelEndTime: 0,
        attempts: 0,
        maxAttempts: 3,
        totalScore: 0
    };
}

function shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
}

function generateCards(imgIdx: number[], imageSet: string[]): Card[] {
    return shuffleArray(imgIdx.map((index, id) => ({ id, image: imageSet[index], matched: false })));
}

function selectImagesToFind(imagesToMemorize: number[], imageSet: string[], numImagesToFind: number): string[] {
    return shuffleArray(imagesToMemorize.map(index => imageSet[index])).slice(0, numImagesToFind);
}


export const updateGameSessionMetrics = async (sessionId: string, metrics: IGuessWhatMetric[], mmseScore: number) => {
    try {
        const response = await API.put(`/game/game-session/update/${sessionId}`, { metrics: metrics, mmseScore });


        if (response.status !== 200) {
            throw new Error("Failed to send game metrics");
        } else {
            console.log("Game metrics sent successfully", response.data);
        }
    } catch (error) {
        console.error("Error sending game metrics", error);
    }
}

/**
 * Computes an MMSE-like cognitive score based on game performance metrics.
 *
 * @param data - An array of game session records, each containing:
 *   - `level`: The level of the game.
 *   - `attempts`: Number of attempts taken (not used in calculation).
 *   - `totalResponseTime`: Time taken to respond in seconds.
 *   - `accuracy`: Accuracy percentage of the player.
 *   - `levelErrors`: Number of incorrect attempts.
 *
 * @returns A computed MMSE-like score scaled between 0 and 30.
 */
export function computeMmseScore(data: IGuessWhatMetric[]): number {
    // Extract data into separate arrays
    const levels = data.map((row) => row.level);
    const responseTimes = data.map((row) => row.totalResponseTime);
    const accuracies = data.map((row) => row.accuracy / 100); // Convert % to decimals
    const errors = data.map((row) => row.levelErrors);

    // Helper function to normalize an array using Min-Max scaling
    const minMaxNormalize = (values: number[]): number[] => {
        const min = Math.min(...values);
        const max = Math.max(...values);
        return values.map((val) => (max - min === 0 ? 0 : (val - min) / (max - min)));
    };

    // Normalize response time & errors
    const responseTimeScaled = minMaxNormalize(responseTimes);
    const errorsScaled = minMaxNormalize(errors);

    // Apply logarithmic weighting to levels (higher levels contribute more)
    const maxLevel = Math.max(...levels);
    const logWeights = levels.map((level) => Math.log1p(level) / Math.log1p(maxLevel));

    // Compute penalty score
    let penalty = 0;
    for (let i = 0; i < data.length; i++) {
        penalty += logWeights[i] * (responseTimeScaled[i] + errorsScaled[i] - accuracies[i]);
    }

    // Align computed score to a 0-30 MMSE scale
    const mmseScore = Math.max(0, Math.min(30, 30 - penalty));

    return parseFloat(mmseScore.toFixed(2)); // Round to 2 decimal places
}


export const getDifficultyMultiplier = (level: number): number => {
    if (level <= 3) return 1; // Easy
    if (level <= 7) return 1.5; // Medium
    return 2; // Hard
};

export const getAccuracyBonus = (accuracy: number): number =>{
    if (accuracy >= 80) return 20; // Excellent
    if (accuracy >= 50 && accuracy < 80) return 10; // Average
    if (accuracy >= 10 && accuracy < 50) return 5; // Below Avg
    return 0; // Poor
}

export const getPenaltyRate = (errorRate: number): number =>{
    if (errorRate >= 80) return 40; // attempt to reduce score significantly.
    if (errorRate >= 50 && errorRate < 80) return 10; 
    return 0; 
}

export const getGuessWhatMMSEScore = (totalScore: number): number => {
    const maxScore = 4220; // max theoretical score
    const normalized = (totalScore / maxScore) * 30;
    return Math.round(Math.min(normalized, 30));
};

export const classifyMMSE = (mmseScore: number): "Normal" | "Okay" | "At Risk" => {
    if (mmseScore >= 24) return "Normal";
    if (mmseScore >= 18) return "Okay";
    return "At Risk";
};

export const calculateAverages = (metrics: IGuessWhatMetric[])=> {
    let totalTime: number = 0;
    let totalAttempts: number = 0;
    let totalErrors: number = 0;
    let totalAccuracy: number = 0;

    metrics.forEach(element => {
        totalTime += element.totalResponseTime;
        totalAttempts += element.attempt;
        totalErrors += element.levelErrors;
        totalAccuracy += element.accuracy

    });

    return {
        avgResponseTime: totalTime / metrics.length,
        avgAttemps: totalAttempts / metrics.length,
        avgErrors: totalErrors / metrics.length,
        avgAccuracy: totalAccuracy / metrics.length
    }
}
