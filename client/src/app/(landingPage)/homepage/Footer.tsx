"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Twitter, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="dark:bg-black bg-slate-50 text-black dark:text-white  pt-12 prata-regular">
      {/* Newsletter */}
      <div className="w-full px-4 sm:px-6 md:px-8 py-10  text-center">
        <h3 className="text-2xl font-semibold mb-4">Join Nestora Community</h3>
        <p className="text-gray-400 mb-6 text-sm">
          Be the first to know about exclusive listings, updates, and offers.
        </p>
        <form className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            className="w-full bg-white dark:bg-black text-black dark:text-white sm:w-auto flex-1 px-4 py-3 rounded-md text-sm focus:outline-none"
          />
          <Button
            variant="outline"
            type="submit"
            className=" px-6 py-3 rounded-md font-semibold text-sm hover:bg-gray-200 transition"
          >
            Subscribe Now
          </Button>
        </form>
      </div>

      {/* Footer Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Logo + Description */}
        <div>
          <h4 className="text-xl font-bold mb-4">Nestora</h4>
          <p className=" text-sm">
            Your trusted real estate platform in Nigeria. Discover homes,
            apartments, and investment opportunities with ease and confidence.
          </p>
          <div className="flex gap-4 items-center mt-4">
            <Link href={"https://www.x.com/abolorreeeee"}>
              <Twitter />
            </Link>
            <Link href={"https://www.github.com/aboloredev"}>
              <Github />
            </Link>
            <Link href={"https://www.linkedin.com/in/fathiu-alabi"}>
              <Linkedin />
            </Link>
          </div>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Navigation</h4>
          <ul className="space-y-2 text-sm ">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm ">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              +234 812 345 6789
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              support@nestora.ng
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              22 Ikoyi Crescent, Lagos, Nigeria
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-500 py-6 border-t border-zinc-800">
        &copy; {new Date().getFullYear()} Nestora. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
