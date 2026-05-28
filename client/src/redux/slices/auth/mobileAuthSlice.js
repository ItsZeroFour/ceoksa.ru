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
      const response = await axios.post(
        `${API}/mobile/auth/verify`,
        { auth_req_id, code },
        { withCredentials: true, timeout: 25000 }
      );
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
        {
          withCredentials: true,
          // сервер long-poll'ит до 25 сек, держим запас
          timeout: 35000,
        }
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
    canRetry: false,
    failReason: null,
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
      state.canRetry = false;
      state.failReason = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiateAuth.pending, (state) => {
        state.canRetry = false;
        state.failReason = null;
        state.error = null;
      })
      .addCase(initiateAuth.fulfilled, (state, action) => {
        state.auth_req_id = action.payload.auth_req_id;
        state.hhe_uri = action.payload.hhe_uri || null;
        state.status = "pending";
        state.flow = action.payload.hhe_uri ? "seamless" : "push";
        state.canRetry = false;
        state.failReason = null;
      })
      .addCase(initiateAuth.rejected, (state, action) => {
        state.error = action.payload?.message || "Ошибка инициализации";
      })

      .addCase(checkStatus.fulfilled, (state, action) => {
        const { status, user, error, error_description, can_retry } =
          action.payload;

        if (status === "sms_sent") {
          state.flow = "sms";
        }

        state.status = status;

        if (status === "success") {
          state.user = user || null;
        }

        if (status === "failed") {
          state.canRetry = can_retry || false;
          state.failReason = error || null;
          state.error = error_description || error || "Ошибка аутентификации";
        }

        if (status === "expired") {
          state.canRetry = true;
          state.failReason = "expired";
        }
      })
      .addCase(checkStatus.rejected, (state, action) => {
        state.error = action.payload?.message || "Ошибка проверки статуса";
      })

      .addCase(verifyCode.fulfilled, (state) => {
        state.status = "verifying";
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.error = action.payload?.message || "Неверный код";
      })

      .addCase(finalizeAuth.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload.user;
      })
      .addCase(finalizeAuth.rejected, (state, action) => {
        state.error = action.payload?.message || "Ошибка финализации";
      });
  },
});

export const { resetAuth } = mobileAuthSlice.actions;
export default mobileAuthSlice.reducer;
