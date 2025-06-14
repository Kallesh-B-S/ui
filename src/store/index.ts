// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import homeReducer from "./homeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    home: homeReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
