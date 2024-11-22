import express from "express";
import {
  updateProfilePicture,
  clearProfilePicture,
  editProfile,
} from "../controllers/profileController.js";
import { auth } from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import imageValidator from "../middleware/imageValidator.js";
import validateSchema from "../middleware/schemaValidator.js";
import { generalProfileSchema } from "../validations/user.schema.js";

const router = express.Router();

router.patch("/", auth, validateSchema(generalProfileSchema), editProfile);

router.patch(
  "/display-picture",
  auth,
  upload.single("image"),
  imageValidator({ maxSizeInMB: 3 }),
  updateProfilePicture
);

router.delete("/display-picture", auth, clearProfilePicture);

export default router;
