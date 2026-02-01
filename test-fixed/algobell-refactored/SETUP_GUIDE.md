# 🚀 AlgoBell Refactored - Complete Setup Guide

## 📦 What's Included

This is a **production-ready refactored version** of your AlgoBell project with all issues fixed.

### ✅ All Issues Fixed

1. ✅ **API Route Mismatch** - Frontend now uses `/api/contests` (matches backend)
2. ✅ **Centralized Environment Config** - `VITE_API_URL` for frontend, centralized config for backend
3. ✅ **Proper CORS** - Uses `FRONTEND_URL` environment variable
4. ✅ **MongoDB Connection** - Removed deprecated options
5. ✅ **UTC Timestamps** - All contest times normalized to UTC
6. ✅ **Reminder System** - Implemented with MongoDB + node-cron
7. ✅ **Feature Flags** - Easy enable/disable for WhatsApp/Pro features
8. ✅ **Supabase Cleanup** - Backend mode switch ready
9. ✅ **Standardized API Responses** - Consistent format across all endpoints
10. ✅ **Secure .env Handling** - `.env.example` files with clear documentation
11. ✅ **JWT Authentication** - Fully wired frontend to backend
12. ✅ **Deployment Configs** - Ready for Vercel (frontend) and Railway/Render (backend)

---

## 🛠️ Quick Start

### Prerequisites
- Node.js >= 16
- MongoDB Atlas account (free tier works!)
- npm or yarn

### 1. Backend Setup

```bash
cd coding-battle-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your settings (see below)

# Start development server
npm run dev
```

**Required Environment Variables:**
```env
# .env file
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/algobell?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
FRONTEND_URL=http://localhost:5173
PORT=4000
```

### 2. Frontend Setup

```bash
# In root directory
npm install

# Setup environment
cp .env.example .env
# Edit .env

# Start development server
npm run dev
```

**Required Environment Variables:**
```env
# .env file
VITE_API_URL=http://localhost:4000
```

### 3. Initialize Database

```bash
# Fetch initial contests
cd coding-battle-backend
npm run fetch-contests

# (Optional) Seed problems for battles
npm run seed
```

---

## 🔧 Configuration Guide

### Backend Configuration (`coding-battle-backend/.env`)

```env
# ==========================================
# REQUIRED
# ==========================================
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/algobell
JWT_SECRET=change_this_to_a_random_string
FRONTEND_URL=http://localhost:5173

# ==========================================
# OPTIONAL (with defaults)
# ==========================================
PORT=4000
NODE_ENV=development

# Feature Flags
ENABLE_CONTESTS=true
ENABLE_BATTLES=true
ENABLE_WHATSAPP=false
ENABLE_PRO_FEATURES=false

# Reminder Settings
REMINDER_OFFSETS=60,30,15,5  # Minutes before contest
REMINDER_CRON_SCHEDULE=* * * * *  # Every minute

# Third-party Services (Optional)
JUDGE0_API_URL=
JUDGE0_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
```

### Frontend Configuration (`.env`)

```env
# ==========================================
# REQUIRED
# ==========================================
VITE_API_URL=http://localhost:4000

# ==========================================
# OPTIONAL (Supabase features)
# ==========================================
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# ==========================================
# OPTIONAL (Firebase for push)
# ==========================================
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=

# ==========================================
# FEATURE FLAGS
# ==========================================
VITE_ENABLE_BATTLES=true
VITE_ENABLE_CONTESTS=true
VITE_ENABLE_WHATSAPP=false
```

---

## 🚀 Deployment

### Backend Deployment

#### Option 1: Railway (Recommended)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables in Railway dashboard
# Or via CLI:
railway variables set MONGODB_URI="your_uri"
railway variables set JWT_SECRET="your_secret"
railway variables set FRONTEND_URL="https://your-frontend.vercel.app"
```

#### Option 2: Render
1. Connect your GitHub repository
2. Create new Web Service
3. Set:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables in dashboard

#### Option 3: Vercel (Serverless)
```bash
vercel

# Note: For cron jobs (reminders), consider Railway/Render instead
```

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# VITE_API_URL=https://your-backend.railway.app
```

**Important:** Update `VITE_API_URL` to your deployed backend URL!

---

## 📁 Project Structure

```
algobell-refactored/
├── coding-battle-backend/          # Backend API
│   ├── config/                     # Centralized configuration
│   ├── models/                     # MongoDB models
│   │   ├── User.js                 # With contest preferences
│   │   ├── Contest.js              # UTC timestamps
│   │   ├── Reminder.js             # Reminder tracking
│   │   ├── Problem.js              # Coding problems
│   │   └── Battle.js               # Battle sessions
│   ├── routes/                     # API routes
│   │   ├── auth.js
│   │   ├── contest.js              # ✅ Fixed routes
│   │   ├── reminder.js             # Reminder management
│   │   ├── problem.js
│   │   ├── battle.js
│   │   └── leaderboard.js
│   ├── services/                   # Business logic
│   │   ├── contestService.js       # Contest fetching
│   │   ├── reminderService.js      # Reminder system
│   │   └── judge0.js               # Code execution
│   ├── middleware/                 # Middleware
│   │   ├── auth.js                 # JWT verification
│   │   └── apiResponse.js          # Standardized responses
│   ├── scripts/                    # Utility scripts
│   ├── server.js                   # Main server
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── src/                            # Frontend
│   ├── config/
│   │   └── api.ts                  # ✅ Centralized API config
│   ├── services/
│   │   └── contestService.ts       # ✅ Fixed contest service
│   ├── hooks/
│   │   └── useContests.ts          # ✅ Fixed hook (no conflicts)
│   ├── contexts/
│   │   └── AuthContext.tsx         # ✅ Fixed (no conflicts)
│   ├── pages/
│   ├── components/
│   └── ...
│
├── .env.example                    # Frontend env example
├── package.json                    # Frontend dependencies
└── SETUP_GUIDE.md                  # This file
```

