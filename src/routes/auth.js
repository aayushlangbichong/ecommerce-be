import express from "express";
import {
  signup,
  login,
  getProfile,
  changePassword,
} from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";
import validateSchema from "../middleware/schemaValidator.js";
import { userSignupSchema } from "../validations/user.schema.js";

const router = express.Router();

router.post("/signup", validateSchema(userSignupSchema), signup);
router.post("/login", login);
router.get("/me", auth, getProfile);
router.patch("/change-password", auth, changePassword);

export default router;
