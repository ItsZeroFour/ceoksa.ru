import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = process.env.REACT_APP_SERVERF_API;

export const initiateAuth = createAsyncThunk(
  "mobileAuth/initiate",
  async (phone, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API}/mobile/auth/init`, {
        phone,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const verifyCode = createAsyncThunk(
  "mobileAuth/verify",
  async ({ auth_req_id, code }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API}/mobile/auth/verify`, {
        auth_req_id,
        code,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const checkStatus = createAsyncThunk(
  "mobileAuth/status",
  async (auth_req_id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API}/mobile/auth/status/${auth_req_id}`
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const mobileAuthSlice = createSlice({
  name: "mobileAuth",
  initialState: {
    auth_req_id: null,
    status: "idle",
    phone: null,
    user: null,
    error: null,
  },
  reducers: {
    resetAuth: (state) => {
      state.auth_req_id = null;
      state.status = "idle";
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiateAuth.fulfilled, (state, action) => {
        state.auth_req_id = action.payload.auth_req_id;
        state.status = "pending";
      })
      .addCase(verifyCode.rejected, (state) => {
        state.error = "invalid_code";
      })
      .addCase(checkStatus.fulfilled, (state, action) => {
        state.status = action.payload.status;

        if (action.payload.status === "success") {
          state.user = action.payload.user;
        }

        if (action.payload.status === "failed") {
          state.error = action.payload.error;
        }
      });
  },
});

export const { resetAuth } = mobileAuthSlice.actions;
export default mobileAuthSlice.reducer;
