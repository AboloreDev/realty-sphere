"use client";

import { cleanParams, formatEnumString } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import {
  FiltersState,
  initialState,
  setFilters,
  toggleFiltersOpen,
} from "@/state/slice/globalSlice";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Search } from "lucide-react";
import { AmenityIcons, PropertyTypeIcons } from "@/lib/constants";
import { Slider } from "../../../components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { usePathname, useRouter } from "next/navigation";
import { debounce } from "lodash";

const MobileFilterPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathName = usePathname();
  const isFilterOpen = useAppSelector((state) => state.global.isFiltersOpen);
  const filters = useAppSelector((state) => state.global.filters);
  //   create a local filters state for handling state changes in the filter page to avoid conflicts
  const [localFilterState, setLocalFilterState] = useState(
    initialState.filters
  );

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

    router.push(`${pathName} ? ${updatedSearchParams.toString()}`);
  });
  //   handle submit to apply the changes
  const handleSubmit = () => {
    dispatch(setFilters(localFilterState));
    updateUrl(localFilterState);
  };

  //  handle reset to reset the whole filter state
  const handleReset = () => {
    setLocalFilterState(initialState.filters);
    dispatch(setFilters(initialState.filters));
    updateUrl(initialState.filters);
  };

  //   function to handle location search
  const handleLocationSearch = () => {
    console.log("Location");
  };

  //   handle amenity change function
  const handleAmenityChange = (amenity: AmenityEnum) => {
    setLocalFilterState((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  //   double check the filter open state
  if (!isFilterOpen) return null;
  return (
    <div className="">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 min-h-screen"
        onClick={() => dispatch(toggleFiltersOpen())}
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 top-0 right-0 bg-white text-black w-2/3 min-h-screen z-50 flex flex-col p-4 gap-4 overflow-y-auto"
      >
        <div className=" flex flex-col space-y-6 cursor-pointer">
          {/* Location */}
          <div>
            <h4 className="font-bold mb-2">Location</h4>
            <div className="flex items-center">
              <Input
                placeholder="Enter location"
                value={filters.location}
                onChange={(e) =>
                  setLocalFilterState((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className="rounded-l-xl rounded-r-none border-r-0"
              />
              <Button
                onClick={handleLocationSearch}
                className="rounded-r-xl rounded-l-none border-l-none"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Property Type */}
          <div>
            <h4 className="font-bold mb-2">Property Type</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
                <div
                  key={type}
                  className={`flex items-center justify-center flex-col shadow-md p-2 rounded-md ${
                    localFilterState.propertyType === type &&
                    "bg-black text-white "
                  }`}
                  onClick={() =>
                    setLocalFilterState((prev) => ({
                      ...prev,
                      propertyType: type as PropertyTypeEnum,
                    }))
                  }
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="font-bold mb-2">Price Range (Monthly)</h4>
            <Slider
              min={0}
              max={10000}
              step={100}
              value={[
                localFilterState.priceRange[0] ?? 0,
                localFilterState.priceRange[1] ?? 10000,
              ]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onValueChange={(value: any) =>
                setLocalFilterState((prev) => ({
                  ...prev,
                  priceRange: value as [number, number],
                }))
              }
            />
            <div className="flex justify-between mt-2">
              <span>${localFilterState.priceRange[0] ?? 0}</span>
              <span>${localFilterState.priceRange[1] ?? 10000}</span>
            </div>
          </div>

          {/* Beds and Baths */}
          <div className="flex gap-4">
            <div className="flex-1">
              <h4 className="font-bold mb-2">Beds</h4>
              <Select
                value={localFilterState.bed || "any"}
                onValueChange={(value) =>
                  setLocalFilterState((prev) => ({ ...prev, beds: value }))
                }
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Beds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Beds</SelectItem>
                  <SelectItem value="1">1+ bed</SelectItem>
                  <SelectItem value="2">2+ beds</SelectItem>
                  <SelectItem value="3">3+ beds</SelectItem>
                  <SelectItem value="4">4+ beds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <h4 className="font-bold mb-2">Baths</h4>
              <Select
                value={localFilterState.bath || "any"}
                onValueChange={(value) =>
                  setLocalFilterState((prev) => ({ ...prev, baths: value }))
                }
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Baths" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Baths</SelectItem>
                  <SelectItem value="1">1+ bath</SelectItem>
                  <SelectItem value="2">2+ baths</SelectItem>
                  <SelectItem value="3">3+ baths</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Square Feet */}
          <div>
            <h4 className="font-bold mb-2">Square Feet</h4>
            <Slider
              min={0}
              max={5000}
              step={100}
              value={[
                localFilterState.squareFeet[0] ?? 0,
                localFilterState.squareFeet[1] ?? 5000,
              ]}
              onValueChange={(value) =>
                setLocalFilterState((prev) => ({
                  ...prev,
                  squareFeet: value as [number, number],
                }))
              }
              className="[&>.bar]:bg-primary-700"
            />
            <div className="flex justify-between mt-2">
              <span>{localFilterState.squareFeet[0] ?? 0} sq ft</span>
              <span>{localFilterState.squareFeet[1] ?? 5000} sq ft</span>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h4 className="font-bold mb-2">Amenities</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(AmenityIcons).map(([amenity, Icon]) => (
                <div
                  key={amenity}
                  className={`flex items-center justify-center flex-col p-2 shadow-md rounded-md ${
                    localFilterState.amenities.includes(
                      amenity as AmenityEnum
                    ) && "bg-black text-white"
                  }
                        `}
                  onClick={() => handleAmenityChange(amenity as AmenityEnum)}
                >
                  <Icon className="w-5 h-5 hover:cursor-pointer" />
                  <Label className="hover:cursor-pointer">
                    {formatEnumString(amenity)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Available From */}
          <div>
            <h4 className="font-bold mb-2">Available From</h4>
            <Input
              type="date"
              value={
                localFilterState.availableFrom !== "any"
                  ? localFilterState.availableFrom
                  : ""
              }
              onChange={(e) =>
                setLocalFilterState((prev) => ({
                  ...prev,
                  availableFrom: e.target.value ? e.target.value : "any",
                }))
              }
              className="rounded-xl w-40"
            />
          </div>

          {/* Apply and Reset buttons */}
          <div className="flex gap-4 mt-6">
            <Button onClick={handleSubmit} className="flex-1 rounded-xl">
              Apply Changes
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 rounded-xl"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MobileFilterPage;
