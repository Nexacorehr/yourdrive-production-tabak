import styled from 'styled-components';

export const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #DDE2EE 0%, #ffffff 50%);
`;

export const HeroSection = styled.section`
  width: 100%;
  padding: 80px 0px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

export const PageTitle = styled.h1`
  font-size: 56px;
  font-weight: 600;
  color: #2E3038;
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

export const EffectiveDate = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
`;

export const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 0px 100px;
`;

export const IntroSection = styled.section`
  margin-bottom: 56px;
  padding-bottom: 32px;
  border-bottom: 2px solid #DDE2EE;
`;

export const MainSection = styled.section`
  margin-bottom: 56px;
`;

export const SectionTitle = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: #2E3038;
  margin: 0 0 24px 0;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

export const SubsectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #2E3038;
  margin: 32px 0 16px 0;
`;

export const Paragraph = styled.p`
  font-size: 16px;
  line-height: 1.75;
  color: #4b5563;
  margin: 0 0 20px 0;
  text-align: justify;
`;

export const BulletList = styled.ul`
  margin: 20px 0;
  padding-left: 24px;
`;

export const BulletItem = styled.li`
  font-size: 16px;
  line-height: 1.7;
  color: #4b5563;
  margin-bottom: 12px;

  &::marker {
    color: #1F9AFE;
  }
`;

export const HighlightBox = styled.div`
  background: #e0f2fe;
  border-left: 4px solid #1F9AFE;
  padding: 24px 28px;
  margin: 48px 0;
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.6;
  color: #2E3038;

  strong {
    color: #1F9AFE;
    font-weight: 600;
  }
`;