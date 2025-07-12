
import React, { useState } from 'react';
import SearchBar from '../components/Forms/SearchBar';
import UserCard from '../components/Cards/UserCard';

const Browse = () => {
  const [users] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      photo: undefined,
      location: 'Brooklyn, NY',
      rating: 4.9,
      skillOffered: 'Advanced Photoshop & Design',
      skillWanted: 'Guitar Lessons',
      level: 'Pro' as const,
      isOnline: true
    },
    {
      id: '2',
      name: 'Mike Chen',
      photo: undefined,
      location: 'Manhattan, NY',
      rating: 4.7,
      skillOffered: 'Excel & Data Analysis',
      skillWanted: 'Spanish Conversation',
      level: 'Intermediate' as const,
      isOnline: false
    },
    {
      id: '3',
      name: 'Lisa Rodriguez',
      photo: undefined,
      location: 'Queens, NY',
      rating: 4.8,
      skillOffered: 'Cooking (Mexican Cuisine)',
      skillWanted: 'Website Development',
      level: 'Intermediate' as const,
      isOnline: true
    },
    {
      id: '4',
      name: 'David Park',
      photo: undefined,
      location: 'Bronx, NY',
      rating: 4.6,
      skillOffered: 'Piano Lessons',
      skillWanted: 'Photography Basics',
      level: 'Pro' as const,
      isOnline: true
    },
    {
      id: '5',
      name: 'Emma Thompson',
      photo: undefined,
      location: 'Staten Island, NY',
      rating: 4.9,
      skillOffered: 'Yoga & Meditation',
      skillWanted: 'French Language',
      level: 'Pro' as const,
      isOnline: false
    },
    {
      id: '6',
      name: 'Alex Kumar',
      photo: undefined,
      location: 'Manhattan, NY',
      rating: 4.5,
      skillOffered: 'Programming (Python)',
      skillWanted: 'Public Speaking',
      level: 'Intermediate' as const,
      isOnline: true
    }
  ]);

  const [filteredUsers, setFilteredUsers] = useState(users);

  const handleSearch = (query: string, filters: any) => {
    let filtered = users;

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(user => 
        user.skillOffered.toLowerCase().includes(query.toLowerCase()) ||
        user.skillWanted.toLowerCase().includes(query.toLowerCase()) ||
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

  const handleRequestSwap = (userId: string) => {
    console.log('Request swap with user:', userId);
    // This would typically open a modal or navigate to a request form
  };

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
                user={user}
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
    </div>
  );
};

export default Browse;
