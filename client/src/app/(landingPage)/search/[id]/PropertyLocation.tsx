"use client";

import { useGetSinglePropertyQuery } from "@/state/api/api";
import "leaflet/dist/leaflet.css";
import { LatLngTuple, Icon } from "leaflet";
import { Compass, MapPin } from "lucide-react";
import React from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const PropertyLocation = ({ propertyId }: PropertyLocationProps) => {
  const { data: propertyWithCoordinate } =
    useGetSinglePropertyQuery(propertyId);

  const customIcon = new Icon({
    iconUrl: "/pin.png",
    iconSize: [38, 38],
  });

  const mapCenter: LatLngTuple = [
    propertyWithCoordinate?.location.coordinates.latitude,
    propertyWithCoordinate?.location.coordinates.longitude,
  ];

  return (
    propertyWithCoordinate && (
      <div className="py-10">
        <h3 className="text-xl font-semibold prata-regular">
          Map and Location
        </h3>
        <div className="flex justify-between items-center text-sm text-primary-500 mt-2">
          <div className="flex items-center text-gray-500">
            <MapPin className="w-4 h-4 mr-1 text-gray-700" />
            Property Address:
            <span className="ml-2 font-semibold text-gray-700">
              {propertyWithCoordinate.location?.address ||
                "Address not available"}
            </span>
          </div>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(
              propertyWithCoordinate.location?.address || ""
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-between items-center hover:underline gap-2 text-primary-600"
          >
            <Compass className="w-5 h-5" />
            Get Directions
          </a>
        </div>
        <div className="relative h-[350px] mt-4 rounded-lg overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={14}
            className="h-full w-full z-0"
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={mapCenter} icon={customIcon}>
              <Popup>
                <div className="w-44">
                  <h3 className="font-semibold">
                    {propertyWithCoordinate.location.address}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {propertyWithCoordinate.location.city}
                  </p>
                  <p className="text-sm text-gray-600">
                    {propertyWithCoordinate.name}
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    )
  );
};

export default PropertyLocation;
