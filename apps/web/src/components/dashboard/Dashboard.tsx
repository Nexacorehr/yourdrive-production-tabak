import Navbar from "../shared/navbar/Navbar";
import { Container } from "../shared/styles/general";
import Application from "./component/Application";

const Dashboard = () => {
  return (
    <Container>
      <Navbar />
      <Application />
    </Container>
  );
};

export default Dashboard;
