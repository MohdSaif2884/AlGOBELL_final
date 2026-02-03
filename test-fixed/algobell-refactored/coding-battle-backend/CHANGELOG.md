# Changelog 📝

## [2.1.0] - 2026-01-28

### 🎯 Major Updates

#### Contest API System Overhaul
- ✅ **Dual API Support**: Added Clist.by as backup to Kontests
- ✅ **Automatic Fallback**: Seamlessly switches to backup API if primary fails
- ✅ **Retry Mechanism**: 3 automatic retries with exponential backoff (1s, 2s, 4s)
- ✅ **Increased Timeouts**: Kontests (20s), Clist.by (25s)
- ✅ **Better Error Handling**: Clear logs for each attempt and failure

#### Authentication Fixes
- ✅ **Fixed 401 Error**: Proper Authorization header for Clist.by API
  - Before: `?username=x&api_key=y` (wrong)
  - After: `Authorization: ApiKey username:api_key` (correct)

#### Documentation
- ✅ **API_SETUP_GUIDE.md**: Comprehensive setup guide
- ✅ **QUICK_FIX.md**: Quick troubleshooting guide
- ✅ **README.md**: Updated with API troubleshooting
- ✅ **.env.example**: Added Clist.by configuration

### 🐛 Bug Fixes
- Fixed contest API timeout errors
- Fixed 401 unauthorized errors
- Fixed missing retry logic
- Improved error messages and logging

### 🚀 Performance
- Reduced failed API calls through retry mechanism
- Better timeout handling
- Faster fallback to backup API

### 📦 Configuration
- Added `CLIST_USERNAME` environment variable
- Added `CLIST_API_KEY` environment variable
- Made Clist.by API optional but recommended

### 🔧 Technical Changes

#### services/contestService.js
```javascript
// Added API configuration system
this.apis = [
  { name: "Kontests", ... },
  { name: "Clist", ... }
]

// Added retry function
async fetchWithRetry(config, maxRetries = 3)

// Added response parsers
parseKontestsResponse(data)
parseClistResponse(data)
```

#### Error Handling
- Exponential backoff between retries
- Clear logging for each attempt
- Graceful degradation if all APIs fail
- Preserves old data in MongoDB

---

## [2.0.0] - Previous Release

### Features
- Contest tracking from Kontests API
- Real-time battles
- JWT authentication
- Reminder system
- Feature flags
- MongoDB integration
- Socket.io for real-time updates

---

## Migration Guide (2.0.0 → 2.1.0)

### Required Changes: **NONE!** 
Your existing setup will continue to work.

### Optional Improvements:

1. **Add Clist.by for Better Reliability** (Recommended):
   ```env
   # Add to .env
   CLIST_USERNAME=your_username
   CLIST_API_KEY=your_api_key
   ```

2. **Restart Server**:
   ```bash
   npm restart
   ```

That's it! No breaking changes.

---

## Upgrade Instructions

```bash
# 1. Pull/download new code
# 2. No new dependencies needed
# 3. Optionally add Clist.by credentials to .env
# 4. Restart server
npm restart
```

---

## Known Issues & Solutions

### Issue: Kontests API Slow/Timeout
**Status**: FIXED in v2.1.0  
**Solution**: Automatic retry + Clist.by fallback

### Issue: 401 Unauthorized Error
**Status**: FIXED in v2.1.0  
**Solution**: Proper Authorization header implementation

### Issue: No Retry on Failure
**Status**: FIXED in v2.1.0  
**Solution**: 3 automatic retries with backoff

---

## Roadmap (Future)

### v2.2.0 (Planned)
- [ ] GraphQL API support
- [ ] Advanced filtering options
- [ ] Contest recommendations
- [ ] Email notifications
- [ ] Push notifications

### v2.3.0 (Planned)
- [ ] Social features (friends, teams)
- [ ] Battle tournaments
- [ ] Leaderboard enhancements
- [ ] Achievement system

---

## Support

- 📖 [API Setup Guide](./API_SETUP_GUIDE.md)
- 🔧 [Quick Fix Guide](./QUICK_FIX.md)
- 📚 [README](./README.md)

---

## Contributors

- **MohdSaif2884** - Initial work & v2.1.0 updates

---

*For detailed changes, see git commit history.*
