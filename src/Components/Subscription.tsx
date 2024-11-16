import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { IoSearchSharp } from "react-icons/io5";
import { FiFilter } from "react-icons/fi";
import {
  Address,
  getContract,
  defineChain,
  createPublicClient,
  http,
} from "viem";
import FlexfuseAbi from "../../public/abis/flexfuse.json";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { useSearchParams } from "react-router-dom";
import { FaAngleLeft } from "react-icons/fa6";

const contractadddress = "0x6f0029F082e03ee480684aC5Ef7fF019813ac1C2";

const Subscription = () => {
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>();

  const [searchParams] = useSearchParams();

  const kinto = defineChain({
    id: 7887,
    name: "Kinto",
    network: "kinto",
    nativeCurrency: {
      decimals: 18,
      name: "ETH",
      symbol: "ETH",
    },
    rpcUrls: {
      default: {
        http: ["https://rpc.kinto-rpc.com/"],
        webSocket: ["wss://rpc.kinto.xyz/ws"],
      },
    },
    blockExplorers: {
      default: { name: "Explorer", url: "https://kintoscan.io" },
    },
  });

  async function fetchSubscriptionDetails() {
    const client = createPublicClient({
      chain: kinto,
      transport: http(),
    });

    const id = searchParams.get("id");

    const contract = getContract({
      address: contractadddress as Address,
      abi: FlexfuseAbi,
      client: { public: client },
    });

    try {
      const details = await contract.read.getSubscriptionDetails([id]);
      setSubscriptionDetails(details);
    } catch (error) {
      console.error("Error fetching subscription details:", error);
    }
  }

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  return (
    <div className="bg-[#E8E8E8] flex flex-col justify-between min-h-screen">
      <Navbar />
      <main className="flex-grow pb-20">
        <div className="flex  justify-between pl-20">
          <Link
            to="/Subscriptions"
            className="flex gap-2 items-center text-black font-dmsans text-lg"
          >
            <FaAngleLeft />
            <span> Back</span>
          </Link>
          <div className="text-center">
            <p className="font-playfair italic font-bold text-3xl mt-5">
              Explore New Subscriptions
            </p>
            <p className="font-dmsans pt-3 text-lg">
              Browse services and subscribe to the ones that suit your needs.
            </p>
          </div>
          <div></div>
        </div>

        <div className="mt-10">
          {subscriptionDetails && (
            <div className="flex pl-20 text-left ">
              <div>
                <h3 className="font-bold text-3xl text-[#262626]">
                  {subscriptionDetails[0]}
                </h3>
                <p className="text-gray-600">{subscriptionDetails[1]}</p>

                <p className="text-2xl pt-3 font-albertsans font-medium text-[#262626]">
                  {ethers.utils.formatEther(subscriptionDetails[3])} Kinto/Month
                </p>
                <p className="text-gray-600">
                  Monthly, Annual, or One-Time Payment.
                </p>
                <div className="w-32 text-center pt-3">
                  <p className="bg-[#9CE6BA] border-[#005F26] p-1 text-sm rounded-full border-[1px]">
                    • 7-day free trial
                  </p>
                </div>
                <img src="/coins.svg" alt="Subscription" className="mt-5" />
                <button className="px-7 py-3 bg-black text-white rounded-lg mt-5">
                  Subscribe Now
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Subscription;
