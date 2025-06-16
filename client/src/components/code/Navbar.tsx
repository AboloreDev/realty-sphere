"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const Navbar = () => {
  // mobile menu state
  const [isMobileMenu, setIsMobileMenu] = useState(false);
  const pathname = usePathname();

  const isOpenMenu = () => setIsMobileMenu(true);
  const isCloseMenu = () => setIsMobileMenu(false);

  // Effect
  useEffect(() => {
    document.body.style.overflow = isMobileMenu ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenu]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md shadow-sm prata-regular">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <Link href="/" className="text-2xl font-bold ">
          Nestora
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-6 items-center text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link px-2 py-1 ${
                pathname === link.href ? "active" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex justify-center items-center gap-4">
          <ThemeToggle />
          <Button size="sm">Sign In</Button>
          <Button variant="outline" size="sm">
            Sign Up
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={isOpenMenu}>
          <Menu className="h-6 w-6 cursor-pointer" />
        </button>
      </nav>
      <MobileMenu isOpen={isMobileMenu} onClose={isCloseMenu} />
    </header>
  );
};

export default Navbar;
