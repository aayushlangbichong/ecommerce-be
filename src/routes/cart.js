import express from "express";
import { auth, isAdmin } from "../middleware/auth.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  clearUserAllCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", auth, getCart);
router.post("/add", auth, addToCart);
router.put("/update", auth, updateCartItem);
router.post("/remove-items", auth, removeFromCart);
router.post("/clear", auth, clearCart);
router.delete("/clear-all", auth, isAdmin, clearUserAllCart);

export default router;
