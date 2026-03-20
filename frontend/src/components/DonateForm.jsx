import { useState } from "react";
import * as StellarSdk from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import {
  CONTRACT_ID,
  NETWORK_PASSPHRASE,
  RPC_URL,
  xlmToStroops,
} from "../utils/stellar";

export default function DonateForm({ wallet, onDonated, onStatus }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDonate(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    onStatus({ type: "pending" });

    try {
      const rpc = new StellarSdk.SorobanRpc.Server(RPC_URL);
      const account = await rpc.getAccount(wallet.publicKey);

      const contract = new StellarSdk.Contract(CONTRACT_ID);
      const stroops = xlmToStroops(amount);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: "1000000",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            "donate",
            StellarSdk.Address.fromString(wallet.publicKey).toScVal(),
            StellarSdk.nativeToScVal(stroops, { type: "i128" })
          )
        )
        .setTimeout(30)
        .build();

      // Simulate first
      const simResult = await rpc.simulateTransaction(tx);
      if (StellarSdk.SorobanRpc.Api.isSimulationError(simResult)) {
        // Error type: Simulation failure
        throw new Error(`Simulation failed: ${simResult.error}`);
      }

      // Assemble with soroban data
      const assembled = StellarSdk.SorobanRpc.assembleTransaction(tx, simResult).build();

      // Sign with wallet
      let signedXdr;
      if (wallet.walletId === "freighter") {
        signedXdr = await signTransaction(assembled.toXDR(), {
          networkPassphrase: NETWORK_PASSPHRASE,
        });
      } else {
        throw new Error("Only Freighter signing implemented. Add xBull/Rabet signing here.");
      }

      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        NETWORK_PASSPHRASE
      );

      // Submit
      const sendResult = await rpc.sendTransaction(signedTx);
      if (sendResult.status === "ERROR") {
        throw new Error("Transaction submission failed");
      }

      // Poll for confirmation
      let finalStatus = sendResult.status;
      let attempts = 0;
      while (finalStatus !== "SUCCESS" && finalStatus !== "FAILED" && attempts < 20) {
        await new Promise((r) => setTimeout(r, 2000));
        const check = await rpc.getTransaction(sendResult.hash);
        finalStatus = check.status;
        attempts++;
      }

      if (finalStatus === "SUCCESS") {
        onStatus({ type: "success", hash: sendResult.hash });
        onDonated();
        setAmount("");
      } else {
        // Error type: Transaction failure
        throw new Error("Transaction failed on-chain");
      }
    } catch (err) {
      onStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
      <h3 className="text-white font-bold text-lg mb-4">Make a Donation</h3>

      <form onSubmit={handleDonate} className="space-y-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">
            Amount (XLM)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10"
              min="0.1"
              step="0.1"
              required
              className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 
                         text-white focus:outline-none focus:border-blue-500"
            />
            <span className="flex items-center text-gray-400 font-semibold">XLM</span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["5", "10", "25", "50"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(v)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 
                         rounded-lg text-sm transition-colors"
            >
              {v} XLM
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || !amount}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 
                     disabled:text-gray-500 text-white font-semibold rounded-xl 
                     transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            `Donate ${amount ? amount + " XLM" : ""}`
          )}
        </button>
      </form>

      <div className="mt-3 text-xs text-gray-500 text-center">
        Connected: {wallet.publicKey.slice(0, 8)}...{wallet.publicKey.slice(-4)} ({wallet.walletId})
      </div>
    </div>
  );
}