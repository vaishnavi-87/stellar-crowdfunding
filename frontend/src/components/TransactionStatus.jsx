export default function TransactionStatus({ status }) {
  if (!status) return null;

  const configs = {
    pending: {
      bg: "bg-yellow-900/30 border-yellow-700",
      text: "text-yellow-300",
      icon: "⏳",
      label: "Transaction pending...",
    },
    success: {
      bg: "bg-green-900/30 border-green-700",
      text: "text-green-300",
      icon: "✅",
      label: "Transaction confirmed!",
    },
    error: {
      bg: "bg-red-900/30 border-red-700",
      text: "text-red-300",
      icon: "❌",
      label: "Transaction failed",
    },
  };

  const cfg = configs[status.type] || configs.error;

  return (
    <div className={`p-4 rounded-xl border ${cfg.bg} ${cfg.text}`}>
      <div className="flex items-center gap-2 font-semibold mb-1">
        <span>{cfg.icon}</span>
        <span>{cfg.label}</span>
      </div>

      {status.hash && (
        <div className="mt-2">
          <div className="text-xs opacity-70 mb-1">Transaction hash:</div>
          <div className="font-mono text-xs break-all opacity-90">{status.hash}</div>
          
            href={`https://stellar.expert/explorer/testnet/tx/${status.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-xs underline opacity-80 hover:opacity-100"
          
            View on Stellar Explorer ↗
          
        </div>
      )}

      {status.message && (
        <div className="text-xs mt-2 opacity-80">{status.message}</div>
      )}
    </div>
  );
}