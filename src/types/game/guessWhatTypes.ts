import { type BaseGameConfig } from "./base";

export interface GuessWhatInitConfig extends BaseGameConfig {
    maxLevels: number | 10,
    defaultMemorizationTime: number | 2000;
    memorizationTimeReductionPerLevel: number;
    minMemorizationTime: number;
    basePairs: number;
    levelStartTime: number | 0;
    levelEndTime: number | 0;
    imageSet: [];
}

export interface GuessWhatCurrentState {
    gameState: {
        level: number;
        cards: Card[];
        currentImagesToFind: string[];
        isMemorizationPhase: boolean;
        memorizationTime: number;
        attempts: number;
        maxAttempts: number;
    }
}

export interface Card {
    id: number;
    image: string;
    matched: boolean;
}