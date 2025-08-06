import { Lease, Property } from "@/types/prismaTypes";
import { Download, MapPin, User } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface ResidenceCard {
  property: Property;
  currentLease: Lease;
}

const ResidenceCard = ({ property, currentLease }: ResidenceCard) => {
  return (
    <div className=" rounded-xl shadow-md overflow-hidden p-6 flex-1 flex flex-col justify-between">
      {/* Header */}
      <div className="flex gap-5">
        <div className="w-36 h-24 object-cover rounded-xl">
          <Image src={property?.photoUrls[0]} alt="" width={400} height={400} />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="bg-green-700 w-fit px-4 py-1 rounded-full text-sm font-semibold">
              Active Lease
            </div>

            <h2 className="text-xl prata-regular font-bold my-2">
              {property.name}
            </h2>
            <div className="flex items-center mb-2 text-slate-400 text-md">
              <MapPin className="w-5 h-5 mr-1" />
              <span>
                {property.location.city}, {property.location.country}
              </span>
            </div>
          </div>
          <div className="text-xl font-bold">
            ${currentLease.rent}{" "}
            <span className="text-sm font-normal">/year</span>
          </div>
        </div>
      </div>
      {/* Dates */}
      <div>
        <hr className="my-4" />
        <div className="flex justify-between items-center">
          <div className="xl:flex">
            <div className="text-gray-500 mr-2">Start Date: </div>
            <div className="font-semibold">
              {new Date(currentLease.startDate).toLocaleDateString()}
            </div>
          </div>
          <div className="border-[0.5px] border-primary-300 h-4" />
          <div className="xl:flex">
            <div className="text-gray-500 mr-2">End Date: </div>
            <div className="font-semibold">
              {new Date(currentLease.endDate).toLocaleDateString()}
            </div>
          </div>
          <div className="border-[0.5px] border-primary-300 h-4" />
          <div className="xl:flex">
            <div className="text-gray-500 mr-2">Next Payment: </div>
            <div className="font-semibold">
              {new Date(currentLease.endDate).toLocaleDateString()}
            </div>
          </div>
        </div>
        <hr className="my-4" />
      </div>
      {/* Buttons */}
      <div className="flex justify-end gap-2 w-full">
        <Popover>
          <PopoverTrigger asChild>
            <Button>
              <User className="w-5 h-5 mr-2" />
              Manager
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Manager Details</h4>
              <div className="text-sm space-y-2 text-gray-500">
                <p>
                  <strong>Name:</strong> {property?.manager?.name}
                </p>
                <p>
                  <strong>Email:</strong> {property?.manager?.email}
                </p>
                <p>
                  <strong>Phone Number:</strong>{" "}
                  {property?.manager?.phoneNumber}
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button>
          <Download className="w-5 h-5 mr-2" />
          Download Agreement
        </Button>
      </div>
    </div>
  );
};

export default ResidenceCard;
