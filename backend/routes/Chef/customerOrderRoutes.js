const express = require("express");
const router = express.Router();

const { getChefOrders, orderHistory, acceptOrder, rejectOrder, completeOrder, getOrderDetails } = require("../../controllers/Chef/customerOrderController");
const { protect } = require("../../middleware/validate");

router.get("/", protect, getChefOrders);
router.get("/history", protect, orderHistory);

router.get("/:id", protect, getOrderDetails);

router.put("/accept/:id", protect, acceptOrder);
router.put("/reject/:id", protect, rejectOrder);
router.put("/complete/:id", protect, completeOrder);


module.exports = router;