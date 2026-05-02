import { configureStore } from "@reduxjs/toolkit";
import formReducer from "../slices/FormSlice";
import branchReducer from "../slices/BranchSlice";
import userReducer from "../slices/userSlice";

const store = configureStore({
  reducer: {
    form: formReducer,
    myBranch: branchReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for non-serializable values like functions in actions
    }),
});

export default store;
