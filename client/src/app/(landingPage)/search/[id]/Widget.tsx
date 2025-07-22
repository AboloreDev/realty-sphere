"use client";

import { Button } from "@/components/ui/button";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import { toggleModalOpen } from "@/state/slice/globalSlice";
import { Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface Manager {
  name: string;
  email: string;
  phoneNumber: string;
}

const Widget = ({ property }: Manager) => {
  const { data: user } = useGetUserProfileQuery();
  const router = useRouter();

  const handleModalOpen = () => {
    if (user) {
      toggleModalOpen();
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="border border-primary-200 rounded-2xl p-4 h-fit min-w-[300px] space-y-5">
      {/* Contact Property */}
      <h2 className="prata-regular text-center">Contact This Property</h2>
      <div className="flex flex-col space-y-2 rounded-xl">
        <h4 className="">Lanlord Info:</h4>
        <hr />
        <div className="flex items-center justify-start font-semibold gap-6 w-full">
          <Phone className="text-primary-50" size={15} />
          <p> {property?.phoneNumber}</p>
        </div>
        <div className="flex items-center justify-start font-semibold gap-6 w-full">
          <Mail className="text-primary-50" size={15} />
          <p> {property?.email}</p>
        </div>
        <div className="flex items-center justify-start font-semibold gap-6 w-full">
          <User className="text-primary-50" size={15} />
          <p> {property?.name}</p>
        </div>
      </div>
      <Button className="w-full" onClick={handleModalOpen}>
        {user ? "Submit Application" : "Sign In to Apply"}
      </Button>

      <hr className="my-4" />
      <div className="text-sm">
        <div className="text-primary-600 mb-1">
          Language: English, French, Yoruba.
        </div>
        <div className="text-primary-600">
          Open by appointment on Monday - Sunday
        </div>
      </div>
    </div>
  );
};

export default Widget;
