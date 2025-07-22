import ReadMore from "@/components/code/ReadMore";
import { useGetSinglePropertyQuery } from "@/state/api/api";
import { MapPin, Star } from "lucide-react";
import React from "react";

const PropertyOverview = ({ propertyId }: PropertyOverviewProps) => {
  const { data: propertyWithCoordinate } =
    useGetSinglePropertyQuery(propertyId);

  console.log(propertyWithCoordinate);

  const property = propertyWithCoordinate;

  return (
    propertyWithCoordinate && (
      <div>
        {/* Header */}
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">
            {property.location?.country} / {property.location?.state} /{" "}
            <span className="font-semibold text-gray-600">
              {property.location?.city}
            </span>
          </div>
          <h1 className="text-3xl font-bold my-4 prata-regular">
            {property.name}
          </h1>
          <div className="flex flex-col md:flex-row items-start justify-between md:items-center">
            <span className="flex items-center text-gray-500">
              <MapPin className="w-4 h-4 mr-1 text-gray-700" />
              {property.location?.city}, {property.location?.state},{" "}
              {property.location?.country}
            </span>
            <div className="flex justify-between items-center gap-3">
              <span className="flex items-center text-yellow-500">
                <Star className="w-4 h-4 mr-1 fill-current" />
                {property.averageRating.toFixed(1)} ({property.numberOfReviews}{" "}
                Reviews)
              </span>
              <span className="text-green-600">Verified Listing</span>
            </div>
          </div>
        </div>

        {/*Desktop  Details */}
        <div className="hidden md:block border border-primary-200 rounded-xl p-6 mb-3">
          <div className="flex justify-between items-center gap-4 px-5">
            <div>
              <div className="text-sm text-gray-500">Monthly Rent</div>
              <div className="font-semibold">
                ${property.pricePerMonth.toLocaleString()}
              </div>
            </div>
            <div className="border-l border-gray-300 h-10"></div>
            <div>
              <div className="text-sm text-gray-500">Bedrooms</div>
              <div className="font-semibold">{property.beds} beds</div>
            </div>
            <div className="border-l border-gray-300 h-10"></div>
            <div>
              <div className="text-sm text-gray-500">Bathrooms</div>
              <div className="font-semibold">{property.baths} baths</div>
            </div>
            <div className="border-l border-gray-300 h-10"></div>
            <div>
              <div className="text-sm text-gray-500">Square Feet</div>
              <div className="font-semibold">
                {property.squareFeet.toLocaleString()} sq ft
              </div>
            </div>
          </div>
        </div>

        {/* Mobile detials */}
        <div className="grid grid-cols-2 gap-4 md:hidden p-3 mb-3">
          <div>
            <div className="text-sm text-gray-500">Monthly Rent</div>
            <div className="font-semibold">
              ${property.pricePerMonth.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Bedrooms</div>
            <div className="font-semibold">{property.beds} beds</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Bathrooms</div>
            <div className="font-semibold">{property.baths} baths</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Square Feet</div>
            <div className="font-semibold">
              {property.squareFeet.toLocaleString()} sq ft
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="my-10">
          <h3 className="text-xl font-semibold mb-2 prata-regular">
            About {property.name}
          </h3>
          <h5 className="leading-7 semi-bold mb-5">{property.description}</h5>
          <ReadMore text={property.subDescription} maxParagraphs={2} />
        </div>
      </div>
    )
  );
};

export default PropertyOverview;
