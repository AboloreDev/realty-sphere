"use client";

import { useAppDispatch, useAppSelector } from "@/state/redux";
import {
  FiltersState,
  setFilters,
  setViewMode,
  toggleFiltersOpen,
} from "@/state/slice/globalSlice";

import React, { useState } from "react";
import { cleanParams, formatPriceValue } from "@/lib/utils";
import { Button } from "../../../components/ui/button";
import { Filter, Grid, List, Search } from "lucide-react";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { PropertyTypeIcons } from "@/lib/constants";
import { debounce } from "lodash";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

const FiltersBar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathName = usePathname();
  const filters = useAppSelector((state) => state.global.filters);
  //   const isFilterOpen = useAppSelector((state) => state.global.isFiltersOpen);
  const viewModes = useAppSelector((state) => state.global.viewMode);
  const [searchInput, setSearchInput] = useState(filters.location);

  // debounce to avoid overloading of the api
  const updateUrl = debounce((newFilters: FiltersState) => {
    // use the cleanparams function to cleanup
    const cleanFilters = cleanParams(newFilters);
    // update the search params after debounce
    const updatedSearchParams = new URLSearchParams();

    Object.entries(cleanFilters).forEach(([key, value]) => {
      updatedSearchParams.set(
        key,
        Array.isArray(value) ? value.join(",") : value.toString()
      );
    });

    router.push(`${pathName}?${updatedSearchParams.toString()}`);
  });
  // function to handle changes in the filter
  const handleFilterChange = (
    key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    isMin: boolean | null
  ) => {
    // set a tempORARY VARIABLE FOR THE VALUE
    let newValue = value;

    // CHECK FOR THE CHANGE IN PRICE RANGE AND SQUARE FEET
    if (key === "priceRange" || key === "squareFeet") {
      // TO AVAOID SCATTERING, SPREAD OUT THE CURRENT FILTER AND ATTACH THE NEW KEY VALUE TO IT
      const currentArrayRange = [...filters[key]];
      // CHECK IF THE ISMIN IS NOT EQUALS TO NULL i.e ITS EAITHER 1 OR 0
      if (isMin !== null) {
        const index = isMin ? 0 : 1;
        // PASS THE ISMIN INTO THE FILTERS AND CHECK THE VALUE
        currentArrayRange[index] = value === "any" ? null : Number(value);
      }
      // RENDER THE CURRENTARRAYRANGE INTO THE NEW VALUE
      newValue = currentArrayRange;
    }
    // CHECK FOR COORDINATES
    else if (key === "coordinates") {
      // IF THE VALUE IS ANY, CHECK
      newValue = value === "any" ? [0, 0] : value.map(Number);
    } else {
      //ELSE RETURN JUST THE VALUE IF THE NOTHING IS SELECTED
      newValue = value === "any" ? "any" : value;
    }
    // APPEND THE FILTER CHANGES INTO THE FILTERS ARRAY
    const newFilters = { ...filters, [key]: newValue };
    // UPDATE THE FILTER STATE IN THE REDUX STORE
    dispatch(setFilters(newFilters));
    // update the url
    updateUrl(newFilters);
  };

  // filter toggle function
  const handleToggleOpen = () => {
    dispatch(toggleFiltersOpen());
  };

  // Handle location search with Nominatim
  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchInput) {
      toast.warning("Please enter a location");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/geocode?query=${encodeURIComponent(
          searchInput
        )}&format=json&limit=1`
      );
      const { data } = await response.json();
      console.log(data);

      if (data) {
        const { latitude, longitude } = data;
        dispatch(
          setFilters({
            location: searchInput,
            coordinates: [latitude, longitude],
          })
        );
      }
      toast.success(`Location found`);
    } catch (err) {
      toast.error("Error searching location");
      console.error("Search Error:", err);
    }
  };

  //   price array
  const minPrices = [500, 1000, 2000, 3000, 5000, 10000];
  const maxPrices = [1000, 2000, 3000, 5000, 10000];
  // beds and bath array
  return (
    <div className=" flex justify-between items-center w-full py-5 overflow-x-auto">
      {/* Filters */}
      <div className="flex justify-between items-center gap-2 p-2">
        {/* All filters button */}
        <Button variant="outline" onClick={handleToggleOpen}>
          <Filter className="w-5 h-5" />
          <span>All Filters</span>
        </Button>

        {/* Location search button */}
        <div className="flex items-center">
          <Input
            placeholder="Search location"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="rounded-r-none w-40"
          />
          <Button onClick={handleLocationSearch} className="rounded-l-none">
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {/* Price range*/}
        <div className="flex gap-2">
          {/* Min Price selector */}
          <Select
            value={filters.priceRange[0]?.toString() || "any"}
            onValueChange={(value) =>
              handleFilterChange("priceRange", value, true)
            }
          >
            <SelectTrigger className="w-30 rounded-xl border-primary-400">
              <SelectValue>
                {formatPriceValue(filters.priceRange[0], true)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {minPrices.map((price, index) => (
                <SelectItem key={index} value={price.toString()}>
                  ${price / 1000}k+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* max price selector */}
          <Select
            value={filters.priceRange[1]?.toString() || "any"}
            onValueChange={(value) =>
              handleFilterChange("priceRange", value, false)
            }
          >
            <SelectTrigger className="w-30 rounded-xl border-primary-400">
              <SelectValue>
                {formatPriceValue(filters.priceRange[1], false)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {maxPrices.map((price, index) => (
                <SelectItem key={index} value={price.toString()}>
                  &lt;${price / 1000}k+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Beds and Bath */}
        <div className="flex gap-2">
          {/* Beds */}
          <Select
            value={filters.bed}
            onValueChange={(value) => handleFilterChange("bed", value, null)}
          >
            <SelectTrigger className="w-30 rounded-xl border-primary-400">
              <SelectValue placeholder="beds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Beds</SelectItem>
              <SelectItem value="1">1+ bed</SelectItem>
              <SelectItem value="2">2+ beds</SelectItem>
              <SelectItem value="3">3+ beds</SelectItem>
              <SelectItem value="4">4+ beds</SelectItem>
            </SelectContent>
          </Select>

          {/* baths */}
          <Select
            value={filters.bath}
            onValueChange={(value) => handleFilterChange("bath", value, null)}
          >
            <SelectTrigger className="w-30 rounded-xl border-primary-400">
              <SelectValue placeholder="baths" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Baths</SelectItem>
              <SelectItem value="1">1+ bath</SelectItem>
              <SelectItem value="2">2+ baths</SelectItem>
              <SelectItem value="3">3+ baths</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* // propertyType */}
        <Select
          value={filters.propertyType || "any"}
          onValueChange={(value) =>
            handleFilterChange("propertyType", value, null)
          }
        >
          <SelectTrigger className="w-40 rounded-xl border-primary-400">
            <SelectValue placeholder="Home Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any"> Property Type</SelectItem>
            {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-2" />
                  <span>{type}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* View Modes */}
      <div className="flex justify-between items-center gap-4 p-2">
        <div className="flex border rounded-xl">
          <Button
            variant="ghost"
            className={`${
              viewModes === "list" &&
              "bg-black text-white dark:bg-white dark:text-black"
            }
            `}
            onClick={() => dispatch(setViewMode("list"))}
          >
            <List className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            className={`${
              viewModes === "grid" &&
              "bg-black text-white dark:bg-white dark:text-black"
            }
            `}
            onClick={() => dispatch(setViewMode("grid"))}
          >
            <Grid className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
