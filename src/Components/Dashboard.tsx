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
import { SEPOLIA_CONTRACT_ADDRESS_SENDER } from "../constants";
import { GETSUBSCRIPTIONBYADDRESS } from "contracts/Integration";
import { useAccount } from "wagmi";

const CONTRACT_ADDRESS = "0x6f0029F082e03ee480684aC5Ef7fF019813ac1C2";
const ethcontractaddress = SEPOLIA_CONTRACT_ADDRESS_SENDER;
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

// Component
const Dashboard = () => {
  const walletAddress = useSelector((state: any) => state?.wallet?.address);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const network = useSelector((state: any) => state?.network?.network);
  const account = useAccount();

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

      console.log("contract", contract);

      const details = await contract.read.getUserSubscriptions([walletAddress]);
      console.log("details", details);
      setSubscriptionDetails((details as any[]).reverse());
    } catch (error) {
      console.error("Error fetching subscription details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionDetailsEth = async () => {
    try {
      const result = await GETSUBSCRIPTIONBYADDRESS(ethcontractaddress, account?.address);
      setSubscriptionDetails(result as any[]);
      console.log("result", result);
    } catch (error) {
      console.log("error", error);
    }
  }

  useEffect(() => {
    if(network === 'kinto') {
      fetchSubscriptionDetails();
    } else {
      fetchSubscriptionDetailsEth();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="bg-[#E8E8E8] flex flex-col justify-between min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="text-center">
          {walletAddress ? (
            <>
              <p className="font-playfair italic font-bold text-3xl mt-5">
                Welcome Back {walletAddress.slice(0, 5)}...
                {walletAddress.slice(-5)}
              </p>
              {loading ? (
                <p className="mt-5">Loading your subscriptions...</p>
              ) : subscriptionDetails?.length > 0 ? (
                <ul className="mt-5">
                  {subscriptionDetails.map((subscription, index) => (
                    <li key={index} className="py-2 border-b">
                      {JSON.stringify(subscription)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5">No subscriptions found.</p>
              )}
            </>
          ) : (
            <p className="mt-5">Please connect your wallet to view details.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
