"use client";

import dynamic from "next/dynamic";

import { cleanParams } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setFilters } from "@/state/slice/globalSlice";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import FiltersBar from "./FiltersBar";
import FiltersPage from "./FiltersPage";
import MobileFilterPage from "./MobileFilterPage";
import PropertyListings from "./PropertyListings";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const isFilterOpen = useAppSelector((state) => state.global.isFiltersOpen);
  // pages/search/page.tsx or app/page.tsx (Next.js App Router)

  // Dynamically import your Map component with SSR disabled
  const Maps = dynamic(() => import("./Maps"), {
    ssr: false,
  });

  // useEffect to avoid bugs on page load
  useEffect(() => {
    const initialFilters = Array.from(searchParams.entries()).reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc: any, [key, value]) => {
        if (key === "priceRange" || key === "squareFeet") {
          acc[key] = value.split(",").map((v) => (v === "" ? null : Number(v)));
        } else if (key === "coordinates") {
          acc[key] = value.split(",").map(Number);
        } else {
          acc[key] = value === "any" ? null : value;
        }

        return acc;
      },
      {}
    );

    const cleanedFilters = cleanParams(initialFilters);
    dispatch(setFilters(cleanedFilters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className=" w-full mx-auto px-5 flex flex-col">
      {/* filter bar component */}
      <FiltersBar />
      {/* full filter page for desktop*/}
      <div className="flex flex-col lg:flex-row justify-between flex-1 overflow-hidden gap-8 md:gap-4 p-4">
        {/* Filter Panel */}
        <div
          className={`hidden lg:flex h-full overflow-auto transition-all duration-300 ease-in-out  ${
            isFilterOpen
              ? "w-3/12 opacity-100 visible"
              : "w-0 opacity-0 invisible"
          }`}
        >
          <FiltersPage />
        </div>
        <div className="flex lg:hidden">
          <MobileFilterPage />
        </div>

        {/* Map */}
        <div className="w-full mb-8 lg:mb-0 lg:basis-6/12 h-64 lg:h-screen overflow-hidden">
          <Maps />
        </div>

        {/* Property Listings */}
        <div className="w-full lg:basis-4/12 h-auto lg:h-full overflow-y-auto">
          <PropertyListings />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
