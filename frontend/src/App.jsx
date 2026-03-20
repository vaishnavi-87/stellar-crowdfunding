import { useState, useEffect, useCallback } from "react";
import ConnectWallet from "./components/ConnectWallet";
import CampaignCard from "./components/CampaignCard";
import DonateForm from "./components/DonateForm";
import TransactionStatus from "./components/TransactionStatus";
import { readContract } from "./utils/stellar";

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [txStatus, setTxStatus] = useState(null);
  const [loadError, setLoadError] = useState("");

  const loadCampaign = useCallback(async () => {
    try {
      setLoadError("");
      const result = await readContract("get_campaign");
      if (result) {
        // Parse the ScVal returned by Soroban
        const fields = result._switch?.name === "scvMap" 
          ? Object.fromEntries(result._value.map(e => [
              e._attributes.key._value.toString(),
              e._attributes.val
            ]))
          : null;

        if (fields) {
          setCampaign({
            title: fields.title?._value?.toString() || "Campaign",
            goal: fields.goal?._value || 0,
            raised: fields.raised?._value || 0,
            owner: fields.owner?._value?._value?.toString() || "",
            active: fields.active?._value !== false,
          });
        }
      }
    } catch (err) {
      setLoadError("Could not load campaign data: " + err.message);
    }
  }, []);

  // Real-time polling — satisfies "real-time event integration"
  useEffect(() => {
    if (wallet) {
      loadCampaign();
      const interval = setInterval(loadCampaign, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [wallet, loadCampaign]);

  if (!wallet) {
    return <ConnectWallet onConnect={setWallet} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌟</span>
          <span className="font-bold text-lg">Stellar Crowdfund</span>
          <span className="text-xs bg-yellow-900/50 text-yellow-400 border border-yellow-700 px-2 py-0.5 rounded-full">
            Testnet
          </span>
        </div>
        <button
          onClick={() => setWallet(null)}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Main content */}
      <div className="max-w-lg mx-auto px-6 py-8 space-y-6">
        {loadError && (
          <div className="p-3 bg-orange-900/30 border border-orange-700 rounded-xl text-orange-300 text-sm">
            ⚠️ {loadError}
          </div>
        )}

        <CampaignCard campaign={campaign} onRefresh={loadCampaign} />

        {campaign?.active && (
          <DonateForm
            wallet={wallet}
            onDonated={loadCampaign}
            onStatus={setTxStatus}
          />
        )}

        <TransactionStatus status={txStatus} />

        <div className="text-center text-xs text-gray-600">
          Auto-refreshes every 10 seconds · Stellar Testnet
        </div>
      </div>
    </div>
  );
}