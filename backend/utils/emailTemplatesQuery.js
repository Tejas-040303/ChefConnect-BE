const generateQueryStatusEmail = ({ name, email, subject, query, status, adminResponse }) => {
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #4A5568; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0; }
      .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
      .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
      .status { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; }
      .query-box { margin-top: 15px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; border-left: 4px solid #4A5568; }
      .response-box { margin-top: 15px; padding: 15px; background-color: #EDF2F7; border-radius: 5px; border-left: 4px solid #4299E1; }
    </style>
  `;

  let statusColor;
  
  switch (status) {
    case 'Pending':
      statusColor = '#ECC94B'; // Yellow
      break;
    case 'In Progress':
      statusColor = '#4299E1'; // Blue
      break;
    case 'Resolved':
      statusColor = '#48BB78'; // Green
      break;
    default:
      statusColor = '#4A5568'; // Gray
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Response to your query: ${subject}</title>
      ${baseStyle}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: ${statusColor};">
          <h2>Response to your query</h2>
        </div>
        <div class="content">
          <h3>Hello ${name},</h3>
          
          <p>Thank you for contacting ChefConnect Support. We've reviewed your query regarding "${subject}".</p>
          
          <p>Your query status: <span class="status" style="background-color: ${statusColor};">${status}</span></p>
          
          <div class="query-box">
            <p><strong>Your original query:</strong></p>
            <p>${query}</p>
          </div>
          
          <div class="response-box">
            <p><strong>Our response:</strong></p>
            <p>${adminResponse}</p>
          </div>
          
          <p>If you have any additional questions or need further assistance, please don't hesitate to contact us.</p>
          <p>Thank you for using ChefConnect!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ChefConnect. All rights reserved.</p>
          <p>If you have any questions, please contact us at support@chefconnect.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { generateQueryStatusEmail };