// src/store/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { AxiosRequestConfig } from "axios";
import axios from "axios";

interface User {
    id: number;
    name: string;
}

interface AuthState {
    user: User | null;
    status: "idle" | "loading" | "failed";
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    status: "idle",
    error: null,
};

// Fake login thunk (replace with real API call)
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (credentials: { username: string; password: string }) => {
        const options1: AxiosRequestConfig = {
            method: 'POST',
            url: 'http://localhost:3006/login',
            headers: {
                'Content-Type': 'application/json',
            },
            data: { P_EMAILADDR: credentials.username, P_PASSWORD: credentials.password }
        };
        try {
            const { data } = await axios.request(options1);
            console.log(data);
            // if(data.sta)
        } catch (error: any) {
            console.log("Error while logging........");
            console.log(error.message);
            console.log("Error while logging........");
            throw new Error(error.message)
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.status = "loading";
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = "idle";
                // state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || null;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
