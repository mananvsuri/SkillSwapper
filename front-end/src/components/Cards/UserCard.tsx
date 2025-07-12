
import React from 'react';
import { MapPin, Star, MessageCircle, Clock } from 'lucide-react';
// import Badge from '@/components/UI/badge';

interface UserCardProps {
  user: {
    id: number;
    name: string;
    photo_path?: string;
    location?: string;
    rating: number;
    skill_offered?: string;
    skill_wanted?: string;
    level?: string;
    is_online?: boolean;
    availability?: string;
    skills_offered?: Array<{ id: number; name: string; level: string }>;
    skills_wanted?: Array<{ id: number; name: string; level: string }>;
  };
  onRequestSwap: (userId: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onRequestSwap }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {user.photo_path ? (
                <img 
                  src={user.photo_path} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-blue-600 font-semibold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {user.is_online && (
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
          <p className="text-green-700">
            {user.skills_offered && user.skills_offered.length > 0 
              ? user.skills_offered.map(s => s.name).join(', ')
              : user.skill_offered || 'No skills offered'
            }
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-1">Wants</h4>
          <p className="text-blue-700">
            {user.skills_wanted && user.skills_wanted.length > 0 
              ? user.skills_wanted.map(s => s.name).join(', ')
              : user.skill_wanted || 'No skills wanted'
            }
          </p>
        </div>
        {user.availability && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center space-x-1 mb-1">
              <Clock size={14} className="text-purple-600" />
              <h4 className="text-sm font-medium text-purple-800">Availability</h4>
            </div>
            <p className="text-purple-700 text-sm">{user.availability}</p>
          </div>
        )}
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
