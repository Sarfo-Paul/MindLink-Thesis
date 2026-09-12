import { type ReactNode } from "react";

export interface FormProps {
    toggleForm: () => void;
}

export interface LoginFormData {
    email: string;
    password: string;
}

export interface SignUpFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}
    
export interface FormErrors {
    confirmPassword?: string;
}

export interface ProtectedRouteProps {
    children: ReactNode;
}

export interface IGuessWhatMetric {
    level: number;
    attempt: number;
    totalResponseTime: number;
    accuracy: number;
    levelErrors: number;
    levelScore: number;
}

export interface StroopMetric {
    questions: number;
    attempts: number;
    averageResponseTime: number;
    accuracy: number;
    errors: number;
    score: number;
}