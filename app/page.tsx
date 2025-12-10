"use client";

import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constant/index";
import { useState, useEffect } from "react";

interface Proposal {
  author: string;
  name: string;
  votecount: number;
}

export default function Home() {
  const [account, setAccount] = useState<string>("");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [name, setName] = useState<string>("");

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      const votingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(votingContract);
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1>WELCOME TO VOTING APP WEB3!</h1>
      </div>
    );
  };
}
