// import SenderAbi from "./abi/SenderAbi.json";
import SenderAbi from "./abi/SenderNoOwner.json";
import StakerAbi from "./abi/StakerAbi.json";
import { ethers } from "ethers";
import Web3 from "web3";
import { ARBITRUM_SENDER_CONTRACT_ADDRESS, ARBITRUM_USDC_CONTRACT_ADDRESS, BASE_STAKER_CONTRACT_ADDRESS } from "../constants";

const isBrowser = () => typeof window !== "undefined";
const { ethereum } = isBrowser();

if (ethereum) {
  isBrowser().web3 = new Web3(ethereum); 
  isBrowser().web3 = new Web3(isBrowser().web3.currentProvider);
}

const BASE_DESTINATION_CHAIN_SELECTOR = '10344971235874465080';
// const ARBITRUM_DESTINATION_CHAIN_SELECTOR = '';


export const SENDUSDC = async (account, amount, platformAddress) => {
    try {
        const provider = 
        window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
            
        const signer = provider.getSigner();
        const Role = new ethers.Contract(ARBITRUM_SENDER_CONTRACT_ADDRESS, SenderAbi, signer);
        const answer = await Role.sendMessagePayLINK(BASE_DESTINATION_CHAIN_SELECTOR, account, amount, platformAddress);
        return answer;
    } catch (error) {
        console.error('Error sending USDC:', error);
    }
}

export const BALANCEOFUSER = async (account) => {
    try {
        const provider = 
        window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
            
        const signer = provider.getSigner();
        const Role = new ethers.Contract(BASE_STAKER_CONTRACT_ADDRESS, StakerAbi, signer);
        const answer = await Role.balanceOf(account);
        return answer;
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

export const REDEEMUSDDC = async () => {
    try {
        const provider = 
        window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
            
        const signer = provider.getSigner();
        const Role = new ethers.Contract(BASE_STAKER_CONTRACT_ADDRESS, StakerAbi, signer);
        const answer = await Role.redeem();
        return answer;
    } catch (error) {
        console.error('Error redeeming usdc:', error);
    }
}


export async function approveAllowance(amount, contractAddress) {
    try {
        // Connect to the Ethereum or Arbitrum provider (e.g., MetaMask)
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // Request the user's account to be selected
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        // USDC token contract address and ABI
        const usdcTokenAddress = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"; // Mainnet USDC contract address
        const usdcTokenABI = [
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function allowance(address owner, address spender) public view returns (uint256)"
        ];

        // Create the USDC token contract instance
        const usdcToken = new ethers.Contract(usdcTokenAddress, usdcTokenABI, signer);

        // Set the amount (e.g., 1 USDC = 1000000 if USDC has 6 decimals)
        const amountInWei = ethers.utils.parseUnits(amount.toString(), 6); // 6 decimals for USDC

        // Get the current allowance
        const currentAllowance = await usdcToken.allowance(userAddress, contractAddress);
        console.log("Current allowance:", currentAllowance.toString());

        // Check if the allowance is 0 or less
        if (currentAllowance.lt(amountInWei)) {
            console.log("Allowance is insufficient, proceeding with approval.");

            // Send the approval transaction
            const tx = await usdcToken.approve(contractAddress, amountInWei);
            console.log("Transaction sent:", tx);

            // Wait for the transaction to be mined
            const receipt = await tx.wait();
            console.log("Transaction confirmed:", receipt);
            return receipt; // Optionally, return the receipt for further use
        } else {
            console.log("Allowance is sufficient, no approval needed.");
        }
    } catch (error) {
        console.error("Error approving allowance:", error);
    }
}
