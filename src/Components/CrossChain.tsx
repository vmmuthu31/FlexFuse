import React, { useState } from 'react';
import { ethers } from 'ethers';
import { betBull } from './integration.js';
const CrossChainTransfer = () => {
  const [sourceChain, setSourceChain] = useState('');
  const [destinationChain, setDestinationChain] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');

  const chains = [
    { id: 'ethereum', name: 'Ethereum', usdc:"0x1c7d4b196cb0c7b01d743fbc6116a902379c7238" , dest:0, approvl:"0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5"},
    { id: 'arbitrum', name: 'Arbitrum'  , usdc: "0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d", dest: 3, approvl : "0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5"},
    { id: 'Avalanche', name: 'Avalanche', usdc: "0x5425890298aed601595a70AB815c96711a31Bc65", dest:1, approvl: "0xeb08f243e5d3fcff26a9e38ae5520a669f4019d0" }
  ];

  const handleSend = async () => {
    const sourceChainData = chains.find(chain => chain.id === sourceChain);
    const destinationChainData = chains.find(chain => chain.id === destinationChain);

    console.log({
      sourceChain: {
        id: sourceChainData?.id,
        dest: sourceChainData?.dest,
        usdcAddress: sourceChainData?.usdc
      },
      destinationChain: {
        id: destinationChainData?.id,
        dest: destinationChainData?.dest,
        usdcAddress: destinationChainData?.usdc
      },
      recipientAddress,
      amount
    });

    const val = ethers.utils.parseEther(amount.toString())

    console.log("val",val);
if(sourceChainData && destinationChainData){
    const res = await betBull(amount, sourceChainData.usdc , sourceChainData.approvl, destinationChainData.dest)

}
    
  };

  return (
    <div className="max-w-2xl mx-auto mt-[100px] p-8 bg-black rounded-2xl shadow-2xl">
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-inner">
        <h2 className="text-3xl font-bold text-center mb-8 text-white bg-clip-text">
          Cross-Chain USDC Transfer
        </h2>
      
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-white">From</label>
              <select
                value={sourceChain}
                onChange={(e) => setSourceChain(e.target.value)}
                className="w-full p-3 border-2 border-purple-300 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              >
                <option value="" className="text-gray-800">Select source chain</option>
                {chains.map((chain) => (
                  <option key={chain.id} value={chain.id} className="text-gray-800">
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-center mt-6">
              <span className="text-2xl bg-white/20 p-2 rounded-full backdrop-blur-sm">↔️</span>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-white">To</label>
              <select
                value={destinationChain}
                onChange={(e) => setDestinationChain(e.target.value)}
                className="w-full p-3 border-2 border-purple-300 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              >
                <option value="" className="text-gray-800">Select destination chain</option>
                {chains.map((chain) => (
                  <option key={chain.id} value={chain.id} className="text-gray-800">
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Recipient Address</label>
            <input
              type="text"
              placeholder="Enter recipient address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="w-full p-3 border-2 border-purple-300 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Amount (USDC)</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 border-2 border-purple-300 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!sourceChain || !destinationChain || !recipientAddress || !amount}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-3 px-4 rounded-lg font-medium 
            hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 
            disabled:opacity-50 disabled:cursor-not-allowed 
            transform hover:scale-[1.02] active:scale-[0.98] transition-all
            shadow-lg hover:shadow-xl"
          >
            Send USDC
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrossChainTransfer;