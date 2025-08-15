"use client";

import ApplicationFormModal from "@/components/code/ApplicationFormModal";
import { Button } from "@/components/ui/button";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import { Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface Manager {
  name: string;
  email: string;
  phoneNumber: string;
}

interface WidgetProps {
  property: Manager;
  propertyId: number;
}

const Widget = ({ property, propertyId }: WidgetProps) => {
  const { data: user } = useGetUserProfileQuery();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    if (user) {
      setIsModalOpen(true);
    } else {
      router.push("/auth/login");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
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

      {/* Application Form Modal */}
      <ApplicationFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        propertyId={propertyId}
      />
    </>
  );
};

export default Widget;
