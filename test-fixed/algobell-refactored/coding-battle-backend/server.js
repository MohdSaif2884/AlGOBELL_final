 const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require("node-cron");
const config = require("./config");

const app = express();
const server = http.createServer(app);

// ==========================================
// SOCKET.IO CONFIGURATION
// ==========================================
const io = socketIo(server, {
  cors: {
    origin: [config.frontendUrl, 'http://localhost:5173', 'http://localhost:8080'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(
  cors({
    origin: '*',
    credentials: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
});

// ==========================================
// MONGODB CONNECTION
// ==========================================
mongoose
  .connect(config.mongodbUri)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB runtime error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});

// ==========================================
// SAFE ROUTE LOADER
// Prevents: Router.use() got Object instead of function
// ==========================================
function safeRoute(path) {
  const mod = require(path);
  return typeof mod === "function" ? mod : mod.router;
}

// ==========================================
// IMPORT ROUTES
// ==========================================
const authRoutes = safeRoute("./routes/auth");
const battleRoutes = safeRoute("./routes/battle");
const problemRoutes = safeRoute("./routes/problem");
const contestRoutes = safeRoute("./routes/contest");
const leaderboardRoutes = safeRoute("./routes/leaderboard");
const reminderRoutes = safeRoute("./routes/reminder");

// ==========================================
// API ROUTES
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/battles", battleRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/reminders", reminderRoutes);

// ==========================================
// HEALTH CHECK
// ==========================================
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "AlgoBell API Server is running",
    timestamp: new Date().toISOString(),
    features: config.features,
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    server: "AlgoBell Backend",
    version: "2.0.0",
    environment: config.nodeEnv,
    uptime: process.uptime(),
    features: config.features,
  });
});

