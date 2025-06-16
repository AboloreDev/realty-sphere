import React from "react";
import Hero from "./Hero";
import FeaturedSection from "./FeaturedSection";
import Container from "@/components/code/Container";
import WhySection from "./WhySection";
import CtaSection from "./CtaSection";

const page = () => {
  return (
    <div>
      <Hero />
      <Container>
        <FeaturedSection />
        <WhySection />
      </Container>
      <CtaSection />
    </div>
  );
};

export default page;
