import styled from 'styled-components';

export const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #DDE2EE 0%, #ffffff 50%);
`;

export const HeroSection = styled.section`
  width: 100%;
  padding: 80px 20px 60px;
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
  padding: 40px 20px 100px;
`;

export const WarningBox = styled.div`
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 24px 28px;
  margin-bottom: 48px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #92400e;
  font-weight: 500;
`;

export const ArticleSection = styled.section`
  margin-bottom: 56px;
`;

export const ArticleTitle = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: #2E3038;
  margin: 0 0 32px 0;
  letter-spacing: -0.01em;
  padding-bottom: 16px;
  border-bottom: 2px solid #DDE2EE;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

export const SubsectionTitle = styled.h3`
  font-size: 18px;
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

export const DefinitionList = styled.div`
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const DefinitionTerm = styled.dt`
  font-size: 16px;
  font-weight: 600;
  color: #1F9AFE;
  margin: 0 0 8px 0;
`;

export const DefinitionDescription = styled.dd`
  font-size: 16px;
  line-height: 1.7;
  color: #4b5563;
  margin: 0 0 0 20px;
  text-align: justify;
`;

export const LastUpdated = styled.div`
  background: #f3f4f6;
  padding: 32px;
  border-radius: 12px;
  margin-top: 64px;
  text-align: center;
  font-size: 14px;
  line-height: 1.6;
  color: #2E3038;
  font-weight: 500;
`;