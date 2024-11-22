import express from "express";
import {
  uploadImage,
  getImagesByAlbum,
  searchImagesByTag,
  deleteImage,
  getImages,
} from "../controllers/imageController.js";
import multer from "multer";

import { auth, isAdmin } from "../middleware/auth.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/", getImages);
router.post("/", auth, isAdmin, upload.single("image"), uploadImage);
router.get("/album/:albumId", getImagesByAlbum);
router.get("/search", searchImagesByTag);
router.delete("/:id", auth, isAdmin, deleteImage);

export default router;
