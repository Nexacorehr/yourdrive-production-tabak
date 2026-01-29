import styled from 'styled-components';

export const FeaturesSection = styled.section`
  width: 100%;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const FeaturesContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SectionHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 60px;
`;

export const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 12px;
`;

export const SectionTitle = styled.h2`
  font-size: 44px;
  font-weight: 600;
  color: #2E3038;
  text-align: center;
  margin: 0 0 16px 0;
  letter-spacing: -0.01em;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

export const SectionDescription = styled.p`
  font-size: 17px;
  color: #6b7280;
  text-align: center;
  line-height: 1.6;
  margin: 0 auto;
  max-width: 700px;
  width: 100%;
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  width: 100%;
  margin-bottom: 80px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

export const FeatureCard = styled.div`
  background: linear-gradient(180deg, #98D1FF 0%, #C9E7FF 100%);
  border-radius: 20px;
  padding: 32px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.04);
  }
`;

export const FeatureImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 220px;
  background: #ffffff;
  border-radius: 16px;
  margin-bottom: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #f3f4f6;
`;

export const FeatureImage = styled.img`
  max-width: 85%;
  max-height: 85%;
  object-fit: contain;
`;

export const FeatureBadge = styled.span`
  position: absolute;
  top: 14px;
  left: 14px;
  background: #fef08a;
  color: #854d0e;
  font-size: 10px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 6px;
  letter-spacing: 0.5px;
`;

export const FeatureTitle = styled.h3`
  font-size: 19px;
  font-weight: 600;
  color: #2E3038;
  margin: 0 0 10px 0;
  text-align: center;
  width: 100%;
`;

export const FeatureDescription = styled.p`
  font-size: 15px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  text-align: center;
  width: 100%;
`;

export const SupportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  padding-top: 40px;
  border-top: 1px solid #DDE2EE;
  width: 100%;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

export const SupportItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

export const SupportIcon = styled.div`
  font-size: 28px;
  margin-bottom: 10px;
`;

export const SupportTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #2E3038;
  margin: 0 0 6px 0;
  text-align: center;
`;

export const SupportDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  text-align: center;
`;