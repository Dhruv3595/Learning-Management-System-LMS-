import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import userRoutes from "./routes/user.routes.js";
import courseRoutes from "./routes/course.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import miscellaneousRoutes from "./routes/miscellaneous.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import orderRoutes from "./routes/order.routes.js";
import testRoutes from "./routes/test.routes.js";
import express from "express";
import connectToDb from "./config/db.config.js";
import errorMiddleware from "./middleware/error.middleware.js";
import path from "path";
import fs from "fs";
import Course from "./models/course.model.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const MongoURl = process.env.MONGO_URI

// Increase payload size limits for file uploads
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));
app.use(cookieParser());
app.use(morgan("dev"));

// Configure request timeout (30 minutes for large video uploads)
app.use((req, res, next) => {
  req.setTimeout(30 * 60 * 1000); // 30 minutes
  res.setTimeout(30 * 60 * 1000); // 30 minutes
  next();
});

// app.use(cors({ origin: [process.env.CLIENT_URL], credentials: true }));
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Client-Role'],
  optionsSuccessStatus: 200
}));

// Serve static files from the uploads directory with proper CORS
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/test", testRoutes);
app.use("/api/v1/", miscellaneousRoutes);

// Test route to check file serving
app.get('/test-files', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({
      message: 'Files in uploads directory',
      uploadsPath: uploadsDir,
      baseUrl: `${req.protocol}://${req.get('host')}`,
      files: files.map(file => ({
        name: file,
        url: `${req.protocol}://${req.get('host')}/uploads/${file}`,
        exists: fs.existsSync(path.join(uploadsDir, file)),
        size: fs.statSync(path.join(uploadsDir, file)).size
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug route to check courses
app.get('/debug-courses', async (req, res) => {
  try {
    const courses = await Course.find({}).limit(5);
    res.json({
      message: 'Course data debug',
      count: courses.length,
      courses: courses.map(course => ({
        _id: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        createdAt: course.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test direct file serving
app.get('/test-image', (req, res) => {
  const testFile = path.join(__dirname, 'uploads', 'adam-berkecz-K6kZKJOmZrk-unsplash.jpg');
  
  if (fs.existsSync(testFile)) {
    res.sendFile(testFile);
  } else {
    res.status(404).json({ error: 'Test file not found' });
  }
});

app.all("*", (req, res) => {
  res.status(404).send("OOPS!! 404 page not found");
});

app.use(errorMiddleware);

// db init
connectToDb(MongoURl);

export default app;
