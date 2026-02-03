# Contest API Setup Guide 🔧

## Overview

AlgoBell backend supports **dual contest API sources** with automatic fallback:

1. **Kontests API** (Primary) - Free, no auth required
2. **Clist.by API** (Backup) - Requires free account, more reliable

## Quick Start

### Option 1: Use Kontests Only (Default)
No configuration needed! Just start the server:

```bash
npm start
```

**Pros**: Zero configuration  
**Cons**: May timeout occasionally (15-20 seconds)

---

### Option 2: Add Clist.by Backup (Recommended)

#### Step 1: Get Clist.by API Key

1. Go to https://clist.by/
2. Create free account (GitHub/Google login available)
3. Visit https://clist.by/api/v4/doc/
4. Copy your username and API key

#### Step 2: Add to .env

```env
# Add these lines to your .env file
CLIST_USERNAME=your_username_here
CLIST_API_KEY=your_api_key_here
```

#### Step 3: Restart Server

```bash
npm restart
```

**Pros**: Much more reliable, faster  
**Cons**: Requires account creation

---

## How It Works

### Automatic Fallback System

```
1. Try Kontests API (3 retries with exponential backoff)
   ├─ Success? ✅ Save contests, done!
   └─ Failed? ⚠️  Move to next API

2. Try Clist.by API (if configured)
   ├─ Success? ✅ Save contests, done!
   └─ Failed? ❌ Return error

3. All APIs failed? 
   └─ Show error with details
```

### Retry Mechanism

Each API gets **3 attempts** with smart delays:
- Attempt 1: Immediate
- Attempt 2: Wait 1 second
- Attempt 3: Wait 2 seconds
- Attempt 4: Wait 4 seconds (max 5s)

### Timeout Settings

- **Kontests**: 20 seconds (increased from 15s)
- **Clist.by**: 25 seconds

---

## API Comparison

| Feature | Kontests | Clist.by |
|---------|----------|----------|
| **Authentication** | None | API Key required |
| **Reliability** | Medium | High |
| **Speed** | Varies | Fast |
| **Setup Time** | 0 minutes | 2 minutes |
| **Rate Limits** | Unknown | 100/hour |
| **Platforms** | 10+ | 200+ |
| **Data Quality** | Good | Excellent |

---

## Testing Your Setup

### Test Kontests API

```bash
# Terminal/PowerShell
curl https://kontests.net/api/v1/all
```

### Test Clist.by API

```bash
# Replace with your credentials
curl -H "Authorization: ApiKey USERNAME:API_KEY" \
     "https://clist.by/api/v4/contest/?upcoming=true&limit=5"
```

### Test via Backend

```bash
# Fetch contests manually
npm run fetch-contests

# Or via API endpoint (server must be running)
curl http://localhost:4000/api/contests/fetch
```

---

## Troubleshooting

### ❌ Error: "timeout of 20000ms exceeded"

**Problem**: Kontests API is slow/down  
**Solution**: Add Clist.by as backup (see Option 2 above)

### ❌ Error: "401 Unauthorized" (Clist.by)

**Problem**: Wrong API credentials  
**Solutions**:
1. Verify username is correct (case-sensitive)
2. Regenerate API key on https://clist.by/api/v4/doc/
3. Check `.env` file has no extra spaces
4. Restart server after changing `.env`

### ❌ Error: "All contest APIs failed"

**Problem**: Both APIs down (rare)  
**Solutions**:
1. Check internet connection
2. Try again in 5 minutes
3. Check API status:
   - Kontests: https://kontests.net/api/v1/all
   - Clist: https://clist.by/

### ⚠️ Warning: "Skipping Clist API (not configured)"

**Not an error!** Just means you haven't added Clist.by credentials.  
System will use Kontests only (which is fine).

---

## Environment Variables Reference

### Contest APIs

```env
# Clist.by API (Optional but recommended)
CLIST_USERNAME=your_username
CLIST_API_KEY=your_api_key_from_clist_by
```

