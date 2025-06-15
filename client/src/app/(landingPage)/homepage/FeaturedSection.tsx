"use client";

import React from "react";
import { motion } from "framer-motion";
import FeaturedCard from "@/components/code/FeaturedCard";

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

const FeaturedSection = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={AnimationContainerVariants}
      className="py-12 sm:px-6 md:px-8 nunito"
    >
      <motion.h2
        variants={AnimationItemVariants}
        className="text-3xl font-bold text-center mb-12 w-full mx-auto prata-regular"
      >
        Explore top-rated homes selected by our team
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-100 dark:bg-slate-950 px-4 py-2 gap-6 lg:gap-10">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <motion.div key={index} variants={AnimationItemVariants}>
            <FeaturedCard
              imageSrc={`/featured-image${6 - index}.jpg`}
              title={
                [
                  "Where Stories Begin",
                  "Living, Elevated",
                  "The Art of Living Well",
                  "Home, Redefined",
                  "Spaces That Inspire",
                  "Curated for the Journey Ahead",
                ][index]
              }
              description={
                [
                  "These homes aren’t just places they’re the starting point for new chapters, new memories, and new lives.",
                  "Explore properties that redefine comfort and aspiration thoughtfully chosen to elevate your everyday.",
                  "Handpicked listings designed to match where you are, and where you’re going.",
                  "Every featured home offers more than walls and a roof they invite possibility, creativity, and calm.",
                  "This collection reflects not just lifestyle, but intention homes crafted for meaning and presence.",
                  "Explore a new vision of what ‘home’ can be modern, soulful, and entirely yours.",
                ][index]
              }
              linkText={
                [
                  "Discover",
                  "Explore",
                  "Search",
                  "Invest",
                  "Connect",
                  "Move In",
                ][index]
              }
              linkHref={
                [
                  "/discover",
                  "/explore",
                  "/search",
                  "/invest",
                  "/connect",
                  "/move-in",
                ][index]
              }
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FeaturedSection;
