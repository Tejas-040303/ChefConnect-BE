// utils/emailTemplates.js

/**
 * Generates HTML email template for different order status updates
 * @param {Object} options - Email template options
 * @param {string} options.customerName - Name of the customer
 * @param {string} options.chefName - Name of the chef
 * @param {Array} options.orderDetails - Array of dish details
 * @param {string} options.status - Order status (Pending, Confirmed, Rejected, Completed, Expired)
 * @param {string} options.orderId - Order ID
 * @returns {string} - HTML email content
 */
const generateOrderStatusEmail = ({ customerName, chefName, orderDetails, status, orderId }) => {
  // Base styling for email
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #FF9800; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0; }
      .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
      .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
      .dish-item { margin-bottom: 5px; }
      .total { font-weight: bold; margin-top: 10px; }
      .button { display: inline-block; padding: 10px 20px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 5px; }
    </style>
  `;

  // Format the list of dishes
  const dishList = orderDetails.map(dish => 
    `<div class="dish-item">${dish.dish.name} x${dish.quantity || 1} - ₹${dish.dish.price}</div>`
  ).join('');
  
  // Calculate total if not provided
  const total = orderDetails.reduce((sum, item) => sum + (item.dish.price * (item.quantity || 1)), 0);

  // Status-specific content
  let statusTitle, statusMessage, statusColor;
  
  switch(status) {
    case 'Pending':
      statusTitle = 'Your order has been placed';
      statusMessage = `Your order is waiting for confirmation from chef ${chefName}.`;
      statusColor = '#FF9800'; // Orange
      break;
    case 'Confirmed':
      statusTitle = 'Your order has been accepted';
      statusMessage = `Chef ${chefName} has accepted your order and is preparing your dishes.`;
      statusColor = '#4CAF50'; // Green
      break;
    case 'Rejected':
      statusTitle = 'Your order has been rejected';
      statusMessage = `We're sorry, but Chef ${chefName} is unable to fulfill your order at this time.`;
      statusColor = '#F44336'; // Red
      break;
    case 'Completed':
      statusTitle = 'Your order has been completed';
      statusMessage = `Chef ${chefName} has marked your order as completed. We hope you enjoyed your meal!`;
      statusColor = '#2196F3'; // Blue
      break;
    case 'Expired':
      statusTitle = 'Your order has expired';
      statusMessage = `We're sorry, but your order timed out as Chef ${chefName} didn't respond in time.`;
      statusColor = '#9E9E9E'; // Gray
      break;
    case 'Payment Completed':
      statusTitle = 'Payment Confirmed';
      statusMessage = `We've received your payment for the order from Chef ${chefName}. Thank you for your business!`;
      statusColor = '#4CAF50'; // Green
      break;
    default:
      statusTitle = 'Order Status Update';
      statusMessage = `There has been an update to your order with Chef ${chefName}.`;
      statusColor = '#FF9800'; // Default orange
  }

  // Format the order ID to be shorter for display
  const shortOrderId = orderId.toString().substring(0, 6);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${statusTitle}</title>
      ${baseStyle}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: ${statusColor};">
          <h2>${statusTitle}</h2>
        </div>
        <div class="content">
          <h3>Hello ${customerName},</h3>
          <p>${statusMessage}</p>
          
          <h4>Order #${shortOrderId}</h4>
          <div class="order-details">
            <h4>Your Order:</h4>
            ${dishList}
            <div class="total">Total: ₹${total}</div>
          </div>
          
          <p>Thank you for using ChefConnect!</p>
          
          <p>If you have any questions about your order, please contact us at support@chefconnect.com</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ChefConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  generateOrderStatusEmail
};