import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { IProduct } from "@/types/product";

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
  products: IProduct[];
};

const initialState: utilState = {
  user: {},
  products: [],
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
    setProducts: (state, action: PayloadAction<IProduct[]>) => {
      state.products = action.payload;
    },
  },
});

export const { setUser, logOutUser, setProducts } = utilSlice.actions;

export const util = (state: RootState) => state._persist;

export default utilSlice.reducer;
