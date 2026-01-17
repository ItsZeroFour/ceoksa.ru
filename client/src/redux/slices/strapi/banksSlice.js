import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const STRAPI_URL = process.env.REACT_APP_ADMIN_API;

export const fetchBanks = createAsyncThunk(
  "strapi/fetchBanks",
  async (endpoint, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${STRAPI_URL}/${endpoint}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Ошибка загрузки");
    }
  }
);

const banksSlice = createSlice({
  name: "strapi",
  initialState: {
    data: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBanks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchBanks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default banksSlice.reducer;
