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
import { useSelector } from "react-redux";
import { FLARE_CONTRACT_ADDRESS_SENDER, HEDERA_CONTRACT_ADDRESS_SENDER, SEPOLIA_CONTRACT_ADDRESS_SENDER } from "../constants";
import { GETSUBSCRIPTION } from "contracts/Integration";
import { FaAngleLeft } from "react-icons/fa6";

const contractadddress = "0x6f0029F082e03ee480684aC5Ef7fF019813ac1C2";

function Subscriptions() {
  const [subscriptionDetails, setSubscriptionDetails] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const network = useSelector((state: any) => state?.network?.network);
  const ethcontractaddress = 
  network === 'eth' 
    ? SEPOLIA_CONTRACT_ADDRESS_SENDER 
    : network === 'hedera' 
      ? HEDERA_CONTRACT_ADDRESS_SENDER 
      : FLARE_CONTRACT_ADDRESS_SENDER;
  const itemsPerPage = 4;

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

    const contract = getContract({
      address: contractadddress as Address,
      abi: FlexfuseAbi,
      client: { public: client },
    });

    try {
      const details = await contract.read.getAllSubscriptions();
      setSubscriptionDetails((details as any[]).reverse());
    } catch (error) {
      console.error("Error fetching subscription details:", error);
    }
  }

  const fetchSubscriptionDetailsEth = async () => {
    try {
      console.log("contract", ethcontractaddress);
      
      const result = await GETSUBSCRIPTION(ethcontractaddress);
      setSubscriptionDetails([...result]?.reverse());
      console.log("result", result);
    } catch (error) {
      console.log("error", error);
    }
  }

  useEffect(() => {
    if(network === "kinto") {
      fetchSubscriptionDetails();
    } else {
      fetchSubscriptionDetailsEth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  const filteredSubscriptions = subscriptionDetails.filter(
    (subscription) =>
      subscription.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubscriptions = filteredSubscriptions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);

  return (
    <div className="bg-[#E8E8E8] flex flex-col justify-between min-h-screen">
    <Navbar />
    <main className="flex-grow pb-20">
      <div className="text-center">
        {/* Header with Back Link and Title */}
        <div className="flex justify-between pl-20">
          <Link
            to="/Dashboard"
            className="flex gap-2 items-center text-black font-dmsans text-lg"
          >
            <FaAngleLeft />
            <span>Back</span>
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

        {/* Search and Filter Section */}
        <div className="flex gap-3 items-center justify-center mt-5">
          <div className="relative w-full max-w-md">
            <IoSearchSharp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for subscriptions..."
              className="w-full p-2 pl-10 pr-32 border rounded-l-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-0 top-0 bottom-0 bg-black text-white px-4 rounded-r-md hover:bg-blue-600">
              Search
            </button>
          </div>
          <div>
            <FiFilter className="text-black bg-[#F8F8F8] text-4xl rounded-lg p-2" />
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="mt-5 max-w-3xl mx-auto">
          {paginatedSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {paginatedSubscriptions.map((subscription, index) => (
                <div
                  key={index}
                  className="p-4 py-6 bg-[#262626] text-white shadow-md rounded-md"
                >
                  <div className="flex flex-col font-albertsans justify-between h-full">
                    <div>
                      <h3 className="font-bold text-3xl">{subscription.name}</h3>
                      <p className="text-white text-opacity-[60%]">
                        {subscription.description}
                      </p>

                      {/* Network-specific Details */}
                      {network === "eth" && (
                        <div className="flex gap-1 items-center">
                          <p>
                            {BigInt(subscription.baseAmount).toString()} USDC/Month
                          </p>
                          <img src="/coins.svg" alt="Coins" />
                        </div>
                      )}
                      {network === "kinto" && (
                        <div className="flex flex-col items-center gap-3 mt-3">
                          <p className="text-center text-[18px]">
                            {ethers.utils.formatEther(subscription.baseAmount)}{" "}
                            Kinto/Month
                          </p>
                          <img
                            src="/coins.svg"
                            className="w-24"
                            alt="Coins"
                          />
                        </div>
                      )}
                    </div>

                    {/* Learn More Button */}
                    <Link
                      to={`/Subscriptions/Subscription?id=${subscription.id}`}
                    >
                      <button className="bg-white w-full text-black mt-3 py-2 px-4 rounded">
                        Learn More
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No subscriptions found.
            </p>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-5">
          <button
            className="px-3 py-1 mx-1 bg-gray-300 hover:bg-gray-400 rounded"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`px-3 py-1 mx-1 ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 hover:bg-gray-400"
              } rounded`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 mx-1 bg-gray-300 hover:bg-gray-400 rounded"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </main>
    <Footer />
  </div>

  );
}

export default Subscriptions;
