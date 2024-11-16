import { ethers } from "ethers";
import Abi from "./abi.json";
import Chain from "./chainABI.json"






export async function betBull(value,contractAddress,approval, destId) {

 console.log("value",value);
 console.log("contractAdress",contractAddress);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []); // Request access to MetaMask accounts

  const signer = provider.getSigner(); // Get the signer from the provider
  const address = await signer.getAddress(); // Get the address from the signer

  const contract = new ethers.Contract(contractAddress, Abi, signer);

  console.log("contract",contract);

  const apprl = await contract.allowance(address,approval);

  console.log("appriovl",apprl);

  console.log("appr in st",apprl.toString());
  

  if(apprl.toString() === "0"){

    console.log("yees");

    console.log("apptovindgb",approval);
    
    
    const approvee = await contract.approve(approval,"100000000000000000000000")

    console.log("apprive",approvee);

    const chainCont = new ethers.Contract(approval, Chain, signer);
    console.log("chain contract",chainCont);
    
    const bytesAddress = addressToBytes32(address);
    const send = await chainCont.depositForBurn(value, 3,bytesAddress , contractAddress )

    console.log("appriveeeeeee",send);
    
  }else {

    const chainCont = new ethers.Contract(approval, Chain, signer);
    console.log("chain contract",chainCont);
    
    const bytesAddress = addressToBytes32(address);

    const bal = await contract.balanceOf(address);

    console.log("balamnce",bal.toString());
    
    const send = await chainCont.depositForBurn(value, 3,bytesAddress , contractAddress )

    console.log("appriveeeeeee",send);
    


  }
  


  

}

function addressToBytes32(address) {
    // "0x" + 24 zeros + Rest of the address string with leading "0x" trimmed
    return (
      address.slice(0, 2) +
      '000000000000000000000000' +
      address.slice(2, address.length)
    )
  }

