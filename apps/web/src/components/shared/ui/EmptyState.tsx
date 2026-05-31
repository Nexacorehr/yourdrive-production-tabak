import React from "react";
import styled from "styled-components";
import { T } from "../../../theme/tokens";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  compact = false,
}) => (
  <Wrap $compact={compact}>
    <IconRing $compact={compact}>{icon}</IconRing>
    <Title>{title}</Title>
    {description ? <Description>{description}</Description> : null}
    {action ? <ActionRow>{action}</ActionRow> : null}
  </Wrap>
);

const Wrap = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${({ $compact }) => ($compact ? "32px 20px" : "48px 24px")};
  min-height: ${({ $compact }) => ($compact ? "200px" : "280px")};
  gap: 10px;
`;

const IconRing = styled.div<{ $compact?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $compact }) => ($compact ? "64px" : "88px")};
  height: ${({ $compact }) => ($compact ? "64px" : "88px")};
  border-radius: ${T.rFull};
  background: ${T.accentFaint};
  color: ${T.accent};
  margin-bottom: 6px;

  svg {
    width: ${({ $compact }) => ($compact ? "28px" : "40px")};
    height: ${({ $compact }) => ($compact ? "28px" : "40px")};
  }
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: ${T.textPrimary};
  font-family: ${T.fontUI};
`;

const Description = styled.p`
  margin: 0;
  max-width: 36ch;
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${T.textSecondary};
  font-family: ${T.fontUI};
`;

const ActionRow = styled.div`
  margin-top: 8px;
`;

export default EmptyState;
