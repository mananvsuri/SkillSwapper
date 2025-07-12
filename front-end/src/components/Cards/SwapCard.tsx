
import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface SwapCardProps {
  swap: {
    id: string;
    otherUser: string;
    mySkill: string;
    theirSkill: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
    date: string;
    message?: string;
  };
  onAccept?: (swapId: string) => void;
  onReject?: (swapId: string) => void;
  onCancel?: (swapId: string) => void;
}

const SwapCard: React.FC<SwapCardProps> = ({ swap, onAccept, onReject, onCancel }) => {
  const getStatusIcon = () => {
    switch (swap.status) {
      case 'pending':
        return <Clock size={20} className="text-yellow-500" />;
      case 'accepted':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={20} className="text-red-500" />;
      case 'completed':
        return <CheckCircle size={20} className="text-blue-500" />;
      case 'cancelled':
        return <AlertCircle size={20} className="text-gray-500" />;
      default:
        return <Clock size={20} className="text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (swap.status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'accepted':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'completed':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'cancelled':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{swap.otherUser}</h3>
          <p className="text-sm text-gray-500">{swap.date}</p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium capitalize">{swap.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-1">You teach</h4>
          <p className="text-blue-700">{swap.mySkill}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-green-800 mb-1">You learn</h4>
          <p className="text-green-700">{swap.theirSkill}</p>
        </div>
      </div>

      {swap.message && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700">{swap.message}</p>
        </div>
      )}

      {swap.status === 'pending' && (
        <div className="flex space-x-3">
          {onAccept && (
            <button
              onClick={() => onAccept(swap.id)}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Accept
            </button>
          )}
          {onReject && (
            <button
              onClick={() => onReject(swap.id)}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          )}
          {onCancel && (
            <button
              onClick={() => onCancel(swap.id)}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SwapCard;
