import { Mail, PhoneCall } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface LeaseCardProps {
  lease: {
    startDate?: string;
    endDate?: string;
    status: string;
    property: {
      name: string;
      photoUrls?: string[];
      pricePerMonth: number;
      manager: {
        name: string;
        email: string;
        phoneNumber: string;
      };
    };
    tenant: {
      id: string;
      email: string;
      phoneNumber: string;
      name: string;
    };

    nextPaymentDate?: string;
  };

  user: {
    user: {
      name: string;
      email: string;
      role: "TENANT" | "MANAGER";
    };
  };
  children?: React.ReactNode;
}

const LeaseCard = ({ lease, user, children }: LeaseCardProps) => {
  const [imgSrc, setImgSrc] = useState(lease.property.photoUrls?.[0]);
  const userRole = user.user.role;

  const statusColor = (() => {
    switch (lease.status.toLowerCase()) {
      case "approved":
        return "bg-green-600";
      case "denied":
        return "bg-red-600";
      case "pending":
      default:
        return "bg-yellow-600";
    }
  })();

  const getPersonInitials = (name: string | undefined) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm mb-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 md:px-4 py-6 gap-6 lg:gap-4">
        {/* Property Info Section */}
        <div className="flex flex-col lg:flex-row gap-5 w-full lg:w-auto">
          <Image
            src={imgSrc || "/featured-image1.jpg"}
            alt={lease.property.name}
            width={200}
            height={150}
            className="rounded-xl object-cover w-full lg:w-[200px] h-[150px]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/featured-image1.jpg")}
          />
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold my-2 prata-regular">
                {lease.property.name}
              </h2>
            </div>
            <div className="text-md font-semibold">
              ${lease.property.pricePerMonth}
              <span className="text-sm font-normal"> / year</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block border-[0.5px] border-primary-200 h-48" />

        {/* Status Section */}
        <div className="flex flex-col justify-between w-full lg:basis-2/12 lg:h-48 py-2 gap-3 lg:gap-0">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status:</span>
              <span
                className={`px-2 py-1 ${statusColor} text-white rounded-full text-sm capitalize`}
              >
                {lease.status}
              </span>
            </div>
            <hr className="mt-3" />
          </div>

          {lease?.startDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">Start Date:</span>
              <span>{new Date(lease.startDate).toLocaleDateString()}</span>
            </div>
          )}

          {lease?.endDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">End Date:</span>
              <span>{new Date(lease.endDate).toLocaleDateString()}</span>
            </div>
          )}

          {lease.nextPaymentDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">Next Payment:</span>
              <span>
                {new Date(lease.nextPaymentDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden lg:block border-[0.5px] border-primary-200 h-48" />

        {/* Contact Section */}
        <div className="flex flex-col justify-start gap-5 w-full lg:basis-3/12 lg:h-48 py-2">
          <div>
            <div className="text-lg font-semibold prata-regular">
              {userRole === "MANAGER" ? "Tenant" : "Manager"}
            </div>
            <hr className="mt-3" />
          </div>

          <div className="flex flex-col items-start gap-2">
            <div>
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {userRole === "MANAGER"
                    ? getPersonInitials(lease.tenant.name)
                    : getPersonInitials(lease.property.manager.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-semibold">
                {userRole === "MANAGER"
                  ? lease.tenant.name
                  : lease.property.manager?.name}
              </div>
              <div className="text-sm flex items-center text-primary-600">
                <PhoneCall className="w-5 h-5 mr-2" />
                {userRole === "MANAGER"
                  ? lease.tenant.phoneNumber
                  : lease.property.manager?.phoneNumber}
              </div>
              <div className="text-sm flex items-center text-primary-600">
                <Mail className="w-5 h-5 mr-2" />
                {userRole === "MANAGER"
                  ? lease.tenant.email
                  : lease.property.manager?.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      {children && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
};

export default LeaseCard;
