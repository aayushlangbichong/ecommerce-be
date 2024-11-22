import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/product.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/order.js";
import categoryRoutes from "./routes/category.js";
import imageRoutes from "./routes/image.js";
import albumRoutes from "./routes/album.js";
import profileRoutes from "./routes/profile.js";
import cookieParser from "cookie-parser";

import env from "./constants/env.js";

const app = express();
const PORT = env.PORT;

app.use(cookieParser());
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/profile", profileRoutes);

// Connect to MongoDB
mongoose
  .connect(env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
