const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const { spawn } = require("child_process");
const authRoutes = require("./auth");
const groupRoutes = require("./groupRoutes");
const studentRoutes = require("./studentRoutes");
const assignmentRoutes = require("./assignmentRoutes");
const { isAuthenticated } = require("./middlewares");

const app = express();
const port = process.env.PORT || 5000;

// MongoDB URI
const MONGO_URI =
  "mongodb+srv://deivaraja1905:G5JWYaV0Z0VRtPbz@cluster0.jipqz.mongodb.net/vir?retryWrites=true&w=majority";
const SESSION_SECRET = "yourSecret";

// Start Streamlit in the background without opening in the browser
function startStreamlit(scriptPath, port) {
  const streamlit = spawn("streamlit", [
    "run",
    scriptPath, // Path to your Streamlit script (app1.py or add_faces.py)
    "--server.port",
    port.toString(), // Port for the Streamlit app
    "--server.address",
    "0.0.0.0", // Allow external connections
    "--browser.serverAddress",
    "localhost",
    "--server.enableCORS",
    "true",
    "--browser.gatherUsageStats",
    "false", // Prevent Streamlit from opening automatically in the browser
    "--server.headless=true", // Headless mode: Prevent Streamlit from launching the browser window
  ]);

  streamlit.stdout.on("data", (data) => {
    console.log(`Streamlit: ${data}`);
  });

  streamlit.stderr.on("data", (data) => {
    console.error(`Streamlit Error: ${data}`);
  });

  streamlit.on("close", (code) => {
    console.log(`Streamlit process exited with code ${code}`);
  });

  process.on("SIGINT", () => {
    streamlit.kill();
    process.exit();
  });
}

// Middleware Configuration
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Serve static files (including chatbot.html)
app.use(express.static(path.join(__dirname)));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Session check route
app.get("/api/checkSession", (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

// Protected Routes
app.get("/studentDashboard.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "studentDashboard.html"));
});
app.get("/teacherDashboard.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "teacherDashboard.html"));
});
app.get("/sprofile.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "sprofile.html"));
});
app.get("/chatbot.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "chatbot.html"));
});
app.get("/sallclassrooms.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "sallclassrooms.html"));
});
app.get("/sgroups.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "sgroups.html"));
});
app.get("/profile.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "profile.html"));
});
app.get("/classrooms.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "classrooms.html"));
});
app.get("/groups.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "groups.html"));
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/students", studentRoutes);
app.use("/api", assignmentRoutes);

// MongoDB connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start Express server
const server = app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
  startStreamlit("app1.py", 8502); // Start app1.py Streamlit app on port 8502
  startStreamlit("add_faces.py", 8501); // Start add_faces.py Streamlit app on port 8503
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
