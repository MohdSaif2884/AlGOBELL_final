# 🔔 AlgoBell - Contest Tracker & Coding Battle Platform

<div align="center">

![AlgoBell Logo](https://via.placeholder.com/150x150?text=AlgoBell)

**Never miss a coding contest again!**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-green)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/mongodb-ready-green)](https://www.mongodb.com)
[![Production Ready](https://img.shields.io/badge/production-ready-brightgreen)](SETUP_GUIDE.md)

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Deployment](#deployment)

</div>

---

## ✨ Features

### 📅 Contest Tracking
- **Multi-platform support**: Codeforces, LeetCode, CodeChef, AtCoder, HackerRank, and more
- **Live updates**: Real-time contest status (upcoming/live/ended)
- **Smart filtering**: Filter by platform, time, difficulty
- **UTC timezone handling**: Accurate times worldwide

### ⏰ Smart Reminders
- **Flexible scheduling**: 1hr, 30min, 15min before (customizable)
- **Multi-channel**: Email, WhatsApp (Pro), Push notifications
- **Auto-management**: Automatic reminder creation and cleanup
- **User preferences**: Personalized reminder settings

### ⚔️ Coding Battles
- **Real-time multiplayer**: Battle with friends
- **Socket.IO powered**: Instant code sync
- **Judge0 integration**: Automatic code evaluation
- **Leaderboard**: Track your wins

### 🔐 Authentication
- **JWT-based**: Secure token authentication
- **Profile management**: Update preferences anytime
- **Stats tracking**: View your progress

### 🎯 Pro Features (Coming Soon)
- WhatsApp reminders
- Custom reminder schedules
- Priority support
- Advanced analytics

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16
- MongoDB Atlas account (free tier works)
- npm or yarn

### 1️⃣ Clone & Install

```bash
# Clone repository
git clone https://github.com/MohdSaif2884/algobell.git
cd algobell

# Install frontend dependencies
npm install

# Install backend dependencies
cd coding-battle-backend
npm install
cd ..
```

### 2️⃣ Configure Environment

```bash
# Backend configuration
cd coding-battle-backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Frontend configuration
cd ..
cp .env.example .env
# Edit .env with your backend URL
```

**Minimum required in backend `.env`:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/algobell
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173
```

**Minimum required in frontend `.env`:**
```env
VITE_API_URL=http://localhost:4000
```

### 3️⃣ Start Development Servers

```bash
# Terminal 1: Start backend
cd coding-battle-backend
npm run dev

# Terminal 2: Start frontend  
cd ..
npm run dev
```

### 4️⃣ Initialize Data

```bash
# Fetch initial contests
cd coding-battle-backend
npm run fetch-contests
```

🎉 **Done!** Open http://localhost:5173

---

## 📚 Documentation

- **[Setup Guide](SETUP_GUIDE.md)** - Complete setup instructions
- **[Fixes Summary](FIXES_SUMMARY.md)** - What was fixed in this version
- **[Backend API](coding-battle-backend/README.md)** - API documentation
- **[MongoDB Setup](SETUP_GUIDE.md#mongodb-atlas-setup)** - Database configuration

---

## 🏗️ Architecture

```
AlgoBell
├── Frontend (React + Vite + TypeScript)
│   ├── UI Components (shadcn/ui)
│   ├── Contest Dashboard
│   ├── Battle Arena
│   └── User Profile
│
└── Backend (Node.js + Express + MongoDB)
    ├── REST API
    ├── Socket.IO (Real-time battles)
    ├── Contest Fetching (Kontests API)
    ├── Reminder System (node-cron)
    └── Authentication (JWT)
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: React Query
- **Routing**: React Router v6
- **Real-time**: Socket.IO Client

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.IO
- **Authentication**: JWT (jsonwebtoken)
- **Scheduler**: node-cron
- **API Source**: Kontests.net API

---

## 🚢 Deployment

### Backend Options

#### Railway (Recommended)
```bash
railway init
railway up
```

#### Render
1. Connect GitHub repo
2. Add environment variables
3. Deploy

#### Vercel (Serverless)
```bash
vercel
```

### Frontend

#### Vercel (Recommended)
```bash
vercel
```

**Important:** Update `VITE_API_URL` to your deployed backend URL!

See [Deployment Guide](SETUP_GUIDE.md#deployment) for detailed instructions.

---

## 📁 Project Structure

```
algobell/
├── coding-battle-backend/          # Backend API
│   ├── config/                     # Configuration
│   ├── models/                     # Database models
│   ├── routes/                     # API routes
│   ├── services/                   # Business logic
│   ├── middleware/                 # Middleware
│   ├── scripts/                    # Utility scripts
│   └── server.js                   # Entry point
│
├── src/                            # Frontend source
│   ├── components/                 # React components
│   ├── pages/                      # Page components
│   ├── hooks/                      # Custom hooks
│   ├── contexts/                   # React contexts
│   ├── services/                   # API services
│   └── config/                     # Configuration
│
├── public/                         # Static assets
├── SETUP_GUIDE.md                  # Setup documentation
├── FIXES_SUMMARY.md                # Changelog
└── README.md                       # This file
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register          # Register
POST   /api/auth/login             # Login
GET    /api/auth/me                # Get user
PUT    /api/auth/profile           # Update profile
```

### Contests
```
GET    /api/contests               # List contests
GET    /api/contests/live          # Live contests
GET    /api/contests/:id           # Contest details
POST   /api/contests/:id/subscribe # Subscribe
DELETE /api/contests/:id/unsubscribe # Unsubscribe
```

### Reminders
```
GET    /api/reminders              # User reminders
DELETE /api/reminders/:id          # Cancel reminder
PUT    /api/reminders/preferences  # Update preferences
```

See [API Documentation](coding-battle-backend/README.md) for complete reference.

---

## 🎯 Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| Contest Tracking | ✅ Live | Multi-platform support |
| Email Reminders | ✅ Live | Customizable offsets |
| Push Notifications | ✅ Live | Firebase integration |
| Coding Battles | ✅ Live | Real-time multiplayer |
| JWT Authentication | ✅ Live | Secure auth |
| WhatsApp Reminders | 🚧 Coming | Pro feature |
| Discord Bot | 📋 Planned | Future update |
| Mobile App | 📋 Planned | React Native |

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Verify `MONGODB_URI` in `.env`
- Check IP whitelist in MongoDB Atlas
- Confirm username/password

**CORS Error**
- Set correct `FRONTEND_URL` in backend `.env`
- Restart backend server

**Contests Not Loading**
- Run `npm run fetch-contests` in backend
- Check backend logs
- Verify `VITE_API_URL` in frontend `.env`

See [Troubleshooting Guide](SETUP_GUIDE.md#troubleshooting) for more help.

---

## 📊 Database Schema

### User
```javascript
{
  username: String,
  email: String,
  password: String,
  contestPreferences: {
    platforms: [String],
    reminderOffsets: [Number],
    enabledChannels: Object
  },
  subscription: {
    plan: String,
    expiresAt: Date
  }
}
```

### Contest
```javascript
{
  name: String,
  platform: String,
  startTime: Date (UTC),
  endTime: Date (UTC),
  duration: Number,
  url: String,
  status: String
}
```

See [Database Documentation](coding-battle-backend/README.md#database-schema) for complete schema.

---

## 🎓 Learning Resources

- [MongoDB Tutorial](https://www.mongodb.com/docs/)
- [React Documentation](https://react.dev)
- [Socket.IO Guide](https://socket.io/docs/v4/)
- [JWT Introduction](https://jwt.io/introduction)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Mohd Saif**
- GitHub: [@MohdSaif2884](https://github.com/MohdSaif2884)

---

## 🙏 Acknowledgments

- [Kontests API](https://kontests.net/api) for contest data
- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- All contributors and users!

---

## 📞 Support

- 📧 Email: [Create an issue](https://github.com/MohdSaif2884/algobell/issues)
- 💬 Discord: [Join our community](#) (Coming soon)
- 📖 Docs: See documentation files

---

<div align="center">

**Made with ❤️ for competitive programmers**

⭐ Star this repo if you find it helpful!

</div>
