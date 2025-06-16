"use client";

import React from "react";
import { motion } from "framer-motion";
import FeaturedCard from "@/components/code/FeaturedCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { House } from "lucide-react";

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
      <Swiper
        modules={[Pagination, Autoplay]}
        slidesPerView={1}
        spaceBetween={24}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        breakpoints={{
          450: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="w-full"
      >
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <SwiperSlide key={index} className="mb-12">
            <FeaturedCard
              imageSrc={`/featured-image${6 - index}.jpg`}
              isFeatured={true}
              isForRent={true}
              title={
                [
                  "Luxury Family Home",
                  "Selway Apartments",
                  "Arlo Apartment",
                  "Gorgeous Villa Bay",
                  "Modern Loft Studio",
                  "Elegant Penthouse",
                ][index]
              }
              address={
                [
                  "1975 York Ave, NY",
                  "35-40 11th St, Queens, NY",
                  "58-64 E 71st St, NY",
                  "41 E 65th St, NY",
                  "22 W 21st St, NY",
                  "99 Park Ave, NY",
                ][index]
              }
              Icon={[House, House, House, House, House, House][index]}
              beds={[2, 3, 2, 4][index]}
              baths={[1, 2, 2, 3][index]}
              garages={[1, 1, 1, 2][index]}
              area={[300, 400, 250, 600][index]}
              price={["$750/mo", "$1150/mo", "$650/mo", "$2000/mo"][index]}
              agentImage={`/featured-image${6 - index}.jpg`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
};

export default FeaturedSection;
