import { configureStore } from "@reduxjs/toolkit";
import headReducer from "./slices/strapi/headSlice";
import creditReducer from "./slices/strapi/creditSlice";
import advantagesReducer from "./slices/strapi/advantagesSlice";
import bestofferReducer from "./slices/strapi/bestofferSlice";
import serviceReducer from "./slices/strapi/serviceSlice";
import howgetReducer from "./slices/strapi/howgetSlice";
import banksReducer from "./slices/strapi/banksSlice";
import sequrityReducer from "./slices/strapi/sequritySlice";
import footerSlice from "./slices/strapi/footerSlice";
import filesSlice from "./slices/strapi/FilesSlide";
import mobileAuthReducer from "./slices/auth/mobileAuthSlice";
import authReducer from "./slices/auth/authSlice";
import userReducer from "./slices/user/updateUserSlice";
import uploadReducer from "./slices/user/uploadSlice";
import rimReducer from "./slices/rim/rimSlice";

export const store = configureStore({
  reducer: {
    head: headReducer,
    credit: creditReducer,
    advantages: advantagesReducer,
    bestoffer: bestofferReducer,
    service: serviceReducer,
    howget: howgetReducer,
    banks: banksReducer,
    sequrity: sequrityReducer,
    footer: footerSlice,
    files: filesSlice,
    mobileAuth: mobileAuthReducer,
    auth: authReducer,
    updateUser: userReducer,
    upload: uploadReducer,
    rim: rimReducer,
  },
});
