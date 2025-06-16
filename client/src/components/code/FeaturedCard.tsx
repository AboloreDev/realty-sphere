"use client";

import { LucideIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

interface FeaturedCardProps {
  imageSrc: string;
  title: string;
  address: string;
  price: string;
  Icon: LucideIcon;
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
  Icon,
}: FeaturedCardProps) => {
  return (
    <div className="bg-white dark:bg-zinc-900 shadow rounded-lg overflow-hidden">
      <div className="relative h-48 w-full">
        <Image src={imageSrc} alt={title} fill className="object-cover" />
        <div className="absolute top-2 left-2 flex gap-2">
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
          <div className="flex items-center gap-2">
            <div>
              <Icon />
            </div>
            <span>{beds} Beds</span>
          </div>

          <span>{baths} Baths</span>
          <span>{garages} Garages</span>
          <span>{area} sqft</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-base text-black dark:text-white">
            {price}
          </span>
          <Image
            src={agentImage}
            alt="Agent"
            width={32}
            height={32}
            className="rounded-full border-2 border-white"
          />
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
