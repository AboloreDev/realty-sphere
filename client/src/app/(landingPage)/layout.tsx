import Footer from "@/components/code/Footer";
import Navbar from "@/components/code/Navbar";
import React from "react";

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
