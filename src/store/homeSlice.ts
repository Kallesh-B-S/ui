import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import { logout } from "./authSlice";

const initialState:
    {
        logoURL: string;
        isloading: boolean;
        data: any;
        tableData: any;
    } = {
    logoURL: '',
    isloading: false,
    data: null,
    tableData: []
};

export const getUserDetails = createAsyncThunk(
    "getUserDetails",
    async (email: string, { rejectWithValue }) => {
        try {
            const options1: AxiosRequestConfig = {
                method: 'GET',
                url: `https://dev.alphaomegainfosys.com/test-api/oracle/GetUserDetails/${email}`,
                withCredentials: true,
            };

            const { data } = await axios.request(options1);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || { message: "Login failed" });
        }
    }
);

export const getBasicDemoTableData = createAsyncThunk(
    "getBasicDemoTableData",
    async (_, { dispatch, rejectWithValue }) => {
        const options1: AxiosRequestConfig = {
            method: 'GET',
            url: `https://dev.alphaomegainfosys.com/test-api/oracle/GetRegions`,
            withCredentials: true,
        };
        try {


            const { data } = await axios.request(options1);
            console.log(data);
            return data

        } catch (error: any) {
            if (error.response) {
                console.log('Status:', error.response.status); // likely 401
                console.log('Data:', error.response.data); // server error message/body
            } else {
                console.log('Error message:', error.message);
            }

            if (error.response.status === 401 && error.response.data.message === "Invalid Token") {
                dispatch(refreshTokens(options1))
            }
            // return rejectWithValue(err.message ? { message: err.message } : { message: "getBasicDemoTableData failed" });
        }
    }
);


export const refreshTokens = createAsyncThunk(
    "refreshTokens",
    async (axiosRequestConfigC: AxiosRequestConfig, { dispatch, rejectWithValue }) => {
        const options1: AxiosRequestConfig = {
            method: 'GET',
            url: `https://dev.alphaomegainfosys.com/test-api/refresh-tokens`,
            withCredentials: true,
        };
        try {
            const { data } = await axios.request(options1);
            if (data.statusCode === 200) {
                // axios.request(axiosRequestConfigC)

                dispatch(getBasicDemoTableData())
            }
            if (data.statusCode === 401 && data.message === "Authentication failed") {
                throw new Error("Authentication failed")
            }
        } catch (error: any) {
            if (error.response.status === 401 && error.response.data.message === "Authentication failed") {
                dispatch(logout())
            }
            // return rejectWithValue(err.message ? { message: err.message } : { message: "getUserDetails failed" });
        }
    }
);

const homeSlice = createSlice({
    name: "home",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getUserDetails.pending, (state) => {
                state.isloading = true
            })
            .addCase(getUserDetails.fulfilled, (state, action: any) => {
                state.isloading = false;
                console.log("logging getUserDetails fulfilled state payload", action.payload.userDetails);
                state.data = action.payload?.userDetails;
            })
            .addCase(getUserDetails.rejected, (state, action: any) => {
                state.isloading = false;
                console.log("logging getUserDetails fulfilled state payload", action.payload);
            })

            .addCase(getBasicDemoTableData.pending, (state) => {
                state.isloading = true;
            })
            .addCase(getBasicDemoTableData.fulfilled, (state, action: any) => {
                state.isloading = false;
                state.tableData = action.payload;
                console.log("getBasicDemoTableData payload action state", action);

            })
            .addCase(getBasicDemoTableData.rejected, (state) => {
                state.isloading = false;
            })

        // .addCase(refreshTokens.fulfilled, (state, action: any) => {
        //     state.tableData = action.payload ?? [];
        //     console.log(action.payload);

        // })
    },
})

export const { } = homeSlice.actions;
export default homeSlice.reducer;