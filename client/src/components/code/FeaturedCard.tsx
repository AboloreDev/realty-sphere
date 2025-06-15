import Image from "next/image";
import Link from "next/link";
import React from "react";

const FeaturedCard = ({
  imageSrc,
  title,
  description,
  linkText,
  linkHref,
}: {
  imageSrc: string;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
}) => {
  return (
    <div className="text-center ">
      <div className="p-4 rounded-md mb-2 flex items-center justify-center h-60">
        <Image
          src={imageSrc}
          height={400}
          width={400}
          alt={title}
          className="w-full h-full object-contain"
        />
      </div>

      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="mb-2 text-slate-500">{description}</p>
      <Link
        href={linkHref}
        className="inline-block rounded-md px-4 py-2 border hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
        scroll={false}
      >
        {linkText}
      </Link>
    </div>
  );
};

export default FeaturedCard;
