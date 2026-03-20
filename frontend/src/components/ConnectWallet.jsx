import { useState } from "react";
import {
  isConnected,
  getPublicKey,
  requestAccess,
} from "@stellar/freighter-api";

// LOBSTR kit uses window.xBull or window.rabet for xBull/Rabet wallets
const WALLETS = [
  {
    id: "freighter",
    name: "Freighter",
    icon: "🔷",
    description: "Official Stellar wallet",
  },
  {
    id: "xbull",
    name: "xBull",
    icon: "🐂",
    description: "Feature-rich Stellar wallet",
  },
  {
    id: "rabet",
    name: "Rabet",
    icon: "🐇",
    description: "Simple & fast wallet",
  },
];

export default function ConnectWallet({ onConnect }) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  async function connectWallet(walletId) {
    setConnecting(true);
    setError("");

    try {
      let publicKey;

      if (walletId === "freighter") {
        const connected = await isConnected();
        if (!connected) {
          throw new Error("Freighter extension not found. Please install it.");
        }
        publicKey = await requestAccess();
        if (!publicKey) {
          throw new Error("Access denied by user.");
        }
      } else if (walletId === "xbull") {
        if (!window.xBull) {
          throw new Error("xBull extension not found. Please install it.");
        }
        const result = await window.xBull.connect();
        publicKey = result.publicKey;
      } else if (walletId === "rabet") {
        if (!window.rabet) {
          throw new Error("Rabet extension not found. Please install it.");
        }
        const result = await window.rabet.connect();
        publicKey = result.publicKey;
      }

      if (publicKey) {
        onConnect({ publicKey, walletId });
      }
    } catch (err) {
      // Error type: Wallet connection failure
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌟</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Stellar Crowdfund
          </h1>
          <p className="text-gray-400">Connect your wallet to get started</p>
        </div>

        {/* Screenshot requirement: wallet options visible */}
        <div className="space-y-3">
          {WALLETS.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => connectWallet(wallet.id)}
              disabled={connecting}
              className="w-full flex items-center gap-4 p-4 bg-gray-800 hover:bg-gray-700 
                         border border-gray-700 hover:border-blue-500 rounded-xl 
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-2xl">{wallet.icon}</span>
              <div className="text-left">
                <div className="text-white font-semibold">{wallet.name}</div>
                <div className="text-gray-400 text-sm">{wallet.description}</div>
              </div>
              {connecting && (
                <div className="ml-auto w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        <p className="text-center text-gray-600 text-xs mt-6">
          Running on Stellar Testnet
        </p>
      </div>
    </div>
  );
}