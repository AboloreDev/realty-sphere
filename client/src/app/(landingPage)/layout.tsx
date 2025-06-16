import Navbar from "@/components/code/Navbar";
import React from "react";
import Footer from "./homepage/Footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      <main className="h-full flex flex-col w-full">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
