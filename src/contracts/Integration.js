// import SenderAbi from "./abi/SenderAbi.json";
import SenderAbi from "./abi/SenderAbi.json";
import StakerAbi from "./abi/StakerAbi.json";
import tokenabi from "./abi/token.json";
import ccipAbi from "./abi/CCIPAbi.json";
import { ethers } from "ethers";
import Web3 from "web3";
import { ARBITRUM_SENDER_CONTRACT_ADDRESS, BASE_STAKER_CONTRACT_ADDRESS } from "../constants";

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

export const GETSUBSCRIPTION = async (contractAddress) => {
    try {
        const provider = 
        window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
            
        const signer = provider.getSigner();
        const Role = new ethers.Contract(contractAddress, SenderAbi, signer);
        const answer = await Role.getAllSubscriptions();
        return answer;
    } catch (error) {
        console.error('Error sending USDC:', error);
    }
}

export const GETGROUPEXPENSE= async (contractAddress) => {
    try {
        const provider = 
        window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
            
        const signer = provider.getSigner();
        const Role = new ethers.Contract(contractAddress, SenderAbi, signer);
        const answer = await Role.getAllGroups();
        return answer;
    } catch (error) {
        console.error('Error sending USDC:', error);
    }
}

export const GETSUBSCRIPTIONID = async (contractAddress, id) => {
    try {
        const provider = 
        window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
            
        const signer = provider.getSigner();
        const Role = new ethers.Contract(contractAddress, SenderAbi, signer);
        const answer = await Role.getSubscriptionDetails(id);
        return answer;
    } catch (error) {
        console.error('Error getting subscription id detail:', error);
    }
}

export const SUBSCRIBE = async (contractAddress, id) => {
    try {
        const provider = 
        window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
            
        const signer = provider.getSigner();
        const Role = new ethers.Contract(contractAddress, SenderAbi, signer);

        const usdcaddress = new ethers.Contract("0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",tokenabi, signer );

        const userAddress = await signer.getAddress();
        console.log("user address", userAddress);
        
        const allowance = await usdcaddress.allowance(userAddress,contractAddress );

        console.log("allowance",allowance.toString());

        if(allowance.toString() === "0") {
            const approve = await usdcaddress.approve(contractAddress, "100000000000000000000000" );
            const balance = await usdcaddress.balanceOf(userAddress );


approve.wait()

console.log("balnace",balance);

 const answer = await Role.selectSubscription(id, 0);
        return answer;
        }

        else{
            const balance = await usdcaddress.balanceOf(userAddress );
            console.log("balnace",balance);

            console.log("no approve required");
             const answer = await Role.selectSubscription(id, 0);
        return answer;
        }





        // const answer = await Role.selectSubscription(id, 0);
        // return answer;
    } catch (error) {
        console.error('Error sending USDC:', error);
    }
}

export const GETSUBSCRIPTIONBYADDRESS = async (contractAddress, walletAddress) => {
    console.log("address", walletAddress);
    
    try {
        const provider = 
        window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
            
        const signer = provider.getSigner();
        const Role = new ethers.Contract(contractAddress, SenderAbi, signer);
        const answer = await Role.getUserSubscriptions(walletAddress);
        return answer;
    } catch (error) {
        console.error('Error getting subscription wallet detail:', error);
    }
}

export const CREATESUBSCRIPTION = async (contractAddress, name, description, baseAmount, token) => {
    try {
        const provider = 
        window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
            
        const signer = provider.getSigner();
        const Role = new ethers.Contract(contractAddress, SenderAbi, signer);
        const answer = await Role.createSubscription(name, description, baseAmount, token);
        return answer;
    } catch (error) {
        console.error('Error getting create subscription:', error);
    }
}

