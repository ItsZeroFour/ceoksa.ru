import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../utils/axios";

axios.defaults.withCredentials = true;

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.patch("/user/update", userData);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при обновлении пользователя"
      );
    }
  }
);

const updateUserSlice = createSlice({
  name: "updateUser",
  initialState: {
    currentUser: null,
    loading: false,
    error: null,
    updateSuccess: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      });
  },
});

export const { clearError, clearUpdateSuccess, setCurrentUser } =
  updateUserSlice.actions;
export default updateUserSlice.reducer;
