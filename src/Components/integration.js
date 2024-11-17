import { ethers } from "ethers";
import Abi from "./abi.json";
import Chain from "./chainABI.json";

export async function betBull(value, contractAddress, approval, destId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const contract = new ethers.Contract(contractAddress, Abi, signer);
  const apprl = await contract.allowance(address, approval);
  if (apprl.toString() === "0") {
    await contract.approve(approval, "100000000000000000000000");
    const chainCont = new ethers.Contract(approval, Chain, signer);
    const bytesAddress = addressToBytes32(address);
    await chainCont.depositForBurn(value, 3, bytesAddress, contractAddress);
  } else {
    const chainCont = new ethers.Contract(approval, Chain, signer);
    console.log("chain contract", chainCont);
    const bytesAddress = addressToBytes32(address);
    await contract.balanceOf(address);
    await chainCont.depositForBurn(value, 3, bytesAddress, contractAddress);
  }
}

function addressToBytes32(address) {
  return (
    address.slice(0, 2) +
    "000000000000000000000000" +
    address.slice(2, address.length)
  );
}
