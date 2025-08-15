/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Mail, MapPin, PhoneCall } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface ApplicationCardProps {
  application: any;
  user: any;
  children: any;
}

const ApplicationCard = ({
  application,
  user,
  children,
}: ApplicationCardProps) => {
  const [imgSrc, setImgSrc] = useState(application.property.photoUrls?.[0]);
  const userRole = user.user.role;

  //   status color
  const statusColor =
    application.status === "Approved"
      ? "bg-green-600"
      : application.status === "Denied"
      ? "bg-red-600"
      : "bg-yellow-600";

  const getPersonInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm mb-4">
      <div className="flex flex-col lg:flex-row  items-start lg:items-center justify-between px-6 md:px-4 py-6 gap-6 lg:gap-4">
        {/* Property Info Section */}
        <div className="flex flex-col lg:flex-row gap-5 w-full lg:w-auto">
          <Image
            src={imgSrc}
            alt={application.property.name}
            width={200}
            height={150}
            className="rounded-xl object-cover w-full lg:w-[200px] h-[150px]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/featured-image1.jpg")}
          />
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold my-2 prata-regular">
                {application.property.name}
              </h2>
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 mr-1" />
                <span className="text-slate-400">{`${application.property.location.city}, ${application.property.location.country}`}</span>
              </div>
            </div>
            <div className="text-md font-semibold">
              ${application.property.pricePerMonth}{" "}
              <span className="text-sm font-normal">/ year</span>
            </div>
          </div>
        </div>

        {/* Divider - visible only on desktop */}
        <div className="hidden lg:block border-[0.5px] border-primary-200 h-48" />

        {/* Status Section */}
        <div className="flex flex-col justify-between w-full lg:basis-2/12 lg:h-48 py-2 gap-3 lg:gap-0">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status:</span>
              <span
                className={`px-2 py-1 ${statusColor} text-white rounded-full text-sm`}
              >
                {application.status}
              </span>
            </div>
            <hr className="mt-3" />
          </div>
          {application?.lease?.startDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">Start Date:</span>
              <span>
                {new Date(application.lease.startDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {application?.lease?.endDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">End Date:</span>
              <span>
                {new Date(application.lease.endDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {application?.nextPaymentDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">Next Payment:</span>
              <span>
                {new Date(application.nextPaymentDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Divider - visible only on desktop */}
        <div className="hidden lg:block border-[0.5px] border-primary-200 h-48" />

        {/* Contact Person Section */}
        <div className="flex flex-col justify-start gap-5 w-full lg:basis-3/12 lg:h-48 py-2">
          <div>
            <div className="text-lg font-semibold prata-regular">
              {userRole === "MANAGER" ? "Tenant" : "Manager"}
            </div>
            <hr className="mt-3" />
          </div>
          <div className="flex flex-col items-start gap-2 ">
            <div>
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {getPersonInitials(application.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-semibold">{application.name}</div>
              <div className="text-sm flex items-center text-primary-600">
                <PhoneCall className="w-5 h-5 mr-2" />
                {application.phoneNumber}
              </div>
              <div className="text-sm flex items-center text-primary-600">
                <Mail className="w-5 h-5 mr-2" />
                {application.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-4" />
      {children}
    </div>
  );
};

export default ApplicationCard;
