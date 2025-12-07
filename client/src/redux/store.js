import { configureStore } from "@reduxjs/toolkit";
import headReducer from "./slices/strapi/headSlice";
import creditReducer from "./slices/strapi/creditSlice";
import advantagesReducer from "./slices/strapi/advantagesSlice";
import bestofferReducer from "./slices/strapi/bestofferSlice";

export const store = configureStore({
  reducer: {
    head: headReducer,
    credit: creditReducer,
    advantages: advantagesReducer,
    bestoffer: bestofferReducer,
  },
});
