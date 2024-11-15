import { useEffect, useState } from "react";
import { createKintoSDK, KintoAccountInfo } from "kinto-web-sdk";
import { toast } from "react-toastify";

function Navbar() {
  const kintoSDK = createKintoSDK("0x14A1EC9b43c270a61cDD89B6CbdD985935D897fE");
  const [loading, setLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState<KintoAccountInfo | undefined>(
    undefined
  );

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

  async function kintoLogin() {
    try {
      await kintoSDK.createNewWallet();
    } catch (error) {
      console.error("Failed to login/signup:", error);
    }
  }

  return (
    <div className="flex justify-between py-4 px-20 font-albertsans ">
      <div className="flex gap-3 items-center">
        <img src="/logo.svg" alt="KintoHub Logo" />
        <span className=" font-semibold text-2xl">FlexFuse</span>
      </div>
      <div className="flex gap-8 items-center">
        <span>Home</span>
        <span>Services</span>
        <span>About Us</span>
        <span>Contact</span>
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
                {accountInfo.walletAddress &&
                  `${accountInfo.walletAddress.slice(
                    0,
                    5
                  )}...${accountInfo.walletAddress.slice(-5)}`}
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
      </div>
    </div>
  );
}

export default Navbar;
