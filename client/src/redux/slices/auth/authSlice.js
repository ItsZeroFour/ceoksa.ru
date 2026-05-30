import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { updateUser } from "../user/updateUserSlice";

const API = process.env.REACT_APP_SERVERF_API;

axios.defaults.withCredentials = true;

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      // Cache-busting + явные no-cache заголовки — чтобы ни Cloudflare,
      // ни nginx, ни браузерный disk-cache не отдали старый ответ
      // /auth/me с user data после того как cookie уже умерла.
      const response = await axios.get(`${API}/auth/me`, {
        params: { _t: Date.now() },
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    status: "idle",
    isAuth: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuth = false;
      // status оставляем "succeeded" — иначе ProtectedRoute залипнет
      // на <Loading /> для прямых заходов на /account/*, т.к. fetchMe
      // не перезапускается без reload. При user=null guard сразу
      // редиректит на "/".
    },
    patchUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuth = true;
        state.status = "succeeded";
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.isAuth = false;
        state.status = "failed";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        if (state.user?.data && action.payload) {
          state.user.data = {
            ...state.user.data,
            ...action.payload,
          };
        }
      });
  },
});

export const { logout, patchUser } = authSlice.actions;
export default authSlice.reducer;
