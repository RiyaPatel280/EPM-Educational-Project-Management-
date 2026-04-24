import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const login = createAsyncThunk("login", async (data, thunkAPI) => {
  try {
    const response = await axiosInstance.post("/auth/login", data,{
      headers: { "Content-Type": "application/json" },
    });
    toast.success(response.data.message);
    return response.data.user;
  } catch (error) {
    toast.error(error.response.data.message || "Failed to login");
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const forgotPassword = createAsyncThunk(
  "auth/password/forgot",
  async (email, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/auth/password/forgot", email);
      toast.success(response.data.message);
      return null;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to forgot password");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/password/reset",
  async ({ token, password, confirmPassword }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/auth/password/reset/${token}`,
        { password, confirmPassword },
      );
      toast.success(response.data.message);
      return response.data.user;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to reset password");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const getUser = createAsyncThunk("auth/me", async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`/auth/me`);
    toast.success(response.data.message);
    return response.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response.data.message || "Failed to fatch user",
    );
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`/auth/logout`);
    return null;
  } catch (error) {
    toast.error(error.response.data.message || "Failed to logout");
    return thunkAPI.rejectWithValue(
      error.response.data.message || "Failed to logout",
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isUpdatingPassword: false,
    isRequestingForToken: false,
    isCheckingAuth: true,
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })

       .addCase(getUser.pending, (state) => {
        state.isCheckingAuth = true;
        state.authUser = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
       state.isCheckingAuth = false;
        state.authUser = action.payload;
      })
      .addCase(getUser.rejected, (state) => {
       state.isCheckingAuth = false;
        state.authUser = null;
      })


      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
      })
      .addCase(logout.rejected, (state) => {
        state.authUser = state.authUser;
      })

      .addCase(forgotPassword.pending, (state) => {
        state.isRequestingForToken = true;
      })
       .addCase(forgotPassword.fulfilled, (state) => {
        state.isRequestingForToken = false;

      })
      .addCase(forgotPassword.rejected, (state) => {
        state.isRequestingForToken = false;
      })

       .addCase(resetPassword.pending, (state) => {
        state.isUpdatingPassword = true;
      })
       .addCase(resetPassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
        state.authUser = action.payload;
      })
      .addCase(resetPassword.rejected, (state) => {
        state.isUpdatingPassword = false;
      });
  },
});

export default authSlice.reducer;
