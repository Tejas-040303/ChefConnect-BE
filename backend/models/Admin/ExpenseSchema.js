const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  expenseId: {
    type: String,
    unique: true,
    required: true
  },
  expenseType: {
    type: String,
    enum: ['Chef Payment', 'Platform Fee', 'Delivery Charges', 'Marketing', 'Payment Processing', 'Other'],
    required: true
  },
  chef: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String
  },
  order: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dishName: String,
    dishCost: Number,
    deliveryFee: Number
  },
  commission: {
    chefPayment: Number,
    platformFee: Number
  },
  marketing: {
    adCost: { type: Number, default: 100 }
  },
  paymentProcessing: {
    fee: { type: Number, default: 2.9 } // Typical payment gateway fee
  },
  tax: {
    rate: { type: Number, default: 12 },
    amount: Number
  },
  totalAmount: {
    type: Number,
    required: true
  },
  approvalStatus: {
    type: String,
    enum: ['Approved', 'Pending', 'Rejected'],
    default: 'Approved'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate expenseId before saving
ExpenseSchema.pre('save', function(next) {
  if (!this.expenseId) {
    this.expenseId = 'EXP-' + Date.now().toString().slice(-6);
  }
  next();
});

// Calculate tax amount before saving
ExpenseSchema.pre('save', function(next) {
  if (this.isModified('totalAmount')) {
    this.tax.amount = this.totalAmount * (this.tax.rate / 100);
  }
  next();
});

module.exports = mongoose.model('Expense', ExpenseSchema);