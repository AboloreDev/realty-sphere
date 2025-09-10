/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useGetUserProfileQuery } from "@/state/api/authApi";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setSelectedChat, setSelectedUser } from "@/state/slice/messageSlice";
import { Building, MapPin, Phone, Video, X } from "lucide-react";
import { Button } from "../ui/button";

const ChatHeader = () => {
  const dispatch = useAppDispatch();
  const { data: currentUser } = useGetUserProfileQuery();
  const selectedChat = useAppSelector((state) => state.message.selectedChat);

  const handleSelectedUser = () => {
    dispatch(setSelectedChat(null));
  };

  // Determine what to display based on current user's role
  const getChatHeaderInfo = () => {
    const isCurrentUserManager = currentUser?.role === "MANAGER";

    if (isCurrentUserManager) {
      // Manager sees tenant info
      return {
        name: selectedChat?.user?.name,
        subtitle: `Tenant`,
        propertyName: selectedChat?.property?.name,
        location: selectedChat?.property?.location?.address,
        avatarText: selectedChat?.user.name.charAt(0).toUpperCase(),
        role: selectedChat?.user.role,
      };
    } else {
      // Tenant sees property/manager info
      return {
        name: selectedChat?.property.name,
        subtitle: `Managed by ${
          selectedChat?.property?.manager?.name || "Property Manager"
        }`,
        propertyName: selectedChat?.property?.name,
        location: selectedChat?.property?.location?.address,
        avatarText: selectedChat?.property?.name?.charAt(0).toUpperCase(),
        role: "PROPERTY",
      };
    }
  };
  const headerInfo = getChatHeaderInfo();

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Back button + Chat info */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
            {headerInfo.avatarText}
          </div>

          {/* Chat Details */}
          <div className="flex flex-col">
            <h2 className="font-semibold truncate">{headerInfo.name}</h2>
            <div className="flex flex-col gap-2 text-sm text-gray-500">
              <span className="truncate">{headerInfo.subtitle}</span>
              {headerInfo.location && (
                <div className="flex items-center justify-start">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{headerInfo.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Phone className="w-4 h-4" />
            <span className="sr-only">Call</span>
          </Button>

          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Video className="w-4 h-4" />
            <span className="sr-only">Video call</span>
          </Button>

          {/* Close button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSelectedUser()}
          >
            <X />
          </Button>
        </div>
      </div>

      {/* Property info banner (for tenants) */}
      {currentUser?.role === "TENANT" && (
        <div className="mt-3 p-2  rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-sm">
            <Building className="w-4 h-4" />
            <span className="font-medium">
              Discussion about: {headerInfo.propertyName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
export default ChatHeader;
