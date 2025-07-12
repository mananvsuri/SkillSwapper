
import React, { useState } from 'react';
import { Users, MessageSquare, AlertTriangle, Ban, Download, Send } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'swaps' | 'reports' | 'broadcast'>('users');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Mock data
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', swaps: 12, rating: 4.8 },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', status: 'active', swaps: 15, rating: 4.9 },
    { id: '3', name: 'Mike Chen', email: 'mike@example.com', status: 'banned', swaps: 3, rating: 2.1 },
    { id: '4', name: 'Lisa Rodriguez', email: 'lisa@example.com', status: 'active', swaps: 8, rating: 4.7 }
  ];

  const swaps = [
    { id: '1', users: ['John Doe', 'Sarah Johnson'], status: 'completed', date: '2024-01-15' },
    { id: '2', users: ['Mike Chen', 'Lisa Rodriguez'], status: 'reported', date: '2024-01-14' },
    { id: '3', users: ['Sarah Johnson', 'Alex Kumar'], status: 'active', date: '2024-01-13' }
  ];

  const reports = [
    { id: '1', reporter: 'Lisa Rodriguez', reported: 'Mike Chen', reason: 'Inappropriate behavior', date: '2024-01-14' },
    { id: '2', reporter: 'John Doe', reported: 'Alex Kumar', reason: 'No-show for swap', date: '2024-01-12' }
  ];

  const handleBanUser = (userId: string) => {
    console.log('Ban user:', userId);
  };

  const handleRejectSkill = (skillId: string) => {
    console.log('Reject skill:', skillId);
  };

  const handleBroadcast = () => {
    if (broadcastMessage.trim()) {
      console.log('Broadcast message:', broadcastMessage);
      setBroadcastMessage('');
    }
  };

  const stats = [
    { label: 'Total Users', value: '1,234', icon: <Users size={24} /> },
    { label: 'Active Swaps', value: '89', icon: <MessageSquare size={24} /> },
    { label: 'Reports', value: '12', icon: <AlertTriangle size={24} /> },
    { label: 'Banned Users', value: '5', icon: <Ban size={24} /> }
  ];

  const tabs = [
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'swaps', label: 'Swaps', icon: <MessageSquare size={20} /> },
    { id: 'reports', label: 'Reports', icon: <AlertTriangle size={20} /> },
    { id: 'broadcast', label: 'Broadcast', icon: <Send size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage platform users, swaps, and content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="text-blue-600">{stat.icon}</div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Download size={16} />
                  <span>Export CSV</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Swaps</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Rating</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{user.swaps}</td>
                        <td className="py-3 px-4">{user.rating}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleBanUser(user.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                            disabled={user.status === 'banned'}
                          >
                            {user.status === 'banned' ? 'Banned' : 'Ban User'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Swaps Tab */}
          {activeTab === 'swaps' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Swap Management</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Swap ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Users</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {swaps.map((swap) => (
                      <tr key={swap.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">#{swap.id}</td>
                        <td className="py-3 px-4">{swap.users.join(' ↔ ')}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            swap.status === 'completed' ? 'bg-green-100 text-green-800' :
                            swap.status === 'reported' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {swap.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{swap.date}</td>
                        <td className="py-3 px-4">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">User Reports</h2>
              
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {report.reporter} reported {report.reported}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{report.reason}</p>
                        <p className="text-xs text-gray-500 mt-2">{report.date}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors">
                          Take Action
                        </button>
                        <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-medium hover:bg-gray-300 transition-colors">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Broadcast Tab */}
          {activeTab === 'broadcast' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Broadcast</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message to All Users
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your message to broadcast to all platform users..."
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleBroadcast}
                    disabled={!broadcastMessage.trim()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send size={16} />
                    <span>Send Broadcast</span>
                  </button>
                  <button
                    onClick={() => setBroadcastMessage('')}
                    className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
