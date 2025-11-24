import FilesIcon from "../../../shared/icons/files";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
  MainContainer,
} from "../../styles/main";

const Main = () => {
  const hasFiles = false; // will later on check if user has uploaded any files with their account

  if (!hasFiles) {
    return (
      <MainContainer>
        <EmptyState>
          <FilesIcon color="#363840" height="40px" width="40px" />
          <EmptyStateTitle>No files uploaded yet</EmptyStateTitle>
          <EmptyStateDescription>
            Start by uploading files here.
          </EmptyStateDescription>
        </EmptyState>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <h1>Your Files</h1>
    </MainContainer>
  );
};

export default Main;
