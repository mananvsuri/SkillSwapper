
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Edit, Plus, Trash2, MapPin, Star, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import SkillForm from '@/components/Forms/SkillForm';
import CoinTracker from '@/components/UI/CoinTracker';
import Badge from '@/components/UI/badge';
import RatingModal from '@/components/Modals/RatingModal';

interface UserStats {
  rating: number;
  totalSwaps: number;
  coins: number;
}

interface Skill {
  id: number;
  name: string;
  type: 'offered' | 'wanted';
  level: 'Beginner' | 'Intermediate' | 'Pro';
  description?: string;
  user_id: number;
}

interface Swap {
  id: number;
  from_user_id: number;
  to_user_id: number;
  skill_offered_id: number;
  skill_requested_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  from_user_name: string;
  to_user_name: string;
  skill_offered_name: string;
  skill_requested_name: string;
}

const Dashboard = () => {
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [profileVisible, setProfileVisible] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [availability, setAvailability] = useState<string>('');
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    rating: 0,
    totalSwaps: 0,
    coins: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [isCreatingSkill, setIsCreatingSkill] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Swaps state
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [isLoadingSwaps, setIsLoadingSwaps] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState<Swap | null>(null);
  const [isCompletingSwap, setIsCompletingSwap] = useState(false);
  
  const { user, isLoadingUser } = useAuth();

  // Fetch user stats and swap coins
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        setIsLoadingStats(true);
        
        const statsResponse = await apiClient.getUserStats();
        if (statsResponse.error) {
          console.error('Error fetching user stats:', statsResponse.error);
          // Fallback to basic stats
          const coinsResponse = await apiClient.getUserCoins();
          setUserStats({
            rating: 0,
            totalSwaps: 0,
            coins: coinsResponse.data?.coins || 0
          });
        } else {
          setUserStats({
            rating: statsResponse.data?.rating || 0,
            totalSwaps: statsResponse.data?.total_swaps || 0,
            coins: statsResponse.data?.coins || 0
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
        // Fallback to basic stats
        const coinsResponse = await apiClient.getUserCoins();
        setUserStats({
          rating: 0,
          totalSwaps: 0,
          coins: coinsResponse.data?.coins || 0
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchUserStats();
  }, [user]);

  // Set initial availability from user data
  useEffect(() => {
    if (user?.availability) {
      setAvailability(user.availability);
    }
  }, [user]);

  // Fetch user skills from backend
  useEffect(() => {
    const fetchSkills = async () => {
      if (!user) return;
      
      try {
        setIsLoadingSkills(true);
        const response = await apiClient.getMySkills();
        
        if (response.error) {
          console.error('Error fetching skills:', response.error);
          setSkills([]);
        } else {
          setSkills(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
        setSkills([]);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchSkills();
  }, [user]);

  // Fetch user swaps
  useEffect(() => {
    const fetchSwaps = async () => {
      if (!user) return;
      
      try {
        setIsLoadingSwaps(true);
        const response = await apiClient.getMySwaps();
        
        if (response.error) {
          console.error('Error fetching swaps:', response.error);
          setSwaps([]);
        } else {
          setSwaps(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching swaps:', error);
        setSwaps([]);
      } finally {
        setIsLoadingSwaps(false);
      }
    };

    fetchSwaps();
  }, [user]);

  // Swap management functions
  const handleAcceptSwap = async (swapId: number) => {
    try {
      const response = await apiClient.acceptSwap(swapId);
      if (response.error) {
        alert(`Failed to accept swap: ${response.error}`);
      } else {
        // Refresh swaps
        const swapsResponse = await apiClient.getMySwaps();
        if (!swapsResponse.error) {
          setSwaps(swapsResponse.data || []);
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
        // Refresh swaps
        const swapsResponse = await apiClient.getMySwaps();
        if (!swapsResponse.error) {
          setSwaps(swapsResponse.data || []);
        }
      }
    } catch (error) {
      console.error('Error rejecting swap:', error);
      alert('Failed to reject swap. Please try again.');
    }
  };

  const handleCompleteSwap = async (swapId: number) => {
    try {
      setIsCompletingSwap(true);
      const response = await apiClient.completeSwap(swapId);
      if (response.error) {
        alert(`Failed to complete swap: ${response.error}`);
      } else {
        // Refresh swaps and user stats
        const swapsResponse = await apiClient.getMySwaps();
        if (!swapsResponse.error) {
          setSwaps(swapsResponse.data || []);
        }
        
        // Refresh user stats to update total swaps and coins
        const statsResponse = await apiClient.getUserStats();
        if (!statsResponse.error) {
          setUserStats({
            rating: statsResponse.data?.rating || 0,
            totalSwaps: statsResponse.data?.total_swaps || 0,
            coins: statsResponse.data?.coins || 0
          });
        }
        
        alert('Swap completed! Both users received 5 coins.');
      }
    } catch (error) {
      console.error('Error completing swap:', error);
      alert('Failed to complete swap. Please try again.');
    } finally {
      setIsCompletingSwap(false);
    }
  };

  const handleRateSwap = async (ratingData: {
    to_user_id: number;
    stars: number;
    feedback?: string;
  }) => {
    if (!selectedSwap || !user) return { error: 'No swap selected' };
    
    try {
      // Set the correct to_user_id based on the swap
      const otherUserId = selectedSwap.to_user_id === user.id ? 
        selectedSwap.from_user_id : selectedSwap.to_user_id;
      
      const response = await apiClient.rateSwap(selectedSwap.id, {
        ...ratingData,
        to_user_id: otherUserId
      });
      
      if (response.error) {
        return { error: response.error };
      } else {
        // Refresh swaps and user stats
        const swapsResponse = await apiClient.getMySwaps();
        if (!swapsResponse.error) {
          setSwaps(swapsResponse.data || []);
        }
        
        // Refresh user stats to update rating
        const statsResponse = await apiClient.getUserStats();
        if (!statsResponse.error) {
          setUserStats({
            rating: statsResponse.data?.rating || 0,
            totalSwaps: statsResponse.data?.total_swaps || 0,
            coins: statsResponse.data?.coins || 0
          });
        }
        
        return null;
      }
    } catch (error) {
      console.error('Error rating swap:', error);
      return { error: 'Failed to submit rating' };
    }
  };

  const openRatingModal = (swap: Swap) => {
    setSelectedSwap(swap);
    setShowRatingModal(true);
  };

  const handleAddSkill = async (skillData: any) => {
    try {
      setIsCreatingSkill(true);
      
      const response = await apiClient.createSkill({
        name: skillData.name,
        type: skillData.type,
        level: skillData.level
      });
      
      if (response.error) {
        console.error('Error creating skill:', response.error);
        alert('Failed to create skill. Please try again.');
        return;
      }
      
      // Add the new skill to the local state
      const newSkill: Skill = {
        ...response.data,
        description: skillData.description
      };
      setSkills([...skills, newSkill]);
      setShowSkillForm(false);
    } catch (error) {
      console.error('Error creating skill:', error);
      alert('Failed to create skill. Please try again.');
    } finally {
      setIsCreatingSkill(false);
    }
  };

  const handleEditSkill = async (skillData: any) => {
    // TODO: Implement edit skill API call
    // For now, we'll just update the local state
    setSkills(skills.map(skill => 
      skill.id === editingSkill?.id ? { ...skill, ...skillData } : skill
    ));
    setEditingSkill(null);
    setShowSkillForm(false);
  };

  const handleDeleteSkill = async (skillId: number) => {
    // TODO: Implement delete skill API call
    // For now, we'll just update the local state
    setSkills(skills.filter(skill => skill.id !== skillId));
  };

  const handleToggleProfileVisibility = async () => {
    if (!user) return;
    
    try {
      setIsUpdatingProfile(true);
      
      const newVisibility = !profileVisible;
      const response = await apiClient.updateProfileVisibility(newVisibility);
      
      if (response.error) {
        alert(`Failed to update profile visibility: ${response.error}`);
      } else {
        setProfileVisible(newVisibility);
        alert(`Profile is now ${newVisibility ? 'public' : 'private'}`);
      }
      
    } catch (error) {
      console.error('Error updating profile visibility:', error);
      alert('Failed to update profile visibility. Please try again.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdateAvailability = async () => {
    if (!user) return;
    
    try {
      setIsUpdatingAvailability(true);
      
      const response = await apiClient.updateAvailability(availability);
      
      if (response.error) {
        alert(`Failed to update availability: ${response.error}`);
      } else {
        setShowAvailabilityForm(false);
        alert('Availability updated successfully!');
      }
      
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability. Please try again.');
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const offeredSkills = skills.filter(skill => skill.type === 'offered');
  const wantedSkills = skills.filter(skill => skill.type === 'wanted');

  // Show loading state while user data is being fetched
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no user data
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Not logged in</h2>
            <p className="text-gray-600">Please log in to view your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your profile and skills</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
                <button
                  onClick={handleToggleProfileVisibility}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                    profileVisible 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mx-auto"></div>
                  ) : (
                    <>
                      {profileVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                      <span>{profileVisible ? 'Public' : 'Private'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {user.photo_path ? (
                    <img 
                      src={user.photo_path} 
                      alt={user.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-bold text-2xl">
                      {user.name.charAt(0)}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
                {user.location && (
                  <div className="flex items-center justify-center space-x-1 text-gray-500 mt-2">
                    <MapPin size={16} />
                    <span className="text-sm">{user.location}</span>
                  </div>
                )}
              </div>

              {/* Availability Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Availability</h4>
                  <button
                    onClick={() => setShowAvailabilityForm(!showAvailabilityForm)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showAvailabilityForm ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                
                {showAvailabilityForm ? (
                  <div className="space-y-3">
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select availability...</option>
                      <option value="Weekends">Weekends</option>
                      <option value="Weekdays">Weekdays</option>
                      <option value="Evenings">Evenings</option>
                      <option value="Mornings">Mornings</option>
                      <option value="Flexible">Flexible</option>
                      <option value="Weekends & Evenings">Weekends & Evenings</option>
                      <option value="Weekdays & Evenings">Weekdays & Evenings</option>
                      <option value="Not Available">Not Available</option>
                    </select>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateAvailability}
                        disabled={isUpdatingAvailability}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isUpdatingAvailability ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setShowAvailabilityForm(false)}
                        className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    {availability || 'Not set'}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="text-lg font-semibold text-gray-900">
                      {isLoadingStats ? '...' : userStats.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">
                    {isLoadingStats ? '...' : userStats.totalSwaps}
                  </p>
                  <p className="text-sm text-gray-600">Swaps</p>
                </div>
              </div>

              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                <Edit size={16} />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* SwapCoins */}
            <CoinTracker coins={userStats.coins} showChart={true} />
          </div>

          {/* Right Column - Skills */}
          <div className="lg:col-span-2 space-y-6">
            {showSkillForm ? (
              <SkillForm
                onSubmit={editingSkill ? handleEditSkill : handleAddSkill}
                onCancel={() => {
                  setShowSkillForm(false);
                  setEditingSkill(null);
                }}
                initialData={editingSkill}
              />
            ) : (
              <>
                {/* Skills Offered */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Skills I Offer</h2>
                    <button
                      onClick={() => setShowSkillForm(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Add Skill</span>
                    </button>
                  </div>

                  {isLoadingSkills ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading skills...</p>
                    </div>
                  ) : offeredSkills.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No skills offered yet</p>
                      <button
                        onClick={() => setShowSkillForm(true)}
                        className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Add your first skill
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {offeredSkills.map((skill) => (
                        <div key={skill.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-green-800">{skill.name}</h3>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  setEditingSkill(skill);
                                  setShowSkillForm(true);
                                }}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteSkill(skill.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <Badge level={skill.level} size="sm" />
                          {skill.description && (
                            <p className="text-sm text-green-700 mt-2">{skill.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skills Wanted */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Skills I Want</h2>
                    <button
                      onClick={() => setShowSkillForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Add Skill</span>
                    </button>
                  </div>

                  {isLoadingSkills ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading skills...</p>
                    </div>
                  ) : wantedSkills.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No skills wanted yet</p>
                      <button
                        onClick={() => setShowSkillForm(true)}
                        className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Add skills you want to learn
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wantedSkills.map((skill) => (
                        <div key={skill.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-blue-800">{skill.name}</h3>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  setEditingSkill(skill);
                                  setShowSkillForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteSkill(skill.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <Badge level={skill.level} size="sm" />
                          {skill.description && (
                            <p className="text-sm text-blue-700 mt-2">{skill.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Swaps Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">My Swaps</h2>
              
              {isLoadingSwaps ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading swaps...</p>
                </div>
              ) : swaps.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No swaps yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start browsing to find people to swap skills with</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {swaps.map((swap) => {
                    const isIncoming = swap.to_user_id === user?.id;
                    const otherUserName = isIncoming ? swap.from_user_name : swap.to_user_name;
                    const isAccepted = swap.status === 'accepted';
                    const isCompleted = swap.status === 'completed';
                    const isPending = swap.status === 'pending';
                    
                    return (
                      <div key={swap.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                {isIncoming ? 'Incoming' : 'Outgoing'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isCompleted ? 'bg-green-100 text-green-700' :
                                isAccepted ? 'bg-blue-100 text-blue-700' :
                                isPending ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {swap.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">{otherUserName}</span>
                              {isIncoming ? ' wants to swap ' : ' will swap '}
                              <span className="font-medium">{swap.skill_offered_name}</span>
                              {' for '}
                              <span className="font-medium">{swap.skill_requested_name}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {isPending && isIncoming && (
                              <>
                                <button
                                  onClick={() => handleAcceptSwap(swap.id)}
                                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRejectSwap(swap.id)}
                                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            
                            {isAccepted && (
                              <button
                                onClick={() => handleCompleteSwap(swap.id)}
                                disabled={isCompletingSwap}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                              >
                                {isCompletingSwap ? 'Completing...' : 'Complete Swap'}
                              </button>
                            )}
                            
                            {isCompleted && (
                              <button
                                onClick={() => openRatingModal(swap)}
                                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                              >
                                Rate Swap
                              </button>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1 text-gray-400">
                            {isCompleted && <CheckCircle size={16} className="text-green-500" />}
                            {isAccepted && <Clock size={16} className="text-blue-500" />}
                            {isPending && <Clock size={16} className="text-yellow-500" />}
                            {swap.status === 'rejected' && <XCircle size={16} className="text-red-500" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating Modal */}
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedSwap(null);
          }}
          swapId={selectedSwap?.id || 0}
          targetUserName={selectedSwap ? 
            (selectedSwap.to_user_id === user?.id ? selectedSwap.from_user_name : selectedSwap.to_user_name) : 
            ''
          }
          onRate={handleRateSwap}
        />
      </div>
    </div>
  );
};

export default Dashboard;
