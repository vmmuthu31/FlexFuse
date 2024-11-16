import Navbar from "./Navbar";
import Footer from "./Footer";
import { useSelector } from "react-redux";

function Dashboard() {
  const walletAddress = useSelector((state: any) => state?.wallet?.address);

  return (
    <div className="bg-[#E8E8E8] flex flex-col justify-between min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="text-center">
          <p className="font-playfair italic font-bold text-3xl mt-5">
            Welcome Back {walletAddress.slice(0, 5)}...
            {walletAddress.slice(-5)}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
