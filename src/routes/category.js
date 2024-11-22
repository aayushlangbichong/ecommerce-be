import express from "express";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getAllCategories,
} from "../controllers/categoryController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/get-all", getAllCategories);
router.get("/", getCategories);
router.post("/", auth, isAdmin, createCategory);
router.put("/:id", auth, isAdmin, updateCategory);
router.delete("/:id", auth, isAdmin, deleteCategory);

export default router;
