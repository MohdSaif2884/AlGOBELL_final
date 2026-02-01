# 🔧 Quick Fix: 401 & Timeout Errors

## Your Error Was:
```
❌ timeout of 15000ms exceeded
❌ status: 401 (Unauthorized)
```

## ✅ Fixed! Here's What Changed:

### 1. Increased Timeouts ⏱️
- Kontests: `15s → 20s`
- Clist.by: `20s → 25s`

### 2. Added Retry System 🔄
- Each API gets **3 automatic retries**
- Smart delays between retries (1s, 2s, 4s)
- Logs each attempt

### 3. Dual API Support 🎯
- **Primary**: Kontests (no setup needed)
- **Backup**: Clist.by (optional, better reliability)
- Automatic fallback if one fails

### 4. Fixed 401 Error 🔐
- Old: API key in URL parameters ❌
- New: Proper Authorization header ✅
```javascript
// Before (Wrong)
url: '...?username=x&api_key=y'

// After (Correct)
headers: {
  Authorization: 'ApiKey username:api_key'
}
```

---

## 🚀 To Use It Now:

### Option A: Quick Start (No Changes Needed)
```bash
npm start
```
System will use Kontests with retry logic. Should work now!

### Option B: Add Backup API (Recommended)
```bash
# 1. Get free API key from https://clist.by/
# 2. Add to .env:
CLIST_USERNAME=your_username
CLIST_API_KEY=your_api_key

# 3. Restart
npm restart
```

---

## 🧪 Test It:

```bash
# Test the fix
npm run fetch-contests

# You should see:
# 🔄 Attempt 1/3 for Kontests...
# ✅ Kontests API responded successfully
# ✅ Contests saved: 42
```

---

## 📊 What You'll See in Logs:

### Success (Kontests):
```
📥 Fetching contests from Kontests API...
🔄 Attempt 1/3 for Kontests...
✅ Kontests API responded successfully
📊 Received 42 contests from Kontests
✅ Kontests: 42 contests saved
```

### Success (With Clist.by Fallback):
```
📥 Fetching contests from Kontests API...
🔄 Attempt 1/3 for Kontests...
❌ Kontests attempt 1 failed: timeout
⏳ Waiting 1000ms before retry...
🔄 Attempt 2/3 for Kontests...
❌ Kontests attempt 2 failed: timeout
📥 Fetching contests from Clist API...
🔄 Attempt 1/3 for Clist...
✅ Clist API responded successfully
✅ Clist: 38 contests saved
```

### Clist Not Configured (OK!):
```
📥 Fetching contests from Kontests API...
✅ Kontests: 42 contests saved
⏭️  Skipping Clist API (not configured)
```

---

## ⚠️ If Still Not Working:

### 1. Check Network
```bash
# Test Kontests directly
curl https://kontests.net/api/v1/all
```

### 2. Use Clist.by (More Reliable)
```bash
# Get API key from https://clist.by/api/v4/doc/
# Add to .env as shown above
```

### 3. Check Logs for Specific Error
```bash
npm start
# Copy the error message and check API_SETUP_GUIDE.md
```

---

## 🎯 What's Different in Your Code:

### Before:
```javascript
// contestService.js (OLD)
async fetchAndStoreContests() {
  const response = await axios.get(
    "https://kontests.net/api/v1/all",
    { timeout: 15000 }  // Too short!
  );
  // No retry, no fallback ❌
}
```

### After:
```javascript
// contestService.js (NEW)
async fetchAndStoreContests() {
  // Try Kontests with 3 retries
  for (const apiConfig of this.apis) {
    const response = await this.fetchWithRetry(apiConfig, 3);
    // Auto-fallback to Clist.by if Kontests fails ✅
  }
}
```

---

## 📁 Updated Files:

1. ✅ `services/contestService.js` - Dual API + retry logic
2. ✅ `.env.example` - Added Clist.by config
3. ✅ `README.md` - Updated troubleshooting
4. ✅ `API_SETUP_GUIDE.md` - Complete setup guide (NEW)
5. ✅ `QUICK_FIX.md` - This file (NEW)

---

## 🎉 Done!

Your backend should now:
- ✅ Handle timeouts gracefully
- ✅ Auto-retry failed requests
- ✅ Use backup API if needed
- ✅ Show clear logs
- ✅ Never return 401 errors

Questions? Check `API_SETUP_GUIDE.md` for details!

---

**TL;DR**: Just restart your server. It should work now. If not, add Clist.by credentials.
