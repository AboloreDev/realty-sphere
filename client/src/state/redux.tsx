"use client";

import { useRef } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import userReducer from "./slice/userSlice";
import tenantReducer from "./slice/tenantSlice";
import landlordReducer from "./slice/landlordSlice";
import globalReducer from "./slice/globalSlice";
import { authApi } from "./api/authApi";
import { tenantApi } from "./api/tenantApi";
import { landlordApi } from "./api/landlordApi";
import { api } from "./api/api";

/* REDUX STORE */
const rootReducer = combineReducers({
  user: userReducer, //user reducer
  tenant: tenantReducer, //tenant reducer
  landlord: landlordReducer, // landlord reducer
  global: globalReducer, //global reducer
  [authApi.reducerPath]: authApi.reducer,
  [tenantApi.reducerPath]: tenantApi.reducer,
  [landlordApi.reducerPath]: landlordApi.reducer,
  [api.reducerPath]: api.reducer, //global api
});

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        tenantApi.middleware,
        landlordApi.middleware,
        api.middleware //global api
      ),
  });
};

/* REDUX TYPES */
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* PROVIDER */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
    setupListeners(storeRef.current.dispatch);
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}
