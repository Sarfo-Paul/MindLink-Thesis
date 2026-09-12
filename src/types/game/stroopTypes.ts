import { type BaseGameConfig } from "./base";

export interface IStroopQuestion {
  text: string; // The color word
  fontColor: string; // The color used to render it
  isCorrect: boolean; // Whether word matches color
}

export interface IStroopGameConfig extends BaseGameConfig {
  duration: number; // Game duration in milliseconds (default: 20000 for demo, 90000 for production)
  questions: IStroopQuestion[];
}