import React, { useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { BALANCEOFUSER, REDEEMUSDDC } from '../contracts/Integration';
import Navbar from './Navbar';

type Props = {};

const Redeem = (props: Props) => {
  const [value, setValue] = useState<number | null>(0);
  const account = useAccount();
  const chain = useSwitchChain();

  const balanceOfUser = async () => {
    if (!account?.address) {
      console.log('Wallet address is not connected. Skipping balance fetch.');
      return;
    }
    try {
      const result = await BALANCEOFUSER(account.address);
      const balanceInWei = parseInt(result._hex, 16); // Convert hex to decimal
      const balanceInUSDC = balanceInWei / 1e6; // Convert wei to USDC
      setValue(balanceInUSDC);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setValue(null);
    }
  };

  const RedeemUSDC = async () => {
    if (!account?.address) {
      console.log('Wallet address is not connected. Skipping redeem.');
      return;
    }
    try {
      const result = await REDEEMUSDDC();
      console.log('Redeem USDC:', result);
    } catch (error) {
      console.error('Failed to redeem USDC:', error);
    }
  };

  const handleChainChange = () => {
    if (account?.chainId !== 84532) {
      chain.switchChain({ chainId: 84532 });
    }
  };

  useEffect(() => {
    balanceOfUser();
  }, [account?.address]);

  useEffect(() => {
    handleChainChange();
  }, [account?.chainId]);

  return (
    <div className="bg-[#E8E8E8] min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto py-16 px-6 text-center">
        <h1 className="text-4xl font-bold italic font-dmsans mb-4 text-[#262626]">
          Redeem Your Tokens
        </h1>
        <p className="text-lg font-medium mb-10 text-gray-700">
          Easily redeem your available USDC tokens with a simple click.
        </p>

        <div className="bg-[#262626] text-white py-10 px-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Tokens Available</h2>
          {value !== null ? (
            <div className="flex flex-col items-center mb-6">
              <p className="text-xl font-medium">
                {value} <span className="font-bold">USDC</span>
              </p>
            </div>
          ) : (
            <p className="text-lg italic">Fetching...</p>
          )}

          <div className="mt-6">
            {value === 0 ? (
              <button
                disabled
                className="bg-red-500 px-6 py-3 rounded-lg font-semibold text-white cursor-not-allowed"
              >
                Nothing to Redeem
              </button>
            ) : (
              <button
                onClick={RedeemUSDC}
                className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold text-white transition"
              >
                Redeem
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Redeem;
