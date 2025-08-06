import React from "react";

const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <div>
      <h1 className="text-xl font-semibold prata-regular">{title}</h1>
      <p className="text-sm mt-1">{subtitle}</p>
    </div>
  );
};

export default Header;
