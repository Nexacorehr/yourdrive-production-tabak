import styled from 'styled-components';

export const CardsSection = styled.section`
  width: 100%;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const CardsContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

export const TopSection = styled.div`
  width: 100%;
  margin-bottom: 8px;
`;

export const CreativeCard = styled.div`
  background: linear-gradient(180deg, #7BC3FE 0%, #9AD2FF 100%);
  border-radius: 24px;
  padding: 50px 0px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 40px;
  width: 100%;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 40px 30px;
    gap: 24px;
  }
`;

export const CreativeIcon = styled.div`
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 968px) {
    margin: 0 auto;
  }
`;

export const CreativeTextArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;

  @media (max-width: 968px) {
    align-items: center;
  }
`;

export const CreativeTitle = styled.h2`
  font-size: 38px;
  font-weight: 600;
  color: #2E3038;
  line-height: 1.15;
  margin: 0;
  letter-spacing: -0.01em;
  text-align: left;

  @media (max-width: 968px) {
    font-size: 28px;
    text-align: center;
  }
`;

export const CreativeIllustration = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;

  @media (max-width: 968px) {
    margin: 0 auto;
  }
`;

export const UpdatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  width: 100%;
  margin-bottom: 36px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

interface UpdateCardProps {
  background: string;
}

export const UpdateCard = styled.div<UpdateCardProps>`
  background: ${props => props.background};
  border-radius: 20px;
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  min-height: 180px;

  @media (max-width: 768px) {
    align-items: center;
    text-align: center;
  }
`;

export const UpdateBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #2E3038;
  opacity: 0.8;
  margin-bottom: 16px;
`;

export const UpdateTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #2E3038;
  margin: 0 0 16px 0;
  line-height: 1.25;
  text-align: left;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

export const UpdateLink = styled.a`
  font-size: 14px;
  font-weight: 500;
  color: #2E3038;
  text-decoration: none;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.7;
  }
`;

export const PartnersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px 32px;
  padding-top: 40px;
  border-top: 1px solid #DDE2EE;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

export const PartnerItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  justify-content: center;
`;

export const PartnerIconWrapper = styled.div`
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PartnerTitle = styled.h4`
  font-size: 15px;
  font-weight: 500;
  color: #2E3038;
  margin: 0;
  text-align: left;

  @media (max-width: 768px) {
    text-align: center;
  }
`;  

//