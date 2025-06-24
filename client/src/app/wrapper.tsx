"use client";

import { useEffect, useState } from "react";
import Loader from "../components/code/Loader";

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000); // shows for 3 seconds
    return () => clearTimeout(timer);
  }, []);

  return <>{loading ? <Loader /> : children}</>;
};

export default ClientWrapper;