### Complete .env Example

```env
# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database (REQUIRED)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/algobell

# JWT (REQUIRED)
JWT_SECRET=your_super_secret_key

# Contest APIs (Optional - improves reliability)
CLIST_USERNAME=saif2884
CLIST_API_KEY=abc123def456...

# Features
ENABLE_CONTESTS=true
ENABLE_BATTLES=true
```

---

## Best Practices

### For Development

```env
# Use Kontests only (simpler)
# No extra setup needed
```

### For Production

```env
# Add Clist.by for better reliability
CLIST_USERNAME=your_prod_username
CLIST_API_KEY=your_prod_api_key
```

### For High Traffic

```env
# Consider rate limits
# Clist.by: 100 requests/hour
# Cache contests in MongoDB
# Update every 6-12 hours (not every request!)
```

---

## API Rate Limits

### Kontests
- No official limit documented
- Appears to handle ~10 req/min
- May throttle during high usage

### Clist.by
- **100 requests per hour** per API key
- Resets every hour
- Documented at https://clist.by/api/v4/doc/

### Our Backend
- Caches contests in MongoDB
- Manual fetch: `GET /api/contests/fetch` (admin only)
- Auto-update: Can be scheduled via cron
- Reading contests: Always from MongoDB (fast!)

---

## Advanced Configuration

### Custom Retry Settings

Edit `services/contestService.js`:

```javascript
// Change retry count
const response = await this.fetchWithRetry(apiConfig, 5); // 5 retries

// Change timeout
timeout: 30000, // 30 seconds
```

### Add More APIs

```javascript
// In contestService.js constructor
this.apis = [
  {
    name: "Kontests",
    url: "https://kontests.net/api/v1/all",
    // ...
  },
  {
    name: "Your Custom API",
    url: "https://api.example.com/contests",
    parser: this.parseCustomResponse.bind(this),
    // ...
  }
];
```

---

## Monitoring

### Check API Status

```bash
# View logs
npm start

# Look for these messages:
# ✅ Kontests API responded successfully
# ✅ Clist.by: 42 contests saved
# ❌ Kontests attempt 1 failed: timeout
# ⏭️  Skipping Clist API (not configured)
```

### Production Monitoring

Consider adding:
- Error tracking (Sentry, LogRocket)
- Uptime monitoring (UptimeRobot, Pingdom)
- API response time alerts
- Database query monitoring

---

## FAQ

### Q: Do I need both APIs?
**A**: No! Kontests alone works fine. Clist.by is just a backup.

### Q: Which API is better?
**A**: Clist.by is more reliable but requires setup. Use both for best results.

### Q: Can I use only Clist.by?
**A**: Yes! Just remove Kontests from the `apis` array in contestService.js

### Q: How often should I fetch contests?
**A**: Every 6-12 hours is ideal. Use cron jobs for automation.

### Q: What if both APIs fail?
**A**: Very rare. Old cached data remains in MongoDB until next successful fetch.

### Q: Rate limit exceeded on Clist.by?
**A**: You have 100/hour. Fetching once per hour is plenty. Use MongoDB for reads!

---

## Support

### Still Having Issues?

1. Check logs: `npm start` and watch console
2. Test APIs directly (see Testing section)
3. Verify `.env` file (no typos, extra spaces)
4. Check firewall/proxy settings
5. Try different network (mobile hotspot)

### Report Bugs

- GitHub Issues: [Your repo URL]
- Include error logs
- Mention which API failed
- Share your environment (OS, Node version)

---

## Summary

✅ **Best Setup for Most Users**:
```env
# Add to .env
CLIST_USERNAME=your_username
CLIST_API_KEY=your_key
```

✅ **Restart server**:
```bash
npm restart
```

✅ **Verify it works**:
```bash
npm run fetch-contests
```

That's it! 🎉 Your contest API is now production-ready with automatic fallback.

---

*Last updated: January 2026*  
*Questions? Open an issue or check documentation.*
