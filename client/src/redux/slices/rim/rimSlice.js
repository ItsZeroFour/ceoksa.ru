import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../utils/axios";

export const startVerification = createAsyncThunk(
  "rim/startVerification",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post("/rim/start-verification");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка запуска верификации"
      );
    }
  }
);

export const completeIdentification = createAsyncThunk(
  "rim/completeIdentification",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post("/rim/complete-identification");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка завершения идентификации"
      );
    }
  }
);

const rimSlice = createSlice({
  name: "rim",
  initialState: {
    identificationUrl: null,
    isIframeOpen: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    closeIframe: (state) => {
      state.isIframeOpen = false;
    },
    resetRim: (state) => {
      state.identificationUrl = null;
      state.isIframeOpen = false;
      state.isLoading = false;
      state.error = null;
    },
    clearRimError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startVerification.fulfilled, (state, action) => {
        state.isLoading = false;
        state.identificationUrl = action.payload.identificationUrl;
        state.isIframeOpen = true;
      })
      .addCase(startVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(completeIdentification.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(completeIdentification.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(completeIdentification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { closeIframe, resetRim, clearRimError } = rimSlice.actions;
export default rimSlice.reducer;
