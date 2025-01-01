// Load environment variables from .env file (for local development)
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const authRoutes = require("./auth");
const groupRoutes = require("./groupRoutes");
const studentRoutes = require("./studentRoutes");
const assignmentRoutes = require("./assignmentRoutes");
const { isAuthenticated } = require("./middlewares");

const app = express();
const port = process.env.PORT || 5000;

// Retrieve sensitive data from environment variables
const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

console.log("MONGO_URI:", MONGO_URI);  // Optionally log this for debugging, remove in production

// Connect to MongoDB using the environment variable
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    console.log("Host:", mongoose.connection.host);
    console.log("Database:", mongoose.connection.name);
  })
  .catch((error) => console.error("Error connecting to MongoDB:", error));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configure session with environment variable for session secret
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// API to check user session
app.get("/api/checkSession", (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

// Routes for serving HTML pages
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

// API routes for handling authentication, groups, students, and assignments
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/students", studentRoutes);
app.use("/api", assignmentRoutes);

// Error handler for catching server-side errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
