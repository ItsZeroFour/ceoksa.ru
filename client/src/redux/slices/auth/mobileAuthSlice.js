import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = process.env.REACT_APP_SERVERF_API;

export const initiateAuth = createAsyncThunk(
  "mobileAuth/initiate",
  async (phone, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API}/mobile/auth/init`, { phone });
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
        `${API}/mobile/auth/status/${auth_req_id}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const finalizeAuth = createAsyncThunk(
  "mobileAuth/finalize",
  async (auth_req_id, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API}/mobile/finalize/${auth_req_id}`,
        {},
        { withCredentials: true }
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
    hhe_uri: null,
    flow: null,
  },
  reducers: {
    resetAuth: (state) => {
      state.auth_req_id = null;
      state.status = "idle";
      state.phone = null;
      state.user = null;
      state.error = null;
      state.hhe_uri = null;
      state.flow = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiateAuth.fulfilled, (state, action) => {
        state.auth_req_id = action.payload.auth_req_id;
        state.hhe_uri = action.payload.hhe_uri || null;
        state.flow = action.payload.hhe_uri ? "push" : "sms";
        state.status = "pending";
      })

      .addCase(verifyCode.fulfilled, (state) => {
        state.status = "verifying";
      })

      .addCase(checkStatus.fulfilled, (state, action) => {
        state.status = action.payload.status;
        if (action.payload.status === "success") {
          state.user = action.payload.user || null;
        }
      })

      .addCase(finalizeAuth.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload.user;
      });
  },
});

export const { resetAuth } = mobileAuthSlice.actions;
export default mobileAuthSlice.reducer;
