import {
  encodeFunctionData,
  Address,
  getContract,
  defineChain,
  createPublicClient,
  http,
} from "viem";
import FlexfuseAbi from "../public/abis/flexfuse.json";
import { createKintoSDK } from "kinto-web-sdk";

const kintoSDK = createKintoSDK("0x14A1EC9b43c270a61cDD89B6CbdD985935D897fE");

const contractadddress =
  "0x14A1EC9b43c270a61cDD89B6CbdD985935D897fE" as Address;
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

export async function fetchSubscriptionDetails(subscriptionId) {
  const client = createPublicClient({
    chain: kinto,
    transport: http(),
  });

  const contract = getContract({
    address: contractadddress as Address,
    abi: FlexfuseAbi,
    client: { public: client },
  });

  try {
    const details = await contract.read.getSubscriptionDetails([
      subscriptionId,
    ]);
    console.log("Subscription Details:", details);
    return details;
  } catch (error) {
    console.error("Error fetching subscription details:", error);
  }
}

export async function createSubscription(
  subscriptionId,
  serviceProvider,
  amount,
  token,
  startTime,
  interval
) {
  const data = encodeFunctionData({
    abi: FlexfuseAbi,
    functionName: "createSubscription",
    args: [subscriptionId, serviceProvider, amount, token, startTime, interval],
  });

  try {
    const response = await kintoSDK.sendTransaction([
      { to: contractadddress, data, value: BigInt(0) },
    ]);
    console.log("Subscription created:", response);
  } catch (error) {
    console.error("Error creating subscription:", error);
  }
}

export async function sendPayment(receiver, amount, token) {
  const data = encodeFunctionData({
    abi: FlexfuseAbi,
    functionName: "sendPayment",
    args: [receiver, amount, token],
  });

  try {
    const response = await kintoSDK.sendTransaction([
      { to: contractadddress, data, value: BigInt(0) },
    ]);
    console.log("Payment sent:", response);
  } catch (error) {
    console.error("Error sending payment:", error);
  }
}

export async function fetchTransactionHistory(userAddress) {
  const client = createPublicClient({
    chain: kinto,
    transport: http(),
  });

  const contract = getContract({
    address: contractadddress as Address,
    abi: FlexfuseAbi,
    client: { public: client },
  });

  try {
    const transactions = await contract.read.getTransactionHistory([
      userAddress,
    ]);
    console.log("Transaction History:", transactions);
    return transactions;
  } catch (error) {
    console.error("Error fetching transaction history:", error);
  }
}

export async function createGroup(groupId, members) {
  const data = encodeFunctionData({
    abi: FlexfuseAbi,
    functionName: "createGroup",
    args: [groupId, members],
  });

  try {
    const response = await kintoSDK.sendTransaction([
      { to: contractadddress, data, value: BigInt(0) },
    ]);
    console.log("Group created:", response);
  } catch (error) {
    console.error("Error creating group:", error);
  }
}

export async function addPaymentToGroup(groupId, amount, token) {
  const data = encodeFunctionData({
    abi: FlexfuseAbi,
    functionName: "addPayment",
    args: [groupId, amount, token],
  });

  try {
    const response = await kintoSDK.sendTransaction([
      { to: contractadddress, data, value: BigInt(0) },
    ]);
    console.log("Payment added to group:", response);
  } catch (error) {
    console.error("Error adding payment to group:", error);
  }
}

export async function withdrawPaymentFromGroup(groupId, amount, token) {
  const data = encodeFunctionData({
    abi: FlexfuseAbi,
    functionName: "withdrawPayment",
    args: [groupId, amount, token],
  });

  try {
    const response = await kintoSDK.sendTransaction([
      { to: contractadddress, data, value: BigInt(0) },
    ]);
    console.log("Payment withdrawn from group:", response);
  } catch (error) {
    console.error("Error withdrawing payment from group:", error);
  }
}

export async function updateSubscription(
  subscriptionId,
  newAmount,
  newInterval
) {
  const data = encodeFunctionData({
    abi: FlexfuseAbi,
    functionName: "updateSubscription",
    args: [subscriptionId, newAmount, newInterval],
  });

  try {
    const response = await kintoSDK.sendTransaction([
      { to: contractadddress, data, value: BigInt(0) },
    ]);
    console.log("Subscription updated:", response);
  } catch (error) {
    console.error("Error updating subscription:", error);
  }
}

export async function removeMember(groupId, member) {
  const data = encodeFunctionData({
    abi: FlexfuseAbi,
    functionName: "removeMember",
    args: [groupId, member],
  });

  try {
    const response = await kintoSDK.sendTransaction([
      { to: contractadddress, data, value: BigInt(0) },
    ]);
    console.log("Member removed:", response);
  } catch (error) {
    console.error("Error removing member:", error);
  }
}

export async function deactivateGroup(groupId) {
  const data = encodeFunctionData({
    abi: FlexfuseAbi,
    functionName: "deactivateGroup",
    args: [groupId],
  });

  try {
    const response = await kintoSDK.sendTransaction([
      { to: contractadddress, data, value: BigInt(0) },
    ]);
    console.log("Group deactivated:", response);
  } catch (error) {
    console.error("Error deactivating group:", error);
  }
}

export async function releasePayment(subscriptionId, groupId) {
  const data = encodeFunctionData({
    abi: FlexfuseAbi,
    functionName: "releasePayment",
    args: [subscriptionId, groupId],
  });

  try {
    const response = await kintoSDK.sendTransaction([
      { to: contractadddress, data, value: BigInt(0) },
    ]);
    console.log("Payment released:", response);
  } catch (error) {
    console.error("Error releasing payment:", error);
  }
}

export async function checkSubscriptionDue(subscriptionId) {
  const client = createPublicClient({
    chain: kinto,
    transport: http(),
  });

  const contract = getContract({
    address: contractadddress as Address,
    abi: FlexfuseAbi,
    client: { public: client },
  });

  try {
    const isDue = await contract.read.checkSubscriptionDue([subscriptionId]);
    console.log("Subscription due:", isDue);
    return isDue;
  } catch (error) {
    console.error("Error checking subscription due:", error);
  }
}

export async function getGroupMembers(groupId) {
  const client = createPublicClient({
    chain: kinto,
    transport: http(),
  });

  const contract = getContract({
    address: contractadddress as Address,
    abi: FlexfuseAbi,
    client: { public: client },
  });

  try {
    const members = await contract.read.getGroupMembers([groupId]);
    console.log("Group members:", members);
    return members;
  } catch (error) {
    console.error("Error fetching group members:", error);
  }
}

export async function getGroupPayments(groupId, member) {
  const client = createPublicClient({
    chain: kinto,
    transport: http(),
  });

  const contract = getContract({
    address: contractadddress as Address,
    abi: FlexfuseAbi,
    client: { public: client },
  });

  try {
    const payments = await contract.read.getGroupPayments([groupId, member]);
    console.log("Group payments:", payments);
    return payments;
  } catch (error) {
    console.error("Error fetching group payments:", error);
  }
}

export async function getGroupDetails(groupId) {
  const client = createPublicClient({
    chain: kinto,
    transport: http(),
  });

  const contract = getContract({
    address: contractadddress as Address,
    abi: FlexfuseAbi,
    client: { public: client },
  });

  try {
    const details = await contract.read.getGroupDetails([groupId]);
    console.log("Group details:", details);
    return details;
  } catch (error) {
    console.error("Error fetching group details:", error);
  }
}
