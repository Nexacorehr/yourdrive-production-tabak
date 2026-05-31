import React from "react";
import styled, { keyframes } from "styled-components";
import { T } from "../../../theme/tokens";

interface TableSkeletonProps {
  rows?: number;
  variant?: "list" | "grid";
}

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const SkeletonBlock = styled.div<{ $width?: string; $height?: string; $radius?: string }>`
  width: ${({ $width }) => $width ?? "100%"};
  height: ${({ $height }) => $height ?? "14px"};
  border-radius: ${({ $radius }) => $radius ?? T.rSm};
  background: linear-gradient(
    90deg,
    ${T.borderFaint} 0%,
    ${T.bgHover} 50%,
    ${T.borderFaint} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
`;

const ListWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0;
`;

const ListRow = styled.div`
  display: grid;
  grid-template-columns: 36px 1fr 120px 100px;
  gap: 16px;
  align-items: center;
  padding: var(--file-cell-pad, 10px 16px);
  border-bottom: 1px solid ${T.borderFaint};
`;

const GridWrap = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 14px;
  padding: 8px 0;
`;

const GridCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 12px;
  border: 1px solid ${T.borderFaint};
  border-radius: ${T.rLg};
  background: ${T.bgSurface};
`;

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 6,
  variant = "list",
}) => {
  if (variant === "grid") {
    return (
      <GridWrap aria-hidden="true">
        {Array.from({ length: rows }).map((_, i) => (
          <GridCard key={i}>
            <SkeletonBlock $width="48px" $height="48px" $radius={T.rMd} />
            <SkeletonBlock $width="80%" $height="12px" />
            <SkeletonBlock $width="50%" $height="10px" />
          </GridCard>
        ))}
      </GridWrap>
    );
  }

  return (
    <ListWrap aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <ListRow key={i}>
          <SkeletonBlock $width="28px" $height="28px" $radius={T.rSm} />
          <SkeletonBlock $width={`${55 + (i % 3) * 12}%`} />
          <SkeletonBlock $width="80%" />
          <SkeletonBlock $width="70%" />
        </ListRow>
      ))}
    </ListWrap>
  );
};

export default TableSkeleton;
