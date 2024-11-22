import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT || "3000",
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  IMGUR_CLIENT_ID: process.env.IMGUR_CLIENT_ID,
};

export default env;