export const CREATESUBSCRIPTIONFLARE = async (contractAddress, name, description, baseAmount) => {
    try {
        const provider = 
        window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
            
        const signer = provider.getSigner();
        const abi = [
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "subscriptionId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "serviceProvider",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "baseAmount",
                        "type": "uint256"
                    }
                ],
                "name": "SubscriptionCreated",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "user",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "subscriptionId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "nextPaymentDue",
                        "type": "uint256"
                    }
                ],
                "name": "SubscriptionSelected",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "baseAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "enum FlexFuse.Frequency",
                        "name": "frequency",
                        "type": "uint8"
                    }
                ],
                "name": "calculateCost",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "pure",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "baseAmount",
                        "type": "uint256"
                    }
                ],
                "name": "createSubscription",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getAllSubscriptions",
                "outputs": [
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "id",
                                "type": "uint256"
                            },
                            {
                                "internalType": "string",
                                "name": "name",
                                "type": "string"
                            },
                            {
                                "internalType": "string",
                                "name": "description",
                                "type": "string"
                            },
                            {
                                "internalType": "address payable",
                                "name": "serviceProvider",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "baseAmount",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "startTime",
                                "type": "uint256"
                            },
                            {
                                "internalType": "enum FlexFuse.Frequency",
                                "name": "frequency",
                                "type": "uint8"
                            },
                            {
                                "internalType": "bool",
                                "name": "active",
                                "type": "bool"
                            }
                        ],
                        "internalType": "struct FlexFuse.Subscription[]",
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "enum FlexFuse.Frequency",
                        "name": "frequency",
                        "type": "uint8"
                    }
                ],
                "name": "getInterval",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "pure",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "subscriptionId",
                        "type": "uint256"
                    }
                ],
                "name": "getSubscriptionDetails",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "serviceProvider",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "baseAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "active",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "user",
                        "type": "address"
                    }
                ],
                "name": "getUserSubscriptions",
                "outputs": [
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "subscriptionId",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "nextPaymentDue",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct FlexFuse.UserSubscription[]",
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "subscriptionId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "enum FlexFuse.Frequency",
                        "name": "frequency",
                        "type": "uint8"
                    }
                ],
                "name": "selectSubscription",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "subscriptions",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "address payable",
                        "name": "serviceProvider",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "baseAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "startTime",
                        "type": "uint256"
                    },
                    {
                        "internalType": "enum FlexFuse.Frequency",
                        "name": "frequency",
                        "type": "uint8"
                    },
                    {
                        "internalType": "bool",
                        "name": "active",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "userSubscriptions",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "subscriptionId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "nextPaymentDue",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "stateMutability": "payable",
                "type": "receive"
            }
        ];
        const Role = new ethers.Contract(contractAddress, abi, signer);
        const answer = await Role.createSubscription(name, description, baseAmount);
        return answer;
    } catch (error) {
        console.error('Error getting create subscription:', error);
    }
}

export const GETALLGROUPS = async (contractAddress) => {
    try {
        const provider = 
        window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
            
        const signer = provider.getSigner();
        const Role = new ethers.Contract(contractAddress, SenderAbi, signer);
        const answer = await Role.getAllGroups();
        return answer;
    } catch (error) {
        console.error('Error getting groups:', error);
    }
}

export const ADDEXPENSE = async (contractAddress, groupId, amount, token) => {
    try {
        const provider = 
        window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
            
        const signer = provider.getSigner();
        const Role = new ethers.Contract(contractAddress, SenderAbi, signer);
        const answer = await Role.addExpense(groupId, amount, token);
        return answer;
    } catch (error) {
        console.error('Error adding expense:', error);
    }
}

export const CREATEGROUP = async (contractAddress, name, members) => {
    try {
        const provider = 
        window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
            
        const signer = provider.getSigner();
        const Role = new ethers.Contract(contractAddress, SenderAbi, signer);
        const answer = await Role.createGroup(name, members);
        return answer;
    } catch (error) {
        console.error('Error creating group:', error);
    }
}

export const CCIPSEND = async (contractAddress, account, amount) => {
    try {
        const provider = 
        window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
            
        const signer = provider.getSigner();
        const Role = new ethers.Contract(contractAddress, ccipAbi, signer);
        const answer = await Role.sendMessagePayLINK(BASE_DESTINATION_CHAIN_SELECTOR, account, amount);
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

// export async function approveAllowance(amount, contractAddress) {
//     try {
//         // Connect to the Ethereum or Arbitrum provider (e.g., MetaMask)
//         const provider = new ethers.providers.Web3Provider(window.ethereum);

//         // Request the user's account to be selected
//         const signer = provider.getSigner();
//         const userAddress = await signer.getAddress();

//         // USDC token contract address and ABI
//         const usdcTokenAddress = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"; // Mainnet USDC contract address
//         const usdcTokenABI = [
//             "function approve(address spender, uint256 amount) public returns (bool)",
//             "function allowance(address owner, address spender) public view returns (uint256)"
//         ];

//         // Create the USDC token contract instance
//         const usdcToken = new ethers.Contract(usdcTokenAddress, usdcTokenABI, signer);

//         // Set the amount (e.g., 1 USDC = 1000000 if USDC has 6 decimals)
//         const amountInWei = ethers.utils.parseUnits(amount.toString(), 6); // 6 decimals for USDC

//         // Get the current allowance
//         const currentAllowance = await usdcToken.allowance(userAddress, contractAddress);
//         console.log("Current allowance:", currentAllowance.toString());

//         // Check if the allowance is 0 or less
//         if (currentAllowance.lt(amountInWei)) {
//             console.log("Allowance is insufficient, proceeding with approval.");

//             // Send the approval transaction
//             const tx = await usdcToken.approve(contractAddress, amountInWei);
//             console.log("Transaction sent:", tx);

//             // Wait for the transaction to be mined
//             const receipt = await tx.wait();
//             console.log("Transaction confirmed:", receipt);
//             return receipt; // Optionally, return the receipt for further use
//         } else {
//             console.log("Allowance is sufficient, no approval needed.");
//         }
//     } catch (error) {
//         console.error("Error approving allowance:", error);
//     }
// }
