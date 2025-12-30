import React from "react";
import { MainContainer } from "./styles/home.styles";

import QuickSearch from "./components/QuickSearch";
import SuggestedFolders from "./components/SuggestedFolders";
import RecentFiles from "./components/RecentFiles";

interface HomeProps {
  // Add props as needed
}

const Home: React.FC<HomeProps> = () => {
  return (
    <MainContainer>
      <QuickSearch />
      {/* TODO: hide suggested folders unless we have some folders to suggest */}
      <SuggestedFolders />
      <RecentFiles />
    </MainContainer>
  );
};

export default Home;
