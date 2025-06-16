"use client";

import Image from "next/image";
import React from "react";
import CTAImage from "../../../../public/featured-image5.jpg";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
const CtaSection = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.8 }}
      variants={AnimationContainerVariants}
      className="relative py-12 prata-regular"
    >
      <Image
        src={CTAImage}
        alt="CTA Image"
        fill
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/50"></div>
      <motion.div
        variants={AnimationItemVariants}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative max-w-4xl xl:max-w-6xl mx-auto px-6 sm:px-4 lg:px-12 py-8"
      >
        <div className="flex flex-col space-y-4 justify-center items-center capitalise">
          <h2 className="text-2xl font-bold text-white">
            Find your dream rental property
          </h2>
          <p className="text-slate-400 text-center">
            Discover a wide range of rental properties in your desired location
          </p>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Search
            </Button>
            <Link href={"/register"}>
              <Button variant="outline">Register</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CtaSection;
