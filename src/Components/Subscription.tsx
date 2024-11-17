import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import {
  Address,
  getContract,
  defineChain,
  createPublicClient,
  http,
  encodeFunctionData,
} from "viem";
import FlexfuseAbi from "../../public/abis/flexfuse.json";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { useSearchParams } from "react-router-dom";
import { FaAngleLeft } from "react-icons/fa6";
import { toast } from "react-toastify";
import { createKintoSDK } from "kinto-web-sdk";
import { useSelector } from "react-redux";
import { CCIPSEND, GETSUBSCRIPTIONID, SUBSCRIBE } from "contracts/Integration";
import { SEPOLIA_CONTRACT_ADDRESS_SENDER } from "../constants";
import { useAccount } from "wagmi";

const kintoSDK = createKintoSDK("0x6f0029F082e03ee480684aC5Ef7fF019813ac1C2");

const contractadddress = "0x6f0029F082e03ee480684aC5Ef7fF019813ac1C2";
const ethcontractaddress = SEPOLIA_CONTRACT_ADDRESS_SENDER;
const Subscription = () => {
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>();
  const [subscribesuccess, setSubscribeSuccess] = useState(false);
  const network = useSelector((state: any) => state?.network?.network);
  const [amount, setAmount] = useState("100");

  const [searchParams] = useSearchParams();
  const account = useAccount();
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
  const [model, setModel] = useState(false);
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
      console.log("result of kinto", details);
    } catch (error) {
      console.error("Error fetching subscription details:", error);
    }
  }

  async function createSubscription() {
    const id = searchParams.get("id");
    const data = encodeFunctionData({
      abi: FlexfuseAbi,
      functionName: "selectSubscription",
      args: [id, 0],
    });
    try {
      const response = await kintoSDK.sendTransaction([
        { to: contractadddress, data, value: BigInt(0) },
      ]);
      console.log("Subscription created:", response);
      toast.success(
        `Subscription Activated Successfully check the tx hash https://explorer.kinto.xyz/tx/${response}`
      );
      setSubscribeSuccess(true);
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  }

  const fetchSubscriptionIdDetailEth = async () => {
    try {
      const id = searchParams.get("id");
      const result = await GETSUBSCRIPTIONID(ethcontractaddress, id);
      setSubscriptionDetails(result);
      console.log("result sub id", result);
    } catch (error) {
      console.log("error", error);
    }
  };

  const createSubscriptionEth = async () => {
    try {
      const id = searchParams.get("id");
      const result = await SUBSCRIBE(ethcontractaddress, id);
      console.log("Subscription created:", result);
      toast.success("Subscription Activated Successfully");
      setSubscribeSuccess(true);
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  };

  const handlePayment = async (paymentMethod: any) => {
    if (paymentMethod === "native") {
      console.log("Paying with Native Tokens...");

      createSubscriptionEth();
      // Add logic for Native Tokens payment
    } else if (paymentMethod === "usdc") {
      console.log("Paying with USDC...");

      const result = await CCIPSEND(
        "0xc5Ff1aBaBca988e7e934F4cF966e0dd8607D4A46",
        account?.address,
        amount
      );
      console.log("result of ccip", result);
      toast.success("Subscription Activated Successfully");
      setSubscribeSuccess(true);
      // Add logic for USDC payment
    }
    setModel(false); // Close the modal after selection
  };

  useEffect(() => {
    if (network === "kinto") {
      fetchSubscriptionDetails();
    } else {
      fetchSubscriptionIdDetailEth();
    }
    // eslint-disable-next-line
  }, [network]);

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

        {network === "kinto" && (
          <div className="mt-10">
            {subscriptionDetails && (
              <div className="flex pl-20 text-left ">
                <div>
                  <h3 className="font-bold text-3xl text-[#262626]">
                    {subscriptionDetails[0]}
                  </h3>
                  <p className="text-gray-600">{subscriptionDetails[1]}</p>

                  <p className="text-2xl pt-3 font-albertsans font-medium text-[#262626]">
                    {ethers.utils.formatEther(subscriptionDetails[3])}{" "}
                    Kinto/Month
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
                  <button
                    onClick={createSubscription}
                    disabled={subscribesuccess}
                    className="px-7 py-3 bg-black text-white rounded-lg mt-5"
                  >
                    {subscribesuccess ? "Subscribed" : "Subscribe"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {network === "eth" && (
          <div className="mt-10">
            {subscriptionDetails && (
              <div className="flex pl-20 text-left ">
                <div>
                  <h3 className="font-bold text-3xl text-[#262626]">
                    {subscriptionDetails[0]}
                  </h3>
                  <p className="text-gray-600">{subscriptionDetails[1]}</p>

                  <p className="text-2xl pt-3 font-albertsans font-medium text-[#262626]">
                    {BigInt(subscriptionDetails[3]).toString()} USDC/Month
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
                  <button
                    onClick={() => setModel(true)}
                    disabled={subscribesuccess}
                    className="px-7 py-3 bg-black text-white rounded-lg mt-5"
                  >
                    {subscribesuccess ? "Subscribed" : "Subscribe"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {model && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
              <h2 className="text-xl font-bold text-center mb-4">
                Payment Options
              </h2>
              <div className="space-y-4">
                <button
                  onClick={() => handlePayment("native")}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                >
                  Pay with Native Tokens
                </button>
                <button
                  onClick={() => handlePayment("usdc")}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
                >
                  Pay with USDC
                </button>
              </div>
              <button
                onClick={() => setModel(false)}
                className="mt-4 w-full px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {network === "flare" && (
          <div className="mt-10">
            {subscriptionDetails && (
              <div className="flex pl-20 text-left ">
                <div>
                  <h3 className="font-bold text-3xl text-[#262626]">
                    {subscriptionDetails[0]}
                  </h3>
                  <p className="text-gray-600">{subscriptionDetails[1]}</p>

                  <p className="text-2xl pt-3 font-albertsans font-medium text-[#262626]">
                    {BigInt(subscriptionDetails[3]).toString()} USDC/Month
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
                  <button
                    onClick={createSubscriptionEth}
                    disabled={subscribesuccess}
                    className="px-7 py-3 bg-black text-white rounded-lg mt-5"
                  >
                    {subscribesuccess ? "Subscribed" : "Subscribe"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Subscription;
