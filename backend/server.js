const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const colors = require("colors");
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const homeRoutes = require('./routes/homeRoutes');
const commonRoutes = require('./routes/commonRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const adminRoutes = require('./routes/adminRoutes')
const deliveryRoutes = require('./routes/deliveryRoutes');
const AWS = require("aws-sdk");
const multer = require("multer");
const fs = require("fs");
const util = require("util");

const app = express();
dotenv.config();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://door-dash-sigma.vercel.app"],
    methods: ["POST", "PUT", "GET", "DELETE"],
  })
);

mongoose
  .connect(process.env.MONGODB_URI_KEY, {
    dbName: "doordash",
  })
  .then(() => {
    console.log("Database connected".yellow.bold);
  })
  .catch((err) => {
    console.log(err.red);
  });

  const upload = multer({ dest: "uploads/" });

  const s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: "ap-southeast-2",
  });
  
  const uploadToS3 = async (filePath, fileName, mimeType) => {
    const fileContent = await util.promisify(fs.readFile)(filePath);
  
    const params = {
      Bucket: "yash-booking-app",
      Key: `uploads/${Date.now()}-${fileName}`,
      Body: fileContent,
      ContentType: mimeType,
      ACL: "public-read",
    };
  
    const uploadResult = await s3.upload(params).promise();
  
    await util.promisify(fs.unlink)(filePath);
  
    return uploadResult.Location;
  };  

app.use('/api/auth', authRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/user-profile', userProfileRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/common', commonRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/notification', notificationsRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/delivery', deliveryRoutes);

app.post("/upload", upload.array("photos"), async (req, res) => {
  try {
    const uploadedFiles = [];
    const files = req.files;

    for (let i = 0; i < files.length; i++) {
      const { path, originalname, mimetype } = files[i];
      const url = await uploadToS3(path, originalname, mimetype);
      uploadedFiles.push(url);
    }

    res.status(200).json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error("Error uploading files:", error);
    res
      .status(500)
      .json({ success: false, message: "File upload failed.", error });
  }
});

app.listen(5000, () => {
  console.log(`Server is running on PORT 5000`);
});
