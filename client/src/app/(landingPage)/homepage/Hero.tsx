"use client";

import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/button";
import heroImage from "../../../../public/singlelisting-2.jpg";
import avatar1 from "../../../../public/avatar1.jpg";
import avatar2 from "../../../../public/avatar2.jpg";
import avatar3 from "../../../../public/avatar3.jpg";
import { ArrowUpRight } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { useAppDispatch } from "@/state/redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setFilters } from "@/state/slice/globalSlice";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const Hero = () => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleLocationSearch = async () => {
    try {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          trimmedQuery
        )}`
      );

      const data = await response.json();

      if (data.length === 0) {
        toast.error("No places found.");
        return;
      }
      const { lat, lon } = data[0];

      dispatch(
        setFilters({
          location: trimmedQuery,
          coordinates: [parseFloat(lat), parseFloat(lon)],
        })
      );

      const params = new URLSearchParams({
        location: trimmedQuery,
        latitude: lat.toString(),
        longitude: lon.toString(),
      });

      router.push(`/search?${params.toString()}`);
      toast.success("Location found");
    } catch (error: any) {
      toast.error("No Places found:", error);
    }
  };
  return (
    <motion.section
      className="relative w-full h-screen overflow-hidden prata-regular"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ duration: 1.2 }}
    >
      {/* Background Image */}
      <Image
        src={"/singlelisting-2.jpg"}
        alt="Modern lake house with forest and mountains"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col justify-center items-start h-full max-w-7xl mx-auto px-6 space-y-4">
        <motion.h1
          className="text-white text-4xl sm:text-5xl md:text-6xl font-bold max-w-xl mb-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Where Your Next Chapter Begins
        </motion.h1>

        <motion.p
          className="text-white text-base sm:text-lg max-w-md mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Looking for a home that truly fits your life? Whether you&apos;re
          searching for your first apartment, house, or a luxury villa,
          we&apos;ve got you covered.
        </motion.p>

        <motion.div
          className="flex bg-white text-black w-full md:w-1/2 max-w-xl justify-center items-center  rounded-md border-none"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, town, address"
            className="w-full max-w-xl bg-white h-12"
          />
          <Button
            className="bg-black text-white hover:text-black h-12"
            onClick={handleLocationSearch}
          >
            Search
          </Button>
        </motion.div>

        <motion.div
          className="flex gap-4 flex-wrap"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <Button size="lg">
            Explore Now{" "}
            <span className="bg-white dark:bg-black text-black dark:text-white rounded-full p-1">
              <ArrowUpRight size={14} />
            </span>
          </Button>
        </motion.div>

        <motion.div
          className="absolute bottom-6 right-6 flex items-center gap-2 text-white text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="flex -space-x-2">
            <Image
              src={avatar1}
              alt="avatar1"
              className="w-8 h-8 rounded-full border-2 dark:border-black border-white"
            />
            <Image
              src={avatar2}
              alt="avatar2"
              className="w-8 h-8 rounded-full border-2 dark:border-black border-white"
            />
            <Image
              src={avatar3}
              alt="avatar3"
              className="w-8 h-8 rounded-full border-2 dark:border-black border-white"
            />
          </div>
          <div>
            <strong>15k+</strong> Properties <br /> Enjoy our facilities
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Hero;
