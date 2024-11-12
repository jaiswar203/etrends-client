import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export type utilState = {
  user: {
    _id?: string;
    token?: string;
    name?: string;
    email?: string;
    designation?: string;
    phone?: string;
    img?: string;
  };
};

const initialState: utilState = {
  user: {},
};

export const utilSlice = createSlice({
  name: "util",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<object>) => {
      state.user = action.payload;
    },
    logOutUser: (state) => {
      state.user = {};
    },
  },
});

export const { setUser, logOutUser } = utilSlice.actions;

export const util = (state: RootState) => state._persist;

export default utilSlice.reducer;