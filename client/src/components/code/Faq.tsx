"use client";

import { landlordFaq, tenantFaq } from "@/constants/faq";
import { useAppSelector } from "@/state/redux";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const Faq = () => {
  // user from redux
  const user = useAppSelector((state) => state.user.user);
  // user role
  const title = user?.role === "TENANT" ? "Tenant" : "Landlord";

  const content = user?.role === "TENANT" ? tenantFaq : landlordFaq;
  console.log("content:", content);

  return (
    <section className="py-20">
      <h2 className="text-3xl font-semibold mb-8 text-center prata-regular">
        {title} Frequently Asked Questions
      </h2>

      <Accordion
        type="single"
        collapsible
        className="w-full max-w-2xl mx-auto "
      >
        {content.map((faq, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="text-left text-lg prata-regular">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground nunito">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
export default Faq;
