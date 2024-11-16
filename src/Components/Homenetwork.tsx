import { useState } from "react";
import Navbar from "./Navbar";
import { ethers } from "ethers";
import {
  encodeFunctionData,
  Address,
  getContract,
  defineChain,
  createPublicClient,
  http,
} from "viem";
import FlexfuseAbi from "../../public/abis/flexfuse.json";
import { createKintoSDK } from "kinto-web-sdk";

const kintoSDK = createKintoSDK("0x6f0029F082e03ee480684aC5Ef7fF019813ac1C2");

const contractadddress = "0x6f0029F082e03ee480684aC5Ef7fF019813ac1C2";

function Homenetwork() {
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
      console.log("Subscription Details:", details);
      return details;
    } catch (error) {
      console.error("Error fetching subscription details:", error);
    }
  }

  async function createSubscription({
    name,
    description,
    baseAmount,
    token,
  }: {
    name: string;
    description: string;
    baseAmount: number;
    token: string;
  }): Promise<void> {
    const data = encodeFunctionData({
      abi: FlexfuseAbi,
      functionName: "createSubscription",
      args: [name, description, baseAmount, token],
    });

    try {
      const response = await kintoSDK.sendTransaction([
        { to: contractadddress, data, value: BigInt(0) },
      ]);
      console.log("Subscription created:", response);
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  }

  const [response, setResponse] = useState("");
  const [input, setInput] = useState("");
  const [members, setMembers] = useState("");

  const handleFetchSubscriptionDetails = async () => {
    try {
      const details = await fetchSubscriptionDetails();
      setResponse(JSON.stringify(details, null, 2));
    } catch (error) {
      console.error("Error handling fetch subscription details:", error);
      setResponse(`Error: ${error}`);
    }
  };

  const handleCreateSubscription = async () => {
    try {
      const args = {
        name: "DeFi Analytics Pro",
        description:
          "Get real-time analytics for your DeFi investments across chains",
        baseAmount: 1,
        token: "0x010700808D59d2bb92257fCafACfe8e5bFF7aB87",
      };

      console.log("Subscription Args:", args);

      await createSubscription(args);
      setResponse("Subscription created successfully!");
    } catch (error) {
      console.error("Error creating subscription:", error);
      setResponse(`Error: ${error}`);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          FlexFuse Interface
        </h1>

        {/* Input Fields */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter ID or address"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            placeholder="Enter group members (comma-separated)"
            value={members}
            onChange={(e) => setMembers(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={handleFetchSubscriptionDetails}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Fetch Subscription Details
          </button>
          <button
            onClick={handleCreateSubscription}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Create Subscription
          </button>
        </div>

        {/* Response Box */}
        <div className="mt-6 bg-white p-4 shadow-md rounded">
          <h3 className="text-lg font-semibold mb-2">Response:</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
            {response}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default Homenetwork;
