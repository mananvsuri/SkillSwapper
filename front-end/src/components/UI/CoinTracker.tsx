
import React from 'react';
import { Coins, TrendingUp } from 'lucide-react';

interface CoinTrackerProps {
  coins: number;
  showChart?: boolean;
}

const CoinTracker: React.FC<CoinTrackerProps> = ({ coins, showChart = false }) => {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
            <Coins size={24} className="text-yellow-800" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">SwapCoins</h3>
            <p className="text-2xl font-bold text-yellow-700">{coins}</p>
          </div>
        </div>
        
        {showChart && (
          <div className="flex items-center space-x-2 text-green-600">
            <TrendingUp size={20} />
            <span className="text-sm font-medium">+15 this week</span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress to next level</span>
          <span>{coins}/200</span>
        </div>
        <div className="w-full bg-yellow-200 rounded-full h-2">
          <div 
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((coins / 200) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CoinTracker;
