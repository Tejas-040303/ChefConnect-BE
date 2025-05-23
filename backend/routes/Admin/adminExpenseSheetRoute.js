const express = require("express");
const router = express.Router();
const expenseSheetController = require("../../controllers/Admin/adminExpenseSheetController");
const authenticateAdmin = require("../../middleware/authAdminMiddleware");

// Get orders summary
router.get("/orders-summary", expenseSheetController.getOrdersSummary);

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

// Get all expenses with optional filtering
router.get("/", expenseSheetController.getAllExpenses);

// Get expense statistics/summary
router.get("/summary", expenseSheetController.getExpenseSummary);

// Get expense by ID
router.get("/:id", expenseSheetController.getExpenseById);

// Create new expense
router.post("/", expenseSheetController.createExpense);

// Update expense
router.put("/:id", expenseSheetController.updateExpense);

// Change approval status
router.patch("/:id/status", expenseSheetController.updateApprovalStatus);

// Delete expense
router.delete("/:id", expenseSheetController.deleteExpense);

// Get chef payment expenses
router.get("/type/chef-payments", expenseSheetController.getChefPaymentExpenses);

module.exports = router;