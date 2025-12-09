import { type ReactNode } from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

interface PageTransitionProps {
  children: ReactNode;
}

const Wrapper = styled(motion.div)`
  width: 100%;
  height: 100%;
`;

const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <Wrapper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </Wrapper>
  );
};

export default PageTransition;
