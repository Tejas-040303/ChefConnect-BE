const mongoose = require("mongoose");
const Expense = require("../../models/Admin/ExpenseSchema");
const Order = require("../../models/Chef/OrderSchema");
const User = require("../../models/Comman/UserSchema");

// Get all expenses with pagination and filtering
exports.getAllExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, expenseType, startDate, endDate, approvalStatus, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    // Build filter object
    const filter = {};

    if (expenseType) {
      filter.expenseType = expenseType;
    }

    if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      filter.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.date = { $lte: new Date(endDate) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const expenses = await Expense.find(filter).sort(sort).skip(skip).limit(parseInt(limit));

    // Get total count for pagination
    const totalExpenses = await Expense.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalExpenses,
      totalPages: Math.ceil(totalExpenses / limit),
      currentPage: parseInt(page),
      expenses,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching expenses",
      error: error.message,
    });
  }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params._id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching expense",
      error: error.message,
    });
  }
};

// Create new expense
exports.createExpense = async (req, res) => {
  try {
    const { expenseType, chefId, orderId, commission, marketing, paymentProcessing, tax, totalAmount, approvalStatus, notes } = req.body;

    // Create new expense object
    const expenseData = {
      expenseId: `EXP-${Date.now()}`, // Generate a unique expense ID
      expenseType,
      totalAmount,
      approvalStatus: approvalStatus || "Pending",
      notes,
    };

    // Add commissions if provided
    if (commission) {
      expenseData.commission = commission;
    }

    // Add marketing if provided
    if (marketing) {
      expenseData.marketing = marketing;
    }

    // Add payment processing if provided
    if (paymentProcessing) {
      expenseData.paymentProcessing = paymentProcessing;
    }

    // Add tax if provided
    if (tax) {
      expenseData.tax = tax;
    } else {
      expenseData.tax = {
        rate: 12, // Default tax rate
        amount: totalAmount * 0.12,
      };
    }

    // If expense is related to chef payment
    if (expenseType === "Chef Payment" && chefId) {
      const chef = await User.findById(chefId);
      if (!chef) {
        return res.status(404).json({
          success: false,
          message: "Chef not found",
        });
      }

      expenseData.chef = {
        id: chef._id,
        name: chef.name,
      };
    }

    // If expense is related to an order
    if (orderId) {
      const order = await Order.findById(orderId).populate("customer", "name").populate("chef", "name");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      expenseData.order = {
        id: order._id,
        customerId: order.customer._id,
        dishName: order.dishes.length > 0 ? "Multiple dishes" : "No dishes",
        dishCost: order.total,
        deliveryFee: 0, // You might want to calculate this based on your business logic
      };
    }

    // Create and save new expense
    const newExpense = new Expense(expenseData);
    await newExpense.save();

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      expense: newExpense,
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({
      success: false,
      message: "Error creating expense",
      error: error.message,
    });
  }
};
// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find and update the expense
    const expense = await Expense.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({
      success: false,
      message: "Error updating expense",
      error: error.message,
    });
  }
};

// Update approval status
exports.updateApprovalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    if (!["Approved", "Pending", "Rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid approval status",
      });
    }

    const expense = await Expense.findByIdAndUpdate(id, { approvalStatus }, { new: true });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Expense ${approvalStatus.toLowerCase()} successfully`,
      expense,
    });
  } catch (error) {
    console.error("Error updating approval status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating approval status",
      error: error.message,
    });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting expense",
      error: error.message,
    });
  }
};

// Get expense summary
exports.getExpenseSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Create date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      dateFilter.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      dateFilter.date = { $lte: new Date(endDate) };
    }

    // Total expenses
    const totalExpenses = await Expense.aggregate([{ $match: dateFilter }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]);

    // Expenses by type
    const expensesByType = await Expense.aggregate([{ $match: dateFilter }, { $group: { _id: "$expenseType", total: { $sum: "$totalAmount" } } }, { $sort: { total: -1 } }]);

    // Monthly expenses
    const monthlyExpenses = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Format monthly expenses
    const formattedMonthlyExpenses = monthlyExpenses.map((item) => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
      total: item.total,
    }));

    res.status(200).json({
      success: true,
      summary: {
        totalExpenseAmount: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
        expensesByType,
        monthlyExpenses: formattedMonthlyExpenses,
      },
    });
  } catch (error) {
    console.error("Error generating expense summary:", error);
    res.status(500).json({
      success: false,
      message: "Error generating expense summary",
      error: error.message,
    });
  }
};

// Get chef payment expenses
exports.getChefPaymentExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, chefId } = req.query;

    const filter = { expenseType: "Chef Payment" };

    if (chefId) {
      filter["chef.id"] = mongoose.Types.ObjectId(chefId);
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      filter.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.date = { $lte: new Date(endDate) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const expenses = await Expense.find(filter).sort({ date: -1 }).skip(skip).limit(parseInt(limit));

    const totalExpenses = await Expense.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalExpenses,
      totalPages: Math.ceil(totalExpenses / limit),
      currentPage: parseInt(page),
      expenses,
    });
  } catch (error) {
    console.error("Error fetching chef payment expenses:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chef payment expenses",
      error: error.message,
    });
  }
};

exports.getOrdersSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate && endDate) {
      dateFilter.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      dateFilter.orderDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      dateFilter.orderDate = { $lte: new Date(endDate) };
    }

    // Get total orders amount
    const ordersTotal = await Order.aggregate([{ $match: { status: "Completed", ...dateFilter } }, { $group: { _id: null, total: { $sum: "$total" } } }]);

    const totalAmount = ordersTotal.length > 0 ? ordersTotal[0].total : 0;

    // Calculate shares based on 80/20 split
    const chefAmount = totalAmount * 0.8;
    const adminAmount = totalAmount * 0.2;

    // Calculate tax (assuming 12% tax rate)
    const taxRate = 0.12;
    let taxAmount = 0;
    if (totalAmount >= 1200000) {
      taxAmount = totalAmount * taxRate;
    } else {
      taxAmount = 0;
    }
    // Get orders by chef
    const ordersByChef = await Order.aggregate([
      { $match: { status: "Completed", ...dateFilter } },
      { $group: { _id: "$chef", total: { $sum: "$total" } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "chefInfo",
        },
      },
      {
        $project: {
          chefId: "$_id",
          chefName: { $arrayElemAt: ["$chefInfo.name", 0] },
          totalAmount: "$total",
          chefShare: { $multiply: ["$total", 0.8] },
        },
      },
    ]);

    // Get monthly order data
    const monthlyOrders = await Order.aggregate([
      { $match: { status: "Completed", ...dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" },
          },
          total: { $sum: "$total" },
        },
      },
      {
        $addFields: {
          chefShare: { $multiply: ["$total", 0.8] },
          adminShare: { $multiply: ["$total", 0.2] },
          taxAmount: {
            $cond: [{ $gte: ["$total", 1200000] }, { $multiply: ["$total", 0.12] }, 0],
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const formattedMonthlyOrders = monthlyOrders.map((item) => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
      total: item.total,
      chefShare: item.chefShare,
      adminShare: item.adminShare,
      taxAmount: item.taxAmount,
    }));

    res.status(200).json({
      success: true,
      summary: {
        totalOrderAmount: totalAmount,
        chefShare: chefAmount,
        adminShare: adminAmount,
        taxAmount: taxAmount,
        ordersByChef,
        monthlyOrders: formattedMonthlyOrders,
      },
    });
  } catch (error) {
    console.error("Error generating orders summary:", error);
    res.status(500).json({
      success: false,
      message: "Error generating orders summary",
      error: error.message,
    });
  }
};
