import React from "react";
import { LucideIcon } from "lucide-react";

const WhySectionCard = ({
  Icon,
  title,
  description,
}: {
  Icon: LucideIcon;
  title: string;
  description: string;
}) => {
  return (
    <div className="text-center flex justify-center flex-col items-center">
      <div className="p-2 mb-2 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-full w-10 h-10 mx-auto">
        <Icon />
      </div>

      <h3 className="text-md md:text-xl font-semibold mb-2">{title}</h3>
      <p className="mb-2 text-xs md:text-sm text-slate-500">{description}</p>
    </div>
  );
};

export default WhySectionCard;
