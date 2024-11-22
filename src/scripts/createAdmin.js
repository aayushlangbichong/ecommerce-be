import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";
import env from "../constants/env.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);

    const adminUser = new User({
      email: "admin@admin.com",
      password: "admin123",
      firstName: "john",
      lastName: "Cena",
      role: "admin",
    });

    await adminUser.save();
    console.log("Admin user created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
