import React from "react";
import { HeroContGrad, HeroContainer, HeroContGradTop, GrayHeroText } from "../../../landing/components/hero/styles/hero";
import { InfoText, ButtonCont } from "./styles/heading";
import LandingButton from "../../../shared/landingbutton/LandingButton";

const Heading: React.FC = () => {
  return (
    <>
    <HeroContGradTop /> 
    <HeroContainer style={{display: "flex", flexDirection: "column"}}>
      <GrayHeroText style={{margin: "0", flex: "0", marginTop: "15%"}}>About our Misssion</GrayHeroText>
      <InfoText>Built for the way you work, learn, and create.</InfoText>
      <ButtonCont>
        <LandingButton variant="primary" size="lg" purp="register" width={"44%"}>Get Started</LandingButton>
        <LandingButton variant="ghost" size="lg" purp="howitworks" width={"44%"}>See how it works</LandingButton>
      </ButtonCont>
    </HeroContainer>
    <HeroContGrad />
    </>
  );
};
export default Heading;