// ==========================================
// SOCKET.IO — BATTLE SYSTEM
// ==========================================
const activeBattles = new Map();
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("join-battle", ({ roomId, userId, username }) => {
    socket.join(roomId);
    userSockets.set(socket.id, {
      roomId,
      userId,
      username,
    });

    if (!activeBattles.has(roomId)) {
      activeBattles.set(roomId, {
        players: [],
        startTime: null,
        endTime: null,
        winner: null,
        submissions: [],
      });
    }

    const battle = activeBattles.get(roomId);

    let player = battle.players.find(
      (p) => p.userId === userId
    );

    if (!player) {
      player = {
        userId,
        username,
        socketId: socket.id,
        ready: false,
        code: "",
        lastSubmission: null,
      };
      battle.players.push(player);
    } else {
      player.socketId = socket.id;
    }

    socket.emit("battle-state", {
      players: battle.players.map((p) => ({
        userId: p.userId,
        username: p.username,
        ready: p.ready,
      })),
      startTime: battle.startTime,
      winner: battle.winner,
    });

    socket.to(roomId).emit("player-joined", {
      userId,
      username,
      count: battle.players.length,
    });

    console.log(`👤 ${username} joined battle ${roomId}`);
  });

  socket.on("player-ready", ({ roomId, userId }) => {
    const battle = activeBattles.get(roomId);
    if (!battle) return;

    const player = battle.players.find(
      (p) => p.userId === userId
    );

    if (!player) return;

    player.ready = true;

    const allReady = battle.players.every(
      (p) => p.ready
    );

    io.to(roomId).emit("player-ready-status", {
      userId,
      allReady,
      readyCount: battle.players.filter(
        (p) => p.ready
      ).length,
      totalPlayers: battle.players.length,
    });

    if (
      allReady &&
      battle.players.length >= 2 &&
      !battle.startTime
    ) {
      battle.startTime = Date.now();
      battle.endTime =
        battle.startTime + 10 * 60 * 1000;

      io.to(roomId).emit("battle-start", {
        startTime: battle.startTime,
        duration: 10 * 60 * 1000,
      });

      console.log(`🚀 Battle ${roomId} started`);
    }
  });

  socket.on("code-change", ({ roomId, userId, code }) => {
    const battle = activeBattles.get(roomId);
    if (!battle) return;

    const player = battle.players.find(
      (p) => p.userId === userId
    );
    if (!player) return;

    player.code = code;

    socket.to(roomId).emit("code-update", {
      userId,
      code,
    });
  });

  socket.on(
    "submit-code",
    ({ roomId, userId, code, language }) => {
      const battle = activeBattles.get(roomId);
      if (!battle || battle.winner) return;

      const player = battle.players.find(
        (p) => p.userId === userId
      );
      if (!player) return;

      const submission = {
        userId,
        username: player.username,
        code,
        language,
        timestamp: Date.now(),
        status: "pending",
      };

      battle.submissions.push(submission);
      player.lastSubmission = submission;

      io.to(roomId).emit("submission-received", {
        userId,
        username: player.username,
        timestamp: submission.timestamp,
      });

      setTimeout(() => {
        const isCorrect = Math.random() > 0.3;
        submission.status = isCorrect
          ? "accepted"
          : "wrong";

        io.to(roomId).emit("submission-result", {
          userId,
          username: player.username,
          status: submission.status,
          timestamp: submission.timestamp,
        });

        if (isCorrect && !battle.winner) {
          battle.winner = {
            userId,
            username: player.username,
            timestamp: submission.timestamp,
            timeTaken:
              submission.timestamp -
              battle.startTime,
          };

          io.to(roomId).emit("battle-end", {
            winner: battle.winner,
          });

          console.log(
            `🏆 ${player.username} won battle ${roomId}`
          );
        }
      }, 2000);
    }
  );

  socket.on("disconnect", () => {
    const data = userSockets.get(socket.id);
    if (!data) return;

    const { roomId, userId, username } = data;
    const battle = activeBattles.get(roomId);

    if (battle) {
      battle.players = battle.players.filter(
        (p) => p.userId !== userId
      );

      socket.to(roomId).emit("player-left", {
        userId,
        username,
        count: battle.players.length,
      });

      if (battle.players.length === 0) {
        activeBattles.delete(roomId);
      }
    }

    userSockets.delete(socket.id);
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// ==========================================
// REMINDER CRON
// ==========================================
// if (config.features.contests) {
//   const reminderService = require("./services/reminderService");

//   cron.schedule(
//     config.reminders.cronSchedule,
//     async () => {
//       try {
//         await reminderService.checkAndSendReminders();
//       } catch (err) {
//         console.error(
//           "❌ Reminder cron error:",
//           err.message
//         );
//       }
//     }
//   );

//   console.log(
//     "⏰ Reminder cron running:",
//     config.reminders.cronSchedule
//   );
// }
// ==========================================
// REMINDER CRON
// ==========================================
if (config.features.contests) {
  const reminderService = require("./services/reminderService");

  cron.schedule(
    config.reminders.cronSchedule,
    async () => {
      try {
        await reminderService.checkAndSendReminders();
      } catch (err) {
        console.error(
          "❌ Reminder cron error:",
          err.message
        );
      }
    }
  );

  console.log(
    "⏰ Reminder cron running:",
    config.reminders.cronSchedule
  );
}

// ==========================================
// CONTEST STATUS & CLEANUP CRON
// ==========================================
if (config.features.contests) {
  const contestService = require("./services/contestService");

  // Update contest statuses every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🔄 Updating contest statuses...');
      await contestService.updateContestStatuses();
      await contestService.cleanupOldContests();
    } catch (err) {
      console.error('❌ Status update error:', err.message);
    }
  });

  // Fetch new contests every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      console.log('📥 Auto-fetching new contests...');
      await contestService.fetchAndStoreContests();
    } catch (err) {
      console.error('❌ Auto-fetch error:', err.message);
    }
  });

  console.log('⏰ Contest status updater: Every 5 minutes');
  console.log('⏰ Contest auto-fetch: Every 6 hours');
}
// ==========================================
// ERROR HANDLING
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Global error:", err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Something went wrong",
    ...(config.nodeEnv === "development" && {
      stack: err.stack,
    }),
  });
});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down...");
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("✅ MongoDB closed");
      process.exit(0);
    });
  });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = config.port || 4000;

server.listen(PORT, () => {
  console.log("\n🚀 ===============================");
  console.log("   AlgoBell Backend Server");
  console.log("   ===============================");
  console.log(`   🌐 Server: http://localhost:${PORT}`);
  console.log(`   📡 Frontend: ${config.frontendUrl}`);
  console.log(`   🔧 Env: ${config.nodeEnv}`);
  console.log("   ⚡ Features:");
  console.log(
    `      - Contests: ${
      config.features.contests ? "✅" : "❌"
    }`
  );
  console.log(
    `      - Battles: ${
      config.features.battles ? "✅" : "❌"
    }`
  );
  console.log(
    `      - WhatsApp: ${
      config.features.whatsapp ? "✅" : "❌"
    }`
  );
  console.log(
    `      - Pro: ${
      config.features.proFeatures ? "✅" : "❌"
    }`
  );
  console.log("================================\n");
});

module.exports = { app, server, io };
