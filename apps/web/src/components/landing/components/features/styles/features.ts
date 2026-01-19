import styled from "styled-components";

export const FeaturesContainer = styled.div`
    width: 70%;
    height: 700px;
    margin: auto;
    margin-top: 7%;
`;
export const ImgNDescCont = styled.div`
    width: 100%;
    height: 500px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 3%;

`;
export const Item = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;
export const ImgCont = styled.div`
    display: flex;
    justify-content: center;
`;
export const Title = styled.div`
    width: max-content;
    font-family : 'Inter', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 27.5px;
    letter-spacing: -0.5px;
    color: #2E3038;
`;
export const Desc = styled.div`
    font-family : 'Inter', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 27.5px;
    letter-spacing: -0.5px;
    color: #5E616E;
    display: flex;
    justify-content: center;
`;
export const TextCont = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-left: -1%;
`;
export const Wrap = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    gap: 1ch;
`;