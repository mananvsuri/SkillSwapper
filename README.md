# SkillSwapper
Problem Statement : Skill Swap Platform

Members : 
Manan Suri 
Dhawal Khandelwal 


## 🌟 Overview

SkillSwapper is a comprehensive skill swap platform that enables users to exchange skills and knowledge with each other. Built with React frontend and FastAPI backend, the platform features user authentication, skill management, swap requests, rating systems, and admin functionality.

## 🚀 Features

### User Features
- **User Authentication**: Secure login/registration with JWT tokens
- **Profile Management**: Public/private profiles with photo uploads
- **Skill Management**: Add, edit, and delete skills (offered/wanted)
- **Availability Settings**: Set availability preferences (weekends, evenings, etc.)
- **Browse Users**: Discover and connect with other users
- **Swap Requests**: Send, accept, and reject skill swap requests
- **Rating System**: Rate and provide feedback after completed swaps
- **Coin System**: Earn coins for completed swaps and activities
- **Dashboard**: Personal dashboard with stats and activity tracking

### Admin Features
- **User Management**: View, ban/unban users
- **Skill Moderation**: Approve/reject inappropriate skill descriptions
- **Swap Monitoring**: Track all swap activities and statuses
- **Platform Messages**: Send announcements to all users
- **Reports**: Generate user activity and swap statistics reports
- **Admin Dashboard**: Comprehensive admin interface

### Technical Features
- **Real-time Updates**: Live data synchronization
- **File Upload**: Profile photo upload functionality
- **Responsive Design**: Mobile-friendly interface
- **Search & Filter**: Advanced user and skill search capabilities
- **CORS Support**: Cross-origin resource sharing enabled

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **React Router** for navigation
- **React Query** for state management

### Backend
- **FastAPI** with Python 3.11+
- **SQLAlchemy** ORM
- **SQLite** database (can be configured for PostgreSQL)
- **JWT** authentication
- **Pydantic** for data validation
- **Uvicorn** ASGI server

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (3.11 or higher)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <https://github.com/mananvsuri/SkillSwapper.git>
cd SkillSwapper
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Database Setup
```bash
# Create uploads directory
mkdir uploads

# Run admin setup script
python setup_admin.py
```

### 4. Start Backend Server
```bash
uvicorn app.main:app --reload --port 8001
```

### 5. Frontend Setup
```bash
cd front-end
npm install
```

### 6. Start Frontend Server
```bash
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:8080 (or next available port)
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

## 👤 Default Admin Account

- **Email**: admin@gmail.com
- **Password**: Admin@1234

## 📱 How to Use

### For Regular Users
1. **Register/Login**: Create an account or log in
2. **Complete Profile**: Add your skills, availability, and photo
3. **Browse Users**: Find people with skills you want to learn
4. **Send Swap Requests**: Request skill exchanges
5. **Complete Swaps**: Finish swaps and rate each other
6. **Earn Coins**: Build your reputation and earn rewards

### For Admins
1. **Login as Admin**: Use admin credentials
2. **Access Admin Dashboard**: Automatically redirected to admin panel
3. **Manage Users**: Ban/unban users as needed
4. **Moderate Content**: Approve/reject skill descriptions
5. **Monitor Activity**: Track platform usage and generate reports

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///skillswap.db
```

### Database Configuration
The app uses SQLite by default. For production, consider PostgreSQL:
```env
DATABASE_URL=postgresql://user:password@localhost/skillswapper
```

## 📊 API Endpoints

### Authentication
- `POST /api/v1/register` - User registration
- `POST /api/v1/login` - User login
- `GET /api/v1/me` - Get current user info

### Users
- `GET /api/v1/public-users` - Get public users (browse)
- `PUT /api/v1/users/availability` - Update availability

### Skills
- `GET /api/v1/skills` - Get user skills
- `POST /api/v1/skills` - Add new skill
- `PUT /api/v1/skills/{id}` - Update skill
- `DELETE /api/v1/skills/{id}` - Delete skill

### Swaps
- `GET /api/v1/swaps` - Get user swaps
- `POST /api/v1/swaps` - Create swap request
- `PUT /api/v1/swaps/{id}/accept` - Accept swap
- `PUT /api/v1/swaps/{id}/reject` - Reject swap
- `PUT /api/v1/swaps/{id}/complete` - Complete swap

### Admin (Admin only)
- `GET /api/v1/admin/users` - Get all users
- `PUT /api/v1/admin/users/{id}/ban` - Ban user
- `GET /api/v1/admin/skills` - Get all skills
- `PUT /api/v1/admin/skills/{id}/approve` - Approve skill
- `GET /api/v1/admin/swaps` - Get all swaps
- `GET /api/v1/admin/stats` - Get platform statistics

## 📞 Support

For technical support or questions, contact the team members listed above.

---
