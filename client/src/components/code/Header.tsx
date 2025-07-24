import { useGetUserProfileQuery } from "@/state/api/authApi";
import React from "react";

const Header = ({ title, subtitle }: HeaderProps) => {
  const { data: user } = useGetUserProfileQuery();
  return (
    <div>
      {user && (
        <>
          <p className="text-sm prata-regular">{user.name}</p>
          <h1 className="text-xl font-semibold prata-regular">{title}</h1>
          <p className="text-sm mt-2">{subtitle}</p>
        </>
      )}
    </div>
  );
};

export default Header;
