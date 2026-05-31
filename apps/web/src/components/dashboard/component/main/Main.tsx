import styled from "styled-components";
import { T } from "../../../../theme/tokens";
import { useMatches } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MainProps {
  children?: ReactNode;
}

const Main = ({ children }: MainProps) => {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname || "";

  return (
    <MainContainer data-dashboard-scroll="true">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPath}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1],
          }}
          style={{
            width: "100%",
            minHeight: "100%",
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MainContainer>
  );
};

export default Main;

const MainContainer = styled.main`
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  background: ${T.bgElevated};
  color: ${T.textPrimary};
  border-radius: ${T.rMd};
  padding: clamp(12px, 3vw, 20px) clamp(12px, 3vw, 24px);
  padding-bottom: max(clamp(12px, 3vw, 20px), env(safe-area-inset-bottom, 0px));
  transition:
    background ${T.tBase},
    color ${T.tBase};
  -webkit-overflow-scrolling: touch;
  font-family: ${T.fontUI};
`;
