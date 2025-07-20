"use client";

import React, { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Icon, LatLngTuple } from "leaflet";
import { useGetAllPropertiesQuery } from "@/state/api/api";
import { useAppSelector } from "@/state/redux";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BouncingLoader from "@/components/code/BouncingLoader";

const Maps = () => {
  const router = useRouter();

  // Define the Property type to match the backend response
  interface Property {
    id: number;
    pricePerMonth: number;
    beds: number;
    baths: number;
    propertyType: string;
    squareFeet: number;
    photoUrls: Array<string>;
    location: {
      id: number;
      address: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
      coordinates: {
        longitude: number;
        latitude: number;
      };
    };
  }

  // Get filters from Redux state
  const filters = useAppSelector((state) => state.global.filters);

  // Fetch properties using RTK Query
  const {
    data: properties,
    isLoading,
    isError,
    error,
  } = useGetAllPropertiesQuery(filters);

  // Custom icons
  const propertyIcon = new Icon({
    iconUrl: "/placeholder.png", // Property marker icon
    iconSize: [38, 38],
  });

  // Map center based on filters.coordinates or default to New York
  const mapCenter: LatLngTuple = filters.coordinates
    ? [filters.coordinates[0], filters.coordinates[1]] // [latitude, longitude]
    : [40.71427, -74.00597]; // Default to New York

  console.log(mapCenter);

  // Convert properties to markers
  const propertyMarkers =
    properties?.map((property: Property) => ({
      id: property.id,
      city: property.location.city,
      address: property.location.address,
      imageUrl: property.photoUrls,
      pricePerMonth: property.pricePerMonth,
      position: [
        property.location.coordinates.latitude,
        property.location.coordinates.longitude,
      ] as LatLngTuple,
    })) || [];

  // Component to update map view when coordinates change
  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (filters.coordinates) {
        map.setView([filters.coordinates[0], filters.coordinates[1]], 10);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.coordinates, map]);
    return null;
  };

  // Handle toast notifications for error and empty states
  useEffect(() => {
    if (isError) {
      toast.error(`Error fetching properties: ${error || "Unknown error"}`);
    } else if (!isLoading && properties?.length === 0) {
      toast.info("No properties found for the current filters");
    } else if (properties) {
      toast.success("Properties Fetched Successfully");
    }
  }, [isLoading, isError, error, properties]);

  // Handle popup click to navigate to property page
  const handlePopupClick = (propertyId: number) => {
    router.push(`/search/${propertyId}`);
  };

  return (
    <div className="relative h-screen w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
          <span className="text-lg font-semibold">
            <BouncingLoader />
          </span>
        </div>
      )}
      <MapContainer
        center={mapCenter}
        zoom={10}
        className="h-full w-full rounded-xl z-0"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater />
        {/* Property markers */}
        {propertyMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={propertyIcon}
          >
            <Popup>
              <div
                className="cursor-pointer flex gap-2 w-44 h-24"
                onClick={() => handlePopupClick(marker.id)}
              >
                <Image
                  src={marker.imageUrl[0] || "/placeholder.png"}
                  alt={marker.city}
                  height={400}
                  width={400}
                  className="h-24 w-24 object-cover rounded-md"
                />
                <div>
                  <h3 className="font-semibold">{marker.address}</h3>
                  <p className="text-sm text-gray-600">{marker.city}</p>
                  <p className="text-sm text-gray-600">
                    ${marker.pricePerMonth}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Maps;
