"use client";

import React from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Adaeze Nwosu",
    role: "Real Estate Client",
    quote:
      "Working with Realty Sphere was seamless. The team guided me through every step, and I found my dream home in no time.",
  },
  {
    name: "Chinedu Okeke",
    role: "Investor",
    quote:
      "Their listings are top-notch and always up to date. I’ve been able to acquire multiple properties through them with ease.",
  },
  {
    name: "Zainab Lawal",
    role: "First-time Buyer",
    quote:
      "As a first-time buyer, I had so many questions, but the team was patient and professional. I couldn’t have asked for a better experience.",
  },
  {
    name: "Ifeanyi Okafor",
    role: "Property Investor",
    quote:
      "Realty Sphere provided me with high-yield listings I wouldn’t have found elsewhere. Their insight into the market is unmatched.",
  },
  {
    name: "Amaka Eze",
    role: "Tenant",
    quote:
      "I was able to find a perfect apartment within my budget in just a few days. The platform is easy to use and incredibly reliable.",
  },
  {
    name: "Tolu Adebayo",
    role: "Landlord",
    quote:
      "Listing my properties on Realty Sphere was smooth and fast. I got multiple qualified leads in no time. Highly recommended!",
  },
];

const Testimonials = () => {
  return (
    <section className=" py-12 mt-12 px-4 sm:px-6 md:px-8 space-y-4 prata-regular">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-semibold mb-10">Testimonials</h2>

        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={1}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index} className="mb-12">
              <blockquote className="italic text-lg leading-relaxed">
                <p className="mb-3">“{testimonial.quote}”</p>
                <footer className="text-sm text-gray-400">
                  — {testimonial.name}, {testimonial.role}
                </footer>
              </blockquote>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonials;
