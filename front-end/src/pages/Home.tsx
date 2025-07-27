
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, MessageSquare, Award, ArrowRight, CheckCircle } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Search size={24} />,
      title: "Find Skills",
      description: "Search for people who can teach you new skills in your area"
    },
    {
      icon: <Users size={24} />,
      title: "Connect",
      description: "Connect with neighbors and community members to exchange knowledge"
    },
    {
      icon: <MessageSquare size={24} />,
      title: "Swap Skills",
      description: "Exchange your expertise for something you want to learn"
    },
    {
      icon: <Award size={24} />,
      title: "Earn Coins",
      description: "Complete swaps to earn SwapCoins and unlock achievements"
    }
  ];

  const howItWorks = [
    "Create your profile and list your skills",
    "Browse available skills in your community",
    "Request a skill swap with someone",
    "Meet up and exchange knowledge",
    "Rate your experience and earn SwapCoins"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Learn. Teach. 
              <span className="text-blue-600"> Swap.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with your community to exchange skills and knowledge. 
              Teach what you know, learn what you need.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/browse"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Browse Skills
              </Link>
              <Link
                to="/login"
                className="text-gray-600 hover:text-blue-600 px-4 py-2 text-lg font-medium"
              >
                Sign In
              </Link>
            </div>

            {/* Hero Image Placeholder */}
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg h-64 md:h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🤝</div>
                  <p className="text-gray-600 text-lg">Community Skills Exchange</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to start learning and teaching in your community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Start Swapping Skills Today
              </h2>
              <div className="space-y-4">
                {howItWorks.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 text-lg">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                >
                  <span>Join the Community</span>
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Popular Skills</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "🎨 Photoshop",
                  "📊 Excel",
                  "🎸 Guitar",
                  "👨‍🍳 Cooking",
                  "🗣️ English",
                  "💻 Programming",
                  "📸 Photography",
                  "🧘 Yoga"
                ].map((skill, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                    <span className="text-sm font-medium text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of people already sharing skills in their communities
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center space-x-2"
          >
            <span>Get Started Now</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
