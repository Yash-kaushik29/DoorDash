const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const shopRoutes = require("./routes/shopRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");
const homeRoutes = require("./routes/homeRoutes");
const commonRoutes = require("./routes/commonRoutes");
const cartRoutes = require("./routes/cartRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const multer = require("multer");
const axios = require("axios");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary.js");

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

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gullyfoods_uploads", // optional folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

app.post("/upload", upload.array("photos"), async (req, res) => {
  try {
    const uploadedFiles = req.files.map((file) => file.path);

    res.status(200).json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({
      success: false,
      message: "File upload failed.",
      error,
    });
  }
});


app.use("/api/auth", authRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/user-profile", userProfileRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/common", commonRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/notification", notificationsRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/delivery", deliveryRoutes);

app.get("/api/location/reverse-geocode", async (req, res) => {
  const { lat, lon } = req.query;

  try {
    const { data } = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          "User-Agent": "YourAppName/1.0 (your@email.com)",
        },
      }
    );

    res.json({ success: true, address: data.display_name });
  } catch (err) {
    console.error("Nominatim error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Reverse geocoding failed" });
  }
});

app.listen(5000, () => {
  console.log(`Server is running on PORT 5000`);
});
