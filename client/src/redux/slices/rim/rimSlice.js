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

export const fetchCurrentIdentification = createAsyncThunk(
  "rim/fetchCurrentIdentification",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/rim/current-identification");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка получения данных идентификации"
      );
    }
  }
);


export const fetchIdentificationStatus = createAsyncThunk(
  "rim/fetchIdentificationStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/rim/identification-status");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка получения статуса"
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
    requestGuid: null,

    status: "idle",
    identificationStatus: null,
    error: null,

    isSucceeded: false,
    personalData: null,
    statusReasons: [],

    isIframeOpen: false,
    isLoading: false,
  },
  reducers: {
    openIframe: (state) => {
      state.isIframeOpen = true;
      state.status = "iframeOpen";
    },
    closeIframe: (state) => {
      state.isIframeOpen = false;
    },
    resetRim: (state) => {
      state.identificationUrl = null;
      state.requestGuid = null;
      state.status = "idle";
      state.identificationStatus = null;
      state.error = null;
      state.isSucceeded = false;
      state.personalData = null;
      state.statusReasons = [];
      state.isIframeOpen = false;
      state.isLoading = false;
    },
    clearRimError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startVerification.pending, (state) => {
        state.isLoading = true;
        state.status = "starting";
        state.error = null;
        state.identificationStatus = null;
        state.isSucceeded = false;
      })
      .addCase(startVerification.fulfilled, (state, action) => {
        state.isLoading = false;
        state.identificationUrl = action.payload.identificationUrl;
        state.requestGuid = action.payload.requestGuid;
        state.isIframeOpen = true;
        state.status = "iframeOpen";
      })
      .addCase(startVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchCurrentIdentification.fulfilled, (state, action) => {
        if (action.payload.hasIdentification) {
          state.identificationUrl = action.payload.identificationUrl;
          state.requestGuid = action.payload.requestGuid;
          state.identificationStatus = action.payload.status;
        }
      })

      .addCase(fetchIdentificationStatus.fulfilled, (state, action) => {
        state.identificationStatus = action.payload.status;
        state.statusReasons = action.payload.statusReasons || [];
      })

      .addCase(completeIdentification.pending, (state) => {
        state.isLoading = true;
        state.status = "completing";
      })
      .addCase(completeIdentification.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isIframeOpen = false;
        state.identificationStatus = action.payload.status;
        state.isSucceeded = action.payload.isSucceeded;
        state.personalData = action.payload.personalData;
        state.statusReasons = action.payload.statusReasons || [];

        if (action.payload.isSucceeded) {
          state.status = "succeeded";
        } else if (
          action.payload.status === "identificationFailed" ||
          action.payload.status === "systemError"
        ) {
          state.status = "failed";
        } else {
          // Статус ещё не финальный — оставляем в completing, поллинг продолжит проверять
          state.status = "completing";
        }
      })
      .addCase(completeIdentification.rejected, (state, action) => {
        state.isLoading = false;
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { openIframe, closeIframe, resetRim, clearRimError } =
  rimSlice.actions;
export default rimSlice.reducer;
