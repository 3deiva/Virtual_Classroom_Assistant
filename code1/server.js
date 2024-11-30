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

const MONGO_URI =
  "mongodb+srv://deivaraja1905:G5JWYaV0Z0VRtPbz@cluster0.jipqz.mongodb.net/vir?retryWrites=true&w=majority";
const SESSION_SECRET = "yourSecret";

console.log("MONGO_URI:", MONGO_URI);

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

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(express.static(path.join(__dirname)));

app.get("/api/checkSession", (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

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

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/students", studentRoutes);
app.use("/api", assignmentRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
