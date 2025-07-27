import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface CoinTrackerProps {
  className?: string;
}

const CoinTracker: React.FC<CoinTrackerProps> = ({ className = '' }) => {
  const [coins, setCoins] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiClient.getUserCoins();
        
        if (response.error) {
          setError('Failed to load coins');
          console.error('Error fetching coins:', response.error);
        } else {
          setCoins(response.data?.coins || 0);
        }
      } catch (err) {
        setError('Failed to load coins');
        console.error('Error fetching coins:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoins();
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
        <span className="text-sm text-gray-600">Loading coins...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-sm text-red-600">Failed to load coins</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <span className="text-yellow-500 text-lg">🪙</span>
        <span className="font-semibold text-gray-900">{coins}</span>
        <span className="text-sm text-gray-600">coins</span>
      </div>
    </div>
  );
};

export default CoinTracker; 