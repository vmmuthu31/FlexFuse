import { useEffect, useState } from "react";
import { createKintoSDK, KintoAccountInfo } from "kinto-web-sdk";
import { toast } from "react-toastify";
import {
  Address,
  getContract,
  createPublicClient,
  http,
  defineChain,
} from "viem";
import contractsJSON from "../../public/abis/7887.json";
import { MdVerified } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setNetwork, setWalletAddress } from "../../store/store";
import { Link } from "react-router-dom";
import { Wallet } from "./Wallet";

interface KYCViewerInfo {
  isIndividual: boolean;
  isCorporate: boolean;
  isKYC: boolean;
  isSanctionsSafe: boolean;
  getCountry: string;
  getWalletOwners: Address[];
}

function Navbar() {
  const dispatch = useDispatch();
  const network = useSelector((state: any) => state?.network?.network);

  const kintoSDK = createKintoSDK("0x14A1EC9b43c270a61cDD89B6CbdD985935D897fE");
  const [loading, setLoading] = useState(false);
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
  const [accountInfo, setAccountInfo] = useState<KintoAccountInfo | undefined>(
    undefined
  );

  const [kycViewerInfo, setKYCViewerInfo] = useState<any | undefined>(
    undefined
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (accountInfo?.walletAddress) {
      dispatch(setWalletAddress(accountInfo.walletAddress));
      fetchKYCViewerInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountInfo]);

  async function kintoLogin() {
    try {
      await kintoSDK.createNewWallet();
    } catch (error) {
      console.error("Failed to login/signup:", error);
    }
  }

  const [selectedChain, setSelectedChain] = useState("kinto");

  const handleChainChange = (event : any) => {
    dispatch(setNetwork(event.target.value));
    setSelectedChain(event.target.value);
  };


  useEffect(()=>{
    if(network === "eth"){
      setSelectedChain("eth");
    } else if (network === "kinto"){
      setSelectedChain("kinto");
    } 
    else if (network === "hedera"){
      setSelectedChain("hedera");
    } 
    else if (network === "flare"){
      setSelectedChain("flare");
    } 
  },[]);

  return (
    <div className="flex justify-between py-4 pt-8 px-32 font-albertsans ">
      <Link className="flex gap-3 items-center" to="/">
        <img src="/logo.svg" alt="KintoHub Logo" />
        <span className=" font-semibold text-2xl">FlexFuse</span>
      </Link>
      <div className="flex gap-8 items-center">
        <span>
          <Link to="/">Home</Link>
        </span>
        <span>
          <a
            href="/#services"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("services")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Services
          </a>{" "}
        </span>
        <span>
          <Link to="/Subscriptions">Subscriptions</Link>
        </span>
        <div>
          <select
          id="chain-selector"
          value={selectedChain}
          onChange={handleChainChange}
          className="border rounded-md px-4 py-2 text-gray-700 focus:outline-none"
        >
          <option value="kinto">Kinto</option>
          <option value="eth">Ethereum</option>
          <option value="hedera">Hedera</option>
          <option value="flare">Flare</option>
        </select>
        </div>

        {network === "eth" || network === "hedera" || network === "flare" ? 
          <Wallet />
        :
          <div>
            {accountInfo?.walletAddress && (
              <div className="flex gap-1 justify-between">
                <span className="font-semibold">Wallet: </span>
                <div
                  className="cursor-pointer text-blue-600 hover:underline"
                  onClick={() => {
                    if (accountInfo.walletAddress) {
                      navigator.clipboard.writeText(accountInfo.walletAddress);
                    }
                    toast.success("Wallet address copied to clipboard!", {
                      position: "top-right",
                      autoClose: 3000,
                      hideProgressBar: true,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "light",
                    });
                  }}
                >
                  {accountInfo.walletAddress && (
                    <div className="flex gap-1 items-center">
                      {kycViewerInfo?.isKYC && (
                        <MdVerified className="text-green-400" />
                      )}
                      {accountInfo.walletAddress.slice(0, 5)}...
                      {accountInfo.walletAddress.slice(-5)}
                    </div>
                  )}
                </div>
              </div>
            )}
            {(!loading || !accountInfo?.walletAddress) && (
              <div>
                {!accountInfo?.walletAddress && (
                  <button
                    className="bg-black text-white px-4 py-2 rounded-md"
                    onClick={kintoLogin}
                  >
                    Login/Signup
                  </button>
                )}
              </div>
            )}
          </div>
        }
      </div>
    </div>
  );
}

export default Navbar;
