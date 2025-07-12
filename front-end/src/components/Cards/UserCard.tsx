
import React from 'react';
import { MapPin, Star, MessageCircle } from 'lucide-react';
// import Badge from '@/components/UI/badge';


interface UserCardProps {
  user: {
    id: string;
    name: string;
    photo?: string;
    location?: string;
    rating: number;
    skillOffered: string;
    skillWanted: string;
    level: 'Beginner' | 'Intermediate' | 'Pro';
    isOnline?: boolean;
  };
  onRequestSwap: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onRequestSwap }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {user.photo ? (
                <img 
                  src={user.photo} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-blue-600 font-semibold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user.name}</h3>
            {user.location && (
              <div className="flex items-center space-x-1 text-gray-500 text-sm">
                <MapPin size={14} />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-green-800 mb-1">Offers</h4>
          <p className="text-green-700">{user.skillOffered}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-1">Wants</h4>
          <p className="text-blue-700">{user.skillWanted}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 text-gray-600">
          <Star size={16} className="text-yellow-500 fill-current" />
          <span className="text-sm font-medium">{user.rating.toFixed(1)}</span>
        </div>
        <button
          onClick={() => onRequestSwap(user.id)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1"
        >
          <MessageCircle size={16} />
          <span>Request Swap</span>
        </button>
      </div>
    </div>
  );
};

export default UserCard;
