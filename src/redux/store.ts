/* eslint-disable @typescript-eslint/no-explicit-any */
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slices/auth-slice/authSlice";
import { guessWhatGameReducer } from "./slices/games-slice/guessWhat";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { stroopGameReducer } from "./slices/games-slice/stroop";
import { contentReducer } from "./slices/content-slice/contentSlice";

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["content", "auth", "guessWhat", "stroop",],
};

const appReducer = combineReducers({
    content: contentReducer,
    auth: authReducer,
    guessWhat: guessWhatGameReducer,
    stroop: stroopGameReducer
    //... add more game states
});

const rootReducer = (state: any, action: any) => {
    if (action.type == "app/reset" ){
        state = undefined;
    }

    return appReducer(state, action)
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
