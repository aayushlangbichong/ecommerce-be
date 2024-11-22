import express from "express";
import { auth, isAdmin } from "../middleware/auth.js";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getProductBySlug,
  getProductsByTags,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/by-tags", getProductsByTags);
router.get("/:id", getProductById);
router.get("/slug/:slug", getProductBySlug);

router.post("/", auth, isAdmin, createProduct);
router.put("/:id", auth, isAdmin, updateProduct);
router.delete("/:id", auth, isAdmin, deleteProduct);

export default router;
