import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  Address,
  createPublicClient,
  defineChain,
  getContract,
  http,
} from "viem";
import FlexfuseAbi from "../../public/abis/flexfuse.json";
import SubscriptionTable from "./SubscriptionTable";
import GroupExpensesTable from "./GroupExpensesTable";
import { Link } from "react-router-dom";

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

const Dashboard = () => {
  const walletAddress = useSelector((state: any) => state?.wallet?.address);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any[]>([]);
  const [groupExpenses, setGroupExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "subscriptions" | "groups"
  >("subscriptions");

  const fetchSubscriptionDetails = async () => {
    if (!walletAddress) return;

    setLoading(true);

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

      const details = await contract.read.getAllSubscriptions();
      setSubscriptionDetails((details as any[]).slice(0, 2));
    } catch (error) {
      console.error("Error fetching subscription details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupExpenses = async () => {
    if (!walletAddress) return;

    setLoading(true);

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

      const groups = await contract.read.getAllGroups();
      console.log("groups", groups);
      setGroupExpenses(groups as any[]);
    } catch (error) {
      console.error("Error fetching group expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "subscriptions") {
      fetchSubscriptionDetails();
    } else if (activeSection === "groups") {
      fetchGroupExpenses();
    }
    // eslint-disable-next-line
  }, [activeSection]);

  return (
    <div className="bg-[#E8E8E8] flex flex-col justify-between min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Main Content */}
        <div className="flex-grow p-6">
          {walletAddress ? (
            <>
              <p className="font-playfair text-center mt-8 italic font-bold text-3xl mb-6">
                Welcome Back {walletAddress.slice(0, 5)}...
                {walletAddress.slice(-5)}
              </p>

              <div className="flex items-center gap-5 mt-8 justify-center">
                <div className="text-center text-white p-8 rounded-lg w-60 bg-[#262626] mb-6">
                  <p className="font-bold text-xl">0.00</p>
                  <p className=" mt-2"> Wallet Balance</p>{" "}
                </div>
                <div className="text-center text-white p-8 rounded-lg w-60 bg-[#262626] mb-6">
                  <p className="text-xl font-bold">
                    {subscriptionDetails.length}
                  </p>
                  <p className=" mt-2">Active Subscriptions</p>
                </div>
                <div className="text-center text-white p-8 rounded-lg w-60 bg-[#262626] mb-6">
                  <p className="font-bold text-xl">{groupExpenses.length}</p>
                  <p className="mt-2">Total Expenses</p>
                </div>
                <div className="text-center flex flex-col gap-5  max-w-md mb-6">
                  <Link
                    to="/CreateSubscription"
                    className="bg-[#262626] text-white px-8 py-2 rounded  w-full"
                  >
                    Create Subscription
                  </Link>
                  <Link
                    to="/CreateExpenses"
                    className="bg-[#262626] text-white px-4 py-2 mt-2 rounded w-full"
                  >
                    Create Expense
                  </Link>
                </div>
              </div>
              <div className="flex pl-16 items-center">
                <button
                  onClick={() => setActiveSection("subscriptions")}
                  className={`block  text-left px-4 py-2 ${
                    activeSection === "subscriptions"
                      ? "text-[#262626] underline"
                      : " text-[#8D8D8D]"
                  }`}
                >
                  Subscription List
                </button>
                <button
                  onClick={() => setActiveSection("groups")}
                  className={`block  text-left px-4 py-2  ${
                    activeSection === "groups"
                      ? "text-[#262626] underline"
                      : " text-[#8D8D8D]"
                  }`}
                >
                  Group Expenses
                </button>
              </div>
              <div className="pl-20">
                {loading ? (
                  <p className="mt-5">Loading...</p>
                ) : activeSection === "subscriptions" ? (
                  <SubscriptionTable
                    subscriptionDetails={subscriptionDetails}
                  />
                ) : (
                  <GroupExpensesTable groupExpenses={groupExpenses} />
                )}
              </div>
            </>
          ) : (
            <p className="mt-5 text-center">
              Please connect your wallet to view details.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default Dashboard;
