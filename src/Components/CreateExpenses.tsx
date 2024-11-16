import React from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { FaAngleLeft } from "react-icons/fa6";
import { Link } from "react-router-dom";

function CreateExpenses() {
  return (
    <div className="bg-[#E8E8E8] flex flex-col justify-between min-h-screen">
      <Navbar />
      <main className="flex-grow ">
        <div className="flex  justify-between pl-20">
          <Link
            to="/Dashboard"
            className="flex gap-2 items-center text-black font-dmsans text-lg"
          >
            <FaAngleLeft />
            <span> Back</span>
          </Link>
          <div className="text-center">
            <p className="font-playfair italic font-bold text-3xl mt-5">
              Add New Expense{" "}
            </p>
            <p className="font-dmsans pt-3 text-lg">
              Record a shared expense and split it among group members.{" "}
            </p>
          </div>
          <div></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CreateExpenses;
