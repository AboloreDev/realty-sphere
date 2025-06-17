"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "What does an architect/interior designer do?",
    answer:
      "They plan, design, and oversee the construction or renovation of spaces, ensuring both aesthetics and functionality.",
  },
  {
    question:
      "Do you offer both architectural design and interior design services?",
    answer:
      "Yes, we offer comprehensive services including both architectural and interior design.",
  },
  {
    question: "Do you offer customized design solutions?",
    answer:
      "Absolutely. Every project is tailored to meet our client’s unique needs and style preferences.",
  },
  {
    question: "Do you work on both residential and commercial projects?",
    answer:
      "Yes, our portfolio includes both residential and commercial properties across various scales.",
  },
  {
    question: "How do you manage construction or renovation projects?",
    answer:
      "We follow a structured project management approach with timelines, quality checks, and regular client updates.",
  },
  {
    question: "Can I make changes to the design after the project has started?",
    answer:
      "We welcome your feedback and can accommodate changes within agreed timelines and budgets.",
  },
];

const ContactPage = () => {
  return (
    <div className="prata-regular">
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <Image
          src="/featured-image1.jpg"
          alt="Modern building facade"
          fill
          className="object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold">Contact Us</h1>
          <p className="text-sm md:text-base mt-2">
            Crafting Spaces That Inspire
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xl font-semibold mb-2">Get In Touch</h2>
          <h3 className="text-3xl font-bold mb-4">How We Can Help You?</h3>
          <p className="text-gray-500 mb-6">
            Whether you have a question about services, pricing, or anything
            else, our team is ready to answer all your questions.
          </p>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-black dark:text-white" />
              22 Ikoyi Crescent, Lagos, Nigeria
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5  text-black dark:text-white" />
              +234 812 345 6789
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5  text-black dark:text-white" />
              support@nestora.ng
            </li>
          </ul>
        </motion.div>

        {/* Contact Form */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-100 dark:bg-zinc-800 p-6 rounded-lg shadow-lg space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="p-3 rounded border text-sm w-full"
            />
            <input
              type="text"
              placeholder="Last Name"
              className="p-3 rounded border text-sm w-full"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="email"
              placeholder="Email"
              className="p-3 rounded border text-sm w-full"
            />
            <input
              type="tel"
              placeholder="Phone"
              className="p-3 rounded border-accent text-sm w-full"
            />
          </div>
          <textarea
            placeholder="Message"
            className="w-full p-3 rounded text-sm border not-odd:min-h-[120px]"
          ></textarea>
          <Button
            variant="outline"
            type="submit"
            className=" px-6 py-3 rounded  transition"
          >
            Submit
          </Button>
        </motion.form>
      </section>

      {/* FAQ Section */}
      <section className="bg-zinc-100 dark:bg-zinc-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-xl font-medium uppercase mb-2">FAQ</h2>
          <h4 className="text-lg font-bold">Frequently Asked Questions</h4>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            We&apos;re here to help. Find answers to common questions below.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible>
            {faqs.map((item, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger className="text-left text-sm md:text-base font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-600 dark:text-gray-300">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
