"use client";

import Container from "@/components/code/Container";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

const AboutPage = () => {
  return (
    <Container>
      <section className="py-12 px-4 md:px-8 max-w-6xl mx-auto prata-regular">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 ">About Nestora</h1>
          <p className="text-lg text-slate-4000 max-w-2xl mx-auto">
            We&apos;re committed to connecting people with homes that speak to
            their lifestyle and aspirations. Discover the story behind our
            platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="rounded-lg overflow-hidden shadow"
          >
            <Image
              src="/featured-image3.jpg"
              alt="Team working on real estate platform"
              width={800}
              height={600}
              className="w-full h-96 object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-slate-400 mb-4">
              At Nestora, our mission is simple: to simplify the process of
              finding, renting, or buying a home through a modern and intuitive
              platform.
            </p>
            <p className="text-slate-400 mb-4">
              We blend technology and a human-centered approach to give you
              transparency, speed, and access to curated listings across Nigeria
              and beyond.
            </p>
            <p className="text-slate-400">
              Whether you&apos;re a first-time buyer, an investor, or just
              exploring, Nestora is your trusted companion on every step of the
              journey.
            </p>
          </motion.div>
        </div>
      </section>
    </Container>
  );
};

export default AboutPage;
