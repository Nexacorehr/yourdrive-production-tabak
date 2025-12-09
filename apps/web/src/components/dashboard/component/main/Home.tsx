import React from "react";
import { MainContainer } from "./styles/home.styles";

import QuickSearch from "./components/QuickSearch";

interface HomeProps {
  // Add props as needed
}

const Home: React.FC<HomeProps> = () => {
  return (
    <MainContainer>
      <QuickSearch />
      {/*<SuggestedFolders />*/}
      {/*<RecentFiles />*/}
    </MainContainer>
  );
};

export default Home;