---

## 🔐 MongoDB Atlas Setup

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up (free tier available)

2. **Create Cluster**
   - Click "Build a Database"
   - Choose FREE (M0) tier
   - Select region closest to you
   - Click "Create"

3. **Setup Database User**
   - Go to "Database Access"
   - Add new user
   - Choose password authentication
   - Save username & password

4. **Whitelist IP**
   - Go to "Network Access"
   - Add IP Address
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your specific IP

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `myFirstDatabase` with `algobell`

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/algobell?retryWrites=true&w=majority
```

---

## 🎯 Feature Usage

### Contest Tracking

**How it works:**
1. Backend fetches contests from Kontests API
2. Stores in MongoDB with UTC timestamps
3. Cron job updates statuses every minute
4. Frontend displays via `/api/contests`

**Manual fetch:**
```bash
cd coding-battle-backend
npm run fetch-contests
```

### Reminder System

**How it works:**
1. User subscribes to contest
2. System creates reminders (1hr, 30min, 15min before by default)
3. node-cron checks every minute
4. Sends reminders via enabled channels

**Customize reminder offsets:**
```typescript
// Via API
await contestService.subscribeToContest(contestId, [120, 60, 30]);
// 2 hours, 1 hour, 30 minutes before
```

### Feature Flags

**Backend** (`.env`):
```env
ENABLE_CONTESTS=true
ENABLE_BATTLES=true
ENABLE_WHATSAPP=false      # Coming Soon UI
ENABLE_PRO_FEATURES=false  # Coming Soon UI
```

**Frontend** (`.env`):
```env
VITE_ENABLE_BATTLES=true
VITE_ENABLE_CONTESTS=true
VITE_ENABLE_WHATSAPP=false
```

---

## 🧪 Testing

### Backend
```bash
cd coding-battle-backend

# Run all tests
npm test

# With coverage
npm test -- --coverage

# Test specific file
npm test -- auth.test.js
```

### Frontend
```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Check `MONGODB_URI` in `.env`
- Ensure IP is whitelisted in Atlas
- Verify username/password
- Check network firewall

### Issue: "CORS error"
**Solution:**
- Set correct `FRONTEND_URL` in backend `.env`
- Restart backend server
- Clear browser cache

### Issue: "Contests not loading"
**Solution:**
- Run `npm run fetch-contests` in backend
- Check backend logs for errors
- Verify `VITE_API_URL` in frontend `.env`

### Issue: "Reminders not sending"
**Solution:**
- Check backend logs for cron job
- Verify reminder status in database
- Ensure user has enabled channels
- Check feature flags

### Issue: "Merge conflicts in files"
**Solution:**
- Use files from `algobell-refactored/` folder
- These have all conflicts resolved
- Old files with conflicts are in original `algobell-main/`

---

## 📊 Database Indices

The system automatically creates these indices for performance:

```javascript
// Contest indices
{ externalId: 1 } (unique)
{ platform: 1, startTime: 1 }
{ status: 1, startTime: 1 }

// Reminder indices
{ userId: 1 }
{ contestId: 1 }
{ scheduledAt: 1, status: 1 }
{ userId: 1, contestId: 1, offsetMinutes: 1 } (unique)
```

---

## 🔄 Migration from Old Codebase

### If you have existing data:

1. **Backup your data**
```bash
mongodump --uri="your_mongodb_uri"
```

2. **Update environment variables**
   - Follow configuration guide above

3. **Start backend**
```bash
cd coding-battle-backend
npm install
npm run dev
```

4. **Fetch fresh contests**
```bash
npm run fetch-contests
```

5. **Update frontend**
```bash
# In root
npm install
# Update VITE_API_URL in .env
npm run dev
```

---

## 📚 API Documentation

Complete API documentation available at:
- Backend README: `coding-battle-backend/README.md`
- [Live Docs] (Coming soon - Swagger/Postman collection)

**Quick Reference:**
```
Auth:       /api/auth/*
Contests:   /api/contests/*      ✅ Fixed
Reminders:  /api/reminders/*
Battles:    /api/battles/*
Problems:   /api/problems/*
```

---

## 🤝 Support

- Check `README.md` files for detailed documentation
- Review code comments for inline documentation
- Backend: `coding-battle-backend/README.md`
- GitHub Issues: [Report a bug]

---

## ✨ Next Steps

1. **Get MongoDB URI** from Atlas
2. **Configure `.env` files** in both frontend & backend
3. **Start backend** (`npm run dev` in `coding-battle-backend/`)
4. **Fetch contests** (`npm run fetch-contests`)
5. **Start frontend** (`npm run dev` in root)
6. **Test locally** - Create account, browse contests
7. **Deploy** - Use Railway (backend) & Vercel (frontend)

---

## 🎉 You're All Set!

Your AlgoBell project is now:
- ✅ Production-ready
- ✅ Properly configured
- ✅ All issues fixed
- ✅ Ready to deploy

**Happy coding! 🚀**

---

Made with ❤️ by fixing all the issues systematically
