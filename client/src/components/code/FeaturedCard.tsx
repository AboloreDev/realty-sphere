"use client";

import { LucideIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

interface FeaturedCardProps {
  imageSrc: string;
  title: string;
  address: string;
  price: string;
  bedIcon: LucideIcon;
  bathIcon: LucideIcon;
  garageIcon: LucideIcon;
  areaIcon: LucideIcon;
  beds: number;
  baths: number;
  garages: number;
  area: number;
  isForRent?: boolean;
  isFeatured?: boolean;
  agentImage: string;
}

const FeaturedCard = ({
  imageSrc,
  title,
  address,
  price,
  beds,
  baths,
  garages,
  area,
  isForRent = false,
  isFeatured = false,
  agentImage,
  bedIcon: BedIcon,
  bathIcon: BathIcon,
  garageIcon: GarageIcon,
  areaIcon: AreaIcon,
}: FeaturedCardProps) => {
  return (
    <div className="bg-white dark:bg-zinc-900 shadow rounded-lg overflow-hidden">
      <div className="relative h-48 w-full">
        <Image src={imageSrc} alt={title} fill className="object-cover" />
        <div className="absolute top-2 flex justify-between w-full px-2 items-center">
          {isFeatured && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
              Featured
            </span>
          )}
          <span
            className={`text-xs px-2 py-1 rounded ${
              isForRent ? "bg-green-600 text-white" : "bg-yellow-500 text-white"
            }`}
          >
            {isForRent ? "For Rent" : "For Sale"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-3">{address}</p>

        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center flex-col gap-2 w-1/2">
            <BedIcon className="w-4 h-4" />
            <span>{beds} Beds</span>
          </div>
          <div className="flex items-center flex-col gap-2 w-1/2">
            <BathIcon className="w-4 h-4" />
            <span>{baths} Baths</span>
          </div>
          <div className="flex items-center flex-col gap-2 w-1/2">
            <GarageIcon className="w-4 h-4" />
            <span>{garages} Garages</span>
          </div>
          <div className="flex items-center flex-col gap-2 w-1/2">
            <AreaIcon className="w-4 h-4" />
            <span>{area} sqft</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-base text-black dark:text-white">
            {price}
          </span>
          <Image
            src={agentImage}
            alt="Agent"
            width={30}
            height={30}
            className="rounded-full w-10 h-10 border-2 border-white"
          />
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
