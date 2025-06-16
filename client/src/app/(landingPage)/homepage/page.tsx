import React from "react";
import Hero from "./Hero";
import FeaturedSection from "./FeaturedSection";
import Container from "@/components/code/Container";
import WhySection from "./WhySection";
import CtaSection from "./CtaSection";
import Testimonials from "./Testimonials";

const Homepage = () => {
  return (
    <div>
      <Hero />
      <Container>
        <FeaturedSection />
        <WhySection />
      </Container>
      <CtaSection />
      <Testimonials />
    </div>
  );
};

export default Homepage;
