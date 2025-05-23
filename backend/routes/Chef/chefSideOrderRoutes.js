const express = require("express");
const router = express.Router();
const chefSideOrderController = require("../../controllers/Chef/chefSideOrderController");
const { protect } = require("../../middleware/validate");

router.get("/", protect, chefSideOrderController.getChefOrders);
router.get("/history", protect, chefSideOrderController.getChefOrderHistory);
router.put("/payment-received/:orderId", protect, chefSideOrderController.markPaymentReceived);
router.put("/complete/:orderId", protect, chefSideOrderController.markOrderCompleted);

module.exports = router;