import React from "react";

interface HomeProps {
  // Add props as needed
}

const Home: React.FC<HomeProps> = () => {
  return (
    <div className="your-files">
      <h2>Home</h2>
      <p>Files will be displayed here</p>
    </div>
  );
};

export default Home;
