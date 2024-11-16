import React from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

function CreateExpenses() {
  return (
    <div className="bg-[#E8E8E8] flex flex-col justify-between min-h-screen">
      <Navbar />
      <main className="flex-grow "></main>
      <Footer />
    </div>
  );
}

export default CreateExpenses;
