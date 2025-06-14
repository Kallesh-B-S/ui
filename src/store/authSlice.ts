// src/store/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { AxiosRequestConfig } from "axios";
import axios from "axios";

interface User {
    email: string
}

interface AuthState {
    user: User | null;
    loggedIn: boolean;
    error: string | null;
    isLoading: boolean;
}

const initialState: AuthState = {
    user: null,
    loggedIn: false,
    error: null,
    isLoading: false,
};

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (credentials: { username: string; password: string }, { rejectWithValue }) => {
        try {
            const options1: AxiosRequestConfig = {
                method: 'POST',
                url: 'http://localhost:3006/login',
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
                data: { P_EMAILADDR: credentials.username, P_PASSWORD: credentials.password }
            };

            const { data } = await axios.request(options1);
            return data; // ✅ Return user data here
        } catch (err: any) {
            return rejectWithValue(err.response?.data || { message: "Login failed" });
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            const options1: AxiosRequestConfig = {
                method: 'POST',
                url: 'http://localhost:3006/logout',
                withCredentials: true
            };

            const { data, status } = await axios.request(options1);
            if (status === 100) { }
            return data;
        } catch (error: any) {
            return rejectWithValue(
                error.response || { message: "Logout failed" }
            );
        }
    }
);


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            state.loggedIn = false;
        },
    },
    extraReducers: (builder) => {
        builder
            //login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loginUser.fulfilled, (state, action: any) => {
                state.isLoading = false;
                state.user = action.payload;
                state.loggedIn = true
            })
            .addCase(loginUser.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload.message;
            })
            // logout

            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, (state, action: any) => {
                state.isLoading = false;
                console.log("logout fulfilled state payload", action.payload);
                state.loggedIn = false;
            })
            .addCase(logoutUser.rejected, (state, action: any) => {
                state.isLoading = false;
                console.log("logout rejected state payload", action.payload);
                state.error = "Error while logging out!"
            })
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;



//   const handleLogOut = async () => {

//     const options1: AxiosRequestConfig = {
//       method: 'POST',
//       url: 'http://localhost:3006/logout',
//       withCredentials: true
//       // headers: {
//       //   'Content-Type': 'application/json',
//       // }
//     };

//     try {
//       const { data } = await axios.request(options1);
//       console.log(data);
//       if (data.statusCode === 200) {
//         alert("Logout successfully");
//         setLoggedInEmail('')
//         setLoggedIn(false);
//       }
//     } catch (error: any) {
//       // alert("Failed to Logout successfully");
//       setLoggedIn(false)
//       navigate('/login')
//     }
//   }





// const options1: AxiosRequestConfig = {
//     method: 'GET',
//     url: `http://localhost:3006/GetUserDetails/${loggedInEmail}`,
//     withCredentials: true
// };

// try {
//     const { data } = await axios.request(options1);
//     console.log(data);
//     if (data.userDetails.LOGONAME) {
//         setLogo(data.userDetails.LOGONAME);
//     }
// } catch (error: any) {
//     console.log("Error while logging........");
//     console.log(error.message);
//     console.log("Error while logging........");
// }