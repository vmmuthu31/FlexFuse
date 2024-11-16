import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { FaAngleLeft } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import {
  encodeFunctionData,
  defineChain,
  createPublicClient,
  http,
  getContract,
  Address,
} from "viem";
import FlexfuseAbi from "../../public/abis/flexfuse.json";
import { createKintoSDK } from "kinto-web-sdk";
import { toast } from "react-toastify";

const kintoSDK = createKintoSDK("0x6f0029F082e03ee480684aC5Ef7fF019813ac1C2");

const CONTRACT_ADDRESS = "0x6f0029F082e03ee480684aC5Ef7fF019813ac1C2";
const KINTO_CHAIN = defineChain({
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

function CreateExpenses() {
  const Navigate = useNavigate();
  const [groupExpenses, setGroupExpenses] = useState<
    [bigint[], string[], bigint[], boolean[]]
  >([[], [], [], []]);
  const [groupId, setGroupId] = useState<number | "">(1);
  const [amount, setAmount] = useState<number | "">("");

  async function createExpenses({
    groupId,
    amount,
  }: {
    groupId: number;
    amount: number;
  }): Promise<void> {
    const token = "0x010700808D59d2bb92257fCafACfe8e5bFF7aB87";
    const data = encodeFunctionData({
      abi: FlexfuseAbi,
      functionName: "addExpense",
      args: [groupId, amount, token],
    });

    try {
      const response = await kintoSDK.sendTransaction([
        { to: CONTRACT_ADDRESS, data, value: BigInt(0) },
      ]);
      console.log("Expenses created:", response);
      toast.success("Expenses created successfully!");
      Navigate("/Dashboard");
    } catch (error) {
      console.error("Error creating expenses:", error);
      toast.error(
        "Error creating expenses. Check the console for more details."
      );
    }
  }

  const fetchGroupExpenses = async () => {
    try {
      const client = createPublicClient({
        chain: KINTO_CHAIN,
        transport: http(),
      });

      const contract = getContract({
        address: CONTRACT_ADDRESS as Address,
        abi: FlexfuseAbi,
        client: { public: client },
      });

      const groups = (await contract.read.getAllGroups()) as [
        bigint[],
        string[],
        bigint[],
        boolean[]
      ];
      setGroupExpenses(groups as [bigint[], string[], bigint[], boolean[]]);

      if (groups[0] && groups[0].length > 0) {
        setGroupId(Number(groups[0][0]));
      }
    } catch (error) {
      console.error("Error fetching group expenses:", error);
    }
  };

  useEffect(() => {
    fetchGroupExpenses();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (groupId === "" || amount === "") {
      toast.warning("Please fill in both Group ID and Amount.");
      return;
    }

    createExpenses({ groupId: Number(groupId), amount: Number(amount) });
  };

  return (
    <div className="bg-[#E8E8E8] flex flex-col justify-between min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="flex justify-between pl-20">
          <Link
            to="/Dashboard"
            className="flex gap-2 items-center text-black font-dmsans text-lg"
          >
            <FaAngleLeft />
            <span> Back</span>
          </Link>
          <div className="-ml-20 text-center">
            <p className="font-playfair italic font-bold text-3xl mt-5">
              Add New Expense{" "}
            </p>
            <p className="font-dmsans pt-3 text-lg">
              Record a shared expense and split it among group members.{" "}
            </p>
          </div>
          <div></div>
        </div>

        {/* Form Section */}
        <div className="px-20 max-w-2xl mx-auto mt-10">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
            <div className="mb-4">
              <label htmlFor="groupId" className="block font-semibold mb-2">
                Group ID
              </label>
              <select
                id="groupId"
                value={groupId}
                onChange={(e) => setGroupId(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded"
              >
                {groupExpenses[0]?.map((id, index) => (
                  <option key={index} value={Number(id)}>
                    {groupExpenses[1]?.[index] || `Group ${id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="amount" className="block font-semibold mb-2">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.valueAsNumber || "")}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter Amount"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded"
            >
              Create Expense
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CreateExpenses;
