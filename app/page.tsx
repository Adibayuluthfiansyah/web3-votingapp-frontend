"use client";

import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constant/index";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
  const [newName, setNewName] = useState<string>("");

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
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
        fetchProposals(votingContract);
      } catch (err) {
        console.error("User menolak koneksi:", err);
      }
    } else {
      toast.error("MetaMask tidak terdeteksi. Silakan install MetaMask!");
    }
  };

  const fetchProposals = async (contractInstance: ethers.Contract) => {
    try {
      const data = await contractInstance.getProposals();
      const formatted = data.map((p: Proposal) => ({
        name: p.name,
        votecount: Number(p.votecount),
        author: p.author,
      }));

      setProposals(formatted);
    } catch (err) {
      console.error("Gagal ambil proposal:", err);
    }
  };

  const handleVote = async (index: number) => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.vote(index);
      console.log("Voting... hash:", tx.hash);
      await tx.wait();
      toast.success("Vote berhasil!");
      fetchProposals(contract);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      alert("Gagal vote: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!contract || !newName) return;
    try {
      setLoading(true);
      const tx = await contract.createProposal(newName);
      await tx.wait();

      toast.success("Kandidat berhasil dibuat!");
      setNewName("");
      fetchProposals(contract);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      toast.error("Gagal membuat kandidat: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-bold text-blue-600">Web3 Voting App</h1>

          {!account ? (
            <button
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full font-bold transition"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-600">
              <span className="text-green-400 text-sm">Connected: </span>
              <span className="font-mono text-sm">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          )}
        </div>

        {account && contract ? (
          <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Tambah Kandidat Baru</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Nama Kandidat (misal: Budi)"
                  className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Tambah"}
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Daftar Pemilihan</h2>
              {proposals.length === 0 ? (
                <p className="text-gray-500 text-center italic">
                  Belum ada kandidat. Jadilah yang pertama membuat!
                </p>
              ) : (
                <div className="grid gap-4">
                  {proposals.map((prop, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex justify-between items-center hover:border-blue-500 transition"
                    >
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {prop.name}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Author:{" "}
                          <span className="font-mono text-xs">
                            {prop.author.slice(0, 6)}...
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-yellow-400">
                            {prop.votecount}
                          </p>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">
                            Suara
                          </p>
                        </div>
                        <button
                          onClick={() => handleVote(idx)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transform active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          VOTE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl text-gray-400">
              Silakan hubungkan wallet Anda untuk mulai memilih.
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
