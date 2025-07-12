
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, MapPin, Star } from 'lucide-react';
import Badge from '../components/UI/Badge';
import CoinTracker from '../components/UI/CoinTracker';
import SkillForm from '../components/Forms/SkillForm';

const Dashboard = () => {
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [profileVisible, setProfileVisible] = useState(true);

  // Mock user data
  const user = {
    name: "John Doe",
    email: "john@example.com",
    location: "New York, NY",
    photo: null,
    rating: 4.8,
    totalSwaps: 12,
    coins: 150
  };

  const [skills, setSkills] = useState([
    {
      id: '1',
      name: 'Photoshop',
      type: 'offered' as const,
      level: 'Pro' as const,
      description: 'Advanced photo editing and design'
    },
    {
      id: '2',
      name: 'Excel',
      type: 'wanted' as const,
      level: 'Beginner' as const,
      description: 'Want to learn advanced formulas'
    },
    {
      id: '3',
      name: 'Guitar',
      type: 'offered' as const,
      level: 'Intermediate' as const,
      description: 'Acoustic guitar lessons'
    }
  ]);

  const handleAddSkill = (skillData: any) => {
    const newSkill = {
      ...skillData,
      id: Date.now().toString()
    };
    setSkills([...skills, newSkill]);
    setShowSkillForm(false);
  };

  const handleEditSkill = (skillData: any) => {
    setSkills(skills.map(skill => 
      skill.id === editingSkill.id ? { ...skill, ...skillData } : skill
    ));
    setEditingSkill(null);
    setShowSkillForm(false);
  };

  const handleDeleteSkill = (skillId: string) => {
    setSkills(skills.filter(skill => skill.id !== skillId));
  };

  const offeredSkills = skills.filter(skill => skill.type === 'offered');
  const wantedSkills = skills.filter(skill => skill.type === 'wanted');

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
                  onClick={() => setProfileVisible(!profileVisible)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                    profileVisible 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {profileVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                  <span>{profileVisible ? 'Public' : 'Private'}</span>
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {user.photo ? (
                    <img 
                      src={user.photo} 
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

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="text-lg font-semibold text-gray-900">{user.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">{user.totalSwaps}</p>
                  <p className="text-sm text-gray-600">Swaps</p>
                </div>
              </div>

              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                <Edit size={16} />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* SwapCoins */}
            <CoinTracker coins={user.coins} showChart={true} />
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

                  {offeredSkills.length === 0 ? (
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

                  {wantedSkills.length === 0 ? (
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
