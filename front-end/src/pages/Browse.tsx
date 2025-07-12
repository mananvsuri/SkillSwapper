
import React, { useState, useEffect } from 'react';
import SearchBar from '../components/Forms/SearchBar';
import UserCard from '../components/Cards/UserCard';
import { apiClient } from '../lib/api';
import { useAuth } from '@/hooks/useAuth';

interface Skill {
  id: number;
  name: string;
  level: string;
  type: 'offered' | 'wanted';
}

interface User {
  id: number;
  name: string;
  email: string;
  location?: string;
  photo_path?: string;
  rating?: number;
  skill_offered?: string;
  skill_wanted?: string;
  level?: string;
  is_online?: boolean;
  skills_offered?: Skill[];
  skills_wanted?: Skill[];
}

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
  mySkills: Skill[];
  onSendRequest: (swapData: {
    to_user_id: number;
    skill_offered_id: number;
    skill_requested_id: number;
  }) => void;
}

const SwapRequestModal: React.FC<SwapRequestModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  mySkills,
  onSendRequest
}) => {
  const [selectedMySkill, setSelectedMySkill] = useState<number | null>(null);
  const [selectedTargetSkill, setSelectedTargetSkill] = useState<number | null>(null);

  // Only show offered skills for both users
  const myOfferedSkills = mySkills.filter((s) => s.type === 'offered');
  const targetOfferedSkills = targetUser?.skills_offered || [];

  const handleSendRequest = async () => {
    console.log('Send Request clicked', selectedMySkill, selectedTargetSkill, targetUser);
    if (!selectedMySkill || !selectedTargetSkill || !targetUser) return;
    onSendRequest({
      to_user_id: targetUser.id,
      skill_offered_id: selectedMySkill,
      skill_requested_id: selectedTargetSkill,
    });
    onClose();
  };

  if (!isOpen || !targetUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Request Swap with {targetUser.name}</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Your Offered Skill</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedMySkill ?? ''}
            onChange={(e) => setSelectedMySkill(Number(e.target.value))}
          >
            <option value="">Select a skill</option>
            {myOfferedSkills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name} ({skill.level})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Skill You Want from {targetUser.name}</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedTargetSkill ?? ''}
            onChange={(e) => setSelectedTargetSkill(Number(e.target.value))}
          >
            <option value="">Select a skill</option>
            {targetOfferedSkills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name} ({skill.level})
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSendRequest}
            disabled={!selectedMySkill || !selectedTargetSkill}
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
};

const Browse = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [mySkills, setMySkills] = useState<Skill[]>([]);
  
  const { user } = useAuth();

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiClient.getPublicUsers();
        
        if (response.error) {
          setError('Failed to load users');
          console.error('Error fetching users:', response.error);
          setUsers([]);
        } else {
          // Transform the backend data to match our frontend interface
          const transformedUsers: User[] = (response.data || [])
            .filter((userData: any) => {
              // Filter out the current user and only show public profiles
              return userData.is_public && userData.id !== user?.id;
            })
            .map((userData: any) => ({
              id: userData.id,
              name: userData.name,
              email: '', // Not provided by public endpoint for privacy
              location: userData.location || '',
              photo_path: userData.photo_path,
              rating: 0, // Will be added when rating system is implemented
              skill_offered: userData.skills_offered?.map((s: any) => s.name).join(', ') || '',
              skill_wanted: userData.skills_wanted?.map((s: any) => s.name).join(', ') || '',
              level: 'Intermediate', // Default level, will be enhanced later
              is_online: false, // Will be implemented when online status is added
              skills_offered: userData.skills_offered || [],
              skills_wanted: userData.skills_wanted || []
            }));
          
          setUsers(transformedUsers);
          setFilteredUsers(transformedUsers);
        }
      } catch (err) {
        setError('Failed to load users');
        console.error('Error fetching users:', err);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  // Fetch my skills when user is logged in
  useEffect(() => {
    const fetchMySkills = async () => {
      if (!user) return;
      
      try {
        const response = await apiClient.getMySkills();
        if (!response.error && response.data) {
          setMySkills(response.data);
        }
      } catch (error) {
        console.error('Error fetching my skills:', error);
      }
    };

    fetchMySkills();
  }, [user]);

  const handleSearch = (query: string, filters: any) => {
    let filtered = users;

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(user => 
        (user.skill_offered?.toLowerCase().includes(query.toLowerCase()) || false) ||
        (user.skill_wanted?.toLowerCase().includes(query.toLowerCase()) || false) ||
        user.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(user => 
        user.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by level
    if (filters.level && filters.level !== 'all') {
      filtered = filtered.filter(user => user.level === filters.level);
    }

    setFilteredUsers(filtered);
  };

  const handleRequestSwap = (userId: number) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      setSelectedUser(targetUser);
      setShowSwapModal(true);
    }
  };

  const handleSendRequest = async (swapData: {
    to_user_id: number;
    skill_offered_id: number;
    skill_requested_id: number;
  }) => {
    try {
      const response = await apiClient.createSwap(swapData);
      if (response.error) {
        alert(`Failed to send request: ${response.error}`);
      } else {
        alert('Swap request sent successfully!');
      }
    } catch (error) {
      console.error('Error sending swap request:', error);
      alert('Failed to send swap request. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
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
          <h1 className="text-3xl font-bold text-gray-900">Browse Skills</h1>
          <p className="text-gray-600 mt-2">Find people to exchange skills with in your community</p>
        </div>

        <SearchBar onSearch={handleSearch} />

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing {filteredUsers.length} of {users.length} people
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Rating (High to Low)</option>
                <option>Distance (Near to Far)</option>
                <option>Recently Active</option>
                <option>Most Swaps</option>
              </select>
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={{
                  id: user.id.toString(),
                  name: user.name,
                  photo: user.photo_path,
                  location: user.location || '',
                  rating: user.rating || 0,
                  skillOffered: user.skill_offered || '',
                  skillWanted: user.skill_wanted || '',
                  level: (user.level as 'Beginner' | 'Intermediate' | 'Pro') || 'Intermediate',
                  isOnline: user.is_online || false
                }}
                onRequestSwap={handleRequestSwap}
              />
            ))}
          </div>
        )}

        {/* Load more button */}
        {filteredUsers.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Load More Results
            </button>
          </div>
        )}
      </div>

      {/* Swap Request Modal */}
      <SwapRequestModal
        isOpen={showSwapModal}
        onClose={() => {
          setShowSwapModal(false);
          setSelectedUser(null);
        }}
        targetUser={selectedUser}
        mySkills={mySkills}
        onSendRequest={handleSendRequest}
      />
    </div>
  );
};

export default Browse;
