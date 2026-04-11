import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface User {
    userId: string;
    username: string;
    age?: number;
    gender?: string;
    educationLevel?: string;
    medicalCondition?: boolean;
    smokingStatus?: boolean;
    drinkingStatus?: boolean;
    email: string;
    role: string;
    phone?: string;
    preferredLanguage?: string;
    emergencyContactEnabled?: boolean;
    emergencyContactNumber?: string;
}

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    token: null,
    user: null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginStart(state) {
            state.loading = true;
            state.error = null;
        },

        loginSuccess(state, action: PayloadAction<{ token: string; user: User }>) {
            state.loading = false;
            state.isAuthenticated = true;
            state.token = action.payload.token;
            state.user = action.payload.user;
        },

        updateUserSuccess(state, action: PayloadAction<{user: User}>){
            state.user = action.payload.user;
        },

        loginFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        
        logout(state) {
            state.isAuthenticated = false;
            state.token = null;
            state.user = null;
        },
    },
});

export const { loginStart, loginSuccess, updateUserSuccess, loginFailure, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
