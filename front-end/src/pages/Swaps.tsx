
import React, { useState, useEffect } from 'react';
import SwapCard from '../components/Cards/SwapCard';
import FeedbackModal from '../components/Modals/FeedbackModal';
import { apiClient } from '../lib/api';
import { useAuth } from '@/hooks/useAuth';

interface Swap {
  id: number;
  from_user_id: number;
  to_user_id: number;
  skill_offered_id: number;
  skill_requested_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  from_user_name: string;
  to_user_name: string;
  skill_offered_name: string;
  skill_requested_name: string;
}

const Swaps = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'pending' | 'completed'>('current');
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    swapDetails: any;
  }>({
    isOpen: false,
    swapDetails: null
  });
  
  const { user } = useAuth();

  // Fetch swaps from backend
  useEffect(() => {
    const fetchSwaps = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiClient.getMySwaps();
        
        if (response.error) {
          setError('Failed to load swaps');
          console.error('Error fetching swaps:', response.error);
          setSwaps([]);
        } else {
          setSwaps(response.data || []);
        }
      } catch (err) {
        setError('Failed to load swaps');
        console.error('Error fetching swaps:', err);
        setSwaps([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSwaps();
  }, [user]);

  const getFilteredSwaps = () => {
    switch (activeTab) {
      case 'current':
        return swaps.filter(swap => swap.status === 'accepted');
      case 'pending':
        return swaps.filter(swap => swap.status === 'pending');
      case 'completed':
        return swaps.filter(swap => ['rejected', 'cancelled'].includes(swap.status));
      default:
        return swaps;
    }
  };

  const handleAcceptSwap = async (swapId: number) => {
    try {
      const response = await apiClient.acceptSwap(swapId);
      if (response.error) {
        alert(`Failed to accept swap: ${response.error}`);
      } else {
        alert('Swap accepted successfully!');
        // Refresh the swaps list
        const refreshResponse = await apiClient.getMySwaps();
        if (!refreshResponse.error) {
          setSwaps(refreshResponse.data || []);
        }
      }
    } catch (error) {
      console.error('Error accepting swap:', error);
      alert('Failed to accept swap. Please try again.');
    }
  };

  const handleRejectSwap = async (swapId: number) => {
    try {
      const response = await apiClient.rejectSwap(swapId);
      if (response.error) {
        alert(`Failed to reject swap: ${response.error}`);
      } else {
        alert('Swap rejected successfully!');
        // Refresh the swaps list
        const refreshResponse = await apiClient.getMySwaps();
        if (!refreshResponse.error) {
          setSwaps(refreshResponse.data || []);
        }
      }
    } catch (error) {
      console.error('Error rejecting swap:', error);
      alert('Failed to reject swap. Please try again.');
    }
  };

  const handleCancelSwap = async (swapId: number) => {
    try {
      const response = await apiClient.deleteSwap(swapId);
      if (response.error) {
        alert(`Failed to cancel swap: ${response.error}`);
      } else {
        alert('Swap cancelled successfully!');
        // Refresh the swaps list
        const refreshResponse = await apiClient.getMySwaps();
        if (!refreshResponse.error) {
          setSwaps(refreshResponse.data || []);
        }
      }
    } catch (error) {
      console.error('Error cancelling swap:', error);
      alert('Failed to cancel swap. Please try again.');
    }
  };

  const handleFeedback = (feedback: { rating: number; comment: string }) => {
    console.log('Feedback submitted:', feedback);
  };

  const filteredSwaps = getFilteredSwaps();

  const tabs = [
    { id: 'current', label: 'Current Swaps', count: swaps.filter(s => s.status === 'accepted').length },
    { id: 'pending', label: 'Pending Requests', count: swaps.filter(s => s.status === 'pending').length },
    { id: 'completed', label: 'History', count: swaps.filter(s => ['rejected', 'cancelled'].includes(s.status)).length }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your swaps...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading swaps</h3>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Swaps</h1>
          <p className="text-gray-600 mt-2">Manage your skill exchange requests and history</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                    activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Swap Cards */}
        {filteredSwaps.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">
              {activeTab === 'current' && '🤝'}
              {activeTab === 'pending' && '⏳'}
              {activeTab === 'completed' && '✅'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'current' && 'No active swaps'}
              {activeTab === 'pending' && 'No pending requests'}
              {activeTab === 'completed' && 'No completed swaps'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'current' && 'You don\'t have any active skill swaps right now.'}
              {activeTab === 'pending' && 'You don\'t have any pending swap requests.'}
              {activeTab === 'completed' && 'You haven\'t completed any swaps yet.'}
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Browse Skills
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSwaps.map((swap) => {
              // Determine if current user is the sender or receiver
              const isSender = user?.id === swap.from_user_id;
              const otherUserName = isSender ? swap.to_user_name : swap.from_user_name;
              const mySkill = isSender ? swap.skill_offered_name : swap.skill_requested_name;
              const theirSkill = isSender ? swap.skill_requested_name : swap.skill_offered_name;
              
              return (
                <div key={swap.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Swap with {otherUserName}
                      </h3>
                      <p className="text-gray-600">
                        You teach: <span className="font-medium">{mySkill}</span> | 
                        You learn: <span className="font-medium">{theirSkill}</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        swap.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        swap.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  {swap.status === 'pending' && (
                    <div className="flex space-x-3">
                      {!isSender && (
                        <>
                          <button
                            onClick={() => handleAcceptSwap(swap.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectSwap(swap.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {isSender && (
                        <button
                          onClick={() => handleCancelSwap(swap.id)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={feedbackModal.isOpen}
          onClose={() => setFeedbackModal({ isOpen: false, swapDetails: null })}
          onSubmit={handleFeedback}
          swapDetails={feedbackModal.swapDetails || { otherUser: '', skill: '' }}
        />
      </div>
    </div>
  );
};

export default Swaps;
