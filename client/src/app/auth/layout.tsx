import Image from "next/image";
import React from "react";
import featureImage from "../../../public/featured-image1.jpg";

export interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="relative min-h-screen w-full">
      {/* Background Image */}
      <Image
        src={featureImage}
        alt="Modern lake house with forest and mountains"
        fill
        className="object-cover "
        priority
      />
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 flex justify-center items-center min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
