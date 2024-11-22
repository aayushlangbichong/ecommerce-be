import express from "express";
import { auth, isAdmin } from "../middleware/auth.js";
import {
  deleteOrder,
  createOrder,
  getOrders,
  updateOrderStatus,
  cancelOrder,
  clearOrders,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", auth, createOrder);
router.get("/", auth, getOrders);
router.delete("/clear-all", auth, isAdmin, clearOrders);
router.delete("/:orderId", auth, deleteOrder);
router.patch("/:orderId", auth, isAdmin, updateOrderStatus);
router.patch("/:orderId/cancel", auth, cancelOrder);

export default router;
