// this is the slice for managing global state

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface for filters
export interface FiltersState {
  location: string;
  bed: string;
  bath: string;
  amenities: string[];
  propertyType: string;
  availableFrom: string;
  priceRange: [number, number] | [null, null];
  squareFeet: [number, number] | [null, null];
  coordinates: [number, number]; // lontitude, latitiude
}

// interface for the initial state function
interface InitialStateTypes {
  isFiltersOpen: boolean;
  viewMode: "grid" | "list";
  filters: FiltersState;
  isModalOpen: boolean;
  showPassword: boolean;
}

// initial state
export const initialState: InitialStateTypes = {
  isFiltersOpen: false,
  filters: {
    location: "New York",
    bed: "any",
    bath: "any",
    amenities: [],
    propertyType: "any",
    availableFrom: "any",
    priceRange: [null, null],
    squareFeet: [null, null],
    coordinates: [40.71427, -74.00597],
  },
  viewMode: "grid",
  isModalOpen: false,
  showPassword: false,
};

// slobal slice declraation
export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    toggleFiltersOpen: (state) => {
      state.isFiltersOpen = !state.isFiltersOpen;
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    },
    toggleModalOpen: (state) => {
      state.isModalOpen = !state.isModalOpen;
    },
    setShowPassword: (state) => {
      state.showPassword = !state.showPassword;
    },
  },
});

export const {
  setFilters,
  toggleFiltersOpen,
  setViewMode,
  toggleModalOpen,
  setShowPassword,
} = globalSlice.actions;

export default globalSlice.reducer;
