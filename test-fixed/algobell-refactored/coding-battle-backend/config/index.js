 require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Frontend
  // 🔥 Allow frontend on 8080 (Vite) via env or fallback
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080',
  
  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/algobell',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // Feature Flags
  features: {
    whatsapp: process.env.ENABLE_WHATSAPP === 'true',
    proFeatures: process.env.ENABLE_PRO_FEATURES === 'true',
    contests: process.env.ENABLE_CONTESTS !== 'false',
    battles: process.env.ENABLE_BATTLES !== 'false',
  },
  
  // Third-party Services
  judge0: {
    apiUrl: process.env.JUDGE0_API_URL || '',
    apiKey: process.env.JUDGE0_API_KEY || '',
  },
  
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
  },
  
  redis: {
    url: process.env.REDIS_URL || '',
  },
  
  // Reminders
  reminders: {
    offsets: process.env.REMINDER_OFFSETS 
      ? process.env.REMINDER_OFFSETS.split(',').map(n => parseInt(n.trim()))
      : [60, 30, 15, 5],
    cronSchedule: process.env.REMINDER_CRON_SCHEDULE || '* * * * *',
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};

// Validation
const validateConfig = () => {
  const required = ['mongodbUri', 'jwtSecret'];
  const missing = required.filter(key => !config[key] || config[key].includes('change'));
  
  if (missing.length > 0 && config.nodeEnv === 'production') {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }
};

validateConfig();

module.exports = config;
