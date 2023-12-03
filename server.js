const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors({
  origin: 'https://hair-dresser-site.vercel.app',
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://hair-dresser-site.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.get('/favicon.ico', (req, res) => res.status(204).end());
// Serve uploaded files statically
app.use("/uploads", express.static("public/uploads"));

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the folder where files will be saved
    cb(null, "public/uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Create a multer instance and specify the storage configuration
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const acceptedTypes = ["video/mp4"];
    if (acceptedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});
// POST route for file upload
app.post("/upload", upload.single("file"), (req, res) => {
  const uploadedFile = req.file;
  console.log(uploadedFile);
  if (!uploadedFile) {
    return res.status(400).send("No file uploaded.");
  }
  res.status(200).send("File uploaded!");
});

app.get("/videos", (req, res) => {
  const folderPath = "./public/uploads";

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading folder:", err);
      return res.status(500).json({ error: "Failed to read folder" });
    }

    const videoFiles = files.filter((file) => {
      console.log(file);
      const extname = path.extname(file).toLowerCase();
      // Add more video file extensions if needed
      return [".mp4", ".mkv", ".avi"].includes(extname); 
    });

    res.json({ videos: videoFiles });
  });
});
app.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public/uploads', filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(500).send('Error deleting file');
    }

    console.log('File deleted:', filename);
    res.status(200).send('File deleted');
  });
});

app.get('/video/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public/uploads', filename);
  const videoPath = filePath;
  const videoBuffer = fs.readFileSync(videoPath);
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Length', videoBuffer.length);
  res.send(videoBuffer);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is listening on port 3000");
});
