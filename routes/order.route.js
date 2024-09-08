
import express from "express";

import { acceptOrder, cancelOrder, completeOrder, createOrder, getAllOrders, getOrderById } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.get("/get-all-orders", getAllOrders);
router.get("/get-order-by-id/:orderId", getOrderById);
router.post("/accept-order/:orderId", acceptOrder);
router.post("/cancel-order/:orderId", cancelOrder);
router.post("/complete-order/:orderId", completeOrder);

export default router;