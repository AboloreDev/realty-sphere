"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "../components/code/Loader";

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 3000); //
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {loading && <Loader />}
      {!loading && children}
    </>
  );
};

export default ClientWrapper;
