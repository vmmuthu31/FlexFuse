import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Dashboard() {
  return (
    <div className="bg-[#E8E8E8] flex flex-col justify-between min-h-screen">
      <Navbar />
      <Footer />
    </div>
  );
}

export default Dashboard;
