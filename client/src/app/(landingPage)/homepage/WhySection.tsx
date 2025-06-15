"use client";

import React from "react";
import { motion } from "framer-motion";
import WhySectionCard from "@/components/code/WhySectionCard";
import { House, MapPinHouse, TowerControl, HouseWifi } from "lucide-react";
// Defining animation variants
const AnimationContainerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      staggerChildren: 0.2,
    },
  },
};

const AnimationItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const WhySection = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.8 }}
      variants={AnimationContainerVariants}
      className="py-12 sm:px-6 md:px-8 nunito"
    >
      <motion.h1
        variants={AnimationItemVariants}
        className="text-3xl font-bold text-center mb-2 w-full mx-auto prata-regular"
      >
        Why Choose Us
      </motion.h1>

      <motion.h6
        variants={AnimationItemVariants}
        className="text-sm text-center mb-12 w-full max-w-lg mx-auto  text-slate-600"
      >
        We combine cutting-edge technology with real-world expertise to help you
        buy, rent, or list with total confidence. Whether you're a first-time
        renter or a seasoned investor, our team is here to guide you every step
        of the way.
      </motion.h6>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 px-6 py-3 gap-6 lg:gap-10">
        {[0, 1, 2, 3].map((index) => (
          <motion.div key={index} variants={AnimationItemVariants}>
            <WhySectionCard
              Icon={[House, MapPinHouse, HouseWifi, TowerControl][index]}
              title={
                [
                  "Trusted by Thousands",
                  "Wide Range of Properties",
                  "Financing Made Easy",
                  "Serene Neighbourhood",
                ][index]
              }
              description={
                [
                  "Join a growing community of satisfied buyers, sellers, and renters who rely on us.",
                  "From cozy apartments to luxury villas, find a home that fits your lifestyle and budget.",
                  "Simplified mortgage options and expert guidance to help you own your dream home faster.",
                  "Our listings are located in peaceful, well-connected areas perfect for families and professionals.",
                ][index]
              }
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WhySection;
