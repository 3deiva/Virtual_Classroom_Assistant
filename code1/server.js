const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const MongoStore = require('connect-mongo');  // Add this for MongoDB session store
const { spawn } = require("child_process");
const authRoutes = require("./auth");
const groupRoutes = require("./groupRoutes");
const studentRoutes = require("./studentRoutes");
const assignmentRoutes = require("./assignmentRoutes");
const { isAuthenticated } = require("./middlewares");

const app = express();
const port = process.env.PORT || 5000;

// MongoDB URI
const MONGO_URI = "mongodb+srv://deivaraja1905:G5JWYaV0Z0VRtPbz@cluster0.jipqz.mongodb.net/vir?retryWrites=true&w=majority";
const SESSION_SECRET = process.env.SESSION_SECRET || "yourSecret";

// Modified Streamlit start function with error handling
function startStreamlit(scriptPath, port) {
    try {
        // Check if Python and Streamlit are available
        const pythonCheck = spawn('python3', ['-c', 'import streamlit']);
        
        pythonCheck.on('error', (err) => {
            console.error('Python/Streamlit check failed:', err);
            return;
        });

        const streamlit = spawn("streamlit", [
            "run",
            scriptPath,
            "--server.port", port.toString(),
            "--server.address", "0.0.0.0",
            "--server.baseUrlPath", scriptPath === "app1.py" ? "/app1" : "/add_faces",
            "--server.enableCORS", "true",
            "--browser.gatherUsageStats", "false",
            "--server.headless=true"
        ]);

        streamlit.stdout.on("data", (data) => {
            console.log(`Streamlit (${scriptPath}):`, data.toString());
        });

        streamlit.stderr.on("data", (data) => {
            console.error(`Streamlit Error (${scriptPath}):`, data.toString());
        });

        streamlit.on("error", (error) => {
            console.error(`Failed to start Streamlit (${scriptPath}):`, error);
        });

        return streamlit;
    } catch (error) {
        console.error(`Error starting Streamlit (${scriptPath}):`, error);
        return null;
    }
}

// Middleware Configuration
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Setup MongoDB session store
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGO_URI,
        ttl: 24 * 60 * 60 // Session TTL (1 day)
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// CORS configuration if needed
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Static files serving with caching
app.use(express.static(path.join(__dirname), {
    maxAge: '1d',
    etag: true
}));

// Routes setup
app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "OK",
        mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
});

// Protected routes with proper error handling
const sendProtectedFile = (filePath) => (req, res) => {
    try {
        res.sendFile(path.join(__dirname, filePath));
    } catch (error) {
        console.error(`Error serving ${filePath}:`, error);
        res.status(500).send('Error loading page');
    }
};

const protectedRoutes = [
    'studentDashboard.html', 'teacherDashboard.html', 'sprofile.html',
    'chatbot.html', 'sallclassrooms.html', 'sgroups.html', 'profile.html',
    'classrooms.html', 'groups.html'
];

protectedRoutes.forEach(route => {
    app.get(`/${route}`, isAuthenticated, sendProtectedFile(route));
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/students", studentRoutes);
app.use("/api", assignmentRoutes);

// MongoDB connection with retry logic
async function connectMongoDB(retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            await mongoose.connect(MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
            });
            console.log("Connected to MongoDB Atlas");
            return true;
        } catch (error) {
            console.error(`MongoDB connection attempt ${i + 1} failed:`, error);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 
            'Internal Server Error' : 
            err.message
    });
});

// Start server with proper initialization
async function startServer() {
    try {
        await connectMongoDB();
        
        const server = app.listen(port, () => {
            console.log(`Express server running on port ${port}`);
            
            // Start Streamlit apps
            const streamlit1 = startStreamlit("app1.py", 8502);
            const streamlit2 = startStreamlit("add_faces.py", 8501);
            
            // Cleanup function
            const cleanup = () => {
                console.log("Cleaning up...");
                if (streamlit1) streamlit1.kill();
                if (streamlit2) streamlit2.kill();
                server.close(() => {
                    mongoose.connection.close();
                    process.exit(0);
                });
            };

            // Graceful shutdown handlers
            process.on('SIGTERM', cleanup);
            process.on('SIGINT', cleanup);
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
