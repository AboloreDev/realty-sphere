import React from "react";
import Hero from "./Hero";
import FeaturedSection from "./FeaturedSection";
import Container from "@/components/code/Container";
import WhySection from "./WhySection";

const page = () => {
  return (
    <div>
      <Hero />
      <Container>
        <FeaturedSection />
        <WhySection />
      </Container>
    </div>
  );
};

export default page;
