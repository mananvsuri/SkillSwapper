
import React, { useState } from 'react';
import SwapCard from '../components/Cards/SwapCard';
import FeedbackModal from '../components/Modals/FeedbackModal';

const Swaps = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'pending' | 'completed'>('current');
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    swapDetails: any;
  }>({
    isOpen: false,
    swapDetails: null
  });

  const [swaps] = useState([
    {
      id: '1',
      otherUser: 'Sarah Johnson',
      mySkill: 'Guitar Lessons',
      theirSkill: 'Photoshop Design',
      status: 'accepted' as const,
      date: '2024-01-15',
      message: 'Looking forward to learning design from you!'
    },
    {
      id: '2',
      otherUser: 'Mike Chen',
      mySkill: 'Spanish Tutoring',
      theirSkill: 'Excel Training',
      status: 'pending' as const,
      date: '2024-01-14',
      message: 'I can teach you advanced Excel formulas and pivot tables.'
    },
    {
      id: '3',
      otherUser: 'Lisa Rodriguez',
      mySkill: 'Photography Basics',
      theirSkill: 'Cooking (Mexican)',
      status: 'completed' as const,
      date: '2024-01-10',
      message: 'Great cooking session! Learned so much about authentic Mexican dishes.'
    },
    {
      id: '4',
      otherUser: 'David Park',
      mySkill: 'Web Development',
      theirSkill: 'Piano Lessons',
      status: 'cancelled' as const,
      date: '2024-01-08',
      message: 'Had to cancel due to schedule conflicts.'
    },
    {
      id: '5',
      otherUser: 'Emma Thompson',
      mySkill: 'French Language',
      theirSkill: 'Yoga Classes',
      status: 'completed' as const,
      date: '2024-01-05',
      message: 'Amazing yoga sessions! Very relaxing and informative.'
    }
  ]);

  const getFilteredSwaps = () => {
    switch (activeTab) {
      case 'current':
        return swaps.filter(swap => ['accepted'].includes(swap.status));
      case 'pending':
        return swaps.filter(swap => ['pending'].includes(swap.status));
      case 'completed':
        return swaps.filter(swap => ['completed', 'cancelled', 'rejected'].includes(swap.status));
      default:
        return swaps;
    }
  };

  const handleAcceptSwap = (swapId: string) => {
    console.log('Accept swap:', swapId);
  };

  const handleRejectSwap = (swapId: string) => {
    console.log('Reject swap:', swapId);
  };

  const handleCancelSwap = (swapId: string) => {
    console.log('Cancel swap:', swapId);
  };

  const handleFeedback = (feedback: { rating: number; comment: string }) => {
    console.log('Feedback submitted:', feedback);
  };

  const filteredSwaps = getFilteredSwaps();

  const tabs = [
    { id: 'current', label: 'Current Swaps', count: swaps.filter(s => s.status === 'accepted').length },
    { id: 'pending', label: 'Pending Requests', count: swaps.filter(s => s.status === 'pending').length },
    { id: 'completed', label: 'History', count: swaps.filter(s => ['completed', 'cancelled', 'rejected'].includes(s.status)).length }
  ];

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
            {filteredSwaps.map((swap) => (
              <SwapCard
                key={swap.id}
                swap={swap}
                onAccept={swap.status === 'pending' ? handleAcceptSwap : undefined}
                onReject={swap.status === 'pending' ? handleRejectSwap : undefined}
                onCancel={swap.status === 'pending' ? handleCancelSwap : undefined}
              />
            ))}

            {/* Emergency Replacement Suggestion */}
            {activeTab === 'current' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  ⚠️ Swap Cancelled
                </h3>
                <p className="text-yellow-700 mb-4">
                  Your swap with Alex Kumar was cancelled. Here are some suggested matches:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Maria Garcia', 'Tom Wilson', 'Jennifer Lee'].map((name, index) => (
                    <div key={index} className="bg-white border border-yellow-300 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{name}</h4>
                      <p className="text-sm text-gray-600 mb-2">Programming (Python)</p>
                      <button className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
                        Request Swap
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
