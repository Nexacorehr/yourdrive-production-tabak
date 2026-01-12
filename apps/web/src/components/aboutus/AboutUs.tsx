import React from "react";
import { GlobalReset } from "../landing/styles/landing";
import Navbar_main from "../shared/navbar_main/Navbar_main";
import Footer from "../shared/footer/Footer";
import { HeroContGrad } from "../landing/components/hero/styles/hero";
import Heading from "./components/heading/Heading";
import Reason from "./components/reason/Reason";

const AboutUs: React.FC = () => {
  return (
    <>
    <GlobalReset />
    <Navbar_main/>
    <Heading />
    <Reason></Reason>
    <HeroContGrad style={{transform: "rotate(180deg)"}} />
    <Footer/>
    </>
  );
};

export default AboutUs;
