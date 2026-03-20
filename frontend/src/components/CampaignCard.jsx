import { stroopsToXLM } from "../utils/stellar";

export default function CampaignCard({ campaign, onRefresh }) {
  if (!campaign) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-700 rounded w-1/2" />
      </div>
    );
  }

  const raised = Number(campaign.raised);
  const goal = Number(campaign.goal);
  const percent = Math.min((raised / goal) * 100, 100).toFixed(1);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">{campaign.title}</h2>
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              campaign.active
                ? "bg-green-900/50 text-green-400 border border-green-700"
                : "bg-gray-700 text-gray-400"
            }`}
          >
            {campaign.active ? "● Active" : "● Closed"}
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="text-gray-400 hover:text-white transition-colors text-sm"
          title="Refresh"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Raised: {stroopsToXLM(raised)} XLM</span>
          <span>Goal: {stroopsToXLM(goal)} XLM</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-right text-xs text-gray-400 mt-1">{percent}%</div>
      </div>

      <div className="text-xs text-gray-500 font-mono truncate">
        Owner: {campaign.owner}
      </div>
    </div>
  );
}