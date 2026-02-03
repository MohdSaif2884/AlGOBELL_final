# AlgoBell Backend 🚀

Production-ready backend for AlgoBell - Contest Tracker & Coding Battle Platform.

## ✨ Features

### ✅ Fixed Issues
- ✅ API route mismatch fixed (`/api/contests` now matches frontend)
- ✅ Centralized environment configuration
- ✅ Proper CORS with `FRONTEND_URL`
- ✅ Removed deprecated MongoDB options
- ✅ UTC timezone handling for contests
- ✅ Reminder system with MongoDB + node-cron
- ✅ Feature flag system
- ✅ Standardized API responses
- ✅ Secure environment handling
- ✅ JWT authentication system
- ✅ Deployment configs (Vercel/Railway/Render)

### 🎯 Core Features
- **Contest Tracking**: Dual API support (Kontests + Clist.by) with auto-fallback
- **Reminders**: Automated contest reminders (Email/WhatsApp/Push)
- **Coding Battles**: Real-time multiplayer coding competitions
- **Authentication**: JWT-based auth system
- **Feature Flags**: Easy enable/disable of features

## 🛠️ Setup

### Prerequisites
- Node.js >= 16
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone & Install**
```bash
cd coding-battle-backend
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configurations
```

3. **Required Environment Variables**
```env
# MUST SET THESE:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/algobell
JWT_SECRET=your_super_secret_key_here
FRONTEND_URL=http://localhost:5173

# Optional but recommended:
PORT=4000
NODE_ENV=development
```

4. **Start Server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Project Structure

```
coding-battle-backend/
├── config/
│   └── index.js              # Centralized config
├── models/
│   ├── User.js               # User model with contest preferences
│   ├── Contest.js            # Contest model (UTC timestamps)
│   ├── Reminder.js           # Reminder tracking
│   ├── Problem.js            # Coding problems
│   └── Battle.js             # Battle sessions
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── contest.js            # Contest routes (✅ Fixed)
│   ├── reminder.js           # Reminder management
│   ├── problem.js            # Problem routes
│   ├── battle.js             # Battle routes
│   └── leaderboard.js        # Leaderboard routes
├── services/
│   ├── contestService.js     # Contest fetching & management
│   ├── reminderService.js    # Reminder system
│   └── judge0.js             # Code execution (optional)
├── middleware/
│   ├── auth.js               # JWT authentication
│   └── apiResponse.js        # Standardized responses
├── scripts/
│   ├── fetchContests.js      # Manual contest fetch
│   └── seedProblems.js       # Seed problems
├── server.js                 # Main server file
├── package.json
├── .env.example
└── README.md
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login
GET    /api/auth/me            # Get current user (protected)
PUT    /api/auth/profile       # Update profile (protected)
```

### Contests (✅ Fixed Routes)
```
GET    /api/contests           # Get all upcoming contests
GET    /api/contests/live      # Get live contests
GET    /api/contests/:id       # Get contest by ID
POST   /api/contests/:id/subscribe   # Subscribe (protected)
DELETE /api/contests/:id/unsubscribe # Unsubscribe (protected)
GET    /api/contests/stats     # Platform statistics
```

### Reminders
```
GET    /api/reminders          # Get user reminders (protected)
DELETE /api/reminders/:id      # Cancel reminder (protected)
PUT    /api/reminders/preferences  # Update preferences (protected)
GET    /api/reminders/preferences  # Get preferences (protected)
```

### Battles
```
POST   /api/battles/create     # Create battle (protected)
GET    /api/battles/:id        # Get battle (protected)
POST   /api/battles/:id/join   # Join battle (protected)
```

### Problems
```
GET    /api/problems           # Get all problems
GET    /api/problems/:id       # Get problem by ID
GET    /api/problems/random    # Get random problem
```

## 🎛️ Feature Flags

Enable/disable features in `.env`:

```env
ENABLE_CONTESTS=true          # Contest tracking
ENABLE_BATTLES=true           # Coding battles
ENABLE_WHATSAPP=false         # WhatsApp reminders (Pro)
ENABLE_PRO_FEATURES=false     # Pro features
```

## ⏰ Reminder System

### How It Works
1. User subscribes to contest
2. System creates reminders (default: 1hr, 30min, 15min before)
3. node-cron checks every minute
4. Sends reminders via enabled channels (Email/WhatsApp/Push)

### Customizing Reminder Offsets

In `.env`:
```env
REMINDER_OFFSETS=60,30,15,5   # Minutes before contest
```

Or via API:
```json
POST /api/contests/:id/subscribe
{
  "customOffsets": [120, 60, 30]  # 2hrs, 1hr, 30min
}
```

## 🚀 Deployment

### Vercel (Serverless)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables
railway variables set MONGODB_URI=...
railway variables set JWT_SECRET=...
```

### Render
1. Connect GitHub repo
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables in dashboard

## 📊 Database Schema

### User
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  contestPreferences: {
    platforms: [String],
    reminderOffsets: [Number],
    enabledChannels: {
      email: Boolean,
      whatsapp: Boolean,
      push: Boolean
    },
    whatsappNumber: String
  },
  subscription: {
    plan: 'free' | 'pro',
    expiresAt: Date
  }
}
```

### Contest
```javascript
{
  externalId: String (unique),
  name: String,
  platform: String,
  startTime: Date (UTC),
  endTime: Date (UTC),
  duration: Number (minutes),
  url: String,
  status: 'upcoming' | 'live' | 'ended'
}
```

### Reminder
```javascript
{
  userId: ObjectId,
  contestId: ObjectId,
  offsetMinutes: Number,
  scheduledAt: Date (UTC),
  channels: {
    email: Boolean,
    whatsapp: Boolean,
    push: Boolean
  },
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# With coverage
npm test -- --coverage
```

## 📝 Scripts

```bash
# Fetch contests manually
npm run fetch-contests

# Seed problems
npm run seed

# Start dev server
npm run dev

# Production
npm start
```

## 🔒 Security

- JWT tokens with expiration
- Password hashing with bcryptjs
- CORS configured for specific frontend
- Environment variables for secrets
- Input validation on all routes

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check `MONGODB_URI` in `.env`
- Ensure IP is whitelisted in MongoDB Atlas
- Verify credentials

### Contest API Timeout
- Default is Kontests API, but it may timeout
- **Solution 1**: Add Clist.by API as backup (recommended)
  ```env
  # Get free API key from https://clist.by/api/v4/doc/
  CLIST_USERNAME=your_username
  CLIST_API_KEY=your_api_key
  ```
- **Solution 2**: System will auto-retry 3 times with exponential backoff
- **Solution 3**: Manually fetch: `npm run fetch-contests`

### CORS Error
- Set correct `FRONTEND_URL` in `.env`
- Restart server after changing `.env`

### Reminders Not Sending
- Check reminder cron is running (logs on startup)
- Verify user has enabled channels
- Check reminder status in database

## 📚 Additional Resources

- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)
- [JWT Documentation](https://jwt.io/)
- [Kontests API](https://kontests.net/api)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - See LICENSE file

## 👨‍💻 Author

**MohdSaif2884**

---

Made with ❤️ for competitive programmers
