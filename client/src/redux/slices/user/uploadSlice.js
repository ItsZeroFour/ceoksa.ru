import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../utils/axios";

export const uploadPhoto = createAsyncThunk(
  "upload/uploadPhoto",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.path;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при загрузке фотографии"
      );
    }
  }
);

const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    uploadedPath: null,
    uploading: false,
    error: null,
    uploadSuccess: false,
  },
  reducers: {
    clearUploadError: (state) => {
      state.error = null;
    },
    clearUploadSuccess: (state) => {
      state.uploadSuccess = false;
    },
    resetUpload: (state) => {
      state.uploadedPath = null;
      state.uploading = false;
      state.error = null;
      state.uploadSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadPhoto.pending, (state) => {
        state.uploading = true;
        state.error = null;
        state.uploadSuccess = false;
      })
      .addCase(uploadPhoto.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadedPath = action.payload;
        state.uploadSuccess = true;
        state.error = null;
      })
      .addCase(uploadPhoto.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
        state.uploadSuccess = false;
      });
  },
});

export const { clearUploadError, clearUploadSuccess, resetUpload } =
  uploadSlice.actions;
export default uploadSlice.reducer;