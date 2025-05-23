const express = require("express");
const router = express.Router();

const {createOrder, customerBooking, orderHistory, getOrderDetails, expireOrder, paymentStatus} = require("../../controllers/Customer/orderedChefController");
const { protect } = require("../../middleware/validate");


router.post("/", protect, createOrder);

router.get("/bookings", protect, customerBooking);

router.get("/history", protect, orderHistory);

router.get("/:id", protect, getOrderDetails);

router.put("/:id/expire", protect, expireOrder);

router.put("/:id/payment", protect, paymentStatus);

router.post("/create_order", protect, createOrder);

module.exports = router;