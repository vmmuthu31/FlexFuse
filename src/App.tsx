import { useEffect, useState } from "react";
import { createKintoSDK, KintoAccountInfo } from "kinto-web-sdk";
import {
  encodeFunctionData,
  Address,
  getContract,
  defineChain,
  createPublicClient,
  http,
} from "viem";
import contractsJSON from "../public/abis/7887.json";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "Components/Navbar";

interface KYCViewerInfo {
  isIndividual: boolean;
  isCorporate: boolean;
  isKYC: boolean;
  isSanctionsSafe: boolean;
  getCountry: string;
  getWalletOwners: Address[];
}

export const counterAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    name: "count",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "increment",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

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

const KintoConnect = () => {
  const [accountInfo, setAccountInfo] = useState<KintoAccountInfo | undefined>(
    undefined
  );
  const [kycViewerInfo, setKYCViewerInfo] = useState<any | undefined>(
    undefined
  );
  const [counter, setCounter] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const kintoSDK = createKintoSDK("0x14A1EC9b43c270a61cDD89B6CbdD985935D897fE");
  const counterAddress =
    "0x14A1EC9b43c270a61cDD89B6CbdD985935D897fE" as Address;

  async function kintoLogin() {
    try {
      await kintoSDK.createNewWallet();
    } catch (error) {
      console.error("Failed to login/signup:", error);
    }
  }

  async function fetchCounter() {
    const client = createPublicClient({
      chain: kinto,
      transport: http(),
    });
    const counter = getContract({
      address: counterAddress as Address,
      abi: counterAbi,
      client: { public: client },
    });
    const count = (await counter.read.count([])) as BigInt;
    setCounter(parseInt(count.toString()));
  }

  async function increaseCounter() {
    const data = encodeFunctionData({
      abi: counterAbi,
      functionName: "increment",
      args: [],
    });
    setLoading(true);
    try {
      const response = await kintoSDK.sendTransaction([
        { to: counterAddress, data, value: BigInt(0) },
      ]);
      await fetchCounter();
    } catch (error) {
      console.error("Failed to login/signup:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchKYCViewerInfo() {
    if (!accountInfo?.walletAddress) return;

    const client = createPublicClient({
      chain: kinto,
      transport: http(),
    });
    const kycViewer = getContract({
      address: contractsJSON.contracts.KYCViewer.address as Address,
      abi: contractsJSON.contracts.KYCViewer.abi,
      client: { public: client },
    });

    try {
      const [
        isIndividual,
        isCorporate,
        isKYC,
        isSanctionsSafe,
        getCountry,
        getWalletOwners,
      ] = await Promise.all([
        kycViewer.read.isIndividual([accountInfo.walletAddress]),
        kycViewer.read.isCompany([accountInfo.walletAddress]),
        kycViewer.read.isKYC([accountInfo.walletAddress]),
        kycViewer.read.isSanctionsSafe([accountInfo.walletAddress]),
        kycViewer.read.getCountry([accountInfo.walletAddress]),
        kycViewer.read.getWalletOwners([accountInfo.walletAddress]),
      ]);

      setKYCViewerInfo({
        isIndividual,
        isCorporate,
        isKYC,
        isSanctionsSafe,
        getCountry,
        getWalletOwners,
      } as KYCViewerInfo);
    } catch (error) {
      console.error("Failed to fetch KYC viewer info:", error);
    }

    console.log("KYCViewerInfo:", kycViewerInfo);
  }

  async function fetchAccountInfo() {
    setLoading(true);
    try {
      setAccountInfo(await kintoSDK.connect());
    } catch (error) {
      console.error("Failed to fetch account info:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAccountInfo();
    fetchCounter();
  });

  useEffect(() => {
    if (accountInfo?.walletAddress) {
      fetchKYCViewerInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountInfo]);

  // todo: add info about the dev portal and link
  return (
    <div className="bg-[#E8E8E8] min-h-screen">
      <Navbar />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <KintoConnect />
      <ToastContainer />
    </div>
  );
}

export default App;
