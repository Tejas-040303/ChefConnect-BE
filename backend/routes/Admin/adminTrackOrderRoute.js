const express = require("express");
const { getAllOrders, updateOrderStatus } = require("../../controllers/Admin/adminTrackOrderController");

const router = express.Router();

router.get("/", getAllOrders);

router.patch("/update-status/:orderId", updateOrderStatus);

module.exports = router;