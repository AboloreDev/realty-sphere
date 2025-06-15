"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Deals", href: "/deals" },
  { label: "Property List", href: "/properties" },
  { label: "Contact Us", href: "/contact" },
];

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 min-h-screen"
            onClick={onClose}
          />

          {/* Sidebar Menu */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 top-0 right-0 w-1/2 min-h-screen z-50 flex flex-col p-6 gap-4 md:hidden bg-black dark:bg-white text-white dark:text-black overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <button onClick={onClose}>
                <X className="h-6 w-6 cursor-pointer" />
              </button>
            </div>
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

            <div className="mt-4 flex flex-col gap-2">
              <ThemeToggle />
              <Button onClick={onClose} size="sm">
                Sign In
              </Button>

              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="text-black hover:text-black"
              >
                Sign Up
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
